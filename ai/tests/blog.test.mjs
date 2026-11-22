import { test } from "node:test";
import assert from "node:assert/strict";
import { sanitizeBodyHtml, generateBlogDraft } from "../lib/blog-draft.mjs";
import { buildBlogPrompt, buildBlogInstructions } from "../../blog/lib/prompt.mjs";

test("sanitizer strips scripts, handlers, bad links and unknown tags", () => {
  const out = sanitizeBodyHtml(`<h2 onclick="x()">Hi</h2><script>alert(1)</script><p style="x">a <a href="javascript:alert(1)">bad</a> <a href="https://gabansolutions.ca/book" onclick="y">ok</a></p><img src=x onerror=alert(1)><iframe src="//e"></iframe><div>keep</div><!-- c --><p>1 < 2</p>`);
  assert.ok(!/script|onclick|onerror|javascript:|iframe|<img|<div|style=/i.test(out), out);
  assert.match(out, /<h2>Hi<\/h2>/); assert.match(out, /<a href="https:\/\/gabansolutions.ca\/book" rel="noopener">ok<\/a>/); assert.match(out, /keep/);
  assert.ok(!/<(?![/a-z])/i.test(out));
});

test("prompt refactor keeps the copy-paste prompt identical in shape", () => {
  const a = { topic: "T", categoryKey: "", city: "" };
  assert.ok(buildBlogPrompt(a).startsWith(buildBlogInstructions(a)));
  assert.ok(!buildBlogInstructions(a).includes("TITLE:"));
});

test("generateBlogDraft sanitizes, validates, and rejects empty output", async () => {
  const ok = await generateBlogDraft({ slug: "a-post-abc", topic: "T" }, { call: async ({ user, schema }) => {
    assert.ok(user.includes("Topic: T")); assert.ok(schema.required.includes("body_html"));
    return { title: "A decent title for search", meta_description: "x".repeat(100), h1: "H", excerpt: "e", body_html: "<h2>One</h2><script>x</script><p>" + "word ".repeat(400) + "</p><h2>Two</h2><ul><li>a</li></ul>" };
  } });
  assert.ok(!ok.draft.bodyHtml.includes("script")); assert.ok(ok.validation.score >= 4);
  await assert.rejects(generateBlogDraft({ slug: "s", topic: "T" }, { call: async () => ({ title: "", meta_description: "", h1: "", excerpt: "", body_html: "" }) }), /incomplete/);
});
