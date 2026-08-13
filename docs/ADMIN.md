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
- **`/admin/analytics`** — traffic summary (pageviews, top pages,
  referrers, countries, devices) from Vercel Web Analytics. Needs two
  one-time setup steps that can't be done from code — see
  "Analytics setup" below.

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

## Adding another tool under /admin later

1. Drop the new page in `admin/<name>.html` and include
   `<script src="/admin/auth.js"></script>`.
2. If you want a clean URL without `.html`, add a rewrite in
   `vercel.json`'s `rewrites` array (see the existing `/admin/bookings`
   and `/admin/previews` entries).
3. Any API routes it needs go under `api/admin/...` — call
   `requireAdmin(req, res)` at the top of each handler.
4. Add a card linking to it from `admin/index.html`.
