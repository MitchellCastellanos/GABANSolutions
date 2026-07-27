// ============================================================
// Shared guard for the api/cron/* endpoints. Vercel Cron sends
// `Authorization: Bearer $CRON_SECRET` on every scheduled invocation
// when a CRON_SECRET env var is set — this checks that header so the
// endpoints can't be triggered by anyone who finds the URL.
// See: https://vercel.com/docs/cron-jobs/manage-cron-jobs#securing-cron-jobs
// ============================================================

export function requireCronAuth(req, res) {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    res.status(500).json({ ok: false, error: "CRON_SECRET not configured" });
    return false;
  }
  if (req.headers.authorization !== `Bearer ${secret}`) {
    res.status(401).json({ ok: false, error: "Unauthorized" });
    return false;
  }
  return true;
}
