function renderNavbar(activePage = "") {
  return `
  <nav class="navbar navbar-expand-lg bg-white border-bottom sticky-top">
    <div class="container">
      <a class="navbar-brand fw-bold" href="https://gabansolutions.ca/">
        GABAN <span class="fw-normal">Solutions</span>
      </a>

      <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navMain" aria-controls="navMain" aria-expanded="false" aria-label="Toggle navigation">
        <span class="navbar-toggler-icon"></span>
      </button>

      <div class="collapse navbar-collapse" id="navMain">
        <ul class="navbar-nav ms-auto mb-2 mb-lg-0">
          <li class="nav-item">
            <a class="nav-link ${activePage === "home" ? "active" : ""}" href="https://gabansolutions.ca/" data-i18n="nav_home">Home</a>
          </li>
          <li class="nav-item">
            <a class="nav-link ${activePage === "digital" ? "active" : ""}" href="https://digital.gabansolutions.ca/" data-i18n="nav_digital">Digital</a>
          </li>
          <li class="nav-item">
            <a class="nav-link ${activePage === "software" ? "active" : ""}" href="https://software.gabansolutions.ca/" data-i18n="nav_software">Software</a>
          </li>
          <li class="nav-item">
            <a class="nav-link ${activePage === "work" ? "active" : ""}" href="https://gabansolutions.ca/work.html" data-i18n="nav_work">Work</a>
          </li>
          <li class="nav-item">
            <a class="nav-link ${activePage === "about" ? "active" : ""}" href="https://gabansolutions.ca/about.html" data-i18n="nav_about">About</a>
          </li>
          <li class="nav-item">
            <a class="nav-link ${activePage === "contact" ? "active" : ""}" href="https://gabansolutions.ca/contact.html" data-i18n="nav_contact">Contact</a>
          </li>
        </ul>

        <a class="btn btn-dark ms-lg-3" href="https://gabansolutions.ca/contact.html" data-i18n="nav_cta">Book a Free Consultation</a>

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
  <footer class="py-5 border-top">
    <div class="container">
      <div class="row g-4">
        <div class="col-md-3">
          <h2 class="h6 fw-bold">GABAN Solutions</h2>
          <ul class="list-unstyled small mb-0">
            <li><a class="text-decoration-none" href="https://gabansolutions.ca/">Home</a></li>
            <li><a class="text-decoration-none" href="https://gabansolutions.ca/contact.html">Contact</a></li>
            <li><a class="text-decoration-none" href="https://gabansolutions.ca/work.html">Work</a></li>
            <li><a class="text-decoration-none" href="https://gabansolutions.ca/about.html">About</a></li>
          </ul>
        </div>

        <div class="col-md-3">
          <h2 class="h6 fw-bold">GABAN Digital</h2>
          <ul class="list-unstyled small mb-0">
            <li><a class="text-decoration-none" href="https://digital.gabansolutions.ca/#websites">Websites</a></li>
            <li><a class="text-decoration-none" href="https://digital.gabansolutions.ca/#seo">SEO</a></li>
            <li><a class="text-decoration-none" href="https://gabansolutions.ca/express.html">Launch 72H</a></li>
            <li><a class="text-decoration-none" href="https://gabansolutions.ca/grow-package.html">Grow Package</a></li>
          </ul>
        </div>

        <div class="col-md-3">
          <h2 class="h6 fw-bold">GABAN Software</h2>
          <ul class="list-unstyled small mb-0">
            <li><a class="text-decoration-none" href="https://gabansolutions.ca/mi-tarjeta.html">MiMarca.me</a></li>
            <li><a class="text-decoration-none" href="https://software.gabansolutions.ca/#products">GarageOS</a></li>
            <li><a class="text-decoration-none" href="https://software.gabansolutions.ca/#products">FieldOS</a></li>
            <li><a class="text-decoration-none" href="https://software.gabansolutions.ca/#founder-client-program">Founder Client Program</a></li>
          </ul>
        </div>

        <div class="col-md-3">
          <h2 class="h6 fw-bold">Ready to talk?</h2>
          <p class="small text-muted">Start with a clear conversation about what your business needs next.</p>
          <a class="btn btn-dark btn-sm" href="https://gabansolutions.ca/contact.html">Book a Free Consultation</a>
        </div>
      </div>

      <div class="small text-muted mt-4 pt-4 border-top">
        &copy; <span id="year"></span> GABAN Solutions - Montreal, QC
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
