"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  Search,
  Building2,
  Globe,
  ImageIcon,
  AlertCircle,
  Mail,
  Phone,
  MapPin,
  Users,
  Home,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// ──── Types ────
interface Mitra {
  id: string;
  name: string;
  slug: string;
  subdomain: string;
  logo: string;
  description: string;
  address: string;
  phone: string;
  email: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  _count?: {
    properties: number;
    admins: number;
  };
}

interface FormState {
  name: string;
  slug: string;
  subdomain: string;
  logo: string;
  description: string;
  address: string;
  phone: string;
  email: string;
  isActive: boolean;
}

const emptyForm: FormState = {
  name: "",
  slug: "",
  subdomain: "",
  logo: "",
  description: "",
  address: "",
  phone: "",
  email: "",
  isActive: true,
};

// ──── Helpers ────
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function generateSubdomain(slug: string): string {
  return slug.replace(/-/g, "");
}

function formatDate(dateStr: string): string {
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(dateStr));
}

// ──── Main Page ────
export default function MitraPage() {
  const [mitras, setMitras] = useState<Mitra[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editing, setEditing] = useState<Mitra | null>(null);
  const [deleting, setDeleting] = useState<Mitra | null>(null);
  const [deletingLoading, setDeletingLoading] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const fetchMitras = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/mitra");
      const data = await res.json();
      setMitras(data.mitras || []);
    } catch {
      /* ignore */
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchMitras();
  }, [fetchMitras]);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setErrors({});
    setFormOpen(true);
  };

  const openEdit = (m: Mitra) => {
    setEditing(m);
    setForm({
      name: m.name,
      slug: m.slug,
      subdomain: m.subdomain,
      logo: m.logo || "",
      description: m.description || "",
      address: m.address || "",
      phone: m.phone || "",
      email: m.email || "",
      isActive: m.isActive,
    });
    setErrors({});
    setFormOpen(true);
  };

  const openDelete = (m: Mitra) => {
    setDeleting(m);
    setDeleteOpen(true);
  };

  const clearFieldError = (field: string) => {
    setErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const updateName = (value: string) => {
    clearFieldError("name");
    const slug = generateSlug(value);
    const subdomain = generateSubdomain(slug);
    setForm((prev) => ({
      ...prev,
      name: value,
      slug: editing ? prev.slug : slug,
      subdomain: editing ? prev.subdomain : subdomain,
    }));
  };

  const handleSave = async () => {
    const newErrors: Record<string, string> = {};
    if (!form.name.trim()) newErrors.name = "Nama mitra wajib diisi";
    if (!form.slug.trim()) newErrors.slug = "Slug wajib diisi";
    if (!form.subdomain.trim()) newErrors.subdomain = "Subdomain wajib diisi";
    if (form.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = "Format email tidak valid";
    }

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setSaving(true);
    try {
      const url = editing
        ? `/api/admin/mitra/${editing.id}`
        : "/api/admin/mitra";
      const method = editing ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const err = await res.json();
        toast.error(err.error || "Gagal menyimpan");
        return;
      }
      toast.success(
        editing ? "Mitra berhasil diupdate" : "Mitra berhasil ditambahkan"
      );
      setFormOpen(false);
      fetchMitras();
    } catch {
      toast.error("Terjadi kesalahan");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleting) return;
    setDeletingLoading(true);
    try {
      const res = await fetch(`/api/admin/mitra/${deleting.id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const err = await res.json();
        toast.error(err.error || "Gagal menghapus");
        return;
      }
      toast.success("Mitra berhasil dihapus");
      setDeleteOpen(false);
      fetchMitras();
    } catch {
      toast.error("Terjadi kesalahan");
    } finally {
      setDeletingLoading(false);
    }
  };

  const hasError = (field: string) => !!errors[field];

  const filteredMitras = mitras.filter(
    (m) =>
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.slug.toLowerCase().includes(search.toLowerCase()) ||
      m.subdomain.toLowerCase().includes(search.toLowerCase()) ||
      m.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mitra</h1>
          <p className="text-sm text-gray-500 mt-1">
            Kelola mitra partner properti
          </p>
        </div>
        <Button
          onClick={openCreate}
          className="bg-red-600 hover:bg-red-700 text-white gap-2"
        >
          <Plus className="w-4 h-4" /> Tambah Mitra
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input
          placeholder="Cari mitra..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Table */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="sticky top-0 z-10 bg-gray-50">
                <TableRow className="bg-gray-50">
                  <TableHead className="w-10">No</TableHead>
                  <TableHead className="w-12">Logo</TableHead>
                  <TableHead>Nama</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead>Subdomain</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-center">Properti</TableHead>
                  <TableHead className="text-center">Admin</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading
                  ? Array.from({ length: 4 }).map((_, i) => (
                      <TableRow key={i}>
                        <TableCell>
                          <Skeleton className="h-4 w-6" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-10 w-10 rounded-lg" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-4 w-36" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-4 w-28" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-4 w-24" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-4 w-32" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-5 w-16 rounded-full" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-4 w-8 mx-auto" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-4 w-8 mx-auto" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-8 w-16 ml-auto" />
                        </TableCell>
                      </TableRow>
                    ))
                  : filteredMitras.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={10}
                          className="text-center py-10 text-gray-400"
                        >
                          <Building2 className="w-10 h-10 mx-auto mb-2 text-gray-300" />
                          {search
                            ? "Tidak ada hasil"
                            : "Belum ada mitra"}
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredMitras.map((m, idx) => (
                        <TableRow key={m.id} className="hover:bg-gray-50">
                          <TableCell className="text-gray-400 text-sm">
                            {idx + 1}
                          </TableCell>
                          <TableCell>
                            {m.logo ? (
                              <img
                                src={m.logo}
                                alt={m.name}
                                className="w-10 h-10 rounded-lg object-cover bg-gray-100 border border-gray-100"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                                <Building2 className="w-4 h-4 text-gray-400" />
                              </div>
                            )}
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium text-sm">{m.name}</p>
                              <p className="text-[11px] text-gray-400 mt-0.5">
                                {formatDate(m.createdAt)}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <code className="text-xs bg-gray-100 px-2 py-0.5 rounded text-gray-600">
                              {m.slug}
                            </code>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1.5">
                              <Globe className="w-3.5 h-3.5 text-gray-400" />
                              <code className="text-xs bg-gray-100 px-2 py-0.5 rounded text-gray-600">
                                {m.subdomain}
                              </code>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1.5 text-sm text-gray-500">
                              <Mail className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                              <span className="truncate max-w-[160px]">
                                {m.email || "—"}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge
                              className={
                                m.isActive
                                  ? "bg-green-100 text-green-700 hover:bg-green-100"
                                  : "bg-gray-100 text-gray-500 hover:bg-gray-100"
                              }
                            >
                              {m.isActive ? "Aktif" : "Nonaktif"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-center">
                            <div className="flex items-center justify-center gap-1 text-sm text-gray-600">
                              <Home className="w-3.5 h-3.5 text-gray-400" />
                              <span className="font-medium">
                                {m._count?.properties ?? 0}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="text-center">
                            <div className="flex items-center justify-center gap-1 text-sm text-gray-600">
                              <Users className="w-3.5 h-3.5 text-gray-400" />
                              <span className="font-medium">
                                {m._count?.admins ?? 0}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => openEdit(m)}
                                className="text-gray-400 hover:text-red-600"
                                title="Edit"
                              >
                                <Pencil className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => openDelete(m)}
                                className="text-gray-400 hover:text-red-600"
                                title="Hapus"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editing ? "Edit Mitra" : "Tambah Mitra Baru"}
            </DialogTitle>
            <DialogDescription>
              {editing
                ? "Ubah informasi mitra partner properti."
                : "Isi data mitra partner properti baru."}
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-2">
            {/* Name */}
            <div className="space-y-2">
              <Label className="flex items-center gap-0.5">
                Nama Mitra <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  value={form.name}
                  onChange={(e) => updateName(e.target.value)}
                  placeholder="Bandung Raya Residence"
                  className={`pl-9 ${hasError("name") ? "border-red-400 focus-visible:ring-red-400" : ""}`}
                />
              </div>
              {errors.name && (
                <p className="text-xs text-red-500 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {errors.name}
                </p>
              )}
            </div>

            {/* Slug */}
            <div className="space-y-2">
              <Label className="flex items-center gap-0.5">
                Slug <span className="text-red-500">*</span>
                {!editing && (
                  <span className="text-[10px] text-gray-400 font-normal ml-1">
                    (otomatis)
                  </span>
                )}
              </Label>
              <div className="relative">
                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  value={form.slug}
                  onChange={(e) => {
                    clearFieldError("slug");
                    const slug = e.target.value
                      .toLowerCase()
                      .replace(/[^a-z0-9-]+/g, "-")
                      .replace(/^-|-$/g, "");
                    const subdomain = generateSubdomain(slug);
                    setForm((prev) => ({
                      ...prev,
                      slug,
                      subdomain: editing ? prev.subdomain : subdomain,
                    }));
                  }}
                  placeholder="bandung-raya-residence"
                  className={`pl-9 ${hasError("slug") ? "border-red-400 focus-visible:ring-red-400" : ""}`}
                />
              </div>
              {errors.slug && (
                <p className="text-xs text-red-500 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {errors.slug}
                </p>
              )}
            </div>

            {/* Subdomain */}
            <div className="space-y-2">
              <Label className="flex items-center gap-0.5">
                Subdomain <span className="text-red-500">*</span>
                {!editing && (
                  <span className="text-[10px] text-gray-400 font-normal ml-1">
                    (otomatis)
                  </span>
                )}
              </Label>
              <div className="relative">
                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  value={form.subdomain}
                  onChange={(e) => {
                    clearFieldError("subdomain");
                    const val = e.target.value
                      .toLowerCase()
                      .replace(/[^a-z0-9]+/g, "");
                    setForm((prev) => ({ ...prev, subdomain: val }));
                  }}
                  placeholder="bandungrayaresidence"
                  className={`pl-9 ${hasError("subdomain") ? "border-red-400 focus-visible:ring-red-400" : ""}`}
                />
              </div>
              {errors.subdomain && (
                <p className="text-xs text-red-500 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {errors.subdomain}
                </p>
              )}
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label>Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  type="email"
                  value={form.email}
                  onChange={(e) => {
                    clearFieldError("email");
                    setForm((prev) => ({ ...prev, email: e.target.value }));
                  }}
                  placeholder="info@bandungraya.id"
                  className={`pl-9 ${hasError("email") ? "border-red-400 focus-visible:ring-red-400" : ""}`}
                />
              </div>
              {errors.email && (
                <p className="text-xs text-red-500 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {errors.email}
                </p>
              )}
            </div>

            {/* Phone */}
            <div className="space-y-2">
              <Label>Telepon</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  value={form.phone}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, phone: e.target.value }))
                  }
                  placeholder="0812-3456-7890"
                  className="pl-9"
                />
              </div>
            </div>

            {/* Logo URL */}
            <div className="space-y-2">
              <Label>Logo URL</Label>
              <div className="relative">
                <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  value={form.logo}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, logo: e.target.value }))
                  }
                  placeholder="https://example.com/logo.png"
                  className="pl-9"
                />
              </div>
            </div>

            {/* Address - full width */}
            <div className="space-y-2 sm:col-span-2">
              <Label>Alamat</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <Textarea
                  value={form.address}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, address: e.target.value }))
                  }
                  placeholder="Jl. Raya Bandung No. 123, Bandung"
                  rows={2}
                  className="pl-9"
                />
              </div>
            </div>

            {/* Description - full width */}
            <div className="space-y-2 sm:col-span-2">
              <Label>Deskripsi</Label>
              <Textarea
                value={form.description}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                placeholder="Deskripsi singkat tentang mitra..."
                rows={3}
              />
            </div>

            {/* Active switch */}
            <div className="sm:col-span-2 flex items-center justify-between rounded-lg border border-gray-200 p-3">
              <div>
                <Label className="text-sm font-medium">Status Aktif</Label>
                <p className="text-xs text-gray-400 mt-0.5">
                  Mitra aktif akan ditampilkan di platform
                </p>
              </div>
              <Switch
                checked={form.isActive}
                onCheckedChange={(checked) =>
                  setForm((prev) => ({ ...prev, isActive: checked }))
                }
              />
            </div>

            {/* Logo Preview */}
            {form.logo && (
              <div className="sm:col-span-2">
                <Label className="text-xs text-gray-500 mb-2 block">
                  Preview Logo
                </Label>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <img
                    src={form.logo}
                    alt="Logo preview"
                    className="w-12 h-12 rounded-lg object-contain bg-white border border-gray-200"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                  <p className="text-xs text-gray-500 truncate max-w-[300px]">
                    {form.logo}
                  </p>
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setFormOpen(false)}
              disabled={saving}
            >
              Batal
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving}
              className="bg-red-600 hover:bg-red-700 text-white gap-2"
            >
              {saving && <Loader2 className="w-4 h-4 animate-spin" />}
              {editing ? "Simpan Perubahan" : "Tambah Mitra"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Mitra?</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus mitra{" "}
              <strong className="text-gray-900">{deleting?.name}</strong>? Semua
              data terkait (properti, admin, blog, testimoni, gallery, bank,
              pengaturan) akan ikut terhapus.
            </AlertDialogDescription>
          </AlertDialogHeader>
          {deleting &&
            (deleting._count?.properties ?? 0) > 0 && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-800">
                <p className="font-medium flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4" /> Tidak dapat menghapus
                </p>
                <p className="text-xs mt-1">
                  Mitra ini memiliki{" "}
                  <strong>{deleting._count?.properties} properti</strong> dan{" "}
                  <strong>{deleting._count?.admins} admin</strong> yang
                  terkait. Hapus atau pindahkan data tersebut terlebih dahulu.
                </p>
              </div>
            )}
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deletingLoading}>
              Batal
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleDelete();
              }}
              disabled={
                deletingLoading ||
                (deleting && (deleting._count?.properties ?? 0) > 0)
              }
              className="bg-red-600 hover:bg-red-700 text-white focus:ring-red-600"
            >
              {deletingLoading && (
                <Loader2 className="w-4 h-4 animate-spin mr-1" />
              )}
              Hapus Mitra
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
