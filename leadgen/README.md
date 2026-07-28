# Lead Radar — Outbound Prospecting System

Finds local businesses on Google Maps that are good candidates for a new
website, scores them, and runs the outbound conversion flow: prospect
found → mockup (manual) → **cold call** (manual — this is the real
unlock) → email with the proposal link → automated follow-ups. Internal
tool only — this file is the operational reference.

Field names and pipeline statuses are defined in `leadgen/lib/fields.mjs`
(all English, to match the Airtable schema).

## Pipeline stages (Airtable `Prospects` table)

```
Prospected → Qualified → Mockup Ready (manual — this is your call queue)
  → [HUMAN COLD-CALLS] → log Call Outcome:
      "Interested"        → set status "Called - Interested" → script emails
                             the proposal link, moves to "Proposal Sent"
      "Not interested"     → set status "Not Interested" (closed, lost)
      "No answer" /
      "Voicemail" /
      "Asked to call back" → set status "Call Back Later", try again in a
                             day or two — nothing automated retries this
  → Proposal Sent → Replied → [hands off to docs/LEAD_PROCESS.md:
      Contacted → ... → Won/Lost]
  → No Response (auto-archived after 3 follow-ups + 7 more days silent)
  → Discarded (disqualified by scoring — closed business or no way to contact)
  → Do Not Contact (unsubscribed via /api/unsubscribe)
```

**The cold call is the actual first touch, not an email.** Nothing sends
automatically when a prospect hits "Mockup Ready" — that status is just
your daily call list (sort by Score in Airtable, work top-down). The
email automation in `send-proposal.mjs` only starts *after* a human logs
a call as "Called - Interested"; it exists to deliver the link you told
them about on the phone and to keep following up if they go quiet, not
to replace the call.

### Cold call script (starting point)

> Hi, is this {{Name}}? I'm calling from GABAN Solutions — we put
> together a free website concept for {{Business Name}} after finding
> you on Google Maps, no cost, no obligation. I'm sending you the link
> right now so you can see it — do you have a couple minutes this week
> to talk through it if you like what you see?

Log the result immediately in Airtable (`Call Date`, `Call Outcome`,
optionally `Call Notes`) before moving to the next call — that's what
drives everything downstream.

## Generating a real, navigable preview (not a static image)

`https://gabansolutions.ca/preview/:slug` renders a real mini-website
built from data already in Airtable — not a screenshot or an uploaded
image. Every fresh preview is **3 real, separate pages** with a working
nav bar between them:

- `/preview/:slug` — Home
- `/preview/:slug/services` — the category's middle page. The URL
  segment is always `services`, but what it's *called* in the nav
  depends on the business category (`middlePageLabel` in each
  `leadgen/templates/<category>/index.mjs`): "Services" for most,
  "Menu" for restaurants, "Programs" for gyms, "Practice Areas" for
  lawyers.
- `/preview/:slug/contact` — Contact, with an embedded Google Maps pin
  for the business address.

It's driven by a JSON config (`Preview Config JSON`, now shaped as
`{ business, branding, pages: { home, services, contact } }`) and a
small library of category templates in `leadgen/templates/` — see
`leadgen/lib/preview-render.mjs` for how a page key resolves to HTML
and `api/preview/[...segments].js` for the routing.

**Previews generated before this multi-page system still work
unchanged** — a config with no `pages` key (content directly on it,
the old flat shape) renders as a single page with no nav bar, exactly
as it always did. Nothing already in the pipeline breaks; see "Legacy
previews" below.

**From a phone, no terminal**: open `https://gabansolutions.ca/leadgen-admin.html`
— paste your access token once (it's the same value as the `CRON_SECRET`
env var in Vercel; get it from whoever set up the project, it's saved on
the device after the first time), paste the prospect's `Slug`, and work
through its 3 steps. Setting `Pipeline Status` (step 6 below) still
happens in the Airtable mobile app — no code editor needed there either.

