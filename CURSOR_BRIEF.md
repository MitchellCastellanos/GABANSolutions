# Mi Tarjeta Pro — Handoff Brief for Cursor

> **You are Cursor (or any agent) picking up this work after Claude.**
> Read this file top-to-bottom before doing anything. Then read `AUTOMATION.md`.
> Most of v2 is already shipped. Your job is mostly polish + V3 features.

---

## 🟢 Status

**v2 funnel: complete and pushed.** Open in PR #2 on `claude/digital-business-cards-DNgQ8`.

| Piece | State |
|---|---|
| Landing `/mi-tarjeta.html` (Mexico-targeted) | ✅ Done |
| Interactive mockup builder | ✅ Done |
| Pricing → Lemon Squeezy + PayPal | ✅ Wired (URLs are `REPLACE-*` placeholders) |
| Post-payment `/gracias.html` (Tally embed) | ✅ Done (form ID is `REPLACE-FORM-ID`) |
| Direct onboarding `/onboarding.html` | ✅ Done |
| Handcrafted demo `/negocio/demo.html` (RCR style) | ✅ Done — **DO NOT TOUCH** |
| JSON-driven cards `/negocio/?n=<slug>` | ✅ Done |
| 10 themes (CSS variables) | ✅ Done |
| Open/Cerrado computed in `America/Mexico_City` | ✅ Done |
| Token-gated client admin `/mi-cuenta/?token=&n=` | ✅ Done |
| QR generation via api.qrserver.com | ✅ Done |
| Sitemap, schema.org, OG tags | ✅ Done |
| `AUTOMATION.md` runbook (Lemon Squeezy + Tally + Notion + Make) | ✅ Done |
| 10 PNG mockups | ❌ Mitchell generates via ChatGPT |
| External SaaS setup (LS, Tally, etc.) | ❌ Mitchell does in `AUTOMATION.md` |

**Nothing is broken.** Everything renders. The funnel just isn't *live* yet because the external SaaS placeholders haven't been replaced.

---

## 🧭 Two parallel tracks of remaining work

### Track A — Mitchell (no code, external setup)

These block "go live" but **don't need Cursor**. See `AUTOMATION.md`.

- [ ] Create Lemon Squeezy account, verify identity (1–3 business days)
- [ ] Create 4 products (Lanzamiento $199, Personalizado $249, Premium $299, Cambios $25 MXN)
- [ ] Create Tally form (21 fields, schema in `AUTOMATION.md §3.2`)
- [ ] Create Notion CRM (schema in `AUTOMATION.md §4.2`)
- [ ] Create 3 Make.com scenarios (`AUTOMATION.md §5`)
- [ ] Generate 10 PNG mockups via ChatGPT (prompt already given separately)
- [ ] Find/replace all `REPLACE-*` placeholders in repo:
  ```bash
  grep -rn "REPLACE-" --include="*.html" --include="*.json"
  ```
- [ ] Update SVG mockup refs to PNG:
  ```bash
  sed -i 's|mockups/\([a-z0-9-]*\)\.svg|mockups/\1.png|g' mi-tarjeta.html
  ```

### Track B — Cursor (code work, can start NOW)

These don't depend on Track A. Tackle in priority order.

---

## 🎯 Cursor task list

### Priority 1 · Ship-blocking polish

#### Task B1 — Move inline styles out of `/mi-cuenta/index.html`
The `<style>` block in `mi-cuenta/index.html` (around lines 22–38) belongs in `MyCSS.css`. Cut it into a new `/* MI CUENTA */` section there. Drop the inline `<style>` block. **Acceptance:** view-source on `/mi-cuenta/` shows zero inline `<style>` blocks; visual is identical.

#### Task B2 — Add OG image for `mi-tarjeta.html`
Currently `mi-tarjeta.html` reuses `gaban-home-preview.jpg` for Open Graph. Create `/Images/og/gaban-mi-tarjeta-preview.jpg` (1200×630, dark hero with the gold "Mi Tarjeta Pro" badge + a screenshot of the phone mockup). Update `og:image` + `twitter:image` meta tags in `mi-tarjeta.html`, `gracias.html`, `onboarding.html`.
**Acceptance:** sharing the URL on WhatsApp/IG shows the new preview.

#### Task B3 — `negocio/index.html` falls back gracefully when JSON 200s but is malformed
Right now `js/negocio.js` calls `r.json()` and on parse error goes to `.catch(renderNotFound)`. That's OK but the not-found copy says "Esta tarjeta no está disponible", which is wrong for a malformed file. Differentiate:
- 404 → "no existe"
- parse error → "tarjeta en mantenimiento, vuelve en un momento"
- network error → "revisa tu conexión"

**Acceptance:** temporarily break `lulu.json` with `{` and confirm friendlier copy. Restore the file.

