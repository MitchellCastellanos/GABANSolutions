// ============================================================
// Shape of a "Preview Config" (stored as JSON in the Airtable
// "Preview Config JSON" field) + a pure validator that decides
// whether a preview is allowed to move to Preview Status "approved".
//
// No network calls here on purpose — same reasoning as
// leadgen/lib/scoring.mjs: keep this a pure function so it can be
// unit-tested and run standalone from leadgen/scripts/validate-preview.mjs.
// ============================================================

const BANNED_STRINGS = ["lorem ipsum", "example.com", "placeholder", "test business"];
const FAKE_PHONE_PATTERNS = [/555-01\d\d/, /000-0000/, /123-4567/];

function collectStrings(config) {
  const strings = [
    config.content?.eyebrow,
    config.content?.headline,
    config.content?.subheadline,
    config.content?.about,
    config.content?.cta?.label,
    ...(config.content?.services || []),
    ...(config.content?.valueProps || [])
  ];
  return strings.filter((s) => typeof s === "string" && s.length > 0);
}

/**
 * @param {object} config - a PreviewConfig (see leadgen/scripts/generate-preview.mjs for the shape)
 * @param {string[]} knownCategories - registry category keys, to check config.template.category
 */
export function validatePreviewConfig(config, knownCategories = []) {
  const errors = [];
  const warnings = [];

  if (!config?.business?.name) {
    errors.push("business.name is missing");
  }
  if (!config?.content?.headline) {
    errors.push("content.headline is missing");
  }
  if (!config?.content?.cta?.href || config.content.cta.href === "#") {
    errors.push("content.cta.href is missing or a dead link (\"#\")");
  }
  if (!["fr", "en"].includes(config?.language)) {
    errors.push(`language must be "fr" or "en" (got "${config?.language}")`);
  }
  if (knownCategories.length && !knownCategories.includes(config?.template?.category)) {
    errors.push(`template.category "${config?.template?.category}" is not a known template`);
  }

  const allStrings = collectStrings(config).join(" \n ").toLowerCase();
  for (const banned of BANNED_STRINGS) {
    if (allStrings.includes(banned)) {
      errors.push(`Placeholder text found: "${banned}"`);
    }
  }

  const phone = config?.business?.phone || "";
  if (FAKE_PHONE_PATTERNS.some((re) => re.test(phone))) {
    errors.push(`Phone number looks fake: "${phone}"`);
  }

  const services = config?.content?.services || [];
  if (services.length < 2) {
    warnings.push("Fewer than 2 real services listed");
  }
  const photos = config?.business?.photos || [];
  if (photos.length === 0) {
    warnings.push("No photos — gallery section will be hidden");
  }
  const reviews = config?.content?.reviews || [];
  if (reviews.length === 0) {
    warnings.push("No reviews used");
  }
  const city = (config?.business?.city || "").toLowerCase();
  const headline = (config?.content?.headline || "").toLowerCase();
  if (city && !headline.includes(city) && !(config?.content?.subheadline || "").toLowerCase().includes(city)) {
    warnings.push("Headline/subheadline doesn't mention the city — reads generic");
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    score: personalizationScore(config)
  };
}

/** 0-10, informational only — never blocks approval on its own, unlike `errors`. */
export function personalizationScore(config) {
  let score = 0;
  if (config?.business?.logo) score += 1;
  if (config?.branding?.primaryColor && config.branding.primaryColor !== "#111111") score += 1;
  if (config?.business?.phone) score += 1;
  if (config?.business?.address) score += 1;
  if ((config?.content?.services || []).length >= 3) score += 1;
  if ((config?.business?.photos || []).length >= 2) score += 1;
  if ((config?.content?.reviews || []).length > 0) score += 1;
  if ((config?.content?.valueProps || []).length > 0) score += 1;
  const city = (config?.business?.city || "").toLowerCase();
  const headline = (config?.content?.headline || "").toLowerCase();
  if (city && headline.includes(city)) score += 1;
  if (headline && headline.includes((config?.business?.category || "").toLowerCase())) score += 1;
  return score;
}
