"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { Plus, Pencil, Trash2, Shield, Eye, EyeOff, Loader2, Users, AlertCircle, Building2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Mitra {
  id: string;
  name: string;
  slug: string;
}

interface Admin {
  id: string;
  name: string;
  email: string;
  role: string;
  mitraId?: string | null;
  mitra?: { id: string; name: string; slug: string } | null;
  avatar?: string;
  createdAt: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  password?: string;
  mitraId?: string;
}

const emptyForm = { name: "", email: "", password: "", role: "admin", mitraId: "" };
const emptyErrors: FormErrors = {};

export default function UsersPage() {
  const { data: session } = useSession();
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [mitraList, setMitraList] = useState<Mitra[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editing, setEditing] = useState<Admin | null>(null);
  const [deleting, setDeleting] = useState<Admin | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState<FormErrors>(emptyErrors);
  const [saving, setSaving] = useState(false);
  const [deletingLoading, setDeletingLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const currentUserId = (session?.user as { id?: string })?.id;

  const fetchMitra = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/mitra");
      if (res.ok) {
        const data = await res.json();
        setMitraList(data);
      }
    } catch {
      // silent fail — mitra dropdown will just be empty
    }
  }, []);

  const fetchAdmins = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/users");
      if (res.status === 403) {
        toast.error("Akses ditolak. Hanya Super Admin.");
        return;
      }
      const data = await res.json();
      setAdmins(data);
    } catch {
      toast.error("Gagal memuat data user");
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchMitra();
    fetchAdmins();
  }, [fetchMitra, fetchAdmins]);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setErrors(emptyErrors);
    setShowPassword(false);
    setFormOpen(true);
  };

  const openEdit = (admin: Admin) => {
    setEditing(admin);
    setForm({
      name: admin.name,
      email: admin.email,
      password: "",
      role: admin.role,
      mitraId: admin.mitraId || "",
    });
    setErrors(emptyErrors);
    setShowPassword(false);
    setFormOpen(true);
  };

  const openDelete = (admin: Admin) => {
    setDeleting(admin);
    setDeleteOpen(true);
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!form.name.trim()) {
      newErrors.name = "Nama wajib diisi";
    }

    if (!form.email.trim()) {
      newErrors.email = "Email wajib diisi";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = "Format email tidak valid";
    }

    if (!editing && !form.password.trim()) {
      newErrors.password = "Password wajib diisi untuk user baru";
    } else if (form.password && form.password.length < 6) {
      newErrors.password = "Password minimal 6 karakter";
    }

    // Mitra is required for admin role (not superadmin)
    if (form.role === "admin" && !form.mitraId) {
      newErrors.mitraId = "Mitra wajib dipilih untuk role Admin";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setSaving(true);
    try {
      const url = editing ? `/api/admin/users/${editing.id}` : "/api/admin/users";
      const method = editing ? "PUT" : "POST";
      const body: Record<string, string> = {
        name: form.name.trim(),
        email: form.email.trim(),
        role: form.role,
      };
      if (form.password) body.password = form.password;
      // Only send mitraId for admin role; superadmin gets null
      body.mitraId = form.role === "admin" ? form.mitraId : "";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Gagal menyimpan");
        return;
      }

      toast.success(editing ? "User berhasil diupdate" : "User berhasil ditambahkan");
      setFormOpen(false);
      fetchAdmins();
    } catch {
      toast.error("Terjadi kesalahan");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleting) return;

    if (deleting.id === currentUserId) {
      toast.error("Tidak bisa menghapus akun sendiri");
      setDeleteOpen(false);
      return;
    }

    setDeletingLoading(true);
    try {
      const res = await fetch(`/api/admin/users/${deleting.id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error || "Gagal menghapus");
        return;
      }
      toast.success(`User "${deleting.name}" berhasil dihapus`);
      setDeleteOpen(false);
      fetchAdmins();
    } catch {
      toast.error("Terjadi kesalahan");
    } finally {
      setDeletingLoading(false);
    }
  };

  const formatDate = (d: string) => new Date(d).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manajemen User</h1>
          <p className="text-sm text-gray-500 mt-1">Kelola akun admin ({admins.length} user)</p>
        </div>
        <Button onClick={openCreate} className="bg-red-600 hover:bg-red-700 text-white gap-2">
          <Plus className="w-4 h-4" /> Tambah User
        </Button>
      </div>

      <Card className="border-0 shadow-sm">
        <CardContent className="p-0">
            <Table containerClassName="max-h-[calc(100vh-14rem)]">
              <TableHeader className="sticky top-0 z-10 bg-gray-50">
                <TableRow className="bg-gray-50">
                  <TableHead className="w-[220px]">Nama</TableHead>
                  <TableHead className="w-[250px]">Email</TableHead>
                  <TableHead className="w-[140px]">Role</TableHead>
                  <TableHead className="w-[160px]">Mitra</TableHead>
                  <TableHead className="w-[120px]">Bergabung</TableHead>
                  <TableHead className="text-right w-[100px]">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading
                  ? Array.from({ length: 3 }).map((_, i) => (
                      <TableRow key={i}>
                        <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                        <TableCell><Skeleton className="h-5 w-20 rounded-full" /></TableCell>
                        <TableCell><Skeleton className="h-5 w-24 rounded-full" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                        <TableCell><Skeleton className="h-8 w-16 ml-auto" /></TableCell>
                      </TableRow>
                    ))
                  : admins.length === 0
                  ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-12 text-gray-400">
                          <Users className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                          <p className="font-medium">Belum ada user</p>
                          <p className="text-sm mt-1">Klik &quot;Tambah User&quot; untuk membuat akun baru</p>
                        </TableCell>
                      </TableRow>
                    )
                  : admins.map((a) => (
                      <TableRow key={a.id} className="hover:bg-gray-50">
                        <TableCell className="font-medium">{a.name}</TableCell>
                        <TableCell className="text-gray-500">{a.email}</TableCell>
                        <TableCell>
                          <Badge variant={a.role === "superadmin" ? "default" : "secondary"} className={a.role === "superadmin" ? "bg-red-600 text-white" : "bg-gray-100 text-gray-700"}>
                            <Shield className="w-3 h-3 mr-1" />
                            {a.role === "superadmin" ? "Superadmin" : "Admin"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {a.mitra ? (
                            <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 gap-1">
                              <Building2 className="w-3 h-3" />
                              {a.mitra.name}
                            </Badge>
                          ) : (
                            <span className="text-xs text-gray-400">—</span>
                          )}
                        </TableCell>
                        <TableCell className="text-gray-500 text-sm">{formatDate(a.createdAt)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button variant="ghost" size="icon" onClick={() => openEdit(a)} className="text-gray-400 hover:text-blue-600" title="Edit">
                              <Pencil className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => openDelete(a)}
                              className="text-gray-400 hover:text-red-600 disabled:opacity-30"
                              disabled={a.id === currentUserId}
                              title={a.id === currentUserId ? "Tidak bisa hapus akun sendiri" : "Hapus"}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
              </TableBody>
            </Table>
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="sm:max-w-[420px] p-5 gap-3">
          <DialogHeader className="pb-0">
            <DialogTitle className="text-base">
              {editing ? "Edit User" : "Tambah User Baru"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 pt-1">
            {/* Nama */}
            <div className="space-y-1.5">
              <Label htmlFor="user-name" className="text-xs font-medium">
                Nama <span className="text-red-500">*</span>
              </Label>
              <Input
                id="user-name"
                value={form.name}
                onChange={(e) => { setForm({ ...form, name: e.target.value }); setErrors((p) => ({ ...p, name: undefined })); }}
                placeholder="Nama lengkap"
                className={`h-9 text-sm ${errors.name ? "border-red-400 focus-visible:ring-red-400" : ""}`}
              />
              {errors.name && (
                <p className="text-xs text-red-500 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {errors.name}
                </p>
              )}
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <Label htmlFor="user-email" className="text-xs font-medium">
                Email <span className="text-red-500">*</span>
              </Label>
              <Input
                id="user-email"
                type="email"
                value={form.email}
                onChange={(e) => { setForm({ ...form, email: e.target.value }); setErrors((p) => ({ ...p, email: undefined })); }}
                placeholder="admin@brr.co.id"
                className={`h-9 text-sm ${errors.email ? "border-red-400 focus-visible:ring-red-400" : ""}`}
              />
              {errors.email && (
                <p className="text-xs text-red-500 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {errors.email}
                </p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <Label htmlFor="user-password" className="text-xs font-medium">
                {editing ? "Password" : "Password"} {!editing && <span className="text-red-500">*</span>}
              </Label>
              <div className="relative">
                <Input
                  id="user-password"
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={(e) => { setForm({ ...form, password: e.target.value }); setErrors((p) => ({ ...p, password: undefined })); }}
                  placeholder={editing ? "Kosongkan jika tidak diubah" : "Minimal 6 karakter"}
                  className={`h-9 text-sm pr-9 ${errors.password ? "border-red-400 focus-visible:ring-red-400" : ""}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {editing && (
                <p className="text-[11px] text-gray-400">Kosongkan jika tidak ingin mengubah password</p>
              )}
              {errors.password && (
                <p className="text-xs text-red-500 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {errors.password}
                </p>
              )}
            </div>

            {/* Role */}
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Role</Label>
              <Select value={form.role} onValueChange={(v) => {
                setForm({ ...form, role: v, mitraId: v === "superadmin" ? "" : form.mitraId });
                setErrors((p) => ({ ...p, mitraId: undefined }));
              }}>
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="superadmin">Super Admin</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-[11px] text-gray-400">
                {form.role === "superadmin"
                  ? "Super Admin dapat mengakses semua data mitra"
                  : "Admin hanya bisa mengakses data mitra yang dipilih"}
              </p>
            </div>

            {/* Mitra — only shown for admin role */}
            {form.role === "admin" && (
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">
                  Mitra <span className="text-red-500">*</span>
                </Label>
                {mitraList.length === 0 ? (
                  <div className="rounded-md border border-dashed border-gray-300 px-3 py-6 text-center">
                    <Building2 className="w-6 h-6 mx-auto text-gray-300 mb-1" />
                    <p className="text-xs text-gray-400">Belum ada mitra. Tambahkan mitra terlebih dahulu.</p>
                  </div>
                ) : (
                  <>
                    <Select value={form.mitraId} onValueChange={(v) => {
                      setForm({ ...form, mitraId: v });
                      setErrors((p) => ({ ...p, mitraId: undefined }));
                    }}>
                      <SelectTrigger className={`h-9 text-sm ${errors.mitraId ? "border-red-400 focus-visible:ring-red-400" : ""}`}>
                        <SelectValue placeholder="Pilih mitra..." />
                      </SelectTrigger>
                      <SelectContent>
                        {mitraList.map((m) => (
                          <SelectItem key={m.id} value={m.id}>
                            <div className="flex items-center gap-2">
                              <Building2 className="w-3.5 h-3.5 text-gray-400" />
                              {m.name}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.mitraId && (
                      <p className="text-xs text-red-500 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" /> {errors.mitraId}
                      </p>
                    )}
                  </>
                )}
              </div>
            )}
          </div>

          <DialogFooter className="pt-0 gap-2">
            <Button variant="outline" onClick={() => setFormOpen(false)} className="h-8 text-sm">Batal</Button>
            <Button
              onClick={handleSave}
              disabled={saving || (form.role === "admin" && mitraList.length === 0 && !editing)}
              className="bg-red-600 hover:bg-red-700 text-white h-8 text-sm px-4"
            >
              {saving && <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />}
              {editing ? "Simpan" : "Tambah"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent className="sm:max-w-[360px]">
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus User</AlertDialogTitle>
            <AlertDialogDescription>
              Yakin ingin menghapus <strong>{deleting?.name}</strong> ({deleting?.email})? Tindakan ini tidak bisa dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel className="h-8 text-sm">Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={deletingLoading} className="bg-red-600 hover:bg-red-700 text-white h-8 text-sm">
              {deletingLoading && <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />}
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
