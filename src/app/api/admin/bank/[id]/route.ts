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
    const item = await db.bank.findUnique({ where: { id } });

    if (!item) {
      return NextResponse.json({ error: "Bank tidak ditemukan" }, { status: 404 });
    }

    // Non-superadmin can only view their own mitra's bank
    const role = (session.user as { role?: string })?.role;
    const mitraId = (session.user as { mitraId?: string | null })?.mitraId;
    if (!isSuperadmin(role) && item.mitraId && item.mitraId !== mitraId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json(item);
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

    const existing = await db.bank.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Bank tidak ditemukan" }, { status: 404 });
    }

    // Non-superadmin can only update their own mitra's bank
    if (!isSuperadmin(role) && existing.mitraId && existing.mitraId !== mitraId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const updateData: Record<string, unknown> = {};
    const fields = ["name", "description", "image"];
    for (const f of fields) {
      if (body[f] !== undefined) updateData[f] = body[f];
    }
    if (body.sortOrder !== undefined) updateData.sortOrder = parseInt(body.sortOrder);
    if (body.isActive !== undefined) updateData.isActive = Boolean(body.isActive);

    const item = await db.bank.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(item);
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
    const existing = await db.bank.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Bank tidak ditemukan" }, { status: 404 });
    }

    // Non-superadmin can only delete their own mitra's bank
    if (!isSuperadmin(role) && existing.mitraId && existing.mitraId !== mitraId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await db.bank.delete({ where: { id } });
    return NextResponse.json({ message: "Bank berhasil dihapus" });
  } catch {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
