"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { Save, Loader2, Settings as SettingsIcon, Phone, Globe, AlertCircle, MapPin, Building2, ImagePlus, X, Upload } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";

const IMAGE_KEYS = ["hero_bg_image", "location_bg_image"];

const SETTINGS_GROUPS: { title: string; group: string; icon: React.ElementType; fields: { key: string; label: string; type?: "text" | "textarea" | "url" | "number" | "image"; placeholder?: string }[] }[] = [
  {
    title: "Perusahaan",
    group: "company",
    icon: Building2,
    fields: [
      { key: "company_name", label: "Nama Perusahaan", placeholder: "Bandung Raya Residence" },
      { key: "total_units_sold", label: "Total Unit Terjual", placeholder: "500" },
      { key: "company_legal_name", label: "Nama PT / Badan Hukum", placeholder: "PT Bumi Sanggar Meubel" },
      { key: "logo_url", label: "Logo Perusahaan", type: "image" },
      { key: "hero_bg_image", label: "Gambar Header / Hero", type: "image" },
      { key: "location_bg_image", label: "Gambar Lokasi Strategis", type: "image" },
      { key: "page_banner_image", label: "Gambar Banner Halaman (Tentang Kami, Kontak, dll)", type: "image" },
      { key: "tentangkami_image", label: "Gambar Tentang Kami (Samping Nama PT)", type: "image" },
    ],
  },
  {
    title: "Kontak",
    group: "contact",
    icon: Phone,
    fields: [
      { key: "contact_phone", label: "No. Telepon", placeholder: "0812-8965-6707" },
      { key: "contact_email", label: "Email", placeholder: "info@brr.co.id" },
      { key: "contact_wa", label: "No. WhatsApp", placeholder: "6281289656707" },
      { key: "contact_address", label: "Alamat", type: "textarea", placeholder: "Bandung, Jawa Barat" },
      { key: "contact_person", label: "Nama Kontak Person", placeholder: "Fadhil BSM" },
    ],
  },
  {
    title: "Peta / Lokasi",
    group: "map",
    icon: MapPin,
    fields: [
      { key: "map_latitude", label: "Latitude", type: "number", placeholder: "-6.9204" },
      { key: "map_longitude", label: "Longitude", type: "number", placeholder: "107.7518" },
    ],
  },
  {
    title: "Media Sosial",
    group: "social",
    icon: Globe,
    fields: [
      { key: "social_instagram", label: "Instagram (username tanpa @)", placeholder: "bandung.raya.residence" },
      { key: "social_facebook", label: "Facebook URL", type: "url", placeholder: "https://facebook.com/..." },
      { key: "social_youtube", label: "YouTube URL", type: "url", placeholder: "https://youtube.com/..." },
      { key: "social_tiktok", label: "TikTok URL", type: "url", placeholder: "https://tiktok.com/..." },
    ],
  },
];

function ImageUploadField({ fieldKey, label, value, onChange }: {
  fieldKey: string; label: string; value: string; onChange: (key: string, val: string) => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("File harus berupa gambar");
      return;
    }
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error || "Upload gagal"); return; }
      onChange(fieldKey, data.url);
      toast.success("Gambar berhasil diupload");
    } catch {
      toast.error("Gagal mengupload gambar");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const handleRemove = () => {
    onChange(fieldKey, "");
  };

  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium text-gray-700">{label}</Label>
      <input ref={fileRef} type="file" accept="image/*" onChange={handleUpload} className="hidden" />
      {value ? (
        <div className="relative group rounded-xl overflow-hidden border border-gray-200">
          <img src={value} alt={label} className="w-full h-40 object-cover" />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              className="gap-1.5"
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
            >
              {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
              Ganti
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              className="gap-1.5"
              onClick={handleRemove}
            >
              <X className="w-3.5 h-3.5" />
              Hapus
            </Button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="w-full h-40 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center gap-2 text-gray-400 hover:border-red-400 hover:text-red-500 transition-colors cursor-pointer disabled:opacity-50"
        >
          {uploading ? (
            <Loader2 className="w-8 h-8 animate-spin" />
          ) : (
            <>
              <ImagePlus className="w-8 h-8" />
              <span className="text-sm font-medium">Klik untuk upload gambar</span>
              <span className="text-xs text-gray-400">JPG, PNG, WebP (max 300KB)</span>
            </>
          )}
        </button>
      )}
    </div>
  );
}

