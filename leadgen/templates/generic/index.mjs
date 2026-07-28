// ============================================================
// Fallback template for any category without a dedicated preset
// yet. Neutral palette/copy — used by registry.mjs when
// template.category doesn't match a known key, so an unmapped
// business still gets a working (if less tailored) preview instead
// of a broken page.
// ============================================================

import { composeSections } from "../shared/compose.mjs";

export const categoryKey = "generic";
export const categoryLabels = [];

export const defaultSectionOrder = ["hero", "trustBar", "services", "about", "reviews", "gallery", "contact"];

export const sectionOrderVariants = [defaultSectionOrder];

export const defaultPalette = {
  primaryColor: "#171717",
  secondaryColor: "#c9a227",
  accentColor: "#ffffff",
  headingFont: "sans-serif",
  style: "neutral"
};

export const paletteVariants = [defaultPalette];

export const defaultCta = {
  fr: "Nous contacter",
  en: "Get in touch"
};

export const middlePageLabel = { fr: "Services", en: "Services" };

export function render(config, page) {
  return composeSections(config, page, defaultSectionOrder);
}
