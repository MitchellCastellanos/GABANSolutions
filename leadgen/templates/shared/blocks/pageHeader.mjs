import { escapeHtml } from "../html.mjs";

// Lightweight banner for inner pages (Services/Menu, Contact) — same
// brand color as the hero, but short, so those pages don't repeat a
// full-height hero. `page` is the current entry from config.pages.
export function pageHeader(config, page) {
  const content = page?.content || {};
  return `<section class="page-header" data-reveal><div class="container">
    <h1>${escapeHtml(content.headline || page?.navLabel || "")}</h1>
    ${content.intro ? `<p>${escapeHtml(content.intro)}</p>` : ""}
  </div></section>`;
}
