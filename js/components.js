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
// FIRST-PARTY EVENT TRACKING + ATTRIBUTION
// ---------------------------------------------------------
// Fires custom events through the Vercel Web Analytics beacon above
// (queryable later via /v1/query/web-analytics/events/*, same token
// and endpoint the admin dashboard already uses for pageviews). No
// cookies, no third-party pixels: first-touch attribution (utm_*,
// referrer, landing page) is captured once per browser tab in
// sessionStorage and forwarded to the contact/booking forms so a lead
// can be traced back to the campaign that produced it.
//
// This runs synchronously (not on DOMContentLoaded) because it must
// finish — and window.gabanAttribution/gabanTrack must exist — before
// each page's own inline <script> block runs later in the same
// document, since that's where contact.html/book.html read them.
// =========================================================

const ATTRIBUTION_KEY = "gaban_attribution";
const INTERNAL_HOSTS = ["gabansolutions.ca", "digital.gabansolutions.ca", "software.gabansolutions.ca"];

// Real service/product pages that exist on the site today (see
// digital.html / software.html cards + nav) — used to auto-fire
// service_view without editing every page individually.
const SERVICE_PAGES = {
  "/websites.html": "Websites",
  "/landing-pages.html": "Landing Pages",
  "/seo.html": "Local SEO",
  "/ecommerce.html": "E-commerce",
  "/automations.html": "Automations",
  "/garageos.html": "GarageOS",
  "/fieldos.html": "FieldOS",
  "/booking-system.html": "Booking System"
};
const PORTFOLIO_PAGES = ["/work.html", "/portfolio.html"];

function classifySource(referrerHost, utmSource) {
  if (utmSource) return utmSource;
  if (!referrerHost) return "Direct / Unknown";
  const h = referrerHost.toLowerCase().replace(/^www\./, "");
  if (INTERNAL_HOSTS.includes(h)) return "Internal";
  if (/google\./.test(h)) return "Google";
  if (/linkedin\./.test(h)) return "LinkedIn";
  if (/facebook\.|^fb\.com$|l\.facebook/.test(h)) return "Facebook";
  if (/instagram\./.test(h)) return "Instagram";
  if (/brave\./.test(h)) return "Brave Search";
  if (/bing\./.test(h)) return "Bing";
  if (/duckduckgo\./.test(h)) return "DuckDuckGo";
  if (/twitter\.|x\.com|t\.co/.test(h)) return "X / Twitter";
  if (/wa\.me|whatsapp\./.test(h)) return "WhatsApp";
  return h;
}

