// GET /api/admin/blog/list — every post's slug/topic/status, newest
// first, so /admin/blog can show a picker instead of requiring you to
// already know (or go find in Airtable) the slug you want to work on.

import { requireAdmin } from "../auth.mjs";
import { listRecords } from "../../../blog/lib/airtable.mjs";
import { F } from "../../../blog/lib/fields.mjs";

export async function handleBlogList(req, res) {
  if (!requireAdmin(req, res)) return;

  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  try {
    const records = await listRecords();
    const posts = records
      .map((r) => ({
        slug: r.fields[F.SLUG] || "",
        title: r.fields[F.TITLE] || r.fields[F.TOPIC] || "(untitled)",
        status: r.fields[F.STATUS] || "draft",
        updatedDate: r.fields[F.UPDATED_DATE] || null
      }))
      .filter((p) => p.slug)
      .sort((a, b) => new Date(b.updatedDate || 0) - new Date(a.updatedDate || 0));
    return res.status(200).json({ ok: true, posts });
  } catch (err) {
    return res.status(502).json({ ok: false, error: err.message });
  }
}
