import { escapeHtml } from "../html.mjs";

// The wave always uses #f6f6f4 because every current section-order
// variant (see each templates/<category>/index.mjs) puts trustBar
// right after hero, and trustBar's background is #f6f6f4 — if that
// ever changes, update this fill to match whatever follows the hero.
const WAVE_DIVIDER = `<div class="hero-divider" aria-hidden="true"><svg viewBox="0 0 1440 40" preserveAspectRatio="none"><path d="M0,20 C240,40 480,0 720,10 C960,20 1200,40 1440,20 L1440,40 L0,40 Z" fill="#f6f6f4"></path></svg></div>`;

export function hero(config) {
  const rawVariant = config.layout?.heroVariant;
  const variant = ["centered", "overlap"].includes(rawVariant) ? rawVariant : "split";
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
    return `<section class="hero hero--centered" data-reveal>
      <div class="hero-inner-wrap container">${copyBlock}</div>
      ${WAVE_DIVIDER}
    </section>`;
  }

  if (variant === "overlap") {
    return `<section class="hero hero--overlap" data-reveal>
      <div class="hero-inner-wrap container hero-inner">
        ${copyBlock}
        <div class="hero-media"><img src="${escapeHtml(photo.url)}" alt="${escapeHtml(config.business?.name || "")}"></div>
      </div>
      ${WAVE_DIVIDER}
    </section>`;
  }

  return `<section class="hero hero--split" data-reveal>
    <div class="hero-inner-wrap container hero-inner">
      ${copyBlock}
      <div class="hero-media"><img src="${escapeHtml(photo.url)}" alt="${escapeHtml(config.business?.name || "")}"></div>
    </div>
    ${WAVE_DIVIDER}
  </section>`;
}
