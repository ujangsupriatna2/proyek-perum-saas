import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { hash } from "bcryptjs";
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
    if (!isSuperadmin((session.user as { role?: string })?.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const admin = await db.admin.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        avatar: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!admin) {
      return NextResponse.json({ error: "Admin not found" }, { status: 404 });
    }

    return NextResponse.json(admin);
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
    if (!isSuperadmin((session.user as { role?: string })?.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const body = await req.json();
    const { name, email, password, role, avatar } = body;

    const existing = await db.admin.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Admin not found" }, { status: 404 });
    }

    const currentUserId = (session.user as { id?: string })?.id;
    if (id === currentUserId && role && role !== existing.role) {
      return NextResponse.json({ error: "Tidak dapat mengubah role sendiri" }, { status: 400 });
    }

    if (email && email !== existing.email) {
      const emailTaken = await db.admin.findUnique({ where: { email } });
      if (emailTaken) {
        return NextResponse.json({ error: "Email already exists" }, { status: 400 });
      }
    }

    const updateData: Record<string, unknown> = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (role) updateData.role = role;
    if (avatar !== undefined) updateData.avatar = avatar;
    if (password && password.trim()) {
      updateData.password = await hash(password, 12);
    }

    const admin = await db.admin.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        avatar: true,
        createdAt: true,
      },
    });

    return NextResponse.json(admin);
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
    if (!isSuperadmin((session.user as { role?: string })?.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const existing = await db.admin.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Admin not found" }, { status: 404 });
    }

    const currentUserId = (session.user as { id?: string })?.id;
    if (id === currentUserId) {
      return NextResponse.json({ error: "Tidak dapat menghapus akun sendiri" }, { status: 400 });
    }

    await db.admin.delete({ where: { id } });

    return NextResponse.json({ message: "Admin deleted successfully" });
  } catch {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
