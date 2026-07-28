import { escapeHtml } from "../html.mjs";

function copy(language, fr, en) {
  return language === "fr" ? fr : en;
}

export function contact(config, page) {
  const language = config.language === "fr" ? "fr" : "en";
  const phone = config.business?.phone;
  const address = config.business?.address;
  const title = page?.content?.contactTitle || copy(language, "Nous joindre", "Get in touch");
  const callLabel = copy(language, "Appeler maintenant", "Call now");
  const cta = page?.content?.cta;

  // No API key needed for a basic embed — Google allows this "output=embed"
  // form without billing, unlike the JS Maps SDK.
  const mapSrc = address ? `https://www.google.com/maps?q=${encodeURIComponent(address)}&output=embed` : "";

  return `<section class="contact" data-reveal><div class="container">
    <h2>${title}</h2>
    ${address ? `<p>${escapeHtml(address)}</p>` : ""}
    ${phone ? `<a class="cta-btn" href="tel:${escapeHtml(phone.replace(/[^0-9+]/g, ""))}">${callLabel}</a>` : ""}
    ${cta?.label ? `<a class="cta-btn" href="${escapeHtml(cta.href || "#")}">${escapeHtml(cta.label)}</a>` : ""}
    ${mapSrc ? `<iframe class="contact-map" src="${mapSrc}" loading="lazy" referrerpolicy="no-referrer-when-downgrade" title="${escapeHtml(config.business?.name || "")}"></iframe>` : ""}
  </div></section>`;
}
