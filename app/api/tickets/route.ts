import "dotenv/config";
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { tickets } from "@/lib/db/schema";
import { getOrCreateUser, getAiKey } from "@/lib/db/users";
import { canGenerateTicket, getUsageInfo } from "@/lib/plan";
import { checkRateLimit } from "@/lib/rate-limit";
import { TICKET_HISTORY_PAGE_SIZE } from "@/lib/constants";
import { eq, sql } from "drizzle-orm";
import { TicketRequestSchema, TicketOutputSchema, type TicketRequest } from "@/lib/tickets/schemas";
import { buildPrompt } from "@/lib/tickets/prompt";
import { flagForHumanReview } from "@/lib/tickets/humanInLoop";
import { callAi } from "@/lib/ai";

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
        { error: "Monthly limit reached. Upgrade to Pro for unlimited tickets." },
        { status: 429 },
      );
    }

    const aiKey = await getAiKey(userId);
    if (!aiKey) {
      return NextResponse.json(
        { error: "No AI API key configured. Add one in Settings." },
        { status: 400 },
      );
    }

    const { system, user: userContent, temperature } = buildPrompt(req);

    const raw = await callAi(aiKey.encryptedKey, aiKey.provider, {
      system,
      user: userContent,
      temperature,
    });

    const rawClean = raw.replace(/```(?:json)?\s*([\s\S]*?)```/g, "$1").trim();

    let parsedOutput: unknown = null;
    let validatedOutput: unknown = null;
    let needsReview = false;

    try {
      parsedOutput = JSON.parse(rawClean);
      validatedOutput = TicketOutputSchema.parse(parsedOutput);
    } catch {
      needsReview = true;
      const review = await flagForHumanReview({
        reason: "validation_failed",
        rawOutput: rawClean,
        requestBody: req,
      });
      parsedOutput = { rawOutput: rawClean, reviewId: review.reviewId };
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
          : JSON.stringify(parsedOutput || rawClean),
      })
      .returning();

    return NextResponse.json({
      ticket: validatedOutput ? JSON.stringify(validatedOutput) : rawClean,
      id: savedTicket.id,
      remaining: Math.max(0, remaining === Infinity ? 999 : remaining - 1),
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
