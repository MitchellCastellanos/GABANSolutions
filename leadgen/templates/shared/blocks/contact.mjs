import { escapeHtml } from "../html.mjs";

function copy(language, fr, en) {
  return language === "fr" ? fr : en;
}

export function contact(config) {
  const language = config.language === "fr" ? "fr" : "en";
  const phone = config.business?.phone;
  const address = config.business?.address;
  const title = copy(language, "Nous joindre", "Get in touch");
  const callLabel = copy(language, "Appeler maintenant", "Call now");

  return `<section class="contact" data-reveal><div class="container">
    <h2>${title}</h2>
    ${address ? `<p>${escapeHtml(address)}</p>` : ""}
    ${phone ? `<a class="cta-btn" href="tel:${escapeHtml(phone.replace(/[^0-9+]/g, ""))}">${callLabel}</a>` : ""}
    ${config.content?.cta?.label ? `<a class="cta-btn" href="${escapeHtml(config.content.cta.href || "#")}">${escapeHtml(config.content.cta.label)}</a>` : ""}
  </div></section>`;
}