function readAttribution() {
  try {
    const raw = sessionStorage.getItem(ATTRIBUTION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveAttribution(attribution) {
  try {
    sessionStorage.setItem(ATTRIBUTION_KEY, JSON.stringify(attribution));
  } catch {
    // sessionStorage unavailable (private mode, etc.) — attribution is
    // best-effort, never block the page over it.
  }
}

function trackEvent(name, data = {}) {
  if (typeof window.va === "function") {
    window.va("event", { name, data });
  }
}
window.gabanTrack = trackEvent;

function initAttribution() {
  let attribution = readAttribution();
  const params = new URLSearchParams(location.search);
  const utmSource = params.get("utm_source") || "";
  const utmMedium = params.get("utm_medium") || "";
  const utmCampaign = params.get("utm_campaign") || "";
  const utmContent = params.get("utm_content") || "";
  const utmTerm = params.get("utm_term") || "";

  if (!attribution) {
    // First pageview of this tab/session: capture first-touch attribution.
    let referrerHost = "";
    try {
      referrerHost = document.referrer ? new URL(document.referrer).hostname : "";
    } catch {
      referrerHost = "";
    }
    attribution = {
      source: classifySource(referrerHost, utmSource),
      medium: utmMedium || (referrerHost ? "referral" : "none"),
      campaign: utmCampaign,
      content: utmContent,
      term: utmTerm,
      referrer: referrerHost,
      landing_page: location.pathname,
      landing_service: SERVICE_PAGES[location.pathname] || ""
    };
    saveAttribution(attribution);
    trackEvent("session_start", {
      source: attribution.source,
      medium: attribution.medium,
      campaign: attribution.campaign,
      referrer_host: attribution.referrer,
      landing_page: attribution.landing_page
    });
  } else if (utmCampaign && !attribution.campaign) {
    // Same session, but this pageview carries a fresh campaign link
    // (e.g. a second ad click) — record it without discarding the
    // original first-touch source.
    attribution.campaign = utmCampaign;
    attribution.content = utmContent;
    attribution.term = utmTerm;
    saveAttribution(attribution);
  }
  return attribution;
}

function ctaLocation(link) {
  if (link.closest("nav")) return "nav";
  if (link.closest("footer")) return "footer";
  if (link.closest("header")) return "hero";
  return "content";
}

function initTracking() {
  window.gabanAttribution = initAttribution();

  const service = SERVICE_PAGES[location.pathname];
  if (service) trackEvent("service_view", { service, page: location.pathname });
  if (PORTFOLIO_PAGES.includes(location.pathname)) trackEvent("portfolio_view", { page: location.pathname });

  // Delegated click tracking for site-wide conversion actions — covers
  // every tel:/mailto: link and every link to /book.html or
  // /contact.html without needing a listener on each individual button.
  document.addEventListener("click", (e) => {
    const link = e.target.closest("a[href]");
    if (!link) return;
    if (link.protocol === "tel:") {
      trackEvent("phone_click", { page: location.pathname });
    } else if (link.protocol === "mailto:") {
      trackEvent("email_click", { page: location.pathname });
    } else if (link.pathname === "/book.html") {
      trackEvent("booking_cta_click", { page: location.pathname, cta_location: ctaLocation(link) });
    } else if (link.pathname === "/contact.html") {
      trackEvent("contact_cta_click", { page: location.pathname, cta_location: ctaLocation(link) });
    }
  });
}

initTracking();

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

// Navbar links per context. Within a brand most links are relative;
// "umbrella" and the sibling-division link always point out to the
// other subdomain so a visitor can travel between GABAN Solutions,
// Digital and Software without hitting a dead end.
const NAV_LINKS = {
  home: [
    { id: "home", href: "/", i18n: "nav_home", label: "Home" },
    { id: "digital", href: DIGITAL_URL, i18n: "nav_digital", label: "Digital" },
    { id: "software", href: SOFTWARE_URL, i18n: "nav_software", label: "Software" },
    { id: "blog", href: "/blog", i18n: "nav_blog", label: "Blog" },
    { id: "about", href: "/about.html", i18n: "nav_about", label: "About" },
    { id: "contact", href: "/contact.html", i18n: "nav_contact", label: "Contact" }
  ],
  digital: [
    { id: "home", href: "/", i18n: "nav_home", label: "Home" },
    { id: "services", href: "/#services", i18n: "nav_services", label: "Services" },
    { id: "pricing", href: "/digital-pricing.html", i18n: "nav_pricing", label: "Pricing" },
    { id: "work", href: "/work.html", i18n: "nav_work", label: "Work" },
    { id: "blog", href: "/blog", i18n: "nav_blog", label: "Blog" },
    { id: "contact", href: "/contact.html", i18n: "nav_contact", label: "Contact" },
    { id: "software", href: SOFTWARE_URL, i18n: "nav_software", label: "Software" },
    { id: "umbrella", href: UMBRELLA_URL, i18n: "nav_umbrella", label: "GABAN Solutions" }
  ],
  software: [
    { id: "home", href: "/", i18n: "nav_home", label: "Home" },
    { id: "products", href: "/#products", i18n: "nav_products", label: "Products" },
    { id: "pricing", href: "/pricing.html", i18n: "nav_pricing", label: "Pricing" },
    { id: "blog", href: "/blog", i18n: "nav_blog", label: "Blog" },
    { id: "contact", href: "/contact.html", i18n: "nav_contact", label: "Contact" },
    { id: "digital", href: DIGITAL_URL, i18n: "nav_digital", label: "Digital" },
    { id: "umbrella", href: UMBRELLA_URL, i18n: "nav_umbrella", label: "GABAN Solutions" }
  ]
};

// Primary CTA per context.
const NAV_CTA = {
  home: { href: "/book.html", i18n: "nav_cta", label: "Book Your Free Consultation" },
  digital: { href: "/book.html", i18n: "nav_cta", label: "Book Your Free Consultation" },
  software: { href: "/book.html", i18n: "nav_cta", label: "Book Your Free Consultation" }
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
            <li><a class="text-decoration-none" href="/blog" data-i18n="nav_blog">Blog</a></li>
            <li><a class="text-decoration-none" href="/contact.html" data-i18n="nav_contact">Contact</a></li>
          </ul>
        </div>

        <div class="col-md-3">
          <h2 class="h6 fw-bold" data-i18n="foot_cta_title">Ready to talk?</h2>
          <p class="small text-muted" data-i18n="foot_cta_text">Start with a clear conversation about what your business needs next.</p>
          <a class="btn btn-dark btn-sm" href="/book.html" data-i18n="nav_cta">Book Your Free Consultation</a>
        </div>`;
}

function footerDigital() {
  return `
        <div class="col-md-3">
          <h2 class="h6 fw-bold">GABAN Digital</h2>
          <p class="small text-muted mb-3" data-i18n="foot_tagline_digital">Websites, local SEO and automation for businesses that want to be found and trusted.</p>
          <ul class="list-unstyled small mb-0">
            <li><a class="text-decoration-none" href="${SOFTWARE_URL}" data-i18n="nav_software">Software</a></li>
            <li><a class="text-decoration-none" href="${UMBRELLA_URL}" data-i18n="nav_umbrella">GABAN Solutions</a></li>
          </ul>
        </div>

        <div class="col-md-3">
          <h2 class="h6 fw-bold" data-i18n="foot_services">Services</h2>
          <ul class="list-unstyled small mb-0">
            <li><a class="text-decoration-none" href="/websites.html" data-i18n="foot_websites">Websites</a></li>
            <li><a class="text-decoration-none" href="/seo.html" data-i18n="foot_seo">Local SEO</a></li>
            <li><a class="text-decoration-none" href="/landing-pages.html" data-i18n="foot_landing">Landing pages</a></li>
            <li><a class="text-decoration-none" href="/automations.html" data-i18n="foot_automations">Automations</a></li>
            <li><a class="text-decoration-none" href="/ecommerce.html" data-i18n="foot_ecommerce">E-commerce</a></li>
          </ul>
        </div>

        <div class="col-md-3">
          <h2 class="h6 fw-bold" data-i18n="foot_packages">Packages</h2>
          <ul class="list-unstyled small mb-0">
            <li><a class="text-decoration-none" href="/digital-pricing.html" data-i18n="nav_pricing">Pricing</a></li>
            <li><a class="text-decoration-none" href="/express.html" data-i18n="nav_express">Launch 72H</a></li>
            <li><a class="text-decoration-none" href="/grow-package.html" data-i18n="nav_grow">Grow Package</a></li>
            <li><a class="text-decoration-none" href="/work.html" data-i18n="nav_work">Work</a></li>
            <li><a class="text-decoration-none" href="/blog" data-i18n="nav_blog">Blog</a></li>
          </ul>
        </div>

        <div class="col-md-3">
          <h2 class="h6 fw-bold" data-i18n="foot_cta_title">Ready to talk?</h2>
          <p class="small text-muted" data-i18n="foot_cta_text_digital">Tell us about your business and we will point you to the right next step.</p>
          <a class="btn btn-dark btn-sm" href="/book.html" data-i18n="nav_cta">Book Your Free Consultation</a>
        </div>`;
}

function footerSoftware() {
  return `
        <div class="col-md-3">
          <h2 class="h6 fw-bold">GABAN Software</h2>
          <p class="small text-muted mb-3" data-i18n="foot_tagline_software">Ready-to-use software platforms for small businesses that want better operations.</p>
          <ul class="list-unstyled small mb-0">
            <li><a class="text-decoration-none" href="${DIGITAL_URL}" data-i18n="nav_digital">Digital</a></li>
            <li><a class="text-decoration-none" href="${UMBRELLA_URL}" data-i18n="nav_umbrella">GABAN Solutions</a></li>
          </ul>
        </div>

        <div class="col-md-3">
          <h2 class="h6 fw-bold" data-i18n="foot_products">Products</h2>
          <ul class="list-unstyled small mb-0">
            <li><a class="text-decoration-none" href="/garageos.html">GarageOS</a></li>
            <li><a class="text-decoration-none" href="/fieldos.html">FieldOS</a></li>
            <li><a class="text-decoration-none" href="/booking-system.html" data-i18n="foot_booking">Booking System</a></li>
          </ul>
        </div>

        <div class="col-md-3">
          <h2 class="h6 fw-bold" data-i18n="foot_company">Company</h2>
          <ul class="list-unstyled small mb-0">
            <li><a class="text-decoration-none" href="/pricing.html" data-i18n="nav_pricing">Pricing</a></li>
            <li><a class="text-decoration-none" href="/blog" data-i18n="nav_blog">Blog</a></li>
            <li><a class="text-decoration-none" href="/contact.html" data-i18n="nav_contact">Contact</a></li>
          </ul>
        </div>

        <div class="col-md-3">
          <h2 class="h6 fw-bold" data-i18n="foot_cta_title_demo">Want a demo?</h2>
          <p class="small text-muted" data-i18n="foot_cta_text_software">Tell us how your business runs today and we will show you the platform that fits.</p>
          <a class="btn btn-dark btn-sm" href="/book.html" data-i18n="nav_cta">Book Your Free Consultation</a>
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
