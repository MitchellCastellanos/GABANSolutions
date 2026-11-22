// ============================================================
// Minimal Anthropic Messages API client (plain fetch, no SDK/deps).
//
// Structured output: we force a single tool call and return its
// `input`, so model output is always a JSON object matching `schema`
// — never free text that could carry markup or instructions.
//
// Env: ANTHROPIC_API_KEY (required to call), AI_MODEL (optional).
// ============================================================

const API_URL = "https://api.anthropic.com/v1/messages";
export const DEFAULT_MODEL = "claude-haiku-5-5";

export function isAiConfigured() {
  return Boolean(process.env.ANTHROPIC_API_KEY);
}

export async function callClaudeJson({ system, user, schema, toolName = "respond", maxTokens = 900, timeoutMs = 20000, fetchImpl = fetch }) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY not configured");

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetchImpl(API_URL, {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json"
      },
      body: JSON.stringify({
        model: process.env.AI_MODEL || DEFAULT_MODEL,
        max_tokens: maxTokens,
        system,
        messages: [{ role: "user", content: user }],
        tools: [{ name: toolName, description: "Return the structured result.", input_schema: schema }],
        tool_choice: { type: "tool", name: toolName }
      }),
      signal: controller.signal
    });
    if (!res.ok) throw new Error(`Anthropic API ${res.status}`);
    const data = await res.json();
    const block = (data.content || []).find(b => b.type === "tool_use" && b.name === toolName);
    if (!block || typeof block.input !== "object") throw new Error("No structured output");
    return block.input;
  } finally {
    clearTimeout(timer);
  }
}
