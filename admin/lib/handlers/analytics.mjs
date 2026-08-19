// GET /api/admin/analytics?days=30 (or ?since=ISO&until=ISO) — the
// full business acquisition + conversion dashboard rendered by
// /admin/analytics.html: traffic (pageviews/visitors/referrers/
// countries/devices/evolution, from Vercel Web Analytics) plus leads,
// bookings, a conversion funnel, acquisition/campaign/service/landing-
// page breakdowns joined against real tracked data.
//
// Data sources:
//  - Vercel Web Analytics REST API (visits + custom events) — same
//    VERCEL_TOKEN/PROJECT_ID/TEAM_ID as before. Custom events
//    (session_start, service_view, portfolio_view, *_cta_click,
//    form_start, lead_submit, booking_submit, phone_click,
//    email_click) are fired first-party via `va('event', ...)` from
//    js/components.js/contact.html/book.html — see docs/ADMIN.md.
//  - Airtable "Leads" table (contact-form leads, see leads/lib/airtable.mjs)
//    and the existing "Bookings" table, both carrying first-touch
//    attribution (UtmSource/UtmCampaign/Referrer/LandingPage/...).
//
// Accuracy note baked into this handler: Vercel's anonymous, cookie-less
// visitor counts and Airtable's per-submission attribution are two
// different measurement systems. We never sum counts across dimensions
// to reconstruct a total, and every joined metric (e.g. "conversion %"
// in Acquisition/Campaigns/Service Interest/Landing Pages) is computed
// from data that was captured together at the same moment (the
// session_start event's own visitor count, joined against leads whose
// attribution was captured by that same client-side logic) — not a
// cross-system estimate.

import { requireAdmin } from "../auth.mjs";
import { listLeadsBetween } from "../../../leads/lib/airtable.mjs";
import { listBookingsSubmittedBetween } from "../../../booking/lib/airtable.mjs";

const VERCEL_API = "https://api.vercel.com";
const PROJECT_ID = "prj_DawCpTjY3Xk3qmPTrjyVpR6Or6jd";
const TEAM_ID = "team_ZCF5BCM7w7eiMpAFtvIXKNf0";

const INTERNAL_HOSTS = ["gabansolutions.ca", "digital.gabansolutions.ca", "software.gabansolutions.ca"];

// Very small in-memory cache (per warm serverless instance only) so an
// admin flipping between tabs/refreshing doesn't re-run ~10 parallel
// upstream queries every time. Not correctness-critical either way.
const CACHE_TTL_MS = 30000;
const cache = new Map();

async function vercelAnalytics(path, params) {
  const token = process.env.VERCEL_TOKEN;
  if (!token) {
    const err = new Error("Missing VERCEL_TOKEN env var");
    err.code = "missing_token";
    throw err;
  }
  const url = new URL(`${VERCEL_API}${path}`);
  url.searchParams.set("teamId", TEAM_ID);
  url.searchParams.set("projectId", PROJECT_ID);
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== "") {
      url.searchParams.set(key, String(value));
    }
  }
  const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(body?.error?.message || `Vercel Analytics request failed (${res.status})`);
    err.code = body?.error?.code;
    throw err;
  }
  return body;
}

// Wrappers for the *new* queries (funnel/acquisition/campaigns/etc.)
// that degrade to an empty result instead of throwing. These cover
// custom-event dimensions we can't verify against a live token from
// here — a bad/unsupported `by` value must never take down the
// pageview/referrer/country/device sections that already work.
async function safeAggregate(params) {
  try {
    const body = await vercelAnalytics("/v1/query/web-analytics/events/aggregate", params);
    return Array.isArray(body?.data) ? body.data : [];
  } catch {
    return [];
  }
}
async function safeCount(params) {
  try {
    const body = await vercelAnalytics("/v1/query/web-analytics/visits/count", params);
    return body?.data || {};
  } catch {
    return {};
  }
}

function parseRange(query) {
  if (query?.since && query?.until) {
    const since = new Date(query.since);
    const until = new Date(query.until);
    if (Number.isNaN(since.getTime()) || Number.isNaN(until.getTime()) || since >= until) {
      const err = new Error("Invalid custom date range");
      err.code = "bad_range";
      throw err;
    }
    const maxMs = 180 * 86400000;
    const clampedSince = until.getTime() - since.getTime() > maxMs ? new Date(until.getTime() - maxMs) : since;
    return { since: clampedSince, until, days: Math.round((until - clampedSince) / 86400000) };
  }
  const days = Math.min(Math.max(Number(query?.days) || 30, 1), 90);
  const until = new Date();
  const since = new Date(until.getTime() - days * 86400000);
  return { since, until, days };
}

