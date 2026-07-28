import { composeSections } from "../shared/compose.mjs";

export const categoryKey = "lawyer";
export const categoryLabels = ["lawyer", "avocat", "avocats"];

export const defaultSectionOrder = ["hero", "trustBar", "about", "services", "reviews", "contact"];
export const sectionOrderVariants = [
  ["hero", "trustBar", "about", "services", "reviews", "contact"],
  ["hero", "trustBar", "services", "about", "reviews", "contact"]
];

export const defaultPalette = {
  primaryColor: "#101a2e",
  secondaryColor: "#b8963f",
  accentColor: "#ffffff",
  headingFont: "serif",
  style: "trusted-professional"
};
export const paletteVariants = [
  defaultPalette,
  { primaryColor: "#151515", secondaryColor: "#8fa6c9", accentColor: "#ffffff", headingFont: "serif", style: "trusted-professional-slate" }
];

export const defaultCta = {
  fr: "Réserver une consultation",
  en: "Book a consultation"
};

export const middlePageLabel = { fr: "Domaines de pratique", en: "Practice Areas" };

export function render(config, page) {
  return composeSections(config, page, defaultSectionOrder);
}
