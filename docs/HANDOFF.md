# Handoff — DNS fix + /admin gate re-implementation

Written 2026-07-31 at the end of a Claude Code session, for whoever
(human or another AI tool) picks this up next. Two open items, in
priority order.

## 1. Fix digital./software. subdomains (DNS, not code — needs Cloudflare access)

**Symptom:** `digital.gabansolutions.ca` and `software.gabansolutions.ca`
404. `gabansolutions.ca` and `www.gabansolutions.ca` work fine.

**Confirmed cause:** Vercel → Project → Settings → Domains shows
`digital.gabansolutions.ca` and `software.gabansolutions.ca` both as
**"Invalid Configuration"** (red warning), while `gabansolutions.ca` and
`www.gabansolutions.ca` show **"Proxy Detected"** (blue check, valid —
they're routed through Cloudflare's proxy and Vercel recognizes them
correctly). This is a DNS problem in Cloudflare, not an application bug —
confirmed by a screenshot of the Vercel Domains page during this session.
An earlier session initially suspected `middleware.js` and reverted a
routing change over it (see §2) — that revert turned out to be
unnecessary for *this* problem, but is being kept anyway since the admin
gate needs a safer re-implementation regardless (see §2).

**Fix (needs Cloudflare dashboard access this session didn't have):**

1. In Vercel → Domains, click **"View DNS configuration"** under
   `digital.gabansolutions.ca` — it states the exact record Vercel wants
   (typically a CNAME to `cname.vercel-dns.com`, but confirm the exact
   value shown there — don't assume).
2. In Cloudflare → `gabansolutions.ca` → DNS → Records, add a **CNAME**
   record: name `digital`, target = whatever Vercel specified, with the
   **same proxy status (orange cloud / proxied)** as the existing `www`
   record.
3. Repeat for `software`.
4. Wait a few minutes; Vercel's Domains page should flip both to a green
   "Valid Configuration" automatically. If not, use Vercel's "Refresh"/
   "Verify" action on that domain.

The application code already handles routing correctly once DNS resolves
— `middleware.js` rewrites `/` to `/digital.html` or `/software.html`
based on the `Host` header, and this part was never broken.

## 2. Re-implement the /admin password gate (safely this time)

**What happened:** A password gate for `/admin` (see `docs/ADMIN.md`)
was added by extending `middleware.js`'s `config.matcher` from a plain
`"/"` string to an array (`["/", "/admin", "/admin/:path*",
"/api/admin/:path*"]`) plus HTTP Basic Auth logic inside the same
`middleware` function that also does the digital/software host-based
rewrite. Right after deploying, `digital.gabansolutions.ca` /
`software.gabansolutions.ca` / direct `/digital.html` /`/software.html`
all started 404ing. Under time pressure (live production impact) this
was blamed on the matcher change and **fully reverted** — `middleware.js`
and `vercel.json` are back to their exact pre-admin-gate state (commit
`f4b08b3` on `main`).

**In hindsight**, per §1's Cloudflare screenshot, the actual 404 cause
for the subdomains was DNS all along, unrelated to the matcher — so the
revert may not have been strictly necessary for that specific symptom.
It's being kept anyway, on purpose, because:

- It's not proven the matcher/array change was *completely* harmless
  either (it was never isolated and re-tested after the DNS fix), and
- The admin gate living inside the same file/function as the fragile
  host-rewrite logic is a bad pattern regardless — one bug in either
  concern can now take down the other. Better to decouple before
  re-adding it.

**Current state:** `admin/index.html`, `admin/bookings.html`,
`admin/previews.html`, and `api/admin/bookings/{list,cancel,add}.js` all
still exist and work — they're just **not password-protected right now**.
Reachable directly (no clean URL rewrite currently, since that was in the
reverted `vercel.json`):
- `/admin/index.html`
- `/admin/bookings.html`
- `/admin/previews.html`

**What to build:** Re-add the Basic Auth gate WITHOUT touching
`middleware.js`'s existing matcher (leave it exactly as `matcher: "/"`,
untouched). Options, roughly in order of preference:

- **Separate middleware matcher entries that are 100% literal strings**
  (no `:path*` dynamic segments) — e.g. explicitly list
  `/admin`, `/admin/bookings`, `/admin/previews`,
  `/api/admin/bookings/list`, `/api/admin/bookings/cancel`,
  `/api/admin/bookings/add` instead of a wildcard — if the dynamic
  segment syntax turns out to have been the real issue, this avoids it
  entirely while still being one file. Test on a preview deployment
  before merging to `main` this time.
- **Fully decoupled**: don't touch `middleware.js` at all. Instead, add
  a small check at the top of each `admin/*.html` page (a fetch to a new
  `/api/admin/check` endpoint on load, redirecting to a simple login
  form if it 401s) and gate the `/api/admin/*` endpoints individually
  inside each handler function instead of via middleware. More files,
  but zero shared blast radius with the digital/software routing.

Either way: **deploy to a preview URL first** (a non-main branch push
gets its own Vercel preview deployment) and verify `digital.html`/
`software.html`/root all still work on that preview before merging to
`main` — that verification step didn't happen the first time.

Once re-added, also move `ADMIN_PASSWORD` off the hardcoded
`Gabriela93!` fallback in code and into a real Vercel env var (Project
Settings → Environment Variables) — see `docs/ADMIN.md`.

## Other open items (unrelated, lower priority)

- Create the Airtable **"Bookings"** table so `/book.html` can actually
  confirm appointments — see `docs/BOOKING.md` for the exact schema.
  Without it, the calendar shows availability but bookings fail to save.
- `/leadgen-admin.html` (old URL) now 404s — it was moved to
  `admin/previews.html` and the redirect for the old path was removed in
  the same revert as §2. Low priority (internal tool, not
  customer-facing) but worth re-adding once the admin routing is
  rebuilt.
