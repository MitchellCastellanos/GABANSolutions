import { composeSections } from "../shared/compose.mjs";

export const categoryKey = "gym";
export const categoryLabels = ["gym", "studio", "gyms", "studios"];

export const defaultSectionOrder = ["hero", "trustBar", "services", "gallery", "about", "reviews", "contact"];
export const sectionOrderVariants = [
  ["hero", "trustBar", "services", "gallery", "about", "reviews", "contact"],
  ["hero", "trustBar", "gallery", "services", "reviews", "about", "contact"]
];

export const defaultPalette = {
  primaryColor: "#161616",
  secondaryColor: "#e2432b",
  accentColor: "#ffffff",
  headingFont: "sans-serif",
  style: "bold-energetic"
};
export const paletteVariants = [
  defaultPalette,
  { primaryColor: "#101820", secondaryColor: "#3fd0c9", accentColor: "#ffffff", headingFont: "sans-serif", style: "bold-energetic-teal" }
];

export const defaultCta = {
  fr: "Essai gratuit",
  en: "Start a free trial"
};

export function render(config) {
  return composeSections(config, defaultSectionOrder);
}