```
1. Generate the draft
     npm run leadgen:generate-preview -- --slug=<slug>
     (or the "Generate preview" button on leadgen-admin.html)
     -> reads Name/Phone/Address/City/Category/Rating/Review Count/Signals
        from Airtable, guesses a template category (leadgen/templates/registry.mjs),
        writes a draft "Preview Config JSON" + Preview Status = "draft"

2. Write the content — the fast way (no design/writing work):
     leadgen-admin.html builds **one prompt that covers all 3 pages at
     once** — pre-filled with the business's real data (name, category,
     city, rating, detected site problems) and the category's actual
     middle-page label (e.g. "Menu" for a restaurant) — and asks for
     the reply in a `PAGE: home` / `PAGE: services` / `PAGE: contact`
     block format, each with its own HEADLINE/SUBHEADLINE/ABOUT/
     VALUEPROPS or INTRO/SERVICES fields. Copy that single prompt into
     ChatGPT (or any chat model), paste the whole reply back into the
     one response box, add a Logo URL / Primary Color / Secondary
     Color (see "Logo & brand colors" below — these are shared across
     every page, filled in once) and photo URLs (one per line), tap
     "Save content" — it merges each page's block into the matching
     page in the same Preview Config JSON and also writes Logo
     URL/Primary Color/Secondary Color as their own Airtable columns,
     so it's all visible from the Airtable row too, not just inside
     the JSON.
     -> the same thing works from the CLI/Airtable directly: edit the
        "Preview Config JSON" field by hand if you'd rather not use
        ChatGPT for a given prospect — just edit inside the right
        `pages.<key>.content` block.
     -> for a legacy single-page preview (no `pages` key), the admin
        page automatically falls back to the old one-block prompt/save
        flow — no PAGE markers, same as before this system existed.

3. Open https://gabansolutions.ca/preview/<slug> any time to check the
   home page (or .../services, .../contact for the other two) — draft
   previews render with a yellow "INTERNAL REVIEW" banner on every page
   so nobody confuses them for something already sent.

4. Validate & approve
     npm run leadgen:validate-preview -- --slug=<slug> --approve
     (or the "Validate & approve" button on leadgen-admin.html)
     -> checks every page (home/services/contact), printing errors
        (lorem ipsum, dead CTA links, fake phone numbers, a page
        missing its headline, etc. — prefixed with which page when
        there's more than one) and warnings (few services, no photos,
        no reviews); only approves — sets Preview Status = "approved"
        — with zero errors

5. Only now set Pipeline Status = "Mockup Ready" — that's still your
   call queue exactly as before. send-proposal.mjs refuses to email
   anything that isn't Preview Status "approved" (or, for prospects
   from before this system existed, that doesn't at least have the
   old-style Mockup Link image set).
```

A note on step 2: ChatGPT is drafting plausible, category-typical copy
grounded in the business's real name/city/category — it's not
verifying facts about that specific business. The prompt tells it not
to invent certifications, awards, or specific claims, but you're still
the one who reads the output before approving (step 4 exists
specifically so nothing gets sent unreviewed).

**Templates today**: all 9 categories in `leadgen/config/targets.json`
have a dedicated template (`dentist`, `lawyer`, `general-contractor`,
`spa`, `restaurant`, `real-estate`, `gym`, `veterinary`, `car-repair`),
falling back to a neutral `generic` template for anything else —
`leadgen/templates/registry.mjs`. Category resolution prefers the
`Category Key` field (written by `prospect.mjs` from
`targets.json`'s `templateCategory`, exact match) and only falls back
to fuzzy-matching the French `Category` label
(`guessCategoryKey()`) for older records prospected before that field
existed. Each template also exports `middlePageLabel` (`{ fr, en }`)
— what the second page is called in the nav for that category.

**Visual variety**: each template has 2 palette variants and 2
section-order variants, plus a shared split/centered/overlap hero
choice (3 layouts, `templates/shared/blocks/hero.mjs`) —
`generate-preview.mjs` picks between them **deterministically** from
a hash of the slug (same business always renders the same way, but
two dentists don't look identical just because they share a
template). Pages also aren't static anymore: sections fade/slide in
on scroll and cards/buttons/photos have real hover states
(`templates/shared/shell.mjs`) — small things, but they're what make
a page feel like a built site instead of a static mockup image. None
of this replaces using each business's real data, which is still what
does the most work to avoid looking generic.

**Logo & brand colors — the easy way to personalize without touching
the JSON**: fill in the flat `Logo URL`, `Primary Color`, `Secondary
Color` fields on the prospect's Airtable row (hex codes, e.g.
`#0b3d63`), then run `generate-preview.mjs` again. A good way to get
those values without any design work: screenshot the business's
Facebook/Instagram page or website and ask ChatGPT (or any
vision-capable model) *"what are the 2 main brand colors here, as hex
codes, and is there a clean logo image I could grab?"* — paste the hex
codes into those 2 fields and a hosted image URL into `Logo URL`.
**Re-running `generate-preview.mjs` after a config already exists is
safe** — it only refreshes `business.logo`/`branding.primaryColor`/
`branding.secondaryColor` from those 3 fields and leaves any
hand-edited services/photos/reviews/copy completely alone.

