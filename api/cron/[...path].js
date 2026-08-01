// Single serverless entry for all /api/cron/* routes (Hobby plan function limit).

import { main as runSendProposal } from "../../leadgen/scripts/send-proposal.mjs";
import { main as runProspect } from "../../leadgen/scripts/prospect.mjs";
import { main as runEnrich } from "../../leadgen/scripts/enrich.mjs";
import { main as runScore } from "../../leadgen/scripts/score.mjs";
import { main as runArchivePreviews } from "../../leadgen/scripts/archive-previews.mjs";
import { generatePreviewForSlug } from "../../leadgen/scripts/generate-preview.mjs";
import { validatePreviewForSlug } from "../../leadgen/scripts/validate-preview.mjs";
import { updatePreviewContent } from "../../leadgen/scripts/update-preview-content.mjs";
import { getPreviewContent } from "../../leadgen/lib/preview-content-reader.mjs";
import { requireCronAuth } from "../../leadgen/lib/cron-auth.mjs";

function extractPath(query) {
  const raw = query?.["...path"] ?? query?.path;
  if (Array.isArray(raw)) return raw.filter(Boolean);
  if (typeof raw === "string" && raw) return raw.split("/").filter(Boolean);
  return [];
}

async function runMain(res, fn) {
  try {
    await fn();
    return res.status(200).json({ ok: true });
  } catch (err) {
    return res.status(500).json({ ok: false, error: err.message });
  }
}

export default async function handler(req, res) {
  const route = extractPath(req.query).join("/");

  if (route === "send-proposal") {
    if (!requireCronAuth(req, res)) return;
    return runMain(res, runSendProposal);
  }

  if (route === "prospect") {
    if (!requireCronAuth(req, res)) return;
    return runMain(res, runProspect);
  }

  if (route === "enrich") {
    if (!requireCronAuth(req, res)) return;
    return runMain(res, runEnrich);
  }

  if (route === "score") {
    if (!requireCronAuth(req, res)) return;
    return runMain(res, runScore);
  }

  if (route === "archive-previews") {
    if (!requireCronAuth(req, res)) return;
    return runMain(res, runArchivePreviews);
  }

  if (route === "generate-preview") {
    if (!requireCronAuth(req, res)) return;
    const slug = (req.query?.slug || "").toString().trim();
    if (!slug) return res.status(400).json({ ok: false, error: "Missing ?slug=" });
    try {
      const result = await generatePreviewForSlug(slug);
      return res.status(200).json({ ok: true, result });
    } catch (err) {
      return res.status(500).json({ ok: false, error: err.message });
    }
  }

  if (route === "approve-preview") {
    if (!requireCronAuth(req, res)) return;
    const slug = (req.query?.slug || "").toString().trim();
    if (!slug) return res.status(400).json({ ok: false, error: "Missing ?slug=" });
    try {
      const result = await validatePreviewForSlug(slug, { approve: true });
      return res.status(200).json({ ok: true, result });
    } catch (err) {
      return res.status(500).json({ ok: false, error: err.message });
    }
  }

  if (route === "preview-content") {
    if (!requireCronAuth(req, res)) return;
    const slug = (req.query?.slug || "").toString().trim();
    if (!slug) return res.status(400).json({ ok: false, error: "Missing ?slug=" });
    try {
      const result = await getPreviewContent(slug);
      return res.status(200).json({ ok: true, result });
    } catch (err) {
      return res.status(500).json({ ok: false, error: err.message });
    }
  }

  if (route === "update-preview-content") {
    if (req.method !== "POST") {
      res.setHeader("Allow", "POST");
      return res.status(405).json({ ok: false, error: "Method not allowed" });
    }
    if (!requireCronAuth(req, res)) return;
    const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : (req.body || {});
    const { slug, ...patch } = body;
    if (!slug) return res.status(400).json({ ok: false, error: "Missing slug" });
    try {
      const result = await updatePreviewContent(slug, patch);
      return res.status(200).json({ ok: true, result });
    } catch (err) {
      return res.status(500).json({ ok: false, error: err.message });
    }
  }

  return res.status(404).json({ ok: false, error: "Not found" });
}
