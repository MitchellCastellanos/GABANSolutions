#!/usr/bin/env node
// ============================================================
// leadgen/scripts/archive-previews.mjs
//
// Marks a prospect's preview "archived" once its Pipeline Status
// lands in a terminal/lost state (No Response, Not Interested,
// Discarded, Do Not Contact) — the deal is dead, so the preview
// doesn't need to keep showing as "approved"/"draft" indefinitely.
// The page itself keeps rendering at the same URL (shell.mjs shows
// an "INTERNAL REVIEW — status: archived" banner for anything that
// isn't "approved"), nothing is deleted.
//
// Runs weekly alongside prospect/enrich/score (see
// .github/workflows/leadgen-weekly.yml) — this is cleanup, not
// something that needs daily freshness.
//
// Usage:
//   node leadgen/scripts/archive-previews.mjs [--dry-run]
//
// Required env vars: AIRTABLE_API_KEY, AIRTABLE_BASE_ID.
// ============================================================

import { fileURLToPath } from "node:url";
import { listRecords, updateRecord } from "../lib/airtable.mjs";
import { F, STATUS, PREVIEW_STATUS } from "../lib/fields.mjs";

const DRY_RUN = process.argv.includes("--dry-run");

const TERMINAL_PIPELINE_STATUSES = [
  STATUS.NO_RESPONSE,
  STATUS.NOT_INTERESTED,
  STATUS.DISCARDED,
  STATUS.DO_NOT_CONTACT
];

export async function main() {
  const pipelineClause = TERMINAL_PIPELINE_STATUSES
    .map((s) => `{${F.PIPELINE_STATUS}} = "${s}"`)
    .join(", ");

  const records = await listRecords({
    filterByFormula: `AND(
      OR(${pipelineClause}),
      {${F.PREVIEW_STATUS}} != "",
      {${F.PREVIEW_STATUS}} != "${PREVIEW_STATUS.ARCHIVED}"
    )`
  });

  console.log(`Previews to archive: ${records.length}`);

  for (const record of records) {
    const f = record.fields;
    console.log(`  Archivando: ${f[F.NAME]} (Pipeline Status: ${f[F.PIPELINE_STATUS]})`);

    const fields = { [F.PREVIEW_STATUS]: PREVIEW_STATUS.ARCHIVED };

    const raw = f[F.PREVIEW_CONFIG_JSON];
    if (raw) {
      try {
        const config = JSON.parse(raw);
        config.status = PREVIEW_STATUS.ARCHIVED;
        config.meta = { ...config.meta, archivedAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
        fields[F.PREVIEW_CONFIG_JSON] = JSON.stringify(config, null, 2);
      } catch {
        // Malformed JSON shouldn't block archiving the flat status field.
      }
    }

    if (DRY_RUN) {
      console.log("    [dry-run] would update Preview Status -> archived");
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
