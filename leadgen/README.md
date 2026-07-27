# Lead Radar — Outbound Prospecting System

Finds local businesses on Google Maps that are good candidates for a new
website, scores them, and runs the outbound conversion flow: prospect
found → mockup (manual) → no-price proposal page → email → automated
follow-ups. Internal tool only — see `/root/.claude/plans/...` for the
original design doc, this file is the operational reference.

## Pipeline stages (Airtable `Prospects` table)

```
Prospectado → Calificado → Mockup listo (manual) → Propuesta enviada
  → Respondió → [hands off to docs/LEAD_PROCESS.md: Contacted → ... → Won/Lost]
  → Sin respuesta (auto-archived after 3 follow-ups + 7 more days silent)
  → Descartado (disqualified by scoring — closed business or no way to contact)
  → No contactar (unsubscribed via /api/unsubscribe)
```

## Required Airtable fields (table name: `Prospects`, or set `AIRTABLE_TABLE`)

| Field | Type | Written by |
|---|---|---|
| Nombre | text | prospect.mjs |
| Teléfono | text | prospect.mjs |
| Email | text | **manual** — Places API doesn't return emails, see below |
| Website | text | prospect.mjs |
| Categoría | text | prospect.mjs |
| Ciudad | text | prospect.mjs |
| Dirección | text | prospect.mjs |
| Rating | number | prospect.mjs |
| # Reviews | number | prospect.mjs |
| Business Status | text | prospect.mjs |
| Google Place ID | text | prospect.mjs |
| Slug | text | prospect.mjs |
| Site Audit JSON | long text | enrich.mjs |
| Score | number | score.mjs |
| Bucket | text | score.mjs |
| Señales detectadas | text | enrich.mjs, score.mjs |
| Estado del pipeline | single select | all scripts |
| Link al mockup | url | **manual** |
| Link a la propuesta | url | send-proposal.mjs |
| Primera vista | date | api/preview/[slug].js |
| Fecha de primer email | date | send-proposal.mjs |
| Fecha de último follow-up | date | send-proposal.mjs |
| # de follow-ups enviados | number | send-proposal.mjs |

**Known gap: no email address.** Google Places doesn't return business
emails, only phone/website. Until an email-finder step is added, someone
needs to fill in the `Email` column by hand (from the business's website
contact page, or a tool like Hunter.io) for any prospect you actually want
`send-proposal.mjs` to email — the script skips records with no usable
`Email` field. This is intentionally a manual checkpoint: it's also a
natural moment to sanity-check the score before spending outreach effort.

## One-time setup

1. **Google Cloud** — create a project, enable billing (Google gives a
   monthly free credit), enable **Places API (New)** and (optionally)
   **PageSpeed Insights API**. Restrict the key by API.
2. **Airtable** — create a base with the `Prospects` table and fields
   above. Get the base ID (`app...`) and a personal access token.
3. **Resend** — create an account, verify the `gabansolutions.ca` sending
   domain (SPF/DKIM), get an API key.
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

## Automation (Vercel Cron)

`vercel.json` wires 4 cron jobs, each hitting `api/cron/*.js` which is
just a thin wrapper calling the matching script's `main()`:

- Weekly: prospect → enrich → score (Monday mornings, staggered an hour
  apart so score.mjs runs after enrich.mjs has finished writing).
- Daily: send-proposal (initial sends for anything marked "Mockup listo",
  plus follow-up checks for everything "Propuesta enviada").

**Vercel Hobby plan limits cron jobs** (fewer jobs, daily-only
frequency) — if the account is on Hobby and 4 crons don't fit, drop the
weekly ones from `vercel.json` and trigger `prospect`/`enrich`/`score` by
hand (`npm run leadgen:...`) until upgrading to Pro, or trigger the
`api/cron/*` endpoints from an external scheduler (e.g. a scheduled
GitHub Actions workflow calling them with the `CRON_SECRET` bearer
token).

## CASL compliance (Canada's Anti-Spam Law)

Every outbound email must identify the sender and include a working
unsubscribe link — both are baked into `leadgen/lib/email.mjs`
(`caslFooter`) and `api/unsubscribe.js`. Don't remove them, and don't
reuse these templates for anything that isn't this B2B "we researched
your public business listing" context — that's the basis CASL's implied
consent relies on here.

## How this connects to the existing manual process

Once a prospect replies to an email, move their Airtable status to
"Respondió" and take it from there using the process already documented
in `docs/LEAD_PROCESS.md` (2-hour SLA, Contacted → Qualifying → Proposal
Sent → Won/Lost). This system only owns getting a reply — everything
after that is the existing playbook.
