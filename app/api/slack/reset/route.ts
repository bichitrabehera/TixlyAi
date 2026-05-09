import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST() {
  db.prepare("DELETE FROM slack_tokens").run();
  return NextResponse.json({ success: true });
}