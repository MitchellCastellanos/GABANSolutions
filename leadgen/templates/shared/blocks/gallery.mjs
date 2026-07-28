import { escapeHtml } from "../html.mjs";

function copy(language, fr, en) {
  return language === "fr" ? fr : en;
}

export function gallery(config) {
  const photos = (config.business?.photos || []).slice(1); // first photo is used by the hero
  if (photos.length === 0) return "";

  const language = config.language === "fr" ? "fr" : "en";
  const title = copy(language, "Photos", "Photos");

  return `<section class="gallery" data-reveal><div class="container">
    <h2>${title}</h2>
    <div class="gallery-grid">
      ${photos.map((p) => `<img src="${escapeHtml(p.url)}" alt="${escapeHtml(p.caption || config.business?.name || "")}" loading="lazy">`).join("\n")}
    </div>
  </div></section>`;
}
