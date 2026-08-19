// GET /api/admin/analytics?days=30 — traffic summary from Vercel Web
// Analytics (total pageviews/visitors, top pages, top referrers, top
// countries, device breakdown), rendered by /admin/analytics.html.
//
// Calls Vercel's REST API directly with its own bearer token — MCP
// tooling used to build this repo is only available to a human/agent
// working on the codebase, not to code running on the live site. Set
// VERCEL_TOKEN in Vercel's Environment Variables (create one at
// vercel.com/account/tokens, scoped to this team). Project/team IDs
// below are not secrets.
//
// Gracefully reports enabled:false (not an HTTP error) if Web
// Analytics hasn't been turned on for the project yet (Project
// Settings -> Analytics -> Enable) or if VERCEL_TOKEN isn't set yet,
// so the admin page can show a clear one-time setup message instead
// of a broken dashboard.

import { requireAdmin } from "../auth.mjs";

const VERCEL_API = "https://api.vercel.com";
const PROJECT_ID = "prj_DawCpTjY3Xk3qmPTrjyVpR6Or6jd";
const TEAM_ID = "team_ZCF5BCM7w7eiMpAFtvIXKNf0";

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

function dateRange(query) {
  const days = Math.min(Math.max(Number(query?.days) || 30, 1), 90);
  const until = new Date();
  const since = new Date(until.getTime() - days * 86400000);
  return { since: since.toISOString(), until: until.toISOString(), days };
}

export async function handleAnalytics(req, res) {
  if (!requireAdmin(req, res)) return;

  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  const { since, until, days } = dateRange(req.query);

  try {
    const [count, byPath, byReferrer, byCountry, byDevice, byDate] = await Promise.all([
      vercelAnalytics("/v1/query/web-analytics/visits/count", { since, until }),
      vercelAnalytics("/v1/query/web-analytics/visits/aggregate", { since, until, by: "requestPath", limit: 10 }),
      vercelAnalytics("/v1/query/web-analytics/visits/aggregate", { since, until, by: "referrerHostname", limit: 10 }),
      vercelAnalytics("/v1/query/web-analytics/visits/aggregate", { since, until, by: "country", limit: 10 }),
      vercelAnalytics("/v1/query/web-analytics/visits/aggregate", { since, until, by: "deviceType", limit: 5 }),
      vercelAnalytics("/v1/query/web-analytics/visits/aggregate", { since, until, by: "day", limit: 100 })
    ]);

    return res.status(200).json({
      ok: true,
      enabled: true,
      days,
      since,
      until,
      totals: count.data,
      byPath: byPath.data,
      byReferrer: byReferrer.data,
      byCountry: byCountry.data,
      byDevice: byDevice.data,
      byDate: byDate.data
    });
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
