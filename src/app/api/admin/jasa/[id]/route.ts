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

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const role = (session.user as { role?: string })?.role;
    if (!isSuperadmin(role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const service = await db.service.findUnique({
      where: { id },
      include: { mitra: { select: { name: true } } },
    });

    if (!service) {
      return NextResponse.json({ error: "Service not found" }, { status: 404 });
    }

    return NextResponse.json(service);
  } catch {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const role = (session.user as { role?: string })?.role;
    if (!isSuperadmin(role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const body = await req.json();

    const existing = await db.service.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Service not found" }, { status: 404 });
    }

    // Check slug uniqueness if changed
    const newSlug = body.slug || (body.title ? generateSlug(body.title) : existing.slug);
    if (newSlug && newSlug !== existing.slug) {
      const slugWhere: Record<string, unknown> = { slug: newSlug };
      const checkMitraId = body.mitraId !== undefined ? body.mitraId : existing.mitraId;
      if (checkMitraId) slugWhere.mitraId = checkMitraId;
      const slugExists = await db.service.findFirst({ where: slugWhere });
      if (slugExists) {
        return NextResponse.json({ error: "Slug sudah digunakan" }, { status: 409 });
      }
    }

    const updateData: Record<string, unknown> = {};

    const stringFields = ["title", "slug", "description", "category", "priceUnit", "image", "duration"];
    for (const f of stringFields) {
      if (body[f] !== undefined) updateData[f] = body[f];
    }

    // Use generated slug if title changed but slug not explicitly provided
    if (body.title && body.slug === undefined) {
      updateData.slug = generateSlug(body.title);
    }

    if (body.price !== undefined) updateData.price = parseFloat(body.price) || 0;
    if (body.mitraId !== undefined) updateData.mitraId = body.mitraId || null;
    if (body.isPublished !== undefined) updateData.isPublished = !!body.isPublished;
    if (body.isFeatured !== undefined) updateData.isFeatured = !!body.isFeatured;
    if (body.sortOrder !== undefined) updateData.sortOrder = parseInt(body.sortOrder) || 0;

    // Parse features
    if (body.features !== undefined) {
      if (typeof body.features === "string") {
        if (body.features.startsWith("[")) {
          updateData.features = body.features;
        } else {
          updateData.features = JSON.stringify(
            body.features.split(",").map((f: string) => f.trim()).filter(Boolean)
          );
        }
      } else if (Array.isArray(body.features)) {
        updateData.features = JSON.stringify(body.features);
      }
    }

    const service = await db.service.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(service);
  } catch {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const role = (session.user as { role?: string })?.role;
    if (!isSuperadmin(role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const existing = await db.service.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Service not found" }, { status: 404 });
    }

    await db.service.delete({ where: { id } });
    return NextResponse.json({ message: "Service deleted successfully" });
  } catch {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
