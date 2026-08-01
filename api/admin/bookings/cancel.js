// POST /api/admin/bookings/cancel  { id }
// Protected by api/admin/lib/auth.mjs session cookie.

import { requireAdmin } from "../lib/auth.mjs";
import { updateBooking } from "../../../booking/lib/airtable.mjs";

export default async function handler(req, res) {
  if (!requireAdmin(req, res)) return;

  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : (req.body || {});
  const id = (body.id || "").toString().trim();
  if (!id) {
    return res.status(400).json({ ok: false, error: "Missing booking id." });
  }

  try {
    await updateBooking(id, { Status: "Cancelled" });
    return res.status(200).json({ ok: true });
  } catch (err) {
    return res.status(502).json({ ok: false, error: err.message });
  }
}
