import "dotenv/config";
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { deleteUserData } from "@/lib/db/users";

export async function DELETE() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await deleteUserData(userId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting account data:", error);
    return NextResponse.json(
      { error: "Failed to delete account data" },
      { status: 500 },
    );
  }
}
