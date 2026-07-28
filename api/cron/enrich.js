// GET /api/cron/enrich — manual/HTTP trigger for leadgen/scripts/enrich.mjs.
// Not on the Vercel Cron schedule — see .github/workflows/leadgen-weekly.yml
// and the note in api/cron/prospect.js.
import { main as runEnrich } from "../../leadgen/scripts/enrich.mjs";
import { requireCronAuth } from "../../leadgen/lib/cron-auth.mjs";

export default async function handler(req, res) {
  if (!requireCronAuth(req, res)) return;
  try {
    await runEnrich();
    return res.status(200).json({ ok: true });
  } catch (err) {
    return res.status(500).json({ ok: false, error: err.message });
  }
}
