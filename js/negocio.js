// ============================================================
// Mi Tarjeta Pro · JSON-driven business card renderer
// Reads ?n=<slug> → fetches /negocio/_data/<slug>.json → renders
// ============================================================

(function () {
  const app = document.getElementById("bizApp");
  if (!app) return;

  // ---------- helpers ----------
  const params = new URLSearchParams(window.location.search);
  const slug = (params.get("n") || "").trim().toLowerCase().replace(/[^a-z0-9-]/g, "");

  const DAYS_ES = { mon:"Lunes", tue:"Martes", wed:"Miércoles", thu:"Jueves", fri:"Viernes", sat:"Sábado", sun:"Domingo" };
  const DAY_ORDER = ["mon","tue","wed","thu","fri","sat","sun"];
  const DAY_TO_INDEX = { sun:0, mon:1, tue:2, wed:3, thu:4, fri:5, sat:6 };

  const ICON_LIB = {
    "calendar2-check":"bi-calendar2-check",
    "calendar":"bi-calendar2",
    "whatsapp":"bi-whatsapp", "wa":"bi-whatsapp",
    "instagram":"bi-instagram", "ig":"bi-instagram",
    "facebook":"bi-facebook", "fb":"bi-facebook",
    "tiktok":"bi-tiktok", "tt":"bi-tiktok",
    "twitter":"bi-twitter-x", "x":"bi-twitter-x",
    "geo-alt-fill":"bi-geo-alt-fill", "map":"bi-geo-alt-fill", "ubicacion":"bi-geo-alt-fill",
    "globe2":"bi-globe2", "web":"bi-globe2",
    "menu":"bi-card-list", "carta":"bi-card-list",
    "star":"bi-star-fill",
    "email":"bi-envelope-fill",
    "phone":"bi-telephone-fill",
    "shop":"bi-shop"
  };

  function escapeHtml(str) {
    return String(str ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function iconClass(key) {
    return ICON_LIB[(key || "").toLowerCase()] || "bi-arrow-right-circle";
  }

  function withUtm(url) {
    if (!url) return "#";
    if (/^(wa\.me|https?:\/\/wa\.me|https?:\/\/(www\.)?google\.com\/maps|https?:\/\/maps\.app\.goo\.gl)/.test(url)) return url;
    if (url.startsWith("mailto:") || url.startsWith("tel:")) return url;
    try {
      const u = new URL(url);
      if (!u.searchParams.has("utm_source")) {
        u.searchParams.set("utm_source", "mitarjetapro");
        u.searchParams.set("utm_medium", "qr");
      }
      return u.toString();
    } catch {
      return url;
    }
  }

  // ---------- status computation ----------
  function mexicoNowParts() {
    // Return { dayKey, minutes } using America/Mexico_City
    const fmt = new Intl.DateTimeFormat("en-US", {
      timeZone: "America/Mexico_City",
      weekday: "short",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false
    });
    const parts = fmt.formatToParts(new Date());
    const wd = parts.find(p => p.type === "weekday").value.toLowerCase(); // "mon","tue"...
    const h  = parseInt(parts.find(p => p.type === "hour").value, 10);
    const m  = parseInt(parts.find(p => p.type === "minute").value, 10);
    return { dayKey: wd, minutes: h * 60 + m };
  }

  function parseHourRange(range) {
    if (!range || range === "closed") return null;
    const m = range.match(/^(\d{1,2}):(\d{2})\s*-\s*(\d{1,2}):(\d{2})$/);
    if (!m) return null;
    return {
      from: parseInt(m[1], 10) * 60 + parseInt(m[2], 10),
      to:   parseInt(m[3], 10) * 60 + parseInt(m[4], 10),
      label: `${m[1]}:${m[2]} – ${m[3]}:${m[4]}`
    };
  }

  function formatTime12(minutes) {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    const period = h >= 12 ? "pm" : "am";
    const h12 = h % 12 === 0 ? 12 : h % 12;
    return `${h12}:${String(m).padStart(2,"0")} ${period}`;
  }

  function computeStatus(hours) {
    if (!hours) return null;
    const now = mexicoNowParts();
    const today = parseHourRange(hours[now.dayKey]);

    if (today && now.minutes >= today.from && now.minutes < today.to) {
      return { open: true, text: `Abierto · cierra a las ${formatTime12(today.to)}` };
    }

    if (today && now.minutes < today.from) {
      return { open: false, text: `Cerrado · abre hoy a las ${formatTime12(today.from)}` };
    }

    // find next opening day
    const todayIdx = DAY_ORDER.indexOf(now.dayKey);
    for (let i = 1; i <= 7; i++) {
      const nextKey = DAY_ORDER[(todayIdx + i) % 7];
      const next = parseHourRange(hours[nextKey]);
      if (next) {
        return { open: false, text: `Cerrado · abre ${DAYS_ES[nextKey]} a las ${formatTime12(next.from)}` };
      }
    }
    return { open: false, text: "Cerrado temporalmente" };
  }

  // ---------- renderers ----------
  function renderNotFound() {
    app.dataset.state = "notfound";
    app.innerHTML = `
      <div class="biz-wrap">
        <div class="biz-notfound">
          <h1>Esta tarjeta no está disponible</h1>
          <p>El link puede estar mal escrito o la tarjeta aún no se publica.</p>
          <a class="cta" href="../mi-tarjeta.html">Conoce Mi Tarjeta Pro →</a>
        </div>
        <a class="gaban-credit" href="../mi-tarjeta.html">
          <i class="bi bi-stars"></i>
          <span>Diseñado por <strong>GABAN Solutions</strong></span>
        </a>
      </div>
    `;
  }

  function renderLink(link) {
    const styleClass = link.style ? ` ${escapeHtml(link.style)}` : "";
    const popular = link.popular ? `<span class="biz-pill-pop">POPULAR</span>` : "";
    const subtitle = link.subtitle ? `<div class="t2">${escapeHtml(link.subtitle)}</div>` : "";
    return `
      <a href="${escapeHtml(withUtm(link.url))}" target="_blank" rel="noopener" class="biz-link${styleClass}">
        <div class="ico-wrap"><i class="bi ${iconClass(link.icon || link.style)}"></i></div>
        <div>
          <div class="t1">${escapeHtml(link.label)} ${popular}</div>
          ${subtitle}
        </div>
        <div class="arr">›</div>
      </a>
    `;
  }

  function renderService(s) {
    const desc = s.desc ? `<div class="desc">${escapeHtml(s.desc)}</div>` : "";
    const price = s.price ? `<div class="price">${escapeHtml(s.price)}</div>` : "";
    return `
      <div class="biz-service">
        <div class="info">
          <div class="name">${escapeHtml(s.name)}</div>
          ${desc}
        </div>
        ${price}
      </div>
    `;
  }

  function renderHours(hours, todayKey) {
    if (!hours) return "";
    const rows = DAY_ORDER.map(k => {
      const range = hours[k];
      const parsed = parseHourRange(range);
      const isToday = k === todayKey ? " today" : "";
      const display = parsed ? parsed.label : "Cerrado";
      const closedCls = parsed ? "" : " closed";
      return `<div class="row-h"><span class="day${isToday}">${DAYS_ES[k]}</span><span class="hour${closedCls}">${display}</span></div>`;
    }).join("");
    return `<div class="biz-hours">${rows}</div>`;
  }

  function renderGallery(items) {
    if (!items || !items.length) return "";
    return items.slice(0, 9).map(src => {
      if (src) {
        return `<div class="cell"><img src="${escapeHtml(src)}" alt="" loading="lazy"></div>`;
      }
      return `<div class="cell"><i class="bi bi-image"></i></div>`;
    }).join("");
  }

  function render(data) {
    app.dataset.state = "ready";

    const theme = data.theme || "dark-gold";
    document.body.setAttribute("data-theme", theme);

    const title = `${data.business?.name || "Tarjeta digital"} · Mi Tarjeta Pro`;
    document.title = title;

    const status = data.status?.hours ? computeStatus(data.status.hours) : null;
    const todayKey = mexicoNowParts().dayKey;

    const showRating = typeof data.business?.rating === "number";
    const showEst = !!data.business?.established;

    const statusHtml = status
      ? `<span><span class="dot ${status.open ? "open" : "closed"}"></span>${escapeHtml(status.text)}</span>`
      : "";
    const sepIfMore = (statusHtml && (showRating || showEst)) ? `<span class="sep"></span>` : "";
    const ratingHtml = showRating ? `<span><i class="bi bi-star-fill"></i>${data.business.rating.toFixed(1)}</span>` : "";
    const sepRatingEst = (showRating && showEst) ? `<span class="sep"></span>` : "";
    const estHtml = showEst ? `<span><i class="bi bi-calendar-check"></i>Est. ${escapeHtml(String(data.business.established))}</span>` : "";

    const logoHtml = data.business?.logoUrl
      ? `<img src="${escapeHtml(data.business.logoUrl)}" alt="${escapeHtml(data.business?.name || "Logo")}">`
      : (function () {
          const initials = (data.business?.name || "MN").split(/\s+/).map(w => w[0]).join("").slice(0,2).toUpperCase();
          return `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" aria-hidden="true">
            <text x="50" y="62" text-anchor="middle" font-family="Cormorant Garamond, serif" font-size="38" font-weight="700" fill="currentColor">${escapeHtml(initials)}</text>
          </svg>`;
        })();

    const primary = data.primaryCta;
    const primaryHtml = primary?.url
      ? `<a href="${escapeHtml(withUtm(primary.url))}" target="_blank" rel="noopener" class="biz-cta-primary">
           <div class="row-cta">
             <div class="ico"><i class="bi ${iconClass(primary.icon)}"></i></div>
             <div>
               <div class="t1 serif">${escapeHtml((primary.label || "AGENDAR").toUpperCase())}</div>
               ${primary.subtitle ? `<div class="t2">${escapeHtml(primary.subtitle)}</div>` : ""}
             </div>
             <div class="arr">→</div>
           </div>
         </a>`
      : "";

    const linksHtml = (data.links || []).map(renderLink).join("");

    const servicesBlock = (data.services && data.services.length)
      ? `
        <div class="biz-section-title">
          <div class="line"></div>
          <h2>${escapeHtml(data.servicesTitle || "SERVICIOS Y PRECIOS")}</h2>
          <div class="line"></div>
        </div>
        ${data.services.map(renderService).join("")}
        ${data.servicesDisclaimer ? `<div class="biz-disclaimer">${escapeHtml(data.servicesDisclaimer)}</div>` : ""}
      `
      : "";

    const galleryItems = renderGallery(data.gallery);
    const galleryBlock = galleryItems
      ? `
        <div class="biz-section-title">
          <div class="line"></div>
          <h2>GALERÍA</h2>
          <div class="line"></div>
        </div>
        <div class="biz-gallery">${galleryItems}</div>
      `
      : "";

    const brandBlock = data.brandCardCopy
      ? `
        <div class="biz-brand-card">
          <div class="mini-logo">${logoHtml}</div>
          <div>
            <div class="t1">${escapeHtml(data.business?.name || "")}</div>
            <div class="t2">${escapeHtml(data.brandCardCopy)}</div>
          </div>
        </div>
        <div class="biz-symbol"><i class="bi bi-stars"></i></div>
      `
      : "";

    const hoursBlock = data.status?.hours
      ? `
        <div class="biz-section-title">
          <div class="line"></div>
          <h2>HORARIOS</h2>
          <div class="line"></div>
        </div>
        ${renderHours(data.status.hours, todayKey)}
      `
      : "";

    app.innerHTML = `
      <div class="biz-wrap">
        <section class="biz-hero">
          <div class="biz-logo">${logoHtml}</div>
          <h1 class="biz-name serif">${escapeHtml(data.business?.name || "")}</h1>
          ${data.business?.subname ? `<div class="biz-sub serif">${escapeHtml(data.business.subname)} ${data.business.verified ? `<span class="biz-verified">✓</span>` : ""}</div>` : ""}
          ${data.business?.tagline ? `<p class="biz-tag">${escapeHtml(data.business.tagline)}</p>` : ""}
          ${(statusHtml || ratingHtml || estHtml)
            ? `<div class="biz-status">${statusHtml}${sepIfMore}${ratingHtml}${sepRatingEst}${estHtml}</div>`
            : ""}
        </section>

        ${primaryHtml}
        ${linksHtml}
        ${servicesBlock}
        ${galleryBlock}
        ${brandBlock}
        ${hoursBlock}

        ${data.copyright ? `<div class="biz-copy">${escapeHtml(data.copyright)}</div>` : ""}

        <a class="gaban-credit" href="../mi-tarjeta.html">
          <i class="bi bi-stars"></i>
          <span>Diseñado por <strong>GABAN Solutions</strong></span>
        </a>
      </div>
    `;
  }

  // ---------- bootstrap ----------
  if (!slug) {
    renderNotFound();
    return;
  }

  fetch(`./_data/${slug}.json`, { cache: "no-cache" })
    .then(r => {
      if (!r.ok) throw new Error("not found");
      return r.json();
    })
    .then(render)
    .catch(renderNotFound);
})();
