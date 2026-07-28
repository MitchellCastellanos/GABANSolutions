import { composeSections } from "../shared/compose.mjs";

export const categoryKey = "spa";
export const categoryLabels = ["spa", "clinique esthétique", "cliniques esthétiques", "esthétique", "beauty"];

export const defaultSectionOrder = ["hero", "trustBar", "gallery", "services", "about", "reviews", "contact"];
export const sectionOrderVariants = [
  ["hero", "trustBar", "gallery", "services", "about", "reviews", "contact"],
  ["hero", "trustBar", "services", "about", "gallery", "reviews", "contact"]
];

export const defaultPalette = {
  primaryColor: "#2a1420",
  secondaryColor: "#d4b86a",
  accentColor: "#ffffff",
  headingFont: "serif",
  style: "elegant-calm"
};
export const paletteVariants = [
  defaultPalette,
  { primaryColor: "#22242a", secondaryColor: "#a7c4bc", accentColor: "#ffffff", headingFont: "rounded", style: "elegant-calm-sage" }
];

export const defaultCta = {
  fr: "Prendre rendez-vous",
  en: "Book an appointment"
};

export function render(config) {
  return composeSections(config, defaultSectionOrder);
}
