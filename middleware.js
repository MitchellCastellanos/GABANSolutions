import { next, rewrite } from "@vercel/functions";

export const config = {
  matcher: ["/", "/admin", "/admin/:path*", "/api/admin/:path*"]
};

// Everything under /admin (pages + its API routes) is gated behind one
// shared password via HTTP Basic Auth — no session/cookie plumbing needed,
// the browser's native login prompt handles it. Set ADMIN_PASSWORD in
// Vercel's env vars to change it; the fallback below only exists so this
// works before that's configured.
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "Gabriela93!";

function unauthorized() {
  return new Response("Authentication required.", {
    status: 401,
    headers: { "WWW-Authenticate": 'Basic realm="GABAN Admin"' }
  });
}

function isAuthorized(request) {
  const header = request.headers.get("authorization") || "";
  if (!header.startsWith("Basic ")) return false;
  let decoded;
  try {
    decoded = atob(header.slice(6));
  } catch {
    return false;
  }
  const password = decoded.slice(decoded.indexOf(":") + 1);
  return password === ADMIN_PASSWORD;
}

export default function middleware(request) {
  const url = new URL(request.url);

  if (url.pathname === "/admin" || url.pathname.startsWith("/admin/") || url.pathname.startsWith("/api/admin/")) {
    return isAuthorized(request) ? next() : unauthorized();
  }

  const host = request.headers.get("host")?.split(":")[0].toLowerCase();

  if (host === "digital.gabansolutions.ca") {
    url.pathname = "/digital.html";
    return rewrite(url);
  }

  if (host === "software.gabansolutions.ca") {
    url.pathname = "/software.html";
    return rewrite(url);
  }

  return next();
}
