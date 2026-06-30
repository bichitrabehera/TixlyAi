import { ANTHROPIC_API_URL } from "@/lib/constants";

function stripMarkdownFences(raw: string): string {
  const trimmed = raw.trim();
  const jsonBlock = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/);
  return jsonBlock ? jsonBlock[1].trim() : trimmed;
}

export async function callAnthropic(
  apiKey: string,
  system: string,
  user: string,
  temperature: number,
): Promise<string> {
  const response = await fetch(ANTHROPIC_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 4096,
      system,
      messages: [{ role: "user", content: user }],
      temperature,
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error?.message || `Anthropic API error (${response.status})`);
  }

  const data = await response.json();
  const raw = data.content?.[0]?.text?.trim() || "";
  return stripMarkdownFences(raw);
}
