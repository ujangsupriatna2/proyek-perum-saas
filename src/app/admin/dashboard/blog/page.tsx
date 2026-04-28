"use client";

import { useEffect, useState, useCallback } from "react";
import { Plus, Pencil, Trash2, Search, FileText, Loader2, Eye, EyeOff, AlertCircle } from "lucide-react";
import ImageUpload from "@/components/admin/image-upload";
import RichEditor from "@/components/admin/rich-editor";
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

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
  author: string;
  image: string;
  published: boolean;
  readTime: string;
  createdAt: string;
}

const emptyForm = {
  title: "", slug: "", excerpt: "", content: "", category: "",
  author: `Admin`, image: "", published: false, readTime: "5 menit",
};

function generateSlug(title: string): string {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export default function BlogPage() {
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editing, setEditing] = useState<BlogPost | null>(null);
  const [deleting, setDeleting] = useState<BlogPost | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const fetchBlogs = useCallback(async () => {
    try {
      const q = search ? `?search=${encodeURIComponent(search)}` : "";
      const res = await fetch(`/api/admin/blogs${q}`);
      const data = await res.json();
      setBlogs(data.blogs || []);
    } catch { /* ignore */ }
    setLoading(false);
  }, [search]);

  useEffect(() => { fetchBlogs(); }, [fetchBlogs]);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setErrors({});
    setFormOpen(true);
  };

  const openEdit = (b: BlogPost) => {
    setEditing(b);
    setForm({
      title: b.title, slug: b.slug, excerpt: b.excerpt, content: b.content,
      category: b.category, author: b.author, image: b.image,
      published: b.published, readTime: b.readTime,
    });
    setErrors({});
    setFormOpen(true);
  };

  const openDelete = (b: BlogPost) => { setDeleting(b); setDeleteOpen(true); };

  const clearFieldError = (field: string) => {
    setErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const handleSave = async () => {
    const newErrors: Record<string, string> = {};
    if (!form.title.trim()) {
      newErrors.title = "Judul wajib diisi";
    }
    if (!form.category) {
      newErrors.category = "Kategori wajib diisi";
    }
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const slug = form.slug || generateSlug(form.title);
    setSaving(true);
    try {
      const url = editing ? `/api/admin/blogs/${editing.id}` : "/api/admin/blogs";
      const method = editing ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, slug }),
      });
      if (!res.ok) { const err = await res.json(); toast.error(err.error || "Gagal menyimpan"); return; }
      toast.success(editing ? "Blog berhasil diupdate" : "Blog berhasil ditambahkan");
      setFormOpen(false);
      fetchBlogs();
    } catch { toast.error("Terjadi kesalahan"); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!deleting) return;
    try {
      const res = await fetch(`/api/admin/blogs/${deleting.id}`, { method: "DELETE" });
      if (!res.ok) { toast.error("Gagal menghapus"); return; }
      toast.success("Blog berhasil dihapus");
      setDeleteOpen(false);
      fetchBlogs();
    } catch { toast.error("Terjadi kesalahan"); }
  };

  const formatDate = (d: string) => new Date(d).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Blog</h1>
          <p className="text-sm text-gray-500 mt-1">Kelola artikel blog</p>
        </div>
        <Button onClick={openCreate} className="bg-red-600 hover:bg-red-700 text-white gap-2">
          <Plus className="w-4 h-4" /> Tambah Artikel
        </Button>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input placeholder="Cari artikel..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
      </div>

      <Card className="border-0 shadow-sm">
        <CardContent className="p-0">
            <Table containerClassName="max-h-[calc(100vh-14rem)]">
              <TableHeader className="sticky top-0 z-10 bg-gray-50">
                <TableRow className="bg-gray-50">
                  <TableHead>Judul</TableHead>
                  <TableHead>Kategori</TableHead>
                  <TableHead>Author</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Tanggal</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading
                  ? Array.from({ length: 4 }).map((_, i) => (
                      <TableRow key={i}>
                        <TableCell><Skeleton className="h-4 w-48" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                        <TableCell><Skeleton className="h-5 w-16 rounded-full" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                        <TableCell><Skeleton className="h-8 w-16 ml-auto" /></TableCell>
                      </TableRow>
                    ))
                  : blogs.length === 0
                  ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-10 text-gray-400">
                          <FileText className="w-10 h-10 mx-auto mb-2 text-gray-300" />
                          {search ? "Tidak ada hasil" : "Belum ada artikel"}
                        </TableCell>
                      </TableRow>
                    )
                  : blogs.map((b) => (
                      <TableRow key={b.id} className="hover:bg-gray-50">
                        <TableCell>
                          <p className="font-medium text-gray-900">{b.title}</p>
                          <p className="text-xs text-gray-400">{b.readTime} baca</p>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs">{b.category}</Badge>
                        </TableCell>
                        <TableCell className="text-gray-500 text-sm">{b.author}</TableCell>
                        <TableCell>
                          <Badge className={b.published ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}>
                            {b.published ? (
                              <><Eye className="w-3 h-3 mr-1" />Tayang</>
                            ) : (
                              <><EyeOff className="w-3 h-3 mr-1" />Draft</>
                            )}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-gray-500 text-sm">{formatDate(b.createdAt)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button variant="ghost" size="icon" onClick={() => openEdit(b)} className="text-gray-400 hover:text-blue-600">
                              <Pencil className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => openDelete(b)} className="text-gray-400 hover:text-red-600">
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
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Artikel" : "Tambah Artikel Baru"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>
                Judul <span className="text-red-500">*</span>
              </Label>
              <Input
                value={form.title}
                onChange={(e) => {
                  setForm({ ...form, title: e.target.value, slug: generateSlug(e.target.value) });
                  clearFieldError("title");
                }}
                className={errors.title ? "border-red-400 focus-visible:ring-red-400" : ""}
              />
              {errors.title && (
                <p className="text-xs text-red-500 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {errors.title}
                </p>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Slug</Label>
                <Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>
                  Kategori <span className="text-red-500">*</span>
                </Label>
                <Select value={form.category} onValueChange={(v) => {
                  setForm({ ...form, category: v });
                  clearFieldError("category");
                }}>
                  <SelectTrigger className={errors.category ? "border-red-400 focus-visible:ring-red-400" : ""}>
                    <SelectValue placeholder="Pilih kategori" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Panduan">Panduan</SelectItem>
                    <SelectItem value="Keuangan">Keuangan</SelectItem>
                    <SelectItem value="Investasi">Investasi</SelectItem>
                    <SelectItem value="Tips">Tips</SelectItem>
                    <SelectItem value="Syariah">Syariah</SelectItem>
                    <SelectItem value="Lokasi">Lokasi</SelectItem>
                  </SelectContent>
                </Select>
                {errors.category && (
                  <p className="text-xs text-red-500 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {errors.category}
                  </p>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <Label>Excerpt</Label>
              <Textarea value={form.excerpt} onChange={(e) => setForm({ ...form, excerpt: e.target.value })} rows={2} />
            </div>
            <div className="space-y-2">
              <Label>Konten</Label>
              <RichEditor value={form.content} onChange={(v) => setForm({ ...form, content: v })} placeholder="Tulis konten artikel di sini..." />
            </div>
            <div className="space-y-2">
              <ImageUpload
                value={form.image}
                onChange={(url) => setForm({ ...form, image: url })}
                label="Gambar Artikel"
                maxImages={2}
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Author</Label>
                <Input value={form.author} onChange={(e) => setForm({ ...form, author: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Waktu Baca</Label>
                <Input value={form.readTime} onChange={(e) => setForm({ ...form, readTime: e.target.value })} placeholder="5 menit" />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Switch checked={form.published} onCheckedChange={(v) => setForm({ ...form, published: v })} />
              <Label>Tayang</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setFormOpen(false)}>Batal</Button>
            <Button onClick={handleSave} disabled={saving} className="bg-red-600 hover:bg-red-700 text-white">
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
            <AlertDialogTitle>Hapus Artikel</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus artikel <strong>{deleting?.title}</strong>?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700 text-white">Hapus</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
