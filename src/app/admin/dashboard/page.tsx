"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import {
  Building2,
  FileText,
  MessageSquare,
  LandPlot,
  Camera,
  Handshake,
  Wrench,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useSettingsStore } from "@/lib/settings-store";
import { isSuperadmin } from "@/lib/permissions";

interface Stats {
  totalProperties: number;
  publishedBlogs: number;
  totalTestimonials: number;
  totalBanks: number;
  totalGallery: number;
  totalMitra?: number;
  totalServices?: number;
}

const STAT_CARDS = [
  { key: "totalProperties" as const, label: "Total Produk", icon: Building2, gradient: "from-red-500 to-red-600", bg: "bg-red-50" },
  { key: "publishedBlogs" as const, label: "Blog Published", icon: FileText, gradient: "from-amber-500 to-amber-600", bg: "bg-amber-50" },
  { key: "totalTestimonials" as const, label: "Testimoni", icon: MessageSquare, gradient: "from-emerald-500 to-emerald-600", bg: "bg-emerald-50" },
  { key: "totalBanks" as const, label: "Mitra Bank", icon: LandPlot, gradient: "from-orange-500 to-orange-600", bg: "bg-orange-50" },
  { key: "totalGallery" as const, label: "Gallery", icon: Camera, gradient: "from-teal-500 to-teal-600", bg: "bg-teal-50" },
  { key: "totalMitra" as const, label: "Mitra", icon: Handshake, gradient: "from-purple-500 to-purple-600", bg: "bg-purple-50", superadminOnly: true },
  { key: "totalServices" as const, label: "Jasa", icon: Wrench, gradient: "from-cyan-500 to-cyan-600", bg: "bg-cyan-50", superadminOnly: true },
];

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const { data: session } = useSession();
  const role = (session?.user as { role?: string })?.role;
  const mitraName = (session?.user as { mitraName?: string | null })?.mitraName;
  const superAdmin = isSuperadmin(role);
  const companyName = useSettingsStore.getState().settings.company_name || "Admin";

  const visibleCards = STAT_CARDS.filter((c) => !c.superadminOnly || superAdmin);

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((r) => r.json())
      .then((d) => setStats(d))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">
          Selamat datang di panel admin
          {superAdmin
            ? companyName
            : mitraName || companyName}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading
          ? Array.from({ length: visibleCards.length }).map((_, i) => (
              <Card key={i} className="border-0 shadow-sm">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-28" />
                      <Skeleton className="h-8 w-12" />
                    </div>
                    <Skeleton className="w-12 h-12 rounded-xl" />
                  </div>
                </CardContent>
              </Card>
            ))
          : visibleCards.map((card) => (
              <Card key={card.key} className="border-0 shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500 font-medium">{card.label}</p>
                      <p className="text-2xl font-bold text-gray-900 mt-1">
                        {(stats as Record<string, number>)?.[card.key] ?? 0}
                      </p>
                    </div>
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${card.gradient} flex items-center justify-center shadow-lg`}>
                      <card.icon className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
      </div>
    </div>
  );
}
