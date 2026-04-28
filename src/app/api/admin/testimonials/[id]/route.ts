import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { isSuperadmin } from "@/lib/permissions";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const testimonial = await db.testimonial.findUnique({ where: { id } });

    if (!testimonial) {
      return NextResponse.json({ error: "Testimonial not found" }, { status: 404 });
    }

    // Non-superadmin can only view their own mitra's testimonial
    const role = (session.user as { role?: string })?.role;
    const mitraId = (session.user as { mitraId?: string | null })?.mitraId;
    if (!isSuperadmin(role) && testimonial.mitraId && testimonial.mitraId !== mitraId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json(testimonial);
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
    const mitraId = (session.user as { mitraId?: string | null })?.mitraId;

    const { id } = await params;
    const body = await req.json();

    const existing = await db.testimonial.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Testimonial not found" }, { status: 404 });
    }

    // Non-superadmin can only update their own mitra's testimonial
    if (!isSuperadmin(role) && existing.mitraId && existing.mitraId !== mitraId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const updateData: Record<string, unknown> = {};
    const fields = ["name", "role", "text"];
    for (const f of fields) {
      if (body[f] !== undefined) updateData[f] = body[f];
    }
    if (body.rating !== undefined) {
      const parsedRating = parseInt(body.rating);
      updateData.rating = (isNaN(parsedRating) || parsedRating < 1 || parsedRating > 5) ? existing.rating : parsedRating;
    }
    if (body.featured !== undefined) updateData.featured = !!body.featured;

    const testimonial = await db.testimonial.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(testimonial);
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
    const mitraId = (session.user as { mitraId?: string | null })?.mitraId;

    const { id } = await params;
    const existing = await db.testimonial.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Testimonial not found" }, { status: 404 });
    }

    // Non-superadmin can only delete their own mitra's testimonial
    if (!isSuperadmin(role) && existing.mitraId && existing.mitraId !== mitraId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await db.testimonial.delete({ where: { id } });
    return NextResponse.json({ message: "Testimonial deleted successfully" });
  } catch {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
