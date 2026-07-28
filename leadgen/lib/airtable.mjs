// ============================================================
// Minimal Airtable REST client — just the operations the leadgen
// scripts need (list/create/update records in the Prospects table).
// No SDK dependency, plain fetch, same style as api/lead.js.
//
// Required env vars:
//   AIRTABLE_API_KEY   - personal access token
//   AIRTABLE_BASE_ID   - base id (starts with "app...")
//   AIRTABLE_TABLE     - defaults to "Prospects"
// ============================================================

const API_ROOT = "https://api.airtable.com/v0";

function requireEnv(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required env var: ${name}`);
  }
  return value;
}

function tableUrl(path = "") {
  const baseId = requireEnv("AIRTABLE_BASE_ID");
  const table = process.env.AIRTABLE_TABLE || "Prospects";
  return `${API_ROOT}/${baseId}/${encodeURIComponent(table)}${path}`;
}

async function airtableFetch(url, options = {}) {
  const apiKey = requireEnv("AIRTABLE_API_KEY");
  const res = await fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      ...(options.headers || {})
    }
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Airtable request failed (${res.status}): ${body}`);
  }
  return res.json();
}

/** List all records, optionally filtered by an Airtable formula. */
export async function listRecords({ filterByFormula, maxRecords } = {}) {
  const records = [];
  let offset;
  do {
    const params = new URLSearchParams();
    if (filterByFormula) params.set("filterByFormula", filterByFormula);
    if (maxRecords) params.set("maxRecords", String(maxRecords));
    if (offset) params.set("offset", offset);
    const page = await airtableFetch(`${tableUrl()}?${params.toString()}`);
    records.push(...page.records);
    offset = page.offset;
  } while (offset);
  return records;
}

/** Find a single record by an exact-match field, or null. */
export async function findByField(field, value) {
  const escaped = String(value).replace(/"/g, '\\"');
  const records = await listRecords({
    filterByFormula: `{${field}} = "${escaped}"`,
    maxRecords: 1
  });
  return records[0] || null;
}

export async function createRecord(fields) {
  const result = await airtableFetch(tableUrl(), {
    method: "POST",
    // typecast lets Airtable auto-add a missing single-select option
    // (e.g. a new Pipeline Status/Call Outcome value) instead of
    // erroring the whole write — this repo's status values evolve
    // faster than anyone remembers to update the base schema by hand.
    body: JSON.stringify({ fields, typecast: true })
  });
  return result;
}

export async function updateRecord(recordId, fields) {
  const result = await airtableFetch(`${tableUrl()}/${recordId}`, {
    method: "PATCH",
    body: JSON.stringify({ fields, typecast: true })
  });
  return result;
}

/** Create if a record matching `field`=`fields[field]` doesn't exist yet, else patch it. */
export async function upsertByField(field, fields) {
  const existing = await findByField(field, fields[field]);
  if (existing) {
    return updateRecord(existing.id, fields);
  }
  return createRecord(fields);
}
