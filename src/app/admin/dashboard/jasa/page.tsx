"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  Search,
  Wrench,
  Loader2,
  ImageIcon,
  AlertCircle,
  Star,
  Video,
} from "lucide-react";
import ImageUpload from "@/components/admin/image-upload";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

// ──── Constants ────
const SERVICE_CATEGORIES = [
  { value: "konstruksi", label: "Konstruksi Rumah" },
  { value: "renovasi", label: "Renovasi Rumah" },
  { value: "desain_arsitektur", label: "Desain Arsitektur" },
  { value: "desain_interior", label: "Desain Interior" },
  { value: "jasa_gambar", label: "Jasa Gambar / IMB" },
  { value: "pengecatan", label: "Pengecatan" },
  { value: "instalasi_listrik", label: "Instalasi Listrik" },
  { value: "instalasi_pipa", label: "Instalasi Pipa / Sanitasi" },
  { value: "taman_landscape", label: "Taman & Landscape" },
  { value: "konsultasi", label: "Konsultasi Bangunan" },
];

const CATEGORY_MAP: Record<string, string> = Object.fromEntries(
  SERVICE_CATEGORIES.map((c) => [c.value, c.label])
);

const PRICE_UNIT_MAP: Record<string, string> = {
  proyek: "Per Proyek",
  per_m2: "Per m²",
  per_bulan: "Per Bulan",
  jam: "Per Jam",
};

const STATUS_MAP = {
  published: { label: "Published", className: "bg-green-100 text-green-700" },
  draft: { label: "Draft", className: "bg-gray-100 text-gray-600" },
};

// ──── Types ────
interface Service {
  id: string;
  title: string;
  slug: string;
  description: string;
  category: string;
  price: number;
  priceUnit: string;
  image: string;
  images: string;
  features: string;
  duration: string;
  videoUrl: string;
  isPublished: boolean;
  isFeatured: boolean;
  sortOrder: number;
  createdAt: string;
}

interface FormState {
  title: string;
  slug: string;
  description: string;
  category: string;
  price: string;
  priceUnit: string;
  image: string;
  features: string;
  duration: string;
  videoUrl: string;
  isPublished: boolean;
  isFeatured: boolean;
  sortOrder: string;
}

const emptyForm: FormState = {
  title: "",
  slug: "",
  description: "",
  category: "",
  price: "",
  priceUnit: "proyek",
  image: "",
  features: "",
  duration: "",
  videoUrl: "",
  isPublished: false,
  isFeatured: false,
  sortOrder: "0",
};

// ──── Helpers ────
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function formatRupiah(amount: number): string {
  return new Intl.NumberFormat("id-ID").format(amount);
}

function parseFeaturesToCSV(s: string): string {
  try {
    const parsed = JSON.parse(s);
    if (Array.isArray(parsed)) return parsed.map(String).join(", ");
    if (typeof parsed === "string") return parsed;
    return "";
  } catch {
    return s || "";
  }
}

