// Redirects the bare root of the retired digital./software. subdomains.
//
// vercel.json's Host-conditioned redirects handle every OTHER path on
// these subdomains correctly (e.g. digital.gabansolutions.ca/pricing ->
// gabansolutions.ca/digital/pricing), but Vercel resolves an exact static
// file match for a request path (here, "/" -> the site's index.html)
// before it evaluates a conditional `has` redirect for that same path, so
// the root of each subdomain silently served the wrong page (the main
// homepage) instead of redirecting. Edge Middleware runs earlier than
// that static-file resolution, so it's the only place this specific
// redirect actually fires. See docs/HANDOFF.md for the history of this
// subdomain routing and why the /admin gate intentionally lives outside
// this file (matcher stays a literal "/", nothing else).

export const config = {
  matcher: "/"
};

export default function middleware(request) {
  const host = request.headers.get("host")?.split(":")[0].toLowerCase();

  if (host === "digital.gabansolutions.ca") {
    return Response.redirect("https://gabansolutions.ca/digital/", 308);
  }

  if (host === "software.gabansolutions.ca") {
    return Response.redirect("https://gabansolutions.ca/software/", 308);
  }
}
