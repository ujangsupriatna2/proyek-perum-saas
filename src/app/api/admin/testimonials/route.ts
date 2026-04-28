import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { getMitraFilter, isSuperadmin } from "@/lib/permissions";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const mitraId = (session.user as { mitraId?: string | null })?.mitraId;
    const mitraFilter = getMitraFilter(mitraId);

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");

    const [testimonials, total] = await Promise.all([
      db.testimonial.findMany({
        where: mitraFilter,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.testimonial.count({ where: mitraFilter }),
    ]);

    return NextResponse.json({ testimonials, total, page, limit });
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

    const userRole = (session.user as { role?: string })?.role;
    const sessionMitraId = (session.user as { mitraId?: string | null })?.mitraId;

    const body = await req.json();
    const { name, role, text, rating, featured } = body;

    if (!name || !text) {
      return NextResponse.json({ error: "Name and text are required" }, { status: 400 });
    }

    const parsedRating = parseInt(rating);

    const testimonial = await db.testimonial.create({
      data: {
        mitraId: (isSuperadmin(userRole) ? (body.mitraId || sessionMitraId) : sessionMitraId) || null,
        name,
        role: role || "",
        text,
        rating: (isNaN(parsedRating) || parsedRating < 1 || parsedRating > 5) ? 5 : parsedRating,
        featured: !!featured,
      },
    });

    return NextResponse.json(testimonial, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
