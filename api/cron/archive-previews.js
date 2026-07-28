// GET /api/cron/archive-previews — manual/HTTP trigger for leadgen/scripts/archive-previews.mjs.
// Not on the Vercel Cron schedule — runs weekly via
// .github/workflows/leadgen-weekly.yml alongside prospect/enrich/score.
import { main as runArchivePreviews } from "../../leadgen/scripts/archive-previews.mjs";
import { requireCronAuth } from "../../leadgen/lib/cron-auth.mjs";

export default async function handler(req, res) {
  if (!requireCronAuth(req, res)) return;
  try {
    await runArchivePreviews();
    return res.status(200).json({ ok: true });
  } catch (err) {
    return res.status(500).json({ ok: false, error: err.message });
  }
}
