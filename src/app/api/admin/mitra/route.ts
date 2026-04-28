import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
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

    const mitraList = await db.mitra.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        subdomain: true,
        logo: true,
        description: true,
        address: true,
        phone: true,
        email: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            properties: true,
            admins: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(mitraList);
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
    const { name, slug, subdomain, logo, description, address, phone, email } = body;

    if (!name || !slug || !subdomain) {
      return NextResponse.json({ error: "Name, slug, dan subdomain wajib diisi" }, { status: 400 });
    }

    const slugExists = await db.mitra.findUnique({ where: { slug } });
    if (slugExists) {
      return NextResponse.json({ error: "Slug sudah digunakan" }, { status: 409 });
    }

    const subdomainExists = await db.mitra.findUnique({ where: { subdomain } });
    if (subdomainExists) {
      return NextResponse.json({ error: "Subdomain sudah digunakan" }, { status: 409 });
    }

    const mitra = await db.mitra.create({
      data: {
        name,
        slug,
        subdomain,
        logo: logo || "",
        description: description || "",
        address: address || "",
        phone: phone || "",
        email: email || "",
      },
    });

    return NextResponse.json(mitra, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
