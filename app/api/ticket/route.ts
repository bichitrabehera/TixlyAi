import "dotenv/config";
import { NextResponse } from "next/server";
export async function POST(request: Request) {
  try {
    const { ocrText, note } = await request.json();

    if (!ocrText) {
      return NextResponse.json(
        { error: "No OCR text provided" },
        { status: 400 },
      );
    }

    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey || apiKey === "your_openai_api_key_here") {
      return NextResponse.json(
        {
          error:
            "OpenAI API key not configured. Please add OPENAI_API_KEY to .env.local",
        },
        { status: 500 },
      );
    }

    const prompt = `You are a bug triaging assistant. Based on the following screenshot text${note ? ` and user note: "${note}"` : ""}, create a structured bug ticket.

SCREENSHOT TEXT:
${ocrText}

Generate a clear, actionable bug report in this format:

🐛 Title: [brief description]
📊 Priority: [High/Medium/Low]

📝 Description:
[What happened and where]

🔄 Steps to Reproduce:
1. [step 1]
2. [step 2]
3. [step 3]

✅ Expected: [what should happen]
❌ Actual: [what actually happened]

Keep it concise. Use bullet points. No markdown.`;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || "OpenAI API error");
    }

    const data = await response.json();
    const ticket =
      data.choices[0]?.message?.content || "Failed to generate ticket";

    return NextResponse.json({ ticket });
  } catch (error) {
    console.error("Error generating ticket:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to generate ticket",
      },
      { status: 500 },
    );
  }
}
