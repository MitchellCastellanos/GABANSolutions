// ============================================================
// Minimal Airtable REST client for contact-form leads (the ones
// submitted through /api/lead — previously relayed to Formspree only,
// with no queryable record for the admin analytics dashboard). Same
// base/credentials as booking/blog/leadgen, separate table — set with
// AIRTABLE_LEADS_TABLE (defaults to "Leads").
//
// The "Leads" table is not auto-provisioned: create it manually in
// Airtable with these fields before this starts persisting data (see
// docs/ADMIN.md). Until then, createLead()/listLeadsBetween() reject
// and callers treat that as "no data yet" rather than an error — the
// contact form itself (Formspree delivery) is unaffected either way.
//
// Fields: Name, Contact, Need, Business, Package, Timeline, Message,
// Ref, SourcePath, Lang, UtmSource, UtmMedium, UtmCampaign, UtmContent,
// UtmTerm, Referrer, LandingPage, LandingService, SubmittedAt.
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
  const table = process.env.AIRTABLE_LEADS_TABLE || "Leads";
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

export async function createLead(fields) {
  return airtableFetch(tableUrl(), {
    method: "POST",
    body: JSON.stringify({ fields, typecast: true })
  });
}

/** List lead records submitted within [fromIso, toIso). */
export async function listLeadsBetween(fromIso, toIso) {
  const formula = `AND(IS_AFTER({SubmittedAt}, "${fromIso}"), IS_BEFORE({SubmittedAt}, "${toIso}"))`;
  const records = [];
  let offset;
  do {
    const params = new URLSearchParams({ filterByFormula: formula, pageSize: "100" });
    if (offset) params.set("offset", offset);
    const page = await airtableFetch(`${tableUrl()}?${params.toString()}`);
    records.push(...page.records);
    offset = page.offset;
  } while (offset);
  return records;
}
