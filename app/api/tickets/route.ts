import "dotenv/config";
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { tickets } from "@/lib/db/schema";
import { getOrCreateUser } from "@/lib/db/users";
import { canGenerateTicket, getUserPlanInfo } from "@/lib/plan";
import { eq, sql } from "drizzle-orm";

export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await getOrCreateUser(userId, "");
    const planInfo = await getUserPlanInfo(userId);

    const userTickets = await db
      .select()
      .from(tickets)
      .where(eq(tickets.userId, user.id))
      .orderBy(sql`${tickets.createdAt} DESC`)
      .limit(50);

    return NextResponse.json({
      tickets: userTickets,
      plan: planInfo,
    });
  } catch (error) {
    console.error("Error fetching tickets:", error);
    return NextResponse.json(
      { error: "Failed to fetch tickets" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { ocrText, note, screenshotUrl } = await request.json();

    if (!ocrText) {
      return NextResponse.json(
        { error: "No OCR text provided" },
        { status: 400 },
      );
    }

    // Check ticket limits based on plan
    const { allowed, remaining, plan } = await canGenerateTicket(userId);

    if (!allowed) {
      const upgradeMessage =
        plan === "free"
          ? "Daily limit reached. Upgrade to Basic for 50 tickets/day."
          : "Daily limit reached. Upgrade to Pro for unlimited tickets.";
      return NextResponse.json({ error: upgradeMessage }, { status: 429 });
    }

    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey || apiKey === "your_openai_api_key_here") {
      return NextResponse.json(
        { error: "OpenAI API key not configured" },
        { status: 500 },
      );
    }

    const prompt = `
You are a workflow extraction assistant.

Your task is to analyze OCR text from a screenshot${note ? ` and a user note: "${note}"` : ""} and convert it into a structured bug report.

Rules:
- Use only information clearly present in the OCR text and user note.
- Do not invent missing details.
- If information is unclear or missing, leave it empty or state "Not specified".
- Keep the output concise, factual, and actionable.
- Write in a professional tone suitable for issue tracking systems (Jira, Linear, GitHub).

OCR TEXT:
${ocrText}

Output format:

Title:
[A short, specific summary of the issue]

Priority:
[High | Medium | Low | Not specified]

Description:
[A clear explanation of the issue, including context if available]

Steps to Reproduce:
1. [Step 1]
2. [Step 2]
3. [Step 3]
(Only include steps if they can be inferred)

Expected Behavior:
[What should happen]

Actual Behavior:
[What actually happens]

Environment:
[Device, browser, OS, or app context if available]

Additional Notes:
[Any extra relevant details or "Not specified"]
`;

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

    const user = await getOrCreateUser(userId, "");

    const [savedTicket] = await db
      .insert(tickets)
      .values({
        userId: user.id,
        screenshotUrl: screenshotUrl || null,
        inputText: note || null,
        generatedTicket: ticket,
      })
      .returning();

    return NextResponse.json({
      ticket,
      id: savedTicket.id,
      remaining,
    });
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
