// ============================================================
// Blog drafts via the shared Claude client (roadmap item 5). Replaces
// the copy-paste-into-a-chat step; the prompt rules still come from
// blog/lib/prompt.mjs so there is ONE source of truth.
//
// Safety: the body is sanitized to a small tag allowlist before it can
// reach Airtable/the public blog, and the result is only ever saved as
// a draft — publishing stays a separate, validated, human step.
// ============================================================

import { callClaudeJson } from "./claude.mjs";
import { clean } from "./guards.mjs";
import { buildBlogInstructions } from "../../blog/lib/prompt.mjs";
import { validateBlogPost } from "../../blog/lib/post-schema.mjs";

const SCHEMA = {
  type: "object",
  properties: {
    title: { type: "string", description: "Specific headline, ideally under 60 characters." },
    meta_description: { type: "string", description: "70-160 characters, for the Google snippet." },
    h1: { type: "string", description: "On-page headline." },
    excerpt: { type: "string", description: "One or two sentence teaser, plain text." },
    body_html: { type: "string", description: "Article body as an HTML fragment using only h2, h3, p, ul, ol, li, strong, em, a. No html/head/body/title tags." }
  },
  required: ["title", "meta_description", "h1", "excerpt", "body_html"]
};

const ALLOWED = new Set(["h2", "h3", "p", "ul", "ol", "li", "strong", "em", "a", "br"]);

export function sanitizeBodyHtml(html) {
  let s = String(html || "")
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<(script|style|iframe|object|embed|svg|math|form|template)\b[\s\S]*?<\/\1\s*>/gi, "");
  s = s.replace(/<\/?([a-zA-Z][a-zA-Z0-9]*)\b([^>]*)>/g, (full, name, attrs) => {
    const tag = name.toLowerCase();
    const closing = full.startsWith("</");
    if (!ALLOWED.has(tag)) return "";
    if (closing) return `</${tag}>`;
    if (tag === "a") {
      const m = attrs.match(/\bhref\s*=\s*(?:"([^"]*)"|'([^']*)')/i);
      const href = (m && (m[1] ?? m[2]) || "").trim();
      return /^https?:\/\/[^\s"'<>]+$/i.test(href) ? `<a href="${href}" rel="noopener">` : "";
    }
    return tag === "br" ? "<br>" : `<${tag}>`;
  });
  // drop any dangling "<" that survived so nothing can start a new tag
  return s.replace(/<(?![/a-zA-Z])/g, "&lt;").trim();
}

function openAnchorsBalanced(html) {
  return (html.match(/<a\b/g) || []).length === (html.match(/<\/a>/g) || []).length;
}

export async function generateBlogDraft({ slug, topic, categoryKey, city }, { call = callClaudeJson } = {}) {
  if (!topic) throw new Error("topic is required");
  const out = await call({
    system: "You write blog articles for GABAN Solutions. Follow the user's rules exactly. Respond only through the tool.",
    user: buildBlogInstructions({ topic, categoryKey, city }),
    schema: SCHEMA,
    toolName: "write_article",
    maxTokens: 4000,
    timeoutMs: 55000
  });

  const draft = {
    title: clean(out.title, 120),
    metaDescription: clean(out.meta_description, 300),
    h1: clean(out.h1, 160),
    excerpt: clean(out.excerpt, 400),
    bodyHtml: sanitizeBodyHtml(out.body_html)
  };
  if (!draft.bodyHtml || !draft.title) throw new Error("Model returned an incomplete article");
  if (!openAnchorsBalanced(draft.bodyHtml)) draft.bodyHtml = draft.bodyHtml.replace(/<\/?a\b[^>]*>/g, "");

  const validation = validateBlogPost({ slug, ...draft });
  return { draft, validation };
}