**Photos**: deliberately manual for now. Google Places *does* return
photo references, but turning one into an image URL requires putting
the Google API key in the URL — which would leak into the page's HTML
if used directly, so `generate-preview.mjs` doesn't do it. Host photos
yourself (Imgur, etc., same as the old `Mockup Link` workflow) and
paste the URL into `business.photos` in the JSON. A server-side photo
proxy that fetches Places photos without exposing the key is future
work, not built yet.

**Common mistake: page links instead of direct image links.** Imgur
album/gallery pages (`imgur.com/a/...`, `imgur.com/gallery/...`),
Google Photos/Drive share links, and Facebook/Instagram links all show
an HTML page around the image, not the raw file — pasted into
`business.photos`/`business.logo` they render as a broken image.
`validate-preview.mjs` catches these and blocks approval with a clear
error before you find out visually. The fix: open the image on its
own (in Imgur, click the photo, right-click → "Copy image address"),
you want a URL starting with `i.imgur.com` and ending in
`.jpg`/`.jpeg`/`.png`/`.gif` — no surrounding page UI when you open it
directly.

**Reopening `leadgen-admin.html` after closing it / switching
prospects**: your token and last-used slug are remembered
(`localStorage`), and the page automatically re-loads whatever's
already saved for that slug — a per-page summary (headline/
subheadline/about/intro/services for each of home/services/contact),
plus pre-filling Logo URL/Primary Color/Secondary Color/photo fields
(shared across every page) — nothing is lost by closing the tab. Use
the "Load existing content" button to do the same for a different
slug, or any time you want to double-check what's currently saved.

**Legacy previews**: two tiers, both still work. A prospect with a
`Preview Config JSON` from before the multi-page system (no `pages`
key) still renders as a single page with no nav bar, at its original
URL. A prospect with only the old `Mockup Link` image and no `Preview
Config JSON` at all still renders the old single-image proposal page.
Nothing already in the pipeline breaks either way.

