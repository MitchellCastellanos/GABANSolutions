// GET /api/cron/approve-preview?slug=X — mobile-friendly trigger for
// leadgen/scripts/validate-preview.mjs's validatePreviewForSlug().
// Always validates; only approves (writes to Airtable) when there
// are zero blocking errors. Called from leadgen-admin.html. Same
// CRON_SECRET bearer auth as the rest of api/cron/*.
import { validatePreviewForSlug } from "../../leadgen/scripts/validate-preview.mjs";
import { requireCronAuth } from "../../leadgen/lib/cron-auth.mjs";

export default async function handler(req, res) {
  if (!requireCronAuth(req, res)) return;

  const slug = (req.query?.slug || "").toString().trim();
  if (!slug) {
    return res.status(400).json({ ok: false, error: "Missing ?slug=" });
  }

  try {
    const result = await validatePreviewForSlug(slug, { approve: true });
    return res.status(200).json({ ok: true, result });
  } catch (err) {
    return res.status(500).json({ ok: false, error: err.message });
  }
}
