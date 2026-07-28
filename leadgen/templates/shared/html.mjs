// ============================================================
// Small HTML-building helpers shared by every block/template.
// No framework, no build step — plain functions returning strings,
// same style as the rest of the repo (see api/preview/[slug].js).
// ============================================================

export function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (ch) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  }[ch]));
}

/** Renders nothing (empty string) if `condition` is falsy — used to make optional sections read clearly. */
export function when(condition, html) {
  return condition ? html : "";
}

export function joinSections(parts) {
  return parts.filter(Boolean).join("\n");
}
