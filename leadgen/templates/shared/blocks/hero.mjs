import { escapeHtml } from "../html.mjs";

export function hero(config) {
  const variant = config.layout?.heroVariant === "centered" ? "centered" : "split";
  const c = config.content || {};
  const photo = (config.business?.photos || [])[0];

  const copyBlock = `
    <div class="hero-copy">
      ${c.eyebrow ? `<div class="hero-eyebrow">${escapeHtml(c.eyebrow)}</div>` : ""}
      <h1>${escapeHtml(c.headline || config.business?.name || "")}</h1>
      ${c.subheadline ? `<p>${escapeHtml(c.subheadline)}</p>` : ""}
      ${c.cta?.label ? `<a class="cta-btn" href="${escapeHtml(c.cta.href || "#")}">${escapeHtml(c.cta.label)}</a>` : ""}
    </div>`;

  if (variant === "centered" || !photo) {
    return `<section class="hero hero--centered"><div class="container">${copyBlock}</div></section>`;
  }

  return `<section class="hero hero--split"><div class="container hero-inner">
    ${copyBlock}
    <div class="hero-media"><img src="${escapeHtml(photo.url)}" alt="${escapeHtml(config.business?.name || "")}"></div>
  </div></section>`;
}
