import "dotenv/config";
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { tickets } from "@/lib/db/schema";
import { getOrCreateUser } from "@/lib/db/users";
import { canGenerateTicket, getUsageInfo } from "@/lib/plan";
import { checkRateLimit } from "@/lib/rate-limit";
import { eq, sql } from "drizzle-orm";
import { TicketRequestSchema, TicketOutputSchema, type TicketRequest } from "@/lib/tickets/schemas";
import { buildPrompt } from "@/lib/tickets/prompt";
import { flagForHumanReview } from "@/lib/tickets/humanInLoop";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await getOrCreateUser(userId, "");
    const usage = await getUsageInfo(userId);

    const userTickets = await db
      .select()
      .from(tickets)
      .where(eq(tickets.userId, user.clerkUserId))
      .orderBy(sql`${tickets.createdAt} DESC`)
      .limit(50);

    return NextResponse.json({
      tickets: userTickets,
      usage,
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

    const body = await request.json();
    let req!: TicketRequest;
    try {
      req = TicketRequestSchema.parse(body);
    } catch (err) {
      console.error("Invalid request body:", err);
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const { allowed, remaining } = await canGenerateTicket(userId);

    const rateCheck = checkRateLimit(`generate:${userId}`, "free");
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: "Too many requests. Try again later." },
        {
          status: 429,
          headers: {
            "Retry-After": String(Math.ceil(rateCheck.resetIn / 1000)),
          },
        },
      );
    }

    if (!allowed) {
      return NextResponse.json(
        { error: "Daily limit reached. You can generate up to 10 tickets per day." },
        { status: 429 },
      );
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "OpenAI API key not configured" },
        { status: 500 },
      );
    }

    const apiKeyPattern = /^sk-[A-Za-z0-9-_]{20,}$/;
    if (!apiKeyPattern.test(apiKey)) {
      console.error("OpenAI API key appears misconfigured");
      return NextResponse.json(
        { error: "OpenAI API key misconfigured" },
        { status: 500 },
      );
    }

    const { system, user: userContent, temperature } = buildPrompt(req);

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: system },
          { role: "user", content: userContent },
        ],
        temperature,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || "OpenAI API error");
    }

    const data = await response.json();
    const raw = data.choices[0]?.message?.content?.trim() || "";

    let parsedOutput: unknown = null;
    let validatedOutput: unknown = null;
    let needsReview = false;

    try {
      parsedOutput = JSON.parse(raw);
      validatedOutput = TicketOutputSchema.parse(parsedOutput);
    } catch {
      needsReview = true;
      const review = await flagForHumanReview({
        reason: "validation_failed",
        rawOutput: raw,
        requestBody: req,
      });
      parsedOutput = { rawOutput: raw, reviewId: review.reviewId };
    }

    const user = await getOrCreateUser(userId, "");

    const [savedTicket] = await db
      .insert(tickets)
      .values({
        userId: user.clerkUserId,
        screenshotUrl: req.screenshotUrl || null,
        inputText: req.note || null,
        generatedTicket: validatedOutput
          ? JSON.stringify(validatedOutput)
          : JSON.stringify(parsedOutput || raw),
      })
      .returning();

    return NextResponse.json({
      ticket: validatedOutput ? JSON.stringify(validatedOutput) : raw,
      id: savedTicket.id,
      remaining,
      needsReview: needsReview || undefined,
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
