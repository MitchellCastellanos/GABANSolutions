// ============================================================
// GET /api/booking/availability?days=30
//
// Returns open slots for the self-hosted booking calendar, grouped
// by date. Reads weekly hours + blocked dates from
// booking/config/availability.json (hand-edit that file to change
// your schedule) and subtracts already-booked slots from Airtable.
//
// Works even before the Airtable "Bookings" table exists — it just
// shows every configured slot as open until a booking is made against
// this endpoint's sibling, /api/booking/book.
// ============================================================

import { loadAvailabilityConfig, generateAvailability } from "../../booking/lib/schedule.mjs";
import { listBookingsBetween } from "../../booking/lib/airtable.mjs";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  const config = loadAvailabilityConfig();
  const days = Math.min(Number(req.query?.days) || config.bookingHorizonDays || 30, 90);

  const bookedStartIsoSet = new Set();
  try {
    const from = new Date().toISOString();
    const to = new Date(Date.now() + (days + 1) * 86400000).toISOString();
    const records = await listBookingsBetween(from, to);
    for (const record of records) {
      if (record.fields?.Start) bookedStartIsoSet.add(record.fields.Start);
    }
  } catch {
    // Airtable not configured yet, or a transient error — fall back to
    // showing every configured slot as open rather than failing the page.
  }

  const availability = generateAvailability(config, { days, bookedStartIsoSet });
  return res.status(200).json({ ok: true, ...availability });
}
