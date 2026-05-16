import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getSlackTokens } from "@/lib/db/users";

export async function GET() {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ connected: false });
  }

  const tokens = await getSlackTokens(userId);

  return NextResponse.json({ connected: tokens !== null });
}