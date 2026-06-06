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
    // thinking_config at top level (not inside generation_config)
    thinking_config: { thinking_budget: 0 },
    generation_config: {
      temperature: 0.2,
      max_output_tokens: 16384,
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
  const parts: Array<{ text?: string; thought?: boolean }> =
    data.candidates?.[0]?.content?.parts || [];

  // Search ALL parts (including thought parts) for <json> tag first —
  // Gemini sometimes puts the JSON inside a thought part when thinking is on.
  const allText = parts
    .filter((p) => p.text)
    .map((p) => p.text as string)
    .join("\n");

  if (!allText) throw new Error("Empty Gemini response");
  return allText;
}
