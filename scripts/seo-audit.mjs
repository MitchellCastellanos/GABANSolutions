#!/usr/bin/env node
// Static technical SEO audit for the site's own HTML pages (not leadgen
// prospects). Regex-based on purpose: the site is a small set of hand-authored,
// consistently structured static pages, so a real HTML parser dependency
// isn't worth adding for this. Run: node scripts/seo-audit.mjs
import { readFileSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const rootDir = path.dirname(path.dirname(fileURLToPath(import.meta.url)));

const SKIP = new Set(["404.html", "thank-you.html"]);

// Root pages, plus the /digital/ and /software/ division pages.
const pages = [
  ...readdirSync(rootDir).filter((f) => f.endsWith(".html")),
  ...readdirSync(path.join(rootDir, "digital")).map((f) => `digital/${f}`),
  ...readdirSync(path.join(rootDir, "software")).map((f) => `software/${f}`),
]
  .filter((f) => f.endsWith(".html"))
  .filter((f) => !SKIP.has(f))
  .sort();

// sitemap.xml is now a <sitemapindex> (see blog/README.md, "Sitemap")
// pointing at sitemap-pages.xml (the static page list this audit
// checks against) and the dynamic /blog-sitemap.xml (Airtable-backed
// blog posts — not something this static-file audit can see).
const sitemapXml = readFileSync(path.join(rootDir, "sitemap-pages.xml"), "utf8");
const sitemapUrls = [...sitemapXml.matchAll(/<loc>(.*?)<\/loc>/g)].map((m) => m[1]);

function extract(html, re) {
  const m = html.match(re);
  return m ? m[1].trim() : null;
}

function findAll(html, re) {
  return [...html.matchAll(re)].map((m) => m[0]);
}

const results = [];

for (const file of pages) {
  const html = readFileSync(path.join(rootDir, file), "utf8");
  const issues = [];
  const warnings = [];

  const title = extract(html, /<title>([^<]*)<\/title>/);
  if (!title) issues.push("Missing <title>");
  else if (title.length > 60) warnings.push(`Title too long (${title.length} chars): "${title}"`);
  else if (title.length < 15) warnings.push(`Title too short (${title.length} chars): "${title}"`);

  const description = extract(html, /<meta name="description" content="([^"]*)"/);
  if (!description) issues.push("Missing meta description");
  else if (description.length > 160) warnings.push(`Meta description too long (${description.length} chars)`);
  else if (description.length < 70) warnings.push(`Meta description too short (${description.length} chars)`);

  const canonical = extract(html, /rel="canonical" href="([^"]*)"/);
  if (!canonical) issues.push("Missing canonical link");

  const robots = extract(html, /name="robots" content="([^"]*)"/);
  if (!robots) warnings.push("Missing meta robots tag");

  const ogImage = extract(html, /property="og:image" content="([^"]*)"/);
  if (!ogImage) warnings.push("Missing og:image");

  const h1s = findAll(html, /<h1[^>]*>/g);
  if (h1s.length === 0) issues.push("No <h1> found");
  else if (h1s.length > 1) warnings.push(`${h1s.length} <h1> tags found (should be 1)`);

  const imgs = findAll(html, /<img[^>]*>/g);
  const imgsNoAlt = imgs.filter((tag) => !/\salt="/.test(tag));
  if (imgsNoAlt.length > 0) issues.push(`${imgsNoAlt.length} <img> tag(s) missing alt text`);

  const hasSchema = /application\/ld\+json/.test(html);
  if (!hasSchema) warnings.push("No JSON-LD structured data (schema.org)");

  if (canonical && robots && robots.includes("index") && !sitemapUrls.includes(canonical)) {
    issues.push(`Indexable page not listed in sitemap.xml (${canonical})`);
  }

  results.push({ file, title, issues, warnings });
}

const totalIssues = results.reduce((n, r) => n + r.issues.length, 0);
const totalWarnings = results.reduce((n, r) => n + r.warnings.length, 0);

console.log(`\nSEO audit — ${pages.length} pages checked\n`);

for (const r of results) {
  if (r.issues.length === 0 && r.warnings.length === 0) continue;
  console.log(`\n${r.file}${r.title ? `  ("${r.title}")` : ""}`);
  for (const issue of r.issues) console.log(`  ISSUE:   ${issue}`);
  for (const warning of r.warnings) console.log(`  WARNING: ${warning}`);
}

console.log(`\n---\n${totalIssues} issue(s), ${totalWarnings} warning(s) across ${pages.length} pages.\n`);

const noSchema = results.filter((r) => r.warnings.some((w) => w.includes("JSON-LD")));
if (noSchema.length > 0) {
  console.log(`Pages missing schema.org markup (${noSchema.length}): ${noSchema.map((r) => r.file).join(", ")}\n`);
}

process.exitCode = totalIssues > 0 ? 1 : 0;
