// GET /api/cron/prospect — invoked by Vercel Cron (see vercel.json).
// Thin wrapper around leadgen/scripts/prospect.mjs so it can run on
// a schedule without a long-lived server.
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
