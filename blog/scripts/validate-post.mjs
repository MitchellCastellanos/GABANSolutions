#!/usr/bin/env node
// ============================================================
// blog/scripts/validate-post.mjs
//
// Runs blog/lib/post-schema.mjs's validator against one post and
// prints the result. With --publish, also flips Status to
// "published" (stamping Published Date the first time) — but only if
// there are zero errors; warnings alone don't block publishing,
// they're the reviewer's call. Mirrors
// leadgen/scripts/validate-preview.mjs exactly.
//
// The core logic is exported as validatePostForSlug() so
// admin/lib/handlers/blog-validate.mjs can call it directly for the
// /admin/blog "Validate & publish" button.
//
// Usage:
//   node blog/scripts/validate-post.mjs --slug=<slug> [--publish]
//
// Required env vars: AIRTABLE_API_KEY, AIRTABLE_BASE_ID.
// ============================================================

import { fileURLToPath } from "node:url";
import { getPostContent } from "../lib/post-content.mjs";
import { findByField, updateRecord } from "../lib/airtable.mjs";
import { F, POST_STATUS } from "../lib/fields.mjs";
import { validateBlogPost } from "../lib/post-schema.mjs";

export async function validatePostForSlug(slug, { publish = false } = {}) {
  if (!slug) throw new Error("slug is required");

  const post = await getPostContent(slug);
  const result = validateBlogPost(post);

  const summary = {
    slug,
    title: post.title || post.topic,
    valid: result.valid,
    errors: result.errors,
    warnings: result.warnings,
    score: result.score,
    published: false,
    blogUrl: post.blogUrl
  };

  if (!publish || !result.valid) return summary;

  const record = await findByField(F.SLUG, slug);
  const alreadyPublished = record.fields[F.STATUS] === POST_STATUS.PUBLISHED;
  const airtableFields = { [F.STATUS]: POST_STATUS.PUBLISHED };
  if (!alreadyPublished) {
    airtableFields[F.PUBLISHED_DATE] = new Date().toISOString();
  }
  await updateRecord(record.id, airtableFields);

  summary.published = true;
  return summary;
}

function arg(name) {
  const found = process.argv.find((a) => a.startsWith(`--${name}=`));
  return found ? found.split("=").slice(1).join("=") : undefined;
}

async function main() {
  const slug = arg("slug");
  const shouldPublish = process.argv.includes("--publish");
  if (!slug) {
    throw new Error("Usage: node blog/scripts/validate-post.mjs --slug=<slug> [--publish]");
  }

  const result = await validatePostForSlug(slug, { publish: shouldPublish });

  console.log(`Validating "${result.title}" (${slug})`);
  console.log(`Quality score: ${result.score}/10`);
  if (result.errors.length) {
    console.log("\nErrors (block publishing):");
    result.errors.forEach((e) => console.log(`  ✗ ${e}`));
  }
  if (result.warnings.length) {
    console.log("\nWarnings (reviewer's call):");
    result.warnings.forEach((w) => console.log(`  ! ${w}`));
  }
  if (result.valid) {
    console.log("\nNo blocking errors.");
  }

  if (!shouldPublish) return;

  if (!result.valid) {
    console.error("\nCannot publish: fix the errors above first.");
    process.exitCode = 1;
    return;
  }

  console.log(`\nPublished. Live at: ${result.blogUrl}`);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main().catch((err) => {
    console.error(err.message || err);
    process.exitCode = 1;
  });
}
