import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { hash } from "bcryptjs";
import { isSuperadmin } from "@/lib/permissions";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (!isSuperadmin((session.user as { role?: string })?.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Superadmin can see all admins
    const admins = await db.admin.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        mitraId: true,
        avatar: true,
        createdAt: true,
        updatedAt: true,
        mitra: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(admins);
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
    if (!isSuperadmin((session.user as { role?: string })?.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const { name, email, password, role, mitraId } = body;

    if (!name || !email || !password) {
      return NextResponse.json({ error: "Name, email, and password are required" }, { status: 400 });
    }

    const validRoles = ["admin", "superadmin"];
    if (role && !validRoles.includes(role)) {
      return NextResponse.json({ error: "Role tidak valid. Gunakan 'admin' atau 'superadmin'" }, { status: 400 });
    }

    const existing = await db.admin.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "Email already exists" }, { status: 400 });
    }

    // If mitraId is provided, verify it exists
    if (mitraId) {
      const mitra = await db.mitra.findUnique({ where: { id: mitraId } });
      if (!mitra) {
        return NextResponse.json({ error: "Mitra tidak ditemukan" }, { status: 400 });
      }
    }

    const hashedPassword = await hash(password, 12);

    const admin = await db.admin.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: role || "admin",
        mitraId: mitraId || null,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        mitraId: true,
        avatar: true,
        createdAt: true,
        mitra: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    return NextResponse.json(admin, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
