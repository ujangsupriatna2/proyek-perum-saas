import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { isSuperadmin } from "@/lib/permissions";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const role = (session.user as { role?: string })?.role;
    const sessionMitraId = (session.user as { mitraId?: string | null })?.mitraId;

    // Superadmin can pass ?mitraId=xxx to view a specific mitra's settings
    let mitraId = sessionMitraId;
    if (isSuperadmin(role)) {
      const { searchParams } = new URL(req.url);
      const queryMitraId = searchParams.get("mitraId");
      if (queryMitraId) mitraId = queryMitraId;
    }

    const where: Record<string, unknown> = {};
    if (mitraId) {
      where.mitraId = mitraId;
    } else {
      where.mitraId = null;
    }

    const settings = await db.setting.findMany({ where });
    const settingsMap: Record<string, string> = {};
    settings.forEach((s) => {
      settingsMap[s.key] = s.value;
    });

    return NextResponse.json(settingsMap);
  } catch {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const role = (session.user as { role?: string })?.role;
    const sessionMitraId = (session.user as { mitraId?: string | null })?.mitraId;

    const body = await req.json();
    const items: { key: string; value: string; label?: string; group?: string; mitraId?: string }[] = body;

    if (!Array.isArray(items)) {
      return NextResponse.json({ error: "Expected array of settings" }, { status: 400 });
    }

    // Superadmin can specify mitraId per item or via a top-level mitraId
    // Admin always uses their own mitraId
    for (const item of items) {
      let targetMitraId: string | null = sessionMitraId;

      if (isSuperadmin(role)) {
        // Superadmin: use item's mitraId if provided, otherwise use session mitraId (null for global)
        targetMitraId = item.mitraId ?? sessionMitraId ?? null;
      }

      // Admin must have a mitraId
      if (!isSuperadmin(role) && !targetMitraId) {
        return NextResponse.json({ error: "Admin harus memiliki mitra" }, { status: 400 });
      }

      await db.setting.upsert({
        where: {
          key_mitraId: {
            key: item.key,
            mitraId: targetMitraId ?? null,
          },
        },
        update: {
          value: item.value,
          ...(item.label !== undefined && { label: item.label }),
          ...(item.group !== undefined && { group: item.group }),
        },
        create: {
          mitraId: targetMitraId || null,
          key: item.key,
          value: item.value,
          label: item.label || item.key,
          group: item.group || "general",
        },
      });
    }

    return NextResponse.json({ message: "Settings updated successfully" });
  } catch {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
