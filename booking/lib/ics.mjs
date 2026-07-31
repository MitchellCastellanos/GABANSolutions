// Minimal .ics file generator — just enough for a single-event
// calendar invite attached to the booking confirmation email.

function icsDate(iso) {
  return iso.replace(/[-:]/g, "").split(".")[0] + "Z";
}

function escapeText(value) {
  return String(value).replace(/[\\;,]/g, m => `\\${m}`).replace(/\n/g, "\\n");
}

export function buildBookingIcs({ uid, startIso, endIso, summary, description, organizerEmail }) {
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//GABAN Solutions//Booking//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${icsDate(new Date().toISOString())}`,
    `DTSTART:${icsDate(startIso)}`,
    `DTEND:${icsDate(endIso)}`,
    `SUMMARY:${escapeText(summary)}`,
    `DESCRIPTION:${escapeText(description)}`,
    `ORGANIZER:mailto:${organizerEmail}`,
    "STATUS:CONFIRMED",
    "END:VEVENT",
    "END:VCALENDAR"
  ];
  return lines.join("\r\n");
}
