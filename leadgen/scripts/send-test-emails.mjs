#!/usr/bin/env node
// ============================================================
// leadgen/scripts/send-test-emails.mjs
//
// One-off manual sanity check: sends all 4 outreach templates
// (initial + 3 follow-ups) to a single inbox so you can see exactly
// what a prospect would receive, without touching Airtable or
// waiting for the daily cron. Not part of any automated flow.
//
// Usage:
//   node leadgen/scripts/send-test-emails.mjs [--to=admin@gabansolutions.ca] [--slug=some-real-slug] [--business="Test Business"]
//
// --slug lets you point the preview link at a real Airtable record
// (so the mockup actually renders); without it, the link 404s but
// the email copy/formatting is still what you're checking.
//
// Required env vars: RESEND_API_KEY, LEADGEN_FROM_EMAIL, PUBLIC_SITE_URL.
// ============================================================

import { initialEmail, followUpOne, followUpTwo, followUpThree, sendEmail } from "../lib/email.mjs";

function arg(name, fallback) {
  const found = process.argv.find((a) => a.startsWith(`--${name}=`));
  return found ? found.split("=").slice(1).join("=") : fallback;
}

function requireEnv(name) {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required env var: ${name}`);
  return value;
}

async function main() {
  const siteUrl = requireEnv("PUBLIC_SITE_URL").replace(/\/$/, "");
  const to = arg("to", "admin@gabansolutions.ca");
  const businessName = arg("business", "Test Business");
  const slug = arg("slug", "test-preview");

  const previewUrl = `${siteUrl}/api/preview/${slug}`;
  const unsubscribeUrl = `${siteUrl}/api/unsubscribe?slug=${slug}`;
  const context = { businessName, previewUrl, unsubscribeUrl };

  const templates = [
    ["1/4 initial", initialEmail(context)],
    ["2/4 follow-up day 3", followUpOne(context)],
    ["3/4 follow-up day 7", followUpTwo(context)],
    ["4/4 follow-up day 14", followUpThree(context)]
  ];

  for (const [label, template] of templates) {
    console.log(`Sending ${label}: "${template.subject}" -> ${to}`);
    await sendEmail({ to, subject: `[TEST ${label}] ${template.subject}`, html: template.html });
  }

  console.log(`\nDone. Sent 4 test emails to ${to}.`);
  if (slug === "test-preview") {
    console.log(`Note: ${previewUrl} won't resolve to a real prospect (no --slug passed), so that link 404s — pass --slug=<a real Airtable Slug> to test it live.`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
