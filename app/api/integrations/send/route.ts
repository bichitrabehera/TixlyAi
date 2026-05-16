import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { sendToIntegration, parseRawTicket } from "@/lib/integrations";
import type { IntegrationTool } from "@/lib/integrations/types";
import { checkRateLimit } from "@/lib/rate-limit";

export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { tool, ticketText } = body as { tool: string; ticketText: string };

    if (!tool || !ticketText) {
      return NextResponse.json(
        { error: "Missing required fields: tool, ticketText" },
        { status: 400 },
      );
    }

    if (!["slack", "linear"].includes(tool)) {
      return NextResponse.json(
        { error: `Unsupported tool: ${tool}` },
        { status: 400 },
      );
    }

    const rateCheck = checkRateLimit(`${tool}:${userId}`, "free");
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: "Too many requests. Try again later." },
        {
          status: 429,
          headers: { "Retry-After": String(Math.ceil(rateCheck.resetIn / 1000)) },
        },
      );
    }

    const ticket = parseRawTicket(ticketText);
    const result = await sendToIntegration(tool as IntegrationTool, ticket, userId);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Integration send error:", error);
    return NextResponse.json(
      { error: "Failed to send to integration" },
      { status: 500 },
    );
  }
}
