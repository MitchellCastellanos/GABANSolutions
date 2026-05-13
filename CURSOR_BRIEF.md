# Mi Tarjeta Pro — Implementation Brief for Cursor

> **Owner:** Mitchell Castellanos · GABAN Solutions Numériques (Montréal, QC)
> **Repo:** mitchellcastellanos/gabansolutions · **Branch:** `claude/digital-business-cards-DNgQ8`
> **Site:** static, hosted on GitHub Pages at `gabansolutions.ca`

---

## TL;DR

Mi Tarjeta Pro is a new Mexico-focused division selling personalized digital business cards ($199 / $249 / $299 MXN). The landing, mockup builder and demo card already exist (see `mi-tarjeta.html`, `negocio/demo.html`, `js/mi-tarjeta.js`). **This round makes the funnel fully transactional and automatable from Canada, where the owner has no Mexican bank account.**

You will:
1. Wire payments via **Lemon Squeezy** (Merchant of Record, pays out to CAD bank).
2. Build the post-payment **onboarding flow** with a Tally form.
3. Build a **JSON-driven business card template** so adding a new client or applying a $25 MXN change = editing a single JSON file.
4. Build a token-gated **client self-service admin** (no backend).
5. Document the external setup so Mitchell can wire Lemon Squeezy + Tally + Make.com + Notion in one sitting.

---

## Hard constraints

- **Static GitHub Pages only.** No Node server, no database, no PHP. Everything must run client-side or via 3rd-party SaaS webhooks.
- **Vanilla JS + Bootstrap 5.3.3.** Match the existing code style (see `js/components.js`, `js/mi-tarjeta.js`). No React, Vue, Svelte, jQuery, build tools.
- **Owner is in Canada, no Mexican entity.** Cannot use Mercado Pago, Conekta, Clip, OXXO direct, Stripe Mexico, or any provider that requires CURP/RFC/Mexican bank.
- **Currency:** charge in **MXN**, payout in **CAD** (Lemon Squeezy handles FX automatically).
- **Don't break existing Montréal-facing pages** (`index.html`, `services.html`, `grow-package.html`, `express.html`, `portfolio.html`, `about.html`, `contact.html`). They are the main GABAN business.
- **GABAN credit footer** must stay on every customer-facing tarjeta page.

---

## Payment provider decision

**Use Lemon Squeezy as primary.** It is a Merchant of Record, which means:
- They issue the invoice, collect tax, handle compliance.
- They accept MXN payments from Mexican cards (Visa, MC, Amex).
- They pay out to a Canadian bank account (or Wise) in CAD weekly.
- Fees: **5% + USD $0.50** per transaction.
- On a $199 MXN sale (~$15 CAD) → owner nets ~$13.50 CAD after fees + FX. Acceptable for digital product.
- Provides hosted checkout URLs (no integration code needed).
- Webhooks for `order_created` → trigger Make.com.

**Secondary CTA: PayPal.Me link** for customers who prefer PayPal. Mitchell already has PayPal in Canada — accepts MXN, ~4.4% + fixed fee.

**Not used:** Stripe (works but card-only in MX from non-MX accounts and exposes Mitchell to more compliance), Mercado Pago (requires MX bank), OXXO (requires MX entity). V2 can add these.

---

## Final money + data flow

```
Mexican customer
   │
   ▼
mi-tarjeta.html ──── click "Pedir [tier]" ────▶ Lemon Squeezy hosted checkout (MXN)
                                                      │
                                                      │ pays
                                                      ▼
                                              Lemon Squeezy charges MXN
                                                      │ payout (weekly, CAD)
                                                      ▼
                                              Mitchell's Canadian bank
                                                      │
                                                      ▼ webhook on order_created
                                              Make.com scenario
                                                      │
                                                      ├── creates row in Notion CRM
                                                      ├── emails Mitchell with order details
                                                      └── emails customer w/ link to /gracias.html
                                                      
Customer lands on /gracias.html?order={order_id}
   │
   ▼
Tally form (embedded) — submits business info, logo, links, services
   │
   ▼ webhook
Make.com scenario #2
   │
   ├── updates Notion row (status: "Datos recibidos")
   ├── uploads files to Notion / Google Drive
   ├── creates draft JSON in /negocio/_data/<slug>.json via GitHub API
   └── emails Mitchell "Build this card"
   
Mitchell duplicates JSON, fine-tunes, commits to repo
   │
   ▼
GitHub Pages auto-deploys
   │
   ▼
/negocio/?n=<slug> renders from JSON
   │
   ▼ Make.com detects commit → emails customer w/ live link + printable QR PDF
   │
   ▼
Customer can later access /mi-cuenta/?token=<token>
   to view status, download QR, request $25 MXN changes (another Lemon Squeezy link)
```

