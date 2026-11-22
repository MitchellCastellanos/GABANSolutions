// ============================================================
// Shared abuse guards for every AI-backed endpoint.
//
// Rate state lives in module memory: on Vercel serverless that is
// per warm instance, so this is best-effort (it stops casual abuse and
// runaway loops, not a distributed attacker). Roadmap item 7 swaps the
// store for Upstash/Vercel KV without changing these function
// signatures.
// ============================================================

const hits = new Map(); // key -> number[] (timestamps, ms)
const dailyByKey = new Map(); // key -> { day, count }

export function clean(value, max = 500) {
  const s = typeof value === "string" ? value : "";
  // strip control chars (keep \n and \t), collapse nothing else
  return s.replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, "").trim().slice(0, max);
}

export function getClientIp(req) {
  const fwd = req.headers?.["x-forwarded-for"];
  const first = (Array.isArray(fwd) ? fwd[0] : fwd || "").split(",")[0].trim();
  return first || req.headers?.["x-real-ip"] || req.socket?.remoteAddress || "unknown";
}

// Sliding window. Returns { ok, retryAfter } and records the hit when ok.
export function rateLimit(key, { limit, windowMs, now = Date.now() }) {
  const recent = (hits.get(key) || []).filter(t => now - t < windowMs);
  if (recent.length >= limit) {
    hits.set(key, recent);
    return { ok: false, retryAfter: Math.ceil((windowMs - (now - recent[0])) / 1000) };
  }
  recent.push(now);
  hits.set(key, recent);
  if (hits.size > 5000) { // bound memory
    for (const [k, v] of hits) if (!v.some(t => now - t < windowMs)) hits.delete(k);
  }
  return { ok: true, retryAfter: 0 };
}

// Global spend guard: max AI calls per UTC day on this instance.
export function takeDailyBudget(cap = Number(process.env.AI_DAILY_CAP) || 150, now = new Date(), key = "ai") {
  const day = now.toISOString().slice(0, 10);
  let d = dailyByKey.get(key);
  if (!d || d.day !== day) { d = { day, count: 0 }; dailyByKey.set(key, d); }
  if (d.count >= cap) return false;
  d.count += 1;
  return true;
}

export function parseBody(req) {
  try {
    return typeof req.body === "string" ? JSON.parse(req.body || "{}") : (req.body || {});
  } catch {
    return null;
  }
}

export function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

export function _resetForTests() {
  hits.clear();
  dailyByKey.clear();
}
