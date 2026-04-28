// Role-based permission helper for admin panel

export type AdminRole = "admin" | "superadmin";

export const ROLES = {
  ADMIN: "admin" as const,
  SUPERADMIN: "superadmin" as const,
};

// Navigation items that require superadmin
const SUPERADMIN_ONLY_ROUTES = [
  "/admin/dashboard/users",
  "/admin/dashboard/pengaturan",
  "/admin/dashboard/mitra",
];

// API routes that require superadmin
const SUPERADMIN_ONLY_API = [
  "/api/admin/users",
  "/api/admin/settings",
  "/api/admin/mitra",
];

export function isSuperadmin(role?: string | null): boolean {
  return role === ROLES.SUPERADMIN;
}

export function canAccessRoute(role: string | null | undefined, pathname: string): boolean {
  if (isSuperadmin(role)) return true;
  return !SUPERADMIN_ONLY_ROUTES.some((r) => pathname.startsWith(r));
}

export function canAccessApi(role: string | null | undefined, pathname: string): boolean {
  if (isSuperadmin(role)) return true;
  return !SUPERADMIN_ONLY_API.some((r) => pathname.startsWith(r));
}

/**
 * Returns a Prisma `where` clause to filter records by mitra.
 * - If mitraId is provided (regular admin): returns `{ mitraId }` to scope data to their mitra.
 * - If mitraId is null/undefined (superadmin): returns `{}` to allow access to all records.
 */
export function getMitraFilter(mitraId?: string | null): Record<string, string> {
  if (mitraId) {
    return { mitraId };
  }
  return {};
}
