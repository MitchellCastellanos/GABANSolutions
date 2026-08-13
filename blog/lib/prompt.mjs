// ============================================================
// Builds the one copy-paste prompt for a blog post draft — the CLI's
// copy of the same prompt admin/blog.html builds client-side (that
// page can't import a server .mjs module, so its copy is hand-kept in
// sync the same way admin/previews.html keeps its own prompt builders
// separate from leadgen/scripts/generate-preview.mjs). Keep both in
// sync if you change the format here.
// ============================================================

import { categoryDisplayLabel, cityShort } from "./topics.mjs";

export function buildBlogPrompt({ topic, categoryKey, city }) {
  const audience = categoryKey && city
    ? `owners of ${categoryDisplayLabel(categoryKey).toLowerCase()} in ${cityShort(city)}, QC`
    : categoryKey
      ? `owners of ${categoryDisplayLabel(categoryKey).toLowerCase()} across Canada`
      : "local business owners across Canada";

  return `You are writing a blog article for GABAN Solutions, a Canadian digital agency based in Montreal that builds websites, local SEO, business automations, and practical software (GarageOS, FieldOS) for small local businesses across Canada.

Topic: ${topic}
Target audience: ${audience}
Goal: rank on Google for this topic AND be useful enough that an AI answer engine (ChatGPT, Perplexity, Gemini) would cite it when answering a related question.

Tone: practical and plain-spoken, confident but not hypey, no fluff.

Rules — follow exactly:
- Do NOT invent statistics, studies, client stories, awards, or certifications. General, well-established ideas are fine stated generally (e.g. "mobile-friendly pages tend to perform better in search") — do not attach a specific number or source unless it's extremely well-known and you are certain of it.
- Do NOT name or describe specific GABAN client work or results.
- Do NOT invent facts about any specific business other than GABAN Solutions itself.
- Write for a business owner who is busy and skeptical — be concrete and actionable, not generic.

Structure: a short introduction, 3-5 H2 sections with practical, actionable advice, at least one bulleted or numbered list, and a short conclusion. Once, naturally, near the end, suggest a free consultation with GABAN Solutions and link to https://gabansolutions.ca/contact.html or https://gabansolutions.ca/book.html — one clear sentence, not salesy.

Respond ONLY in this exact format, nothing before or after, no markdown code fences:

TITLE: (a clear, specific headline, ideally under 60 characters)
META_DESCRIPTION: (a compelling 1-2 sentence summary, 70-160 characters, for the Google search snippet)
H1: (the on-page headline — can match TITLE or be a slightly longer/friendlier variant)
BODY:
(the full article body as clean HTML fragment only — use <h2>, <p>, <ul>/<ol><li>, <strong> as needed. No <html>/<head>/<body>/<title> tags.)`;
}
