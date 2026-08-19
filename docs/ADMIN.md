# Admin area (`/admin`)

One password-gated entry point for every internal tool — no more
separate ungated pages like the old `leadgen-admin.html`.

- **`/admin`** — hub with links to the tools below.
- **`/admin/bookings`** — view upcoming appointments booked through
  `/book.html`, cancel one, or manually add/block a time.
- **`/admin/previews`** — the outbound Lead Radar tool (generate/write/
  approve prospect website previews), formerly at `/leadgen-admin.html`.
  Old bookmarks to that URL redirect here automatically.
- **`/admin/blog`** — write/validate/publish blog posts, rendered live
  from Airtable at `/blog/<slug>`. See `blog/README.md`.
- **`/admin/analytics`** — business acquisition + conversion dashboard:
  traffic (pageviews, top pages, referrers, countries, devices) from
  Vercel Web Analytics, plus a conversion funnel, acquisition/campaign/
  service/landing-page breakdowns, and leads/bookings KPIs joined
  against real tracked events. Needs setup steps that can't be done
  from code — see "Analytics setup" below.

## How the gate works

Auth is **decoupled from `middleware.js`** (which only handles the
digital/software subdomain rewrites). Instead:

- **`/api/admin/check`** — `POST { password }` sets an HttpOnly session
  cookie on success; `GET` verifies it; `DELETE` clears it.
- **`admin/auth.js`** — included on every `/admin/*.html` page; shows a
  login form until the session cookie is valid.
- **`admin/lib/auth.mjs`** — shared `requireAdmin()` guard used at the
  top of each `/api/admin/*` handler (lives outside `api/` on purpose —
  see the comment at the top of `api/admin/[...path].js`).

The password comes **only** from the `ADMIN_PASSWORD` environment
variable — there is no hardcoded fallback in code. Set it in Vercel
(Project Settings → Environment Variables) for Production, Preview, and
Development. Changing it there takes effect on the next deploy.

## Analytics setup

`/admin/analytics` reads from Vercel Web Analytics, which needs two
manual steps neither code nor this repo's CI can do for you:

1. **Enable Web Analytics for the project** — Vercel dashboard →
   Project Settings → Analytics → Enable. Until this is on,
   `js/components.js`'s tracking script silently no-ops and
   `/admin/analytics` shows a setup notice instead of data.
2. **Create a `VERCEL_TOKEN`** — vercel.com/account/tokens → Create,
   scoped to this team → add it to Vercel's Environment Variables for
   this project. `admin/lib/handlers/analytics.mjs` uses it to call
   Vercel's REST API server-side (the Vercel MCP tooling used to build
   this feature is only available in an agent/developer session, not
   to code running on the live site — the deployed handler needs its
   own credential). The project ID and team ID are hardcoded in that
   file (not secrets, just IDs).

### Conversion funnel, acquisition, campaigns, service interest

These sections read first-party custom events fired by
`js/components.js` (site-wide: `session_start`, `service_view`,
`portfolio_view`, `booking_cta_click`, `contact_cta_click`,
`phone_click`, `email_click`) plus `contact.html`/`book.html`
(`form_start`, `lead_submit`, `booking_submit`) via
`va('event', {...})` — the same Web Analytics beacon as step 1 above,
so no extra setup is needed for these to start appearing, beyond Web
Analytics being enabled.

### Leads/Bookings KPIs, attribution, Campaign Performance

These need one more manual step this repo can't do for you: **create
an Airtable `Leads` table** (same base as `Bookings`/`BlogPosts`/
`Prospects`) with these fields —

```
Name, Contact, Need, Business, Package, Timeline, Message, Ref,
SourcePath, Lang, UtmSource, UtmMedium, UtmCampaign, UtmContent,
UtmTerm, Referrer, LandingPage, LandingService, SubmittedAt
```

Optionally override the table name with `AIRTABLE_LEADS_TABLE` (env
var, defaults to `"Leads"`). Until this table exists, the "Leads" and
"Conversion Rate" KPI tiles show "Not tracked yet" instead of a
(misleading) zero — nothing else on the dashboard is affected, and the
contact form itself keeps working exactly as before (Formspree
delivery is independent of this table).

Also **add these columns to the existing `Bookings` table**, so
booking-form submissions carry the same attribution:

```
UtmSource, UtmMedium, UtmCampaign, UtmContent, UtmTerm, Referrer,
LandingPage, LandingService
```

Until those columns exist, `api/booking/[...path].js` automatically
retries without them — bookings keep working either way; attribution
just starts populating the moment the columns are added, no deploy
needed.

## Adding another tool under /admin later

1. Drop the new page in `admin/<name>.html` and include
   `<script src="/admin/auth.js"></script>`.
2. If you want a clean URL without `.html`, add a rewrite in
   `vercel.json`'s `rewrites` array (see the existing `/admin/bookings`
   and `/admin/previews` entries).
3. Any API routes it needs go under `api/admin/...` — call
   `requireAdmin(req, res)` at the top of each handler.
4. Add a card linking to it from `admin/index.html`.