function previousPeriod(since, until) {
  const spanMs = until.getTime() - since.getTime();
  return { since: new Date(since.getTime() - spanMs), until: new Date(since.getTime()) };
}

function pct(numerator, denominator) {
  if (!denominator) return null;
  return (numerator / denominator) * 100;
}

function delta(current, previous) {
  if (current == null || previous == null) return null;
  if (previous === 0) return current > 0 ? { label: "New", dir: "up" } : null;
  const change = ((current - previous) / previous) * 100;
  if (Math.abs(change) < 0.5) return { label: "0%", dir: "flat" };
  return { label: `${change > 0 ? "+" : ""}${change.toFixed(0)}%`, dir: change > 0 ? "up" : "down" };
}

function normalizeSource(hostname) {
  if (!hostname) return "Direct / Unknown";
  const h = String(hostname).toLowerCase().replace(/^www\./, "");
  if (INTERNAL_HOSTS.includes(h)) return "Internal";
  if (/google\./.test(h)) return "Google";
  if (/linkedin\./.test(h)) return "LinkedIn";
  if (/facebook\.|^fb\.com$|l\.facebook/.test(h)) return "Facebook";
  if (/instagram\./.test(h)) return "Instagram";
  if (/brave\./.test(h)) return "Brave Search";
  if (/bing\./.test(h)) return "Bing";
  if (/duckduckgo\./.test(h)) return "DuckDuckGo";
  if (/twitter\.|x\.com|t\.co/.test(h)) return "X / Twitter";
  if (/wa\.me|whatsapp\./.test(h)) return "WhatsApp";
  return h;
}

// A lead/booking's attribution, as stored on the Airtable record.
function classifyRecord(record) {
  const f = record?.fields || {};
  return {
    source: f.UtmSource || normalizeSource(f.Referrer),
    campaign: f.UtmCampaign || "",
    landingPage: f.LandingPage || f.SourcePath || "",
    service: f.LandingService || ""
  };
}

function groupCount(records, keyFn) {
  const map = new Map();
  for (const r of records) {
    const key = keyFn(r);
    if (!key) continue;
    map.set(key, (map.get(key) || 0) + 1);
  }
  return map;
}

// Day-bucketed COUNTS only (never raw lead fields) for the evolution
// chart's "Leads" toggle — keeps the response free of names/contacts.
function groupByDay(records, dateField) {
  const map = new Map();
  for (const r of records) {
    const raw = r.fields?.[dateField];
    if (!raw) continue;
    const day = String(raw).slice(0, 10);
    map.set(day, (map.get(day) || 0) + 1);
  }
  return map;
}

