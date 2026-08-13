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

// Same angles, but country-wide instead of tied to one leadgen city — GABAN
// serves clients across Canada even though outbound prospecting (leadgen)
// is still Montreal-area only for now. These posts target searches like
// "local SEO for dentists Canada" that a Montreal-only post wouldn't rank for.
const CATEGORY_NATIONAL_ANGLES = [
  ({ category }) => `How ${category} Across Canada Can Get Found on Google (and ChatGPT)`,
  ({ category }) => `5 Ways ${category} Across Canada Can Win More Local Customers Online`,
  ({ category }) => `Local SEO for ${category}: A Practical Guide for Canadian Businesses`,
  ({ category }) => `Why ${category} Are Losing Customers to Competitors With Better Websites`
];

export function categoryNationalTopic(categoryKey, angleIndex = 0) {
  const cat = categoryByKey(categoryKey);
  if (!cat) throw new Error(`Unknown category key "${categoryKey}" — see leadgen/config/targets.json`);
  const category = categoryDisplayLabel(categoryKey);
  const angleFn = CATEGORY_NATIONAL_ANGLES[angleIndex % CATEGORY_NATIONAL_ANGLES.length];
  return {
    title: angleFn({ category }),
    categoryKey,
    categoryLabel: category,
    city: null,
    kind: "category-national"
  };
}

/** One national (no-city) topic per category, one angle each (deterministic, not random). */
export function suggestCategoryNationalTopics() {
  return getCategories().map((cat, i) => categoryNationalTopic(cat.templateCategory, i % CATEGORY_NATIONAL_ANGLES.length));
}

// General GABAN-service topics, not tied to one category — top-of-
// funnel content about what GABAN actually sells (websites, local
// SEO, automations, GarageOS, e-commerce, booking, payments). Kept in
// sync by hand with the real catalog in digital.html/software.html —
// see docs/ODOO_CATEGORY_RESEARCH.md for the catalog rationale.
// "FieldOS" was removed: it's not a real product (see that doc's v2
// correction), only GarageOS is.
export const GENERAL_TOPICS = [
  { title: "Why Every Local Business in Canada Needs a Real Website in 2026 (Not Just a Google Business Profile)", kind: "general" },
  { title: "Local SEO 101: How Small Businesses Across Canada Get Found on Google Maps", kind: "general" },
  { title: "What Business Automation Actually Looks Like for a Small Local Business", kind: "general" },
  { title: "How Much Should a Small Business Website Cost in Canada? A Practical Guide", kind: "general" },
  { title: "GarageOS: Why Auto Repair Shops Are Ditching Spreadsheets for Real Shop Management Software", kind: "general" },
  { title: "Google Business Profile vs. a Real Website: Why Local Businesses Need Both", kind: "general" },
  { title: "How to Get More Google Reviews Without Being Pushy", kind: "general" },
  { title: "Stop Paying for Calendly: Why Small Businesses Are Switching to Their Own Booking System", kind: "general" },
  { title: "How to Take Deposits and Get Paid Online Without Opening a Full Online Store", kind: "general" },
  { title: "What a Custom E-Commerce Build Actually Includes (And When a Template Store Isn't Enough)", kind: "general" },
  { title: "Beyond a Link in Bio: What a Real Smart Link Page Can Do for a Local Business", kind: "general" },
  { title: "Why 'Just Get a Website' Isn't Enough Advice Anymore for Small Businesses in Canada", kind: "general" }
];

/** Combined list for a CLI --list picker: category x city topics, then category x Canada topics, then general ones. */
export function suggestTopics() {
  return [...suggestCategoryCityTopics(), ...suggestCategoryNationalTopics(), ...GENERAL_TOPICS];
}
