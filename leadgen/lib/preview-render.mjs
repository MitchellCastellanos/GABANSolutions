// ============================================================
// Turns a PreviewConfig into a full HTML page: resolve the
// category's template, render its body sections, wrap in the
// shared shell (head/meta/GABAN bar). This is the single function
// api/preview/[slug].js calls once it has loaded a config.
// ============================================================

import { resolveTemplate } from "../templates/registry.mjs";
import { renderShell } from "../templates/shared/shell.mjs";

export function renderPreview(config) {
  const template = resolveTemplate(config.template?.category);
  const bodyHtml = template.render(config);
  return renderShell({ config, bodyHtml });
}
