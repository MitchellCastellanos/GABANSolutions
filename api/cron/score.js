// GET /api/cron/score — manual/HTTP trigger for leadgen/scripts/score.mjs.
// Not on the Vercel Cron schedule — see .github/workflows/leadgen-weekly.yml
// and the note in api/cron/prospect.js.
import { main as runScore } from "../../leadgen/scripts/score.mjs";
import { requireCronAuth } from "../../leadgen/lib/cron-auth.mjs";

export default async function handler(req, res) {
  if (!requireCronAuth(req, res)) return;
  try {
    await runScore();
    return res.status(200).json({ ok: true });
  } catch (err) {
    return res.status(500).json({ ok: false, error: err.message });
  }
}
