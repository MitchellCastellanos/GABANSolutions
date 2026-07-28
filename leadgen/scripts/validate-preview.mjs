#!/usr/bin/env node
// ============================================================
// leadgen/scripts/validate-preview.mjs
//
// Runs leadgen/lib/preview-schema.mjs's validator against one
// prospect's "Preview Config JSON" and prints the result. With
// --approve, also flips "Preview Status" to "approved" (and stamps
// meta.approvedAt in the JSON) — but only if there are zero errors;
// warnings alone don't block approval, they're just flagged for the
// reviewer's judgment.
//
// The core logic is exported as validatePreviewForSlug() so
// api/cron/approve-preview.js can call it directly over HTTP (for
// mobile use via leadgen-admin.html) without shelling out to this CLI.
//
// Usage:
//   node leadgen/scripts/validate-preview.mjs --slug=<slug> [--approve]
//
// Required env vars: AIRTABLE_API_KEY, AIRTABLE_BASE_ID.
// ============================================================

import { fileURLToPath } from "node:url";
import { findByField, updateRecord } from "../lib/airtable.mjs";
import { F, PREVIEW_STATUS } from "../lib/fields.mjs";
import { validatePreviewConfig } from "../lib/preview-schema.mjs";
import { knownCategoryKeys } from "../templates/registry.mjs";

/**
 * Validates one slug's Preview Config JSON, optionally approving it.
 * Returns a plain-object summary — never throws for "invalid config",
 * only for missing prospect/config/malformed JSON (real setup errors).
 */
export async function validatePreviewForSlug(slug, { approve = false } = {}) {
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
    throw new Error(`Preview Config JSON is not valid JSON: ${err.message}`);
  }

  const result = validatePreviewConfig(config, knownCategoryKeys);
  const summary = {
    slug,
    businessName: record.fields[F.NAME],
    valid: result.valid,
    errors: result.errors,
    warnings: result.warnings,
    score: result.score,
    approved: false,
    previewUrl: `https://gabansolutions.ca/preview/${slug}`
  };

  if (!approve || !result.valid) return summary;

  config.status = PREVIEW_STATUS.APPROVED;
  config.meta = { ...config.meta, approvedAt: new Date().toISOString(), updatedAt: new Date().toISOString() };

  await updateRecord(record.id, {
    [F.PREVIEW_CONFIG_JSON]: JSON.stringify(config, null, 2),
    [F.PREVIEW_STATUS]: PREVIEW_STATUS.APPROVED
  });

  summary.approved = true;
  return summary;
}

function arg(name) {
  const found = process.argv.find((a) => a.startsWith(`--${name}=`));
  return found ? found.split("=").slice(1).join("=") : undefined;
}

async function main() {
  const slug = arg("slug");
  const shouldApprove = process.argv.includes("--approve");
  if (!slug) {
    throw new Error("Usage: node leadgen/scripts/validate-preview.mjs --slug=<slug> [--approve]");
  }

  const result = await validatePreviewForSlug(slug, { approve: shouldApprove });

  console.log(`Validating preview for "${result.businessName}" (${slug})`);
  console.log(`Personalization score: ${result.score}/10`);
  if (result.errors.length) {
    console.log("\nErrors (block approval):");
    result.errors.forEach((e) => console.log(`  ✗ ${e}`));
  }
  if (result.warnings.length) {
    console.log("\nWarnings (reviewer's call):");
    result.warnings.forEach((w) => console.log(`  ! ${w}`));
  }
  if (result.valid) {
    console.log("\nNo blocking errors.");
  }

  if (!shouldApprove) return;

  if (!result.valid) {
    console.error("\nCannot approve: fix the errors above first.");
    process.exitCode = 1;
    return;
  }

  console.log(`\nApproved. Live at: ${result.previewUrl}`);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main().catch((err) => {
    console.error(err);
    process.exitCode = 1;
  });
}
