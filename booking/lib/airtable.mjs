// ============================================================
// Minimal Airtable REST client for the booking calendar's own
// table, separate from leadgen/lib/airtable.mjs (which is hardcoded
// to the Prospects pipeline via AIRTABLE_TABLE). Same base, same
// credentials, different table — set with AIRTABLE_BOOKINGS_TABLE
// (defaults to "Bookings").
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
  const table = process.env.AIRTABLE_BOOKINGS_TABLE || "Bookings";
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

/** List booking records whose Start falls within [fromIso, toIso), optionally including cancelled ones. */
export async function listBookingsBetween(fromIso, toIso, { includeCancelled = false } = {}) {
  const statusClause = includeCancelled ? "TRUE()" : `{Status} != "Cancelled"`;
  const formula = `AND(${statusClause}, IS_AFTER({Start}, "${fromIso}"), IS_BEFORE({Start}, "${toIso}"))`;
  const records = [];
  let offset;
  do {
    const params = new URLSearchParams({ filterByFormula: formula, pageSize: "100" });
    params.append("sort[0][field]", "Start");
    params.append("sort[0][direction]", "asc");
    if (offset) params.set("offset", offset);
    const page = await airtableFetch(`${tableUrl()}?${params.toString()}`);
    records.push(...page.records);
    offset = page.offset;
  } while (offset);
  return records;
}

export async function createBooking(fields) {
  const result = await airtableFetch(tableUrl(), {
    method: "POST",
    body: JSON.stringify({ fields, typecast: true })
  });
  return result;
}

export async function updateBooking(id, fields) {
  const result = await airtableFetch(`${tableUrl()}/${id}`, {
    method: "PATCH",
    body: JSON.stringify({ fields, typecast: true })
  });
  return result;
}
