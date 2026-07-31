import { next, rewrite } from "@vercel/functions";

export const config = {
  matcher: "/"
};

export default function middleware(request) {
  const url = new URL(request.url);
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
