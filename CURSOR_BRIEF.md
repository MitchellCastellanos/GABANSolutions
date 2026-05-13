# Mi Tarjeta Pro — Implementation Brief

> **Owner:** Mitchell Castellanos · GABAN Solutions Numériques (Montréal, QC)
> **Repo:** mitchellcastellanos/gabansolutions · **Branch:** `claude/digital-business-cards-DNgQ8`
> **Site:** static, hosted on GitHub Pages at `gabansolutions.ca`

---

## 🟢 STATUS — v2 funnel mostly done by Claude

**The whole funnel + JSON-driven cards + client admin + automation runbook is already implemented and pushed to `claude/digital-business-cards-DNgQ8`.** What's left is mostly UI polish, the 10 image mockups (out of scope for code work), and the external SaaS setup that only Mitchell can do (Lemon Squeezy identity verification, etc.).

If you're Cursor (or another agent) coming to extend this work, **read this file plus `AUTOMATION.md` first**, then jump to "Open work for next agent" at the bottom.

---

## TL;DR

Mi Tarjeta Pro is a new Mexico-focused division selling personalized digital business cards ($199 / $249 / $299 MXN). The landing, mockup builder, demo card and **full transactional funnel** exist.

Key files:
- `mi-tarjeta.html` — landing
- `negocio/demo.html` — handcrafted RCR-style premium demo
- `negocio/index.html` + `js/negocio.js` + `negocio/negocio.css` — JSON-driven card renderer
- `negocio/_data/*.json` — one JSON per client (data-driven)
- `mi-cuenta/index.html` + `js/mi-cuenta.js` — token-gated client admin
- `gracias.html` — post-payment landing (parses Lemon Squeezy URL params)
- `onboarding.html` — direct Tally form access
- `AUTOMATION.md` — 600-line setup runbook for Lemon Squeezy + Tally + Notion + Make.com

---

## Hard constraints (still apply for any future work)

- **Static GitHub Pages only.** No Node server, no database, no PHP. Everything must run client-side or via 3rd-party SaaS webhooks.
- **Vanilla JS + Bootstrap 5.3.3.** Match existing code style. No React, Vue, Svelte, jQuery, build tools.
- **Owner is in Canada, no Mexican entity.** Cannot use Mercado Pago, Conekta, Clip, OXXO direct, Stripe Mexico, or any provider that requires CURP/RFC/Mexican bank.
- **Currency:** charge in **MXN**, payout in **CAD** (Lemon Squeezy handles FX automatically).
- **Don't break existing Montréal-facing pages** (`index.html`, `services.html`, `grow-package.html`, `express.html`, `portfolio.html`, `about.html`, `contact.html`).
- **GABAN credit footer** must stay on every customer-facing tarjeta page.

---

## Payment provider: Lemon Squeezy (decided & implemented)

- Merchant of Record → handles MX tax, invoicing, compliance.
- Accepts MXN payments → pays out CAD weekly to Canadian bank.
- Fees: 5% + USD $0.50 per transaction.
- Replaces Mercado Pago entirely (Mitchell has no MX bank).
- PayPal.Me secondary CTA is wired as fallback.

See `AUTOMATION.md` §1 for full setup.

---

## Architecture diagram

```
Mexican customer
   │
   ▼ click "Pedir [tier]" on /mi-tarjeta.html
Lemon Squeezy hosted checkout (MXN)
   │
   │ pays → LS keeps 5%+0.50 → pays Mitchell in CAD weekly
   │ also fires webhook on order_created
   ▼
Make.com Scenario A
   │
   ├── creates Notion row (status: Pendiente)
   ├── emails Mitchell with order details
   └── emails customer w/ link to /gracias.html
   
LS redirects customer → /gracias.html?order_id=...&package=...
   │ parses URL params, embeds Tally form pre-filled
   ▼
Customer submits Tally form (logo, links, services)
   │
   ▼ Tally webhook
Make.com Scenario B
   │
   ├── updates Notion row (status: Datos recibidos)
   ├── uploads files to Google Drive
   └── emails Mitchell "build this card"
   
Mitchell duplicates _example.json → <slug>.json, fills in data, commits
   │
   ▼ GitHub Pages auto-deploys
   │ also fires webhook on push
Make.com Scenario C
   │
   ├── updates Notion row (status: Live)
   └── emails customer with link + QR PNG attached
   
Customer accesses /mi-cuenta/?token=...&n=<slug>
   - sees live preview
   - copies link
   - downloads QR
   - clicks "Pedir cambios $25 MXN" → another Lemon Squeezy link
```

