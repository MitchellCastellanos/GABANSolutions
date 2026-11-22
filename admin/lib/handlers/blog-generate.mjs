// POST /api/admin/blog/generate { slug } — writes the article with the
// shared Claude client (ai/lib/blog-draft.mjs) from the post's saved
// Topic/Category/City, saves it as a DRAFT via the same updatePostContent
// the manual paste flow uses, and returns the validator's verdict.
// Never publishes. Without ANTHROPIC_API_KEY the manual copy-paste flow
// keeps working unchanged.

import { requireAdmin } from "../auth.mjs";
import { getPostContent, updatePostContent } from "../../../blog/lib/post-content.mjs";
import { generateBlogDraft } from "../../../ai/lib/blog-draft.mjs";
import { isAiConfigured } from "../../../ai/lib/claude.mjs";
import { takeDailyBudget } from "../../../ai/lib/guards.mjs";

export async function handleBlogGenerate(req, res) {
  if (!requireAdmin(req, res)) return;

  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }
  if (!isAiConfigured()) {
    return res.status(501).json({ ok: false, error: "ANTHROPIC_API_KEY is not set — use the copy-paste prompt above instead." });
  }

  const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : (req.body || {});
  const slug = (body.slug || "").toString().trim();
  if (!slug) return res.status(400).json({ ok: false, error: "Missing slug" });
  if (!takeDailyBudget(Number(process.env.BLOG_AI_DAILY_CAP) || 30, new Date(), "blog")) {
    return res.status(429).json({ ok: false, error: "Daily AI draft limit reached." });
  }

  try {
    const post = await getPostContent(slug);
    if (post.status === "published") {
      return res.status(409).json({ ok: false, error: "Post is already published — refusing to overwrite it with a generated draft." });
    }
    const { draft, validation } = await generateBlogDraft({
      slug, topic: post.topic || post.title, categoryKey: post.categoryKey, city: post.city
    });
    await updatePostContent(slug, draft);
    return res.status(200).json({ ok: true, result: { slug, saved: true, validation, blogUrl: post.blogUrl } });
  } catch (err) {
    return res.status(400).json({ ok: false, error: err.message });
  }
}
