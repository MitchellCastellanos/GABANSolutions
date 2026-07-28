// ============================================================
// Read-only counterpart to update-preview-content.mjs: returns the
// current content of a prospect's Preview Config JSON, per page. Used
// by api/cron/preview-content.js so leadgen-admin.html can re-populate
// its form after the page is closed/reopened — otherwise every reload
// starts from blank inputs even though the data is already saved in
// Airtable.
//
// Multi-page configs return one summary per config.pages key. A
// legacy single-page config (no `pages` key) returns a single "home"
// entry built from its flat content — same page shape either way, so
// callers don't need to special-case it.
// ============================================================

import { findByField } from "./airtable.mjs";
import { F } from "./fields.mjs";

function pageSummary(page) {
  const content = page?.content || {};
  return {
    navLabel: page?.navLabel || "",
    headline: content.headline || "",
    subheadline: content.subheadline || "",
    about: content.about || "",
    intro: content.intro || "",
    services: content.services || [],
    valueProps: content.valueProps || [],
    reviews: content.reviews || []
  };
}

export async function getPreviewContent(slug) {
  if (!slug) throw new Error("slug is required");

  const record = await findByField(F.SLUG, slug);
  if (!record) {
    throw new Error(`No prospect found with Slug "${slug}"`);
  }

  const raw = record.fields[F.PREVIEW_CONFIG_JSON];
  if (!raw) {
    return {
      slug,
      businessName: record.fields[F.NAME],
      hasConfig: false
    };
  }

  let config;
  try {
    config = JSON.parse(raw);
  } catch (err) {
    throw new Error(`Preview Config JSON is not valid JSON: ${err.message}`);
  }

  const isMultiPage = Boolean(config.pages);
  const pages = isMultiPage
    ? Object.fromEntries(Object.entries(config.pages).map(([key, page]) => [key, pageSummary(page)]))
    : { home: pageSummary(config) };

  return {
    slug,
    businessName: record.fields[F.NAME],
    hasConfig: true,
    status: config.status,
    isMultiPage,
    pages,
    photos: config.business?.photos || [],
    logo: config.business?.logo || "",
    primaryColor: config.branding?.primaryColor || "",
    secondaryColor: config.branding?.secondaryColor || "",
    previewUrl: `https://gabansolutions.ca/preview/${slug}`
  };
}
