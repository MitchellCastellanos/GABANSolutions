# Adding a New Project to the Digital Showcase

> Repeatable process for the moment a new client project (or GABAN product)
> goes live and needs to appear on `work.html` / `portfolio.html` (or, for
> internal software products, its own page like `garageos.html`). Follow this
> instead of re-figuring-out the format each time.

---

## 0) When to use this

Any time a project ships and is publicly reachable (its own domain, a GitHub
Pages URL, etc.) and we want to show it off as proof of work. Two shapes:

- **`client_website`** (includes e-commerce, hospitality, consulting sites,
  etc.) → gets a card on `work.html` + a full section on `portfolio.html`.
- **`software_product`** (a GABAN-built tool like GarageOS/FieldOS) → gets
  its own dedicated page under `software.gabansolutions.ca`, following
  `garageos.html`/`fieldos.html` as the template.

This doc covers `client_website`. If it's a `software_product`, reuse
`garageos.html` as the starting file instead of steps 3-4 below.

---

## 1) Run the extraction prompt

Give this prompt to an AI agent that has access to the new project's repo
(or its live site). It returns a single JSON blob with everything needed to
write the copy — nothing here requires access to *this* repo, so it can run
anywhere.

````text
Estás analizando el repositorio de un proyecto digital ya publicado en línea.
Tu tarea es extraer toda la información necesaria para que este proyecto sea
mostrado en el sitio de GABAN Solutions (una agencia digital), siguiendo el
mismo formato que usan para mostrar otros proyectos de portafolio.

Explora el repo (README, código, páginas, configuración) y responde con un
bloque JSON con esta estructura exacta:

{
  "project_type": "client_website" | "software_product",
  "name": "",
  "tagline": "",                 // 1 frase para tarjeta/card
  "intro_paragraph": "",         // 2-3 frases, tono profesional
  "category_badge": "",          // ej: "Website", "E-commerce", "Hospitality", "SaaS", "Sister product"
  "live_url": "",
  "repo_url": "",
  "client_need": "",             // problema/necesidad que resolvía (2-3 frases)
  "what_we_built": "",           // qué se construyó, funcionalidades clave (2-3 frases)
  "highlights": ["", "", "", "", "", ""],  // 6 tags cortos tipo badge
  "stat_cards": [
    {"icon_suggestion": "", "title": "", "description": ""},
    {"icon_suggestion": "", "title": "", "description": ""},
    {"icon_suggestion": "", "title": "", "description": ""},
    {"icon_suggestion": "", "title": "", "description": ""}
  ],
  "tech_stack": [],

  // Solo si category_badge / el proyecto es e-commerce:
  "ecommerce_details": {
    "payment_providers": [],
    "product_count_or_catalog_type": "",
    "shipping_or_fulfillment": "",
    "admin_or_inventory_features": ""
  },

  // Solo si project_type es "software_product":
  "features_detailed": [
    {"title": "", "description": ""}
  ],
  "target_users": [],

  "cta_texts": {
    "primary": "",               // ej. "Visit Website" / "Shop Now" / "Book a Demo"
    "secondary": ""
  },
  "seo": {
    "title": "",
    "meta_description": "",
    "keywords": ""
  },
  "screenshots": {
    "can_generate": true/false,   // ¿tienes forma de tomar capturas del sitio en vivo (browser tool, playwright, etc.)?
    "captured": [
      {"file_path": "", "description": ""}
    ],
    "recommended_if_not_captured": [
      // si NO pudiste generar capturas, recomiéndame exactamente cuáles necesito pasar
      // manualmente, en orden de prioridad. Ejemplo:
      // "1. Homepage / hero section (vista de escritorio)",
      // "2. Página de catálogo o listado de productos",
      // "3. Página de detalle de producto",
      // "4. Carrito o proceso de checkout",
      // "5. Vista mobile del homepage"
    ]
  },
  "needs_translation": true/false,   // el sitio destino es EN/FR/ES
  "notes_for_integration": ""    // credenciales demo, límites, cualquier detalle relevante
}

Si puedes tomar capturas de pantalla reales del sitio en vivo, hazlo y
guárdalas, indicando la ruta de cada archivo en "captured". Si NO tienes esa
capacidad, deja "captured" vacío y llena "recommended_if_not_captured" con una
lista clara y priorizada de qué capturas debo tomar y pasarte yo manualmente,
explicando brevemente por qué cada una es útil.

