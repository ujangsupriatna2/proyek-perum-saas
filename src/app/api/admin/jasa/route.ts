import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { isSuperadmin } from "@/lib/permissions";

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const role = (session.user as { role?: string })?.role;

    // Superadmin only
    if (!isSuperadmin(role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const category = searchParams.get("category") || "";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");

    const where: Record<string, unknown> = {};
    if (search) {
      where.OR = [
        { title: { contains: search } },
        { slug: { contains: search } },
        { description: { contains: search } },
      ];
    }
    if (category) where.category = category;

    const [services, total] = await Promise.all([
      db.service.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
        include: { mitra: { select: { name: true } } },
      }),
      db.service.count({ where }),
    ]);

    return NextResponse.json({ services, total, page, limit });
  } catch {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const role = (session.user as { role?: string })?.role;

    // Superadmin only
    if (!isSuperadmin(role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const {
      title,
      slug,
      description,
      category,
      price,
      priceUnit,
      image,
      images,
      features,
      duration,
      videoUrl,
      isPublished,
      isFeatured,
      sortOrder,
    } = body;

    if (!title || !category) {
      return NextResponse.json(
        { error: "Title dan kategori wajib diisi" },
        { status: 400 }
      );
    }

    const finalSlug = slug || generateSlug(title);

    // Check slug uniqueness
    const slugWhere: Record<string, unknown> = { slug: finalSlug };
    const slugExists = await db.service.findFirst({ where: slugWhere });
    if (slugExists) {
      return NextResponse.json({ error: "Slug sudah digunakan" }, { status: 409 });
    }

    // Parse features from comma-separated string to JSON array
    let featuresJSON = "[]";
    if (features && typeof features === "string") {
      if (features.startsWith("[")) {
        featuresJSON = features;
      } else {
        featuresJSON = JSON.stringify(
          features.split(",").map((f: string) => f.trim()).filter(Boolean)
        );
      }
    } else if (Array.isArray(features)) {
      featuresJSON = JSON.stringify(features);
    }

    const service = await db.service.create({
      data: {
        title,
        slug: finalSlug,
        description: description || "",
        category,
        price: parseFloat(price) || 0,
        priceUnit: priceUnit || "proyek",
        image: image || "",
        images: images || "[]",
        features: featuresJSON,
        duration: duration || "",
        videoUrl: videoUrl || "",
        isPublished: !!isPublished,
        isFeatured: !!isFeatured,
        sortOrder: parseInt(sortOrder) || 0,
      },
    });

    return NextResponse.json(service, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
