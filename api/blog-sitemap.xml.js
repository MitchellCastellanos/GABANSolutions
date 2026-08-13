// ============================================================
// GET /blog-sitemap.xml (rewritten from /api/blog-sitemap.xml in
// vercel.json) — a valid sitemaps.org <urlset> listing every
// *published* blog post, generated on every request from Airtable.
//
// The root /sitemap.xml is a static committed file, which is fine for
// the site's static pages (they only change on a deploy) but wrong
// for blog posts: the set of published posts changes without a
// commit (an admin publishes from /admin/blog, no redeploy happens).
// So root sitemap.xml was converted to a <sitemapindex> that
// references two sub-sitemaps: the static /sitemap-pages.xml (the
// old file content, unchanged) and this dynamic one. See
// blog/README.md ("Sitemap") for the full rationale.
//
// Required env vars: AIRTABLE_API_KEY, AIRTABLE_BASE_ID.
// ============================================================

import { listRecords } from "../blog/lib/airtable.mjs";
import { F, POST_STATUS } from "../blog/lib/fields.mjs";

const SITE_URL = "https://gabansolutions.ca";

function escapeXml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (ch) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[ch]));
}

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  res.setHeader("Content-Type", "application/xml; charset=utf-8");
  res.setHeader("X-Robots-Tag", "index, follow");

  let records = [];
  try {
    records = await listRecords({ filterByFormula: `{${F.STATUS}} = "${POST_STATUS.PUBLISHED}"` });
  } catch {
    // Best-effort: an empty (but valid) sitemap beats a 500 that could
    // make crawlers drop the whole index entry.
    records = [];
  }

  const urls = records
    .filter((r) => r.fields[F.SLUG])
    .map((r) => {
      const slug = r.fields[F.SLUG];
      const loc = r.fields[F.CANONICAL_URL] || `${SITE_URL}/blog/${slug}`;
      const lastmod = r.fields[F.UPDATED_DATE] || r.fields[F.PUBLISHED_DATE];
      return `  <url>\n    <loc>${escapeXml(loc)}</loc>\n${lastmod ? `    <lastmod>${escapeXml(new Date(lastmod).toISOString().slice(0, 10))}</lastmod>\n` : ""}    <changefreq>monthly</changefreq>\n    <priority>0.6</priority>\n  </url>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
  return res.status(200).end(xml);
}
