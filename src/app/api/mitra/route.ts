import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// Public API — no auth required
export async function GET() {
  try {
    const mitraList = await db.mitra.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        slug: true,
        logo: true,
        description: true,
        address: true,
        phone: true,
        email: true,
        website: true,
        createdAt: true,
        _count: {
          select: {
            properties: { where: { status: { in: ["available", "inden", "siap_huni"] } } },
          },
        },
      },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json(
      mitraList.map((m) => ({
        id: m.id,
        name: m.name,
        slug: m.slug,
        logo: m.logo || "",
        description: m.description || "",
        address: m.address || "",
        phone: m.phone || "",
        email: m.email || "",
        website: m.website || "",
        createdAt: m.createdAt instanceof Date ? m.createdAt.toISOString() : String(m.createdAt),
        propertyCount: m._count.properties,
      }))
    );
  } catch (err) {
    console.error("GET /api/mitra error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
