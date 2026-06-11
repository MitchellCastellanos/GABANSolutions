// =========================================================
// SHARED LAYOUT (context-aware)
// ---------------------------------------------------------
// The same deployment is served under three hosts:
//   gabansolutions.ca           -> "home"     (umbrella / agency)
//   digital.gabansolutions.ca   -> "digital"  (GABAN Digital)
//   software.gabansolutions.ca  -> "software" (GABAN Software)
//
// Inside Digital and Software the navbar/footer never reference
// the umbrella or the other division: they behave like two
// independent companies. Links inside a brand are relative, so the
// visitor always stays on the same subdomain.
// =========================================================

const UMBRELLA_URL = "https://gabansolutions.ca/";
const DIGITAL_URL = "https://digital.gabansolutions.ca/";
const SOFTWARE_URL = "https://software.gabansolutions.ca/";

function detectContext() {
  const host = (typeof location !== "undefined" && location.hostname) || "";
  if (host.startsWith("software.")) return "software";
  if (host.startsWith("digital.")) return "digital";
  return "home";
}

// Brand shown in the navbar + footer + copyright for each context.
const BRANDS = {
  home: { label: 'GABAN <span class="fw-normal">Solutions</span>', name: "GABAN Solutions", href: "/" },
  digital: { label: 'GABAN <span class="fw-normal">Digital</span>', name: "GABAN Digital", href: "/" },
  software: { label: 'GABAN <span class="fw-normal">Software</span>', name: "GABAN Software", href: "/" }
};

// Navbar links per context. Within a brand links are relative; only
// the umbrella links out to the division subdomains.
const NAV_LINKS = {
  home: [
    { id: "home", href: "/", i18n: "nav_home", label: "Home" },
    { id: "digital", href: DIGITAL_URL, i18n: "nav_digital", label: "Digital" },
    { id: "software", href: SOFTWARE_URL, i18n: "nav_software", label: "Software" },
    { id: "about", href: "/about.html", i18n: "nav_about", label: "About" },
    { id: "contact", href: "/contact.html", i18n: "nav_contact", label: "Contact" }
  ],
  digital: [
    { id: "home", href: "/", i18n: "nav_home", label: "Home" },
    { id: "services", href: "/#services", i18n: "nav_services", label: "Services" },
    { id: "packages", href: "/#packages", i18n: "nav_packages", label: "Packages" },
    { id: "work", href: "/work.html", i18n: "nav_work", label: "Work" },
    { id: "contact", href: "/contact.html", i18n: "nav_contact", label: "Contact" }
  ],
  software: [
    { id: "home", href: "/", i18n: "nav_home", label: "Home" },
    { id: "products", href: "/#products", i18n: "nav_products", label: "Products" },
    { id: "mitarjeta", href: "/mi-tarjeta.html", i18n: "nav_mitarjeta", label: "MiMarca.me" },
    { id: "program", href: "/#founder-client-program", i18n: "nav_program", label: "Founder Program" },
    { id: "contact", href: "/contact.html", i18n: "nav_contact", label: "Contact" }
  ]
};

// Primary CTA per context.
const NAV_CTA = {
  home: { href: "/contact.html", i18n: "nav_cta", label: "Book a Free Consultation" },
  digital: { href: "/contact.html", i18n: "nav_cta", label: "Book a Free Consultation" },
  software: { href: "/contact.html", i18n: "nav_cta_demo", label: "Request a Demo" }
};

