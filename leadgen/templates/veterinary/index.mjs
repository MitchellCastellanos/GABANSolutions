import { composeSections } from "../shared/compose.mjs";

export const categoryKey = "veterinary";
export const categoryLabels = ["veterinary_care", "veterinary", "vétérinaire", "vétérinaires"];

export const defaultSectionOrder = ["hero", "trustBar", "services", "about", "reviews", "gallery", "contact"];
export const sectionOrderVariants = [
  ["hero", "trustBar", "services", "about", "reviews", "gallery", "contact"],
  ["hero", "trustBar", "about", "services", "gallery", "reviews", "contact"]
];

export const defaultPalette = {
  primaryColor: "#123c3a",
  secondaryColor: "#8fd3b0",
  accentColor: "#ffffff",
  headingFont: "sans-serif",
  style: "caring-gentle"
};
export const paletteVariants = [
  defaultPalette,
  { primaryColor: "#17263c", secondaryColor: "#f0b95c", accentColor: "#ffffff", headingFont: "sans-serif", style: "caring-gentle-warm" }
];

export const defaultCta = {
  fr: "Prendre rendez-vous",
  en: "Book an appointment"
};

export const middlePageLabel = { fr: "Services", en: "Services" };

export function render(config, page) {
  return composeSections(config, page, defaultSectionOrder);
}
