import { NextResponse } from "next/server";
import { isSlackConnected } from "@/lib/db";

export async function GET() {
  return NextResponse.json({ connected: isSlackConnected() });
}