// GET /api/cron/preview-content?slug=X — read-only counterpart to
// update-preview-content: returns the current saved content for a
// prospect's preview so leadgen-admin.html can re-populate its form
// after the page is closed/reopened (or when switching to a
// different slug), instead of always starting blank. Same
// CRON_SECRET bearer auth as the rest of api/cron/*.
import { getPreviewContent } from "../../leadgen/lib/preview-content-reader.mjs";
import { requireCronAuth } from "../../leadgen/lib/cron-auth.mjs";

export default async function handler(req, res) {
  if (!requireCronAuth(req, res)) return;

  const slug = (req.query?.slug || "").toString().trim();
  if (!slug) {
    return res.status(400).json({ ok: false, error: "Missing ?slug=" });
  }

  try {
    const result = await getPreviewContent(slug);
    return res.status(200).json({ ok: true, result });
  } catch (err) {
    return res.status(500).json({ ok: false, error: err.message });
  }
}
