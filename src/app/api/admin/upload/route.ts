import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { randomUUID } from "crypto";
import sharp from "sharp";

const UPLOAD_DIR = process.env.UPLOAD_DIR || join(/*turbopackIgnore: true*/ process.cwd(), "uploads");

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const ALLOWED_VIDEO_TYPES = ["video/mp4", "video/webm", "video/ogg"];
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

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

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const isImage = ALLOWED_IMAGE_TYPES.includes(file.type);
    const isVideo = ALLOWED_VIDEO_TYPES.includes(file.type);

    if (!isImage && !isVideo) {
      return NextResponse.json(
        { error: `Tipe file tidak didukung: ${file.type}` },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `File terlalu besar. Maksimal 50MB.` },
        { status: 400 }
      );
    }

    // Ensure upload directory exists
    const subDir = isVideo ? "videos" : "images";
    const dirPath = join(UPLOAD_DIR, subDir);
    await mkdir(dirPath, { recursive: true });

    const ext = getExtension(file.type);
    let finalBuffer = Buffer.from(await file.arrayBuffer());
    const originalSize = finalBuffer.length;

    if (isImage) {
      // Compress image with sharp, convert to webp
      finalBuffer = await sharp(finalBuffer)
        .webp({ quality: 80 })
        .toBuffer();
    }

    const finalExt = isImage ? "webp" : ext;
    const finalFilename = `${randomUUID()}.${finalExt}`;
    const finalFilepath = join(dirPath, finalFilename);

    await writeFile(finalFilepath, finalBuffer);

    const url = `/api/uploads/${subDir}/${finalFilename}`;

    return NextResponse.json({
      url,
      originalSize,
      compressedSize: finalBuffer.length,
      filename: finalFilename,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Gagal mengupload file" },
      { status: 500 }
    );
  }
}
