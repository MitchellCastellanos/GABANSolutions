// ============================================================
// GET /api/preview/:slug
//
// Renders the no-price outbound proposal page for a single
// prospect: their name, the mockup a human uploaded to Airtable,
// and one CTA ("let's talk 15 min") — no pricing anywhere. This is
// what leadgen/scripts/send-proposal.mjs links to in the initial
// outreach email.
//
// Looks up the prospect by Slug in Airtable and best-effort records
// the first view (never blocks the response on that write).
//
// Required env vars: AIRTABLE_API_KEY, AIRTABLE_BASE_ID.
// ============================================================

import { findByField, updateRecord } from "../../leadgen/lib/airtable.mjs";
import { F } from "../../leadgen/lib/fields.mjs";

function escapeHtml(value) {
  return String(value || "").replace(/[&<>"']/g, (ch) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  }[ch]));
}

function renderNotFound(res) {
  res.status(404).setHeader("Content-Type", "text/html; charset=utf-8");
  return res.end(`<!DOCTYPE html><html><head><meta charset="utf-8"><title>GABAN Solutions</title></head>
<body style="font-family: system-ui, sans-serif; text-align:center; padding: 4rem 1rem;">
  <h1>Preview not found</h1>
  <p>This link may have expired. <a href="https://gabansolutions.ca/contact.html">Contact us</a> directly instead.</p>
</body></html>`);
}

function renderProposal({ name, mockupUrl, businessParam }) {
  const safeName = escapeHtml(name);
  const ctaHref = `https://gabansolutions.ca/contact.html?ref=outbound-proposal&need=New%20website&business=${encodeURIComponent(businessParam)}`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="robots" content="noindex, nofollow">
  <title>A website concept for ${safeName} — GABAN Solutions</title>
  <style>
    body { font-family: system-ui, -apple-system, sans-serif; max-width: 720px; margin: 0 auto; padding: 2.5rem 1.5rem; color: #1a1a1a; line-height: 1.6; }
    .mockup { width: 100%; border-radius: 12px; border: 1px solid #e5e5e5; margin: 1.5rem 0; display: block; }
    .cta { display: inline-block; background: #111; color: #fff; text-decoration: none; padding: 0.9rem 1.6rem; border-radius: 8px; font-weight: 600; margin-top: 1rem; }
    ul { padding-left: 1.2rem; }
    li { margin-bottom: 0.5rem; }
    .footer { margin-top: 3rem; font-size: 0.85rem; color: #777; }
  </style>
</head>
<body>
  <p style="color:#777; font-size:0.9rem;">GABAN Solutions</p>
  <h1>A website concept for ${safeName}</h1>
  <p>We put together an idea of what your site could look like — no cost, no obligation, just a starting point to see if it's worth talking about.</p>
  ${mockupUrl ? `<img class="mockup" src="${escapeHtml(mockupUrl)}" alt="Website concept for ${safeName}">` : ""}
  <ul>
    <li>Built mobile-first, so it works wherever your customers find you</li>
    <li>Easier to show up when people search for your business on Google</li>
    <li>Ready to launch fast — this is a concept, the real thing can go live in days</li>
  </ul>
  <p><strong>No pricing here on purpose.</strong> If this looks like something worth having, the next step is just a quick 15-minute call to talk through it.</p>
  <a class="cta" href="${ctaHref}">Let's talk 15 min</a>
  <p class="footer">GABAN Solutions — Montreal, QC · hello@gabansolutions.ca · +1 (514) 258-0648</p>
</body>
</html>`;
}

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  const slug = (req.query?.slug || "").toString().trim();
  if (!slug) {
    return renderNotFound(res);
  }

  let record;
  try {
    record = await findByField(F.SLUG, slug);
  } catch (err) {
    res.status(500).setHeader("Content-Type", "text/plain; charset=utf-8");
    return res.end("Something went wrong loading this preview.");
  }

  if (!record) {
    return renderNotFound(res);
  }

  const fields = record.fields;

  if (!fields[F.FIRST_VIEWED]) {
    updateRecord(record.id, { [F.FIRST_VIEWED]: new Date().toISOString() }).catch(() => {});
  }

  res.setHeader("Content-Type", "text/html; charset=utf-8");
  return res.status(200).end(
    renderProposal({
      name: fields[F.NAME],
      mockupUrl: fields[F.MOCKUP_LINK],
      businessParam: fields[F.NAME] || ""
    })
  );
}
