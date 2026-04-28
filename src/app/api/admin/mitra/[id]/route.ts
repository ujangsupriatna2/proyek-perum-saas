import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { isSuperadmin } from "@/lib/permissions";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (!isSuperadmin((session.user as { role?: string })?.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const mitra = await db.mitra.findUnique({
      where: { id },
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
        website: true,
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
    });

    if (!mitra) {
      return NextResponse.json({ error: "Mitra not found" }, { status: 404 });
    }

    return NextResponse.json(mitra);
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
    if (!isSuperadmin((session.user as { role?: string })?.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const body = await req.json();
    const { name, slug, subdomain, logo, description, address, phone, email, website, isActive } = body;

    const existing = await db.mitra.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Mitra not found" }, { status: 404 });
    }

    // Check unique slug (if changed)
    if (slug && slug !== existing.slug) {
      const slugTaken = await db.mitra.findUnique({ where: { slug } });
      if (slugTaken) {
        return NextResponse.json({ error: "Slug sudah digunakan" }, { status: 400 });
      }
    }

    // Check unique subdomain (if changed)
    if (subdomain && subdomain !== existing.subdomain) {
      const subdomainTaken = await db.mitra.findUnique({ where: { subdomain } });
      if (subdomainTaken) {
        return NextResponse.json({ error: "Subdomain sudah digunakan" }, { status: 400 });
      }
    }

    const updateData: Record<string, unknown> = {};
    if (name !== undefined) updateData.name = name.trim();
    if (slug !== undefined) updateData.slug = slug;
    if (subdomain !== undefined) updateData.subdomain = subdomain;
    if (logo !== undefined) updateData.logo = logo;
    if (description !== undefined) updateData.description = description;
    if (address !== undefined) updateData.address = address;
    if (phone !== undefined) updateData.phone = phone;
    if (email !== undefined) updateData.email = email;
    if (website !== undefined) updateData.website = website;
    if (isActive !== undefined) updateData.isActive = isActive;

    const mitra = await db.mitra.update({
      where: { id },
      data: updateData,
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
        website: true,
        isActive: true,
        createdAt: true,
      },
    });

    return NextResponse.json(mitra);
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
    if (!isSuperadmin((session.user as { role?: string })?.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const existing = await db.mitra.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            properties: true,
            admins: true,
            blogPosts: true,
            testimonials: true,
            galleryItems: true,
            banks: true,
            settings: true,
          },
        },
      },
    });

    if (!existing) {
      return NextResponse.json({ error: "Mitra not found" }, { status: 404 });
    }

    // Prevent delete if linked data exists
    const counts = existing._count;
    if (
      counts.properties > 0 ||
      counts.admins > 0 ||
      counts.blogPosts > 0 ||
      counts.testimonials > 0 ||
      counts.galleryItems > 0 ||
      counts.banks > 0 ||
      counts.settings > 0
    ) {
      return NextResponse.json(
        {
          error: "Tidak dapat menghapus mitra yang masih memiliki data terkait",
          details: {
            properties: counts.properties,
            admins: counts.admins,
            blogPosts: counts.blogPosts,
            testimonials: counts.testimonials,
            galleryItems: counts.galleryItems,
            banks: counts.banks,
            settings: counts.settings,
          },
        },
        { status: 400 }
      );
    }

    await db.mitra.delete({ where: { id } });

    return NextResponse.json({ message: "Mitra deleted successfully" });
  } catch {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
