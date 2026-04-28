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

      if (targetMitraId) {
        // Non-null mitraId: use upsert with compound unique key
        await db.setting.upsert({
          where: {
            mitraId_key: {
              mitraId: targetMitraId,
              key: item.key,
            },
          },
          update: {
            value: item.value,
            ...(item.label !== undefined && { label: item.label }),
            ...(item.group !== undefined && { group: item.group }),
          },
          create: {
            mitraId: targetMitraId,
            key: item.key,
            value: item.value,
            label: item.label || item.key,
            group: item.group || "general",
          },
        });
      } else {
        // Global settings (mitraId = null): cannot use upsert with null in compound key
        // Prisma's SettingMitraIdKeyCompoundUniqueInput requires mitraId: string
        // So we use findFirst + update/create instead
        const existing = await db.setting.findFirst({
          where: { mitraId: null, key: item.key },
        });

        if (existing) {
          await db.setting.update({
            where: { id: existing.id },
            data: {
              value: item.value,
              ...(item.label !== undefined && { label: item.label }),
              ...(item.group !== undefined && { group: item.group }),
            },
          });
        } else {
          await db.setting.create({
            data: {
              mitraId: null,
              key: item.key,
              value: item.value,
              label: item.label || item.key,
              group: item.group || "general",
            },
          });
        }
      }
    }

    return NextResponse.json({ message: "Settings updated successfully" });
  } catch (error) {
    console.error("[PUT /api/admin/settings]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
