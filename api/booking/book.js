// ============================================================
// POST /api/booking/book
//
// Confirms a slot on the self-hosted booking calendar: re-validates
// the slot is still open (best-effort double-booking guard), writes
// a record to the Airtable "Bookings" table, and emails a
// confirmation (with a .ics invite) to the visitor plus a
// notification to GABAN.
//
// Required env vars: AIRTABLE_API_KEY, AIRTABLE_BASE_ID,
// RESEND_API_KEY, LEADGEN_FROM_EMAIL.
// Optional: AIRTABLE_BOOKINGS_TABLE (defaults "Bookings"),
// BOOKING_NOTIFY_EMAIL (defaults to LEADGEN_FROM_EMAIL's address).
// ============================================================

import { loadAvailabilityConfig, isSlotAvailable } from "../../booking/lib/schedule.mjs";
import { listBookingsBetween, createBooking } from "../../booking/lib/airtable.mjs";
import { clientConfirmationEmail, ownerNotificationEmail } from "../../booking/lib/emails.mjs";
import { buildBookingIcs } from "../../booking/lib/ics.mjs";
import { sendEmail } from "../../leadgen/lib/email.mjs";

function clean(value, max = 300) {
  return (typeof value === "string" ? value : "").trim().slice(0, max);
}

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function dateStrInTimezone(date, timeZone) {
  return new Intl.DateTimeFormat("en-CA", { timeZone, year: "numeric", month: "2-digit", day: "2-digit" }).format(date);
}

function formatDateLabel(date, timeZone) {
  return new Intl.DateTimeFormat("en-US", { timeZone, weekday: "long", month: "long", day: "numeric", year: "numeric" }).format(date);
}

function formatTimeLabel(date, timeZone) {
  return new Intl.DateTimeFormat("en-US", { timeZone, hour: "numeric", minute: "2-digit", hour12: true }).format(date);
}

function timezoneAbbrev(date, timeZone) {
  const part = new Intl.DateTimeFormat("en-US", { timeZone, timeZoneName: "short" })
    .formatToParts(date)
    .find(p => p.type === "timeZoneName");
  return part ? part.value : timeZone;
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : (req.body || {});

  // Honeypot, same pattern as /api/lead.
  if (clean(body.company_website)) {
    return res.status(200).json({ ok: true });
  }

  const name = clean(body.name, 120);
  const email = clean(body.email, 160);
  const phone = clean(body.phone, 60);
  const business = clean(body.business, 120);
  const notes = clean(body.notes, 1000);
  const startIso = clean(body.start, 40);

  if (!name || !email || !startIso || !isValidEmail(email)) {
    return res.status(400).json({ ok: false, error: "Missing or invalid name, email, or slot." });
  }

  const startDate = new Date(startIso);
  if (Number.isNaN(startDate.getTime())) {
    return res.status(400).json({ ok: false, error: "Invalid slot." });
  }

  const config = loadAvailabilityConfig();
  const slotMinutes = config.slotMinutes || 30;
  const endDate = new Date(startDate.getTime() + slotMinutes * 60000);
  const dateStr = dateStrInTimezone(startDate, config.timezone);

  let bookedStartIsoSet = new Set();
  try {
    const from = new Date(Date.now() - 86400000).toISOString();
    const to = new Date(startDate.getTime() + 86400000).toISOString();
    const records = await listBookingsBetween(from, to);
    bookedStartIsoSet = new Set(records.map(r => r.fields?.Start).filter(Boolean));
  } catch (err) {
    return res.status(502).json({ ok: false, error: "Could not verify availability. Please try again." });
  }

  if (!isSlotAvailable(config, dateStr, startDate.toISOString(), bookedStartIsoSet)) {
    return res.status(409).json({ ok: false, error: "That time was just taken — please pick another slot." });
  }

  try {
    await createBooking({
      Name: name,
      Email: email,
      Phone: phone,
      Business: business,
      Notes: notes,
      Start: startDate.toISOString(),
      End: endDate.toISOString(),
      Status: "Confirmed",
      Source: clean(body.ref, 100) || "book.html",
      Lang: clean(body.lang, 5),
      "Submitted At": new Date().toISOString()
    });
  } catch (err) {
    return res.status(502).json({ ok: false, error: "Could not save the booking. Please try again or contact us directly." });
  }

  const dateLabel = formatDateLabel(startDate, config.timezone);
  const timeLabel = formatTimeLabel(startDate, config.timezone);
  const timezoneLabel = timezoneAbbrev(startDate, config.timezone);

  // Email delivery is best-effort — the booking is already saved above,
  // so a Resend hiccup shouldn't turn a real booking into a visitor-facing error.
  try {
    const ics = buildBookingIcs({
      uid: `${startDate.getTime()}-${email}@gabansolutions.ca`,
      startIso: startDate.toISOString(),
      endIso: endDate.toISOString(),
      summary: "Free consultation — GABAN Solutions",
      description: `Free consultation with GABAN Solutions.${notes ? ` Notes: ${notes}` : ""}`,
      organizerEmail: "hello@gabansolutions.ca"
    });
    const icsBase64 = Buffer.from(ics, "utf8").toString("base64");

    const confirmation = clientConfirmationEmail({ name, dateLabel, timeLabel, timezoneLabel, notes });
    await sendEmail({
      to: email,
      subject: confirmation.subject,
      html: confirmation.html,
      attachments: [{ filename: "consultation.ics", content: icsBase64 }]
    });

    const notifyTo = process.env.BOOKING_NOTIFY_EMAIL || "hello@gabansolutions.ca";
    const notification = ownerNotificationEmail({ name, email, phone, business, notes, dateLabel, timeLabel, timezoneLabel });
    await sendEmail({ to: notifyTo, subject: notification.subject, html: notification.html, replyTo: email });
  } catch (err) {
    // swallow — booking already confirmed and stored
  }

  return res.status(200).json({ ok: true, dateLabel, timeLabel, timezoneLabel });
}
