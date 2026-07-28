// ============================================================
// "car-repair" category preset — see templates/dentist/index.mjs
// for the pattern this follows.
// ============================================================

import { composeSections } from "../shared/compose.mjs";

export const categoryKey = "car-repair";
export const categoryLabels = ["car_repair", "car repair", "atelier automobile", "ateliers automobiles", "garage"];

export const defaultSectionOrder = ["hero", "trustBar", "about", "services", "gallery", "reviews", "contact"];

export const defaultPalette = {
  primaryColor: "#111820",
  secondaryColor: "#e0a72e",
  accentColor: "#ffffff",
  headingFont: "sans-serif",
  style: "premium-industrial"
};

export const defaultCta = {
  fr: "Obtenir une soumission",
  en: "Get a free quote"
};

export function render(config) {
  return composeSections(config, defaultSectionOrder);
}