// ──── Main Page ────
export default function JasaPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editing, setEditing] = useState<Service | null>(null);
  const [deleting, setDeleting] = useState<Service | null>(null);
  const [deletingLoading, setDeletingLoading] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const fetchServices = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (categoryFilter) params.set("category", categoryFilter);
      const q = params.toString() ? `?${params.toString()}` : "";
      const res = await fetch(`/api/admin/jasa${q}`);
      const data = await res.json();
      setServices(data.services || []);
    } catch {
      /* ignore */
    }
    setLoading(false);
  }, [search, categoryFilter]);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setErrors({});
    setFormOpen(true);
  };

  const openEdit = (s: Service) => {
    setEditing(s);
    setForm({
      title: s.title,
      slug: s.slug,
      description: s.description || "",
      category: s.category,
      price: String(s.price),
      priceUnit: s.priceUnit || "proyek",
      image: s.image || "",
      features: parseFeaturesToCSV(s.features),
      duration: s.duration || "",
      videoUrl: s.videoUrl || "",
      isPublished: s.isPublished,
      isFeatured: s.isFeatured,
      sortOrder: String(s.sortOrder || 0),
    });
    setErrors({});
    setFormOpen(true);
  };

  const openDelete = (s: Service) => {
    setDeleting(s);
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

  const updateField = (field: keyof FormState, value: string | boolean) => {
    clearFieldError(field);
    if (field === "title") {
      setForm((prev) => ({
        ...prev,
        title: value as string,
        slug: generateSlug(value as string),
      }));
    } else {
      setForm((prev) => ({ ...prev, [field]: value }));
    }
  };

  const handleSave = async () => {
    const newErrors: Record<string, string> = {};
    if (!form.title.trim()) newErrors.title = "Nama jasa wajib diisi";
    if (!form.category) newErrors.category = "Kategori wajib diisi";

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    const slug = form.slug || generateSlug(form.title);
    const mainImage = form.image ? form.image.split(",").map((s) => s.trim()).filter(Boolean)[0] || "" : "";

    setSaving(true);
    try {
      const url = editing ? `/api/admin/jasa/${editing.id}` : "/api/admin/jasa";
      const method = editing ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title,
          slug,
          description: form.description,
          category: form.category,
          price: form.price || "0",
          priceUnit: form.priceUnit,
          image: mainImage,
          features: form.features,
          duration: form.duration,
          videoUrl: form.videoUrl,
          isPublished: form.isPublished,
          isFeatured: form.isFeatured,
          sortOrder: form.sortOrder,
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        toast.error(err.error || "Gagal menyimpan");
        return;
      }
      toast.success(editing ? "Jasa berhasil diupdate" : "Jasa berhasil ditambahkan");
      setFormOpen(false);
      fetchServices();
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
      const res = await fetch(`/api/admin/jasa/${deleting.id}`, { method: "DELETE" });
      if (!res.ok) {
        toast.error("Gagal menghapus");
        return;
      }
      toast.success("Jasa berhasil dihapus");
      setDeleteOpen(false);
      fetchServices();
    } catch {
      toast.error("Terjadi kesalahan");
    } finally {
      setDeletingLoading(false);
    }
  };

  const hasError = (field: string) => !!errors[field];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Jasa</h1>
          <p className="text-sm text-gray-500 mt-1">
            Kelola layanan jasa bangunan & konstruksi
          </p>
        </div>
        <Button
          onClick={openCreate}
          className="bg-red-600 hover:bg-red-700 text-white gap-2"
        >
          <Plus className="w-4 h-4" /> Tambah Jasa
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Cari jasa..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-full sm:w-56">
            <SelectValue placeholder="Semua Kategori" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">Semua Kategori</SelectItem>
            {SERVICE_CATEGORIES.map((c) => (
              <SelectItem key={c.value} value={c.value}>
                {c.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {(search || categoryFilter) && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSearch("");
              setCategoryFilter("");
            }}
            className="text-gray-500 hover:text-gray-700"
          >
            Reset Filter
          </Button>
        )}
      </div>

      {/* Table */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-0">
          <div className="max-h-[calc(100vh-14rem)] overflow-y-auto">
            <Table containerClassName="min-w-full">
              <TableHeader className="sticky top-0 z-10 bg-gray-50">
                <TableRow className="bg-gray-50">
                  <TableHead className="w-12">No</TableHead>
                  <TableHead>Nama</TableHead>
                  <TableHead>Kategori</TableHead>
                  <TableHead>Harga</TableHead>
                  <TableHead>Durasi</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading
                  ? Array.from({ length: 5 }).map((_, i) => (
                      <TableRow key={i}>
                        <TableCell><Skeleton className="h-4 w-6" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                        <TableCell><Skeleton className="h-5 w-20 rounded-full" /></TableCell>
                        <TableCell><Skeleton className="h-8 w-16 ml-auto" /></TableCell>
                      </TableRow>
                    ))
                  : services.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-10 text-gray-400">
                          <Wrench className="w-10 h-10 mx-auto mb-2 text-gray-300" />
                          {search || categoryFilter
                            ? "Tidak ada hasil"
                            : "Belum ada jasa"}
                        </TableCell>
                      </TableRow>
                    ) : (
                      services.map((s, idx) => {
                        const statusKey = s.isPublished ? "published" : "draft";
                        const st = STATUS_MAP[statusKey];
                        const catLabel = CATEGORY_MAP[s.category] || s.category;
                        const unitLabel = PRICE_UNIT_MAP[s.priceUnit] || s.priceUnit;
                        return (
                          <TableRow key={s.id} className="hover:bg-gray-50">
                            <TableCell className="text-xs text-gray-400">
                              {idx + 1}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                {s.image ? (
                                  <img
                                    src={s.image}
                                    alt=""
                                    className="w-10 h-10 rounded-lg object-cover bg-gray-100"
                                  />
                                ) : (
                                  <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                                    <ImageIcon className="w-4 h-4 text-gray-400" />
                                  </div>
                                )}
                                <div>
                                  <div className="flex items-center gap-1.5">
                                    {s.isFeatured && (
                                      <Star className="w-3 h-3 text-amber-500 fill-amber-500 shrink-0" />
                                    )}
                                    {s.videoUrl && (
                                      <Video className="w-3 h-3 text-red-500 shrink-0" />
                                    )}
                                    <p className="font-medium text-sm">{s.title}</p>
                                  </div>
                                  <span className="text-[11px] text-gray-400">{s.slug}</span>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className="text-xs">
                                {catLabel}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div>
                                <p className="font-semibold text-gray-800 text-sm">
                                  Rp {formatRupiah(s.price)}
                                </p>
                                <p className="text-[11px] text-gray-400">{unitLabel}</p>
                              </div>
                            </TableCell>
                            <TableCell className="text-gray-500 text-sm">
                              {s.duration || "-"}
                            </TableCell>
                            <TableCell>
                              <Badge className={st.className}>{st.label}</Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-1">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => openEdit(s)}
                                  className="text-gray-400 hover:text-red-600"
                                >
                                  <Pencil className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => openDelete(s)}
                                  className="text-gray-400 hover:text-red-600"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Jasa" : "Tambah Jasa Baru"}</DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-2">
            {/* Title */}
            <div className="space-y-2 sm:col-span-2">
              <Label className="flex items-center gap-0.5">
                Nama Jasa <span className="text-red-500">*</span>
              </Label>
              <Input
                value={form.title}
                onChange={(e) => updateField("title", e.target.value)}
                placeholder="Konstruksi Rumah 2 Lantai"
                className={
                  hasError("title")
                    ? "border-red-400 focus-visible:ring-red-400"
                    : ""
                }
              />
              {errors.title && (
                <p className="text-xs text-red-500 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {errors.title}
                </p>
              )}
              <p className="text-[11px] text-gray-400">
                Slug: <code className="bg-gray-100 px-1.5 py-0.5 rounded">{form.slug || "..."}</code>
              </p>
            </div>

            {/* Category */}
            <div className="space-y-2">
              <Label className="flex items-center gap-0.5">
                Kategori <span className="text-red-500">*</span>
              </Label>
              <Select
                value={form.category}
                onValueChange={(v) => {
                  clearFieldError("category");
                  setForm({ ...form, category: v });
                }}
              >
                <SelectTrigger
                  className={hasError("category") ? "border-red-400 focus:ring-red-400" : ""}
                >
                  <SelectValue placeholder="Pilih kategori..." />
                </SelectTrigger>
                <SelectContent>
                  {SERVICE_CATEGORIES.map((c) => (
                    <SelectItem key={c.value} value={c.value}>
                      {c.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.category && (
                <p className="text-xs text-red-500 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {errors.category}
                </p>
              )}
            </div>

            {/* Price + Unit */}
            <div className="space-y-2">
              <Label>Harga (Rp)</Label>
              <div className="flex gap-2">
                <div className="flex-1 space-y-1">
                  <Input
                    type="text"
                    inputMode="numeric"
                    value={form.price}
                    onChange={(e) => {
                      clearFieldError("price");
                      // Allow only digits
                      const raw = e.target.value.replace(/\D/g, "");
                      setForm({ ...form, price: raw });
                    }}
                    placeholder="600000"
                    className={hasError("price") ? "border-red-400 focus-visible:ring-red-400" : ""}
                  />
                  {form.price && (
                    <p className="text-xs text-gray-500 font-medium">
                      ≈ Rp {formatRupiah(parseInt(form.price) || 0)}
                    </p>
                  )}
                </div>
                <Select
                  value={form.priceUnit}
                  onValueChange={(v) => setForm({ ...form, priceUnit: v })}
                >
                  <SelectTrigger className="w-36">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="proyek">Per Proyek</SelectItem>
                    <SelectItem value="per_m2">Per m²</SelectItem>
                    <SelectItem value="per_bulan">Per Bulan</SelectItem>
                    <SelectItem value="jam">Per Jam</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <p className="text-[11px] text-gray-400">
                Ketik angka saja, contoh: 600000 atau 2500000
              </p>
            </div>

            {/* Duration */}
            <div className="space-y-2">
              <Label>Estimasi Durasi</Label>
              <Input
                value={form.duration}
                onChange={(e) => setForm({ ...form, duration: e.target.value })}
                placeholder="3-6 bulan"
              />
              <p className="text-[11px] text-gray-400">
                Contoh: &quot;3-6 bulan&quot;, &quot;2-4 minggu&quot;, &quot;1 bulan&quot;
              </p>
            </div>

            {/* Video URL */}
            <div className="space-y-2">
              <Label className="flex items-center gap-1.5">
                <Video className="w-3.5 h-3.5" />
                Link Video YouTube
              </Label>
              <Input
                value={form.videoUrl}
                onChange={(e) => setForm({ ...form, videoUrl: e.target.value })}
                placeholder="https://youtube.com/watch?v=..."
              />
              <p className="text-[11px] text-gray-400">
                Paste link YouTube untuk video preview jasa
              </p>
            </div>

            {/* Description */}
            <div className="space-y-2 sm:col-span-2">
              <Label>Deskripsi</Label>
              <textarea
                className="w-full min-h-[120px] rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/20 focus:border-gray-400 resize-y transition-all"
                placeholder="Deskripsi singkat layanan jasa..."
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>

            {/* Image Upload */}
            <div className="space-y-2 sm:col-span-2">
              <ImageUpload
                value={form.image}
                onChange={(v) => setForm({ ...form, image: v })}
                label="Gambar Jasa"
                maxImages={1}
              />
            </div>

            {/* Features */}
            <div className="space-y-2 sm:col-span-2">
              <Label>Fitur / Keunggulan</Label>
              <Input
                value={form.features}
                onChange={(e) => setForm({ ...form, features: e.target.value })}
                placeholder="Free konsultasi, Garansi 1 tahun, Material premium"
              />
              <p className="text-[11px] text-gray-400">
                Pisahkan dengan koma. Contoh: &quot;Free konsultasi, Garansi 1 tahun, Survey gratis&quot;
              </p>
            </div>

            {/* Sort Order */}
            <div className="space-y-2">
              <Label>Urutan Tampil</Label>
              <Input
                type="number"
                value={form.sortOrder}
                onChange={(e) => setForm({ ...form, sortOrder: e.target.value })}
                placeholder="0"
              />
              <p className="text-[11px] text-gray-400">
                Semakin kecil angka, semakin di atas
              </p>
            </div>

            {/* Switches */}
            <div className="space-y-4 flex flex-col justify-end">
              <div className="flex items-center justify-between rounded-lg border p-3">
                <div>
                  <Label className="text-sm font-medium">Published</Label>
                  <p className="text-[11px] text-gray-400">Tampilkan di website</p>
                </div>
                <Switch
                  checked={form.isPublished}
                  onCheckedChange={(v) => updateField("isPublished", v)}
                />
              </div>
              <div className="flex items-center justify-between rounded-lg border p-3">
                <div>
                  <Label className="text-sm font-medium">Featured</Label>
                  <p className="text-[11px] text-gray-400">Tampilkan sebagai unggulan</p>
                </div>
                <Switch
                  checked={form.isFeatured}
                  onCheckedChange={(v) => updateField("isFeatured", v)}
                />
              </div>
            </div>
          </div>

          <DialogFooter>
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
              {editing ? "Update" : "Simpan"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Jasa</AlertDialogTitle>
            <AlertDialogDescription>
              Yakin ingin menghapus jasa &quot;{deleting?.title}&quot;? Tindakan ini tidak
              dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deletingLoading}>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deletingLoading}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {deletingLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
