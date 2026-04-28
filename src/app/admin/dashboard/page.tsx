"use client";

import { useEffect, useState } from "react";
import {
  Building2,
  FileText,
  MessageSquare,
  LandPlot,
  Camera,
  Loader2,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useSettingsStore } from "@/lib/settings-store";

interface Stats {
  totalProperties: number;
  publishedBlogs: number;
  totalTestimonials: number;
  totalBanks: number;
  totalGallery: number;
}

const STAT_CARDS = [
  { key: "totalProperties" as const, label: "Total Produk", icon: Building2, gradient: "from-red-500 to-red-600", bg: "bg-red-50" },
  { key: "publishedBlogs" as const, label: "Blog Published", icon: FileText, gradient: "from-amber-500 to-amber-600", bg: "bg-amber-50" },
  { key: "totalTestimonials" as const, label: "Testimoni", icon: MessageSquare, gradient: "from-emerald-500 to-emerald-600", bg: "bg-emerald-50" },
  { key: "totalBanks" as const, label: "Mitra Bank", icon: LandPlot, gradient: "from-orange-500 to-orange-600", bg: "bg-orange-50" },
  { key: "totalGallery" as const, label: "Gallery", icon: Camera, gradient: "from-teal-500 to-teal-600", bg: "bg-teal-50" },
];

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

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
        <p className="text-sm text-gray-500 mt-1">Selamat datang di panel admin {useSettingsStore.getState().settings.company_name}</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading
          ? Array.from({ length: 5 }).map((_, i) => (
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
          : STAT_CARDS.map((card) => (
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
