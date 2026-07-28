#!/usr/bin/env node
// ============================================================
// leadgen/scripts/generate-preview.mjs
//
// Builds (or safely refreshes) a "Preview Config" for one prospect
// from what's already in Airtable (Name, Phone, Address, City,
// Category, Rating, Review Count, Signals) and writes it to the
// "Preview Config JSON" field with "Preview Status" = "draft".
//
// A fresh config is a real 3-page mini-site: home, a middle page
// (label varies by category — "Services", "Menu" for restaurants,
// "Programs" for gyms, "Practice Areas" for lawyers), and contact.
// See leadgen/lib/preview-render.mjs and templates/shared/blocks/
// navBar.mjs for how those pages get rendered/linked.
//
// Safe to re-run: if a config already exists (someone has been
// editing services/photos/reviews by hand), re-running this script
// does NOT overwrite that work — it only refreshes business.logo and
// branding colors from the "Logo URL" / "Primary Color" / "Secondary
// Color" Airtable fields (both are top-level, shared by every page),
// so you can fill those in later and re-run without losing anything.
//
// Deliberately does NOT fetch photos automatically — Google Places
// Photo Media URLs require the API key as a query param, which
// would leak straight into the rendered page's HTML if embedded
// directly. Photos stay a manual step (paste a hosted URL into the
// config) until a server-side photo proxy is built.
//
// The core logic is exported as generatePreviewForSlug() so
// api/cron/generate-preview.js can call it directly over HTTP (for
// mobile use via leadgen-admin.html) without shelling out to this
// CLI — see that file for the mobile trigger flow.
//
// Usage:
//   node leadgen/scripts/generate-preview.mjs --slug=<slug> [--dry-run]
//
// Required env vars: AIRTABLE_API_KEY, AIRTABLE_BASE_ID.
// ============================================================

import { fileURLToPath } from "node:url";
import { findByField, updateRecord } from "../lib/airtable.mjs";
import { F, PREVIEW_STATUS } from "../lib/fields.mjs";
import { guessCategoryKey, resolveTemplate, knownCategoryKeys } from "../templates/registry.mjs";
import { pickVariant, HERO_VARIANTS } from "../templates/shared/variant.mjs";

const NAV_LABELS = {
  home: { fr: "Accueil", en: "Home" },
  contact: { fr: "Contact", en: "Contact" }
};

function parseSignals(signalsText) {
  if (!signalsText) return [];
  return signalsText.split(",").map((s) => s.trim()).filter(Boolean);
}

function valuePropsFromSignals(signals, language) {
  const has = (needle) => signals.some((s) => s.toLowerCase().includes(needle));
  const props = [];
  if (has("no mobile-friendly") || has("performance")) {
    props.push(language === "fr"
      ? "Conçu pour bien fonctionner sur mobile, contrairement au site actuel"
      : "Built to work well on mobile, unlike the current site");
  }
  if (has("sitio caído") || has("caído") || has("unreachable")) {
    props.push(language === "fr"
      ? "Toujours en ligne — votre site actuel semble injoignable"
      : "Always reachable — the current site appears to be down");
  }
  if (has("sin website") || has("sin sitio")) {
    props.push(language === "fr"
      ? "Une première présence en ligne professionnelle"
      : "A first professional online presence");
  }
  if (has("sin https") || has("https")) {
    props.push(language === "fr" ? "Connexion sécurisée (HTTPS)" : "Secure connection (HTTPS)");
  }
  return props;
}

function buildHeadline(name, city, categoryLabel, language) {
  if (language === "fr") {
    return `${name} — votre ${categoryLabel.toLowerCase()} à ${city}`;
  }
  return `${name} — your ${categoryLabel.toLowerCase()} in ${city}`;
}

function categoryKeyFor(fields) {
  const explicit = fields[F.CATEGORY_KEY];
  if (explicit && knownCategoryKeys.includes(explicit)) return explicit;
  return guessCategoryKey(fields[F.CATEGORY]);
}

