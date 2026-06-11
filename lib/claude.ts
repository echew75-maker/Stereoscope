import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });

// Single-turn Opus 4.8 call with adaptive thinking — used for Arbiter synthesis
export async function callOpus(
  systemPrompt: string,
  userMessage: string
): Promise<string> {
  const stream = await anthropic.messages.stream({
    model: "claude-opus-4-8",
    max_tokens: 8000,
    thinking: { type: "adaptive" },
    system: systemPrompt,
    messages: [{ role: "user", content: userMessage }],
  });

  const msg = await stream.finalMessage();
  return msg.content
    .filter((b) => b.type === "text")
    .map((b) => (b as { type: "text"; text: string }).text)
    .join("\n");
}

// Multi-turn Opus 4.8 call — used for Investment Journal
export async function callClaude(
  systemPrompt: string,
  messages: Array<{ role: "user" | "assistant"; content: string }>
): Promise<string> {
  const stream = await anthropic.messages.stream({
    model: "claude-opus-4-8",
    max_tokens: 4000,
    thinking: { type: "adaptive" },
    system: systemPrompt,
    messages,
  });

  const msg = await stream.finalMessage();
  return msg.content
    .filter((b) => b.type === "text")
    .map((b) => (b as { type: "text"; text: string }).text)
    .join("\n");
}
