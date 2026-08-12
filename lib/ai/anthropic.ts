import { ANTHROPIC_API_URL } from "@/lib/constants";

function stripMarkdownFences(raw: string): string {
  const trimmed = raw.trim();
  const jsonBlock = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/);
  return jsonBlock ? jsonBlock[1].trim() : trimmed;
}

function parseDataUrl(dataUrl: string): { mime: string; data: string } {
  const match = dataUrl.match(/^data:([^;,]+);base64,([\s\S]+)$/);
  if (!match) {
    throw new Error("Could not parse fetched image as a base64 data URL");
  }
  return { mime: match[1], data: match[2] };
}

async function fetchImageAsBase64(imageUrl: string): Promise<{
  mime: string;
  data: string;
}> {
  if (imageUrl.startsWith("data:")) {
    return parseDataUrl(imageUrl);
  }

  const response = await fetch(imageUrl);
  if (!response.ok) {
    throw new Error(`Failed to fetch image for vision (${response.status})`);
  }
  const buffer = Buffer.from(await response.arrayBuffer());
  const mime = response.headers.get("content-type") || "image/png";
  return parseDataUrl(`data:${mime};base64,${buffer.toString("base64")}`);
}

export async function callAnthropic(
  apiKey: string,
  system: string,
  user: string,
  temperature: number,
  imageUrl?: string,
): Promise<string> {
  let userContent: string | Array<{ type: string; [key: string]: unknown }> =
    user;

  if (imageUrl) {
    const { mime, data } = await fetchImageAsBase64(imageUrl);
    userContent = [
      {
        type: "image",
        source: { type: "base64", media_type: mime, data },
      },
      { type: "text", text: user },
    ];
  }

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
      messages: [{ role: "user", content: userContent }],
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
