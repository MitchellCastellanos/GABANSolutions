# Booking calendar (`/book.html`)

A self-hosted Calendly-style scheduler — no third-party booking tool, no
per-booking fee. Visitors pick an open slot, get an instant confirmation
email with a calendar invite (.ics), and GABAN gets a notification email.

## How the pieces fit

- **`booking/config/availability.json`** — your weekly hours, in plain JSON.
  This is the file you edit whenever your schedule changes. No code changes,
  no deploy step beyond committing the file.
- **`GET /api/booking/availability`** — reads that config, subtracts already
  booked slots (from Airtable), and returns open slots grouped by date.
  Works even before the Airtable table below exists — it just can't yet
  prevent double-booking.
- **`POST /api/booking/book`** — re-checks the slot is still open, writes a
  row to Airtable, and sends the two emails (visitor confirmation + your
  notification) via Resend.
- **`book.html`** — the calendar UI. Uses the shared nav/footer/i18n exactly
  like every other page on the site.

## Changing your hours

Open `booking/config/availability.json`:

```json
"weekly": {
  "monday": [{ "start": "08:00", "end": "18:00" }],
  ...
}
```

- Preloaded as Monday–Friday, 8 AM–6 PM, `America/New_York` (handles
  EST/EDT automatically — you never need to touch the timezone for
  daylight saving).
- Give a weekday an empty array (`[]`) to close it entirely.
- Add a lunch break by splitting a day into two ranges, e.g.
  `[{"start":"08:00","end":"12:00"},{"start":"13:00","end":"18:00"}]`.
- `blockedDates`: add one-off dates you're out (`["2026-12-25"]`) —
  overrides the weekly rule for that date.
- `extraDates`: add one-off extra availability the same shape as `weekly`
  (e.g. opening a Saturday) — also overrides the weekly rule for that date.
- `slotMinutes`: length of each bookable slot (default 30).
- `minNoticeHours`: how much lead time is required before the next open
  slot (default 4) — stops someone booking 5 minutes from now.
- `bookingHorizonDays`: how far out the calendar shows slots (default 45).

## One-time Airtable setup

Create a table (any name — set it in `AIRTABLE_BOOKINGS_TABLE`, defaults to
`Bookings`) in the same base already used for `AIRTABLE_BASE_ID`, with these
fields:

| Field | Type |
|---|---|
| Name | Single line text |
| Email | Single line text |
| Phone | Single line text |
| Business | Single line text |
| Notes | Long text |
| Start | Date (include time, ISO 8601) |
| End | Date (include time, ISO 8601) |
| Status | Single select: `Confirmed`, `Cancelled` |
| Source | Single line text |
| Lang | Single line text |
| Submitted At | Date (include time) |

To cancel/reschedule a booking today: open the record in Airtable and set
`Status` to `Cancelled` (or change `Start`/`End`) — the availability
endpoint re-reads Airtable on every request, so the slot frees up
immediately. A cancellation-confirmation email isn't wired up yet; for now
that's a manual message to the client.

## Environment variables

Same Resend/Airtable setup the lead-gen system already uses — see
`leadgen/.env.example`:

- `AIRTABLE_API_KEY`, `AIRTABLE_BASE_ID` — required, shared with leadgen.
- `AIRTABLE_BOOKINGS_TABLE` — optional, defaults to `Bookings`.
- `RESEND_API_KEY`, `LEADGEN_FROM_EMAIL` — required for confirmation/
  notification emails.
- `BOOKING_NOTIFY_EMAIL` — optional, who gets the "new booking" email
  (defaults to `hello@gabansolutions.ca`).

If Airtable env vars aren't set yet, `/book.html` still shows every
configured slot as open (the availability check fails soft), but
`/api/booking/book` will return an error on submit — the Airtable table is
required before you actually accept a real booking.
