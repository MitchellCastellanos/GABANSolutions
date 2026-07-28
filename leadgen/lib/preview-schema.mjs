// ============================================================
// Shape of a "Preview Config" (stored as JSON in the Airtable
// "Preview Config JSON" field) + a pure validator that decides
// whether a preview is allowed to move to Preview Status "approved".
//
// A config is either the newer multi-page shape (a `pages` map, e.g.
// { home, services, contact }, each with its own `content`) or the
// legacy single-page shape (no `pages` key — `content` lives directly
// on the config). Every check below walks `pageEntries(config)`, which
// normalizes both shapes to a list of [pageKey, page] pairs, so a
// legacy config is treated as a single "home" page and behaves exactly
// as before.
//
// No network calls here on purpose — same reasoning as
// leadgen/lib/scoring.mjs: keep this a pure function so it can be
// unit-tested and run standalone from leadgen/scripts/validate-preview.mjs.
// ============================================================

const BANNED_STRINGS = ["lorem ipsum", "example.com", "placeholder", "test business"];
const FAKE_PHONE_PATTERNS = [/555-01\d\d/, /000-0000/, /123-4567/];

// Hosts that serve an HTML *page* around an image rather than the raw
// image bytes — pasting one of these into an <img src> renders as a
// broken image. Real example that prompted this: imgur.com/a/... and
// imgur.com/gallery/... album/gallery pages instead of i.imgur.com direct links.
const PAGE_NOT_IMAGE_PATTERNS = [
  /imgur\.com\/a\//i,
  /imgur\.com\/gallery\//i,
  /photos\.google\.com/i,
  /drive\.google\.com/i,
  /facebook\.com/i,
  /instagram\.com/i
];

function isLikelyPageLink(url) {
  return PAGE_NOT_IMAGE_PATTERNS.some((re) => re.test(url));
}

/** "Longueuil, QC" -> "longueuil" — city comparisons should ignore the province suffix. */
function cityNameOnly(city) {
  return (city || "").split(",")[0].trim().toLowerCase();
}

/**
 * Normalizes a config to a list of [pageKey, page] pairs. Multi-page
 * configs return one entry per config.pages key. A legacy single-page
 * config (no `pages` key) returns a single ["home", config] entry —
 * `page` is `config` itself, the same shape every block already
 * expects (see leadgen/lib/preview-render.mjs).
 */
function pageEntries(config) {
  if (config?.pages && typeof config.pages === "object") {
    return Object.entries(config.pages);
  }
  return [["home", config]];
}

/** The home page's entry, for checks (like the city mention) that only make sense on the main landing page. */
function homePage(config) {
  return config?.pages?.home || config;
}

function collectStrings(config) {
  const strings = [];
  for (const [, page] of pageEntries(config)) {
    const content = page?.content || {};
    strings.push(
      content.eyebrow,
      content.headline,
      content.subheadline,
      content.about,
      content.intro,
      content.cta?.label,
      ...(content.services || []),
      ...(content.valueProps || [])
    );
  }
  return strings.filter((s) => typeof s === "string" && s.length > 0);
}

/**
 * @param {object} config - a PreviewConfig (see leadgen/scripts/generate-preview.mjs for the shape)
 * @param {string[]} knownCategories - registry category keys, to check config.template.category
 */
export function validatePreviewConfig(config, knownCategories = []) {
  const errors = [];
  const warnings = [];
  const pages = pageEntries(config);
  const multiPage = pages.length > 1;

  if (!config?.business?.name) {
    errors.push("business.name is missing");
  }
  if (!["fr", "en"].includes(config?.language)) {
    errors.push(`language must be "fr" or "en" (got "${config?.language}")`);
  }
  if (knownCategories.length && !knownCategories.includes(config?.template?.category)) {
    errors.push(`template.category "${config?.template?.category}" is not a known template`);
  }

  for (const [pageKey, page] of pages) {
    const prefix = multiPage ? `Page "${pageKey}": ` : "";
    if (!page?.content?.headline) {
      errors.push(`${prefix}content.headline is missing`);
    }
    if (!page?.content?.cta?.href || page.content.cta.href === "#") {
      errors.push(`${prefix}content.cta.href is missing or a dead link ("#")`);
    }
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

  if (config?.business?.logo && isLikelyPageLink(config.business.logo)) {
    errors.push(`Logo URL looks like a page link, not a direct image (use the raw file URL, e.g. i.imgur.com/xxx.jpg): "${config.business.logo}"`);
  }
  (config?.business?.photos || []).forEach((photo, index) => {
    if (photo?.url && isLikelyPageLink(photo.url)) {
      errors.push(`Photo #${index + 1} URL looks like a page link, not a direct image (use the raw file URL, e.g. i.imgur.com/xxx.jpg): "${photo.url}"`);
    }
  });

  const allServices = pages.flatMap(([, page]) => page?.content?.services || []);
  if (allServices.length < 2) {
    warnings.push("Fewer than 2 real services listed");
  }
  const photos = config?.business?.photos || [];
  if (photos.length === 0) {
    warnings.push("No photos — gallery section will be hidden");
  }
  const allReviews = pages.flatMap(([, page]) => page?.content?.reviews || []);
  if (allReviews.length === 0) {
    warnings.push("No reviews used");
  }
  const city = cityNameOnly(config?.business?.city);
  const home = homePage(config);
  const headline = (home?.content?.headline || "").toLowerCase();
  const subheadline = (home?.content?.subheadline || "").toLowerCase();
  if (city && !headline.includes(city) && !subheadline.includes(city)) {
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
  const pages = pageEntries(config);
  const home = homePage(config);
  const allServices = pages.flatMap(([, page]) => page?.content?.services || []);
  const allReviews = pages.flatMap(([, page]) => page?.content?.reviews || []);
  const hasValueProps = pages.some(([, page]) => (page?.content?.valueProps || []).length > 0);

  if (config?.business?.logo) score += 1;
  if (config?.branding?.primaryColor && config.branding.primaryColor !== "#111111") score += 1;
  if (config?.business?.phone) score += 1;
  if (config?.business?.address) score += 1;
  if (allServices.length >= 3) score += 1;
  if ((config?.business?.photos || []).length >= 2) score += 1;
  if (allReviews.length > 0) score += 1;
  if (hasValueProps) score += 1;
  const city = cityNameOnly(config?.business?.city);
  const headline = (home?.content?.headline || "").toLowerCase();
  if (city && headline.includes(city)) score += 1;
  if (headline && headline.includes((config?.business?.category || "").toLowerCase())) score += 1;
  return score;
}
