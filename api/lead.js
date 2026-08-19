// ============================================================
// POST /api/lead
// Thin, first-party lead endpoint in front of Formspree.
//
// Why this exists instead of posting straight to Formspree from the
// browser: it lets the simplified contact form (and the free mockup
// CTA) submit via fetch() and get an instant inline confirmation
// instead of a full-page redirect, it captures `ref` (source
// attribution, previously dropped silently), and it gives us one
// place to fan a lead out to future tools (Notion/Make.com) without
// touching the frontend again.
//
// Optional env vars (all best-effort, never block the reply to the
// visitor if they are unset or fail):
//   FORMSPREE_ENDPOINT  - defaults to the existing form endpoint
//   LEAD_WEBHOOK_URL     - generic webhook (e.g. Make.com/Zapier) to
//                          forward the same payload to, for wiring up
//                          a CRM/notification pipeline later
// ============================================================

import { createLead } from "../leads/lib/airtable.mjs";

const DEFAULT_FORMSPREE_ENDPOINT = "https://formspree.io/f/mwvrpnnk";

async function postJSON(url, payload, ms = 6000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  const signal = controller.signal;
  const cancel = () => clearTimeout(timer);
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(payload),
      signal
    });
    return res;
  } finally {
    cancel();
  }
}

function clean(value, max = 500) {
  return (typeof value === "string" ? value : "").trim().slice(0, max);
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : (req.body || {});

  // Honeypot: real visitors never fill this hidden field. Bots that
  // auto-fill every input do. Accept silently but drop it.
  if (clean(body.company_website)) {
    return res.status(200).json({ ok: true });
  }

  const name = clean(body.name, 120);
  const contact = clean(body.contact, 160); // phone or email, visitor's choice
  const need = clean(body.need, 60);

  if (!name || !contact) {
    return res.status(400).json({ ok: false, error: "Missing name or contact info" });
  }

  const lead = {
    name,
    contact,
    need,
    business: clean(body.business, 120),
    package: clean(body.package, 80),
    timeline: clean(body.timeline, 80),
    message: clean(body.message, 2000),
    ref: clean(body.ref, 100),
    source_path: clean(body.source_path, 200),
    lang: clean(body.lang, 5),
    // First-touch acquisition attribution, captured client-side in
    // js/components.js (sessionStorage, no cookies) and forwarded here
    // so a lead can be traced back to the campaign/source that produced
    // it. All optional — absent on the Formspree-only fallback path.
    utm_source: clean(body.utm_source, 60),
    utm_medium: clean(body.utm_medium, 60),
    utm_campaign: clean(body.utm_campaign, 100),
    utm_content: clean(body.utm_content, 100),
    utm_term: clean(body.utm_term, 100),
    referrer: clean(body.referrer, 200),
    landing_page: clean(body.landing_page, 200),
    landing_service: clean(body.landing_service, 80),
    submitted_at: new Date().toISOString()
  };

  const formspreeEndpoint = process.env.FORMSPREE_ENDPOINT || DEFAULT_FORMSPREE_ENDPOINT;

  let delivered = false;
  try {
    const fsRes = await postJSON(formspreeEndpoint, {
      name: lead.name,
      _replyto: /@/.test(lead.contact) ? lead.contact : undefined,
      contact: lead.contact,
      need: lead.need || "Not specified",
      business: lead.business || "-",
      package: lead.package || "-",
      timeline: lead.timeline || "-",
      message: lead.message || "(No additional details provided)",
      ref: lead.ref || "contact-page-direct",
      source_path: lead.source_path || "-",
      _subject: `New GABAN lead — ${lead.need || "general inquiry"} (${lead.ref || "direct"})`
    });
    delivered = fsRes.ok;
  } catch (err) {
    delivered = false;
  }

  // Best-effort fan-out to a future CRM/automation webhook. Never
  // block or fail the visitor-facing response on this.
  const webhookUrl = process.env.LEAD_WEBHOOK_URL;
  if (webhookUrl) {
    postJSON(webhookUrl, lead, 4000).catch(() => {});
  }

  // Best-effort persistence for the admin analytics dashboard (leads,
  // conversion funnel, campaign attribution). Formspree above is still
  // the primary delivery path (email notification) — a missing/misnamed
  // Airtable "Leads" table must never block or fail this response.
  createLead({
    Name: lead.name,
    Contact: lead.contact,
    Need: lead.need,
    Business: lead.business,
    Package: lead.package,
    Timeline: lead.timeline,
    Message: lead.message,
    Ref: lead.ref,
    SourcePath: lead.source_path,
    Lang: lead.lang,
    UtmSource: lead.utm_source,
    UtmMedium: lead.utm_medium,
    UtmCampaign: lead.utm_campaign,
    UtmContent: lead.utm_content,
    UtmTerm: lead.utm_term,
    Referrer: lead.referrer,
    LandingPage: lead.landing_page,
    LandingService: lead.landing_service,
    SubmittedAt: lead.submitted_at
  }).catch(() => {});

  if (!delivered) {
    return res.status(502).json({ ok: false, error: "Could not deliver lead" });
  }

  return res.status(200).json({ ok: true });
}
