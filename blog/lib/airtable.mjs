// ============================================================
// Minimal Airtable REST client for the blog's own table, separate
// from leadgen/lib/airtable.mjs (hardcoded to the Prospects pipeline)
// and booking/lib/airtable.mjs (hardcoded to Bookings). Same base,
// same credentials, different table — set with AIRTABLE_BLOG_TABLE
// (defaults to "BlogPosts"). No SDK dependency, plain fetch, same
// style as the other two.
//
// Required env vars: AIRTABLE_API_KEY, AIRTABLE_BASE_ID.
// ============================================================

const API_ROOT = "https://api.airtable.com/v0";

function requireEnv(name) {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required env var: ${name}`);
  return value;
}

function tableUrl(path = "") {
  const baseId = requireEnv("AIRTABLE_BASE_ID");
  const table = process.env.AIRTABLE_BLOG_TABLE || "BlogPosts";
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
    // instead of erroring the whole write, same reasoning as
    // leadgen/lib/airtable.mjs.
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
