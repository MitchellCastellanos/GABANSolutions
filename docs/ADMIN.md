# Admin area (`/admin`)

One password-gated entry point for every internal tool — no more
separate ungated pages like the old `leadgen-admin.html`.

- **`/admin`** — hub with links to the tools below.
- **`/admin/bookings`** — view upcoming appointments booked through
  `/book.html`, cancel one, or manually add/block a time.
- **`/admin/previews`** — the outbound Lead Radar tool (generate/write/
  approve prospect website previews), formerly at `/leadgen-admin.html`.
  Old bookmarks to that URL redirect here automatically.

## How the gate works

`middleware.js` protects `/admin`, everything under it, and its API
routes (`/api/admin/*`) with HTTP Basic Auth — the browser's native
login popup, no separate login page or session cookie to manage.
Username can be anything (leave it blank or type "admin"); only the
password is checked.

The password is read from the `ADMIN_PASSWORD` environment variable,
falling back to `Gabriela93!` if that's not set. **Set `ADMIN_PASSWORD`
in Vercel's Environment Variables** (Project Settings → Environment
Variables) as soon as convenient — until you do, the fallback password
is sitting in this repo's source, which is fine for a private repo but
worth moving to a real secret once you're set up. Changing it there
takes effect on the next deploy, no code change needed.

## Adding another tool under /admin later

1. Drop the new page in `admin/<name>.html`.
2. If you want a clean URL without `.html`, add a rewrite in
   `vercel.json`'s `rewrites` array (see the existing `/admin/bookings`
   and `/admin/previews` entries).
3. Any API routes it needs go under `api/admin/...` — the middleware
   matcher already covers everything there, so no extra gating code is
   needed per-route.
4. Add a card linking to it from `admin/index.html`.