---

## File tree after this round

```
/
├── mi-tarjeta.html              [MODIFY — pricing CTAs → Lemon Squeezy URLs]
├── onboarding.html              [NEW — embeds Tally form]
├── gracias.html                 [NEW — post-payment thank you + timeline]
├── mi-cuenta/
│   └── index.html               [NEW — token-gated client admin]
├── negocio/
│   ├── demo.html                [KEEP AS-IS — handcrafted RCR demo]
│   ├── index.html               [NEW — JSON-driven template, reads ?n=<slug>]
│   └── _data/
│       ├── _example.json        [NEW — schema example]
│       └── lulu.json            [NEW — demo client for QA]
├── js/
│   ├── components.js            [MODIFY — minor i18n keys if needed]
│   ├── i18n.js                  [no changes expected]
│   ├── mi-tarjeta.js            [KEEP AS-IS]
│   ├── negocio.js               [NEW — JSON renderer for /negocio/index.html]
│   └── mi-cuenta.js             [NEW — token-gated admin logic]
├── MyCSS.css                    [MODIFY — add /negocio/ + /mi-cuenta/ styles]
├── sitemap.xml                  [MODIFY — add new routes]
└── AUTOMATION.md                [NEW — setup runbook for Mitchell]
```

---

## TASK 1 — Update `mi-tarjeta.html` pricing CTAs

Replace the 3 contact-form links inside the pricing section with Lemon Squeezy checkout URLs. Use placeholders that Mitchell will substitute after creating products.

```html
<!-- Lanzamiento -->
<a href="https://gabansolutions.lemonsqueezy.com/buy/REPLACE-LANZAMIENTO" target="_blank" rel="noopener" class="btn btn-warning w-100">Quiero el promo</a>

<!-- Personalizado -->
<a href="https://gabansolutions.lemonsqueezy.com/buy/REPLACE-PERSONALIZADO" target="_blank" rel="noopener" class="btn btn-dark w-100">Elegir Personalizado</a>

<!-- Premium -->
<a href="https://gabansolutions.lemonsqueezy.com/buy/REPLACE-PREMIUM" target="_blank" rel="noopener" class="btn btn-outline-dark w-100">Elegir Premium</a>
```

Also add a small secondary line under each price card:
```html
<div class="text-center small text-muted mt-2">
  o paga por <a href="https://paypal.me/REPLACE-PAYPAL-HANDLE/199MXN" target="_blank" rel="noopener">PayPal</a>
</div>
```

(amounts: 199, 249, 299 respectively)

**Acceptance:**
- Clicking any tier opens Lemon Squeezy in a new tab.
- PayPal secondary works as a fallback.
- The hero buttons "Pedir mi tarjeta" stay pointing to `#precios`.

---

## TASK 2 — Create `gracias.html` (post-payment landing)

Layout: dark hero "¡Bienvenido a Mi Tarjeta Pro!" → animated timeline (4 steps: Pago ✓ → Cuéntanos de ti → Diseño humano → Tarjeta lista) → embedded Tally form for onboarding → secondary CTA "WhatsApp directo si prefieres".

