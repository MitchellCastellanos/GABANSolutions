import { test } from "node:test";
import assert from "node:assert/strict";
import { saveLead, leadFields } from "../lib/lead-store.mjs";
import { normalizeAnswers, buildEstimate, clientEmail } from "../lib/discovery.mjs";
import { _resetForTests } from "../lib/guards.mjs";
import handler from "../../api/assistant/[...path].js";

const a = normalizeAnswers({ need: "informative", languages: ["en"], businessType: "garage", description: "hi" });
const est = buildEstimate(a, "en");
const brief = { fit: "strong", team_summary: "t", risks: ["r1"], questions: ["q1"], client_summary: "" };

test("saveLead: skipped without env, posts typecast fields with env, never throws", async () => {
  delete process.env.AIRTABLE_API_KEY; delete process.env.AIRTABLE_BASE_ID;
  assert.equal(await saveLead({}), false);
  process.env.AIRTABLE_API_KEY = "k"; process.env.AIRTABLE_BASE_ID = "app1";
  let call;
  const ok = await saveLead(leadFields(a, { name: "Ana", contact: "a@b.co" }, est, brief, { lang: "fr" }), { fetchImpl: async (u, i) => { call = { u, body: JSON.parse(i.body), auth: i.headers.Authorization }; return { ok: true }; } });
  assert.ok(ok); assert.match(call.u, /app1\/Leads$/); assert.equal(call.body.typecast, true);
  assert.equal(call.body.fields.Status, "New"); assert.equal(call.body.fields["Bill 96 Flag"], true); assert.equal(call.auth, "Bearer k");
  assert.equal(await saveLead({}, { fetchImpl: async () => { throw new Error("net"); } }), false);
  delete process.env.AIRTABLE_API_KEY; delete process.env.AIRTABLE_BASE_ID;
});

test("client email is localized, escaped, and has no unrequested prices", () => {
  const m = clientEmail({ name: "<b>Ana</b> G", contact: "a@b.co" }, buildEstimate(normalizeAnswers({ need: "custom_app" }), "fr"), { ...brief, client_summary: "<script>x</script>" }, "fr");
  assert.match(m.subject, /estimation/i); assert.ok(!m.html.includes("<script>") && !m.html.includes("<b>Ana"));
  assert.ok(!m.html.includes("$"));
});

const mkRes = () => ({ code: 200, headers: {}, body: null, setHeader(k, v) { this.headers[k] = v; }, status(n) { this.code = n; return this; }, json(b) { this.body = b; return this; } });
const mkReq = (lead, ip) => ({ method: "POST", query: { path: ["discover"] }, headers: { "x-forwarded-for": ip }, body: { lang: "es", answers: { need: "informative" }, lead } });

test("discover: stores in Airtable, auto-replies once per address, survives email failure", async () => {
  _resetForTests();
  process.env.RESEND_API_KEY = "x"; process.env.LEADGEN_FROM_EMAIL = "a@b.co"; process.env.AIRTABLE_API_KEY = "k"; process.env.AIRTABLE_BASE_ID = "app1";
  const real = globalThis.fetch; const sent = []; let airtable = 0; let resendDown = false;
  globalThis.fetch = async (url, init) => {
    if (String(url).includes("airtable")) { airtable++; return { ok: true }; }
    if (String(url).includes("resend")) { if (resendDown) return { ok: false, status: 500, text: async () => "" }; sent.push(JSON.parse(init.body).to); return { ok: true, json: async () => ({}) }; }
    throw new Error("unexpected " + url);
  };
  let r = mkRes(); await handler(mkReq({ name: "Ana", contact: "ana@x.co" }, "5.5.5.1"), r);
  assert.equal(r.code, 200); assert.equal(r.body.emailed, true); assert.equal(airtable, 1); assert.deepEqual(sent.sort(), ["ana@x.co", "hello@gabansolutions.ca"].sort());
  r = mkRes(); await handler(mkReq({ name: "Ana", contact: "ANA@x.co" }, "5.5.5.2"), r);
  assert.equal(r.code, 200); assert.equal(r.body.emailed, false); // same address, same day
  r = mkRes(); await handler(mkReq({ name: "Tel", contact: "514-258-0648" }, "5.5.5.3"), r);
  assert.equal(r.body.emailed, false); // phone: no auto-reply
  resendDown = true;
  r = mkRes(); await handler(mkReq({ name: "B", contact: "b@x.co" }, "5.5.5.4"), r);
  assert.equal(r.code, 200); // Airtable alone is enough to keep the lead
  globalThis.fetch = real;
  delete process.env.AIRTABLE_API_KEY; delete process.env.AIRTABLE_BASE_ID;
});
