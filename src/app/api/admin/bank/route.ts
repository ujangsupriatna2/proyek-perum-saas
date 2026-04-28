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

    const [items, total] = await Promise.all([
      db.bank.findMany({
        where: mitraFilter,
        orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
        skip: (page - 1) * limit,
        take: limit,
        include: { mitra: { select: { name: true } } },
      }),
      db.bank.count({ where: mitraFilter }),
    ]);

    return NextResponse.json({ items, total, page, limit });
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
    const sessionMitraId = (session.user as { mitraId?: string | null })?.mitraId;

    const body = await req.json();
    const { name, description, image, sortOrder, isActive } = body;

    if (!name) {
      return NextResponse.json({ error: "Nama bank wajib diisi" }, { status: 400 });
    }

    const item = await db.bank.create({
      data: {
        mitraId: (isSuperadmin(role) ? (body.mitraId || sessionMitraId) : sessionMitraId) || null,
        name,
        description: description || "",
        image: image || "",
        sortOrder: parseInt(sortOrder) || 0,
        isActive: isActive !== undefined ? Boolean(isActive) : true,
      },
    });

    return NextResponse.json(item, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
