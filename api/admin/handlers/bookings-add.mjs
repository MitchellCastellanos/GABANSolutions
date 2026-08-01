import { requireAdmin } from "../lib/auth.mjs";
import { loadAvailabilityConfig } from "../../../booking/lib/schedule.mjs";
import { createBooking } from "../../../booking/lib/airtable.mjs";
import { clientConfirmationEmail } from "../../../booking/lib/emails.mjs";
import { buildBookingIcs } from "../../../booking/lib/ics.mjs";
import { sendEmail } from "../../../leadgen/lib/email.mjs";

function clean(value, max = 300) {
  return (typeof value === "string" ? value : "").trim().slice(0, max);
}

function formatDateLabel(date, timeZone) {
  return new Intl.DateTimeFormat("en-US", { timeZone, weekday: "long", month: "long", day: "numeric", year: "numeric" }).format(date);
}

function formatTimeLabel(date, timeZone) {
  return new Intl.DateTimeFormat("en-US", { timeZone, hour: "numeric", minute: "2-digit", hour12: true }).format(date);
}

function timezoneAbbrev(date, timeZone) {
  const part = new Intl.DateTimeFormat("en-US", { timeZone, timeZoneName: "short" }).formatToParts(date).find(p => p.type === "timeZoneName");
  return part ? part.value : timeZone;
}

export async function handleBookingsAdd(req, res) {
  if (!requireAdmin(req, res)) return;

  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : (req.body || {});
  const name = clean(body.name, 120);
  const startIso = clean(body.start, 40);
  if (!name || !startIso) {
    return res.status(400).json({ ok: false, error: "Name and start time are required." });
  }

  const startDate = new Date(startIso);
  if (Number.isNaN(startDate.getTime())) {
    return res.status(400).json({ ok: false, error: "Invalid start time." });
  }

  const config = loadAvailabilityConfig();
  const endIso = clean(body.end, 40);
  const endDate = endIso && !Number.isNaN(new Date(endIso).getTime())
    ? new Date(endIso)
    : new Date(startDate.getTime() + (config.slotMinutes || 30) * 60000);

  const email = clean(body.email, 160);
  const phone = clean(body.phone, 60);
  const business = clean(body.business, 120);
  const notes = clean(body.notes, 1000);

  try {
    const record = await createBooking({
      Name: name,
      Email: email,
      Phone: phone,
      Business: business,
      Notes: notes,
      Start: startDate.toISOString(),
      End: endDate.toISOString(),
      Status: "Confirmed",
      Source: "admin-manual",
      "Submitted At": new Date().toISOString()
    });

    if (body.notifyClient && email) {
      try {
        const dateLabel = formatDateLabel(startDate, config.timezone);
        const timeLabel = formatTimeLabel(startDate, config.timezone);
        const timezoneLabel = timezoneAbbrev(startDate, config.timezone);
        const ics = buildBookingIcs({
          uid: `${startDate.getTime()}-${email}@gabansolutions.ca`,
          startIso: startDate.toISOString(),
          endIso: endDate.toISOString(),
          summary: "Free consultation — GABAN Solutions",
          description: `Free consultation with GABAN Solutions.${notes ? ` Notes: ${notes}` : ""}`,
          organizerEmail: "hello@gabansolutions.ca",
          meetLink: config.meetLink
        });
        const confirmation = clientConfirmationEmail({ name, dateLabel, timeLabel, timezoneLabel, notes, meetLink: config.meetLink });
        await sendEmail({
          to: email,
          subject: confirmation.subject,
          html: confirmation.html,
          attachments: [{ filename: "consultation.ics", content: Buffer.from(ics, "utf8").toString("base64") }]
        });
      } catch {
        // best-effort — the booking itself already succeeded
      }
    }

    return res.status(200).json({ ok: true, id: record.id });
  } catch (err) {
    return res.status(502).json({ ok: false, error: err.message });
  }
}
