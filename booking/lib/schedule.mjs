// ============================================================
// Pure scheduling logic for the self-hosted booking calendar.
// No external date libraries — timezone conversion uses the
// standard Intl round-trip trick so America/New_York (EST/EDT)
// resolves correctly across the DST boundary with zero deps.
//
// The weekly hours/blocked dates config lives in
// booking/config/availability.json and is meant to be hand-edited
// as the schedule changes — no code changes needed for that.
// ============================================================

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const CONFIG_PATH = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
  "config",
  "availability.json"
);

const WEEKDAY_NAMES = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];

export function loadAvailabilityConfig() {
  const raw = readFileSync(CONFIG_PATH, "utf8");
  return JSON.parse(raw);
}

function getZonedParts(date, timeZone) {
  const dtf = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit"
  });
  const parts = Object.fromEntries(dtf.formatToParts(date).map(p => [p.type, p.value]));
  return {
    year: Number(parts.year),
    month: Number(parts.month),
    day: Number(parts.day),
    hour: Number(parts.hour),
    minute: Number(parts.minute),
    second: Number(parts.second)
  };
}

/** Resolve a wall-clock date+time in `timeZone` to the actual UTC instant. */
function zonedTimeToUtc(year, month, day, hour, minute, timeZone) {
  const target = Date.UTC(year, month - 1, day, hour, minute, 0);
  let guess = target;
  for (let i = 0; i < 2; i++) {
    const parts = getZonedParts(new Date(guess), timeZone);
    const asUtc = Date.UTC(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute, parts.second);
    guess = target - (asUtc - guess);
  }
  return new Date(guess);
}

function pad2(n) {
  return String(n).padStart(2, "0");
}

function dateStrFromParts({ year, month, day }) {
  return `${year}-${pad2(month)}-${pad2(day)}`;
}

function addDaysToDateStr(dateStr, days) {
  const [y, m, d] = dateStr.split("-").map(Number);
  const utcMidnight = Date.UTC(y, m - 1, d) + days * 86400000;
  const dt = new Date(utcMidnight);
  return dateStrFromParts({ year: dt.getUTCFullYear(), month: dt.getUTCMonth() + 1, day: dt.getUTCDate() });
}

function weekdayNameForDateStr(dateStr) {
  const [y, m, d] = dateStr.split("-").map(Number);
  return WEEKDAY_NAMES[new Date(Date.UTC(y, m - 1, d)).getUTCDay()];
}

function parseHHMM(value) {
  const [h, m] = value.split(":").map(Number);
  return { h, m };
}

/**
 * Build the list of open slots for the next `days` days (or the config's
 * bookingHorizonDays), grouped by date, excluding already-booked slots.
 * `bookedStartIsoSet` is a Set of ISO start-time strings already taken.
 */
export function generateAvailability(config, { days, bookedStartIsoSet = new Set() } = {}) {
  const timeZone = config.timezone;
  const slotMinutes = config.slotMinutes || 30;
  const minNoticeMs = (config.minNoticeHours || 0) * 3600000;
  const horizon = days || config.bookingHorizonDays || 30;
  const now = Date.now();
  const cutoff = now + minNoticeMs;

  const todayParts = getZonedParts(new Date(), timeZone);
  const todayStr = dateStrFromParts(todayParts);

  const dayFormatter = new Intl.DateTimeFormat("en-US", { timeZone, hour: "numeric", minute: "2-digit", hour12: true });

  const days_ = {};
  for (let i = 0; i < horizon; i++) {
    const dateStr = addDaysToDateStr(todayStr, i);
    if ((config.blockedDates || []).includes(dateStr)) continue;

    const weekday = weekdayNameForDateStr(dateStr);
    const ranges = (config.extraDates && config.extraDates[dateStr]) || config.weekly[weekday] || [];
    if (!ranges.length) continue;

    const slots = [];
    for (const range of ranges) {
      const { h: startH, m: startM } = parseHHMM(range.start);
      const { h: endH, m: endM } = parseHHMM(range.end);
      const [y, mo, d] = dateStr.split("-").map(Number);

      let cursorMin = startH * 60 + startM;
      const endMin = endH * 60 + endM;

      while (cursorMin + slotMinutes <= endMin) {
        const hh = Math.floor(cursorMin / 60);
        const mm = cursorMin % 60;
        const startUtc = zonedTimeToUtc(y, mo, d, hh, mm, timeZone);
        const endUtc = new Date(startUtc.getTime() + slotMinutes * 60000);

        if (startUtc.getTime() >= cutoff && !bookedStartIsoSet.has(startUtc.toISOString())) {
          slots.push({
            start: startUtc.toISOString(),
            end: endUtc.toISOString(),
            label: dayFormatter.format(startUtc)
          });
        }
        cursorMin += slotMinutes;
      }
    }

    if (slots.length) days_[dateStr] = slots;
  }

  return { timezone: timeZone, slotMinutes, days: days_ };
}

/** Re-derive the open slots for one date and check whether `startIso` is (still) one of them. */
export function isSlotAvailable(config, dateStr, startIso, bookedStartIsoSet) {
  const { days } = generateAvailability(config, { days: (config.bookingHorizonDays || 30) + 1, bookedStartIsoSet });
  const daySlots = days[dateStr] || [];
  return daySlots.some(s => s.start === startIso);
}
