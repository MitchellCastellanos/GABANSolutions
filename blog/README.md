# Blog — Content Engine

GABAN's inbound content marketing pillar: SEO-oriented blog posts
targeting the same local-business niches leadgen already prospects
(`leadgen/config/targets.json` — 9 categories x 3 Montreal-area
cities), plus general posts about GABAN's own services. Built the same
way BabyLoveGrowth-style "AI SEO/GEO" tools work conceptually (publish
content aimed at both Google ranking and being cited by AI answer
engines like ChatGPT/Perplexity/Gemini), but with **no LLM API key** —
content authoring is manual copy/paste into ChatGPT/Claude, exactly
like `/admin/previews` already does for prospect website mockups. See
`leadgen/README.md`'s "Generating a real, navigable preview" section
for the UX pattern this mirrors.

## Why posts live in Airtable, not `.html` files

Vercel serverless functions have a **read-only filesystem in
production** (except `/tmp`, which doesn't persist across
invocations) — there is no build step in this repo, files are served
exactly as committed to git. An admin "Publish" button cannot write a
static `.html` file and have it show up on the live site. This is the
same reason `leadgen`'s prospect previews render dynamically from
Airtable (`api/preview/[...segments].js`) instead of writing files —
blog posts follow the identical pattern:

- **`BlogPosts`** Airtable table stores every post (draft or
  published).
- **`api/blog/[...segments].js`** renders `/blog` (listing) and
  `/blog/:slug` (one post) on every request, straight from Airtable —
  the blog's equivalent of `api/preview/[...segments].js`.
- **`blog/scripts/*.mjs`** are local CLI scripts that read/write
  Airtable — never the filesystem — same as `leadgen/scripts/*.mjs`.

## Workflow

```
1. Pick a topic and start the draft (terminal, once per post):
     npm run blog:new -- --list
     npm run blog:new -- --pick=<n>
     (or npm run blog:new -- --category=<key> --city="Laval, QC")
     (or npm run blog:new -- --topic="Freeform title")
     -> writes a draft row to Airtable (Status: draft, everything
        else blank except Topic/Category Key/City) and prints the
        slug + the one copy-paste prompt for step 2.

2. Write the content — the fast way (no writing work):
     Open https://gabansolutions.ca/admin/blog (password-gated behind
     the shared /admin login — see docs/ADMIN.md), enter the slug from
     step 1 (or tap it in "Recent posts"), tap "Load existing
     content" to rebuild the prompt from the post's topic/category/
     city. Copy that prompt into ChatGPT or Claude, paste the whole
     reply (a TITLE: / META_DESCRIPTION: / H1: / BODY: block) back
     into the response box, optionally add a cover image URL, tap
     "Save draft" — it parses the block and writes Title/Meta
     Description/H1/Body HTML to the post's Airtable row. Safe to
     repeat: re-loading pre-fills the same box in the same format so
     you can either tweak wording by hand or paste a fresh reply over
     it.
     -> the same thing works by editing the Airtable row directly if
        you'd rather not use the admin page for a given post.

3. Open https://gabansolutions.ca/blog/<slug> any time to check the
   real rendered page — draft/in_review posts render with a yellow
   "INTERNAL REVIEW" banner and a noindex header so nobody confuses
   them with something already public.

4. Validate & publish
     npm run blog:validate -- --slug=<slug> --publish
     (or the "Validate" button + "Also publish" checkbox on /admin/blog)
     -> checks for placeholder text, missing title/meta description/
        body, dead links, thin content, etc. (errors) plus SEO
        nits like title/meta length (warnings) — only publishes
        (Status -> "published", stamps Published Date) with zero
        errors. Warnings don't block, they're the reviewer's call.
```

A note on step 2: the model is drafting plausible, category-typical
advice grounded in the real topic/audience — it's not fact-checking
itself. The prompt explicitly tells it not to invent statistics,
client stories, awards, or certifications, and never to describe
specific GABAN client work — but you're still the one who reads the
output before publishing (step 4 exists specifically so nothing goes
live unreviewed, same philosophy as the preview approval gate and the
"never auto-approve generated copy" note in `leadgen/README.md`).

## Required Airtable fields (table name: `BlogPosts`, or set `AIRTABLE_BLOG_TABLE`)

| Field | Type | Written by |
|---|---|---|
| Slug | Single line text | blog:new (unique, kebab-case + random suffix) |
| Topic | Single line text | blog:new — the working title/angle picked before content exists |
| Category Key | Single line text (optional) | blog:new — canonical key from `leadgen/config/targets.json`'s `templateCategory`, e.g. `dentist` |
| City | Single line text (optional) | blog:new — e.g. "Laval, QC" |
| Title | Single line text | /admin/blog save (parsed from the model's `TITLE:` line) |
| Meta Description | Long text | /admin/blog save (parsed from `META_DESCRIPTION:`) |
| H1 | Single line text | /admin/blog save (parsed from `H1:`) |
| Body HTML | Long text | /admin/blog save (parsed from `BODY:`) — an HTML fragment (`<h2>`/`<p>`/`<ul>`/etc.), no `<html>`/`<body>` wrapper |
| Excerpt | Long text (optional) | **manual** — short teaser for the listing page; falls back to Meta Description if blank |
| Cover Image URL | URL (optional) | **manual** — see "Common mistake" note below (same page-link-vs-direct-image trap as leadgen previews) |
| Canonical URL | URL (optional) | **manual** — leave blank unless this content is republished from elsewhere |
| Author | Single line text | blog:new (defaults "GABAN Solutions") |
| Status | Single select | blog:new (creates as "draft"), /admin/blog validate/publish |
| Published Date | Date | /admin/blog publish (stamped once, first time only) |
| Updated Date | Date | /admin/blog save |
| Views | Number | api/blog/[...segments].js |
| Last Viewed | Date | api/blog/[...segments].js |

**Status options** (single select — add every value exactly):

`draft`, `in_review`, `published`, `archived`

Only `published` posts appear in the `/blog` listing, the dynamic
`/blog-sitemap.xml`, and render with an `index, follow` robots header.
Every other status still renders at its real `/blog/:slug` URL (so a
human can proofread the actual page, not a preview) but with an
"INTERNAL REVIEW" banner and `noindex, nofollow` — decided per-request
from that post's own `Status`, not from a blanket route rule (see
"Sitemap & indexability" below for why).