Lemon Squeezy redirect will land here with `?order_id=...&product=...`. Parse the URL params in JS to:
- Show order ID in the page
- Pre-select which package they bought in the Tally form (use Tally's URL param pre-fill)

Tally form embed snippet (Mitchell replaces the form ID):
```html
<iframe
  data-tally-src="https://tally.so/embed/REPLACE-FORM-ID?alignLeft=1&hideTitle=1&transparentBackground=1&dynamicHeight=1&order_id={ORDER_ID}&package={PACKAGE}"
  loading="lazy" width="100%" height="600" frameborder="0" marginheight="0" marginwidth="0"
  title="Onboarding Mi Tarjeta Pro"></iframe>
<script src="https://tally.so/widgets/embed.js"></script>
```

Use the existing navbar/footer via `mountSharedLayout("mi-tarjeta")`.

**Acceptance:**
- URL params display in the page.
- Form embeds correctly and is responsive.
- Page passes `mountSharedLayout` without errors.

---

## TASK 3 — Create `onboarding.html` (direct form access, no payment)

For Mitchell to share a direct onboarding link to customers who paid out-of-band (cash, transfer, friends). Same as `gracias.html` but no order ID required and copy adjusted ("Llena tu info y pasamos a diseño en cuanto confirmemos tu pago").

---

## TASK 4 — Create `negocio/index.html` (JSON-driven template)

The most important piece. **One template, infinite cards.** Reads URL `?n=<slug>` and fetches `/negocio/_data/<slug>.json` then renders.

Visual style: take the existing `negocio/demo.html` (RCR dark-gold) as the **default theme**. Add support for additional themes via JSON (`theme: "dark-gold" | "pastel-pink" | "kraft-warm" | "navy-corporate" | "salud-blue" | "mostaza-personal" | "minimal-coffee" | "universal-gold"`).

### `/negocio/_data/_example.json` schema

```json
{
  "slug": "lulu",
  "theme": "pastel-pink",
  "language": "es-MX",
  "business": {
    "name": "Lulú Nail Bar",
    "tagline": "Tu mejor versión, una uña a la vez",
    "verified": true,
    "rating": 5.0,
    "established": 2024,
    "logoUrl": "/Images/clients/lulu/logo.png",
    "city": "Querétaro, México"
  },
  "status": {
    "type": "open-hours",
    "hours": {
      "mon": "10:00-19:00",
      "tue": "10:00-19:00",
      "wed": "10:00-19:00",
      "thu": "10:00-20:00",
      "fri": "10:00-20:00",
      "sat": "10:00-18:00",
      "sun": "closed"
    }
  },
  "primaryCta": {
    "label": "Agendar cita",
    "subtitle": "Respuesta por WhatsApp en minutos",
    "icon": "calendar2-check",
    "url": "https://wa.me/5215555555555?text=Hola%20quiero%20agendar"
  },
  "links": [
    { "label": "Instagram", "subtitle": "@lulu_nailbar", "icon": "instagram", "style": "ig", "url": "https://instagram.com/lulu_nailbar", "popular": true },
    { "label": "TikTok", "subtitle": "@lulunails", "icon": "tiktok", "style": "tt", "url": "https://tiktok.com/@lulunails" },
    { "label": "Ubicación", "subtitle": "Cómo llegar", "icon": "geo-alt-fill", "style": "map", "url": "https://maps.app.goo.gl/xxx" }
  ],
  "services": [
    { "name": "Manicure clásica", "desc": "Limado, cutícula y esmalte", "price": "$180" },
    { "name": "Acrílicas", "desc": "Diseño personalizado", "price": "$450" }
  ],
  "servicesDisclaimer": "Precios pueden variar según diseño",
  "gallery": [
    "/Images/clients/lulu/g1.jpg",
    "/Images/clients/lulu/g2.jpg"
  ],
  "brandCardCopy": "Donde tus uñas son arte, no rutina.",
  "copyright": "© 2025 Lulú Nail Bar · Querétaro, México",
  "changeRequestUrl": "https://gabansolutions.lemonsqueezy.com/buy/REPLACE-CHANGES-25MXN",
  "ownerToken": "lulu-x7a9k2"
}
```

### Renderer (`js/negocio.js`)

- Read `n` query param. If missing → show "Esta tarjeta no existe. ¿Quieres una así? → /mi-tarjeta.html"
- Fetch `_data/${slug}.json`. On 404 → same not-found message.
- Compute "Abierto/Cerrado" status from `status.hours` and current time in `America/Mexico_City`.
- Render brand block, primary CTA, links (with theme-aware icon backgrounds), services, gallery (lazy load), hours, copyright, GABAN credit footer.
- Apply theme via `data-theme="..."` attribute on `<body>` — CSS handles the rest.
- All external links: `target="_blank"`, `rel="noopener"`, with `?utm_source=mitarjetapro&utm_medium=qr` appended (only if not already a `wa.me` or `maps` URL).

### Themes in `MyCSS.css`

Define CSS variables per theme using `[data-theme="dark-gold"]`, `[data-theme="pastel-pink"]`, etc. The 8 themes must mirror the 10 mockups in `Images/mi-tarjeta/mockups/`:

| Theme key | Mockup match | Palette |
|---|---|---|
| `dark-gold` | belleza-2 | `#0a0a0a` bg, `#d4b86a` accent |
| `editorial-cream` | belleza-1 | `#f7f1e8`, `#8a6f3a` |
| `pastel-pink` | belleza-3 | `#fce4ec`, `#ad1457` |
| `kraft-taqueria` | comida-1 | `#2a140a`, `#ffb347` |
| `retro-mex` | comida-2 | `#3d2817`, `#f4a83a` |
| `minimal-coffee` | comida-3 | `#f5efe6`, `#6f4e37` |
| `navy-corporate` | profesional-1 | `#0a1a2a`, `#6ab0ff` |
| `salud-blue` | profesional-2 | `#e3f2fd`, `#1565c0` |
| `mostaza-personal` | profesional-3 | `#2c1a0a`, `#e8a838` |
| `universal-gold` | universal-1 | `#111111`, `#c9a227` |

Use the same component HTML structure as `negocio/demo.html` (do NOT rewrite from scratch — extract its DOM tree into the template).

### Pretty URLs

GitHub Pages can serve `/negocio/lulu/` if a folder `negocio/lulu/index.html` exists. But that defeats the JSON-only workflow. **Decision:** for V1, URLs are `/negocio/?n=<slug>`. In V2 a GitHub Action can publish per-folder redirect stubs.

Also create `negocio/lulu.html` and `negocio/lulu/index.html` redirect stubs **only for the demo** (`lulu`) for QA purposes — single line each: `<meta http-equiv="refresh" content="0; url=/negocio/?n=lulu">`.

**Acceptance:**
- `/negocio/?n=lulu` renders Lulú's card with `pastel-pink` theme.
- `/negocio/?n=doesnotexist` shows the not-found state.
- Status computes correctly for `America/Mexico_City` timezone.
- All 10 themes have CSS coverage (even if only 1 client uses each).
- GABAN credit footer present.

---

## TASK 5 — Create `mi-cuenta/index.html` + `js/mi-cuenta.js`

Token-gated client portal. URL: `/mi-cuenta/?token=<token>&n=<slug>`.

Behavior:
- Read `token` and `n` from URL.
- Fetch `/negocio/_data/<slug>.json`.
- If `data.ownerToken !== token` → show "Token inválido" and link to contact.
- Otherwise render dashboard:
  - Greeting "Hola, {business.name}"
  - Status badge ("Tu tarjeta está en vivo")
  - Link preview (iframe of `/negocio/?n=<slug>` at 360px width)
  - 4 cards:
    1. **Tu link** — copy-to-clipboard button + open in new tab
    2. **Tu QR** — img from `api.qrserver.com` + "Descargar PNG" + "Descargar PDF" (use a simple client-side PDF gen with `jsPDF` from CDN)
    3. **Pedir cambios ($25 MXN)** — link to `data.changeRequestUrl` (Lemon Squeezy) + a Tally embed for the change list
    4. **Actualizar logo / fotos** — Tally form embed (same one used in onboarding, with `existing_client=true` param)
  - Footer: "¿Algo raro? WhatsApp: ..." + GABAN credit

The token is just a random string in the JSON; it's "security by obscurity" — fine for this use case. Each token is 8–12 chars, generated by Mitchell when first publishing the client.

**Acceptance:**
- Valid token + slug renders the dashboard.
- Invalid token shows error.
- Copy-to-clipboard works.
- QR downloads as PNG.
- Change-request Tally embed loads.

---

## TASK 6 — Update `sitemap.xml`

Add `/onboarding.html`, `/gracias.html`. **Do not** add `/mi-cuenta/` or `/negocio/?n=*` (those are private/dynamic).

---

## TASK 7 — Create `AUTOMATION.md` runbook

Plain-language step-by-step for Mitchell to set up the external services. Sections:

1. **Lemon Squeezy** — sign up, verify identity, add Canadian bank, create store, create 4 products (Lanzamiento $199, Personalizado $249, Premium $299, Cambios $25), enable test mode, get URLs, replace placeholders in `mi-tarjeta.html`. Set webhook to Make.com.
2. **PayPal.Me** — create the link, add it to fallback CTAs.
3. **Tally** — create form with fields list (provided below), enable file uploads, hide branding (free tier shows "Powered by Tally" which is fine), set webhook to Make.com, get embed ID, replace in `gracias.html` + `onboarding.html`.
   - Fields: order_id (hidden), package (hidden), business_name, slug_preference, tagline, business_type (dropdown matching 10 themes), primary_color_preference, logo (file), photos (multi file), instagram, facebook, tiktok, whatsapp_number, website, google_maps_url, services_list (long text), hours (long text), special_requests (long text).
4. **Notion** — create CRM database with columns: `client_name`, `slug`, `package`, `status` (Pendiente/Datos recibidos/En diseño/Listo/Live/Pausado), `order_id`, `payment_amount`, `email`, `whatsapp`, `link`, `qr_pdf_url`, `change_orders_this_month`, `created_at`. Share with Make.com integration.
5. **Make.com scenarios:**
   - **Scenario A:** Lemon Squeezy webhook → Notion create row + Gmail to Mitchell + Gmail to customer "redirect to gracias.html" (Lemon Squeezy already does this; the email is a backup).
   - **Scenario B:** Tally webhook → Notion update row (match by order_id) + Google Drive upload files + Gmail to Mitchell "Build this card".
   - **Scenario C:** GitHub webhook (on push to main, path `/negocio/_data/*`) → Notion update row to "Live" + Gmail to customer with their link + jsPDF-generated QR attached.
6. **Wise (optional)** — if Mitchell wants USD/MXN buffer accounts; otherwise Lemon Squeezy pays direct to CAD bank.

Keep the runbook under 600 lines, with numbered steps and screenshots-placeholder notes (`[ screenshot: lemon squeezy product create page ]`).

---

## TASK 8 — Add `lulu.json` demo data and QA the JSON renderer

Use the schema above. Place a real photo URL or a placeholder image (`/Images/mi-tarjeta/mockups/belleza-3.svg`) for `logoUrl` so QA passes.

---

## External setup checklist (Mitchell, after Cursor finishes)

- [ ] Create Lemon Squeezy account, verify identity (Canadian passport + utility bill), add CAD bank.
- [ ] Create 4 products (Lanzamiento, Personalizado, Premium, Cambios $25 MXN). Get checkout URLs.
- [ ] Replace `REPLACE-LANZAMIENTO`, `REPLACE-PERSONALIZADO`, `REPLACE-PREMIUM`, `REPLACE-CHANGES-25MXN`, `REPLACE-PAYPAL-HANDLE` everywhere in repo.
- [ ] Create Tally form, get `REPLACE-FORM-ID`, replace in `gracias.html` + `onboarding.html`.
- [ ] Create Notion CRM (template provided in AUTOMATION.md).
- [ ] Create 3 Make.com scenarios from the runbook.
- [ ] Test end-to-end with Lemon Squeezy test mode + real Tally + real Notion.
- [ ] Generate 10 PNG mockups (separate ChatGPT prompt available) and replace `/Images/mi-tarjeta/mockups/*.svg` → `.png`. Run sed: `sed -i 's|mockups/\([a-z0-9-]*\)\.svg|mockups/\1.png|g' mi-tarjeta.html`.
- [ ] Update `og` image at `/Images/og/gaban-mi-tarjeta-preview.jpg` and adjust meta tags.

---

## Acceptance criteria (Cursor must verify before declaring done)

- [ ] All 3 pricing CTAs in `mi-tarjeta.html` point to Lemon Squeezy URLs (with placeholders OK).
- [ ] `/gracias.html` loads, parses URL params, embeds Tally form, has nav + footer.
- [ ] `/onboarding.html` loads and embeds the same Tally form without order context.
- [ ] `/negocio/?n=lulu` renders a complete card from `_data/lulu.json` matching the `pastel-pink` theme.
- [ ] `/negocio/?n=lulu` includes GABAN credit footer at the bottom.
- [ ] `/negocio/?n=missing` shows a friendly not-found state.
- [ ] `/mi-cuenta/?token=lulu-x7a9k2&n=lulu` shows the client dashboard with link, QR, change-request CTAs.
- [ ] `/mi-cuenta/?token=wrong&n=lulu` shows "Token inválido".
- [ ] Open/Closed status logic works (use `America/Mexico_City` timezone, test by mocking date in console).
- [ ] All new pages pass `mountSharedLayout` and use the existing nav/footer + i18n.
- [ ] No JS errors in console on any new page (Chrome + Safari iOS).
- [ ] Lighthouse mobile score ≥ 90 on `/negocio/?n=lulu`.
- [ ] `sitemap.xml` includes `/onboarding.html` and `/gracias.html`.
- [ ] `AUTOMATION.md` exists, is readable, and covers all 5 external services.
- [ ] Code style matches existing files (2-space indent, single quotes in JS, semicolons where existing code uses them).
- [ ] No `console.log` left in production JS.
- [ ] All commits on `claude/digital-business-cards-DNgQ8` branch.

---

## Things NOT to do

- ❌ Don't add a backend (Node, Python, PHP, serverless functions, Cloudflare Workers).
- ❌ Don't add npm/yarn/build steps. Everything is direct `<script>` tags from CDN.
- ❌ Don't rewrite existing files unless explicitly told.
- ❌ Don't touch `index.html`, `services.html`, `grow-package.html`, `express.html`, `portfolio.html`, `about.html`, `contact.html`, `thank-you.html`, `404.html`. Those are the Montréal-facing core business.
- ❌ Don't store secrets in the repo (Lemon Squeezy keys, Notion tokens, etc.). Those live in Make.com env vars.
- ❌ Don't include personally identifying info of real Mexican clients in `_data/*.json` for tests — use fake names.
- ❌ Don't use Spanish-only strings inside shared components (`components.js`, `i18n.js`). Mi Tarjeta Pro pages can be Spanish-only because they target Mexico.

---

## Suggested commit cadence

1. Commit per task (8 commits + 1 for `AUTOMATION.md`).
2. Final commit: "Wire Mi Tarjeta Pro funnel + JSON-driven cards".
3. Open PR against `main` titled "Mi Tarjeta Pro v2 — payments, onboarding, JSON cards, client admin".

---

## Reference: existing key files Cursor should read first

- `/mi-tarjeta.html` (landing — has hero, pricing tiers, builder, FAQ)
- `/negocio/demo.html` (RCR-style demo — use as template structure source)
- `/js/mi-tarjeta.js` (existing builder logic and palette presets — mirror the JSON theme keys here)
- `/js/components.js` (shared navbar/footer)
- `/MyCSS.css` (existing styles, Mi Tarjeta section starts near `/* MI TARJETA PRO */`)

When in doubt about visual style: copy from `negocio/demo.html`. When in doubt about copy: keep it Mexican-friendly, casual but pro, and always end customer pages with "Diseñado por GABAN Solutions".
