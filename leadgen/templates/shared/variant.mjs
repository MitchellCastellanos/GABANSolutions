// ============================================================
// Deterministic (not random) variant picking: same slug always
// produces the same layout/palette/hero choice, but different
// slugs spread across the available options. This is what makes
// two dentists both using the "dentist" template not look identical
// — real personalization (copy, real data) still does the heavy
// lifting, this just adds visual variety on top.
// ============================================================

function hashString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 31 + str.charCodeAt(i)) >>> 0;
  }
  return hash;
}

export function pickVariant(seed, options) {
  if (!options || options.length === 0) return undefined;
  const hash = hashString(seed || "");
  return options[hash % options.length];
}

export const HERO_VARIANTS = ["split", "centered", "overlap"];