#### Task B4 — Add `/test-themes.html` QA page
Page that renders 10 phone-frame mini-previews side by side, one per theme, all rendering the same mock data inline (no fetch). Useful for visual QA when adding a new theme.
**Acceptance:** opening `/test-themes.html` shows a grid of 10 cards with the same content but different visual themes. `noindex` meta tag.

### Priority 2 · Customer-facing wins

#### Task B5 — "Guardar contacto" (vCard download) button on every `/negocio/` card
Add a small button under the primary CTA: "📇 Guardar contacto". On click, generate and download a `.vcf` file client-side built from the JSON fields (`business.name`, `business.tagline`, `primaryCta.url` if it's a tel/wa/email, address from `business.city`, social links as URLs).
Reference vCard spec: https://en.wikipedia.org/wiki/VCard
**Acceptance:** click "Guardar contacto" on `/negocio/?n=lulu` → downloads `lulu.vcf` that iPhone/Android Contacts opens cleanly.

#### Task B6 — Pretty URL stub auto-generation via GitHub Action
Right now Mitchell creates `negocio/<slug>.html` + `negocio/<slug>/index.html` manually per client. Replace with a GitHub Action that runs on push to `negocio/_data/*.json`:
- For each `<slug>.json`, generate `negocio/<slug>.html` (single-line redirect to `?n=<slug>`) and `negocio/<slug>/index.html` (same).
- Skip if file already exists (don't overwrite).
- Use `peter-evans/create-pull-request@v5` or commit straight to the same branch.

**Acceptance:** add a new fake `negocio/_data/test-client.json` with minimal data, push, the action creates the stubs automatically.

#### Task B7 — `/mi-cuenta/` "Share on WhatsApp" helper button
Add button: "📤 Compartir link por WhatsApp". On click opens `https://wa.me/?text=<encoded message>` where message is "Conoce {{business.name}}: {{publicUrl}}". Uses platform's native share intent.
**Acceptance:** click on mobile opens WhatsApp chooser. On desktop opens WhatsApp Web.

#### Task B8 — Per-card visit analytics (Umami self-hosted or Plausible)
Lightweight analytics so each client can see how many people scanned their QR / opened their card. Recommend Umami because it's self-hostable for free on Cloudflare Pages or Vercel.
- Add Umami script to `/negocio/index.html`.
- In `/mi-cuenta/`, fetch the visit count via Umami's public API for the customer's slug and show in the "Estadísticas" card (which currently says "Coming soon").

**Acceptance:** after deploying Umami, the count updates on visits.

### Priority 3 · Nice-to-haves

#### Task B9 — Validate JSON files via GitHub Action
Add `.github/workflows/validate-json.yml` that uses `ajv-cli` to validate every file in `negocio/_data/*.json` against a JSON Schema (write the schema based on `_example.json`). Reject PRs with malformed client data.

#### Task B10 — Optimize the QR for print
Currently QR download from `/mi-cuenta/` uses `size=1000x1000`. For lonas/signage at print, bump to `size=2000x2000` and add `format=svg` option so they can scale infinitely.

#### Task B11 — Doc split
Extract per-client onboarding from `AUTOMATION.md §7` into `docs/CLIENT_ONBOARDING.md`. Keep `AUTOMATION.md` for setup; new doc for ongoing operations.

#### Task B12 — i18n for the 5 most common card strings
"Abierto · cierra a", "Cerrado · abre", weekdays, "GALERÍA", "HORARIOS", "Diseñado por". Allow JSON field `"language": "en-US" | "fr-CA" | "es-MX"` to swap them. Default es-MX. Useful for serving Tex-Mex restaurants or French Canadians.

---

## 🚫 Constraints (don't break)

- **No backend.** Static GitHub Pages only. No Node server, no DB, no PHP, no serverless.
- **No build step.** Vanilla JS, Bootstrap 5.3.3 from CDN. No npm/yarn/webpack/vite.
- **No frameworks.** No React, Vue, Svelte, jQuery, Alpine.
- **Don't touch the Montréal-facing core:** `index.html`, `services.html`, `grow-package.html`, `express.html`, `portfolio.html`, `about.html`, `contact.html`, `thank-you.html`, `404.html`. That's the main GABAN business.
- **Don't touch `negocio/demo.html`.** It's the handcrafted RCR reference. Canon visual style.
- **Don't add secrets to the repo.** API tokens, webhook URLs etc. live in Make.com env vars.
- **Mi Tarjeta Pro pages are Spanish-only** (target is Mexico). Don't pollute `js/i18n.js` with es-MX-only strings inside shared components — keep them inside `mi-tarjeta.html`/etc. local copy.
- **GABAN credit footer is sacred.** Every customer-facing tarjeta page must end with "Diseñado por GABAN Solutions" linking to `mi-tarjeta.html`. Same for `/mi-cuenta/`.
- **Mexico timezone everywhere** for status/hours. Use `Intl.DateTimeFormat("...", { timeZone: "America/Mexico_City" })`. There's a helper `mexicoNowParts()` in `js/negocio.js` you can reuse.

---

## 🧪 How to QA locally

```bash
cd /path/to/repo
python3 -m http.server 8000
```

Critical URLs:

| URL | Should show |
|---|---|
| `localhost:8000/mi-tarjeta.html` | Full landing with pricing → Lemon Squeezy (placeholder URLs) |
| `localhost:8000/negocio/demo.html` | Handcrafted RCR card |
| `localhost:8000/negocio/?n=lulu` | JSON-driven Lulú Nail Bar card (pastel-pink theme) |
| `localhost:8000/negocio/?n=missing` | Friendly not-found state |
| `localhost:8000/negocio/lulu.html` | Auto-redirect to `?n=lulu` |
| `localhost:8000/negocio/lulu/` | Auto-redirect to `?n=lulu` |
| `localhost:8000/mi-cuenta/?token=lulu-x7a9k2&n=lulu` | Client dashboard with iframe preview, QR, copy-link |
| `localhost:8000/mi-cuenta/?token=wrong&n=lulu` | "Token inválido" locked state |
| `localhost:8000/gracias.html?order_id=ABC123&package=Lanzamiento` | Post-payment with order ref + Tally embed |
| `localhost:8000/onboarding.html` | Tally embed (no order context) |

**To preview all 10 themes:** edit `negocio/_data/lulu.json` line `"theme"` and rotate through: `dark-gold`, `editorial-cream`, `pastel-pink`, `kraft-taqueria`, `retro-mex`, `minimal-coffee`, `navy-corporate`, `salud-blue`, `mostaza-personal`, `universal-gold`. Don't commit the changes.

---

## 📚 Reference files

| File | What's in it |
|---|---|
| `mi-tarjeta.html` | Landing — hero, mockup gallery, builder, pricing, FAQ, upsell |
| `js/mi-tarjeta.js` | Interactive mockup builder; **palette presets must match theme keys in `negocio.css`** |
| `negocio/demo.html` | Canon visual style — handcrafted RCR Barber Shop |
| `negocio/index.html` + `js/negocio.js` + `negocio/negocio.css` | JSON-driven card system |
| `negocio/_data/_example.json` | Canonical data schema |
| `negocio/_data/lulu.json` | Demo client (use for all QA) |
| `mi-cuenta/index.html` + `js/mi-cuenta.js` | Token-gated client admin |
| `gracias.html` | Post-payment — parses `?order_id=&package=` |
| `onboarding.html` | Direct Tally form |
| `MyCSS.css` | Site-wide styles; Mi Tarjeta section starts around `/* MI TARJETA PRO */` |
| `js/components.js` | Shared navbar + footer (DON'T break, used by all pages) |
| `js/i18n.js` | EN/FR/ES translations for shared nav |
| `AUTOMATION.md` | Setup runbook for all external services |
| `sitemap.xml` | Search engine map |

---

## 🧠 Code style conventions

- 2-space indent
- Single quotes in JS where existing code already does
- Semicolons at end of statements
- Inline event handlers OK in tiny pages, but prefer `addEventListener` for anything reused
- Bootstrap 5 utility classes first; only write custom CSS when utilities won't cut it
- Theme variables live in `negocio.css` under `[data-theme="..."]` blocks
- Icons: Bootstrap Icons (`<i class="bi bi-...">`) — list at https://icons.getbootstrap.com
- All Spanish copy in Mi Tarjeta Pro pages stays Spanish; don't translate strings to English

---

## 📞 If you get stuck

- Visual style references: `negocio/demo.html` is canon.
- Data shape: `negocio/_data/_example.json` is canon.
- Theme keys: must match the 10 keys in `negocio/negocio.css` (also mirrored in `js/mi-tarjeta.js` palette presets — keep them in sync if you add a new theme).
- All customer-facing pages end with: "Diseñado por GABAN Solutions" linking to `mi-tarjeta.html`.
- Network errors and 404s in `js/negocio.js` go through `renderNotFound()` — improve them in Task B3.

---

## 🚀 Suggested commit cadence for Cursor

- 1 commit per task (B1, B2, B3, etc.). Don't batch.
- Commit message format: `[Mi Tarjeta Pro] Bxx — short description`
- Push to `claude/digital-business-cards-DNgQ8` (don't open a new branch unless tasks diverge).
- PR #2 will auto-update with new commits.
- When all P1 tasks are done, ping Mitchell to review and merge.