function buildFreshConfig(record) {
  const f = record.fields;
  const name = f[F.NAME] || "";
  const city = f[F.CITY] || "";
  const cityShort = city.split(",")[0].trim();
  const categoryLabel = f[F.CATEGORY] || "";
  const categoryKey = categoryKeyFor(f);
  const template = resolveTemplate(categoryKey);
  const language = "fr"; // every leadgen/config/targets.json area today is in Quebec
  const slug = f[F.SLUG];

  const signals = parseSignals(f[F.SIGNALS]);
  const valueProps = valuePropsFromSignals(signals, language);
  const cta = {
    label: template.defaultCta[language],
    href: `https://gabansolutions.ca/contact.html?ref=outbound-proposal&business=${encodeURIComponent(name)}`
  };
  const middleLabel = (template.middlePageLabel && template.middlePageLabel[language]) || "Services";

  const heroVariant = pickVariant(`${slug}-hero`, HERO_VARIANTS);
  const pickedPalette = pickVariant(`${slug}-palette`, template.paletteVariants || [template.defaultPalette]);
  const branding = {
    ...pickedPalette,
    ...(f[F.PRIMARY_COLOR] ? { primaryColor: f[F.PRIMARY_COLOR] } : {}),
    ...(f[F.SECONDARY_COLOR] ? { secondaryColor: f[F.SECONDARY_COLOR] } : {})
  };

  // Home reuses the category's usual section-order flavor, minus the
  // full services list and gallery — those get their own page now so
  // content isn't repeated across the site.
  const rawOrder = pickVariant(slug, template.sectionOrderVariants || [template.defaultSectionOrder]);
  const homeSectionOrder = rawOrder.filter((s) => s !== "services" && s !== "gallery");

  return {
    slug,
    status: PREVIEW_STATUS.DRAFT,
    template: { category: categoryKey, variant: "v1" },
    language,
    business: {
      name,
      phone: f[F.PHONE] || "",
      address: f[F.ADDRESS] || "",
      city,
      category: categoryLabel,
      website: f[F.WEBSITE] || "",
      rating: typeof f[F.RATING] === "number" ? f[F.RATING] : null,
      reviewCount: typeof f[F.REVIEW_COUNT] === "number" ? f[F.REVIEW_COUNT] : null,
      logo: f[F.LOGO_URL] || "",
      photos: []
    },
    branding,
    pages: {
      home: {
        navLabel: NAV_LABELS.home[language],
        heroVariant,
        sectionOrder: homeSectionOrder,
        content: {
          eyebrow: "",
          headline: buildHeadline(name, cityShort, categoryLabel, language),
          subheadline: "",
          about: "",
          valueProps,
          reviews: [],
          cta
        }
      },
      services: {
        navLabel: middleLabel,
        sectionOrder: ["pageHeader", "services", "gallery", "contact"],
        content: {
          headline: middleLabel,
          intro: "",
          services: [],
          cta
        }
      },
      contact: {
        navLabel: NAV_LABELS.contact[language],
        sectionOrder: ["pageHeader", "contact"],
        content: {
          headline: language === "fr" ? "Contactez-nous" : "Contact us",
          intro: "",
          cta
        }
      }
    },
    auditContext: {
      detectedSignals: signals,
      currentSiteProblems: signals,
      personalizationNotes: [
        "TODO: add 2-3 real services/items on the middle page",
        "TODO: add at least 1-2 real photos (hosted URL, e.g. Imgur or a Google Places photo link)",
        "TODO: write a short intro for the middle and contact pages",
        "TODO: consider adding a real Google review to the home page"
      ]
    },
    meta: {
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      approvedAt: null,
      version: 2,
      generatedBy: "script"
    }
  };
}

/** Re-run on an existing config: only refresh logo/colors from the flat Airtable fields, leave every hand-edited section alone. Business/branding are top-level in both the legacy and multi-page shapes, so this needs no changes for either. */
function refreshExistingConfig(record, existing) {
  const f = record.fields;
  const config = JSON.parse(JSON.stringify(existing));

  if (f[F.LOGO_URL]) config.business.logo = f[F.LOGO_URL];
  if (f[F.PRIMARY_COLOR]) config.branding.primaryColor = f[F.PRIMARY_COLOR];
  if (f[F.SECONDARY_COLOR]) config.branding.secondaryColor = f[F.SECONDARY_COLOR];
  config.meta.updatedAt = new Date().toISOString();

  return config;
}

