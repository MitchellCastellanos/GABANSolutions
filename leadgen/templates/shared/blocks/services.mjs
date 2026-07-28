import { escapeHtml } from "../html.mjs";

function copy(language, fr, en) {
  return language === "fr" ? fr : en;
}

export function services(config) {
  const list = config.content?.services || [];
  if (list.length === 0) return "";

  const language = config.language === "fr" ? "fr" : "en";
  const title = copy(language, "Nos services", "Our services");

  return `<section class="services"><div class="container">
    <h2>${title}</h2>
    <div class="services-grid">
      ${list.map((item) => `<div class="service-card">${escapeHtml(item)}</div>`).join("\n")}
    </div>
  </div></section>`;
}
