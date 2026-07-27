// GET /api/cron/enrich — invoked by Vercel Cron (see vercel.json).
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
