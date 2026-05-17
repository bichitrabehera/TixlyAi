import "dotenv/config";
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { tickets } from "@/lib/db/schema";
import { getOrCreateUser } from "@/lib/db/users";
import { canGenerateTicket, getUsageInfo, incrementTodayTicketCount } from "@/lib/plan";
import { checkRateLimit } from "@/lib/rate-limit";
import { DAILY_LIMIT, OPENAI_API_URL, OPENAI_MODEL, OPENAI_API_KEY_PATTERN, TICKET_HISTORY_PAGE_SIZE } from "@/lib/constants";
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
      .limit(TICKET_HISTORY_PAGE_SIZE);

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
        { error: `Daily limit reached. You can generate up to ${DAILY_LIMIT} tickets per day.` },
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

    const apiKeyPattern = OPENAI_API_KEY_PATTERN;
    if (!apiKeyPattern.test(apiKey)) {
      console.error("OpenAI API key appears misconfigured");
      return NextResponse.json(
        { error: "OpenAI API key misconfigured" },
        { status: 500 },
      );
    }

    const { system, user: userContent, temperature } = buildPrompt(req);

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

    await incrementTodayTicketCount(user.clerkUserId);

    return NextResponse.json({
      ticket: validatedOutput ? JSON.stringify(validatedOutput) : raw,
      id: savedTicket.id,
      remaining: Math.max(0, remaining - 1),
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
