// ============================================================
// Persists discovery briefs to the Airtable "Leads" table so they form
// a searchable pipeline (not just an email). Best-effort: returns
// false when Airtable isn't configured or the call fails — callers must
// not lose the lead because of it.
//
// Env: AIRTABLE_API_KEY, AIRTABLE_BASE_ID (shared with booking/leadgen),
//      AIRTABLE_LEADS_TABLE (default "Leads").
// Table fields: see docs/AI_ROADMAP.md ("Tabla Leads").
// ============================================================

export function isLeadStoreConfigured() {
  return Boolean(process.env.AIRTABLE_API_KEY && process.env.AIRTABLE_BASE_ID);
}

export function leadFields(a, lead, est, brief, meta = {}) {
  return {
    Name: lead.name,
    Contact: lead.contact,
    "Business Type": a.businessType,
    Need: a.need,
    Assets: a.assets,
    Languages: a.languages.join(", "),
    Timeline: a.timeline,
    Description: a.description,
    "Suggested Package": est.suggestedPackage,
    Fit: brief.fit,
    "Bill 96 Flag": Boolean(est.law96Flag),
    "Team Summary": brief.team_summary,
    Risks: brief.risks.join("\n"),
    Questions: brief.questions.join("\n"),
    "UI Lang": meta.lang || "",
    Source: "discovery-assistant",
    Status: "New",
    "Submitted At": new Date().toISOString()
  };
}

export async function saveLead(fields, { fetchImpl = fetch } = {}) {
  if (!isLeadStoreConfigured()) return false;
  const table = process.env.AIRTABLE_LEADS_TABLE || "Leads";
  const url = `https://api.airtable.com/v0/${process.env.AIRTABLE_BASE_ID}/${encodeURIComponent(table)}`;
  try {
    const res = await fetchImpl(url, {
      method: "POST",
      headers: { Authorization: `Bearer ${process.env.AIRTABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({ fields, typecast: true })
    });
    return res.ok;
  } catch {
    return false;
  }
}
