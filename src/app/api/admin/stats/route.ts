import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [
      totalProperties,
      publishedBlogs,
      totalTestimonials,
      totalBanks,
      totalGallery,
    ] = await Promise.all([
      db.property.count(),
      db.blogPost.count({ where: { published: true } }),
      db.testimonial.count(),
      db.bank.count({ where: { isActive: true } }),
      db.galleryItem.count(),
    ]);

    return NextResponse.json({
      totalProperties,
      publishedBlogs,
      totalTestimonials,
      totalBanks,
      totalGallery,
    });
  } catch {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
