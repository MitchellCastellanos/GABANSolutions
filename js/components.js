function renderNavbar(activePage = "") {
  return `
  <nav class="navbar navbar-expand-lg bg-white border-bottom sticky-top">
    <div class="container">
      <a class="navbar-brand fw-bold" href="./index.html">
        GABAN <span class="fw-normal">Solutions Numériques</span>
      </a>

      <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navMain" aria-controls="navMain" aria-expanded="false" aria-label="Toggle navigation">
        <span class="navbar-toggler-icon"></span>
      </button>

      <div class="collapse navbar-collapse" id="navMain">
        <ul class="navbar-nav ms-auto mb-2 mb-lg-0">
          <li class="nav-item">
            <a class="nav-link ${activePage === "home" ? "active" : ""}" href="./index.html" data-i18n="nav_home">Home</a>
          </li>
          <li class="nav-item">
            <a class="nav-link ${activePage === "services" ? "active" : ""}" href="./services.html" data-i18n="nav_services">Services</a>
          </li>
          <li class="nav-item">
            <a class="nav-link ${activePage === "grow" ? "active" : ""}" href="./grow-package.html" data-i18n="nav_grow">Grow Package</a>
          </li>
          <li class="nav-item">
            <a class="nav-link ${activePage === "express" ? "active" : ""}" href="./express.html" data-i18n="nav_express">Launch 72H</a>
          </li>
          <li class="nav-item">
            <a class="nav-link nav-link-mt ${activePage === "mi-tarjeta" ? "active" : ""}" href="./mi-tarjeta.html" data-i18n="nav_mitarjeta">
              Mi Tarjeta Pro
              <span class="badge text-bg-warning ms-1 align-middle small">MX</span>
            </a>
          </li>
          <li class="nav-item">
            <a class="nav-link ${activePage === "work" ? "active" : ""}" href="./portfolio.html" data-i18n="nav_work">Work</a>
          </li>
          <li class="nav-item">
            <a class="nav-link ${activePage === "about" ? "active" : ""}" href="./about.html" data-i18n="nav_about">About</a>
          </li>
          <li class="nav-item">
            <a class="nav-link ${activePage === "contact" ? "active" : ""}" href="./contact.html" data-i18n="nav_contact">Contact</a>
          </li>
        </ul>

        <a class="btn btn-dark ms-lg-3" href="./contact.html" data-i18n="nav_cta">Free Consultation</a>

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

function renderFooter() {
  return `
  <footer class="py-4 border-top">
    <div class="container d-flex flex-column flex-md-row align-items-center justify-content-between gap-2">
      <div class="small text-muted">© <span id="year"></span> GABAN Solutions Numériques — Montréal, QC</div>
      <div class="small">
        <a class="text-decoration-none me-3" href="./services.html" data-i18n="nav_services">Services</a>
        <a class="text-decoration-none me-3" href="./grow-package.html" data-i18n="nav_grow">Grow Package</a>
        <a class="text-decoration-none me-3" href="./express.html" data-i18n="nav_express">Launch 72H</a>
        <a class="text-decoration-none me-3" href="./mi-tarjeta.html" data-i18n="nav_mitarjeta">Mi Tarjeta Pro</a>
        <a class="text-decoration-none me-3" href="./portfolio.html" data-i18n="nav_work">Work</a>
        <a class="text-decoration-none me-3" href="./about.html" data-i18n="nav_about">About</a>
        <a class="text-decoration-none" href="./contact.html" data-i18n="nav_contact">Contact</a>
      </div>
    </div>
  </footer>
  `;
}

function mountSharedLayout(activePage = "") {
  const navbarHost = document.getElementById("site-navbar");
  const footerHost = document.getElementById("site-footer");

  if (navbarHost) navbarHost.innerHTML = renderNavbar(activePage);

  if (footerHost) {
    footerHost.innerHTML = renderFooter();
    const yearEl = document.getElementById("year");
    if (yearEl) yearEl.textContent = new Date().getFullYear();
  }
}
