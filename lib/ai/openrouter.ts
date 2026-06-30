import { OPENROUTER_API_URL } from "@/lib/constants";

function stripMarkdownFences(raw: string): string {
  const trimmed = raw.trim();
  const jsonBlock = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/);
  return jsonBlock ? jsonBlock[1].trim() : trimmed;
}

export async function callOpenRouter(
  apiKey: string,
  system: string,
  user: string,
  temperature: number,
): Promise<string> {
  const response = await fetch(OPENROUTER_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
      "HTTP-Referer": "https://tixly.ai",
      "X-Title": "TixlyAI",
    },
    body: JSON.stringify({
      model: "openrouter/auto",
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
      temperature,
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error?.message || `OpenRouter API error (${response.status})`);
  }

  const data = await response.json();
  const raw = data.choices[0]?.message?.content?.trim() || "";
  return stripMarkdownFences(raw);
}
