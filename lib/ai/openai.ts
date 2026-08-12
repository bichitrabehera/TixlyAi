import { OPENAI_API_URL, OPENAI_MODEL } from "@/lib/constants";

function stripMarkdownFences(raw: string): string {
  const trimmed = raw.trim();
  const jsonBlock = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/);
  return jsonBlock ? jsonBlock[1].trim() : trimmed;
}

export async function callOpenAI(
  apiKey: string,
  system: string,
  user: string,
  temperature: number,
  imageUrl?: string,
): Promise<string> {
  const userContent = imageUrl
    ? [
        { type: "text", text: user },
        { type: "image_url", image_url: { url: imageUrl } },
      ]
    : user;

  const response = await fetch(OPENAI_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: OPENAI_MODEL,
      messages: [
        { role: "system", content: system },
        { role: "user", content: userContent },
      ],
      temperature,
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error?.message || `OpenAI API error (${response.status})`);
  }

  const data = await response.json();
  const raw = data.choices[0]?.message?.content?.trim() || "";
  return stripMarkdownFences(raw);
}
