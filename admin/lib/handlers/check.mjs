// GET  /api/admin/check — is the admin session cookie valid?
// POST /api/admin/check { password } — log in and set the session cookie.

import {
  checkPassword,
  clearSessionCookie,
  createSessionCookie,
  verifySessionCookie
} from "../auth.mjs";

export async function handleCheck(req, res) {
  if (req.method === "GET") {
    try {
      if (!verifySessionCookie(req.headers.cookie)) {
        return res.status(401).json({ ok: false, error: "Unauthorized" });
      }
      return res.status(200).json({ ok: true });
    } catch (err) {
      return res.status(500).json({ ok: false, error: err.message });
    }
  }

  if (req.method === "POST") {
    const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : (req.body || {});
    const password = (body.password || "").toString();

    try {
      if (!checkPassword(password)) {
        return res.status(401).json({ ok: false, error: "Wrong password." });
      }
      res.setHeader("Set-Cookie", createSessionCookie());
      return res.status(200).json({ ok: true });
    } catch (err) {
      return res.status(500).json({ ok: false, error: err.message });
    }
  }

  if (req.method === "DELETE") {
    res.setHeader("Set-Cookie", clearSessionCookie());
    return res.status(200).json({ ok: true });
  }

  res.setHeader("Allow", "GET, POST, DELETE");
  return res.status(405).json({ ok: false, error: "Method not allowed" });
}
