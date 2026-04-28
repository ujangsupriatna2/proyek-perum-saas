import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import path from "path";

export const dynamic = "force-dynamic";

const MAX_SIZE = 300 * 1024; // 300KB
const UPLOAD_DIR = process.env.UPLOAD_DIR || path.join(/*turbopackIgnore: true*/ process.cwd(), "uploads");
const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/bmp",
  "image/tiff",
];

function generateFilename(ext: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  return `${timestamp}-${random}.${ext}`;
}

async function compressImage(buffer: Buffer, mimeType: string): Promise<Buffer> {
  try {
    const sharp = (await import("sharp")).default;

    const format = mimeType === "image/png" ? "png" : mimeType === "image/webp" ? "webp" : "jpeg";

    // Try initial compression
    let result = await sharp(buffer)
      .rotate()
      .resize(1920, null, { withoutEnlargement: true, fit: "inside" })
      [format]({ quality: 85, mozjpeg: format === "jpeg" })
      .toBuffer();

    // If still too large, progressively reduce quality
    if (result.length > MAX_SIZE) {
      for (let q = 70; q >= 20; q -= 10) {
        result = await sharp(buffer)
          .rotate()
          .resize(1920, null, { withoutEnlargement: true, fit: "inside" })
          [format]({ quality: q, mozjpeg: format === "jpeg" })
          .toBuffer();
        if (result.length <= MAX_SIZE) break;
      }
    }

    // If still too large, resize dimensions
    if (result.length > MAX_SIZE) {
      for (let width = 1600; width >= 600; width -= 200) {
        result = await sharp(buffer)
          .rotate()
          .resize(width, null, { withoutEnlargement: true, fit: "inside" })
          [format]({ quality: 60, mozjpeg: format === "jpeg" })
          .toBuffer();
        if (result.length <= MAX_SIZE) break;
      }
    }

    // Final fallback: force small
    if (result.length > MAX_SIZE) {
      result = await sharp(buffer)
        .rotate()
        .resize(800, 600, { withoutEnlargement: true, fit: "inside" })
        .jpeg({ quality: 50 })
        .toBuffer();
    }

    return result;
  } catch (sharpError) {
    console.warn("[Upload] Sharp compression failed, saving original:", sharpError);
    return buffer; // Fallback: save original without compression
  }
}

function getFinalExt(mimeType: string, compressedBuffer: Buffer, originalBuffer: Buffer): string {
  if (mimeType === "image/png" && compressedBuffer.length <= MAX_SIZE) return "png";
  if (mimeType === "image/webp" && compressedBuffer.length <= MAX_SIZE) return "webp";
  return "jpg";
}

export async function POST(request: NextRequest) {
  try {
    if (!existsSync(UPLOAD_DIR)) {
      await mkdir(UPLOAD_DIR, { recursive: true });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "File tidak ditemukan" }, { status: 400 });
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: `Tipe file tidak didukung: ${file.type}` },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Compress image (with fallback to original if sharp fails)
    const compressedBuffer = await compressImage(buffer, file.type);
    const finalExt = getFinalExt(file.type, compressedBuffer, buffer);

    const filename = generateFilename(finalExt);
    const filepath = path.join(UPLOAD_DIR, filename);

    await writeFile(filepath, compressedBuffer);

    const originalSizeKB = (buffer.length / 1024).toFixed(1);
    const compressedSizeKB = (compressedBuffer.length / 1024).toFixed(1);
    const savedPercent = ((1 - compressedBuffer.length / buffer.length) * 100).toFixed(0);

    console.log(
      `[Upload] ${filename} — ${originalSizeKB}KB → ${compressedSizeKB}KB (${savedPercent}% saved)`
    );

    return NextResponse.json({
      url: `/api/uploads/${filename}`,
      filename,
      originalSize: buffer.length,
      compressedSize: compressedBuffer.length,
    });
  } catch (error) {
    console.error("[Upload Error]", error);
    return NextResponse.json({ error: "Gagal mengupload gambar" }, { status: 500 });
  }
}
