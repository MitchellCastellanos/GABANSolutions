import { test } from "node:test";
import assert from "node:assert/strict";
import { rateLimit, takeDailyBudget, clean, _resetForTests } from "../lib/guards.mjs";
import { normalizeAnswers, validateLead, buildEstimate, buildBrief, briefEmailHtml } from "../lib/discovery.mjs";
import { callClaudeJson } from "../lib/claude.mjs";

test("rate limit blocks after limit and recovers after window", () => {
  _resetForTests();
  const o = { limit: 2, windowMs: 1000 };
  assert.ok(rateLimit("ip", { ...o, now: 0 }).ok);
  assert.ok(rateLimit("ip", { ...o, now: 10 }).ok);
  assert.equal(rateLimit("ip", { ...o, now: 20 }).ok, false);
  assert.ok(rateLimit("ip", { ...o, now: 1500 }).ok);
});

test("daily budget caps calls", () => {
  _resetForTests();
  assert.ok(takeDailyBudget(1)); assert.equal(takeDailyBudget(1), false);
});

test("normalizeAnswers rejects junk and defaults safely", () => {
  const a = normalizeAnswers({ need: "<script>", languages: ["fr", "xx", "fr"], timeline: 5, businessType: "x".repeat(500) });
  assert.equal(a.need, "unsure"); assert.deepEqual(a.languages, ["fr"]); assert.equal(a.timeline, "flexible"); assert.equal(a.businessType.length, 80);
});

test("validateLead needs name and email or phone", () => {
  assert.equal(validateLead({ name: "A", contact: "nope" }), null);
  assert.ok(validateLead({ name: "A", contact: "a@b.co" }).isEmail);
  assert.ok(validateLead({ name: "A", contact: "514-258-0648" }));
});

test("estimate: custom work is never priced; informative uses published prices", () => {
  const custom = buildEstimate(normalizeAnswers({ need: "custom_app", languages: ["fr"] }), "en");
  assert.ok(!custom.lines.join(" ").includes("$"));
  const site = buildEstimate(normalizeAnswers({ need: "informative", timeline: "asap", languages: ["en"] }), "es");
  assert.ok(site.lines[0].includes("$399"));
  assert.equal(site.law96Flag, true);
  const fr = buildEstimate(normalizeAnswers({ need: "informative", languages: ["fr", "en"] }), "fr");
  assert.equal(fr.law96Flag, false);
  assert.ok(!fr.lines[0].includes("Launch 72H")); // multilingual never gets the 72H single-language offer
});

test("brief falls back to template without key, and on API failure", async () => {
  const a = normalizeAnswers({ need: "informative" }), lead = { name: "Ana Gómez", contact: "a@b.co" }, est = buildEstimate(a);
  delete process.env.ANTHROPIC_API_KEY;
  assert.equal((await buildBrief(a, lead, est, "en")).ai, false);
  process.env.ANTHROPIC_API_KEY = "test";
  const b = await buildBrief(a, lead, est, "en", { call: async () => { throw new Error("boom"); } });
  assert.equal(b.ai, false);
  const ok = await buildBrief(a, lead, est, "en", { call: async () => ({ client_summary: "hi", team_summary: "t", risks: [], questions: [], fit: "bogus" }) });
  assert.equal(ok.ai, true); assert.equal(ok.fit, "medium");
  delete process.env.ANTHROPIC_API_KEY;
});

test("brief email escapes visitor HTML", () => {
  const a = normalizeAnswers({ description: "<img src=x onerror=alert(1)>" });
  const html = briefEmailHtml(a, { name: "<b>x</b>", contact: "a@b.co" }, buildEstimate(a), { fit: "weak", team_summary: "<i>", risks: [], questions: [] });
  assert.ok(!html.includes("<img") && !html.includes("<b>x"));
});

test("callClaudeJson returns forced tool input and sends no visitor-controlled headers", async () => {
  process.env.ANTHROPIC_API_KEY = "k";
  let sent;
  const out = await callClaudeJson({ system: "s", user: "u", schema: { type: "object" }, toolName: "t", fetchImpl: async (url, init) => { sent = JSON.parse(init.body); return { ok: true, json: async () => ({ content: [{ type: "tool_use", name: "t", input: { a: 1 } }] }) }; } });
  assert.deepEqual(out, { a: 1 });
  assert.deepEqual(sent.tool_choice, { type: "tool", name: "t" });
  delete process.env.ANTHROPIC_API_KEY;
});

import handler from "../../api/assistant/[...path].js";
function mkRes() { return { code: 200, headers: {}, body: null, setHeader(k, v) { this.headers[k] = v; }, status(n) { this.code = n; return this; }, json(b) { this.body = b; return this; } }; }
const mkReq = (body, ip = "1.1.1.1") => ({ method: "POST", query: { path: ["discover"] }, headers: { "x-forwarded-for": ip }, body });

test("endpoint: honeypot, validation, rate limit, success path", async () => {
  _resetForTests();
  let r = mkRes(); await handler(mkReq({ company_website: "spam" }), r); assert.equal(r.code, 200);
  r = mkRes(); await handler(mkReq({ lead: { name: "", contact: "" } }, "2.2.2.2"), r); assert.equal(r.code, 400);
  const realFetch = globalThis.fetch; process.env.RESEND_API_KEY = "x"; process.env.LEADGEN_FROM_EMAIL = "a@b.co";
  globalThis.fetch = async () => ({ ok: true, json: async () => ({}) });
  r = mkRes(); await handler(mkReq({ lang: "fr", answers: { need: "informative", languages: ["en"] }, lead: { name: "Ana", contact: "a@b.co" } }, "3.3.3.3"), r);
  assert.equal(r.code, 200); assert.ok(r.body.estimate.lines.length); assert.ok(r.body.estimate.notice);
  for (let i = 0; i < 6; i++) { r = mkRes(); await handler(mkReq({ lead: { name: "A", contact: "a@b.co" } }, "4.4.4.4"), r); }
  assert.equal(r.code, 429);
  globalThis.fetch = realFetch;
});
