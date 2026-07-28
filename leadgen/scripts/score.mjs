#!/usr/bin/env node
// ============================================================
// leadgen/scripts/score.mjs
//
// Reads every Airtable prospect not yet scored (status "Prospectado"
// or "Calificado" without a Score value), runs the pure scoring
// function from leadgen/lib/scoring.mjs against the stored Places +
// site-audit data, and writes Score/Bucket/Señales back. Prospects
// without a website skip enrich.mjs entirely, so this is the step
// that actually assigns them a score.
//
// Run order: prospect.mjs -> enrich.mjs -> score.mjs
//
// Usage:
//   node leadgen/scripts/score.mjs [--dry-run]
// ============================================================

import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { listRecords, updateRecord } from "../lib/airtable.mjs";
import { scoreProspect } from "../lib/scoring.mjs";
import { F, STATUS } from "../lib/fields.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DRY_RUN = process.argv.includes("--dry-run");

const BUCKET_LABELS = {
  hot: "🔥 Hot",
  warm: "🌤 Warm",
  low: "❄️ Low",
  disqualified: "Discarded"
};

async function loadTargetCategories() {
  const raw = await readFile(path.join(__dirname, "../config/targets.json"), "utf8");
  const targets = JSON.parse(raw);
  return (targets.categories || []).map((c) => c.label);
}

function parseAudit(record) {
  const raw = record.fields[F.SITE_AUDIT_JSON];
  if (!raw) return undefined;
  try {
    return JSON.parse(raw);
  } catch {
    return undefined;
  }
}

export async function main() {
  const targetCategories = await loadTargetCategories();
  const records = await listRecords({
    filterByFormula: `OR({${F.PIPELINE_STATUS}} = "${STATUS.PROSPECTED}", {${F.PIPELINE_STATUS}} = "${STATUS.QUALIFIED}")`
  });

  console.log(`Calculando score para ${records.length} prospectos.`);

  for (const record of records) {
    const f = record.fields;
    const prospect = {
      name: f[F.NAME],
      website: f[F.WEBSITE],
      rating: f[F.RATING],
      userRatingsTotal: f[F.REVIEW_COUNT],
      businessStatus: f[F.BUSINESS_STATUS],
      phone: f[F.PHONE],
      categories: f[F.CATEGORY] ? [f[F.CATEGORY]] : [],
      targetCategories,
      siteAudit: parseAudit(record)
    };

    const result = scoreProspect(prospect);
    const fields = {
      [F.SCORE]: result.score,
      [F.BUCKET]: BUCKET_LABELS[result.bucket],
      [F.SIGNALS]: result.signals.join(", ") || "-",
      [F.PIPELINE_STATUS]: result.disqualified ? STATUS.DISCARDED : STATUS.QUALIFIED
    };

    console.log(`  ${f[F.NAME]}: score=${result.score} bucket=${result.bucket}`);

    if (DRY_RUN) {
      console.log("    [dry-run]", fields);
    } else {
      await updateRecord(record.id, fields);
    }
  }

  console.log("Listo.");
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main().catch((err) => {
    console.error(err);
    process.exitCode = 1;
  });
}
