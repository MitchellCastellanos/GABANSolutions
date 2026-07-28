// ============================================================
// "dentist" category preset — default palette, section order and
// bilingual CTA. Templates only supply category-flavored defaults;
// the actual rendering logic lives in templates/shared/compose.mjs
// so every category stays consistent and easy to maintain.
// ============================================================

import { composeSections } from "../shared/compose.mjs";

export const categoryKey = "dentist";
export const categoryLabels = ["dentist", "dentiste", "dentistes"];

export const defaultSectionOrder = ["hero", "trustBar", "services", "about", "reviews", "gallery", "contact"];

export const sectionOrderVariants = [
  ["hero", "trustBar", "services", "about", "reviews", "gallery", "contact"],
  ["hero", "trustBar", "about", "reviews", "services", "gallery", "contact"]
];

export const defaultPalette = {
  primaryColor: "#0b3d63",
  secondaryColor: "#5fb8a8",
  accentColor: "#ffffff",
  headingFont: "sans-serif",
  style: "clean-clinical"
};

export const paletteVariants = [
  defaultPalette,
  { primaryColor: "#123c2e", secondaryColor: "#8fd3b0", accentColor: "#ffffff", headingFont: "sans-serif", style: "clean-clinical-green" }
];

export const defaultCta = {
  fr: "Prendre rendez-vous",
  en: "Book an appointment"
};

export function render(config) {
  return composeSections(config, defaultSectionOrder);
}
