// ============================================================
// GET /blog (rewritten from /api/blog in vercel.json) — the blog
// listing page.
//
// Split out from [...segments].js on purpose: that file is a
// "required" catch-all ([...segments], not [[...segments]]) and only
// matches ONE OR MORE path segments on Vercel's zero-config Node
// builder — it never matches its own parent path with zero segments.
// The vercel.json rewrite sends bare /blog to exactly /api/blog (zero
// segments), which 404'd in production until this file existed
// (confirmed live: gabansolutions.ca/blog returned NOT_FOUND).
// index.js inside a directory is Vercel's standard convention for
// matching that directory's own bare path, same as Node's own
// require() resolution — no special bracket syntax needed, so this
// sidesteps the [[...x]] optional-catch-all question entirely rather
// than betting production on it a second time.
//
// Reuses handleIndex from the sibling file instead of duplicating the
// Airtable query + render call.
//
// Required env vars: AIRTABLE_API_KEY, AIRTABLE_BASE_ID.
// ============================================================

import { handleIndex } from "./[...segments].js";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  try {
    return await handleIndex(req, res);
  } catch (err) {
    res.status(500).setHeader("Content-Type", "text/plain; charset=utf-8");
    return res.end("Something went wrong loading the blog.");
  }
}
