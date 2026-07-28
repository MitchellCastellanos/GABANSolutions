// ============================================================
// Page shell shared by every preview: <head> (meta/noindex/CSS
// variables from branding), the discreet GABAN Solutions bar, and
// the closing "not the real site yet" CTA. Templates only supply
// the body sections; everything here is category-agnostic.
// ============================================================

import { escapeHtml } from "./html.mjs";

function copy(language, fr, en) {
  return language === "fr" ? fr : en;
}

function styleBlock(branding) {
  const primary = branding?.primaryColor || "#111111";
  const secondary = branding?.secondaryColor || "#c9a227";
  const accent = branding?.accentColor || "#ffffff";
  const headingFont = branding?.headingFont === "serif" ? "Georgia, 'Times New Roman', serif" : "'Inter', system-ui, sans-serif";
  const bodyFont = "'Inter', system-ui, -apple-system, sans-serif";

  return `
    :root {
      --primary: ${escapeHtml(primary)};
      --secondary: ${escapeHtml(secondary)};
      --accent: ${escapeHtml(accent)};
      --heading-font: ${headingFont};
      --body-font: ${bodyFont};
    }
    * { box-sizing: border-box; }
    body { margin: 0; font-family: var(--body-font); color: #1a1a1a; line-height: 1.6; }
    h1, h2, h3 { font-family: var(--heading-font); margin: 0 0 0.5rem; }
    img { max-width: 100%; display: block; }
    a { color: inherit; }
    .container { max-width: 1080px; margin: 0 auto; padding: 0 1.5rem; }
    section { padding: 3.5rem 0; }

    .gaban-bar {
      background: #111; color: #fff; font-size: 0.8rem; text-align: center;
      padding: 0.6rem 1rem; position: sticky; top: 0; z-index: 50;
    }
    .gaban-bar a { color: var(--secondary); text-decoration: underline; }

    .hero { background: var(--primary); color: var(--accent); }
    .hero--split .hero-inner { display: flex; flex-wrap: wrap; align-items: center; gap: 2rem; }
    .hero--split .hero-copy { flex: 1 1 320px; }
    .hero--split .hero-media { flex: 1 1 320px; }
    .hero--centered { text-align: center; }
    .hero-eyebrow { text-transform: uppercase; letter-spacing: 0.08em; font-size: 0.8rem; color: var(--secondary); font-weight: 600; }
    .hero h1 { font-size: clamp(1.8rem, 4vw, 2.8rem); }
    .hero p { font-size: 1.1rem; opacity: 0.9; max-width: 40ch; }
    .cta-btn {
      display: inline-block; background: var(--secondary); color: #111; font-weight: 700;
      padding: 0.85rem 1.6rem; border-radius: 8px; text-decoration: none; margin-top: 1.25rem;
    }

    .trust-bar { background: #f6f6f4; text-align: center; font-size: 0.95rem; }
    .trust-bar .stars { color: var(--secondary); font-weight: 700; }

    .services { background: #fff; }
    .services-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1.5rem; margin-top: 1.5rem; }
    .service-card { border: 1px solid #eee; border-radius: 10px; padding: 1.25rem; }

    .about { background: #f6f6f4; }
    .about .container { max-width: 760px; }

    .reviews { background: #fff; }
    .reviews-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 1.5rem; margin-top: 1.5rem; }
    .review-card { background: #f6f6f4; border-radius: 10px; padding: 1.25rem; font-size: 0.95rem; }
    .review-card .stars { color: var(--secondary); }

    .gallery { background: #f6f6f4; }
    .gallery-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 0.75rem; margin-top: 1.5rem; }
    .gallery-grid img { border-radius: 8px; aspect-ratio: 4/3; object-fit: cover; }

    .contact { background: var(--primary); color: var(--accent); text-align: center; }
    .contact a.cta-btn { margin: 0 0.5rem; }

    .concept-footer { background: #111; color: #999; font-size: 0.8rem; text-align: center; padding: 2rem 1rem; }
    .concept-footer strong { color: #fff; }

    @media (max-width: 640px) {
      section { padding: 2.5rem 0; }
    }
  `;
}

export function renderShell({ config, bodyHtml }) {
  const name = escapeHtml(config.business?.name || "");
  const language = config.language === "fr" ? "fr" : "en";
  const title = copy(language,
    `Concept de site web pour ${name} — GABAN Solutions`,
    `A website concept for ${name} — GABAN Solutions`
  );
  const barText = copy(language,
    `Ceci est un concept privé de site web préparé par GABAN Solutions pour <strong>${name}</strong>. `,
    `This is a private website concept prepared by GABAN Solutions for <strong>${name}</strong>. `
  );
  const barLinkLabel = copy(language, "Parlons-en", "Let's talk about it");
  const contactHref = `https://gabansolutions.ca/contact.html?ref=outbound-proposal&need=New%20website&business=${encodeURIComponent(config.business?.name || "")}`;
  const draftBanner = config.status && config.status !== "approved"
    ? `<div style="background:#ffefc2;color:#5c4400;text-align:center;padding:0.5rem;font-size:0.8rem;">INTERNAL REVIEW — status: ${escapeHtml(config.status)} — not sent to the prospect yet</div>`
    : "";

  return `<!DOCTYPE html>
<html lang="${language}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="robots" content="noindex, nofollow">
  <title>${title}</title>
  <style>${styleBlock(config.branding)}</style>
</head>
<body>
  ${draftBanner}
  <div class="gaban-bar">${barText}<a href="${contactHref}">${barLinkLabel}</a></div>
  ${bodyHtml}
  <div class="concept-footer">
    <strong>GABAN Solutions</strong> — Montreal, QC · hello@gabansolutions.ca · +1 (514) 258-0648<br>
    ${copy(language,
      "Ceci est un concept de démonstration, pas le site officiel de ce commerce.",
      "This is a demonstration concept, not this business's official website."
    )}
  </div>
</body>
</html>`;
}
