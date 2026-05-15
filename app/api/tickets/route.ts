import "dotenv/config";
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { tickets } from "@/lib/db/schema";
import { getOrCreateUser, getUserPlan } from "@/lib/db/users";
import { eq, and, gte, lt, sql } from "drizzle-orm";

const FREE_LIMIT = 10;

export async function GET() {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await getOrCreateUser(userId, "");
    
    const userTickets = await db
      .select()
      .from(tickets)
      .where(eq(tickets.userId, user.id))
      .orderBy(sql`${tickets.createdAt} DESC`)
      .limit(50);

    return NextResponse.json({ tickets: userTickets });
  } catch (error) {
    console.error("Error fetching tickets:", error);
    return NextResponse.json({ error: "Failed to fetch tickets" }, { status: 500 });
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
      return NextResponse.json({ error: "No OCR text provided" }, { status: 400 });
    }

    const user = await getOrCreateUser(userId, "");
    const plan = await getUserPlan(userId);

    if (plan === "free") {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const todayStart = new Date(today);
      const tomorrowStart = new Date(today.getTime() + 24 * 60 * 60 * 1000);

      const todayCount = await db
        .select({ count: sql<number>`count(*)` })
        .from(tickets)
        .where(
          and(
            eq(tickets.userId, user.id),
            gte(tickets.createdAt, todayStart),
            lt(tickets.createdAt, tomorrowStart)
          )
        );

      if (todayCount[0].count >= FREE_LIMIT) {
        return NextResponse.json(
          { error: "Daily limit reached. Upgrade to Pro for unlimited tickets." },
          { status: 429 }
        );
      }
    }

    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey || apiKey === "your_openai_api_key_here") {
      return NextResponse.json(
        { error: "OpenAI API key not configured" },
        { status: 500 }
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
    const ticket = data.choices[0]?.message?.content || "Failed to generate ticket";

    const [savedTicket] = await db
      .insert(tickets)
      .values({
        userId: user.id,
        screenshotUrl: screenshotUrl || null,
        inputText: note || null,
        generatedTicket: ticket,
      })
      .returning();

    return NextResponse.json({ ticket, id: savedTicket.id });
  } catch (error) {
    console.error("Error generating ticket:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to generate ticket" },
      { status: 500 }
    );
  }
}