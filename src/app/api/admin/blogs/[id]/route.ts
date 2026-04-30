import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { isSuperadmin } from "@/lib/permissions";

/** Clean Quill HTML: replace &nbsp; with normal spaces so text wraps properly */
function cleanHtml(html: string): string {
  return html
    .replace(/&nbsp;/g, " ")
    .replace(/\s{2,}/g, (match) => match.slice(0, 1) === " " ? " " : match);
}

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
    const blog = await db.blogPost.findUnique({ where: { id } });

    if (!blog) {
      return NextResponse.json({ error: "Blog not found" }, { status: 404 });
    }

    // Non-superadmin can only view their own mitra's blog
    const role = (session.user as { role?: string })?.role;
    const mitraId = (session.user as { mitraId?: string | null })?.mitraId;
    if (!isSuperadmin(role) && blog.mitraId && blog.mitraId !== mitraId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json(blog);
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

    const existing = await db.blogPost.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Blog not found" }, { status: 404 });
    }

    // Non-superadmin can only update their own mitra's blog
    if (!isSuperadmin(role) && existing.mitraId && existing.mitraId !== mitraId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (body.slug && body.slug !== existing.slug) {
      const slugWhere: Record<string, unknown> = { slug: body.slug };
      if (existing.mitraId) slugWhere.mitraId = existing.mitraId;
      const slugExists = await db.blogPost.findFirst({ where: slugWhere });
      if (slugExists) {
        return NextResponse.json({ error: "Slug sudah digunakan" }, { status: 409 });
      }
    }

    const updateData: Record<string, unknown> = {};
    const fields = ["title", "slug", "excerpt", "content", "category", "author", "image", "readTime"];
    for (const f of fields) {
      if (body[f] !== undefined) {
        // Clean HTML fields to replace &nbsp; with normal spaces
        if (f === "title" || f === "excerpt" || f === "content") {
          updateData[f] = cleanHtml(body[f]);
        } else {
          updateData[f] = body[f];
        }
      }
    }
    if (body.published !== undefined) updateData.published = !!body.published;
    if (body.mitraId !== undefined) updateData.mitraId = body.mitraId || null;

    const blog = await db.blogPost.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(blog);
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
    const existing = await db.blogPost.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Blog not found" }, { status: 404 });
    }

    // Non-superadmin can only delete their own mitra's blog
    if (!isSuperadmin(role) && existing.mitraId && existing.mitraId !== mitraId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await db.blogPost.delete({ where: { id } });
    return NextResponse.json({ message: "Blog deleted successfully" });
  } catch {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
