// ============================================================
// Airtable field names + status values (English) for the `BlogPosts`
// table. Keep in sync with the schema documented in blog/README.md —
// same convention as leadgen/lib/fields.mjs for `Prospects`.
// ============================================================

export const F = {
  SLUG: "Slug",
  TITLE: "Title",
  META_DESCRIPTION: "Meta Description",
  H1: "H1",
  TOPIC: "Topic",
  CATEGORY_KEY: "Category Key",
  CITY: "City",
  BODY_HTML: "Body HTML",
  EXCERPT: "Excerpt",
  COVER_IMAGE_URL: "Cover Image URL",
  CANONICAL_URL: "Canonical URL",
  AUTHOR: "Author",
  STATUS: "Status",
  PUBLISHED_DATE: "Published Date",
  UPDATED_DATE: "Updated Date",
  VIEWS: "Views",
  LAST_VIEWED: "Last Viewed"
};

// Values for the "Status" single select — independent lifecycle from
// anything else in the repo. Only "published" is ever rendered
// indexable at /blog/:slug; draft/in_review/archived still render
// (so a human can review the real page before publishing) but with a
// noindex header + banner, same spirit as leadgen's Preview Status.
export const POST_STATUS = {
  DRAFT: "draft",
  IN_REVIEW: "in_review",
  PUBLISHED: "published",
  ARCHIVED: "archived"
};
