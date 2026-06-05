const GEMINI_API_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";

export async function callGemini(
  systemPrompt: string,
  userMessage: string,
  useGrounding: boolean = true
): Promise<string> {
  const body: Record<string, unknown> = {
    system_instruction: { parts: [{ text: systemPrompt }] },
    contents: [{ role: "user", parts: [{ text: userMessage }] }],
    generation_config: {
      temperature: 0.2,
      max_output_tokens: 8192,
    },
  };

  if (useGrounding) {
    body.tools = [{ google_search: {} }];
  }

  const res = await fetch(
    `${GEMINI_API_URL}?key=${process.env.GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }
  );

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Gemini API ${res.status}: ${err.substring(0, 400)}`);
  }

  const data = await res.json();

  const parts = data.candidates?.[0]?.content?.parts || [];

  // Gemini 2.5 returns thought parts (thought: true) alongside the actual response.
  // We must exclude them or bracket-counting JSON extraction breaks.
  const outputParts = parts.filter(
    (p: { text?: string; thought?: boolean }) => p.text && !p.thought
  );
  const fallbackParts = parts.filter((p: { text?: string }) => p.text);
  const activeParts = outputParts.length > 0 ? outputParts : fallbackParts;

  const text = activeParts
    .map((p: { text: string }) => p.text)
    .join("\n");

  if (!text) throw new Error("Empty Gemini response");
  return text;
}
