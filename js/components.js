// =========================================================
// VERCEL WEB ANALYTICS
// ---------------------------------------------------------
// First-party, cookieless traffic tracking. Every page on the site
// loads this file, so injecting it here (once) covers all 3 domains
// and the dynamic blog pages instead of duplicating a <script> tag
// across 20+ HTML files. window.va must exist before the analytics
// script loads, so this runs before anything else in the file.
//
// Requires Web Analytics to be turned on for this project in the
// Vercel dashboard (Project Settings -> Analytics -> Enable) — that's
// a one-time manual step, no API for it. Until then this script tag
// 404s harmlessly in the background; it does not break the page.
// =========================================================
window.va = window.va || function () { (window.vaq = window.vaq || []).push(arguments); };
(function () {
  var script = document.createElement("script");
  script.defer = true;
  script.src = "/_vercel/insights/script.js";
  document.head.appendChild(script);
})();

// =========================================================
// SHARED LAYOUT (context-aware)
// ---------------------------------------------------------
// One site, one domain (gabansolutions.ca). "context" picks which
// navbar/footer flavor to render: "home" (umbrella/company pages),
// "digital" (pages under /digital/) or "software" (pages under
// /software/). Each page under a division already passes its own
// context explicitly to mountSharedLayout() below; shared company
// pages (About, Contact, Book, Portfolio, Work, Mockup, 404,
// Thank You) don't pass one and default to "home".
// =========================================================

// Brand shown in the navbar + footer + copyright for each context.
const BRANDS = {
  home: { label: 'GABAN <span class="fw-normal">Solutions</span>', name: "GABAN Solutions", href: "/" },
  digital: { label: 'GABAN <span class="fw-normal">Digital</span>', name: "GABAN Digital", href: "/digital/" },
  software: { label: 'GABAN <span class="fw-normal">Software</span>', name: "GABAN Software", href: "/software/" }
};

// Navbar links per context. All links are internal paths on the
// same domain now, so crossing divisions is a normal in-site link.
const NAV_LINKS = {
  home: [
    { id: "home", href: "/", i18n: "nav_home", label: "Home" },
    { id: "digital", href: "/digital/", i18n: "nav_digital", label: "Digital" },
    { id: "software", href: "/software/", i18n: "nav_software", label: "Software" },
    { id: "blog", href: "/blog", i18n: "nav_blog", label: "Blog" },
    { id: "about", href: "/about", i18n: "nav_about", label: "About" },
    { id: "contact", href: "/contact", i18n: "nav_contact", label: "Contact" }
  ],
  digital: [
    { id: "home", href: "/", i18n: "nav_home", label: "Home" },
    { id: "services", href: "/digital/#services", i18n: "nav_services", label: "Services" },
    { id: "pricing", href: "/digital/pricing", i18n: "nav_pricing", label: "Pricing" },
    { id: "work", href: "/work", i18n: "nav_work", label: "Work" },
    { id: "blog", href: "/blog", i18n: "nav_blog", label: "Blog" },
    { id: "contact", href: "/contact", i18n: "nav_contact", label: "Contact" },
    { id: "software", href: "/software/", i18n: "nav_software", label: "Software" }
  ],
  software: [
    { id: "home", href: "/", i18n: "nav_home", label: "Home" },
    { id: "products", href: "/software/#products", i18n: "nav_products", label: "Products" },
    { id: "pricing", href: "/software/pricing", i18n: "nav_pricing", label: "Pricing" },
    { id: "blog", href: "/blog", i18n: "nav_blog", label: "Blog" },
    { id: "contact", href: "/contact", i18n: "nav_contact", label: "Contact" },
    { id: "digital", href: "/digital/", i18n: "nav_digital", label: "Digital" }
  ]
};

