// ============================================================
// GET /blog/:slug (rewritten from /api/blog/:segments* in
// vercel.json). Renders one post (renderBlogPost) — draft/in_review/
// archived posts still render (so a human can review the real page
// before publishing, same as leadgen previews) but with an
// "INTERNAL REVIEW" banner and X-Robots-Tag: noindex, nofollow set
// per-request; only "published" posts are indexable. This is why
// there is no static noindex rule for /blog/:segments* in
// vercel.json the way there is for /preview and /admin — indexability
// here depends on the individual post's Status, not the route.
//
// The bare /blog listing lives in the sibling ./index.js, NOT here —
// [...segments].js is a "required" catch-all that only ever matches
// ONE OR MORE path segments on Vercel's zero-config Node builder, it
// never matches the parent path with zero segments (confirmed live:
// gabansolutions.ca/blog 404'd until index.js was added). handleIndex
// is exported so index.js can reuse it instead of duplicating the
// Airtable query + render call.
//
// Renders the blog dynamically from Airtable's BlogPosts table — the
// same architectural pattern as api/preview/[...segments].js, and for
// the same reason: Vercel functions have a read-only filesystem in
// production, so there is no way for an admin "Publish" button to
// write a static .html file that would show up on the live site.
// Posts live in Airtable and are rendered on every request instead.
//
// Public reads use a cached published snapshot; views do not write to Airtable.
//
// Required env vars: AIRTABLE_API_KEY, AIRTABLE_BASE_ID.
// ============================================================

import { readPublished, cachePublicResponse } from "../../blog/lib/published.mjs";
import { F, POST_STATUS } from "../../blog/lib/fields.mjs";
import { getPostContent, toPost } from "../../blog/lib/post-content.mjs";
import { renderBlogIndex, renderBlogPost } from "../../blog/lib/post-render.mjs";
import { categoryDisplayLabel } from "../../blog/lib/topics.mjs";


// Same Vercel quirk documented in api/preview/[...segments].js: the
// rewrite -> catch-all binding puts the captured path under the
// literal "...segments" query key, and gives a single segment as a
// plain string instead of a 1-item array.
function extractSegments(query) {
  const raw = query?.["...segments"] ?? query?.segments;
  if (Array.isArray(raw)) return raw.filter(Boolean);
  if (typeof raw === "string" && raw) return raw.split("/").filter(Boolean);
  return [];
}

function renderNotFound(res) {
  res.status(404).setHeader("Content-Type", "text/html; charset=utf-8");
  res.setHeader("X-Robots-Tag", "noindex, nofollow");
  return res.end(`<!DOCTYPE html><html><head><meta charset="utf-8"><title>GABAN Solutions Blog</title></head>
<body style="font-family: system-ui, sans-serif; text-align:center; padding: 4rem 1rem;">
  <h1>Post not found</h1>
  <p>This article may have moved or been unpublished. <a href="/blog">Back to the blog</a>.</p>
</body></html>`);
}


export async function handleIndex(req, res) {
  const { records } = await readPublished();
  const posts = records
    .map((r) => {
      const f = r.fields;
      const categoryKey = f[F.CATEGORY_KEY] || "";
      return {
        slug: f[F.SLUG] || "",
        title: f[F.TITLE] || f[F.TOPIC] || "",
        metaDescription: f[F.META_DESCRIPTION] || "",
        excerpt: f[F.EXCERPT] || "",
        categoryLabel: categoryKey ? categoryDisplayLabel(categoryKey) : "",
        city: f[F.CITY] || "",
        publishedDate: f[F.PUBLISHED_DATE] || null
      };
    })
    .filter((p) => p.slug)
    .sort((a, b) => new Date(b.publishedDate || 0) - new Date(a.publishedDate || 0));

  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.setHeader("X-Robots-Tag", "index, follow");
  cachePublicResponse(res);
  return res.status(200).end(renderBlogIndex(posts));
}

async function handlePost(req, res, slug) {
  const { records, stale } = await readPublished();
  const record = records.find(r => r.fields[F.SLUG] === slug);
  let post;
  if (record) {
    post = toPost(record);
    cachePublicResponse(res);
  } else {
    if (stale) {
      res.setHeader("Cache-Control", "no-store");
      res.setHeader("Retry-After", "3600");
      return res.status(503).end("This article is temporarily unavailable. Please try again later.");
    }
    // Preserve the existing admin review links, but never cache drafts.
    res.setHeader("Cache-Control", "no-store");
    try {
      post = await getPostContent(slug);
    } catch {
      return renderNotFound(res);
    }
  }

  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.setHeader("X-Robots-Tag", post.status === POST_STATUS.PUBLISHED ? "index, follow" : "noindex, nofollow");
  return res.status(200).end(renderBlogPost(post));
}

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  const segments = extractSegments(req.query);
  const slug = (segments[0] || "").toString().trim();

  try {
    if (!slug) {
      return await handleIndex(req, res);
    }
    return await handlePost(req, res, slug);
  } catch (err) {
    console.error("[blog] Request failed:", err);
    res.status(500).setHeader("Content-Type", "text/plain; charset=utf-8");
    return res.end("Something went wrong loading the blog.");
  }
}
