import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { isSuperadmin, getMitraFilter } from "@/lib/permissions";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const role = (session.user as { role?: string })?.role;
    const mitraId = (session.user as { mitraId?: string | null })?.mitraId;

    // Superadmin only endpoint
    if (!isSuperadmin(role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const mitraFilter = getMitraFilter(mitraId);

    const settings = await db.setting.findMany({ where: mitraFilter });
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
    const mitraId = (session.user as { mitraId?: string | null })?.mitraId;

    // Superadmin only endpoint
    if (!isSuperadmin(role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const items: { key: string; value: string; label?: string; group?: string }[] = body;

    if (!Array.isArray(items)) {
      return NextResponse.json({ error: "Expected array of settings" }, { status: 400 });
    }

    for (const item of items) {
      // Upsert with mitra scope
      await db.setting.upsert({
        where: {
          key_mitraId: {
            key: item.key,
            mitraId: mitraId ?? null,
          },
        },
        update: {
          value: item.value,
          ...(item.label !== undefined && { label: item.label }),
          ...(item.group !== undefined && { group: item.group }),
        },
        create: {
          mitraId: mitraId || null,
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