/**
 * Builds/refreshes the Preview Config for one slug and writes it to
 * Airtable (unless dryRun). Returns a plain-object summary so both
 * the CLI and the HTTP endpoint can report the result their own way.
 */
export async function generatePreviewForSlug(slug, { dryRun = false } = {}) {
  if (!slug) throw new Error("slug is required");

  const record = await findByField(F.SLUG, slug);
  if (!record) {
    throw new Error(`No prospect found with Slug "${slug}"`);
  }

  const existingRaw = record.fields[F.PREVIEW_CONFIG_JSON];
  let config;
  let isRefresh = false;

  if (existingRaw) {
    try {
      config = refreshExistingConfig(record, JSON.parse(existingRaw));
      isRefresh = true;
    } catch (err) {
      throw new Error(`Existing Preview Config JSON is not valid JSON, fix it by hand first: ${err.message}`);
    }
  } else {
    config = buildFreshConfig(record);
  }

  const fields = {
    [F.PREVIEW_CONFIG_JSON]: JSON.stringify(config, null, 2),
    [F.PREVIEW_TEMPLATE]: config.template.category
  };
  if (!isRefresh) {
    fields[F.PREVIEW_STATUS] = PREVIEW_STATUS.DRAFT;
  }

  if (!dryRun) {
    await updateRecord(record.id, fields);
  }

  const pageSummaries = config.pages
    ? Object.fromEntries(Object.entries(config.pages).map(([key, p]) => [key, { navLabel: p.navLabel }]))
    : null;

  return {
    slug,
    businessName: record.fields[F.NAME],
    isRefresh,
    templateCategory: config.template.category,
    language: config.language,
    personalizationNotes: isRefresh ? [] : config.auditContext.personalizationNotes,
    previewUrl: `https://gabansolutions.ca/preview/${slug}`,
    pages: pageSummaries,
    saved: !dryRun,
    // Extra business context, mainly so a caller (leadgen-admin.html)
    // can build a ChatGPT prompt without a second round-trip.
    business: {
      category: record.fields[F.CATEGORY] || "",
      city: record.fields[F.CITY] || "",
      address: record.fields[F.ADDRESS] || "",
      phone: record.fields[F.PHONE] || "",
      rating: typeof record.fields[F.RATING] === "number" ? record.fields[F.RATING] : null,
      reviewCount: typeof record.fields[F.REVIEW_COUNT] === "number" ? record.fields[F.REVIEW_COUNT] : null,
      website: record.fields[F.WEBSITE] || "",
      signals: parseSignals(record.fields[F.SIGNALS])
    }
  };
}

function arg(name) {
  const found = process.argv.find((a) => a.startsWith(`--${name}=`));
  return found ? found.split("=").slice(1).join("=") : undefined;
}

async function main() {
  const slug = arg("slug");
  const dryRun = process.argv.includes("--dry-run");
  if (!slug) {
    throw new Error("Usage: node leadgen/scripts/generate-preview.mjs --slug=<slug>");
  }

  const result = await generatePreviewForSlug(slug, { dryRun });

  if (result.isRefresh) {
    console.log(`Refreshing logo/branding only for "${result.businessName}" (existing content preserved).`);
  } else {
    console.log(`Draft preview for "${result.businessName}" (template: ${result.templateCategory}, language: ${result.language})`);
    console.log("Still needs manual completion:");
    result.personalizationNotes.forEach((note) => console.log(`  - ${note}`));
  }

  if (dryRun) {
    console.log("\n[dry-run] nothing written.");
  } else {
    console.log(`\nSaved. Review at: ${result.previewUrl}`);
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main().catch((err) => {
    console.error(err);
    process.exitCode = 1;
  });
}
