// GET /api/cron/generate-preview?slug=X — mobile-friendly trigger for
// leadgen/scripts/generate-preview.mjs's generatePreviewForSlug().
// Called from leadgen-admin.html so a preview can be generated from a
// phone without a terminal. Same CRON_SECRET bearer auth as the rest
// of api/cron/*.
import { generatePreviewForSlug } from "../../leadgen/scripts/generate-preview.mjs";
import { requireCronAuth } from "../../leadgen/lib/cron-auth.mjs";

export default async function handler(req, res) {
  if (!requireCronAuth(req, res)) return;

  const slug = (req.query?.slug || "").toString().trim();
  if (!slug) {
    return res.status(400).json({ ok: false, error: "Missing ?slug=" });
  }

  try {
    const result = await generatePreviewForSlug(slug);
    return res.status(200).json({ ok: true, result });
  } catch (err) {
    return res.status(500).json({ ok: false, error: err.message });
  }
}
