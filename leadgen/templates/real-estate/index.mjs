import { composeSections } from "../shared/compose.mjs";

export const categoryKey = "real-estate";
export const categoryLabels = ["real_estate_agency", "real estate", "agent immobilier", "agents immobiliers", "immobilière", "immobilier"];

export const defaultSectionOrder = ["hero", "trustBar", "about", "gallery", "reviews", "contact"];
export const sectionOrderVariants = [
  ["hero", "trustBar", "about", "gallery", "reviews", "contact"],
  ["hero", "trustBar", "gallery", "about", "reviews", "contact"]
];

export const defaultPalette = {
  primaryColor: "#12202b",
  secondaryColor: "#c9a227",
  accentColor: "#ffffff",
  headingFont: "serif",
  style: "premium-listing"
};
export const paletteVariants = [
  defaultPalette,
  { primaryColor: "#1b1b1f", secondaryColor: "#7e93a8", accentColor: "#ffffff", headingFont: "serif", style: "premium-listing-slate" }
];

export const defaultCta = {
  fr: "Contacter un agent",
  en: "Contact an agent"
};

export const middlePageLabel = { fr: "Services", en: "Services" };

export function render(config, page) {
  return composeSections(config, page, defaultSectionOrder);
}
