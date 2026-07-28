// ============================================================
// Turns a PreviewConfig (single-page legacy shape, or the newer
// multi-page shape with a `pages` map) into a full HTML page for one
// page key.
//
// For a multi-page config, `page` = config.pages[pageKey]. For a
// legacy single-page config (no `pages` key — some already-generated
// previews predate the multi-page system), `page` is just `config`
// itself: the old shape already has `content`/`layout` directly on
// it, which is exactly the same shape every block expects from
// `page`. This is what makes old previews keep rendering unchanged
// without a separate code path.
// ============================================================

import { resolveTemplate } from "../templates/registry.mjs";
import { renderShell } from "../templates/shared/shell.mjs";
import { navBar } from "../templates/shared/blocks/navBar.mjs";

export function renderPreviewPage(config, pageKey = "home") {
  const template = resolveTemplate(config.template?.category);
  const isMultiPage = Boolean(config.pages);
  const resolvedKey = isMultiPage && config.pages[pageKey] ? pageKey : "home";
  const page = isMultiPage ? (config.pages[resolvedKey] || config.pages.home) : config;

  const bodyHtml = template.render(config, page);
  const navHtml = isMultiPage ? navBar(config, resolvedKey) : "";
  const pageTitle = isMultiPage ? page?.navLabel : "";

  return renderShell({ config, bodyHtml, navHtml, pageTitle });
}

/** Back-compat alias for callers that only know about a single page. */
export function renderPreview(config) {
  return renderPreviewPage(config, "home");
}
