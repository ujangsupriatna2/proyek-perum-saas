"use client";

import { useState, useEffect, createContext, useContext, useCallback } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import {
  LayoutDashboard,
  Users,
  Building2,
  FileText,
  MessageSquare,
  Calculator,
  Camera,
  LandPlot,
  Handshake,
  Wrench,
  Settings,
  LogOut,
  Menu,
  ChevronLeft,
  User,
  Home,
} from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { canAccessRoute, isSuperadmin } from "@/lib/permissions";
import { useSettingsStore } from "@/lib/settings-store";

// ──── Navigation Config ────
const NAV_ITEMS = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/admin/dashboard", superadminOnly: false },
  { label: "Mitra", icon: Handshake, href: "/admin/dashboard/mitra", superadminOnly: true },
  { label: "User", icon: Users, href: "/admin/dashboard/users", superadminOnly: true },
  { label: "Proyek", icon: Building2, href: "/admin/dashboard/proyek", superadminOnly: false },
  { label: "Blog", icon: FileText, href: "/admin/dashboard/blog", superadminOnly: false },
  { label: "Testimoni", icon: MessageSquare, href: "/admin/dashboard/testimoni", superadminOnly: false },
  { label: "Kalkulator", icon: Calculator, href: "/admin/dashboard/kalkulator", superadminOnly: false },
  { label: "Gallery", icon: Camera, href: "/admin/dashboard/gallery", superadminOnly: false },
  { label: "Kerjasama Bank", icon: LandPlot, href: "/admin/dashboard/bank", superadminOnly: false },
  { label: "Jasa", icon: Wrench, href: "/admin/dashboard/jasa", superadminOnly: true },
  { label: "Pengaturan", icon: Settings, href: "/admin/dashboard/pengaturan", superadminOnly: false },
];

// ──── Breadcrumbs ────
const BREADCRUMBS: Record<string, string> = {
  "/admin/dashboard": "Dashboard",
  "/admin/dashboard/mitra": "Mitra",
  "/admin/dashboard/users": "User",
  "/admin/dashboard/proyek": "Proyek",
  "/admin/dashboard/blog": "Blog",
  "/admin/dashboard/testimoni": "Testimoni",
  "/admin/dashboard/kalkulator": "Kalkulator",
  "/admin/dashboard/gallery": "Gallery",
  "/admin/dashboard/bank": "Kerjasama Bank",
  "/admin/dashboard/jasa": "Jasa",
  "/admin/dashboard/pengaturan": "Pengaturan",
};

// ──── Sidebar Context ────
interface SidebarContextType {
  collapsed: boolean;
  setCollapsed: (v: boolean) => void;
  mobileOpen: boolean;
  setMobileOpen: (v: boolean) => void;
}

const SidebarCtx = createContext<SidebarContextType>({
  collapsed: false,
  setCollapsed: () => {},
  mobileOpen: false,
  setMobileOpen: () => {},
});

export const useSidebar = () => useContext(SidebarCtx);

// ──── Sidebar Nav Items ────
function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const collapsed = useSidebar().collapsed;
  const { data: session } = useSession();
  const role = (session?.user as { role?: string })?.role;

  const visibleItems = NAV_ITEMS.filter(
    (item) => !item.superadminOnly || isSuperadmin(role)
  );

  return (
    <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
      {visibleItems.map((item) => {
        const isActive =
          item.href === "/admin/dashboard"
            ? pathname === "/admin/dashboard"
            : pathname.startsWith(item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
              isActive
                ? "bg-gray-700 text-white shadow-lg shadow-gray-900/30"
                : "text-gray-400 hover:bg-gray-800 hover:text-white"
            )}
            title={collapsed ? item.label : undefined}
          >
            <item.icon className={cn("w-5 h-5 shrink-0", isActive && "text-white")} />
            {!collapsed && <span>{item.label}</span>}
          </Link>
        );
      })}
    </nav>
  );
}

// ──── Sidebar Content (shared between desktop & mobile) ────
function SidebarContent({ showCollapseToggle = true }: { showCollapseToggle?: boolean }) {
  const { collapsed, setCollapsed } = useSidebar();
  const { settings: S, fetchSettings } = useSettingsStore();
  const { data: session } = useSession();

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);
  const year = new Date().getFullYear();
  const adminName = session?.user?.name || "Admin";

  return (
    <div className="flex flex-col h-full bg-gray-900">
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-gray-800">
        {S.logo_url ? (
          <img
            src={S.logo_url}
            alt="Logo"
            className="w-9 h-9 rounded-xl object-contain shrink-0 bg-white/10"
          />
        ) : (
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-gray-800 to-gray-700 flex items-center justify-center shrink-0">
            <Building2 className="w-5 h-5 text-white" />
          </div>
        )}
        {!collapsed && (
          <div className="overflow-hidden">
            <h1 className="text-white font-bold text-base leading-tight truncate">{adminName}</h1>
            <p className="text-gray-400 text-[11px] leading-tight truncate">{S.company_name || "Admin"}</p>
          </div>
        )}
        {showCollapseToggle && (
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="ml-auto text-gray-400 hover:text-white transition-colors p-1 rounded-md hover:bg-gray-800"
          >
            <ChevronLeft
              className={cn(
                "w-4 h-4 transition-transform duration-300",
                collapsed && "rotate-180"
              )}
            />
          </button>
        )}
      </div>

      {/* Navigation */}
      <SidebarNav />

      {/* Footer */}
      <div className="px-4 py-3 border-t border-gray-800">
        {!collapsed ? (
          <p className="text-gray-500 text-[11px] text-center">© {year} {S.company_name || "Admin"}</p>
        ) : (
          <p className="text-gray-500 text-[9px] text-center">©{String(year).slice(-2)}</p>
        )}
      </div>
    </div>
  );
}

