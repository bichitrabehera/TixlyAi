import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import {
  IMAGEKIT_UPLOAD_URL,
  MAX_IMAGE_BYTES,
  MAX_IMAGE_DATA_URI_LENGTH,
} from "@/lib/constants";
import { checkRateLimit } from "@/lib/rate-limit";

/** Cheap magic-byte sniff so non-image payloads never reach ImageKit. */
function sniffImageMime(bytes: Buffer): string | null {
  if (
    bytes.length >= 8 &&
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47
  ) {
    return "image/png";
  }
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return "image/jpeg";
  }
  if (
    bytes.length >= 12 &&
    bytes.toString("ascii", 0, 4) === "RIFF" &&
    bytes.toString("ascii", 8, 12) === "WEBP"
  ) {
    return "image/webp";
  }
  if (bytes.length >= 12 && bytes.toString("ascii", 4, 8) === "ftyp") {
    const brand = bytes.toString("ascii", 8, 12);
    if (/^(heic|heix|hevc|hevx|heim|heis|hevm|hevs|mif1|msf1|heif)/.test(brand)) {
      return "image/heic";
    }
  }
  return null;
}

export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const rateCheck = checkRateLimit(`upload:${userId}`, 20);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: "Too many uploads. Try again later." },
        {
          status: 429,
          headers: { "Retry-After": String(Math.ceil(rateCheck.resetIn / 1000)) },
        },
      );
    }

    const privateKey = process.env.IMAGEKIT_PRIVATE_KEY;
    if (!privateKey) {
      return NextResponse.json(
        { error: "ImageKit not configured" },
        { status: 501 },
      );
    }

    // Reject oversized bodies before buffering them (base64 of 10 MB ≈ 14 M
    // chars, plus JSON envelope slack).
    const contentLength = Number(request.headers.get("content-length") ?? "0");
    if (contentLength > MAX_IMAGE_DATA_URI_LENGTH + 16_384) {
      return NextResponse.json(
        { error: "Image is larger than 10 MB" },
        { status: 413 },
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

    if (clean.length > MAX_IMAGE_DATA_URI_LENGTH) {
      return NextResponse.json(
        { error: "Image is larger than 10 MB" },
        { status: 413 },
      );
    }

    const approxBytes = Math.floor((clean.length * 3) / 4);
    if (approxBytes > MAX_IMAGE_BYTES) {
      return NextResponse.json(
        { error: "Image is larger than 10 MB" },
        { status: 413 },
      );
    }

    const mime = sniffImageMime(Buffer.from(clean.slice(0, 128), "base64"));
    if (!mime) {
      return NextResponse.json(
        { error: "Unsupported image format. Use a PNG, JPG, WEBP or HEIC screenshot." },
        { status: 400 },
      );
    }

    const safeFileName =
      (typeof fileName === "string"
        ? fileName.replace(/[^a-zA-Z0-9._-]/g, "").slice(0, 100)
        : "") || `ticket-${Date.now()}.png`;

    const formData = new FormData();
    formData.append("file", clean);
    formData.append("fileName", safeFileName);
    formData.append("useUniqueFileName", "true");
    formData.append("folder", `/tickets/${userId}`);

    const res = await fetch(IMAGEKIT_UPLOAD_URL, {
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
