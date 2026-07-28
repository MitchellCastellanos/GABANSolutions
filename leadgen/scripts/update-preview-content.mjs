#!/usr/bin/env node
// ============================================================
// leadgen/scripts/update-preview-content.mjs
//
// Merges a content patch (headline/subheadline/about/services/etc,
// photos, logo, brand colors) into an existing Preview Config JSON —
// meant to be called from api/cron/update-preview-content.js, which
// leadgen-admin.html hits after you paste in a ChatGPT-drafted
// response and/or fill in Logo URL/Primary Color/Secondary Color/
// photo links. Also writes the flat "Logo URL"/"Primary Color"/
// "Secondary Color" Airtable columns (when provided) so they're
// visible directly in Airtable's UI, not just buried in the JSON.
//
// For a multi-page config, `patch.pages` targets each page's content
// independently: { pages: { home: {...}, services: {...}, contact:
// {...} } }. photos/logoUrl/primaryColor/secondaryColor stay top-level
// (business/branding are shared across every page). A legacy flat
// patch (no `patch.pages`, just headline/services/etc directly on the
// patch) is still accepted and treated as a patch to the "home" page
// — for a legacy single-page config that's the only page there is.
//
// Only touches fields actually present in the patch (omitting a field,
// or passing an empty array/string, leaves whatever's already in the
// config alone), so this is safe to call repeatedly with partial
// updates.
//
// Required env vars: AIRTABLE_API_KEY, AIRTABLE_BASE_ID.
// ============================================================

import { findByField, updateRecord } from "../lib/airtable.mjs";
import { F } from "../lib/fields.mjs";

const STRING_CONTENT_FIELDS = ["eyebrow", "headline", "subheadline", "about", "intro"];
const ARRAY_CONTENT_FIELDS = ["services", "valueProps", "reviews"];

/** Old-style flat patch (no `.pages`) is treated as a patch to the "home" page. */
function normalizePagePatches(patch) {
  if (patch.pages && typeof patch.pages === "object") return patch.pages;
  const { photos, logoUrl, primaryColor, secondaryColor, ...contentFields } = patch;
  return Object.keys(contentFields).length ? { home: contentFields } : {};
}

/** The content object a given page's patch should merge into — config.pages[pageKey].content for a multi-page config, config.content for a legacy single-page one (there's only ever one page there, so any pageKey targets it). */
function contentTargetFor(config, pageKey) {
  if (config.pages) {
    if (!config.pages[pageKey]) config.pages[pageKey] = {};
    if (!config.pages[pageKey].content) config.pages[pageKey].content = {};
    return config.pages[pageKey].content;
  }
  if (!config.content) config.content = {};
  return config.content;
}

function mergePageContent(target, pagePatch, pageKey, updatedFields) {
  for (const field of STRING_CONTENT_FIELDS) {
    if (pagePatch[field]) {
      target[field] = pagePatch[field];
      updatedFields.push(`${pageKey}.${field}`);
    }
  }
  for (const field of ARRAY_CONTENT_FIELDS) {
    if (Array.isArray(pagePatch[field]) && pagePatch[field].length) {
      target[field] = pagePatch[field];
      updatedFields.push(`${pageKey}.${field}`);
    }
  }
}

/**
 * @param {string} slug
 * @param {object} patch
 * @param {object} [patch.pages] - e.g. { home: {headline, subheadline, about, valueProps, reviews}, services: {headline, intro, services}, contact: {headline, intro} }
 * @param {{url: string, caption?: string}[]} [patch.photos]
 * @param {string} [patch.logoUrl]
 * @param {string} [patch.primaryColor]
 * @param {string} [patch.secondaryColor]
 */
export async function updatePreviewContent(slug, patch = {}) {
  if (!slug) throw new Error("slug is required");

  const record = await findByField(F.SLUG, slug);
  if (!record) {
    throw new Error(`No prospect found with Slug "${slug}"`);
  }

  const raw = record.fields[F.PREVIEW_CONFIG_JSON];
  if (!raw) {
    throw new Error(`No Preview Config JSON on "${record.fields[F.NAME]}" — generate a preview first.`);
  }

  let config;
  try {
    config = JSON.parse(raw);
  } catch (err) {
    throw new Error(`Preview Config JSON is not valid JSON, fix it by hand first: ${err.message}`);
  }

  const updatedFields = [];

  const pagePatches = normalizePagePatches(patch);
  for (const [pageKey, pagePatch] of Object.entries(pagePatches)) {
    if (!pagePatch || typeof pagePatch !== "object") continue;
    const target = contentTargetFor(config, pageKey);
    mergePageContent(target, pagePatch, pageKey, updatedFields);
  }

  if (Array.isArray(patch.photos) && patch.photos.length) {
    config.business.photos = patch.photos;
    updatedFields.push("photos");
  }
  if (patch.logoUrl) { config.business.logo = patch.logoUrl; updatedFields.push("logo"); }
  if (patch.primaryColor) { config.branding.primaryColor = patch.primaryColor; updatedFields.push("primaryColor"); }
  if (patch.secondaryColor) { config.branding.secondaryColor = patch.secondaryColor; updatedFields.push("secondaryColor"); }

  config.meta = { ...config.meta, updatedAt: new Date().toISOString() };

  const airtableFields = {
    [F.PREVIEW_CONFIG_JSON]: JSON.stringify(config, null, 2)
  };
  // Mirror logo/colors onto the flat Airtable columns too, so they're
  // visible/editable directly from the Airtable UI, not just the JSON.
  if (patch.logoUrl) airtableFields[F.LOGO_URL] = patch.logoUrl;
  if (patch.primaryColor) airtableFields[F.PRIMARY_COLOR] = patch.primaryColor;
  if (patch.secondaryColor) airtableFields[F.SECONDARY_COLOR] = patch.secondaryColor;

  await updateRecord(record.id, airtableFields);

  return {
    slug,
    businessName: record.fields[F.NAME],
    updatedFields,
    previewUrl: `https://gabansolutions.ca/preview/${slug}`
  };
}
