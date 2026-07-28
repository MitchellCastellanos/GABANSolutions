#!/usr/bin/env node
// ============================================================
// leadgen/scripts/update-preview-content.mjs
//
// Merges a content patch (headline/subheadline/about/services,
// photos, logo, brand colors) into an existing Preview Config JSON —
// meant to be called from api/cron/update-preview-content.js, which
// leadgen-admin.html hits after you paste in a ChatGPT-drafted
// response and/or fill in Logo URL/Primary Color/Secondary Color/
// photo links. Also writes the flat "Logo URL"/"Primary Color"/
// "Secondary Color" Airtable columns (when provided) so they're
// visible directly in Airtable's UI, not just buried in the JSON.
//
// Only touches fields actually present in the patch — omitting a
// field (or passing an empty array/string) leaves whatever's already
// in the config alone, so this is safe to call repeatedly with
// partial updates.
//
// Required env vars: AIRTABLE_API_KEY, AIRTABLE_BASE_ID.
// ============================================================

import { findByField, updateRecord } from "../lib/airtable.mjs";
import { F } from "../lib/fields.mjs";

/**
 * @param {string} slug
 * @param {object} patch
 * @param {string} [patch.headline]
 * @param {string} [patch.subheadline]
 * @param {string} [patch.about]
 * @param {string[]} [patch.services]
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

  if (patch.headline) { config.content.headline = patch.headline; updatedFields.push("headline"); }
  if (patch.subheadline) { config.content.subheadline = patch.subheadline; updatedFields.push("subheadline"); }
  if (patch.about) { config.content.about = patch.about; updatedFields.push("about"); }
  if (Array.isArray(patch.services) && patch.services.length) {
    config.content.services = patch.services;
    updatedFields.push("services");
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
