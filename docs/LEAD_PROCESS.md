# GABAN Solutions — Lead-to-Client Process (Main Business)

> Covers the Grow Package / Launch 72H / GarageOS / FieldOS funnel — i.e. every
> lead that comes in through `contact.html` or `mockup.html`. This is the
> process that was missing: previously a lead landed in a Formspree email
> and nothing defined what happened next. This doc is that definition.

---

## 0) Outbound leads (new — see `leadgen/README.md`)

Not every lead is inbound anymore. The **Lead Radar** system in
`leadgen/` finds local businesses on Google Maps, scores how much they'd
benefit from a new site, and once a real, navigable website preview is
generated and approved, a human **cold calls** them to say "I already
made you one, go take a look" — that call
is the real first touch, not an email. Only after the call is logged as
interested does an automated email + follow-up sequence take over,
delivering the link and nudging if they go quiet. All of this is tracked
in a separate Airtable pipeline, not this board — see `leadgen/README.md`
for the full call → email → follow-up mechanics.

The two systems meet at one point: when an outbound prospect **replies**,
move their Airtable record to "Respondió" and bring them into this
document's process starting at §3 "Contacted" — same SLA, same board,
same script, just with `ref = outbound-proposal` instead of a `mockup-*`
or `contact-page-direct` value. Everything below this point (§1-§6)
applies unchanged to inbound leads; outbound leads join it once they've
responded.

---

## 1) Where leads come from and what we know about them

Every lead now arrives with a `ref` value showing which CTA sent them, and
a `need` value showing what they said they want. Use these to prioritize —
a `mockup-website` lead already saw a preview and clicked through, so it's
warmer than a cold `contact-page-direct` lead.

| `ref` value | Source |
|---|---|
| `mockup-website` | Clicked "Request my real website" after generating a free preview on `/mockup.html` |
| `mockup-final-cta` | Clicked the bottom CTA on `/mockup.html` without generating a preview |
| `contact-page-direct` | Came straight to `/contact.html` (nav, footer, or another page's "Start Your Project" button) |
| `outbound-proposal` | Clicked "Let's talk 15 min" on an outbound Lead Radar proposal page (`/api/preview/:slug`) — see §0 and `leadgen/README.md` |

The lead payload (see `api/lead.js`) always includes: `name`, `contact`
(phone or email, visitor's choice), `need`, and optionally `business`,
`package`, `timeline`, `message`, `ref`, `source_path`.

## 2) The SLA — this is the part that was missing

**Every lead gets a first response within 2 business hours, always.**
Not a full proposal — just a human reply. That's the difference between
"we don't know if this company is alive" and "they're already engaged."

If you can't do a real reply that fast, send a holding message immediately
(WhatsApp template below) and follow up properly same day.

## 3) Board stages (Notion / Trello — pick one, keep it consistent)

Create one board with these columns. Every lead becomes one card the
moment it arrives (manually today; automatable later via `LEAD_WEBHOOK_URL`
— see §5).

1. **New Lead** — just arrived, not yet reviewed.
2. **Contacted** — first reply sent (SLA: within 2 business hours of arrival).
3. **Qualifying** — back-and-forth to confirm scope, budget fit, timeline.
4. **Proposal Sent** — quote/package recommendation sent, awaiting decision.
5. **Won** — paid / contract confirmed → move to delivery.
6. **Lost / Not a fit** — log why (price, timing, scope mismatch) — this list is worth reviewing monthly to see if the offer or the funnel needs to change.

Card fields to capture: name, contact, need, ref (source), package interest,
timeline urgency, date received, date first contacted, outcome.

## 4) What "Contacted" actually means (first-reply script)

Goal: acknowledge fast, confirm what they asked for, give one concrete
next step. Don't try to close in the first message — just remove doubt
that a real business is on the other end.

**WhatsApp/email template:**

> Hi {{name}} — thanks for reaching out to GABAN Solutions. I saw you're
> looking for {{need}}. I'll follow up with a couple of quick questions
> so I can point you to the right package — talk soon.

Then, within the same day, ask 2–3 qualifying questions (business type,
current online presence if any, rough timeline) and move the card to
**Qualifying**.

## 5) Turning "Qualifying" into "Proposal Sent"

- Match their answers to a package (`Grow Package — One Page/Multi Page`,
  `Launch 72H`, or a GarageOS/FieldOS demo).
- Send a short, specific recommendation — not a generic price list. Reference
  what they told you.
- Set a follow-up reminder for 3 days later if they haven't responded.

## 6) Automating this later (optional, not required to start)

`api/lead.js` supports an optional `LEAD_WEBHOOK_URL` environment variable.
If set, every lead is also POSTed (fire-and-forget, non-blocking) to that
URL as JSON — point it at a Make.com/Zapier scenario to auto-create the
Notion card and send yourself a push notification the moment a lead lands,
instead of relying on checking email.

Until that's wired up, the manual version of this process (check email/
Formspree, log the card yourself) is the process. The point of writing it
down is so "what do we do when a lead arrives" has one answer regardless
of who's checking the inbox that day.
