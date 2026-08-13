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

## How the gate works

Auth is **decoupled from `middleware.js`** (which only handles the
digital/software subdomain rewrites). Instead:

- **`/api/admin/check`** — `POST { password }` sets an HttpOnly session
  cookie on success; `GET` verifies it; `DELETE` clears it.
- **`admin/auth.js`** — included on every `/admin/*.html` page; shows a
  login form until the session cookie is valid.
- **`api/admin/lib/auth.mjs`** — shared `requireAdmin()` guard used at
  the top of each `/api/admin/*` handler.

The password comes **only** from the `ADMIN_PASSWORD` environment
variable — there is no hardcoded fallback in code. Set it in Vercel
(Project Settings → Environment Variables) for Production, Preview, and
Development. Changing it there takes effect on the next deploy.

## Adding another tool under /admin later

1. Drop the new page in `admin/<name>.html` and include
   `<script src="/admin/auth.js"></script>`.
2. If you want a clean URL without `.html`, add a rewrite in
   `vercel.json`'s `rewrites` array (see the existing `/admin/bookings`
   and `/admin/previews` entries).
3. Any API routes it needs go under `api/admin/...` — call
   `requireAdmin(req, res)` at the top of each handler.
4. Add a card linking to it from `admin/index.html`.
