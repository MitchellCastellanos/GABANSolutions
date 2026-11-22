// ============================================================
// SSRF-safe server-side fetch for user-supplied URLs.
//
// Defenses (all enforced here, none left to callers):
//  - scheme http/https only, ports 80/443 only, no credentials
//  - no IP-literal hosts (also catches decimal/hex/octal forms, since
//    URL() normalizes them), no localhost/.local/.internal/dotless names
//  - DNS is checked AT CONNECT TIME via a custom `lookup`, and the
//    socket connects to that exact validated address — so a DNS
//    rebinding answer between "check" and "use" can't swap in a private IP
//  - every resolved address must be public (v4 + v6 + v4-mapped v6)
//  - redirects are followed manually (max 3) and each hop re-validated
//  - response capped by bytes and time; HTML content-types only
//  - no cookies / visitor headers are forwarded
// ============================================================

import dns from "node:dns";
import net from "node:net";
import http from "node:http";
import https from "node:https";

export class SsrfError extends Error {
  constructor(message, code = "blocked") { super(message); this.code = code; }
}

function v4ToInt(ip) {
  return ip.split(".").reduce((n, o) => n * 256 + Number(o), 0);
}
const V4_BLOCKS = [
  ["0.0.0.0", 8], ["10.0.0.0", 8], ["100.64.0.0", 10], ["127.0.0.0", 8], ["169.254.0.0", 16],
  ["172.16.0.0", 12], ["192.0.0.0", 24], ["192.0.2.0", 24], ["192.168.0.0", 16], ["198.18.0.0", 15],
  ["198.51.100.0", 24], ["203.0.113.0", 24], ["224.0.0.0", 4], ["240.0.0.0", 4]
].map(([b, bits]) => [v4ToInt(b), bits]);

function expandV6(ip) {
  let s = ip.split("%")[0].toLowerCase();
  const v4 = s.match(/(\d+\.\d+\.\d+\.\d+)$/);
  if (v4) {
    const n = v4ToInt(v4[1]);
    s = s.replace(v4[1], ((n >>> 16) & 0xffff).toString(16) + ":" + (n & 0xffff).toString(16));
  }
  const [head, tail] = s.split("::");
  const h = head ? head.split(":") : [];
  const t = tail !== undefined ? (tail ? tail.split(":") : []) : [];
  const fill = tail !== undefined ? new Array(8 - h.length - t.length).fill("0") : [];
  return [...h, ...fill, ...t].map(x => parseInt(x || "0", 16));
}

export function isBlockedIp(ip) {
  const kind = net.isIP(ip);
  if (kind === 4) {
    const n = v4ToInt(ip);
    return V4_BLOCKS.some(([base, bits]) => (n >>> (32 - bits)) === (base >>> (32 - bits)));
  }
  if (kind === 6) {
    const g = expandV6(ip);
    if (g.length !== 8 || g.some(Number.isNaN)) return true;
    if (g.every(x => x === 0) || (g.slice(0, 7).every(x => x === 0) && g[7] === 1)) return true; // :: ::1
    const embeddedV4 = () => `${g[6] >> 8}.${g[6] & 255}.${g[7] >> 8}.${g[7] & 255}`;
    if (g.slice(0, 5).every(x => x === 0) && g[5] === 0xffff) return isBlockedIp(embeddedV4()); // ::ffff:a.b.c.d
    if (g.slice(0, 6).every(x => x === 0)) return true; // deprecated v4-compatible
    if (g[0] === 0x64 && g[1] === 0xff9b) return isBlockedIp(embeddedV4()); // NAT64
    if ((g[0] & 0xfe00) === 0xfc00) return true; // fc00::/7 ULA
    if ((g[0] & 0xffc0) === 0xfe80) return true; // fe80::/10 link-local
    if ((g[0] & 0xff00) === 0xff00) return true; // multicast
    if (g[0] === 0x2001 && g[1] === 0x0db8) return true; // documentation
    if (g[0] === 0x2002) return true; // 6to4 (can embed private v4)
    return false;
  }
  return true; // not an IP -> treat as blocked
}

