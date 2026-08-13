// ============================================================
// Turns a blog post record into full page HTML for the public site —
// the blog's equivalent of leadgen/lib/preview-render.mjs, but using
// the *real* site shell (Bootstrap + MyCSS.css + the shared
// /js/components.js navbar/footer + the site's actual JSON-LD
// conventions) instead of the sandboxed preview shell, because these
// pages are meant to be indexed and look like the rest of
// gabansolutions.ca, not like an internal review page.
//
// Two entry points:
//   renderBlogIndex(posts)      -> GET /blog
//   renderBlogPost(post)        -> GET /blog/:slug
//
// `post` shape (see blog/lib/fields.mjs for the Airtable column each
// one comes from):
//   { slug, title, metaDescription, h1, categoryKey, categoryLabel,
//     city, bodyHtml, excerpt, coverImageUrl, canonicalUrl, author,
//     status, publishedDate, updatedDate }
// ============================================================

const SITE_URL = "https://gabansolutions.ca";
const DEFAULT_OG_IMAGE = `${SITE_URL}/Images/og/gaban-home-preview.jpg`;

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (ch) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  }[ch]));
}

function formatDate(iso) {
  if (!iso) return "";
  try {
    return new Intl.DateTimeFormat("en-CA", { year: "numeric", month: "long", day: "numeric", timeZone: "America/Toronto" }).format(new Date(iso));
  } catch {
    return "";
  }
}

function favicons() {
  return `
  <link rel="manifest" href="/site.webmanifest">
  <link rel="icon" href="/Images/favicon.ico">
  <link rel="icon" type="image/png" sizes="32x32" href="/Images/favicon-32.png">
  <link rel="icon" type="image/png" sizes="16x16" href="/Images/favicon-16.png">
  <link rel="apple-touch-icon" href="/Images/apple-touch-icon.png">`;
}

function cssLinks() {
  return `
  <link rel="preconnect" href="https://cdn.jsdelivr.net" crossorigin>
  <link rel="preload" href="/MyCSS.css" as="style">
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css">
  <link rel="stylesheet" href="/MyCSS.css">
  <style>
    .blog-badge { font-size: 0.72rem; text-transform: uppercase; letter-spacing: 0.06em; font-weight: 700; color: #a67c00; }
    .blog-card { transition: transform 0.2s ease, box-shadow 0.2s ease; }
    .blog-card:hover { transform: translateY(-3px); box-shadow: 0 12px 28px rgba(0,0,0,0.08); }
    .blog-article { max-width: 760px; }
    .blog-article h2 { margin-top: 2.25rem; font-weight: 800; }
    .blog-article p { line-height: 1.75; }
    .blog-article ul, .blog-article ol { line-height: 1.75; }
    .blog-article img { border-radius: 10px; }
    .blog-draft-banner { background: #ffefc2; color: #5c4400; text-align: center; padding: 0.6rem 1rem; font-size: 0.85rem; }
  </style>`;
}

function draftBanner(post) {
  if (!post.status || post.status === "published") return "";
  return `<div class="blog-draft-banner">INTERNAL REVIEW — status: ${escapeHtml(post.status)} — not published yet, not indexed</div>`;
}

function shellOpen({ title, description, canonical, ogImage, robots, jsonLd }) {
  return `<!doctype html>
<html lang="en-CA">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">

  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeHtml(description)}">
  <meta name="author" content="GABAN Solutions">
  <meta name="robots" content="${robots}">
  <meta name="theme-color" content="#111111">

  <link rel="canonical" href="${escapeHtml(canonical)}">
  ${favicons()}

  <meta property="og:type" content="article">
  <meta property="og:locale" content="en_CA">
  <meta property="og:site_name" content="GABAN Solutions">
  <meta property="og:title" content="${escapeHtml(title)}">
  <meta property="og:description" content="${escapeHtml(description)}">
  <meta property="og:url" content="${escapeHtml(canonical)}">
  <meta property="og:image" content="${escapeHtml(ogImage)}">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">

  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${escapeHtml(title)}">
  <meta name="twitter:description" content="${escapeHtml(description)}">
  <meta name="twitter:image" content="${escapeHtml(ogImage)}">

  ${cssLinks()}

  ${jsonLd.map((obj) => `<script type="application/ld+json">${JSON.stringify(obj, null, 2).replace(/</g, "\\u003c")}</script>`).join("\n  ")}
</head>
<body>

<div id="site-navbar"></div>
`;
}

function shellClose() {
  return `
<div id="site-footer"></div>

<script src="/js/components.js"></script>
<script>mountSharedLayout("blog", "home");</script>
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>`;
}

function metaBadge(post) {
  if (post.categoryLabel && post.city) {
    return `${escapeHtml(post.categoryLabel)} &middot; ${escapeHtml(post.city.split(",")[0].trim())}`;
  }
  return "GABAN Solutions";
}

