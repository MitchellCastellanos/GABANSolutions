// GET /api/admin/blog/content?slug=... — current saved content for one
// blog post draft, so /admin/blog can re-populate its form after the
// page is closed/reopened. Mirrors api/cron/preview-content (the
// leadgen equivalent), but cookie-gated like every other
// api/admin/* handler (see api/admin/lib/auth.mjs) instead of the
// bearer-token CRON_SECRET leadgen's /admin/previews uses — the
// admin/blog.html page is already behind the same session cookie via
// admin/auth.js, so a second manual token isn't needed here.

import { requireAdmin } from "../lib/auth.mjs";
import { getPostContent } from "../../../blog/lib/post-content.mjs";

export async function handleBlogContent(req, res) {
  if (!requireAdmin(req, res)) return;

  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  const slug = (req.query?.slug || "").toString().trim();
  if (!slug) return res.status(400).json({ ok: false, error: "Missing ?slug=" });

  try {
    const result = await getPostContent(slug);
    return res.status(200).json({ ok: true, result });
  } catch (err) {
    return res.status(404).json({ ok: false, error: err.message });
  }
}
