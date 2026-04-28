import type { Metadata } from "next";
import NextAuthProvider from "@/components/next-auth-provider";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

const DEFAULT_COMPANY = "Bandung Raya Residence";

export async function generateMetadata(): Promise<Metadata> {
  let companyName = DEFAULT_COMPANY;
  try {
    const rows = await db.setting.findMany({ where: { key: "company_name" } });
    if (rows[0]?.value) companyName = rows[0].value;
  } catch { /* fallback to default */ }

  return {
    title: `Admin Panel — ${companyName}`,
  };
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <NextAuthProvider>
      {children}
    </NextAuthProvider>
  );
}
