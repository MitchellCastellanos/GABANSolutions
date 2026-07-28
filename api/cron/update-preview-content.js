// POST /api/cron/update-preview-content — mobile-friendly content
// save for leadgen-admin.html: merges per-page headline/subheadline/
// about/services/etc (usually pasted in from ChatGPT) plus photos/
// logo/brand colors into the prospect's existing Preview Config JSON.
// Same CRON_SECRET bearer auth as the rest of api/cron/*.
//
// Body: { slug, pages?: { home?: {headline?, subheadline?, about?,
//          valueProps?, reviews?}, services?: {headline?, intro?,
//          services?}, contact?: {headline?, intro?} },
//          photos?: {url, caption?}[], logoUrl?, primaryColor?, secondaryColor? }
import { updatePreviewContent } from "../../leadgen/scripts/update-preview-content.mjs";
import { requireCronAuth } from "../../leadgen/lib/cron-auth.mjs";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }
  if (!requireCronAuth(req, res)) return;

  const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : (req.body || {});
  const { slug, ...patch } = body;
  if (!slug) {
    return res.status(400).json({ ok: false, error: "Missing slug" });
  }

  try {
    const result = await updatePreviewContent(slug, patch);
    return res.status(200).json({ ok: true, result });
  } catch (err) {
    return res.status(500).json({ ok: false, error: err.message });
  }
}
