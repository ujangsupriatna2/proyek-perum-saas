import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { randomUUID } from "crypto";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const UPLOAD_DIR = process.env.UPLOAD_DIR || join(/*turbopackIgnore: true*/ process.cwd(), "uploads");

// Allowed image types
const IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);
// Allowed video types
const VIDEO_TYPES = new Set(["video/mp4", "video/webm", "video/ogg"]);

const MAX_IMAGE_SIZE = 20 * 1024 * 1024; // 20MB
const MAX_VIDEO_SIZE = 100 * 1024 * 1024; // 100MB

function getFileCategory(mimeType: string): "image" | "video" | null {
  if (IMAGE_TYPES.has(mimeType)) return "image";
  if (VIDEO_TYPES.has(mimeType)) return "video";
  return null;
}

function getExtension(mimeType: string): string {
  const map: Record<string, string> = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
    "image/gif": "gif",
    "video/mp4": "mp4",
    "video/webm": "webm",
    "video/ogg": "ogg",
  };
  return map[mimeType] || "bin";
}

export async function POST(req: NextRequest) {
  try {
    // Auth check
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const category = getFileCategory(file.type);
    if (!category) {
      return NextResponse.json(
        { error: `File type not allowed. Allowed: images (jpg, png, webp, gif) and videos (mp4, webm, ogg)` },
        { status: 400 }
      );
    }

    const maxSize = category === "video" ? MAX_VIDEO_SIZE : MAX_IMAGE_SIZE;
    if (file.size > maxSize) {
      const maxMB = maxSize / (1024 * 1024);
      return NextResponse.json(
        { error: `File too large. Maximum size for ${category}s: ${maxMB}MB` },
        { status: 400 }
      );
    }

    // Ensure upload directory exists
    const subdir = category === "video" ? "videos" : "images";
    const dirPath = join(UPLOAD_DIR, subdir);
    await mkdir(dirPath, { recursive: true });

    // Generate unique filename
    const ext = getExtension(file.type);
    const filename = `${randomUUID()}.${ext}`;
    const filepath = join(dirPath, filename);

    // Write file
    const bytes = await file.arrayBuffer();
    await writeFile(filepath, Buffer.from(bytes));

    const url = `/api/uploads/${subdir}/${filename}`;

    return NextResponse.json({
      url,
      filename,
      size: bytes.byteLength,
      type: category,
      mimeType: file.type,
      originalSize: bytes.byteLength,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
