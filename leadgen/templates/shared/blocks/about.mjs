import { escapeHtml } from "../html.mjs";

function copy(language, fr, en) {
  return language === "fr" ? fr : en;
}

export function about(config) {
  const text = config.content?.about;
  const valueProps = config.content?.valueProps || [];
  if (!text && valueProps.length === 0) return "";

  const language = config.language === "fr" ? "fr" : "en";
  const title = copy(language, `À propos de ${escapeHtml(config.business?.name || "")}`, `About ${escapeHtml(config.business?.name || "")}`);

  return `<section class="about"><div class="container">
    <h2>${title}</h2>
    ${text ? `<p>${escapeHtml(text)}</p>` : ""}
    ${valueProps.length ? `<ul>${valueProps.map((v) => `<li>${escapeHtml(v)}</li>`).join("")}</ul>` : ""}
  </div></section>`;
}