export function parseTarget(input) {
  let raw = typeof input === "string" ? input.trim() : "";
  if (!raw || raw.length > 2048 || /[\s\u0000-\u001f]/.test(raw)) throw new SsrfError("Invalid URL", "invalid");
  if (!/^[a-z][a-z0-9+.-]*:\/\//i.test(raw)) {
    if (/^[a-z][a-z0-9+.-]*:/i.test(raw) && !/^[^/]*\.[^/]*:\d+/.test(raw)) throw new SsrfError("Scheme not allowed", "scheme");
    raw = "https://" + raw;
  }
  let u;
  try { u = new URL(raw); } catch { throw new SsrfError("Invalid URL", "invalid"); }
  if (u.protocol !== "http:" && u.protocol !== "https:") throw new SsrfError("Scheme not allowed", "scheme");
  if (u.username || u.password) throw new SsrfError("Credentials not allowed", "credentials");
  if (u.port && u.port !== "80" && u.port !== "443") throw new SsrfError("Port not allowed", "port");
  const host = u.hostname.replace(/\.$/, "").toLowerCase();
  if (net.isIP(host) || host.startsWith("[")) throw new SsrfError("IP addresses not allowed", "ip-literal");
  // URL() already converts IDN to punycode, so a valid public host is plain ASCII.
  if (!host.includes(".") || host === "localhost" || /\.(local|localhost|internal|lan|home|corp|intranet)$/.test(host) || !/^[a-z0-9.-]+$/.test(host)) {
    throw new SsrfError("Host not allowed", "host");
  }
  u.hash = "";
  return u;
}

// dns.lookup replacement that refuses non-public answers. The socket
// connects to the address returned here, closing the rebinding window.
export function guardedLookup(hostname, options, cb, resolver = dns.lookup) {
  resolver(hostname, { all: true, verbatim: true }, (err, addrs) => {
    if (err) return cb(err);
    const list = Array.isArray(addrs) ? addrs : [{ address: addrs, family: net.isIP(addrs) }];
    if (!list.length || list.some(a => isBlockedIp(a.address))) {
      return cb(new SsrfError("Resolved to a non-public address", "private-address"));
    }
    if (options && options.all) return cb(null, list);
    cb(null, list[0].address, list[0].family);
  });
}

const TEXT_TYPE = /^(text\/html|application\/xhtml\+xml)\b/i;

function fetchOnce(url, { timeoutMs, maxBytes, lookup }) {
  return new Promise((resolve, reject) => {
    const mod = url.protocol === "https:" ? https : http;
    const req = mod.request(url, {
      method: "GET",
      lookup,
      timeout: timeoutMs,
      headers: { "user-agent": "GABAN-SiteCheck/1.0 (+https://gabansolutions.ca)", accept: "text/html,application/xhtml+xml", "accept-encoding": "identity" }
    }, res => {
      const status = res.statusCode || 0;
      if (status >= 300 && status < 400) { res.resume(); return resolve({ status, headers: res.headers, body: "" }); }
      const type = String(res.headers["content-type"] || "");
      if (!TEXT_TYPE.test(type)) { res.destroy(); return reject(new SsrfError("Not an HTML page", "content-type")); }
      const chunks = []; let size = 0;
      res.on("data", c => {
        size += c.length;
        if (size > maxBytes) { res.destroy(); return resolve({ status, headers: res.headers, body: Buffer.concat(chunks).toString("utf8"), truncated: true }); }
        chunks.push(c);
      });
      res.on("end", () => resolve({ status, headers: res.headers, body: Buffer.concat(chunks).toString("utf8") }));
      res.on("error", reject);
    });
    req.on("timeout", () => req.destroy(new SsrfError("Timed out", "timeout")));
    req.on("error", reject);
    req.end();
  });
}

export async function safeFetchHtml(input, { maxRedirects = 3, maxBytes = 1_000_000, timeoutMs = 8000, lookup = guardedLookup, fetcher = fetchOnce } = {}) {
  let url = parseTarget(input);
  const started = Date.now();
  for (let hop = 0; hop <= maxRedirects; hop++) {
    const remaining = timeoutMs - (Date.now() - started);
    if (remaining <= 0) throw new SsrfError("Timed out", "timeout");
    const r = await fetcher(url, { timeoutMs: remaining, maxBytes, lookup });
    if (r.status >= 300 && r.status < 400 && r.headers.location) {
      if (hop === maxRedirects) throw new SsrfError("Too many redirects", "redirects");
      url = parseTarget(new URL(r.headers.location, url).href); // re-validate every hop
      continue;
    }
    if (r.status < 200 || r.status >= 300) throw new SsrfError(`Site returned HTTP ${r.status}`, "http-status");
    return { finalUrl: url.href, status: r.status, html: r.body, truncated: Boolean(r.truncated), ms: Date.now() - started };
  }
  throw new SsrfError("Too many redirects", "redirects");
}
