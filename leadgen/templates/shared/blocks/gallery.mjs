import { escapeHtml } from "../html.mjs";

function copy(language, fr, en) {
  return language === "fr" ? fr : en;
}

export function gallery(config, page) {
  const allPhotos = config.business?.photos || [];
  // The hero (when this page has one) already shows photos[0] — skip
  // it here so it's not shown twice. Inner pages without a hero (see
  // templates/shared/blocks/pageHeader.mjs) show every photo.
  const sectionOrder = page?.sectionOrder || page?.layout?.sectionOrder || [];
  const usesHeroPhoto = sectionOrder.includes("hero");
  const photos = usesHeroPhoto ? allPhotos.slice(1) : allPhotos;
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
