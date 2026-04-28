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

    const settings = await db.setting.findMany();
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
    if (!isSuperadmin((session.user as { role?: string })?.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const items: { key: string; value: string; label?: string; group?: string }[] = body;

    if (!Array.isArray(items)) {
      return NextResponse.json({ error: "Expected array of settings" }, { status: 400 });
    }

    for (const item of items) {
      await db.setting.upsert({
        where: { key: item.key },
        update: { value: item.value, ...(item.label !== undefined && { label: item.label }), ...(item.group !== undefined && { group: item.group }) },
        create: {
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
