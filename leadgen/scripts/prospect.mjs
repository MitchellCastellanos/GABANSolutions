#!/usr/bin/env node
// ============================================================
// leadgen/scripts/prospect.mjs
//
// Queries Google Places API (New) for each category x area combo in
// leadgen/config/targets.json, fetches place details for every
// result, and upserts a raw prospect record per business into
// Airtable (table "Prospects", status "Prospectado"). Scoring and
// site enrichment happen in later scripts (enrich.mjs writes site
// signals, scoring.mjs computes the score from what's stored).
//
// Usage:
//   node leadgen/scripts/prospect.mjs [--dry-run]
//
// Required env vars: GOOGLE_PLACES_API_KEY, AIRTABLE_API_KEY,
// AIRTABLE_BASE_ID. See leadgen/.env.example.
// ============================================================

import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { upsertByField } from "../lib/airtable.mjs";
import { F, STATUS } from "../lib/fields.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DRY_RUN = process.argv.includes("--dry-run");

const PLACES_SEARCH_URL = "https://places.googleapis.com/v1/places:searchText";
const FIELD_MASK = [
  "places.id",
  "places.displayName",
  "places.formattedAddress",
  "places.internationalPhoneNumber",
  "places.websiteUri",
  "places.rating",
  "places.userRatingCount",
  "places.businessStatus",
  "places.primaryType",
  "places.types"
].join(",");

async function loadTargets() {
  const raw = await readFile(path.join(__dirname, "../config/targets.json"), "utf8");
  return JSON.parse(raw);
}

function requireEnv(name) {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required env var: ${name}`);
  return value;
}

function isExcluded(name, excludedNamesContains) {
  const normalized = (name || "").toLowerCase();
  return excludedNamesContains.some((needle) => normalized.includes(needle.toLowerCase()));
}

async function searchPlaces({ apiKey, category, area, maxResultCount }) {
  const res = await fetch(PLACES_SEARCH_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": apiKey,
      "X-Goog-FieldMask": FIELD_MASK
    },
    body: JSON.stringify({
      textQuery: `${category.label} in ${area.query}`,
      maxResultCount
    })
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Places search failed for "${category.label}" / "${area.label}" (${res.status}): ${body}`);
  }
  const data = await res.json();
  return data.places || [];
}

function slugify(text) {
  return (text || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function toProspectFields(place, category, area) {
  const shortId = (place.id || "").slice(-8);
  return {
    [F.NAME]: place.displayName?.text || "(unnamed)",
    [F.PHONE]: place.internationalPhoneNumber || "",
    [F.WEBSITE]: place.websiteUri || "",
    [F.CATEGORY]: category.label,
    [F.CITY]: area.label,
    [F.ADDRESS]: place.formattedAddress || "",
    [F.RATING]: typeof place.rating === "number" ? place.rating : null,
    [F.REVIEW_COUNT]: typeof place.userRatingCount === "number" ? place.userRatingCount : null,
    [F.BUSINESS_STATUS]: place.businessStatus || "",
    [F.GOOGLE_PLACE_ID]: place.id,
    [F.SLUG]: `${slugify(place.displayName?.text)}-${shortId}`,
    [F.PIPELINE_STATUS]: STATUS.PROSPECTED
  };
}

export async function main() {
  const targets = await loadTargets();
  const apiKey = DRY_RUN ? null : requireEnv("GOOGLE_PLACES_API_KEY");

  let found = 0;
  let skipped = 0;
  let written = 0;

  for (const category of targets.categories) {
    for (const area of targets.areas) {
      console.log(`Buscando: ${category.label} — ${area.label}`);
      let places = [];
      if (DRY_RUN) {
        console.log("  [dry-run] no se llama a Places API");
      } else {
        try {
          places = await searchPlaces({
            apiKey,
            category,
            area,
            maxResultCount: targets.maxResultsPerQuery || 20
          });
        } catch (err) {
          console.error(`  Error: ${err.message}`);
          continue;
        }
      }

      for (const place of places) {
        found += 1;
        const name = place.displayName?.text || "";

        if (isExcluded(name, targets.excludedNamesContains || [])) {
          skipped += 1;
          continue;
        }
        if (place.businessStatus && place.businessStatus !== "OPERATIONAL") {
          skipped += 1;
          continue;
        }
        if (!place.internationalPhoneNumber && !place.websiteUri) {
          skipped += 1;
          continue;
        }

        const fields = toProspectFields(place, category, area);
        if (DRY_RUN) {
          console.log("  [dry-run] upsert:", fields[F.NAME]);
        } else {
          await upsertByField(F.GOOGLE_PLACE_ID, fields);
        }
        written += 1;
      }
    }
  }

  console.log(`\nListo. Encontrados: ${found}, excluidos: ${skipped}, escritos: ${written}.`);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main().catch((err) => {
    console.error(err);
    process.exitCode = 1;
  });
}
