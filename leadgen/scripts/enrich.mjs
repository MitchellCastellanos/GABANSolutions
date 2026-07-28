#!/usr/bin/env node
// ============================================================
// leadgen/scripts/enrich.mjs
//
// For every Airtable prospect with a Website and pipeline status
// "Prospectado", runs a site audit (PageSpeed Insights + reachability
// check) and writes the result back to Airtable. Prospects with no
// website are skipped here — scoring.mjs already scores "no website"
// as a strong positive signal on its own.
//
// Usage:
//   node leadgen/scripts/enrich.mjs [--dry-run]
//
// Required env vars: AIRTABLE_API_KEY, AIRTABLE_BASE_ID.
// Optional: GOOGLE_PAGESPEED_API_KEY (PageSpeed works unauthenticated
// at low volume, but a key raises the rate limit — strongly
// recommended once you're running hundreds of prospects, since the
// unauthenticated quota gets throttled hard and audits silently
// slow to a crawl rather than failing outright).
// Optional: LEADGEN_ENRICH_CONCURRENCY (default 8) — how many site
// audits to run at once. PageSpeed audits were previously run one at
// a time, which is why a full pass over ~500 prospects could take
// 45+ minutes; running them concurrently is the main lever here.
// ============================================================

import { fileURLToPath } from "node:url";
import { listRecords, updateRecord } from "../lib/airtable.mjs";
import { F, STATUS } from "../lib/fields.mjs";

const DRY_RUN = process.argv.includes("--dry-run");
const PAGESPEED_URL = "https://www.googleapis.com/pagespeedonline/v5/runPagespeed";
const CONCURRENCY = Number(process.env.LEADGEN_ENRICH_CONCURRENCY) || 8;
const PAGESPEED_TIMEOUT_MS = 20000;

async function mapWithConcurrency(items, limit, fn) {
  let index = 0;
  async function worker() {
    while (index < items.length) {
      const current = index++;
      await fn(items[current], current);
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
}

async function checkReachable(url) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 8000);
  try {
    const res = await fetch(url, { method: "GET", redirect: "follow", signal: controller.signal });
    return { unreachable: !res.ok, hasHttps: res.url.startsWith("https://") };
  } catch {
    return { unreachable: true, hasHttps: url.startsWith("https://") };
  } finally {
    clearTimeout(timer);
  }
}

async function runPageSpeed(url) {
  const params = new URLSearchParams({
    url,
    strategy: "mobile",
    category: "performance"
  });
  if (process.env.GOOGLE_PAGESPEED_API_KEY) {
    params.set("key", process.env.GOOGLE_PAGESPEED_API_KEY);
  }
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), PAGESPEED_TIMEOUT_MS);
  try {
    const res = await fetch(`${PAGESPEED_URL}?${params.toString()}`, { signal: controller.signal });
    if (!res.ok) {
      throw new Error(`PageSpeed request failed (${res.status})`);
    }
    const data = await res.json();
    const performanceScore = data.lighthouseResult?.categories?.performance?.score;
    const mobileFriendly = data.lighthouseResult?.audits?.["viewport"]?.score === 1;
    return {
      performanceScore: typeof performanceScore === "number" ? Math.round(performanceScore * 100) : null,
      mobileFriendly
    };
  } finally {
    clearTimeout(timer);
  }
}

function fieldsFromAudit(audit) {
  const signalParts = [];
  if (audit.unreachable) signalParts.push("sitio caído");
  if (audit.hasHttps === false) signalParts.push("sin HTTPS");
  if (typeof audit.performanceScore === "number") signalParts.push(`PageSpeed: ${audit.performanceScore}`);
  if (audit.mobileFriendly === false) signalParts.push("no mobile-friendly");

  return {
    [F.SITE_AUDIT_JSON]: JSON.stringify(audit),
    [F.SIGNALS]: signalParts.join(", ") || "site looks healthy",
    [F.PIPELINE_STATUS]: STATUS.QUALIFIED
  };
}

export async function main() {
  const records = await listRecords({
    filterByFormula: `AND({${F.WEBSITE}} != "", {${F.PIPELINE_STATUS}} = "${STATUS.PROSPECTED}")`
  });

  console.log(`Encontrados ${records.length} prospectos con website pendientes de auditar (concurrencia: ${CONCURRENCY}).`);

  await mapWithConcurrency(records, CONCURRENCY, async (record) => {
    const website = record.fields[F.WEBSITE];
    console.log(`Auditando: ${record.fields[F.NAME]} — ${website}`);

    const reachable = await checkReachable(website);
    let pagespeed = { performanceScore: null, mobileFriendly: null };
    if (!reachable.unreachable) {
      try {
        pagespeed = await runPageSpeed(website);
      } catch (err) {
        console.error(`  PageSpeed falló para ${website}: ${err.message}`);
      }
    }

    const audit = { ...reachable, ...pagespeed };
    const fields = fieldsFromAudit(audit);

    if (DRY_RUN) {
      console.log("  [dry-run]", fields);
    } else {
      await updateRecord(record.id, fields);
    }
  });

  console.log("Listo.");
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main().catch((err) => {
    console.error(err);
    process.exitCode = 1;
  });
}