export async function handleAnalytics(req, res) {
  if (!requireAdmin(req, res)) return;

  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  let range;
  try {
    range = parseRange(req.query);
  } catch (err) {
    return res.status(400).json({ ok: false, error: err.message });
  }
  const since = range.since.toISOString();
  const until = range.until.toISOString();
  const prev = previousPeriod(range.since, range.until);
  const prevSince = prev.since.toISOString();

  const cacheKey = `${since}|${until}`;
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.at < CACHE_TTL_MS) {
    return res.status(200).json(cached.body);
  }

  try {
    // Original traffic sections — unchanged behavior/error handling so
    // "Web Analytics not enabled" / "missing token" still degrade the
    // same way they did before this upgrade.
    const [count, byPath, byReferrer, byCountry, byDevice, byDate] = await Promise.all([
      vercelAnalytics("/v1/query/web-analytics/visits/count", { since, until }),
      vercelAnalytics("/v1/query/web-analytics/visits/aggregate", { since, until, by: "requestPath", limit: 10 }),
      vercelAnalytics("/v1/query/web-analytics/visits/aggregate", { since, until, by: "referrerHostname", limit: 15 }),
      vercelAnalytics("/v1/query/web-analytics/visits/aggregate", { since, until, by: "country", limit: 10 }),
      vercelAnalytics("/v1/query/web-analytics/visits/aggregate", { since, until, by: "deviceType", limit: 5 }),
      vercelAnalytics("/v1/query/web-analytics/visits/aggregate", { since, until, by: "day", limit: 100 })
    ]);

    // New sections — every one of these degrades to an empty result on
    // its own, independent of the others and of the block above.
    const [
      prevTotals,
      eventTotals,
      serviceViews,
      sessionSource,
      sessionCampaign,
      sessionLanding,
      leadsRaw,
      bookingsRaw
    ] = await Promise.all([
      safeCount({ since: prevSince, until: since }),
      safeAggregate({ since, until, by: "eventName", limit: 30 }),
      safeAggregate({ since, until, by: "eventData/service", filter: "eventName eq 'service_view'", limit: 20 }),
      safeAggregate({ since, until, by: "eventData/source", filter: "eventName eq 'session_start'", limit: 20 }),
      safeAggregate({ since, until, by: "eventData/campaign", filter: "eventName eq 'session_start'", limit: 50 }),
      safeAggregate({ since, until, by: "eventData/landing_page", filter: "eventName eq 'session_start'", limit: 20 }),
      listLeadsBetween(prevSince, until).catch(() => null),
      listBookingsSubmittedBetween(prevSince, until).catch(() => null)
    ]);

    // Split the wide [prevSince, until) reads into current vs. previous
    // period (one Airtable call per table instead of two).
    const leads = leadsRaw ? leadsRaw.filter((r) => r.fields?.SubmittedAt >= since) : null;
    const prevLeads = leadsRaw ? leadsRaw.filter((r) => r.fields?.SubmittedAt < since) : null;
    const bookings = bookingsRaw ? bookingsRaw.filter((r) => r.fields?.["Submitted At"] >= since) : null;
    const prevBookings = bookingsRaw ? bookingsRaw.filter((r) => r.fields?.["Submitted At"] < since) : null;

    const leadsCount = leads ? leads.length : null;
    const prevLeadsCount = prevLeads ? prevLeads.length : null;
    const bookingsCount = bookings ? bookings.length : null;
    const prevBookingsCount = prevBookings ? prevBookings.length : null;

    const visitors = count.data?.visitors ?? 0;
    const prevVisitors = prevTotals?.visitors ?? null;
    // Conversion Rate = (leads + bookings) / visitors. A booking is as
    // real a business conversion as a contact-form lead, so both count
    // toward "did marketing work" — see docs/ADMIN.md for the reasoning
    // if this definition ever needs revisiting.
    const totalConversions = leadsCount != null && bookingsCount != null ? leadsCount + bookingsCount : null;
    const prevTotalConversions = prevLeadsCount != null && prevBookingsCount != null ? prevLeadsCount + prevBookingsCount : null;
    const conversionRate = totalConversions != null ? pct(totalConversions, visitors) : null;
    const prevConversionRate = prevTotalConversions != null && prevVisitors != null ? pct(prevTotalConversions, prevVisitors) : null;

    const kpis = {
      visitors: { value: visitors, delta: delta(visitors, prevVisitors) },
      pageviews: { value: count.data?.pageviews ?? 0, delta: delta(count.data?.pageviews ?? 0, prevTotals?.pageviews ?? null) },
      leads: { value: leadsCount, delta: delta(leadsCount, prevLeadsCount), available: leads != null },
      bookings: { value: bookingsCount, delta: delta(bookingsCount, prevBookingsCount), available: bookings != null },
      conversionRate: { value: conversionRate, delta: delta(conversionRate, prevConversionRate), available: totalConversions != null }
    };

    // --- Conversion funnel -------------------------------------------------
    // Each stage is an independent unique-visitor count for that event
    // (a visitor triggering two different stages is counted in both —
    // this is a set of funnel checkpoints, not a strict single-path trace).
    const eventVisitors = {};
    for (const row of eventTotals) {
      if (row.eventName) eventVisitors[row.eventName] = row.visitors ?? row.count ?? 0;
    }
    const funnelSteps = [
      { label: "Visitors", count: visitors },
      { label: "Service Page Viewed", count: eventVisitors.service_view || 0 },
      { label: "Booking/Contact CTA Clicked", count: (eventVisitors.booking_cta_click || 0) + (eventVisitors.contact_cta_click || 0) },
      { label: "Form Started", count: eventVisitors.form_start || 0 },
      { label: "Lead Submitted", count: (eventVisitors.lead_submit || 0) + (eventVisitors.booking_submit || 0) }
    ];
    const funnel = funnelSteps.map((step) => ({ ...step, pctOfVisitors: pct(step.count, visitors) }));
    const funnelTracked = eventTotals.length > 0;

    // --- Acquisition (normalized traffic source) ---------------------------
    const allConversions = [...(leads || []), ...(bookings || [])];
    const leadsBySource = groupCount(allConversions, (r) => classifyRecord(r).source);
    const acquisition = sessionSource
      .map((row) => {
        const source = row.eventData || "Direct / Unknown";
        const sessionVisitors = row.visitors ?? row.count ?? 0;
        const leadCount = leadsBySource.get(source) || 0;
        return { source, visitors: sessionVisitors, leads: leadCount, conversion: pct(leadCount, sessionVisitors) };
      })
      .sort((a, b) => b.visitors - a.visitors);

    // --- Campaign performance (UTM) -----------------------------------------
    const leadsByCampaign = new Map();
    for (const r of allConversions) {
      const c = classifyRecord(r);
      if (!c.campaign) continue;
      const entry = leadsByCampaign.get(c.campaign) || { count: 0, source: c.source };
      entry.count += 1;
      leadsByCampaign.set(c.campaign, entry);
    }
    const campaigns = sessionCampaign
      .filter((row) => row.eventData)
      .map((row) => {
        const campaign = row.eventData;
        const campaignVisitors = row.visitors ?? row.count ?? 0;
        const info = leadsByCampaign.get(campaign);
        return {
          campaign,
          source: info?.source || null,
          visitors: campaignVisitors,
          leads: info?.count || 0,
          conversion: pct(info?.count || 0, campaignVisitors)
        };
      })
      .sort((a, b) => b.visitors - a.visitors);

    // --- Service interest ----------------------------------------------------
    const leadsByService = groupCount(allConversions, (r) => classifyRecord(r).service);
    const serviceInterest = serviceViews
      .map((row) => {
        const service = row.eventData || "(unknown)";
        const views = row.count ?? 0;
        const serviceVisitors = row.visitors ?? 0;
        const leadCount = leadsByService.get(service) || 0;
        return { service, views, visitors: serviceVisitors, leads: leadCount, conversion: pct(leadCount, serviceVisitors) };
      })
      .sort((a, b) => b.views - a.views);

    // --- Landing pages ---------------------------------------------------------
    const leadsByLanding = groupCount(allConversions, (r) => classifyRecord(r).landingPage);
    const landingPages = sessionLanding
      .map((row) => {
        const page = row.eventData || "(unknown)";
        const pageVisitors = row.visitors ?? row.count ?? 0;
        const leadCount = leadsByLanding.get(page) || 0;
        return { page, visitors: pageVisitors, leads: leadCount, conversion: pct(leadCount, pageVisitors) };
      })
      .sort((a, b) => b.visitors - a.visitors);

    // --- Leads/bookings evolution (counts only, no PII) ----------------------
    let conversionsByDate = null;
    if (leads || bookings) {
      const leadsByDay = leads ? groupByDay(leads, "SubmittedAt") : new Map();
      const bookingsByDay = bookings ? groupByDay(bookings, "Submitted At") : new Map();
      const days = new Set([...leadsByDay.keys(), ...bookingsByDay.keys()]);
      conversionsByDate = [...days].sort().map((day) => ({
        date: day,
        leads: leadsByDay.get(day) || 0,
        bookings: bookingsByDay.get(day) || 0
      }));
    }

    const responseBody = {
      ok: true,
      enabled: true,
      days: range.days,
      since,
      until,
      kpis,
      funnel,
      funnelTracked,
      totals: count.data,
      byPath: byPath.data,
      byReferrer: byReferrer.data,
      byCountry: byCountry.data,
      byDevice: byDevice.data,
      byDate: byDate.data,
      conversionsByDate,
      acquisition,
      campaigns,
      serviceInterest,
      landingPages,
      leadsAvailable: leads != null,
      bookingsAvailable: bookings != null
    };

    if (cache.size > 50) cache.clear();
    cache.set(cacheKey, { at: Date.now(), body: responseBody });

    return res.status(200).json(responseBody);
  } catch (err) {
    if (err.code === "web_analytics_not_enabled") {
      return res.status(200).json({
        ok: true,
        enabled: false,
        message: "Web Analytics is not enabled for this project yet. Enable it in the Vercel dashboard: Project Settings → Analytics → Enable."
      });
    }
    if (err.code === "missing_token") {
      return res.status(200).json({
        ok: true,
        enabled: false,
        message: "VERCEL_TOKEN is not set. Create one at vercel.com/account/tokens and add it to this project's Environment Variables."
      });
    }
    return res.status(502).json({ ok: false, error: err.message });
  }
}
