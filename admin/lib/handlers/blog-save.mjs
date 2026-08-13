// POST /api/admin/blog/save { slug, title, metaDescription, h1,
// bodyHtml, excerpt, coverImageUrl, canonicalUrl } — saves whatever
// you paste back from ChatGPT/Claude (plus the optional cover image /
// canonical URL fields) into the post's Airtable row. Only touches
// fields actually present in the body, same "safe to re-run" contract
// as leadgen's update-preview-content.mjs.

import { requireAdmin } from "../auth.mjs";
import { updatePostContent } from "../../../blog/lib/post-content.mjs";

export async function handleBlogSave(req, res) {
  if (!requireAdmin(req, res)) return;

  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : (req.body || {});
  const { slug, ...patch } = body;
  if (!slug) return res.status(400).json({ ok: false, error: "Missing slug" });

  try {
    const result = await updatePostContent(slug, patch);
    return res.status(200).json({ ok: true, result });
  } catch (err) {
    return res.status(400).json({ ok: false, error: err.message });
  }
}
