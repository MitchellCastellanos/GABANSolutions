// ============================================================
// GET /preview/:slug or /preview/:slug/:page (rewritten from
// /api/preview/:path* in vercel.json)
//
// Renders the real, navigable website preview for one prospect:
// looks up their "Preview Config JSON" in Airtable, resolves the
// right category template, and renders it via
// leadgen/lib/preview-render.mjs. This is what
// leadgen/scripts/send-proposal.mjs links to in outreach emails,
// and what a human opens to review/approve before that email goes
// out (see leadgen/scripts/validate-preview.mjs).
//
// Catch-all route: `segments` is ["slug"] for the home page, or
// ["slug", "services"|"contact"] for an inner page. Multi-page
// configs have a `pages` map with those keys — see
// leadgen/scripts/generate-preview.mjs for how it's built.
//
// Backwards compatible: prospects that predate the multi-page system
// (single-page config, no `pages` key) render at their one URL as
// before regardless of what's requested; prospects that only have the
// old-style "Mockup Link" image (no Preview Config JSON at all) still
// get the old single-image proposal page. Nothing already in the
// pipeline breaks.
//
// Records a best-effort view (First Viewed / Preview Views / Preview
// Last Viewed) on every real (non-bot) visit — never blocks the
// response on that write.
//
// Required env vars: AIRTABLE_API_KEY, AIRTABLE_BASE_ID.
// ============================================================

import { findByField, updateRecord } from "../../leadgen/lib/airtable.mjs";
import { F } from "../../leadgen/lib/fields.mjs";
import { renderPreviewPage } from "../../leadgen/lib/preview-render.mjs";

const BOT_UA_PATTERNS = /bot|crawler|spider|facebookexternalhit|slackbot|whatsapp|telegrambot|discordbot|preview/i;

// Vercel's rewrite → catch-all-API-route binding for this project's
// (non-Next.js) serverless functions puts the captured path under the
// query key "...segments" (the bracket syntax from the filename,
// literal ellipsis included) rather than a clean "segments" key, and
// gives a single segment as a plain string instead of a 1-item array.
// Confirmed via a live ?debug=1 dump against production — don't
// "clean this up" back to req.query.segments without re-checking that.
function extractSegments(query) {
  const raw = query?.["...segments"] ?? query?.segments;
  if (Array.isArray(raw)) return raw.filter(Boolean);
  if (typeof raw === "string" && raw) return raw.split("/").filter(Boolean);
  return [];
}

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

// Old-style single-image proposal page, kept for prospects generated
// before the rich preview system existed (no Preview Config JSON).
function renderLegacyImageProposal({ name, mockupUrl, businessParam }) {
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

async function recordView(record) {
  const currentViews = typeof record.fields[F.PREVIEW_VIEWS] === "number" ? record.fields[F.PREVIEW_VIEWS] : 0;
  const now = new Date().toISOString();
  const fields = {
    [F.PREVIEW_VIEWS]: currentViews + 1,
    [F.PREVIEW_LAST_VIEWED]: now
  };
  if (!record.fields[F.FIRST_VIEWED]) {
    fields[F.FIRST_VIEWED] = now;
  }
  return updateRecord(record.id, fields);
}

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  const segments = extractSegments(req.query);
  const slug = (segments[0] || "").toString().trim();
  const pageKey = (segments[1] || "home").toString().trim();

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
  const userAgent = req.headers["user-agent"] || "";
  const isBot = BOT_UA_PATTERNS.test(userAgent);
  if (!isBot) {
    recordView(record).catch(() => {});
  }

  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.setHeader("X-Robots-Tag", "noindex, nofollow");

  const rawConfig = fields[F.PREVIEW_CONFIG_JSON];
  if (rawConfig) {
    let config;
    try {
      config = JSON.parse(rawConfig);
    } catch (err) {
      res.status(500).setHeader("Content-Type", "text/plain; charset=utf-8");
      return res.end("This preview's configuration is malformed. Contact GABAN Solutions to fix it.");
    }
    if (segments.length > 1 && !config.pages) {
      // Legacy single-page config, someone guessed an inner-page URL — just show the one page it has.
      return res.status(200).end(renderPreviewPage(config, "home"));
    }
    return res.status(200).end(renderPreviewPage(config, pageKey));
  }

  // Legacy fallback: no rich config yet, just the old single-image page.
  return res.status(200).end(
    renderLegacyImageProposal({
      name: fields[F.NAME],
      mockupUrl: fields[F.MOCKUP_LINK],
      businessParam: fields[F.NAME] || ""
    })
  );
}
