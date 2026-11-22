import { test } from "node:test";
import assert from "node:assert/strict";
import { isBlockedIp, parseTarget, guardedLookup, safeFetchHtml } from "../lib/ssrf.mjs";
import { extractFacts, scoreFacts } from "../lib/audit.mjs";
import { _resetForTests } from "../lib/guards.mjs";
import handler from "../../api/assistant/[...path].js";

test("blocks private/reserved IPs in every form", () => {
  for (const ip of ["127.0.0.1", "10.1.2.3", "172.16.0.1", "172.31.255.255", "192.168.1.1", "169.254.169.254", "0.0.0.0", "100.64.0.1", "224.0.0.1", "255.255.255.255",
    "::1", "::", "fe80::1", "fc00::1", "fd12::1", "::ffff:127.0.0.1", "::ffff:7f00:1", "::ffff:169.254.169.254", "64:ff9b::a00:1", "2002:7f00:1::", "ff02::1"])
    assert.equal(isBlockedIp(ip), true, ip);
  for (const ip of ["93.184.216.34", "8.8.8.8", "172.32.0.1", "2606:4700::1111", "::ffff:8.8.8.8"]) assert.equal(isBlockedIp(ip), false, ip);
});

test("parseTarget rejects dangerous inputs", () => {
  for (const bad of ["http://127.0.0.1", "http://2130706433", "http://0x7f.1", "http://017700000001", "http://[::1]/", "http://localhost", "http://intranet",
    "http://foo.internal", "http://foo.local", "file:///etc/passwd", "ftp://example.com", "gopher://example.com", "javascript:alert(1)", "http://user:pw@example.com",
    "https://example.com:8080", "http://169.254.169.254/latest/meta-data", "", "a b.com", "x".repeat(3000)])
    assert.throws(() => parseTarget(bad), undefined, bad);
  assert.equal(parseTarget("example.com").href, "https://example.com/");
  assert.equal(parseTarget("http://example.com:80/x#y").href, "http://example.com/x");
  assert.equal(parseTarget("https://bücher.ca").hostname, "xn--bcher-kva.ca");
});

const resolver = answers => (host, opts, cb) => cb(null, answers.map(address => ({ address, family: address.includes(":") ? 6 : 4 })));

test("guardedLookup refuses private answers, incl. mixed public+private (rebinding)", async () => {
  const run = a => new Promise(r => guardedLookup("x.com", { all: true }, (e, v) => r({ e, v }), resolver(a)));
  assert.ok((await run(["10.0.0.5"])).e);
  assert.ok((await run(["8.8.8.8", "127.0.0.1"])).e);
  assert.ok((await run(["8.8.8.8"])).v);
});

test("safeFetchHtml re-validates each redirect hop", async () => {
  const seen = [];
  const redirectToMeta = async url => { seen.push(url.href); return url.hostname === "good.com" ? { status: 302, headers: { location: "http://169.254.169.254/latest" }, body: "" } : { status: 200, headers: {}, body: "x" }; };
  await assert.rejects(safeFetchHtml("https://good.com", { fetcher: redirectToMeta }), /IP addresses/);
  assert.deepEqual(seen, ["https://good.com/"]); // never fetched the metadata URL
  const loop = async () => ({ status: 301, headers: { location: "/again" }, body: "" });
  await assert.rejects(safeFetchHtml("https://good.com", { fetcher: loop }), /redirects/);
  const ok = await safeFetchHtml("https://good.com", { fetcher: async () => ({ status: 200, headers: {}, body: "<html></html>" }) });
  assert.equal(ok.status, 200);
  await assert.rejects(safeFetchHtml("https://good.com", { fetcher: async () => ({ status: 500, headers: {}, body: "" }) }), /HTTP 500/);
});

test("real transport: hostname that resolves to loopback is refused before connecting", async () => {
  const lookup = (h, o, cb) => guardedLookup(h, o, cb, resolver(["127.0.0.1"]));
  await assert.rejects(safeFetchHtml("http://victim.example.com", { lookup, timeoutMs: 3000 }), e => e.code === "private-address");
});

const GOOD = `<!doctype html><html lang="fr"><head><title>Garage Dupont — réparation auto à Montréal</title>
<meta name="description" content="${"Garage de confiance à Montréal, entretien, freins et diagnostics rapides pour tous les véhicules. ".slice(0, 100)}">
<meta name="viewport" content="width=device-width, initial-scale=1"><link rel="canonical" href="/"><meta property="og:title" content="x">
<link rel="alternate" hreflang="fr" href="/"><link rel="alternate" hreflang="en" href="/en"></head><body><h1>Réparation auto</h1><img src=a.jpg alt="a">${"<p>texte utile pour les clients. </p>".repeat(30)}</body></html>`;

test("audit scoring: good page scores high, bare page is flagged in all categories", () => {
  const good = scoreFacts(extractFacts(GOOD, "https://x.ca"), "fr");
  assert.ok(good.overall >= 90, String(good.overall));
  const bare = scoreFacts(extractFacts("<html><body><p>hi</p></body></html>", "http://x.ca"), "en");
  assert.ok(bare.overall < 40);
  assert.ok(bare.categories.find(c => c.id === "mobile").findings.length);
  assert.ok(bare.categories.find(c => c.id === "bilingual").findings.some(f => /Bill 96/.test(f.text)));
});

const mkRes = () => ({ code: 200, headers: {}, body: null, setHeader(k, v) { this.headers[k] = v; }, status(n) { this.code = n; return this; }, json(b) { this.body = b; return this; } });
const mkReq = (body, ip) => ({ method: "POST", query: { path: ["audit"] }, headers: { "x-forwarded-for": ip }, body });

test("audit endpoint: SSRF targets get a generic 422, rate limit kicks in at 4th call", async () => {
  _resetForTests();
  const msgs = new Set();
  for (const url of ["http://127.0.0.1", "http://169.254.169.254/latest/meta-data", "http://localhost:3000", "file:///etc/passwd"]) {
    const r = mkRes(); await handler(mkReq({ url, lang: "en" }, "9.9.9." + msgs.size), r);
    assert.equal(r.code, 422); msgs.add(r.body.error);
  }
  assert.equal(msgs.size, 1); // identical response: no probing signal
  let r;
  for (let i = 0; i < 4; i++) { r = mkRes(); await handler(mkReq({ url: "http://127.0.0.1", lang: "en" }, "8.8.8.8"), r); }
  assert.equal(r.code, 429);
});