Si algún campo no se puede determinar desde el repo, indícalo explícitamente
como null y explica qué falta.
````

## 2) Get the screenshot(s)

- If the agent captured screenshots itself, get the files from it.
- If not, it will have returned a prioritized list under
  `recommended_if_not_captured` — take those manually (desktop hero shot is
  the minimum; add more if the project has a distinct catalog/checkout flow
  worth showing).
- **Only one image is actually wired into the templates**: the cover image,
  reused for both the `work.html` card and the `portfolio.html` section.
  Pick the single best shot from the recommended list (usually the homepage
  or the most distinctive page — e.g. the live catalog for an e-commerce
  project) unless asked to build a small gallery instead.
- **Where to save it**: drop the file straight into `Images/portfolio/` in
  this repo, named `Cover<ProjectName>.jpg` (PascalCase, no spaces — see
  `CoverRCR.jpg`, `CoverAcaEntreNos.jpg`, `CoverReptilesConcept.jpg`). That
  exact path is what gets hardcoded into the `<img src>` in both
  `work.html` and `portfolio.html`, so the filename has to match what's
  referenced there (check the section for the project to confirm the exact
  name expected).
- Keep it web-optimized: landscape, ~1200px wide, JPG, under ~200KB (the
  existing covers run 120-170KB).
- If a screenshot can't be captured yet (e.g. the site is gated behind a
  staff/coming-soon password), the `<img>` tag is added anyway with the
  expected filename — it'll just render broken until the file lands at that
  path. Drop the file in later with no other changes needed.

## 3) Wire it into `work.html`

Add one card in the grid (`section.section.bg-light > .row.g-4`), copying an
existing `<article class="card ...">` block:

```html
<div class="col-lg-4">
  <article class="card h-100 border-0 shadow-sm project-card reveal-up">
    <img src="./Images/portfolio/Cover<Name>.jpg" class="card-img-top" alt="<Name> website preview" loading="lazy">
    <div class="card-body p-4">
      <span class="badge text-bg-dark mb-3"><category_badge></span>
      <h2 class="h5 fw-bold"><name></h2>
      <p class="text-muted small"><tagline></p>
      <a class="btn btn-outline-dark btn-sm" href="<live_url>" target="_blank" rel="noopener">Visit website</a>
    </div>
  </article>
</div>
```

## 4) Wire it into `portfolio.html`

Copy an existing project `<section id="...">` block (RCR/Aca/Redwood are all
identical in structure) and fill in:

- `<img>` → the new cover image
- Title, `intro_paragraph`
- "Client need" block → `client_need`
- "What we built" block → `what_we_built`
- 6 badges → `highlights`
- Buttons → `live_url` + `cta_texts`
- Below the section, the 4-stat-card row → `stat_cards`

Also add an entry to the `CollectionPage` JSON-LD `hasPart` array near the
top of the file:

```json
{
  "@type": "CreativeWork",
  "name": "<name>",
  "url": "<live_url>",
  "description": "<tagline>"
}
```

## 5) Add translations (EN/FR/ES)

`work.html` and `portfolio.html` pull copy from the central dictionary in
`js/i18n.js` (search for `rcr_intro`, `aca_intro`, `redwood_intro` to find
the `en`/`fr`/`es` blocks for those pages). Add matching keys for the new
project following the same naming convention:
`<slug>_intro`, `<slug>_need_t`/`_need_d`, `<slug>_build_t`/`_build_d`,
`<slug>_h1`...`_h6`, `<slug>_stat_1t`...`_stat_4d`, `<slug>_btn_live`, etc.
— one full set per language block. If `needs_translation` came back `false`
from the extraction prompt, it's fine to reuse the English copy across all
three languages as a starting point.

## 6) Closing checklist

- [ ] Cover image added to `Images/portfolio/`
- [ ] Card added to `work.html`
- [ ] Full section + stat cards added to `portfolio.html`
- [ ] JSON-LD `hasPart` entry added
- [ ] i18n keys added for EN/FR/ES in `js/i18n.js`
- [ ] Live URL opens in a new tab (`target="_blank" rel="noopener"`)
- [ ] Spot-check the page locally/on preview before pushing

---

For a `software_product` instead of a client site, skip steps 3-4 and
instead duplicate `garageos.html`, which is self-contained (uses
`registerPageI18n` inline rather than the central `js/i18n.js` dictionary) —
fill in the hero, feature cards, and "who it's for" section from
`features_detailed` / `target_users`, then link it from the software product
listing.