// Primary CTA per context.
const NAV_CTA = {
  home: { href: "/book", i18n: "nav_cta", label: "Book Your Free Consultation" },
  digital: { href: "/book", i18n: "nav_cta", label: "Book Your Free Consultation" },
  software: { href: "/book", i18n: "nav_cta", label: "Book Your Free Consultation" }
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
      <a class="navbar-brand fw-bold d-flex align-items-center gap-2" href="${brand.href}">
        <img src="/Images/logo-mark-transparent.png" alt="" width="28" height="28" class="navbar-brand-mark">
        <span>${brand.label}</span>
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
          <h2 class="h6 fw-bold d-flex align-items-center gap-2">
            <img src="/Images/logo-mark-transparent.png" alt="" width="20" height="20">
            GABAN Solutions
          </h2>
          <p class="small text-muted mb-0" data-i18n="foot_tagline_home">Digital presence and business software for local businesses.</p>
        </div>

        <div class="col-md-3">
          <h2 class="h6 fw-bold" data-i18n="foot_divisions">Divisions</h2>
          <ul class="list-unstyled small mb-0">
            <li><a class="text-decoration-none" href="/digital/" data-i18n="nav_digital">Digital</a></li>
            <li><a class="text-decoration-none" href="/software/" data-i18n="nav_software">Software</a></li>
          </ul>
        </div>

        <div class="col-md-3">
          <h2 class="h6 fw-bold" data-i18n="foot_company">Company</h2>
          <ul class="list-unstyled small mb-0">
            <li><a class="text-decoration-none" href="/about" data-i18n="nav_about">About</a></li>
            <li><a class="text-decoration-none" href="/work" data-i18n="nav_work">Work</a></li>
            <li><a class="text-decoration-none" href="/blog" data-i18n="nav_blog">Blog</a></li>
            <li><a class="text-decoration-none" href="/contact" data-i18n="nav_contact">Contact</a></li>
          </ul>
        </div>

        <div class="col-md-3">
          <h2 class="h6 fw-bold" data-i18n="foot_cta_title">Ready to talk?</h2>
          <p class="small text-muted" data-i18n="foot_cta_text">Start with a clear conversation about what your business needs next.</p>
          <a class="btn btn-dark btn-sm" href="/book" data-i18n="nav_cta">Book Your Free Consultation</a>
        </div>`;
}

function footerDigital() {
  return `
        <div class="col-md-3">
          <h2 class="h6 fw-bold d-flex align-items-center gap-2">
            <img src="/Images/logo-mark-transparent.png" alt="" width="20" height="20">
            GABAN Digital
          </h2>
          <p class="small text-muted mb-3" data-i18n="foot_tagline_digital">Websites, local SEO and automation for businesses that want to be found and trusted.</p>
          <ul class="list-unstyled small mb-0">
            <li><a class="text-decoration-none" href="/software/" data-i18n="nav_software">Software</a></li>
            <li><a class="text-decoration-none" href="/" data-i18n="nav_umbrella">GABAN Solutions</a></li>
          </ul>
        </div>

        <div class="col-md-3">
          <h2 class="h6 fw-bold" data-i18n="foot_services">Services</h2>
          <ul class="list-unstyled small mb-0">
            <li><a class="text-decoration-none" href="/digital/websites" data-i18n="foot_websites">Websites</a></li>
            <li><a class="text-decoration-none" href="/digital/seo" data-i18n="foot_seo">Local SEO</a></li>
            <li><a class="text-decoration-none" href="/digital/landing-pages" data-i18n="foot_landing">Landing pages</a></li>
            <li><a class="text-decoration-none" href="/digital/automations" data-i18n="foot_automations">Automations</a></li>
            <li><a class="text-decoration-none" href="/digital/ecommerce" data-i18n="foot_ecommerce">E-commerce</a></li>
          </ul>
        </div>

        <div class="col-md-3">
          <h2 class="h6 fw-bold" data-i18n="foot_packages">Packages</h2>
          <ul class="list-unstyled small mb-0">
            <li><a class="text-decoration-none" href="/digital/pricing" data-i18n="nav_pricing">Pricing</a></li>
            <li><a class="text-decoration-none" href="/express" data-i18n="nav_express">Launch 72H</a></li>
            <li><a class="text-decoration-none" href="/grow-package" data-i18n="nav_grow">Grow Package</a></li>
            <li><a class="text-decoration-none" href="/work" data-i18n="nav_work">Work</a></li>
            <li><a class="text-decoration-none" href="/blog" data-i18n="nav_blog">Blog</a></li>
          </ul>
        </div>

        <div class="col-md-3">
          <h2 class="h6 fw-bold" data-i18n="foot_cta_title">Ready to talk?</h2>
          <p class="small text-muted" data-i18n="foot_cta_text_digital">Tell us about your business and we will point you to the right next step.</p>
          <a class="btn btn-dark btn-sm" href="/book" data-i18n="nav_cta">Book Your Free Consultation</a>
        </div>`;
}

function footerSoftware() {
  return `
        <div class="col-md-3">
          <h2 class="h6 fw-bold d-flex align-items-center gap-2">
            <img src="/Images/logo-mark-transparent.png" alt="" width="20" height="20">
            GABAN Software
          </h2>
          <p class="small text-muted mb-3" data-i18n="foot_tagline_software">Ready-to-use software platforms for small businesses that want better operations.</p>
          <ul class="list-unstyled small mb-0">
            <li><a class="text-decoration-none" href="/digital/" data-i18n="nav_digital">Digital</a></li>
            <li><a class="text-decoration-none" href="/" data-i18n="nav_umbrella">GABAN Solutions</a></li>
          </ul>
        </div>

        <div class="col-md-3">
          <h2 class="h6 fw-bold" data-i18n="foot_products">Products</h2>
          <ul class="list-unstyled small mb-0">
            <li><a class="text-decoration-none" href="/software/garageos">GarageOS</a></li>
            <li><a class="text-decoration-none" href="/software/fieldos">FieldOS</a></li>
            <li><a class="text-decoration-none" href="/software/booking-system" data-i18n="foot_booking">Booking System</a></li>
          </ul>
        </div>

        <div class="col-md-3">
          <h2 class="h6 fw-bold" data-i18n="foot_company">Company</h2>
          <ul class="list-unstyled small mb-0">
            <li><a class="text-decoration-none" href="/software/pricing" data-i18n="nav_pricing">Pricing</a></li>
            <li><a class="text-decoration-none" href="/blog" data-i18n="nav_blog">Blog</a></li>
            <li><a class="text-decoration-none" href="/contact" data-i18n="nav_contact">Contact</a></li>
          </ul>
        </div>

        <div class="col-md-3">
          <h2 class="h6 fw-bold" data-i18n="foot_cta_title_demo">Want a demo?</h2>
          <p class="small text-muted" data-i18n="foot_cta_text_software">Tell us how your business runs today and we will show you the platform that fits.</p>
          <a class="btn btn-dark btn-sm" href="/book" data-i18n="nav_cta">Book Your Free Consultation</a>
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

function mountSharedLayout(activePage = "", context = "home") {
  const navbarHost = document.getElementById("site-navbar");
  const footerHost = document.getElementById("site-footer");

  if (navbarHost) navbarHost.innerHTML = renderNavbar(activePage, context);

  if (footerHost) {
    footerHost.innerHTML = renderFooter(context);
    const yearEl = document.getElementById("year");
    if (yearEl) yearEl.textContent = new Date().getFullYear();
  }
}
