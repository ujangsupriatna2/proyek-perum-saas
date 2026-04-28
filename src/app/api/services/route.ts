import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// Public API — no auth required
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const slug = searchParams.get("slug") || "";
    const category = searchParams.get("category") || "";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");

    const where: Record<string, unknown> = { isPublished: true };
    if (slug) where.slug = slug;
    if (category && category !== "all") where.category = category;

    const [services, total] = await Promise.all([
      db.service.findMany({
        where,
        orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.service.count({ where }),
    ]);

    const parsed = services.map((s) => {
      // Parse features from JSON string to array
      let features: string[] = [];
      try {
        const raw = typeof s.features === "string" ? JSON.parse(s.features) : s.features;
        features = Array.isArray(raw) ? raw.map(String) : [];
      } catch {
        if (s.features && String(s.features).trim()) {
          features = String(s.features).split(",").map((f) => f.trim()).filter(Boolean);
        }
      }

      return {
        id: s.id,
        title: s.title,
        slug: s.slug,
        description: s.description || "",
        category: s.category,
        price: s.price || 0,
        priceUnit: s.priceUnit || "proyek",
        image: s.image || "",
        features,
        duration: s.duration || "",
        videoUrl: s.videoUrl || "",
        isPublished: s.isPublished,
        isFeatured: s.isFeatured,
        sortOrder: s.sortOrder || 0,
        createdAt: s.createdAt instanceof Date ? s.createdAt.toISOString() : String(s.createdAt),
      };
    });

    return NextResponse.json({ services: parsed, total, page, limit });
  } catch (err) {
    console.error("GET /api/services error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
