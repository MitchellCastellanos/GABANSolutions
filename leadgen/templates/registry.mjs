// ============================================================
// Maps a template category key -> template module, plus a helper
// to guess the category key from an Airtable "Category" label (the
// French display label from leadgen/config/targets.json — Places
// doesn't give us a stable machine key, only that label, so this is
// a best-effort match, not exact). Unmatched categories fall back
// to templates/generic — see its file header for why that exists.
// ============================================================

import * as dentist from "./dentist/index.mjs";
import * as carRepair from "./car-repair/index.mjs";
import * as lawyer from "./lawyer/index.mjs";
import * as generalContractor from "./general-contractor/index.mjs";
import * as spa from "./spa/index.mjs";
import * as restaurant from "./restaurant/index.mjs";
import * as realEstate from "./real-estate/index.mjs";
import * as gym from "./gym/index.mjs";
import * as veterinary from "./veterinary/index.mjs";
import * as generic from "./generic/index.mjs";

const CATEGORY_MODULES = [
  dentist, carRepair, lawyer, generalContractor, spa,
  restaurant, realEstate, gym, veterinary
];

export const registry = Object.fromEntries(
  CATEGORY_MODULES.map((mod) => [mod.categoryKey, mod]).concat([[generic.categoryKey, generic]])
);

export const knownCategoryKeys = Object.keys(registry);

/** @param {string} airtableCategoryLabel - e.g. "Dentistes" or "Ateliers automobiles" */
export function guessCategoryKey(airtableCategoryLabel) {
  const normalized = (airtableCategoryLabel || "").toLowerCase();
  for (const mod of CATEGORY_MODULES) {
    if (mod.categoryLabels.some((label) => normalized.includes(label))) {
      return mod.categoryKey;
    }
  }
  return generic.categoryKey;
}

export function resolveTemplate(categoryKey) {
  return registry[categoryKey] || generic;
}
