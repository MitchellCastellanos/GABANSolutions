// GET /api/admin/bookings/list?days=60
// Protected by middleware.js (Basic Auth on /api/admin/:path*). Returns
// upcoming, non-cancelled bookings for the admin calendar view.

import { listBookingsBetween } from "../../../booking/lib/airtable.mjs";
import { loadAvailabilityConfig } from "../../../booking/lib/schedule.mjs";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  const days = Math.min(Number(req.query?.days) || 60, 365);
  const from = new Date(Date.now() - 6 * 3600000).toISOString(); // small lookback so "today" doesn't drop off right after it starts
  const to = new Date(Date.now() + days * 86400000).toISOString();

  try {
    const records = await listBookingsBetween(from, to);
    const bookings = records.map(r => ({
      id: r.id,
      name: r.fields?.Name || "",
      email: r.fields?.Email || "",
      phone: r.fields?.Phone || "",
      business: r.fields?.Business || "",
      notes: r.fields?.Notes || "",
      start: r.fields?.Start || "",
      end: r.fields?.End || "",
      status: r.fields?.Status || "",
      source: r.fields?.Source || ""
    }));
    const config = loadAvailabilityConfig();
    return res.status(200).json({ ok: true, bookings, timezone: config.timezone, slotMinutes: config.slotMinutes });
  } catch (err) {
    return res.status(502).json({ ok: false, error: err.message });
  }
}
