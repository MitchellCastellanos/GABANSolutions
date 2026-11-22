// Single serverless entry for /api/assistant/* (Hobby plan function limit).
// Routes: POST /api/assistant/discover  (discovery + pre-quote)
// Future: /api/assistant/audit (see docs/AI_ROADMAP.md, item 3).

import { clean, getClientIp, rateLimit, takeDailyBudget, parseBody } from "../../ai/lib/guards.mjs";
import { isAiConfigured } from "../../ai/lib/claude.mjs";
import { normalizeAnswers, validateLead, buildEstimate, buildBrief, briefEmailHtml, LANGS } from "../../ai/lib/discovery.mjs";
import { sendEmail } from "../../leadgen/lib/email.mjs";

function extractPath(query) {
  const raw = query?.["...path"] ?? query?.path;
  if (Array.isArray(raw)) return raw.filter(Boolean);
  if (typeof raw === "string" && raw) return raw.split("/").filter(Boolean);
  return [];
}

async function handleDiscover(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  const body = parseBody(req);
  if (!body) return res.status(400).json({ ok: false, error: "Invalid JSON" });

  // Honeypot: accept silently, do nothing.
  if (clean(body.company_website)) return res.status(200).json({ ok: true });

  const ip = getClientIp(req);
  const rl = rateLimit(`discover:${ip}`, { limit: 5, windowMs: 3600_000 });
  if (!rl.ok) {
    res.setHeader("Retry-After", String(rl.retryAfter));
    return res.status(429).json({ ok: false, error: "Too many requests. Please try again later." });
  }

  const lead = validateLead(body.lead);
  if (!lead) return res.status(400).json({ ok: false, error: "Name and a valid email or phone are required." });

  const lang = LANGS.includes(body.lang) ? body.lang : "en";
  const answers = normalizeAnswers(body.answers);
  const estimate = buildEstimate(answers, lang);

  // AI only if the daily budget allows; otherwise the template brief is used.
  const useAi = isAiConfigured() && takeDailyBudget();
  const brief = useAi
    ? await buildBrief(answers, lead, estimate, lang)
    : await buildBrief(answers, lead, estimate, lang, { call: async () => { throw new Error("budget"); } });

  // Deliver to the team. Never fail the visitor's result on delivery trouble
  // unless nothing at all could be delivered.
  const to = process.env.LEAD_NOTIFY_EMAIL || "hello@gabansolutions.ca";
  let delivered = false;
  try {
    await sendEmail({
      to,
      subject: `Discovery brief — ${lead.name} (${answers.need}, fit: ${brief.fit})`,
      html: briefEmailHtml(answers, lead, estimate, brief, { lang }),
      replyTo: lead.isEmail ? lead.contact : undefined
    });
    delivered = true;
  } catch {
    // fall through to Formspree
  }
  if (!delivered) {
    try {
      const fs = await fetch(process.env.FORMSPREE_ENDPOINT || "https://formspree.io/f/mwvrpnnk", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          name: lead.name,
          _replyto: lead.isEmail ? lead.contact : undefined,
          contact: lead.contact,
          need: answers.need,
          business: answers.businessType || "-",
          message: `${brief.team_summary}\nLanguages: ${answers.languages.join(",")} | Timeline: ${answers.timeline} | Assets: ${answers.assets}\n${answers.description}`,
          ref: "discovery-assistant",
          _subject: `New GABAN discovery lead — ${answers.need}`
        })
      });
      delivered = fs.ok;
    } catch {
      delivered = false;
    }
  }
  if (!delivered) return res.status(502).json({ ok: false, error: "Could not deliver your request. Please use the contact form." });

  return res.status(200).json({
    ok: true,
    summary: brief.client_summary,
    estimate: { lines: estimate.lines, steps: estimate.steps, notice: estimate.law96 }
  });
}

export default async function handler(req, res) {
  const route = extractPath(req.query).join("/");
  if (route === "discover") return handleDiscover(req, res);
  return res.status(404).json({ ok: false, error: "Not found" });
}
