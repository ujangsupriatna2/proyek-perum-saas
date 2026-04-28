import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

/** Clean Quill HTML: replace &nbsp; with normal spaces so text wraps properly */
function cleanHtml(html: string): string {
  return html
    .replace(/&nbsp;/g, " ")
    .replace(/\s{2,}/g, (match) => match.slice(0, 1) === " " ? " " : match);
}

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const category = searchParams.get("category") || "";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");

    const where: Record<string, unknown> = {};
    if (search) {
      where.OR = [
        { title: { contains: search } },
        { slug: { contains: search } },
      ];
    }
    if (category) where.category = category;

    const [blogs, total] = await Promise.all([
      db.blogPost.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.blogPost.count({ where }),
    ]);

    return NextResponse.json({ blogs, total, page, limit });
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

    const body = await req.json();
    const { title, slug, excerpt, content, category, author, image, published, readTime } = body;

    if (!title || !slug) {
      return NextResponse.json({ error: "Title and slug are required" }, { status: 400 });
    }

    const slugExists = await db.blogPost.findUnique({ where: { slug } });
    if (slugExists) {
      return NextResponse.json({ error: "Slug sudah digunakan" }, { status: 409 });
    }

    const blog = await db.blogPost.create({
      data: {
        title: cleanHtml(title),
        slug,
        excerpt: cleanHtml(excerpt || ""),
        content: cleanHtml(content || ""),
        category: category || "",
        author: author || "Admin",
        image: image || "",
        published: !!published,
        readTime: readTime || "5 menit",
      },
    });

    return NextResponse.json(blog, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