export default function PengaturanPage() {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchSettings = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/settings");
      const data = await res.json();
      setSettings(data);
    } catch { /* ignore */ }
    setLoading(false);
  }, []);

  useEffect(() => { fetchSettings(); }, [fetchSettings]);

  const REQUIRED_KEYS = ["company_name", "contact_phone", "contact_wa", "contact_email"];
  const EMAIL_KEYS = ["contact_email"];

  const validate = (): Record<string, string> => {
    const newErrors: Record<string, string> = {};
    for (const key of REQUIRED_KEYS) {
      if (!settings[key]?.trim()) {
        newErrors[key] = "wajib diisi";
      }
    }
    for (const key of EMAIL_KEYS) {
      const val = settings[key]?.trim();
      if (val && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
        newErrors[key] = "Format email tidak valid";
      }
    }
    return newErrors;
  };

  const handleChange = (key: string, value: string) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => {
      if (prev[key]) {
        const next = { ...prev };
        delete next[key];
        return next;
      }
      return prev;
    });
  };

  const handleSave = async () => {
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setErrors({});
    setSaving(true);
    try {
      const items: { key: string; value: string; label: string; group: string }[] = [];
      for (const group of SETTINGS_GROUPS) {
        for (const field of group.fields) {
          items.push({
            key: field.key,
            value: settings[field.key] || "",
            label: field.label,
            group: group.group,
          });
        }
      }
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(items),
      });
      if (!res.ok) { toast.error("Gagal menyimpan"); return; }
      toast.success("Pengaturan berhasil disimpan");
    } catch { toast.error("Terjadi kesalahan"); }
    finally { setSaving(false); }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pengaturan</h1>
          <p className="text-sm text-gray-500 mt-1">Konfigurasi website {settings.company_name || "Admin"}</p>
        </div>
        <Button onClick={handleSave} disabled={saving} className="bg-red-600 hover:bg-red-700 text-white gap-2">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Simpan Pengaturan
        </Button>
      </div>

      {loading
        ? Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="border-0 shadow-sm">
              <CardContent className="p-6 space-y-4">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </CardContent>
            </Card>
          ))
        : SETTINGS_GROUPS.map((group) => (
            <Card key={group.group} className="border-0 shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center">
                    <group.icon className="w-4 h-4 text-red-600" />
                  </div>
                  {group.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {group.fields.map((field, idx) => (
                  <div key={field.key}>
                    {field.type === "image" ? (
                      <ImageUploadField
                        key={field.key}
                        fieldKey={field.key}
                        label={field.label}
                        value={settings[field.key] || ""}
                        onChange={handleChange}
                      />
                    ) : (
                      <div className="space-y-2">
                        <Label htmlFor={field.key} className="text-sm font-medium text-gray-700">
                          {field.label}
                        </Label>
                        {field.type === "textarea" ? (
                          <Textarea
                            id={field.key}
                            value={settings[field.key] || ""}
                            onChange={(e) => handleChange(field.key, e.target.value)}
                            rows={3}
                            className={errors[field.key] ? "resize-none border-red-500 focus-visible:ring-red-500" : "resize-none"}
                          />
                        ) : (
                          <Input
                            id={field.key}
                            type={field.type === "number" ? "text" : field.key === "contact_email" ? "email" : "text"}
                            value={settings[field.key] || ""}
                            onChange={(e) => handleChange(field.key, e.target.value)}
                            placeholder={field.placeholder || (field.type === "url" ? "https://..." : "")}
                            className={errors[field.key] ? "border-red-500 focus-visible:ring-red-500" : ""}
                          />
                        )}
                        {errors[field.key] && (
                          <p className="flex items-center gap-1 text-sm text-red-500">
                            <AlertCircle className="w-3.5 h-3.5" />
                            {errors[field.key]}
                          </p>
                        )}
                      </div>
                    )}
                    {idx < group.fields.length - 1 && <Separator className="mt-4" />}
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
    </div>
  );
}
