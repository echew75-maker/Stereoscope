export async function callClaude(
  systemPrompt: string,
  messages: Array<{ role: "user" | "assistant"; content: string }>
): Promise<string> {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.ANTHROPIC_API_KEY!,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1000,
      system: systemPrompt,
      messages,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Claude API ${res.status}: ${err.substring(0, 200)}`);
  }

  const data = await res.json();
  return (
    data.content
      ?.filter((b: { type: string }) => b.type === "text")
      ?.map((b: { text: string }) => b.text)
      ?.join("\n") || ""
  );
}