**Common mistake: page links instead of direct image links.** Same
trap `leadgen/README.md` documents for preview photos — an
Imgur *album* page (`imgur.com/a/...`), a Google Photos/Drive share
link, or a Facebook/Instagram link all show an HTML page around the
image, not the raw file. Pasted into `Cover Image URL` it renders as a
broken image. `blog/lib/post-schema.mjs` only checks that the value
looks like a URL, not that it's a *direct* image — double-check by
opening the link yourself before saving.

## Sitemap & indexability

`sitemap.xml` used to be a single static `<urlset>` file. Blog posts
are dynamic (Airtable-backed, changing without a git commit), so a
static file can't list them. The fix:

- `sitemap.xml` is now a `<sitemapindex>` referencing two sub-sitemaps.
- `sitemap-pages.xml` is the old static `<urlset>` content, unchanged
  (every hand-authored `.html` page), plus one new entry for `/blog`
  itself (the listing page).
- `/blog-sitemap.xml` (`api/blog-sitemap.xml.js`) is generated on
  every request from Airtable, listing only `published` posts.

`scripts/seo-audit.mjs` was updated to check pages against
`sitemap-pages.xml` (not `sitemap.xml`, which no longer contains
individual `<loc>` entries) — it can't see the dynamic blog sitemap,
which is expected, blog posts aren't hand-authored `.html` files.

**Deliberately no static `X-Robots-Tag` header rule for `/blog/:segments*`
in `vercel.json`** (unlike `/preview` and `/admin`, which are
uniformly `noindex`). Indexability here depends on each individual
post's `Status`, not the route — `api/blog/[...segments].js` sets
`index, follow` or `noindex, nofollow` per response instead. Adding a
blanket static header on top would risk two conflicting
`X-Robots-Tag` values on the same response for draft posts.

## One-time setup

1. **Airtable** — create the `BlogPosts` table with the fields above,
   in the same base leadgen/booking already use. Add every `Status`
   option exactly as listed.
2. Copy `AIRTABLE_BLOG_TABLE=BlogPosts` (or your chosen table name)
   into Vercel's Environment Variables — see
   `leadgen/.env.example`. Reuses the existing `AIRTABLE_API_KEY` /
   `AIRTABLE_BASE_ID`, no new credentials needed.
3. Nothing else — `/admin/blog` reuses the existing `/admin` password
   gate (`ADMIN_PASSWORD`, see `docs/ADMIN.md`), no separate token.

## Running manually

```bash
npm run blog:new -- --list
npm run blog:new -- --pick=<n> [--dry-run]
npm run blog:new -- --category=<key> --city="Laval, QC" [--angle=0-3] [--dry-run]
npm run blog:new -- --topic="Freeform title" [--category=<key>] [--city="..."] [--dry-run]
npm run blog:validate -- --slug=<slug> [--publish]
```

Edit `blog/lib/topics.mjs`'s `CATEGORY_DISPLAY_LABEL` map or
`GENERAL_TOPICS` list to change how topics are suggested — it reads
categories/cities straight from `leadgen/config/targets.json`, so
that file stays the single source of truth for the category/area
list; nothing here duplicates it.

## Difference from `/admin/previews`'s auth

`/admin/previews`'s API calls (`/api/cron/*`) are gated by a
bearer-token `CRON_SECRET` (see `leadgen/lib/cron-auth.mjs`), pasted
into the page once and remembered in `localStorage`, because those
routes are shared with Vercel Cron itself. `/admin/blog`'s API calls
(`/api/admin/blog/*`) live under `api/admin/*` instead, gated by the
same session-cookie `requireAdmin()` guard every other `/admin/*` API
already uses (`api/admin/lib/auth.mjs`) — the page is already behind
that cookie via `admin/auth.js`, so a second manual token would be
redundant. Only the post `slug` is remembered in `localStorage`.

## Future ideas (not planned, not promised — just notes for later)

- **Category/city facets on the listing page**: right now `/blog` is
  one flat list; filtering by category or city would help once there
  are enough posts to need it.
- **Tags / related posts**: no tagging system yet — `Category Key` +
  `City` are the only structured metadata.
- **Direct LLM API instead of copy-paste**: same tradeoff noted in
  `leadgen/README.md` for previews — worth it if the copy-paste step
  becomes the real bottleneck, not before.
- **Archiving old posts**: no automatic "archive after N months"
  sweep yet (leadgen's `archive-previews.mjs` has one for previews) —
  flip `Status` to `archived` by hand for now.
