import "dotenv/config";
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { deleteTicketForUser } from "@/lib/db/tickets";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const deleted = await deleteTicketForUser(id, userId);

    if (!deleted) {
      return NextResponse.json(
        { error: "Ticket not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ deleted: true });
  } catch (error) {
    console.error("Error deleting ticket:", error);
    return NextResponse.json(
      { error: "Failed to delete ticket" },
      { status: 500 },
    );
  }
}
