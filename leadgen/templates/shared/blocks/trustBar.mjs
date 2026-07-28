import { escapeHtml } from "../html.mjs";

function copy(language, fr, en) {
  return language === "fr" ? fr : en;
}

// trustBar only needs business-level data, not per-page content, but
// still takes `page` so it can be called uniformly through compose.mjs.
export function trustBar(config) {
  const rating = config.business?.rating;
  const reviewCount = config.business?.reviewCount;
  const city = config.business?.city;

  if (!rating && !city) return "";

  const language = config.language === "fr" ? "fr" : "en";
  const stars = rating ? "★".repeat(Math.round(rating)) + "☆".repeat(5 - Math.round(rating)) : "";
  const ratingText = rating
    ? copy(language,
        `<span class="stars">${stars}</span> ${escapeHtml(String(rating))}/5${reviewCount ? ` (${escapeHtml(String(reviewCount))} avis Google)` : ""}`,
        `<span class="stars">${stars}</span> ${escapeHtml(String(rating))}/5${reviewCount ? ` (${escapeHtml(String(reviewCount))} Google reviews)` : ""}`
      )
    : "";
  const cityText = city
    ? copy(language, `Basé à ${escapeHtml(city)}`, `Based in ${escapeHtml(city)}`)
    : "";

  return `<section class="trust-bar" data-reveal><div class="container">
    ${ratingText}${ratingText && cityText ? " · " : ""}${cityText}
  </div></section>`;
}