// ──── Header ────
function Header() {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const router = useRouter();
  const { mobileOpen, setMobileOpen, collapsed, setCollapsed } = useSidebar();
  const role = (session?.user as { role?: string })?.role;

  const pageName = BREADCRUMBS[pathname] || "Dashboard";
  const initials = session?.user?.name
    ? session.user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "AD";

  return (
    <header
      className={cn(
        "sticky top-0 z-30 flex items-center justify-between h-16 px-4 md:px-6 bg-white border-b border-gray-200 transition-all duration-300"
      )}
    >
      {/* Left: hamburger + breadcrumb */}
      <div className="flex items-center gap-3">
        {/* Mobile hamburger */}
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="w-5 h-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-72 bg-gray-900">
            <SidebarCtx.Provider
              value={{
                collapsed: false,
                setCollapsed: () => {},
                mobileOpen,
                setMobileOpen,
              }}
            >
              <SidebarContent showCollapseToggle={false} />
            </SidebarCtx.Provider>
          </SheetContent>
        </Sheet>

        {/* Desktop toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="hidden md:flex p-1.5 rounded-md hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 text-sm">
          <Link href="/?tab=home" className="text-gray-400 hover:text-gray-700 transition-colors">
            <Home className="w-4 h-4" />
          </Link>
          <span className="text-gray-300">/</span>
          <span className="font-semibold text-gray-800">{pageName}</span>
        </div>
      </div>

      {/* Right: admin avatar */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="flex items-center gap-2 hover:bg-gray-50 rounded-lg px-2 py-1.5 transition-colors">
            {status === "loading" ? (
              <Skeleton className="w-8 h-8 rounded-full" />
            ) : (
              <Avatar className="w-8 h-8">
                <AvatarFallback className="bg-gray-900 text-white text-xs font-semibold">
                  {initials}
                </AvatarFallback>
              </Avatar>
            )}
            {session?.user?.name && (
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium text-gray-700 leading-tight">{session.user.name}</p>
                <span className={`inline-block mt-0.5 px-1.5 py-0.5 text-[10px] font-semibold rounded-md leading-none ${
                  isSuperadmin(role)
                    ? "bg-gray-100 text-gray-700"
                    : "bg-gray-100 text-gray-500"
                }`}>
                  {isSuperadmin(role) ? "Super Admin" : "Admin"}
                </span>
              </div>
            )}
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem
            className="gap-2 text-gray-700 focus:text-gray-700"
            onClick={() => signOut({ callbackUrl: "/admin/login" })}
          >
            <LogOut className="w-4 h-4" />
            Logout
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}

// ──── Loading Screen ────
function LoadingScreen() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="text-center">
        <Skeleton className="w-12 h-12 rounded-2xl mx-auto mb-4" />
        <Skeleton className="w-32 h-4 mx-auto" />
      </div>
    </div>
  );
}

// ──── Redirect if not authenticated ────
function AuthGuard({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const role = (session?.user as { role?: string })?.role;

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/admin/login");
      return;
    }
    if (status === "authenticated" && !canAccessRoute(role, pathname)) {
      router.push("/admin/dashboard");
    }
  }, [status, role, pathname, router]);

  if (status === "loading") return <LoadingScreen />;
  if (!session) return <LoadingScreen />;
  if (!canAccessRoute(role, pathname)) return <LoadingScreen />;

  return <>{children}</>;
}

// ──── Main Layout ────
export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { fetchSettings } = useSettingsStore();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const handleMobileNav = useCallback(() => {
    setMobileOpen(false);
  }, []);

  return (
    <AuthGuard>
      <SidebarCtx.Provider value={{ collapsed, setCollapsed, mobileOpen, setMobileOpen }}>
        <div className="flex h-screen overflow-hidden bg-gray-50">
          {/* Desktop Sidebar */}
          <aside
            className={cn(
              "hidden md:flex flex-col h-screen border-r border-gray-200 bg-gray-900 transition-all duration-300 shrink-0 z-20",
              collapsed ? "w-[72px]" : "w-60"
            )}
          >
            <SidebarContent />
          </aside>

          {/* Main Content */}
          <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
            <Header />
            <main className="flex-1 overflow-y-auto p-4 md:p-6">{children}</main>
          </div>
        </div>
      </SidebarCtx.Provider>
    </AuthGuard>
  );
}
