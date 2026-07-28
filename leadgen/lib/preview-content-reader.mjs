// ============================================================
// Read-only counterpart to update-preview-content.mjs: returns the
// current content of a prospect's Preview Config JSON, flattened for
// display. Used by api/cron/preview-content.js so leadgen-admin.html
// can re-populate its form after the page is closed/reopened —
// otherwise every reload starts from blank inputs even though the
// data is already saved in Airtable.
// ============================================================

import { findByField } from "./airtable.mjs";
import { F } from "./fields.mjs";

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

  return {
    slug,
    businessName: record.fields[F.NAME],
    hasConfig: true,
    status: config.status,
    headline: config.content?.headline || "",
    subheadline: config.content?.subheadline || "",
    about: config.content?.about || "",
    services: config.content?.services || [],
    photos: config.business?.photos || [],
    logo: config.business?.logo || "",
    primaryColor: config.branding?.primaryColor || "",
    secondaryColor: config.branding?.secondaryColor || "",
    previewUrl: `https://gabansolutions.ca/preview/${slug}`
  };
}