function renderNavbar(activePage = "", context = "home") {
  const brand = BRANDS[context] || BRANDS.home;
  const links = NAV_LINKS[context] || NAV_LINKS.home;
  const cta = NAV_CTA[context] || NAV_CTA.home;

  const items = links.map(link => `
          <li class="nav-item">
            <a class="nav-link ${activePage === link.id ? "active" : ""}" href="${link.href}" data-i18n="${link.i18n}">${link.label}</a>
          </li>`).join("");

  return `
  <nav class="navbar navbar-expand-lg bg-white border-bottom sticky-top">
    <div class="container">
      <a class="navbar-brand fw-bold" href="${brand.href}">
        ${brand.label}
      </a>

      <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navMain" aria-controls="navMain" aria-expanded="false" aria-label="Toggle navigation">
        <span class="navbar-toggler-icon"></span>
      </button>

      <div class="collapse navbar-collapse" id="navMain">
        <ul class="navbar-nav ms-auto mb-2 mb-lg-0">${items}
        </ul>

        <a class="btn btn-dark ms-lg-3" href="${cta.href}" data-i18n="${cta.i18n}">${cta.label}</a>

        <div class="ms-lg-3 mt-3 mt-lg-0 d-flex align-items-center gap-2">
          <button class="btn btn-outline-dark btn-sm" id="btnEN" type="button">EN</button>
          <button class="btn btn-outline-dark btn-sm" id="btnFR" type="button">FR</button>
          <button id="btnES" class="btn btn-sm btn-outline-dark" type="button">ES</button>
        </div>
      </div>
    </div>
  </nav>
  `;
}

// ---------------------------------------------------------
// FOOTERS
// ---------------------------------------------------------
function footerHome() {
  return `
        <div class="col-md-3">
          <h2 class="h6 fw-bold">GABAN Solutions</h2>
          <p class="small text-muted mb-0" data-i18n="foot_tagline_home">Digital presence and business software for local businesses.</p>
        </div>

        <div class="col-md-3">
          <h2 class="h6 fw-bold" data-i18n="foot_divisions">Divisions</h2>
          <ul class="list-unstyled small mb-0">
            <li><a class="text-decoration-none" href="${DIGITAL_URL}" data-i18n="nav_digital">Digital</a></li>
            <li><a class="text-decoration-none" href="${SOFTWARE_URL}" data-i18n="nav_software">Software</a></li>
          </ul>
        </div>

        <div class="col-md-3">
          <h2 class="h6 fw-bold" data-i18n="foot_company">Company</h2>
          <ul class="list-unstyled small mb-0">
            <li><a class="text-decoration-none" href="/about.html" data-i18n="nav_about">About</a></li>
            <li><a class="text-decoration-none" href="/work.html" data-i18n="nav_work">Work</a></li>
            <li><a class="text-decoration-none" href="/contact.html" data-i18n="nav_contact">Contact</a></li>
          </ul>
        </div>

        <div class="col-md-3">
          <h2 class="h6 fw-bold" data-i18n="foot_cta_title">Ready to talk?</h2>
          <p class="small text-muted" data-i18n="foot_cta_text">Start with a clear conversation about what your business needs next.</p>
          <a class="btn btn-dark btn-sm" href="/contact.html" data-i18n="nav_cta">Book a Free Consultation</a>
        </div>`;
}

function footerDigital() {
  return `
        <div class="col-md-3">
          <h2 class="h6 fw-bold">GABAN Digital</h2>
          <p class="small text-muted mb-0" data-i18n="foot_tagline_digital">Websites, local SEO and automation for businesses that want to be found and trusted.</p>
        </div>

        <div class="col-md-3">
          <h2 class="h6 fw-bold" data-i18n="foot_services">Services</h2>
          <ul class="list-unstyled small mb-0">
            <li><a class="text-decoration-none" href="/#websites" data-i18n="foot_websites">Websites</a></li>
            <li><a class="text-decoration-none" href="/#seo" data-i18n="foot_seo">Local SEO</a></li>
            <li><a class="text-decoration-none" href="/#landing-pages" data-i18n="foot_landing">Landing pages</a></li>
            <li><a class="text-decoration-none" href="/#automations" data-i18n="foot_automations">Automations</a></li>
          </ul>
        </div>

        <div class="col-md-3">
          <h2 class="h6 fw-bold" data-i18n="foot_packages">Packages</h2>
          <ul class="list-unstyled small mb-0">
            <li><a class="text-decoration-none" href="/express.html" data-i18n="nav_express">Launch 72H</a></li>
            <li><a class="text-decoration-none" href="/grow-package.html" data-i18n="nav_grow">Grow Package</a></li>
            <li><a class="text-decoration-none" href="/work.html" data-i18n="nav_work">Work</a></li>
          </ul>
        </div>

        <div class="col-md-3">
          <h2 class="h6 fw-bold" data-i18n="foot_cta_title">Ready to talk?</h2>
          <p class="small text-muted" data-i18n="foot_cta_text_digital">Tell us about your business and we will point you to the right next step.</p>
          <a class="btn btn-dark btn-sm" href="/contact.html" data-i18n="nav_cta">Book a Free Consultation</a>
        </div>`;
}

