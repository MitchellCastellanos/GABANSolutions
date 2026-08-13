// POST /api/admin/blog/validate { slug, publish? } — runs
// blog/lib/post-schema.mjs's validator; with publish:true, only sets
// Status "published" (stamping Published Date the first time) if
// there are zero errors. Mirrors leadgen's approve-preview flow —
// warnings never block, only errors do, and nothing publishes
// silently.

import { requireAdmin } from "../lib/auth.mjs";
import { validatePostForSlug } from "../../../blog/scripts/validate-post.mjs";

export async function handleBlogValidate(req, res) {
  if (!requireAdmin(req, res)) return;

  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : (req.body || {});
  const slug = (body.slug || "").toString().trim();
  if (!slug) return res.status(400).json({ ok: false, error: "Missing slug" });

  try {
    const result = await validatePostForSlug(slug, { publish: Boolean(body.publish) });
    return res.status(200).json({ ok: true, result });
  } catch (err) {
    return res.status(400).json({ ok: false, error: err.message });
  }
}
