import { escapeHtml } from "../html.mjs";

function copy(language, fr, en) {
  return language === "fr" ? fr : en;
}

export function reviews(config) {
  const list = config.content?.reviews || [];
  if (list.length === 0) return "";

  const language = config.language === "fr" ? "fr" : "en";
  const title = copy(language, "Ce que disent leurs clients", "What their customers say");
  const attribution = copy(language, "— Avis public Google", "— Public Google review");

  return `<section class="reviews"><div class="container">
    <h2>${title}</h2>
    <div class="reviews-grid">
      ${list.map((r) => `
        <div class="review-card">
          ${r.rating ? `<div class="stars">${"★".repeat(Math.round(r.rating))}</div>` : ""}
          <p>"${escapeHtml(r.text)}"</p>
          <div>${escapeHtml(r.author || "")} ${attribution}</div>
        </div>
      `).join("\n")}
    </div>
  </div></section>`;
}