---

## File tree (current)

```
/
├── mi-tarjeta.html              [DONE — pricing → Lemon Squeezy + PayPal]
├── onboarding.html              [DONE — Tally form, no payment context]
├── gracias.html                 [DONE — post-payment, parses LS URL params]
├── mi-cuenta/
│   └── index.html               [DONE — shell, JS does the work]
├── negocio/
│   ├── demo.html                [KEEP — handcrafted RCR demo]
│   ├── index.html               [DONE — JSON-driven entry point]
│   ├── negocio.css              [DONE — base + 10 theme variants]
│   ├── lulu.html                [DONE — pretty URL stub for /negocio/lulu]
│   ├── lulu/
│   │   └── index.html           [DONE — pretty URL stub for /negocio/lulu/]
│   └── _data/
│       ├── _example.json        [DONE — schema reference]
│       └── lulu.json            [DONE — demo client for QA]
├── js/
│   ├── components.js            [DONE]
│   ├── i18n.js                  [DONE]
│   ├── mi-tarjeta.js            [DONE — builder + palette presets]
│   ├── negocio.js               [DONE — JSON renderer]
│   └── mi-cuenta.js             [DONE — token-gated dashboard]
├── Images/
│   └── mi-tarjeta/
│       └── mockups/             [SVG placeholders — pending real PNGs]
├── MyCSS.css                    [DONE]
├── sitemap.xml                  [DONE]
├── AUTOMATION.md                [DONE — 600-line setup runbook]
└── CURSOR_BRIEF.md              [this file]
```

---

## ✅ What's done

| # | Task | File(s) | Status |
|---|---|---|---|
| 1 | Pricing CTAs → Lemon Squeezy + PayPal fallback | `mi-tarjeta.html` | ✅ |
| 2 | `/gracias.html` post-payment landing | `gracias.html` | ✅ |
| 3 | `/onboarding.html` direct form access | `onboarding.html` | ✅ |
| 4 | JSON-driven card renderer | `negocio/index.html` + `js/negocio.js` + `negocio/negocio.css` | ✅ |
| 4b | 10 theme variants (matches palette in `js/mi-tarjeta.js`) | `negocio/negocio.css` | ✅ |
| 5 | Token-gated client admin | `mi-cuenta/index.html` + `js/mi-cuenta.js` | ✅ |
| 6 | Sitemap update | `sitemap.xml` | ✅ |
| 7 | Setup runbook | `AUTOMATION.md` | ✅ |
| 8 | Demo data + redirect stubs | `_example.json` + `lulu.json` + `lulu.html` + `lulu/index.html` | ✅ |

---

## 🔧 External setup checklist (Mitchell, manual)

See `AUTOMATION.md` for step-by-step. Summary:

- [ ] Create Lemon Squeezy account, verify identity (1-3 days), add CAD bank.
- [ ] Create 4 products (Lanzamiento $199, Personalizado $249, Premium $299, Cambios $25 MXN).
- [ ] Replace `REPLACE-LANZAMIENTO`, `REPLACE-PERSONALIZADO`, `REPLACE-PREMIUM`, `REPLACE-CHANGES-25MXN`, `REPLACE-PAYPAL-HANDLE`, `REPLACE-FORM-ID` everywhere in repo. Find them with:
  ```bash
  grep -rn "REPLACE-" --include="*.html" --include="*.json"
  ```
- [ ] Create Tally form (field list in AUTOMATION.md §3.2).
- [ ] Create Notion CRM database (schema in AUTOMATION.md §4.2).
- [ ] Create 3 Make.com scenarios (specs in AUTOMATION.md §5).
- [ ] Generate 10 PNG mockups (separate ChatGPT prompt already provided to Mitchell).
- [ ] Replace SVG placeholders → PNGs:
  ```bash
  sed -i 's|mockups/\([a-z0-9-]*\)\.svg|mockups/\1.png|g' mi-tarjeta.html
  ```

---

## 📋 Open work for next agent (Cursor or whoever)

Things that would be nice to have but were out of scope for v2:

