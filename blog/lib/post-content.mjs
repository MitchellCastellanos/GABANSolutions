// ============================================================
// Read/update a blog post's content fields in Airtable — the blog's
// equivalent of leadgen/lib/preview-content-reader.mjs +
// leadgen/scripts/update-preview-content.mjs combined into one file
// because a blog post's fields are flat Airtable columns (Title, Meta
// Description, H1, Body HTML, ...), not a nested JSON blob like a
// preview's "Preview Config JSON" — there's no page tree to walk, so
// the read/merge logic is much smaller and doesn't need splitting.
//
// getPostContent()   -> admin/lib/handlers/blog-content.mjs (GET)
// updatePostContent()-> admin/lib/handlers/blog-save.mjs (POST)
//
// Required env vars: AIRTABLE_API_KEY, AIRTABLE_BASE_ID.
// ============================================================

import { findByField, updateRecord } from "./airtable.mjs";
import { F, POST_STATUS } from "./fields.mjs";
import { categoryDisplayLabel } from "./topics.mjs";

const SITE_URL = "https://gabansolutions.ca";

function toPost(record) {
  const f = record.fields;
  const categoryKey = f[F.CATEGORY_KEY] || "";
  return {
    id: record.id,
    slug: f[F.SLUG] || "",
    title: f[F.TITLE] || "",
    metaDescription: f[F.META_DESCRIPTION] || "",
    h1: f[F.H1] || "",
    topic: f[F.TOPIC] || "",
    categoryKey,
    categoryLabel: categoryKey ? categoryDisplayLabel(categoryKey) : "",
    city: f[F.CITY] || "",
    bodyHtml: f[F.BODY_HTML] || "",
    excerpt: f[F.EXCERPT] || "",
    coverImageUrl: f[F.COVER_IMAGE_URL] || "",
    canonicalUrl: f[F.CANONICAL_URL] || "",
    author: f[F.AUTHOR] || "GABAN Solutions",
    status: f[F.STATUS] || POST_STATUS.DRAFT,
    publishedDate: f[F.PUBLISHED_DATE] || null,
    updatedDate: f[F.UPDATED_DATE] || null,
    views: typeof f[F.VIEWS] === "number" ? f[F.VIEWS] : 0,
    blogUrl: `${SITE_URL}/blog/${f[F.SLUG] || ""}`
  };
}

export async function getPostContent(slug) {
  if (!slug) throw new Error("slug is required");
  const record = await findByField(F.SLUG, slug);
  if (!record) {
    throw new Error(`No blog post found with Slug "${slug}" — create it first with blog/scripts/new-post.mjs.`);
  }
  return toPost(record);
}

const PATCHABLE_STRING_FIELDS = {
  title: F.TITLE,
  metaDescription: F.META_DESCRIPTION,
  h1: F.H1,
  bodyHtml: F.BODY_HTML,
  excerpt: F.EXCERPT,
  coverImageUrl: F.COVER_IMAGE_URL,
  canonicalUrl: F.CANONICAL_URL,
  author: F.AUTHOR
};

/**
 * Merges only the fields actually present (non-empty strings) in
 * `patch` — omitting a field leaves whatever's already saved alone,
 * same "safe to call repeatedly with a partial patch" contract as
 * leadgen's update-preview-content.mjs.
 */
export async function updatePostContent(slug, patch = {}) {
  if (!slug) throw new Error("slug is required");
  const record = await findByField(F.SLUG, slug);
  if (!record) {
    throw new Error(`No blog post found with Slug "${slug}" — create it first with blog/scripts/new-post.mjs.`);
  }

  const airtableFields = {};
  const updatedFields = [];
  for (const [key, field] of Object.entries(PATCHABLE_STRING_FIELDS)) {
    const value = patch[key];
    if (typeof value === "string" && value.trim()) {
      airtableFields[field] = value.trim();
      updatedFields.push(key);
    }
  }

  if (updatedFields.length) {
    airtableFields[F.UPDATED_DATE] = new Date().toISOString();
    await updateRecord(record.id, airtableFields);
  }

  return {
    slug,
    updatedFields,
    blogUrl: `${SITE_URL}/blog/${slug}`
  };
}
