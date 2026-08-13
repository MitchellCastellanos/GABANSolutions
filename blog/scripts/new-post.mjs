#!/usr/bin/env node
// ============================================================
// blog/scripts/new-post.mjs
//
// Starts a new blog post draft: picks (or accepts) a topic, generates
// a slug, writes a draft row to Airtable (Status: draft, everything
// else blank), and prints the one copy-paste prompt for ChatGPT/
// Claude — the blog's equivalent of leadgen/scripts/prospect.mjs +
// generate-preview.mjs's "build the draft" step. Writing the actual
// article content happens afterward: paste the prompt into a chat
// model, then use /admin/blog (or blog/scripts/validate-post.mjs +
// hand-editing Airtable) to save the reply, same manual copy-paste
// pattern as /admin/previews. No LLM API key involved.
//
// Usage:
//   node blog/scripts/new-post.mjs --list
//     -> print numbered topic suggestions (category x city, then
//        general GABAN-service topics), pick one with --pick=<n>
//   node blog/scripts/new-post.mjs --pick=<n> [--dry-run]
//   node blog/scripts/new-post.mjs --category=<key> --city="Laval, QC" [--angle=<0-3>] [--dry-run]
//   node blog/scripts/new-post.mjs --topic="Freeform title" [--category=<key>] [--city="..."] [--dry-run]
//
// Required env vars: AIRTABLE_API_KEY, AIRTABLE_BASE_ID
// (AIRTABLE_BLOG_TABLE optional, defaults to "BlogPosts").
// ============================================================

import { fileURLToPath } from "node:url";
import crypto from "node:crypto";
import { createRecord } from "../lib/airtable.mjs";
import { F, POST_STATUS } from "../lib/fields.mjs";
import { suggestTopics, categoryCityTopic } from "../lib/topics.mjs";
import { buildBlogPrompt } from "../lib/prompt.mjs";

function slugify(text) {
  return (text || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function arg(name) {
  const found = process.argv.find((a) => a.startsWith(`--${name}=`));
  return found ? found.split("=").slice(1).join("=") : undefined;
}

/**
 * Builds the draft row + prompt for one topic and writes it to
 * Airtable (unless dryRun). Returns a plain-object summary.
 */
export async function createDraftPost({ title, categoryKey, city, dryRun = false } = {}) {
  if (!title) throw new Error("title is required");

  const shortId = crypto.randomBytes(4).toString("hex");
  const slug = `${slugify(title)}-${shortId}`;
  const prompt = buildBlogPrompt({ topic: title, categoryKey, city });

  const fields = {
    [F.SLUG]: slug,
    [F.TOPIC]: title,
    [F.CATEGORY_KEY]: categoryKey || "",
    [F.CITY]: city || "",
    [F.AUTHOR]: "GABAN Solutions",
    [F.STATUS]: POST_STATUS.DRAFT
  };

  if (!dryRun) {
    await createRecord(fields);
  }

  return {
    slug,
    title,
    categoryKey: categoryKey || null,
    city: city || null,
    prompt,
    blogUrl: `https://gabansolutions.ca/blog/${slug}`,
    saved: !dryRun
  };
}

function printSuggestions() {
  const topics = suggestTopics();
  console.log(`\n${topics.length} topic suggestions (category x city topics first, then general GABAN-service topics):\n`);
  topics.forEach((t, i) => {
    const tag = t.kind === "category-city" ? `[${t.categoryKey} / ${t.city}]` : "[general]";
    console.log(`  ${i}. ${t.title} ${tag}`);
  });
  console.log(`\nPick one: node blog/scripts/new-post.mjs --pick=<n>\n`);
}

async function main() {
  if (process.argv.includes("--list")) {
    printSuggestions();
    return;
  }

  const dryRun = process.argv.includes("--dry-run");
  const pickArg = arg("pick");
  const topicArg = arg("topic");
  const categoryArg = arg("category");
  const cityArg = arg("city");
  const angleArg = arg("angle");

  let title, categoryKey, city;

  if (pickArg !== undefined) {
    const topics = suggestTopics();
    const index = Number(pickArg);
    const picked = topics[index];
    if (!picked) throw new Error(`--pick=${pickArg} is out of range (0-${topics.length - 1}). Run --list to see options.`);
    title = picked.title;
    categoryKey = picked.categoryKey;
    city = picked.city;
  } else if (topicArg) {
    title = topicArg;
    categoryKey = categoryArg;
    city = cityArg;
  } else if (categoryArg) {
    if (!cityArg) throw new Error("Usage: --category=<key> also needs --city=\"Laval, QC\" (see leadgen/config/targets.json for valid areas).");
    const angle = angleArg !== undefined ? Number(angleArg) : 0;
    const picked = categoryCityTopic(categoryArg, cityArg, angle);
    title = picked.title;
    categoryKey = picked.categoryKey;
    city = picked.city;
  } else {
    throw new Error(
      "Usage:\n" +
      "  node blog/scripts/new-post.mjs --list\n" +
      "  node blog/scripts/new-post.mjs --pick=<n> [--dry-run]\n" +
      "  node blog/scripts/new-post.mjs --category=<key> --city=\"Laval, QC\" [--angle=0-3] [--dry-run]\n" +
      "  node blog/scripts/new-post.mjs --topic=\"Freeform title\" [--category=<key>] [--city=\"...\"] [--dry-run]"
    );
  }

  const result = await createDraftPost({ title, categoryKey, city, dryRun });

  console.log(`\nDraft slug: ${result.slug}`);
  console.log(`Topic: ${result.title}`);
  if (result.categoryKey) console.log(`Category: ${result.categoryKey} / City: ${result.city}`);
  console.log(dryRun ? "\n[dry-run] nothing written to Airtable." : "\nSaved to Airtable (Status: draft).");
  console.log(`\n--- Copy this prompt into ChatGPT/Claude ---\n`);
  console.log(result.prompt);
  console.log(`\n--- end prompt ---\n`);
  console.log(`Next: paste the reply into /admin/blog (slug "${result.slug}") to save, validate, and publish.`);
  console.log(`Will be live at: ${result.blogUrl}\n`);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main().catch((err) => {
    console.error(err.message || err);
    process.exitCode = 1;
  });
}