### Polish (low priority)
- [ ] Add `.copy-btn-flash` to `MyCSS.css` (currently inline in `mi-cuenta/index.html` styles — move it out).
- [ ] Add Open Graph image specific to `mi-tarjeta.html` (currently reuses home preview). Generate `/Images/og/gaban-mi-tarjeta-preview.jpg` (1200×630).
- [ ] Test QR resolution on actual print (300dpi for large signage). May want to bump `size=2000x2000` for `/mi-cuenta/` QR download.
- [ ] Add Spanish copy variants for "Abierto / Cerrado" status (currently in `js/negocio.js` only in Spanish — fine for V1 since target is MX).

### Features (medium priority)
- [ ] Add WhatsApp pre-fill helper: `/mi-cuenta/` could show a "Mandar este link a mis clientes" button that opens WhatsApp Share intent.
- [ ] Add analytics: integrate Plausible or Umami so each client sees their scan/visit count in `/mi-cuenta/`.
- [ ] Add `negocio/index.html` "Add to home screen" prompt for iOS — single line of meta tags would do it.
- [ ] Add a "Save vCard" button to each card (.vcf file generated client-side from the JSON).
- [ ] Add multi-language support per card: `language` field in JSON could load alt strings.

### Build automation (V2 sprint)
- [ ] GitHub Action: on push to `negocio/_data/<slug>.json`, auto-generate `negocio/<slug>.html` + `negocio/<slug>/index.html` redirect stubs. Removes manual stub creation.
- [ ] GitHub Action: on push to `negocio/_data/<slug>.json`, validate against JSON schema. Reject malformed commits.
- [ ] Image optimization step (sharp or imagemin) for client uploads in `Images/clients/<slug>/`.

### Testing
- [ ] Add `/test-themes.html` page that renders all 10 themes side-by-side using mock data. Useful for QA when adding new themes.
- [ ] Lighthouse audit on `/negocio/?n=lulu` should hit ≥ 90 mobile. (Not yet measured.)

### Documentation
- [ ] Add per-client onboarding checklist as a separate `docs/CLIENT_ONBOARDING.md` (currently buried in `AUTOMATION.md §7`).
- [ ] Add screenshots to `AUTOMATION.md` (currently placeholder mentions).

---

## 🚫 Don't do this

- ❌ Don't add a backend (Node, Python, PHP, serverless functions, Cloudflare Workers).
- ❌ Don't add npm/yarn/build steps. Everything is direct `<script>` tags from CDN.
- ❌ Don't rewrite `negocio/demo.html` — that's the handcrafted RCR reference. It must stay as-is.
- ❌ Don't touch `index.html`, `services.html`, `grow-package.html`, `express.html`, `portfolio.html`, `about.html`, `contact.html`, `thank-you.html`, `404.html`. They're the Montréal-facing core business.
- ❌ Don't store secrets in the repo. Those live in Make.com env vars.
- ❌ Don't add personally identifying info of real Mexican clients in `_data/*.json` for tests — use fake names.
- ❌ Don't use Spanish-only strings inside shared components (`components.js`, `i18n.js`). Mi Tarjeta Pro pages can be Spanish-only because they target Mexico.

---

## 🧪 How to QA locally

```bash
cd /path/to/repo
python3 -m http.server 8000
```

Then visit:
- http://localhost:8000/mi-tarjeta.html — landing
- http://localhost:8000/negocio/demo.html — handcrafted RCR demo
- http://localhost:8000/negocio/?n=lulu — JSON-driven demo (pastel pink theme)
- http://localhost:8000/negocio/?n=doesnotexist — not-found state
- http://localhost:8000/negocio/lulu.html — redirect stub (should land on `?n=lulu`)
- http://localhost:8000/mi-cuenta/?token=lulu-x7a9k2&n=lulu — token-gated dashboard
- http://localhost:8000/mi-cuenta/?token=wrong&n=lulu — locked state
- http://localhost:8000/gracias.html?order_id=ABC123&package=Lanzamiento — post-payment
- http://localhost:8000/onboarding.html — direct form

For testing all themes: edit `negocio/_data/lulu.json` and change `"theme"` to each of:
`dark-gold`, `editorial-cream`, `pastel-pink`, `kraft-taqueria`, `retro-mex`, `minimal-coffee`, `navy-corporate`, `salud-blue`, `mostaza-personal`, `universal-gold`.

---

## 📞 If you get stuck

- Visual style references: `negocio/demo.html` is canon.
- Data shape: `negocio/_data/_example.json` is canon.
- Theme keys: must match the 10 keys in `negocio/negocio.css` (also mirrored in `js/mi-tarjeta.js` palette presets).
- All customer-facing pages end with: "Diseñado por GABAN Solutions" linking to `mi-tarjeta.html`.
