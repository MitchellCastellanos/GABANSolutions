// Session cookie auth for /admin pages and /api/admin/* handlers.
// Decoupled from middleware.js so subdomain rewrites stay untouched.

import crypto from "crypto";

export const ADMIN_COOKIE = "gaban_admin";
const SESSION_MS = 7 * 24 * 60 * 60 * 1000;

function adminPassword() {
  const value = process.env.ADMIN_PASSWORD;
  if (!value) {
    throw new Error("ADMIN_PASSWORD not configured");
  }
  return value;
}

function sign(exp) {
  const sig = crypto
    .createHmac("sha256", adminPassword())
    .update(String(exp))
    .digest("base64url");
  return `${exp}.${sig}`;
}

function parseCookies(header) {
  const out = {};
  if (!header) return out;
  for (const part of header.split(";")) {
    const idx = part.indexOf("=");
    if (idx === -1) continue;
    const key = part.slice(0, idx).trim();
    const value = part.slice(idx + 1).trim();
    out[key] = decodeURIComponent(value);
  }
  return out;
}

export function verifySessionCookie(cookieHeader) {
  try {
    const token = parseCookies(cookieHeader)[ADMIN_COOKIE];
    if (!token) return false;
    const [expRaw, sig] = token.split(".");
    const exp = Number(expRaw);
    if (!exp || !sig || Date.now() > exp) return false;
    const expected = crypto
      .createHmac("sha256", adminPassword())
      .update(String(exp))
      .digest("base64url");
    return crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected));
  } catch {
    return false;
  }
}

export function createSessionCookie() {
  const exp = Date.now() + SESSION_MS;
  const value = sign(exp);
  const maxAge = Math.floor(SESSION_MS / 1000);
  return `${ADMIN_COOKIE}=${encodeURIComponent(value)}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${maxAge}`;
}

export function clearSessionCookie() {
  return `${ADMIN_COOKIE}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`;
}

/** Returns false after sending a 401/500 response. */
export function requireAdmin(req, res) {
  try {
    if (!verifySessionCookie(req.headers.cookie)) {
      res.status(401).json({ ok: false, error: "Unauthorized" });
      return false;
    }
    return true;
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
    return false;
  }
}

export function checkPassword(candidate) {
  const expected = adminPassword();
  if (typeof candidate !== "string") return false;
  const a = Buffer.from(candidate);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}
