// ============================================================
// Blog topic suggestions, built from the same segmentation leadgen
// already prospects (leadgen/config/targets.json — 9 business
// categories x 3 Montreal-area cities). Reused, not duplicated: this
// file only adds an English display label + a few headline "angles"
// on top of that JSON, it doesn't redefine the category/area lists.
//
// Two kinds of topics:
//   - category x city posts ("How dentists in Laval can get more
//     new-patient bookings online") — local-SEO content aimed at the
//     same niches leadgen prospects, so it also works as evidence of
//     expertise when talking to those prospects.
//   - general GABAN-service posts, not tied to a category (websites,
//     local SEO, automations, GarageOS/FieldOS) — top-of-funnel
//     content for anyone searching those terms.
// ============================================================

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TARGETS_PATH = path.join(__dirname, "../../leadgen/config/targets.json");

let _targets;
function targets() {
  if (!_targets) {
    _targets = JSON.parse(readFileSync(TARGETS_PATH, "utf8"));
  }
  return _targets;
}

export function getCategories() {
  return targets().categories;
}

export function getAreas() {
  return targets().areas;
}

// English plural noun for each templateCategory key (targets.json's
// `label` field is French, matching the Quebec French leadgen uses
// for prospect-facing content — the site itself, and this blog, are
// primarily English, so this is the display layer for that).
const CATEGORY_DISPLAY_LABEL = {
  dentist: "Dentists",
  lawyer: "Lawyers",
  "general-contractor": "General Contractors",
  spa: "Spas & Aesthetic Clinics",
  restaurant: "Restaurants",
  "real-estate": "Real Estate Agents",
  gym: "Gyms & Fitness Studios",
  veterinary: "Veterinary Clinics",
  "car-repair": "Auto Repair Shops"
};

export function categoryDisplayLabel(categoryKey) {
  return CATEGORY_DISPLAY_LABEL[categoryKey]
    || categoryKey.split("-").map((w) => w[0].toUpperCase() + w.slice(1)).join(" ");
}

export function categoryByKey(categoryKey) {
  return getCategories().find((c) => c.templateCategory === categoryKey) || null;
}

/** "Laval, QC" -> "Laval" */
export function cityShort(cityLabel) {
  return (cityLabel || "").split(",")[0].trim();
}

// A few interchangeable headline angles for a category x city post.
// Index picked deterministically (or via --angle) so re-running the
// CLI for the same pair doesn't have to always produce the same title.
const CATEGORY_CITY_ANGLES = [
  ({ category, city }) => `How ${category} in ${city} Can Get Found on Google (and ChatGPT)`,
  ({ category, city }) => `5 Ways ${category} in ${city} Can Win More Local Customers Online`,
  ({ category, city }) => `Local SEO for ${category}: A Practical Guide for ${city} Businesses`,
  ({ category, city }) => `Why ${category} in ${city} Are Losing Customers to Competitors With Better Websites`
];

export function categoryCityTopic(categoryKey, cityLabel, angleIndex = 0) {
  const cat = categoryByKey(categoryKey);
  if (!cat) throw new Error(`Unknown category key "${categoryKey}" — see leadgen/config/targets.json`);
  const category = categoryDisplayLabel(categoryKey);
  const city = cityShort(cityLabel);
  const angleFn = CATEGORY_CITY_ANGLES[angleIndex % CATEGORY_CITY_ANGLES.length];
  return {
    title: angleFn({ category, city }),
    categoryKey,
    categoryLabel: category,
    city: cityLabel,
    kind: "category-city"
  };
}

/** Every category x city combination as a suggested topic, one angle each (deterministic, not random). */
export function suggestCategoryCityTopics() {
  const out = [];
  getCategories().forEach((cat, ci) => {
    getAreas().forEach((area, ai) => {
      out.push(categoryCityTopic(cat.templateCategory, area.label, (ci + ai) % CATEGORY_CITY_ANGLES.length));
    });
  });
  return out;
}

// General GABAN-service topics, not tied to one category — top-of-
// funnel content about what GABAN actually sells (websites, local
// SEO, automations, GarageOS/FieldOS).
export const GENERAL_TOPICS = [
  { title: "Why Every Local Business in Montreal Needs a Real Website in 2026 (Not Just a Google Business Profile)", kind: "general" },
  { title: "Local SEO 101: How Small Businesses in Montreal, Laval, and Longueuil Get Found on Google Maps", kind: "general" },
  { title: "What Business Automation Actually Looks Like for a Small Local Business", kind: "general" },
  { title: "How Much Should a Small Business Website Cost in Montreal? A Practical Guide", kind: "general" },
  { title: "GarageOS: Why Auto Repair Shops Are Ditching Spreadsheets for Real Shop Management Software", kind: "general" },
  { title: "FieldOS: Scheduling, Quotes, and Invoicing for Field Service Businesses That Outgrew Paper", kind: "general" },
  { title: "Google Business Profile vs. a Real Website: Why Local Businesses Need Both", kind: "general" },
  { title: "How to Get More Google Reviews Without Being Pushy", kind: "general" }
];

/** Combined list for a CLI --list picker: category x city topics first, then general ones. */
export function suggestTopics() {
  return [...suggestCategoryCityTopics(), ...GENERAL_TOPICS];
}
