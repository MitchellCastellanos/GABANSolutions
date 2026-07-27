// ============================================================
// Pure scoring function for outbound prospects.
//
// Takes the normalized prospect shape produced by prospect.mjs +
// enrich.mjs and returns { score, bucket, signals }. No network
// calls here on purpose — this stays a pure function so the weights
// can be unit-tested and tuned without touching the API scripts.
// ============================================================

export const KNOWN_CHAINS = [
  "mcdonald's", "mcdonalds", "tim hortons", "starbucks", "subway",
  "burger king", "walmart", "costco", "canadian tire", "shoppers drug mart",
  "dollarama", "pharmaprix", "rona", "home depot", "ikea", "winners"
];

export const FREE_BUILDER_HOSTS = [
  "wixsite.com", "weebly.com", "business.site", "godaddysites.com",
  "sites.google.com", "square.site", "myshopify.com"
];

export const SOCIAL_ONLY_HOSTS = [
  "facebook.com", "instagram.com", "m.facebook.com"
];

const BUCKET_THRESHOLDS = { hot: 80, warm: 50 };

function hostnameOf(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, "").toLowerCase();
  } catch {
    return "";
  }
}

function isKnownChain(name) {
  const normalized = (name || "").trim().toLowerCase();
  return KNOWN_CHAINS.some((chain) => normalized.includes(chain));
}

function isFreeBuilderSite(website) {
  const host = hostnameOf(website);
  return FREE_BUILDER_HOSTS.some((h) => host === h || host.endsWith(`.${h}`));
}

function isSocialOnlyLink(website) {
  const host = hostnameOf(website);
  return SOCIAL_ONLY_HOSTS.some((h) => host === h || host.endsWith(`.${h}`));
}

/**
 * @param {object} prospect
 * @param {string} prospect.name
 * @param {string} [prospect.website]
 * @param {number} [prospect.rating]
 * @param {number} [prospect.userRatingsTotal]
 * @param {string} [prospect.businessStatus] - Google Places business_status
 * @param {string} [prospect.phone]
 * @param {string} [prospect.email]
 * @param {string[]} [prospect.categories] - Places `types`, lowercased
 * @param {string[]} [prospect.targetCategories] - whitelist from targets.json
 * @param {object} [prospect.siteAudit] - output of enrich.mjs for prospect.website
 * @param {number} [prospect.siteAudit.performanceScore] - 0-100, PageSpeed
 * @param {boolean} [prospect.siteAudit.mobileFriendly]
 * @param {boolean} [prospect.siteAudit.hasHttps]
 * @param {boolean} [prospect.siteAudit.unreachable] - timeout/404/5xx
 */
export function scoreProspect(prospect) {
  const signals = [];
  let score = 0;

  const hasNoWebsite = !prospect.website || isSocialOnlyLink(prospect.website);
  const freeBuilder = !hasNoWebsite && isFreeBuilderSite(prospect.website);

  if (hasNoWebsite) {
    score += 40;
    signals.push("sin website (o solo red social)");
  } else if (freeBuilder) {
    score += 30;
    signals.push("website en builder gratuito (Wix/Weebly/Google Sites/etc.)");
  }

  const audit = prospect.siteAudit;
  if (!hasNoWebsite && audit) {
    if (audit.unreachable) {
      score += 20;
      signals.push("website caído / no responde");
    }
    if (typeof audit.performanceScore === "number" && audit.performanceScore < 50) {
      score += 25;
      signals.push(`PageSpeed performance bajo (${audit.performanceScore})`);
    }
    if (audit.mobileFriendly === false) {
      score += 15;
      signals.push("no es mobile-friendly");
    }
    if (audit.hasHttps === false) {
      score += 10;
      signals.push("sin HTTPS");
    }
  }

  const rating = typeof prospect.rating === "number" ? prospect.rating : null;
  const reviews = typeof prospect.userRatingsTotal === "number" ? prospect.userRatingsTotal : null;

  if (rating !== null && rating >= 4.0) {
    score += 15;
    signals.push(`buen rating (${rating})`);
  }
  if (reviews !== null && reviews >= 15 && reviews <= 300) {
    score += 15;
    signals.push(`tracción establecida (${reviews} reviews)`);
  }
  if (reviews !== null && reviews < 5) {
    score -= 10;
    signals.push("negocio muy nuevo / pocas reviews");
  }

  if (isKnownChain(prospect.name)) {
    score -= 30;
    signals.push("cadena/franquicia conocida");
  }

  const categories = (prospect.categories || []).map((c) => c.toLowerCase());
  const targetCategories = (prospect.targetCategories || []).map((c) => c.toLowerCase());
  if (targetCategories.length && categories.some((c) => targetCategories.includes(c))) {
    score += 10;
    signals.push("categoría de alto valor");
  }

  const disqualified =
    (prospect.businessStatus && prospect.businessStatus !== "OPERATIONAL") ||
    (!prospect.phone && !prospect.email);

  const clampedScore = Math.max(0, score);
  const bucket = disqualified
    ? "disqualified"
    : clampedScore >= BUCKET_THRESHOLDS.hot
    ? "hot"
    : clampedScore >= BUCKET_THRESHOLDS.warm
    ? "warm"
    : "low";

  return {
    score: clampedScore,
    bucket,
    signals,
    disqualified: Boolean(disqualified),
    disqualifyReason: disqualified
      ? prospect.businessStatus && prospect.businessStatus !== "OPERATIONAL"
        ? `business_status = ${prospect.businessStatus}`
        : "sin teléfono ni email"
      : null
  };
}
