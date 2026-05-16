import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const privateKey = process.env.IMAGEKIT_PRIVATE_KEY;
    if (!privateKey) {
      return NextResponse.json(
        { error: "ImageKit not configured" },
        { status: 501 },
      );
    }

    const { base64, fileName } = await request.json();

    if (!base64 || typeof base64 !== "string") {
      return NextResponse.json(
        { error: "Missing base64 image data" },
        { status: 400 },
      );
    }

    // Strip data:image/...;base64, prefix if present
    const clean = base64.replace(/^data:image\/\w+;base64,/, "");

    const formData = new FormData();
    formData.append("file", clean);
    formData.append("fileName", fileName || `ticket-${Date.now()}.png`);
    formData.append("useUniqueFileName", "true");
    formData.append("folder", `/tickets/${userId}`);

    const res = await fetch("https://upload.imagekit.io/api/v1/files/upload", {
      method: "POST",
      headers: {
        Authorization: `Basic ${Buffer.from(`${privateKey}:`).toString("base64")}`,
      },
      body: formData,
    });

    if (!res.ok) {
      const err = await res.text();
      console.error("ImageKit upload error:", err);
      return NextResponse.json(
        { error: "Failed to upload image" },
        { status: 500 },
      );
    }

    const data = await res.json();
    return NextResponse.json({ url: data.url });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Failed to upload image" },
      { status: 500 },
    );
  }
}