export function renderBlogIndex(posts) {
  const canonical = `${SITE_URL}/blog`;
  const title = "Blog | GABAN Solutions — Local SEO, Websites & Growth for Montreal Businesses";
  const description = "Practical guides on websites, local SEO, Google visibility, and business automation for small businesses in Montreal, Laval, and Longueuil.";

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      "@id": `${canonical}#webpage`,
      "url": canonical,
      "name": title,
      "description": description,
      "isPartOf": { "@id": `${SITE_URL}/#website` },
      "about": { "@id": `${SITE_URL}/#business` }
    }
  ];

  const cards = posts.length
    ? posts.map((p) => `
      <div class="col-md-6 col-lg-4">
        <a class="card h-100 border-0 shadow-sm blog-card text-decoration-none text-dark" href="/blog/${encodeURIComponent(p.slug)}">
          <div class="card-body p-4">
            <div class="blog-badge mb-2">${metaBadge(p)}</div>
            <h2 class="h5 fw-bold">${escapeHtml(p.title)}</h2>
            <p class="text-muted small mb-2">${escapeHtml(p.excerpt || p.metaDescription || "")}</p>
            <div class="text-muted small">${escapeHtml(formatDate(p.publishedDate))}</div>
          </div>
        </a>
      </div>`).join("")
    : `<div class="col-12"><p class="text-muted">No articles published yet — check back soon.</p></div>`;

  const body = `
<header class="py-5 bg-light">
  <div class="container">
    <div class="text-center">
      <div class="text-uppercase small fw-semibold text-warning mb-2">GABAN Solutions</div>
      <h1 class="fw-bold mb-2">Blog</h1>
      <p class="text-muted mb-0">Practical guides on websites, local SEO, and growth for small businesses in Montreal, Laval, and Longueuil.</p>
    </div>
  </div>
</header>

<section class="section">
  <div class="container">
    <div class="row g-4">${cards}
    </div>
  </div>
</section>

<section class="section bg-dark text-white">
  <div class="container">
    <div class="row align-items-center g-3">
      <div class="col-lg-8">
        <h2 class="fw-bold mb-2">Want this kind of visibility for your own business?</h2>
        <p class="mb-0 text-white-50">Tell us what you do and what's slowing you down. We'll point you to the right next step.</p>
      </div>
      <div class="col-lg-4 text-lg-end">
        <a class="btn btn-light btn-lg" href="/book.html">Book Your Free Consultation</a>
      </div>
    </div>
  </div>
</section>`;

  return shellOpen({ title, description, canonical, ogImage: DEFAULT_OG_IMAGE, robots: "index, follow", jsonLd })
    + body + shellClose();
}

export function renderBlogPost(post) {
  const canonical = post.canonicalUrl || `${SITE_URL}/blog/${post.slug}`;
  const title = `${post.title} | GABAN Solutions Blog`;
  const description = post.metaDescription || "";
  const ogImage = post.coverImageUrl || DEFAULT_OG_IMAGE;
  const isPublished = post.status === "published";
  const robots = isPublished ? "index, follow" : "noindex, nofollow";
  const publishedIso = post.publishedDate || post.updatedDate || null;

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      "@id": `${canonical}#article`,
      "headline": post.title,
      "description": description,
      "url": canonical,
      "mainEntityOfPage": { "@type": "WebPage", "@id": canonical },
      ...(publishedIso ? { "datePublished": publishedIso } : {}),
      "dateModified": post.updatedDate || publishedIso || new Date().toISOString(),
      "image": ogImage,
      "author": { "@id": `${SITE_URL}/#business` },
      "publisher": { "@id": `${SITE_URL}/#business` },
      "isPartOf": { "@id": `${SITE_URL}/#website` }
    }
  ];

  const badge = metaBadge(post);
  const dateLine = [formatDate(post.publishedDate), post.author || "GABAN Solutions"].filter(Boolean).join(" &middot; ");

  const body = `
${draftBanner(post)}
<article class="section">
  <div class="container blog-article mx-auto">
    <p class="mb-2"><a href="/blog" class="text-decoration-none">&larr; Back to the blog</a></p>
    <div class="blog-badge mb-2">${badge}</div>
    <h1 class="fw-bold mb-2">${escapeHtml(post.h1 || post.title)}</h1>
    <p class="text-muted mb-4">${dateLine}</p>
    ${post.coverImageUrl ? `<img src="${escapeHtml(post.coverImageUrl)}" class="img-fluid w-100 mb-4" alt="${escapeHtml(post.title)}" loading="lazy">` : ""}
    <div class="blog-article-body">
      ${post.bodyHtml || ""}
    </div>
  </div>
</article>

<section class="section bg-light">
  <div class="container text-center">
    <h2 class="fw-bold mb-2">Need this for your own business?</h2>
    <p class="text-muted mb-4">Tell us what you do and what's slowing you down — we'll point you to the right next step.</p>
    <a class="btn btn-dark btn-lg" href="/book.html">Book Your Free Consultation</a>
  </div>
</section>`;

  return shellOpen({ title, description, canonical, ogImage, robots, jsonLd }) + body + shellClose();
}
