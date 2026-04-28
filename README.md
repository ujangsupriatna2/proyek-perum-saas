# Proyek Perum SaaS

Website perumahan modern berbasis Next.js 16 dengan fitur lengkap untuk manajemen properti, blog, galeri, testimoni, kalkulator cicilan Syariah & KPR, serta admin panel terintegrasi.

## 🏠 Fitur

- **Landing Page** — Hero, fitur unggulan, preview properti, kalkulator cicilan, peta lokasi, FAQ, galeri
- **Halaman Tentang** — Profil perusahaan, visi-misi, track record, legalitas, bank partner
- **Daftar Proyek** — Listing properti dengan filter kategori & harga, detail lengkap
- **Galeri** — Foto & video dokumentasi proyek dengan lightbox
- **Blog** — Artikel berita & informasi dengan pagination
- **Kontak** — Form WhatsApp + peta interaktif Leaflet
- **Kalkulator Cicilan** — Simulasi Syariah (Murabahah) & KPR (Anuitas)
- **Chatbot** — Bot otomatis dengan respons berbasis aturan
- **Admin Panel** — CRUD lengkap untuk semua konten

## 🛠 Tech Stack

- **Framework:** Next.js 16 (App Router) + React 19 + TypeScript
- **Styling:** Tailwind CSS 4 + shadcn/ui
- **Database:** MySQL (Prisma ORM)
- **Auth:** NextAuth.js v4
- **State:** Zustand
- **Map:** Leaflet + react-leaflet (OSRM routing)
- **Rich Text:** Quill Editor

## 🚀 Setup

```bash
# Install dependencies
bun install

# Setup environment
cp .env.example .env
# Edit .env sesuai konfigurasi MySQL

# Push database schema
bun run db:push

# Seed data (admin + testimoni)
bunx tsx prisma/seed.ts

# Start development
bun run dev
```

## 🔑 Admin Login

Setelah seed, login dengan:
- **Email:** admin@brr.co.id
- **Password:** 12345678

## 📁 Struktur

```
src/
├── app/
│   ├── page.tsx          # Public website (SPA)
│   ├── layout.tsx        # Root layout
│   ├── globals.css       # Global styles
│   ├── api/              # REST API routes
│   └── admin/            # Admin panel pages
├── components/
│   ├── ui/               # shadcn/ui components
│   ├── chatbot.tsx       # AI chatbot
│   ├── leaflet-map.tsx   # Interactive map
│   └── admin/            # Admin components
└── lib/
    ├── db.ts             # Prisma client
    ├── auth.ts           # NextAuth config
    ├── permissions.ts    # Role-based access
    └── *-store.ts        # Zustand stores
```

## 📝 License

Private — PT Bumi Sanggar Meubel
