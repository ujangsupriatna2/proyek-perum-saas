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
    const property = await db.property.findUnique({ where: { id } });

    if (!property) {
      return NextResponse.json({ error: "Property not found" }, { status: 404 });
    }

    // Non-superadmin can only view their own mitra's property
    const role = (session.user as { role?: string })?.role;
    const mitraId = (session.user as { mitraId?: string | null })?.mitraId;
    if (!isSuperadmin(role) && property.mitraId && property.mitraId !== mitraId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json(property);
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

    const existing = await db.property.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Property not found" }, { status: 404 });
    }

    // Non-superadmin can only update their own mitra's property
    if (!isSuperadmin(role) && existing.mitraId && existing.mitraId !== mitraId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (body.slug && body.slug !== existing.slug) {
      const slugWhere: Record<string, unknown> = { slug: body.slug };
      if (existing.mitraId) slugWhere.mitraId = existing.mitraId;
      const slugExists = await db.property.findFirst({ where: slugWhere });
      if (slugExists) {
        return NextResponse.json({ error: "Slug sudah digunakan" }, { status: 409 });
      }
    }

    const updateData: Record<string, unknown> = {};
    const stringFields = ["name", "slug", "type", "category", "location", "status", "description", "tag", "installment", "financingTypes"];
    for (const f of stringFields) {
      if (body[f] !== undefined) updateData[f] = body[f];
    }
    if (body.price !== undefined) updateData.price = parseFloat(body.price) || 0;
    if (body.bedrooms !== undefined) updateData.bedrooms = parseInt(body.bedrooms) || 0;
    if (body.bathrooms !== undefined) updateData.bathrooms = parseInt(body.bathrooms) || 0;
    if (body.landArea !== undefined) updateData.landArea = parseFloat(body.landArea) || 0;
    if (body.buildingArea !== undefined) updateData.buildingArea = parseFloat(body.buildingArea) || 0;
    if (body.features !== undefined) updateData.features = typeof body.features === "string" ? body.features : JSON.stringify(body.features);
    if (body.images !== undefined) updateData.images = body.images;
    if (body.dpOptions !== undefined) updateData.dpOptions = typeof body.dpOptions === "string" ? body.dpOptions : JSON.stringify(body.dpOptions);
    if (body.tenorOptions !== undefined) updateData.tenorOptions = typeof body.tenorOptions === "string" ? body.tenorOptions : JSON.stringify(body.tenorOptions);
    if (body.installments !== undefined) updateData.installments = typeof body.installments === "string" ? body.installments : JSON.stringify(body.installments);
    if (body.syariahMargin !== undefined) updateData.syariahMargin = parseFloat(body.syariahMargin) || 15;
    if (body.kprDpOptions !== undefined) updateData.kprDpOptions = typeof body.kprDpOptions === "string" ? body.kprDpOptions : JSON.stringify(body.kprDpOptions);
    if (body.kprTenorOptions !== undefined) updateData.kprTenorOptions = typeof body.kprTenorOptions === "string" ? body.kprTenorOptions : JSON.stringify(body.kprTenorOptions);
    if (body.kprInstallments !== undefined) updateData.kprInstallments = typeof body.kprInstallments === "string" ? body.kprInstallments : JSON.stringify(body.kprInstallments);
    if (body.kprInterestRate !== undefined) updateData.kprInterestRate = parseFloat(body.kprInterestRate) || 7.5;
    if (body.kprInterestType !== undefined) updateData.kprInterestType = body.kprInterestType;
    if (body.videoUrl !== undefined) updateData.videoUrl = body.videoUrl;
    if (body.isFeatured !== undefined) updateData.isFeatured = !!body.isFeatured;
    if (body.mitraId !== undefined) updateData.mitraId = body.mitraId || null;

    const property = await db.property.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(property);
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
    const existing = await db.property.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Property not found" }, { status: 404 });
    }

    // Non-superadmin can only delete their own mitra's property
    if (!isSuperadmin(role) && existing.mitraId && existing.mitraId !== mitraId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await db.property.delete({ where: { id } });
    return NextResponse.json({ message: "Property deleted successfully" });
  } catch {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
