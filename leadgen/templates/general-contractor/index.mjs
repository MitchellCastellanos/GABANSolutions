import { composeSections } from "../shared/compose.mjs";

export const categoryKey = "general-contractor";
export const categoryLabels = ["general_contractor", "general contractor", "entrepreneur", "entrepreneurs", "rénovation", "renovation"];

export const defaultSectionOrder = ["hero", "trustBar", "services", "gallery", "about", "reviews", "contact"];
export const sectionOrderVariants = [
  ["hero", "trustBar", "services", "gallery", "about", "reviews", "contact"],
  ["hero", "trustBar", "gallery", "services", "about", "reviews", "contact"]
];

export const defaultPalette = {
  primaryColor: "#0a1a2a",
  secondaryColor: "#6ab0ff",
  accentColor: "#ffffff",
  headingFont: "sans-serif",
  style: "solid-reliable"
};
export const paletteVariants = [
  defaultPalette,
  { primaryColor: "#1c1c1c", secondaryColor: "#e8b23d", accentColor: "#ffffff", headingFont: "sans-serif", style: "solid-reliable-amber" }
];

export const defaultCta = {
  fr: "Obtenir une soumission",
  en: "Get a free quote"
};

export const middlePageLabel = { fr: "Services", en: "Services" };

export function render(config, page) {
  return composeSections(config, page, defaultSectionOrder);
}
