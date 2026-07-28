// ============================================================
// GET /api/unsubscribe?slug=...
//
// CASL requires every commercial electronic message to include a
// working unsubscribe mechanism. This is that mechanism: it marks
// the prospect "No contactar" in Airtable so send-proposal.mjs skips
// them on every future run, and shows a plain confirmation page.
//
// Required env vars: AIRTABLE_API_KEY, AIRTABLE_BASE_ID.
// ============================================================

import { findByField, updateRecord } from "../leadgen/lib/airtable.mjs";
import { F, STATUS } from "../leadgen/lib/fields.mjs";

function renderPage(message) {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>GABAN Solutions</title></head>
<body style="font-family: system-ui, sans-serif; text-align:center; padding: 4rem 1rem;">
  <h1>GABAN Solutions</h1>
  <p>${message}</p>
</body></html>`;
}

export default async function handler(req, res) {
  const slug = (req.query?.slug || "").toString().trim();
  res.setHeader("Content-Type", "text/html; charset=utf-8");

  if (!slug) {
    return res.status(400).end(renderPage("Missing reference — nothing to unsubscribe."));
  }

  try {
    const record = await findByField(F.SLUG, slug);
    if (record) {
      await updateRecord(record.id, { [F.PIPELINE_STATUS]: STATUS.DO_NOT_CONTACT });
    }
  } catch {
    return res.status(500).end(renderPage("Something went wrong. Reply to any of our emails and we'll remove you manually."));
  }

  return res.status(200).end(renderPage("You've been unsubscribed and won't receive further emails from us about this."));
}