**Archiving**: once a prospect's `Pipeline Status` lands on `No
Response`, `Not Interested`, `Discarded`, or `Do Not Contact`, the
weekly run (`archive-previews.mjs`) flips their `Preview Status` to
`archived` automatically — the deal's dead, no point leaving it
"approved" forever. The page keeps rendering at the same URL (with the
same "internal review" banner draft previews get, just saying `status:
archived`) — nothing gets deleted, it just stops looking live.

## Required Airtable fields (table name: `Prospects`, or set `AIRTABLE_TABLE`)

| Field | Type | Written by |
|---|---|---|
| Name | Single line text | prospect.mjs |
| Phone | Single line text | prospect.mjs |
| Email | Email | **manual** — Places API doesn't return emails, see below |
| Website | URL | prospect.mjs |
| Category | Single line text | prospect.mjs |
| Category Key | Single line text | prospect.mjs — canonical template key from `targets.json`'s `templateCategory` |
| City | Single line text | prospect.mjs |
| Address | Single line text | prospect.mjs |
| Rating | Number | prospect.mjs |
| Review Count | Number | prospect.mjs |
| Business Status | Single line text | prospect.mjs |
| Google Place ID | Single line text | prospect.mjs |
| Slug | Single line text | prospect.mjs |
| Site Audit JSON | Long text | enrich.mjs |
| Score | Number | score.mjs |
| Bucket | Single line text | score.mjs |
| Signals | Long text | enrich.mjs, score.mjs |
| Pipeline Status | Single select | all scripts |
| Mockup Link | URL | **manual** |
| Proposal Link | URL | send-proposal.mjs |
| First Viewed | Date | api/preview/[...segments].js |
| First Email Date | Date | send-proposal.mjs |
| Last Follow-up Date | Date | send-proposal.mjs |
| Follow-ups Sent | Number | send-proposal.mjs |
| Call Date | Date | **manual** — log right after each cold call |
| Call Outcome | Single select | **manual** |
| Call Notes | Long text (optional) | **manual** |
| Preview Config JSON | Long text | generate-preview.mjs (creates), **manual** (edits) |
| Preview Status | Single select | generate-preview.mjs, validate-preview.mjs |
| Preview Template | Single line text | generate-preview.mjs |
| Preview Views | Number | api/preview/[...segments].js |
| Preview Last Viewed | Date | api/preview/[...segments].js |
| Logo URL | URL | **manual** — see "Logo & brand colors" below |
| Primary Color | Single line text (hex) | **manual** |
| Secondary Color | Single line text (hex) | **manual** |

**Pipeline Status options** (single select — add every value exactly):

`Prospected`, `Qualified`, `Mockup Ready`, `Called - Interested`,
`Call Back Later`, `Not Interested`, `Proposal Sent`, `Replied`,
`No Response`, `Discarded`, `Do Not Contact`

**Call Outcome options** (single select — add every value exactly):

`Interested`, `Not interested`, `No answer`, `Voicemail`,
`Asked to call back`

**Preview Status options** (single select — add every value exactly):

`draft`, `in_review`, `approved`, `archived`

**Known gap: no email address.** Google Places doesn't return business
emails, only phone/website. Until an email-finder step is added, someone
needs to fill in the `Email` column by hand (from the business's website
contact page, or a tool like Hunter.io) for any prospect you actually want
`send-proposal.mjs` to email — the script skips records with no usable
`Email` field. This is intentionally a manual checkpoint: it's also a
natural moment to sanity-check the score before spending outreach effort.

## One-time setup

1. **Google Cloud** — enable **Places API (New)** and (optionally)
   **PageSpeed Insights API**. Restrict the key by API.
2. **Airtable** — create a base with the `Prospects` table and fields
   above. Get the base ID (`app...`) and a personal access token.
3. **Resend** — verify the `gabansolutions.ca` sending domain, get an API key.
4. Copy `leadgen/.env.example` values into Vercel's Environment Variables
   (Project Settings). Generate a random `CRON_SECRET`.

## Running manually (before trusting the cron)

```bash
npm run leadgen:prospect -- --dry-run   # then without --dry-run
npm run leadgen:enrich
npm run leadgen:score
npm run leadgen:send -- --dry-run       # then without --dry-run
npm run leadgen:generate-preview -- --slug=<slug>
npm run leadgen:validate-preview -- --slug=<slug> [--approve]
npm run leadgen:archive-previews -- --dry-run   # then without --dry-run
```

Edit `leadgen/config/targets.json` to change categories/areas without
touching code. Edit the weights in `leadgen/lib/scoring.mjs` (pure
function, easy to test) if the bucket cutoffs need tuning — try it against
5-10 businesses you already know before trusting it at scale.

## Automation

Split across two schedulers on purpose — the account is on **Vercel
Hobby**, which caps cron jobs (few jobs, daily-only frequency) and caps
serverless function execution time, and the weekly prospect → enrich →
score run is too slow for that (PageSpeed audits alone can take several
seconds per site).

- **Weekly (GitHub Actions, `.github/workflows/leadgen-weekly.yml`)**:
  prospect → enrich → score → archive-previews, every Monday, run as
  plain `node` scripts with no timeout ceiling. Needs these set as
  **GitHub repo secrets**
  (Settings → Secrets and variables → Actions) — same values as the
  Vercel env vars: `AIRTABLE_API_KEY`, `AIRTABLE_BASE_ID`,
  `AIRTABLE_TABLE`, `GOOGLE_PLACES_API_KEY`, `GOOGLE_PAGESPEED_API_KEY`.
  Trigger it manually any time from the Actions tab ("Run workflow") to
  backfill without waiting for Monday.
- **Daily (Vercel Cron, `vercel.json`)**: `api/cron/send-proposal.js`
  only — one cron job, well inside the Hobby limit. Sends the proposal
  email for anything marked "Called - Interested" and runs the day
  3/7/14 follow-up checks for everything "Proposal Sent". Never touches
  "Mockup Ready" — that stage waits for a human to call.

`api/cron/prospect.js`, `api/cron/enrich.js`, `api/cron/score.js`,
`api/cron/archive-previews.js` still exist and work (same
`CRON_SECRET` bearer-token auth) if you'd rather trigger a single step
over HTTP instead of from GitHub Actions — they're just not wired into
`vercel.json`'s `crons` list anymore.

If the project ever moves to Vercel Pro, the weekly steps can move back
into `vercel.json` crons the same way `send-proposal` is wired now.

## CASL compliance (Canada's Anti-Spam Law)

Every outbound email must identify the sender and include a working
unsubscribe link — both are baked into `leadgen/lib/email.mjs`
(`caslFooter`) and `api/unsubscribe.js`. Don't remove them, and don't
reuse these templates for anything that isn't this B2B "we researched
your public business listing" context — that's the basis CASL's implied
consent relies on here.

## How this connects to the existing manual process

Once a prospect replies to an email, move their Airtable status to
`Replied` and take it from there using the process already documented
in `docs/LEAD_PROCESS.md` (2-hour SLA, Contacted → Qualifying → Proposal
Sent → Won/Lost). This system only owns getting a reply — everything
after that is the existing playbook.

## Future ideas (not planned, not promised — just notes for later)

Nothing below this line is scheduled. It's what's left over from the
original design pass, kept here so it's not forgotten if it ever
becomes worth building — not a roadmap. Most of it depends on having
real usage data first, which doesn't exist yet.

- **Photo proxy**: a server-side route that fetches Google Places
  photos without putting the API key in the page's HTML, so
  `business.photos` could populate automatically instead of by hand.
- **Richer content editor**: `leadgen-admin.html` covers the common
  case (ChatGPT-drafted headline/subheadline/about/services + logo +
  colors + photos). It doesn't expose everything the JSON supports
  (reviews, section order, hero variant) — a fuller form is still a
  possible later step if the common case stops being enough.
- **CTA/phone click tracking**: right now only page views are
  recorded (`Preview Views`, `Preview Last Viewed`). Knowing whether
  someone actually clicked "call" or the CTA would need a small
  client-side beacon and 1-2 more Airtable fields.
- **Data-driven personalization**: using `meta.personalizationScore`
  or actual reply/conversion rates to influence which variant gets
  picked, instead of a fixed hash of the slug. Needs real conversion
  data to mean anything.
- **Direct LLM API instead of copy-paste**: `leadgen-admin.html`'s
  ChatGPT step is manual copy/paste on purpose — wiring a model API
  directly into `generate-preview.mjs` would remove that step, at the
  cost of an API key/cost to manage and one less human glance at the
  copy before it's saved. Worth it if the copy-paste step becomes the
  bottleneck, not before.
- **AI-assisted copy, further**: `valuePropsFromSignals()` is still
  rule-based, not LLM-based. Could feed `auditContext` into a model for
  richer phrasing. Would still need a human to
  review before approval — never auto-approve generated copy.
- **Smarter photo selection**: picking the *best* available photos
  instead of just the first few, once there's a real photo pipeline.
