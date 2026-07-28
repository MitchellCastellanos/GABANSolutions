import { escapeHtml } from "../html.mjs";

// Cross-page navigation, shared by every page of a multi-page
// preview. `config.pages` is an ordered map (home/services/contact
// today) — this just walks it and links to each page's URL, marking
// whichever one matches `currentPageKey`.
export function navBar(config, currentPageKey) {
  const pages = config.pages || {};
  const slug = config.slug;
  const keys = Object.keys(pages);
  if (keys.length < 2) return "";

  const links = keys.map((key) => {
    const page = pages[key];
    const href = key === "home" ? `/preview/${slug}` : `/preview/${slug}/${page.path || key}`;
    const label = escapeHtml(page.navLabel || key);
    const activeClass = key === currentPageKey ? " nav-link--active" : "";
    return `<a class="nav-link${activeClass}" href="${href}">${label}</a>`;
  }).join("");

  return `<nav class="site-nav"><div class="container site-nav-inner">
    <span class="site-nav-brand">${escapeHtml(config.business?.name || "")}</span>
    <div class="site-nav-links">${links}</div>
  </div></nav>`;
}
