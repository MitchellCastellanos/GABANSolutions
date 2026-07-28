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

## Required Airtable fields (table name: `Prospects`, or set `AIRTABLE_TABLE`)

| Field | Type | Written by |
|---|---|---|
| Name | Single line text | prospect.mjs |
| Phone | Single line text | prospect.mjs |
| Email | Email | **manual** — Places API doesn't return emails, see below |
| Website | URL | prospect.mjs |
| Category | Single line text | prospect.mjs |
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
| First Viewed | Date | api/preview/[slug].js |
| First Email Date | Date | send-proposal.mjs |
| Last Follow-up Date | Date | send-proposal.mjs |
| Follow-ups Sent | Number | send-proposal.mjs |
| Call Date | Date | **manual** — log right after each cold call |
| Call Outcome | Single select | **manual** |
| Call Notes | Long text (optional) | **manual** |

**Pipeline Status options** (single select — add every value exactly):

`Prospected`, `Qualified`, `Mockup Ready`, `Called - Interested`,
`Call Back Later`, `Not Interested`, `Proposal Sent`, `Replied`,
`No Response`, `Discarded`, `Do Not Contact`

**Call Outcome options** (single select — add every value exactly):

`Interested`, `Not interested`, `No answer`, `Voicemail`,
`Asked to call back`

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
  prospect → enrich → score, every Monday, run as plain `node` scripts
  with no timeout ceiling. Needs these set as **GitHub repo secrets**
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

`api/cron/prospect.js`, `api/cron/enrich.js`, `api/cron/score.js` still
exist and work (same `CRON_SECRET` bearer-token auth) if you'd rather
trigger a single step over HTTP instead of from GitHub Actions — they're
just not wired into `vercel.json`'s `crons` list anymore.

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
