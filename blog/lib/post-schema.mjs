// ============================================================
// Shape of a blog post record + a pure validator that decides whether
// a post is allowed to move to Status "published" — same philosophy
// as leadgen/lib/preview-schema.mjs: no network calls, pure function,
// so it can be unit-tested and run standalone from
// blog/scripts/validate-post.mjs. Only zero-error posts may publish;
// warnings are the reviewer's call.
// ============================================================

const BANNED_STRINGS = [
  "lorem ipsum", "example.com", "placeholder", "test business",
  "[insert", "todo:", "your business name", "your company", "xxx"
];

const SLUG_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/;

function wordCount(html) {
  const text = (html || "").replace(/<[^>]+>/g, " ");
  return text.split(/\s+/).filter(Boolean).length;
}

function stripTags(html) {
  return (html || "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

export function validateBlogPost(post) {
  const errors = [];
  const warnings = [];

  if (!post?.slug) {
    errors.push("slug is missing");
  } else if (!SLUG_RE.test(post.slug)) {
    errors.push(`slug "${post.slug}" is not clean kebab-case (lowercase letters, digits, single hyphens)`);
  }

  if (!post?.title) {
    errors.push("title is missing");
  } else if (post.title.length > 70) {
    warnings.push(`title is long for a search snippet (${post.title.length} chars)`);
  } else if (post.title.length < 15) {
    warnings.push(`title is short (${post.title.length} chars)`);
  }

  if (!post?.metaDescription) {
    errors.push("metaDescription is missing");
  } else if (post.metaDescription.length > 160) {
    warnings.push(`metaDescription too long (${post.metaDescription.length} chars, aim for <=160)`);
  } else if (post.metaDescription.length < 70) {
    warnings.push(`metaDescription too short (${post.metaDescription.length} chars, aim for >=70)`);
  }

  if (!post?.h1) {
    warnings.push("h1 is empty — will fall back to title");
  }

  if (!post?.bodyHtml || !stripTags(post.bodyHtml)) {
    errors.push("bodyHtml is missing or empty");
  } else {
    const words = wordCount(post.bodyHtml);
    if (words < 300) {
      warnings.push(`body is thin (${words} words) — thin content rarely ranks or gets cited by AI answer engines`);
    }
    if (!/<h2/i.test(post.bodyHtml)) {
      warnings.push("no <h2> subheadings found — long posts with no structure read poorly and are harder for AI engines to extract");
    }
    if (/href="#"/i.test(post.bodyHtml)) {
      errors.push('bodyHtml contains a dead link (href="#")');
    }
    if (!/gabansolutions\.ca\/(contact|book)\.html/i.test(post.bodyHtml)) {
      warnings.push("no internal link to /contact.html or /book.html — posts should point readers to a next step");
    }
  }

  const allText = [post?.title, post?.metaDescription, post?.h1, stripTags(post?.bodyHtml)]
    .filter(Boolean).join(" \n ").toLowerCase();
  for (const banned of BANNED_STRINGS) {
    if (allText.includes(banned)) {
      errors.push(`Placeholder text found: "${banned}"`);
    }
  }

  if (post?.coverImageUrl && !/^https?:\/\//i.test(post.coverImageUrl)) {
    errors.push(`coverImageUrl doesn't look like a direct URL: "${post.coverImageUrl}"`);
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    score: qualityScore(post)
  };
}

/** 0-10, informational only — never blocks publishing on its own, unlike `errors`. */
export function qualityScore(post) {
  let score = 0;
  const words = wordCount(post?.bodyHtml);
  if (words >= 300) score += 1;
  if (words >= 700) score += 1;
  if (/<h2/i.test(post?.bodyHtml || "")) score += 1;
  if (/<h2[\s\S]*<h2/i.test(post?.bodyHtml || "")) score += 1; // 2+ H2s
  if (/<(ul|ol)/i.test(post?.bodyHtml || "")) score += 1;
  if (post?.metaDescription && post.metaDescription.length >= 70 && post.metaDescription.length <= 160) score += 1;
  if (post?.coverImageUrl) score += 1;
  if (post?.h1) score += 1;
  if (/gabansolutions\.ca\/(contact|book)\.html/i.test(post?.bodyHtml || "")) score += 1;
  if (post?.categoryKey && post?.city) score += 1;
  return score;
}
