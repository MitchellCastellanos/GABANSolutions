// GET /api/cron/prospect — manual/HTTP trigger for leadgen/scripts/prospect.mjs.
// Not on the Vercel Cron schedule (see vercel.json) — the weekly
// prospect->enrich->score run lives in .github/workflows/leadgen-weekly.yml
// instead, since Vercel Hobby's function timeout is too tight for it.
// This endpoint still works standalone if you want to trigger this one
// step over HTTP (same CRON_SECRET bearer-token auth).
import { main as runProspect } from "../../leadgen/scripts/prospect.mjs";
import { requireCronAuth } from "../../leadgen/lib/cron-auth.mjs";

export default async function handler(req, res) {
  if (!requireCronAuth(req, res)) return;
  try {
    await runProspect();
    return res.status(200).json({ ok: true });
  } catch (err) {
    return res.status(500).json({ ok: false, error: err.message });
  }
}
