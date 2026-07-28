import { escapeHtml } from "../html.mjs";

function copy(language, fr, en) {
  return language === "fr" ? fr : en;
}

// `page` is the current page's entry from config.pages (or, for a
// legacy single-page config, config itself — same content shape
// either way, see preview-render.mjs).
export function services(config, page) {
  const list = page?.content?.services || [];
  if (list.length === 0) return "";

  const language = config.language === "fr" ? "fr" : "en";
  const title = page?.content?.servicesTitle || copy(language, "Nos services", "Our services");

  return `<section class="services" data-reveal><div class="container">
    <h2>${escapeHtml(title)}</h2>
    <div class="services-grid">
      ${list.map((item) => `<div class="service-card">${escapeHtml(item)}</div>`).join("\n")}
    </div>
  </div></section>`;
}
