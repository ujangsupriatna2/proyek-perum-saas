"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { Plus, Pencil, Trash2, MessageSquare, Loader2, Star, AlertCircle, Handshake } from "lucide-react";
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

interface Testimonial {
  id: string;
  name: string;
  role: string;
  text: string;
  rating: number;
  featured: boolean;
  createdAt: string;
}

const emptyForm = { name: "", role: "", text: "", rating: "5", featured: false, mitraId: "" };

function StarDisplay({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          className={`w-4 h-4 ${s <= rating ? "text-amber-400 fill-amber-400" : "text-gray-200"}`}
        />
      ))}
    </div>
  );
}

export default function TestimoniPage() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editing, setEditing] = useState<Testimonial | null>(null);
  const [deleting, setDeleting] = useState<Testimonial | null>(null);
  const [deletingLoading, setDeletingLoading] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { data: session } = useSession();
  const role = (session?.user as { role?: string })?.role;
  const superAdmin = role === "superadmin";
  const [mitraList, setMitraList] = useState<{ id: string; name: string }[]>([]);

  // Fetch mitra list (only for superadmin)
  useEffect(() => {
    if (!superAdmin) return;
    fetch("/api/admin/mitra")
      .then(r => r.json())
      .then(data => setMitraList(Array.isArray(data) ? data : []))
      .catch(() => {});
  }, [superAdmin]);

  const fetchTestimonials = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/testimonials");
      const data = await res.json();
      setTestimonials(data.testimonials || []);
    } catch { /* ignore */ }
    setLoading(false);
  }, []);

  useEffect(() => { fetchTestimonials(); }, [fetchTestimonials]);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setErrors({});
    setFormOpen(true);
  };

  const openEdit = (t: Testimonial) => {
    setEditing(t);
    setForm({ name: t.name, role: t.role, text: t.text, rating: String(t.rating), featured: t.featured, mitraId: (t as any).mitraId || "" });
    setErrors({});
    setFormOpen(true);
  };

  const openDelete = (t: Testimonial) => { setDeleting(t); setDeleteOpen(true); };

  const handleFieldChange = (field: string, value: string | boolean) => {
    setForm({ ...form, [field]: value });
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const handleSave = async () => {
    const newErrors: Record<string, string> = {};
    if (!form.name.trim()) newErrors.name = "Nama wajib diisi";
    if (!form.text.trim()) newErrors.text = "Testimoni wajib diisi";
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setSaving(true);
    try {
      const url = editing ? `/api/admin/testimonials/${editing.id}` : "/api/admin/testimonials";
      const method = editing ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) { toast.error("Gagal menyimpan"); return; }
      toast.success(editing ? "Testimoni berhasil diupdate" : "Testimoni berhasil ditambahkan");
      setFormOpen(false);
      fetchTestimonials();
    } catch { toast.error("Terjadi kesalahan"); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!deleting) return;
    setDeletingLoading(true);
    try {
      const res = await fetch(`/api/admin/testimonials/${deleting.id}`, { method: "DELETE" });
      if (!res.ok) { toast.error("Gagal menghapus"); return; }
      toast.success("Testimoni berhasil dihapus");
      setDeleteOpen(false);
      fetchTestimonials();
    } catch { toast.error("Terjadi kesalahan"); }
    finally { setDeletingLoading(false); }
  };

  const formatDate = (d: string) => new Date(d).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Testimoni</h1>
          <p className="text-sm text-gray-500 mt-1">Kelola testimoni pelanggan</p>
        </div>
        <Button onClick={openCreate} className="bg-gray-900 hover:bg-gray-800 text-white gap-2">
          <Plus className="w-4 h-4" /> Tambah Testimoni
        </Button>
      </div>

      <Card className="border-0 shadow-sm">
        <CardContent className="p-0">
            <Table containerClassName="max-h-[calc(100vh-14rem)]">
              <TableHeader className="sticky top-0 z-10 bg-gray-50">
                <TableRow className="bg-gray-50">
                  <TableHead className="w-12">No</TableHead>
                  {superAdmin && <TableHead>Mitra</TableHead>}
                  <TableHead>Nama</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead>Testimoni</TableHead>
                  <TableHead>Unggulan</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading
                  ? Array.from({ length: 4 }).map((_, i) => (
                      <TableRow key={i}>
                        <TableCell><Skeleton className="h-4 w-6" /></TableCell>
                        {superAdmin && <TableCell><Skeleton className="h-4 w-20" /></TableCell>}
                        <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-48" /></TableCell>
                        <TableCell><Skeleton className="h-5 w-10" /></TableCell>
                        <TableCell><Skeleton className="h-8 w-16 ml-auto" /></TableCell>
                      </TableRow>
                    ))
                  : testimonials.length === 0
                  ? (
                      <TableRow>
                        <TableCell colSpan={superAdmin ? 8 : 7} className="text-center py-10 text-gray-400">
                          <MessageSquare className="w-10 h-10 mx-auto mb-2 text-gray-300" />
                          Belum ada testimoni
                        </TableCell>
                      </TableRow>
                    )
                  : testimonials.map((t, idx) => (
                      <TableRow key={t.id} className="hover:bg-gray-50">
                        <TableCell className="text-xs text-gray-400">{idx + 1}</TableCell>
                        {superAdmin && (
                          <TableCell>
                            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-md">{(t as any).mitra?.name || "-"}</span>
                          </TableCell>
                        )}
                        <TableCell className="font-medium">{t.name}</TableCell>
                        <TableCell className="text-gray-500 text-sm">{t.role}</TableCell>
                        <TableCell><StarDisplay rating={t.rating} /></TableCell>
                        <TableCell className="text-gray-600 text-sm max-w-xs truncate">{t.text}</TableCell>
                        <TableCell>
                          <Badge className={t.featured ? "bg-amber-100 text-amber-700" : "bg-gray-100 text-gray-400"}>
                            {t.featured ? "Ya" : "Tidak"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button variant="ghost" size="icon" onClick={() => openEdit(t)} className="text-gray-400 hover:text-blue-600">
                              <Pencil className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => openDelete(t)} className="text-gray-400 hover:text-gray-700">
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

      {/* Form Dialog */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Testimoni" : "Tambah Testimoni Baru"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            {/* Mitra selector — superadmin only */}
            {superAdmin && (
              <div className="space-y-2">
                <Label className="flex items-center gap-1.5">
                  <Handshake className="w-3.5 h-3.5" />
                  Mitra
                </Label>
                <Select value={form.mitraId || ""} onValueChange={(v) => setForm({ ...form, mitraId: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih mitra..." />
                  </SelectTrigger>
                  <SelectContent>
                    {mitraList.map(m => (
                      <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-[11px] text-gray-400">Pilih mitra untuk data ini. Kosongkan jika tanpa mitra.</p>
              </div>
            )}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>
                  Nama <span className="text-gray-700">*</span>
                </Label>
                <Input
                  value={form.name}
                  onChange={(e) => handleFieldChange("name", e.target.value)}
                  className={errors.name ? "border-gray-400 focus-visible:ring-gray-400" : ""}
                />
                {errors.name && (
                  <p className="text-xs text-gray-700 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {errors.name}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label>Role / Profesi</Label>
                <Input
                  value={form.role}
                  onChange={(e) => handleFieldChange("role", e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>
                Testimoni <span className="text-gray-700">*</span>
              </Label>
              <Textarea
                value={form.text}
                onChange={(e) => handleFieldChange("text", e.target.value)}
                rows={4}
                className={errors.text ? "border-gray-400 focus-visible:ring-gray-400" : ""}
              />
              {errors.text && (
                <p className="text-xs text-gray-700 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {errors.text}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label>Rating</Label>
              <Select value={form.rating} onValueChange={(v) => setForm({ ...form, rating: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5].map((r) => (
                    <SelectItem key={r} value={String(r)}>{r} Bintang</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-3">
              <Switch checked={form.featured} onCheckedChange={(v) => setForm({ ...form, featured: v })} />
              <Label>Tampilkan sebagai unggulan</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setFormOpen(false)}>Batal</Button>
            <Button onClick={handleSave} disabled={saving} className="bg-gray-900 hover:bg-gray-800 text-white">
              {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {editing ? "Simpan" : "Tambah"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Testimoni</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus testimoni dari <strong>{deleting?.name}</strong>?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={deletingLoading} className="bg-gray-900 hover:bg-gray-800 text-white">
              {deletingLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
