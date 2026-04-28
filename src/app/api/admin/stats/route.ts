import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { getMitraFilter, isSuperadmin } from "@/lib/permissions";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const role = (session.user as { role?: string })?.role;
    const mitraId = (session.user as { mitraId?: string | null })?.mitraId;
    const mitraFilter = getMitraFilter(mitraId);

    const [
      totalProperties,
      publishedBlogs,
      totalTestimonials,
      totalBanks,
      totalGallery,
    ] = await Promise.all([
      db.property.count({ where: mitraFilter }),
      db.blogPost.count({ where: { ...mitraFilter, published: true } }),
      db.testimonial.count({ where: mitraFilter }),
      db.bank.count({ where: { ...mitraFilter, isActive: true } }),
      db.galleryItem.count({ where: mitraFilter }),
    ]);

    const result: Record<string, number> = {
      totalProperties,
      publishedBlogs,
      totalTestimonials,
      totalBanks,
      totalGallery,
    };

    // Superadmin also gets total mitra count
    if (isSuperadmin(role)) {
      const totalMitra = await db.mitra.count();
      result.totalMitra = totalMitra;
    }

    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
