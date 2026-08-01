// Single serverless entry for /api/booking/* (Hobby plan function limit).

import { loadAvailabilityConfig, generateAvailability, isSlotAvailable } from "../../booking/lib/schedule.mjs";
import { listBookingsBetween, createBooking } from "../../booking/lib/airtable.mjs";
import { clientConfirmationEmail, ownerNotificationEmail } from "../../booking/lib/emails.mjs";
import { buildBookingIcs } from "../../booking/lib/ics.mjs";
import { sendEmail } from "../../leadgen/lib/email.mjs";

function extractPath(query) {
  const raw = query?.["...path"] ?? query?.path;
  if (Array.isArray(raw)) return raw.filter(Boolean);
  if (typeof raw === "string" && raw) return raw.split("/").filter(Boolean);
  return [];
}

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

async function handleAvailability(req, res) {
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
    // fall back to showing every configured slot as open
  }

  const availability = generateAvailability(config, { days, bookedStartIsoSet });
  return res.status(200).json({ ok: true, ...availability });
}

async function handleBook(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : (req.body || {});

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
  } catch {
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
  } catch {
    return res.status(502).json({ ok: false, error: "Could not save the booking. Please try again or contact us directly." });
  }

  const dateLabel = formatDateLabel(startDate, config.timezone);
  const timeLabel = formatTimeLabel(startDate, config.timezone);
  const timezoneLabel = timezoneAbbrev(startDate, config.timezone);

  try {
    const ics = buildBookingIcs({
      uid: `${startDate.getTime()}-${email}@gabansolutions.ca`,
      startIso: startDate.toISOString(),
      endIso: endDate.toISOString(),
      summary: "Free consultation — GABAN Solutions",
      description: `Free consultation with GABAN Solutions.${notes ? ` Notes: ${notes}` : ""}`,
      organizerEmail: "hello@gabansolutions.ca",
      meetLink: config.meetLink
    });
    const icsBase64 = Buffer.from(ics, "utf8").toString("base64");

    const confirmation = clientConfirmationEmail({ name, dateLabel, timeLabel, timezoneLabel, notes, meetLink: config.meetLink });
    await sendEmail({
      to: email,
      subject: confirmation.subject,
      html: confirmation.html,
      attachments: [{ filename: "consultation.ics", content: icsBase64 }]
    });

    const notifyTo = process.env.BOOKING_NOTIFY_EMAIL || "hello@gabansolutions.ca";
    const notification = ownerNotificationEmail({ name, email, phone, business, notes, dateLabel, timeLabel, timezoneLabel, meetLink: config.meetLink });
    await sendEmail({ to: notifyTo, subject: notification.subject, html: notification.html, replyTo: email });
  } catch {
    // booking already saved
  }

  return res.status(200).json({ ok: true, dateLabel, timeLabel, timezoneLabel, meetLink: config.meetLink });
}

export default async function handler(req, res) {
  const route = extractPath(req.query).join("/");

  if (route === "availability") {
    return handleAvailability(req, res);
  }
  if (route === "book") {
    return handleBook(req, res);
  }

  return res.status(404).json({ ok: false, error: "Not found" });
}
