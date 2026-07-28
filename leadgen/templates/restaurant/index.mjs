import { composeSections } from "../shared/compose.mjs";

export const categoryKey = "restaurant";
export const categoryLabels = ["restaurant", "restaurants"];

export const defaultSectionOrder = ["hero", "trustBar", "gallery", "services", "about", "reviews", "contact"];
export const sectionOrderVariants = [
  ["hero", "trustBar", "gallery", "services", "about", "reviews", "contact"],
  ["hero", "trustBar", "about", "services", "gallery", "reviews", "contact"]
];

export const defaultPalette = {
  primaryColor: "#2a140a",
  secondaryColor: "#ffb347",
  accentColor: "#ffffff",
  headingFont: "serif",
  style: "warm-inviting"
};
export const paletteVariants = [
  defaultPalette,
  { primaryColor: "#1c1f16", secondaryColor: "#9fbf5c", accentColor: "#ffffff", headingFont: "serif", style: "warm-inviting-herb" }
];

export const defaultCta = {
  fr: "Réserver une table",
  en: "Reserve a table"
};

export function render(config) {
  return composeSections(config, defaultSectionOrder);
}