function footerSoftware() {
  return `
        <div class="col-md-3">
          <h2 class="h6 fw-bold">GABAN Software</h2>
          <p class="small text-muted mb-0" data-i18n="foot_tagline_software">Ready-to-use software platforms for small businesses that want better operations.</p>
        </div>

        <div class="col-md-3">
          <h2 class="h6 fw-bold" data-i18n="foot_products">Products</h2>
          <ul class="list-unstyled small mb-0">
            <li><a class="text-decoration-none" href="/mi-tarjeta.html">MiMarca.me</a></li>
            <li><a class="text-decoration-none" href="/garageos.html">GarageOS</a></li>
            <li><a class="text-decoration-none" href="/fieldos.html">FieldOS</a></li>
          </ul>
        </div>

        <div class="col-md-3">
          <h2 class="h6 fw-bold" data-i18n="foot_program">Program</h2>
          <ul class="list-unstyled small mb-0">
            <li><a class="text-decoration-none" href="/#founder-client-program" data-i18n="nav_program">Founder Program</a></li>
            <li><a class="text-decoration-none" href="/contact.html" data-i18n="nav_contact">Contact</a></li>
          </ul>
        </div>

        <div class="col-md-3">
          <h2 class="h6 fw-bold" data-i18n="foot_cta_title_demo">Want a demo?</h2>
          <p class="small text-muted" data-i18n="foot_cta_text_software">Tell us how your business runs today and we will show you the platform that fits.</p>
          <a class="btn btn-dark btn-sm" href="/contact.html" data-i18n="nav_cta_demo">Request a Demo</a>
        </div>`;
}

function renderFooter(context = "home") {
  const brand = BRANDS[context] || BRANDS.home;
  let columns = footerHome();
  if (context === "digital") columns = footerDigital();
  else if (context === "software") columns = footerSoftware();

  return `
  <footer class="py-5 border-top">
    <div class="container">
      <div class="row g-4">${columns}
      </div>

      <div class="small text-muted mt-4 pt-4 border-top">
        &copy; <span id="year"></span> ${brand.name} - Montreal, QC
      </div>
    </div>
  </footer>
  `;
}

// Shared pages (contact, about) serve all three brands from one file.
// Elements that carry a `data-i18n-digital` / `data-i18n-software` variant
// get their `data-i18n` key swapped for the active brand BEFORE initI18n
// runs, so the right copy is translated. A few brand-specific links/values
// are adjusted directly.
function applyContextOverrides(context) {
  if (context === "digital" || context === "software") {
    document.querySelectorAll(`[data-i18n-${context}]`).forEach(el => {
      el.setAttribute("data-i18n", el.getAttribute(`data-i18n-${context}`));
    });
    document.querySelectorAll(`[data-href-${context}]`).forEach(el => {
      el.setAttribute("href", el.getAttribute(`data-href-${context}`));
    });
    document.querySelectorAll(`[data-value-${context}]`).forEach(el => {
      el.setAttribute("value", el.getAttribute(`data-value-${context}`));
    });
  }

  // Brand-aware "website" reference: always point at the current brand.
  const webLink = document.getElementById("brand-web-link");
  if (webLink) {
    const labels = {
      home: "gabansolutions.ca",
      digital: "digital.gabansolutions.ca",
      software: "software.gabansolutions.ca"
    };
    webLink.textContent = labels[context] || labels.home;
    webLink.setAttribute("href", "/");
  }
}

function mountSharedLayout(activePage = "", context) {
  const ctx = context || detectContext();
  const navbarHost = document.getElementById("site-navbar");
  const footerHost = document.getElementById("site-footer");

  if (navbarHost) navbarHost.innerHTML = renderNavbar(activePage, ctx);

  if (footerHost) {
    footerHost.innerHTML = renderFooter(ctx);
    const yearEl = document.getElementById("year");
    if (yearEl) yearEl.textContent = new Date().getFullYear();
  }

  applyContextOverrides(ctx);
}
