// ============================================================
// "car-repair" category preset — see templates/dentist/index.mjs
// for the pattern this follows.
// ============================================================

import { composeSections } from "../shared/compose.mjs";

export const categoryKey = "car-repair";
export const categoryLabels = ["car_repair", "car repair", "atelier automobile", "ateliers automobiles", "garage"];

export const defaultSectionOrder = ["hero", "trustBar", "about", "services", "gallery", "reviews", "contact"];

export const sectionOrderVariants = [
  ["hero", "trustBar", "about", "services", "gallery", "reviews", "contact"],
  ["hero", "trustBar", "services", "gallery", "about", "reviews", "contact"]
];

export const defaultPalette = {
  primaryColor: "#111820",
  secondaryColor: "#e0a72e",
  accentColor: "#ffffff",
  headingFont: "sans-serif",
  style: "premium-industrial"
};

export const paletteVariants = [
  defaultPalette,
  { primaryColor: "#1a1410", secondaryColor: "#c94f3d", accentColor: "#ffffff", headingFont: "sans-serif", style: "premium-industrial-red" }
];

export const defaultCta = {
  fr: "Obtenir une soumission",
  en: "Get a free quote"
};

export const middlePageLabel = { fr: "Services", en: "Services" };

export function render(config, page) {
  return composeSections(config, page, defaultSectionOrder);
}
