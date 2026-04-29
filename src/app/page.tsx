"use client";

import { useState, useEffect, useRef, Suspense, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Home,
  MapPin,
  Phone,
  Instagram,
  ChevronRight,
  ChevronDown,
  ChevronLeft,
  Calculator,
  Shield,
  TreePine,
  Building2,
  Car,
  Wifi,
  CheckCircle2,
  Star,
  Menu,
  X,
  Heart,
  HeartHandshake,
  TrendingUp,
  Clock,
  Users,
  Sparkles,
  MessageCircle,
  BookOpen,
  ArrowRight,
  ArrowLeft,
  LandPlot,
  Hammer,
  KeyRound,
  HelpCircle,
  FileText,
  Award,
  Handshake,
  Globe,
  Camera,
  Send,
  User,
  Percent,
  Calendar,
  Eye,
  Wrench,
  HardHat,
  Paintbrush,
  Ruler,
  Zap,
  Droplets,
  TreePine as TreeIcon,
  MessageSquare,
  ThumbsUp,
} from "lucide-react";
import MapWrapper from "@/components/map-wrapper";
import Chatbot from "@/components/chatbot";
import { usePropertyStore, type Property } from "@/lib/property-store";
import { useBlogStore, type BlogArticle } from "@/lib/blog-store";
import { useTestimonialStore, type Testimonial } from "@/lib/testimonial-store";
import { useGalleryStore, type GalleryItem } from "@/lib/gallery-store";
import { useBankStore, type BankItem } from "@/lib/bank-store";
import { useServiceStore, type ServiceItem } from "@/lib/service-store";
import { useMitraStore, type MitraItem } from "@/lib/mitra-store";
import { useSettingsStore } from "@/lib/settings-store";

/* ─────────────────────────── DATA ─────────────────────────── */

const NAV_LINKS = [
  { label: "Home", tab: "home" },
  { label: "Tentang Kami", tab: "tentang" },
  { label: "Proyek", tab: "proyek" },
  { label: "Jasa", tab: "jasa" },
  { label: "Mitra", tab: "mitra" },
  { label: "Gallery", tab: "gallery" },
  { label: "Blog", tab: "blog" },
  { label: "Kontak", tab: "kontak" },
] as const;

type PropertyCategory = "inden" | "kavling" | "siap_huni" | "lingkungan" | "proses_bangun";

type GalleryCategory = PropertyCategory | "all";

const CATEGORY_LABELS: Record<string, string> = {
  inden: "Inden",
  kavling: "Kavling",
  siap_huni: "Siap Huni",
  lingkungan: "Lingkungan",
  proses_bangun: "Proses Bangun",
};



/* ── HOME: Ringkas, hook-style, 1-2 kalimat, fokus headline benefit ── */
const FEATURES = [
  { icon: Shield, title: "Syariah & KPR", desc: "Pilih skema syariah (tanpa riba) atau KPR bank sesuai kebutuhan Anda." },
  { icon: MapPin, title: "Lokasi Strategis", desc: "Di jantung Bandung, dekat tol & fasilitas umum." },
  { icon: TreePine, title: "Lingkungan Asri", desc: "Kawasan hijau, aman, dan nyaman untuk keluarga." },
  { icon: Building2, title: "Desain Modern", desc: "Arsitektur premium dengan material terbaik." },
  { icon: TrendingUp, title: "Investasi Cerdas", desc: "Nilai properti naik stabil setiap tahun." },
  { icon: Wifi, title: "Fasilitas Lengkap", desc: "One gate system, keamanan 24 jam & mushola." },
];

/* ── TENTANG KAMI: Detail, proof-based, penjelasan + bukti nyata ── */
const FEATURES_TENTANG = [
  {
    icon: Shield,
    title: "Kurasi Developer Ketat",
    subtitle: "Hanya developer terpilih dan terverifikasi",
    points: [
      "Setiap mitra developer melalui proses verifikasi legalitas dan track record",
      "Audit berkala terhadap progres dan kualitas bangunan",
      "Rating dan review transparan dari pembeli sebelumnya",
      "Penilaian kinerja developer setiap kuartal",
    ],
    proof: "Hanya developer dengan track record minimal 2 tahun dan legalitas lengkap yang diterima bergabung",
    gradient: "from-gray-700 to-gray-800",
  },
  {
    icon: Building2,
    title: "Developer Terpilih",
    subtitle: "Pilihan terluas dari mitra terbaik",
    points: [
      "3+ mitra developer aktif dan terus bertumbuh",
      "10+ proyek perumahan di berbagai lokasi strategis",
      "Beragam tipe: Inden, Kavling, Siap Huni",
      "Desain modern dari arsitek berpengalaman",
    ],
    proof: "Setiap mitra dipilih berdasarkan reputasi, kualitas bangunan, dan kepuasan pembeli",
    gradient: "from-gray-800 to-gray-900",
  },
  {
    icon: Shield,
    title: "Legalitas Terjamin",
    subtitle: "Setiap proyek memiliki dokumen lengkap",
    points: [
      "Sertifikat SHM per unit dari setiap proyek mitra",
      "IMB/PBG dan perizinan lingkungan lengkap",
      "Tim legal platform memverifikasi semua dokumen",
      "Pendampingan akad dan PJB oleh profesional",
    ],
    proof: "Platform melakukan verifikasi ulang legalitas setiap proyek sebelum dipasarkan",
    gradient: "from-blue-500 to-blue-600",
  },
  {
    icon: TrendingUp,
    title: "Investasi Cerdas",
    subtitle: "Properti dari developer dengan nilai naik konsisten",
    points: [
      "{{UNITS}}+ unit rumah telah terjual melalui platform",
      "Harga properti naik konsisten di setiap lokasi mitra",
      "Skema pembayaran fleksibel: Syariah & KPR",
      "Konsultasi gratis untuk membantu pilihan terbaik",
    ],
    proof: "Data menunjukkan rata-rata kenaikan nilai properti 15-20% per tahun di lokasi mitra kami",
    gradient: "from-amber-500 to-amber-600",
  },
  {
    icon: HeartHandshake,
    title: "Pendampingan Penuh",
    subtitle: "Dari konsultasi hingga serah terima kunci",
    points: [
      "Konsultasi gratis dengan tim ahli properti",
      "Pendampingan proses KPR/Syariah dari awal",
      "Monitoring progres pembangunan berkala",
      "After-sales service dan garansi dari developer",
    ],
    proof: "Dedicated customer support untuk setiap pembeli dari tahap konsultasi hingga penghuni",
    gradient: "from-purple-500 to-purple-600",
  },
  {
    icon: Eye,
    title: "Transparansi Total",
    subtitle: "Informasi jelas, tanpa biaya tersembunyi",
    points: [
      "Harga dan spesifikasi properti terbuka dan akurat",
      "Progres pembangunan bisa dipantau real-time",
      "Semua biaya dan skema cicilan dijelaskan di awal",
      "Review dan testimoni dari pembeli asli",
    ],
    proof: "Platform tidak memungut biaya tambahan dari pembeli — semua transaksi langsung ke developer",
    gradient: "from-pink-500 to-pink-600",
  },
];

/* ─────────────────────────── FAQ DATA ─────────────────────────── */

const FAQ_ITEMS = [
  {
    q: "Apa itu KPR Syariah dan bagaimana bedanya dengan KPR Konvensional?",
    a: "KPR Syariah adalah skema pembiayaan rumah berbasis prinsip Islam tanpa bunga (riba), tanpa denda, dan tanpa penalti. Cicilan bersifat flat sepanjang tenor sehingga lebih mudah dihitung dan tidak akan berubah.",
  },
  {
    q: "Berapa minimal uang muka (DP) untuk membeli rumah?",
    a: "DP minimal mulai dari 30% dari harga rumah. Namun kami juga menyediakan opsi DP hingga 50% untuk cicilan yang lebih ringan. DP juga bisa dicicil sesuai kesepakatan.",
  },
  {
    q: "Bagaimana proses pembelian rumah?",
    a: "Prosesnya mudah: Konsultasi gratis → Pilih proyek → Hitung cicilan → Booking fee → Akad jual beli → Serah terima kunci. Tim kami akan mendampingi di setiap tahap.",
  },
  {
    q: "Apakah rumah sudah bersertifikat SHM?",
    a: "Ya, seluruh unit rumah sudah bersertifikat SHM (Sertifikat Hak Milik) dan IMB lengkap. Legalitas dijamin aman dan transparan.",
  },
  {
    q: "Apa saja jasa yang tersedia?",
    a: "Kami menyediakan berbagai jasa bangunan profesional: konstruksi rumah, renovasi, desain arsitektur & interior, instalasi listrik & pipa, taman & landscape, hingga konsultasi bangunan.",
  },
];

/* ─────────────────────────── COMPONENTS ─────────────────────────── */

function SectionDivider({ dark = false }: { dark?: boolean }) {
  return (
    <div className={`relative h-px w-full overflow-hidden ${dark ? "bg-gray-900" : "bg-gray-50"}`}>
      <motion.div
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
        className={`absolute inset-0 h-full origin-left ${dark ? "bg-gradient-to-r from-transparent via-gray-700 to-transparent" : "bg-gradient-to-r from-transparent via-gray-300 to-transparent"}`}
      />
    </div>
  );
}

function FloatingParticles({ count = 6, dark = false }: { count?: number; dark?: boolean }) {
  const particles = Array.from({ length: count }, (_, i) => ({
    id: i,
    size: 4 + (i * 7) % 8,
    left: `${(i * 17 + 5) % 100}%`,
    top: `${(i * 23 + 10) % 100}%`,
    delay: i * 1.3,
    duration: 6 + (i % 4) * 2,
  }));
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          animate={{
            y: [0, -30 - p.size * 3, -10, 0],
            x: [0, 10 + p.size, -8, 0],
            opacity: [0.15, 0.4, 0.2, 0.15],
            scale: [1, 1.2, 0.8, 1],
          }}
          transition={{ duration: p.duration, repeat: Infinity, delay: p.delay, ease: "easeInOut" }}
          className={`absolute rounded-full ${dark ? "bg-white" : "bg-gray-900"}`}
          style={{ width: p.size, height: p.size, left: p.left, top: p.top }}
        />
      ))}
    </div>
  );
}

function FadeIn({
  children,
  delay = 0,
  className = "",
  direction = "up",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
  direction?: "up" | "down" | "left" | "right";
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  const dirMap = {
    up: { y: 40, x: 0 },
    down: { y: -40, x: 0 },
    left: { y: 0, x: 40 },
    right: { y: 0, x: -40 },
  };

  return (
    <motion.div
      ref={ref}
      initial={{
        opacity: 0,
        y: dirMap[direction].y,
        x: dirMap[direction].x,
      }}
      animate={
        isInView
          ? { opacity: 1, y: 0, x: 0 }
          : {
              opacity: 0,
              y: dirMap[direction].y,
              x: dirMap[direction].x,
            }
      }
      transition={{ duration: 0.6, delay, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ─────────────────────────── NAVBAR ─────────────────────────── */

function Navbar({ activeTab }: { activeTab: string }) {
  const { settings: S } = useSettingsStore();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const router = useRouter();

  const isHome = activeTab === "home";
  const isSolid = !isHome || scrolled;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  const handleNav = useCallback((tab: string) => {
    setMobileOpen(false);
    router.push(`/?tab=${tab}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [router]);

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isSolid
          ? "bg-white/90 backdrop-blur-xl shadow-sm border-b border-gray-100"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18 md:h-20">
          {/* Logo */}
          <a href="/?tab=home" onClick={(e) => { e.preventDefault(); handleNav("home"); }} className="flex items-center gap-2.5">
            <img src={S.logo_url || "/images/logo-brr.png"} alt="Logo" className="w-10 h-10 md:w-11 md:h-11 rounded-xl object-contain" />
            <span className={`text-xs md:text-sm font-bold tracking-wider uppercase ${isSolid ? 'text-gray-700' : 'text-white'} transition-colors`}>
              {S.company_legal_name}
            </span>
          </a>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-0.5">
            {NAV_LINKS.map((link) => {
              const isActive = activeTab === link.tab || (link.tab === "blog" && activeTab.startsWith("blog/"));
              return (
                <a
                  key={link.tab}
                  href={`/?tab=${link.tab}`}
                  onClick={(e) => { e.preventDefault(); handleNav(link.tab); }}
                  className={`px-4 py-2 text-[13px] font-medium rounded-lg transition-all relative ${
                    isActive
                      ? isSolid
                        ? "text-gray-900"
                        : "text-white"
                      : isSolid
                        ? "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                        : "text-white/80 hover:text-white"
                  }`}
                >
                  {link.label}
                  {isActive && <span className={`absolute bottom-0 left-1/2 -translate-x-1/2 w-5 h-0.5 rounded-full ${isSolid ? 'bg-gray-900' : 'bg-white'}`} />}
                </a>
              );
            })}
          </nav>

          {/* CTA Button Desktop */}
          <div className="hidden md:flex items-center gap-3">
            <a
              href={`https://wa.me/${S.contact_wa}`}
              target="_blank"
              rel="noopener noreferrer"
              className={`px-5 py-2.5 text-sm font-semibold rounded-lg transition-all ${
                isSolid
                  ? "bg-gray-900 text-white hover:bg-gray-800"
                  : "bg-white text-gray-900 hover:bg-white/90"
              }`}
            >
              Hubungi Kami
            </a>
          </div>

          {/* Mobile Toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className={`md:hidden w-10 h-10 flex items-center justify-center rounded-lg transition-colors ${
              isSolid ? "text-gray-700 hover:bg-gray-100" : "text-white hover:bg-white/10"
            }`}
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Nav */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-t border-gray-100 overflow-hidden"
          >
            <nav className="flex flex-col p-6 gap-1">
              {NAV_LINKS.map((link) => {
                const isActive = activeTab === link.tab || (link.tab === "blog" && activeTab.startsWith("blog/"));
                return (
                  <button
                    key={link.tab}
                    onClick={() => handleNav(link.tab)}
                    className={`px-4 py-3 font-medium rounded-xl transition-colors text-left ${
                      isActive ? "bg-gray-100 text-gray-900" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    }`}
                  >
                    {link.label}
                  </button>
                );
              })}
              <a
                href={`https://wa.me/${S.contact_wa}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 px-4 py-3 font-semibold bg-gray-900 text-white rounded-xl text-center"
              >
                Hubungi Kami
              </a>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}

/* ─────────────────────────── HERO (Cinematic) ─────────────────────────── */

function Hero() {
  const { settings: S } = useSettingsStore();
  const router = useRouter();
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-black">
      {/* Background Image */}
      <div className="absolute inset-0 overflow-hidden">
        <img
          src={S.hero_bg_image || "/images/properties/hero_cover.png"}
          alt={S.company_name}
          className="w-full h-full object-cover animate-ken-burns"
        />
        {/* Dark overlay — ensure text always readable */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/85" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-transparent to-black/50" />
        {/* Vignette */}
        <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.6) 100%)' }} />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-4xl mx-auto px-5 sm:px-10 text-center pt-16 pb-24 sm:pt-0 sm:pb-0">
        {/* Eyebrow */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="inline-flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6"
        >
          <div className="h-px w-6 sm:w-8 bg-white/40" />
          <span className="text-white/60 text-[9px] sm:text-[11px] font-semibold uppercase tracking-[0.2em] sm:tracking-[0.25em]">
            {S.company_legal_name || "Platform Perumahan"}
          </span>
          <div className="h-px w-6 sm:w-8 bg-white/40" />
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-[2rem] sm:text-5xl md:text-6xl lg:text-[4.5rem] font-black text-white leading-[1.1] sm:leading-[1.1] mb-4 sm:mb-6 tracking-tight drop-shadow-[0_4px_30px_rgba(0,0,0,0.8)]"
        >
          <span className="block">Temukan Hunian</span>
          <span className="block mt-1 sm:mt-1">Idaman Anda <span className="text-white/80">di Sini</span></span>
        </motion.h1>

        {/* Divider */}
        <motion.div
          initial={{ opacity: 0, scaleX: 0 }}
          animate={{ opacity: 1, scaleX: 1 }}
          transition={{ duration: 0.6, delay: 0.55 }}
          className="w-10 sm:w-12 h-0.5 bg-white/50 mx-auto mb-4 sm:mb-6"
        />

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.65 }}
          className="text-sm sm:text-lg text-white/75 leading-relaxed mb-8 sm:mb-12 max-w-md sm:max-w-xl mx-auto drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)] px-2 sm:px-0"
        >
          Platform perumahan terpercaya yang menghubungkan Anda dengan developer terpilih.{" "}
          <span className="text-white font-medium">Skema pembayaran fleksibel</span> — Syariah &amp; KPR Bank.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center mb-12 sm:mb-16 px-4 sm:px-0"
        >
          <a
            href={`https://wa.me/${S.contact_wa}`}
            target="_blank"
            rel="noopener noreferrer"
            className="group relative inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3.5 sm:py-4 bg-white text-gray-950 font-bold rounded-xl hover:bg-gray-100 transition-all active:scale-[0.98] text-sm shadow-lg shadow-white/10 overflow-hidden"
          >
            <span className="relative z-10 flex items-center gap-2">
              <MessageCircle className="w-4 h-4" />
              Booking via WhatsApp
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
          </a>
          <button
            onClick={() => router.push("/?tab=proyek")}
            className="inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3.5 sm:py-4 border border-white/25 text-white font-semibold rounded-xl hover:bg-white/10 hover:border-white/50 transition-all text-sm backdrop-blur-sm"
          >
            Lihat Semua Proyek
            <ArrowRight className="w-4 h-4" />
          </button>
        </motion.div>

        {/* Stats Row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 1.0 }}
          className="grid grid-cols-3 gap-4 sm:gap-8 max-w-sm sm:max-w-xl mx-auto"
        >
          {[
            { value: `${S.total_units_sold}+`, label: "Unit Terjual" },
            { value: "3+", label: "Mitra Developer" },
            { value: "10+", label: "Proyek Perumahan" },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-xl sm:text-3xl font-black text-white drop-shadow-[0_1px_8px_rgba(0,0,0,0.5)]">{stat.value}</div>
              <div className="text-[9px] sm:text-[11px] text-white/40 mt-1 sm:mt-1.5 font-medium uppercase tracking-wider">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-6 sm:bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
      >
        <span className="text-white/30 text-[9px] sm:text-[10px] uppercase tracking-widest font-medium">Scroll</span>
        <div className="w-5 h-8 border border-white/20 rounded-full flex justify-center pt-1.5">
          <div className="w-1 h-2 bg-white/40 rounded-full animate-scroll-indicator" />
        </div>
      </motion.div>
    </section>
  );
}

/* ─────────────────────────── INFINITE MARQUEE STRIP ─────────────────────────── */

function MarqueeStrip() {
  const { settings: S } = useSettingsStore();
  const items = [
    "Syariah & KPR Bank",
    "✦",
    "Legalitas SHM Terjamin",
    "✦",
    "DP Bisa Dicicil",
    "✦",
    "Lokasi Strategis Bandung",
    "✦",
    "One Gate System",
    "✦",
    "Konsultasi Gratis",
    "✦",
  ];
  return (
    <div className="bg-gray-900 py-3.5 overflow-hidden relative">
      {/* Top/bottom subtle lines */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-gray-700 to-transparent" />
      <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-gray-700 to-transparent" />
      <div className="animate-marquee-left flex whitespace-nowrap">
        {[...items, ...items, ...items, ...items].map((item, i) => (
          <span key={i} className={`mx-6 text-sm font-medium ${item === "✦" ? "text-gray-600 text-lg" : "text-gray-300"}`}>
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}

/* ─────────────────────────── VIDEO OVERVIEW (Home) ─────────────────────────── */

function VideoOverviewSection() {
  const { settings: S } = useSettingsStore();
  const videoUrl = S.hero_video_url;
  const [muted, setMuted] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Only render if video URL exists and is NOT a YouTube URL
  if (!videoUrl || videoUrl.includes("youtube.com") || videoUrl.includes("youtu.be")) return null;

  return (
    <section className="py-20 md:py-28 bg-white overflow-hidden relative">
      {/* Ambient orb */}
      <motion.div
        animate={{ y: [0, -10, 5, 0], x: [0, 8, -5, 0] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-[20%] left-[-5%] w-[250px] h-[250px] rounded-full bg-gray-100/40 blur-3xl"
      />
      <FloatingParticles count={3} dark={false} />

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeIn className="text-center mb-12">
          <span className="text-gray-400 text-xs font-bold uppercase tracking-[0.3em]">Kenali Kami</span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-gray-900 mt-4 mb-5 tracking-tight">
            Lebih Dekat dengan <span className="text-gradient-gray">{S.company_name}</span>
          </h2>
          <p className="text-gray-500 max-w-xl mx-auto leading-relaxed">
            Simak overview singkat tentang visi, misi, dan proyek-proyek unggulan kami.
          </p>
        </FadeIn>

        <FadeIn delay={0.2}>
          <div className="relative group">
            {/* Decorative glow behind video */}
            <div className="absolute -inset-4 bg-gradient-to-r from-gray-200/50 via-gray-100 to-gray-200/50 rounded-3xl blur-2xl opacity-60 group-hover:opacity-80 transition-opacity duration-700" />

            {/* Video container */}
            <div className="relative rounded-2xl overflow-hidden border border-gray-200 shadow-xl shadow-gray-200/50 bg-black">
              <video
                ref={videoRef}
                src={videoUrl}
                autoPlay
                muted={muted}
                loop
                playsInline
                preload="auto"
                className="w-full aspect-video object-cover"
              />

              {/* Mute/Unmute toggle */}
              <button
                type="button"
                onClick={() => {
                  const next = !muted;
                  setMuted(next);
                  if (videoRef.current) {
                    videoRef.current.muted = next;
                  }
                }}
                className="absolute bottom-4 right-4 z-10 w-10 h-10 rounded-full bg-black/50 backdrop-blur-sm text-white flex items-center justify-center hover:bg-black/70 transition-colors"
                title={muted ? "Nyalakan suara" : "Matikan suara"}
              >
                {muted ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707A1 1 0 0112 5v14a1 1 0 01-1.707.707L5.586 15z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.536 8.464a5 5 0 010 7.072M17.95 6.05a8 8 0 010 11.9M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707A1 1 0 0112 5v14a1 1 0 01-1.707.707L5.586 15z" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

/* ─────────────────────────── WHY CHOOSE US (Dark Glass) ─────────────────────────── */

function WhyChooseSection() {
  const { settings: S } = useSettingsStore();
  return (
    <section className="relative py-28 bg-gray-950 overflow-hidden">
      {/* Animated gradient orbs */}
      <motion.div
        animate={{ x: [0, 40, -20, 0], y: [0, -30, 20, 0], scale: [1, 1.1, 0.95, 1] }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full bg-gradient-to-br from-gray-800/30 to-gray-900/30 blur-3xl"
      />
      <motion.div
        animate={{ x: [0, -30, 20, 0], y: [0, 20, -30, 0], scale: [1, 0.9, 1.1, 1] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-[-10%] left-[-5%] w-[400px] h-[400px] rounded-full bg-gradient-to-br from-gray-700/20 to-gray-800/20 blur-3xl"
      />
      <motion.div
        animate={{ x: [0, 20, -30, 0], y: [0, -20, 10, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-[40%] left-[50%] w-[300px] h-[300px] rounded-full bg-gradient-to-br from-gray-600/10 to-transparent blur-3xl"
      />
      {/* Subtle background pattern */}
      <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.3) 1px, transparent 0)', backgroundSize: '40px 40px' }} />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeIn className="text-center mb-20">
          <span className="text-gray-500 text-xs font-bold uppercase tracking-[0.3em]">Mengapa Kami</span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-white mt-4 mb-5 tracking-tight">
            Keunggulan {S.company_name}
          </h2>
          <p className="text-gray-500 max-w-xl mx-auto leading-relaxed">
            Bukan sekadar rumah — investasi masa depan yang aman untuk keluarga Anda.
          </p>
        </FadeIn>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map((feat, i) => (
            <FadeIn key={feat.title} delay={i * 0.08}>
              <div className="group relative bg-white/[0.04] backdrop-blur-sm border border-white/[0.08] rounded-2xl p-8 hover:bg-white/[0.08] hover:border-white/[0.15] transition-all duration-500 overflow-hidden">
                {/* Hover shimmer sweep */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 overflow-hidden">
                  <div className="absolute inset-0 animate-shimmer-slow bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
                </div>
                {/* Animated border glow */}
                <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 animate-border-glow transition-opacity duration-500" />
                {/* Number */}
                <div className="absolute top-6 right-6 text-5xl font-black text-white/[0.03] group-hover:text-white/[0.06] transition-colors leading-none">
                  {String(i + 1).padStart(2, '0')}
                </div>
                <div className="relative z-10">
                  <motion.div
                    whileHover={{ rotate: [0, -5, 5, 0], scale: 1.1 }}
                    transition={{ duration: 0.5 }}
                    className="w-12 h-12 rounded-xl bg-white/[0.08] flex items-center justify-center mb-5 group-hover:bg-white/[0.12] transition-colors"
                  >
                    <feat.icon className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" />
                  </motion.div>
                  <h3 className="text-lg font-bold text-white mb-2">{feat.title}</h3>
                  <p className="text-gray-500 leading-relaxed text-sm">{feat.desc}</p>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────── TENTANG KAMI KEUNGGULAN (Detail) ─────────────────────────── */

function TentangKamiKeunggulanSection() {
  const { settings: S } = useSettingsStore();
  return (
    <section className="py-24 md:py-32 bg-section-gray">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeIn className="text-center mb-16">
          <p className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Keunggulan Kami</p>
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">
            Mengapa <span className="text-gradient-accent">Berpercaya</span> pada Kami?
          </h2>
          <p className="text-gray-500 max-w-2xl mx-auto text-lg">
            Bukan sekadar janji, tapi bukti nyata dari ratusan keluarga yang sudah mempercayai {S.company_name}.
          </p>
        </FadeIn>

        <div className="space-y-5">
          {FEATURES_TENTANG.map((feat, i) => {
            const Icon = feat.icon;
            return (
              <FadeIn key={feat.title} delay={i * 0.08}>
                <Card className="border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden">
                  <div className="grid md:grid-cols-[240px_1fr]">
                    {/* Left: icon + title */}
                    <div className="bg-gray-900 p-8 flex flex-col items-center justify-center text-center">
                      <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center mb-4">
                        <Icon className="w-7 h-7 text-white" />
                      </div>
                      <h3 className="text-xl font-extrabold text-white leading-tight">{feat.title}</h3>
                      <p className="text-gray-400 text-sm mt-1.5">{feat.subtitle}</p>
                    </div>

                    {/* Right: detail points + proof */}
                    <CardContent className="p-6 md:p-8">
                      <ul className="space-y-3 mb-5">
                        {feat.points.map((point, j) => (
                          <li key={j} className="flex items-start gap-2.5">
                            <CheckCircle2 className="w-5 h-5 text-gray-400 mt-0.5 shrink-0" />
                            <span className="text-gray-700 text-sm leading-relaxed">{point.replace("{{UNITS}}", S.total_units_sold)}</span>
                          </li>
                        ))}
                      </ul>
                      <div className="bg-gray-50 border border-gray-100 rounded-xl p-3.5">
                        <p className="text-sm text-gray-600 flex items-start gap-2">
                          <Award className="w-4 h-4 mt-0.5 shrink-0" />
                          <span><strong className="font-semibold">Bukti:</strong> {feat.proof}</span>
                        </p>
                      </div>
                    </CardContent>
                  </div>
                </Card>
              </FadeIn>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────── HELPERS ─────────────────────────── */

// Extract YouTube video ID from various URL formats
function getYoutubeEmbedUrl(url: string): string | null {
  if (!url) return null;
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/)([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return `https://www.youtube.com/embed/${match[1]}`;
  }
  return null;
}

// Get cheapest KPR installment, preferring longest tenor
function getCheapestKprInstallment(property: Property): { amount: number; dp: number; tenor: number } | null {
  // Check if property supports KPR
  const finTypes = property.financingTypes ?? ["syariah", "kpr"];
  if (!finTypes.includes("kpr")) return null;

  let best: { amount: number; dp: number; tenor: number } | null = null;

  // 1. Try from saved KPR installments grid
  if (property.kprInstallments && typeof property.kprInstallments === "object") {
    for (const dpStr of Object.keys(property.kprInstallments)) {
      const dp = parseInt(dpStr);
      const tenorMap = property.kprInstallments[dpStr];
      if (!tenorMap || typeof tenorMap !== "object") continue;
      for (const tenorStr of Object.keys(tenorMap)) {
        const tenor = parseInt(tenorStr);
        const amount = tenorMap[tenorStr];
        if (amount <= 0) continue;
        if (!best || amount < best.amount || (amount === best.amount && tenor > best.tenor)) {
          best = { amount, dp, tenor };
        }
      }
    }
    if (best) return best;
  }

  // 2. Calculate on-the-fly using annuity formula with saved interest rate
  const rate = (property.kprInterestRate ?? 7.5) / 100;
  const dpOptions = property.kprDpOptions ?? [1000000, 2000000, 3000000, 4000000, 5000000];
  const tenorOptions = property.kprTenorOptions ?? [5, 10, 15, 20, 25];

  if (rate <= 0) return null;

  for (const dp of dpOptions) {
    const loanRupiah = property.price * 1_000_000 - dp;
    if (loanRupiah <= 0) continue;
    const r = rate / 12;
    for (const tenor of tenorOptions) {
      const n = tenor * 12;
      if (r === 0 || n === 0) continue;
      const amount = (loanRupiah * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1) / 1_000_000;
      if (amount <= 0) continue;
      if (!best || amount < best.amount || (amount === best.amount && tenor > best.tenor)) {
        best = { amount, dp, tenor };
      }
    }
  }
  return best;
}

/* ─────────────────────────── PROPERTY CARD (Home - Premium) ─────────────────────────── */

function PremiumPropertyCard({
  property,
  onSelect,
}: {
  property: Property;
  onSelect: (p: Property) => void;
}) {
  const finTypes = property.financingTypes ?? ["syariah", "kpr"];
  const bestKpr = getCheapestKprInstallment(property);

  return (
    <FadeIn className="h-full">
      <div
        className="group h-full bg-white rounded-2xl border border-gray-200/80 hover:border-gray-300 hover:shadow-2xl transition-all duration-500 overflow-hidden cursor-pointer"
        onClick={() => onSelect(property)}
      >
        {/* Image with overlay */}
        <div className="relative h-64 overflow-hidden bg-gray-100">
          {property.image ? (
            <img
              src={property.image}
              alt={property.name}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-200">
              <Home className="w-16 h-16" />
            </div>
          )}
          {/* Top gradient */}
          <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-black/40 to-transparent" />
          {/* Bottom gradient */}
          <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/60 to-transparent" />
          {/* Category badge */}
          <div className="absolute top-4 left-4">
            <span className="text-[10px] font-bold px-3 py-1 rounded-full bg-white/90 backdrop-blur-sm text-gray-700 uppercase tracking-wider">
              {CATEGORY_LABELS[property.category as PropertyCategory] || property.category}
            </span>
          </div>
          {/* Financing badges */}
          <div className="absolute top-4 right-4 flex gap-1.5">
            {finTypes.includes("syariah") && (
              <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-gray-900/80 backdrop-blur-sm text-white">Syariah</span>
            )}
            {finTypes.includes("kpr") && (
              <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-white/80 backdrop-blur-sm text-gray-800">KPR</span>
            )}
          </div>
          {/* Price */}
          <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
            <div>
              <p className="text-white font-black text-xl leading-none">Rp {new Intl.NumberFormat("id-ID").format(property.price)}</p>
              <p className="text-white/60 text-[11px] font-medium mt-0.5">Juta</p>
            </div>
            {bestKpr && (
              <div className="bg-white/90 backdrop-blur-sm rounded-lg px-3 py-1.5">
                <p className="text-[10px] text-gray-500 font-medium">Mulai</p>
                <p className="text-xs font-black text-gray-900">Rp {new Intl.NumberFormat("id-ID").format(Math.round(bestKpr.amount * 1_000_000))}<span className="text-gray-500 font-medium">/bln</span></p>
              </div>
            )}
          </div>
        </div>
        {/* Content */}
        <div className="p-5">
          <div className="flex items-center gap-1.5 text-gray-400 text-xs mb-2">
            <MapPin className="w-3 h-3" />
            <span>{property.location}</span>
          </div>
          <h3 className="font-bold text-gray-900 text-base mb-4 line-clamp-1 group-hover:text-gray-600 transition-colors">
            {property.name}
          </h3>
          {/* Specs */}
          {property.category !== "kavling" ? (
            <div className="flex items-center gap-4 text-xs text-gray-500">
              <div className="flex items-center gap-1.5 bg-gray-50 px-2.5 py-1.5 rounded-lg">
                <Building2 className="w-3.5 h-3.5 text-gray-400" />
                <span className="font-semibold">{property.buildingArea} m²</span>
              </div>
              <div className="flex items-center gap-1.5 bg-gray-50 px-2.5 py-1.5 rounded-lg">
                <LandPlot className="w-3.5 h-3.5 text-gray-400" />
                <span className="font-semibold">{property.landArea} m²</span>
              </div>
              <div className="flex items-center gap-1.5 bg-gray-50 px-2.5 py-1.5 rounded-lg">
                <Home className="w-3.5 h-3.5 text-gray-400" />
                <span className="font-semibold">{property.bedrooms} KT</span>
              </div>
              <div className="flex items-center gap-1.5 bg-gray-50 px-2.5 py-1.5 rounded-lg">
                <Users className="w-3.5 h-3.5 text-gray-400" />
                <span className="font-semibold">{property.bathrooms} KM</span>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-4 text-xs text-gray-500">
              <div className="flex items-center gap-1.5 bg-gray-50 px-2.5 py-1.5 rounded-lg">
                <LandPlot className="w-3.5 h-3.5 text-gray-400" />
                <span className="font-semibold">{property.landArea} m²</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </FadeIn>
  );
}

/* ─────────────────────────── PROPERTY SHOWCASE (Home) ─────────────────────────── */

function PropertyShowcaseSection({
  onSelectProperty,
}: {
  onSelectProperty: (p: Property) => void;
}) {
  const { properties: PROPERTIES } = usePropertyStore();
  const [activeCategory, setActiveCategory] = useState<PropertyCategory | "all">("all");
  const router = useRouter();

  const filtered = activeCategory === "all"
    ? PROPERTIES
    : PROPERTIES.filter((p) => p.category === activeCategory);

  return (
    <section className="py-28 bg-white relative overflow-hidden">
      {/* Ambient background */}
      <motion.div
        animate={{ y: [0, -15, 10, 0], x: [0, 15, -10, 0] }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-[5%] right-[-8%] w-[400px] h-[400px] rounded-full bg-gray-100/50 blur-3xl"
      />
      <motion.div
        animate={{ y: [0, 20, -10, 0], x: [0, -12, 8, 0] }}
        transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-[5%] left-[-5%] w-[300px] h-[300px] rounded-full bg-gray-100/40 blur-3xl"
      />
      <FloatingParticles count={4} dark={false} />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12">
          <FadeIn>
            <span className="text-gray-400 text-xs font-bold uppercase tracking-[0.3em]">Proyek Unggulan</span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-gray-900 mt-3 mb-3 tracking-tight">
              Pilih Hunian <span className="text-gradient-gray">Idaman Anda</span>
            </h2>
            <p className="text-gray-500 max-w-lg leading-relaxed">
              Tersedia berbagai tipe — Siap Huni, Kavling, dan Inden — dengan skema pembayaran yang fleksibel.
            </p>
          </FadeIn>
          <FadeIn delay={0.2} className="flex items-center gap-3 shrink-0">
            {/* Category pills */}
            <div className="hidden md:flex bg-gray-100 rounded-full p-1 gap-0.5">
              {(["all", "inden", "kavling", "siap_huni"] as const).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                    activeCategory === cat
                      ? "bg-gray-900 text-white shadow-md"
                      : "text-gray-500 hover:text-gray-900"
                  }`}
                >
                  {cat === "all" ? "Semua" : CATEGORY_LABELS[cat]}
                </button>
              ))}
            </div>
          </FadeIn>
        </div>

        {/* Mobile category pills */}
        <FadeIn className="flex md:hidden justify-center mb-8 overflow-x-auto scrollbar-hide -mx-4 px-4">
          <div className="flex bg-gray-100 rounded-full p-1 gap-0.5">
            {(["all", "inden", "kavling", "siap_huni"] as const).map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all whitespace-nowrap ${
                  activeCategory === cat
                    ? "bg-gray-900 text-white shadow-md"
                    : "text-gray-500 hover:text-gray-900"
                }`}
              >
                {cat === "all" ? "Semua" : CATEGORY_LABELS[cat]}
              </button>
            ))}
          </div>
        </FadeIn>

        {/* Property Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.slice(0, 6).map((property) => (
            <PremiumPropertyCard key={property.id} property={property} onSelect={onSelectProperty} />
          ))}
        </div>

        <FadeIn className="flex justify-center mt-12">
          <button
            onClick={() => router.push("/?tab=proyek")}
            className="group inline-flex items-center gap-2.5 px-7 py-3.5 bg-gray-900 text-white font-semibold rounded-xl hover:bg-gray-800 transition-all text-sm"
          >
            Lihat Semua Proyek
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </FadeIn>
      </div>
    </section>
  );
}

/* ─────────────────────────── HOW TO BUY (Timeline) ─────────────────────────── */

function HowToBuySection() {
  const { settings: S } = useSettingsStore();
  const steps = [
    { num: "01", title: "Konsultasi Gratis", desc: "Hubungi tim marketing kami via WhatsApp. Ceritakan kebutuhan dan budget Anda.", icon: MessageCircle },
    { num: "02", title: "Pilih Proyek", desc: "Jelajahi koleksi proyek kami dan pilih yang paling sesuai dengan kebutuhan.", icon: Home },
    { num: "03", title: "Hitung Cicilan", desc: "Gunakan kalkulator KPR/Syariah kami untuk simulasi cicilan yang transparan.", icon: Calculator },
    { num: "04", title: "Booking & Akad", desc: "Lakukan booking fee dan proses akad jual beli dengan pendampingan penuh.", icon: KeyRound },
  ];

  return (
    <section className="py-28 bg-gray-50 relative overflow-hidden">
      {/* Decorative dot pattern */}
      <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(0,0,0,0.5) 1px, transparent 0)', backgroundSize: '32px 32px' }} />
      {/* Ambient floating orbs */}
      <motion.div
        animate={{ x: [0, 20, -10, 0], y: [0, -15, 10, 0] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-[10%] right-[-5%] w-[300px] h-[300px] rounded-full bg-gray-200/40 blur-3xl"
      />
      <motion.div
        animate={{ x: [0, -15, 10, 0], y: [0, 20, -15, 0] }}
        transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-[10%] left-[-5%] w-[250px] h-[250px] rounded-full bg-gray-200/30 blur-3xl"
      />
      <FloatingParticles count={5} dark={false} />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeIn className="text-center mb-20">
          <span className="text-gray-400 text-xs font-bold uppercase tracking-[0.3em]">Cara Memiliki Rumah</span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-gray-900 mt-3 mb-4 tracking-tight">
            Proses Mudah &amp; <span className="text-gradient-gray">Transparan</span>
          </h2>
          <p className="text-gray-500 max-w-xl mx-auto">Hanya 4 langkah untuk memiliki hunian impian Anda.</p>
        </FadeIn>

        <div className="relative max-w-4xl mx-auto">
          {/* Center vertical line (desktop) */}
          <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-px bg-gray-200 -translate-x-1/2">
            <motion.div
              initial={{ scaleY: 0 }}
              whileInView={{ scaleY: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
              className="absolute inset-0 origin-top bg-gradient-to-b from-gray-300 via-gray-400 to-gray-300"
            />
          </div>

          {steps.map((step, i) => {
            const Icon = step.icon;
            const isLeft = i % 2 === 0;
            return (
              <FadeIn key={step.num} delay={i * 0.15} direction={isLeft ? "left" : "right"}>
                <div className={`relative flex items-center mb-12 last:mb-0 md:mb-16 ${isLeft ? 'md:flex-row' : 'md:flex-row-reverse'}`}>
                  {/* Content */}
                  <div className={`w-full md:w-[calc(50%-40px)] ${isLeft ? 'md:text-right md:pr-0' : 'md:text-left md:pl-0'}`}>
                    <motion.div
                      whileHover={{ y: -4, boxShadow: "0 20px 40px -12px rgba(0,0,0,0.1)" }}
                      transition={{ duration: 0.3 }}
                      className={`bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100 hover:border-gray-200 transition-all duration-300 group overflow-hidden relative ${isLeft ? 'md:mr-auto' : 'md:ml-auto'}`}
                    >
                      {/* Shimmer on hover */}
                      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 overflow-hidden rounded-2xl">
                        <div className="absolute inset-0 animate-shimmer-slow bg-gradient-to-r from-transparent via-gray-100/50 to-transparent" />
                      </div>
                      <div className={`relative z-10 flex items-center gap-3 mb-3 ${isLeft ? 'md:justify-end' : 'md:justify-start'}`}>
                        <motion.div
                          whileHover={{ rotate: 360 }}
                          transition={{ duration: 0.6 }}
                          className={`w-10 h-10 bg-gray-900 rounded-xl flex items-center justify-center ${isLeft ? 'md:order-2 md:ml-3' : 'md:order-1 md:mr-3'}`}
                        >
                          <Icon className="w-5 h-5 text-white" />
                        </motion.div>
                        <h3 className="text-lg font-bold text-gray-900">{step.title}</h3>
                      </div>
                      <p className="text-gray-500 text-sm leading-relaxed relative z-10">{step.desc}</p>
                    </motion.div>
                  </div>

                  {/* Center dot (desktop) */}
                  <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 w-10 h-10 bg-white border-2 border-gray-900 rounded-full items-center justify-center z-10 shrink-0">
                    <motion.div
                      animate={{ scale: [1, 1.3, 1] }}
                      transition={{ duration: 2, repeat: Infinity, delay: i * 0.5 }}
                      className="w-3 h-3 bg-gray-900 rounded-full"
                    />
                  </div>
                </div>
              </FadeIn>
            );
          })}
        </div>

        <FadeIn className="flex justify-center mt-16">
          <a
            href={`https://wa.me/${S.contact_wa}?text=Halo,%20saya%20ingin%20cek%20unit%20tersedia`}
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center gap-2.5 px-7 py-3.5 bg-gray-900 text-white font-semibold rounded-xl hover:bg-gray-800 transition-all text-sm"
          >
            <MessageCircle className="w-4 h-4" />
            Cek Unit Tersedia
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </a>
        </FadeIn>
      </div>
    </section>
  );
}

/* ─────────────────────────── TESTIMONIALS (Auto Carousel) ─────────────────────────── */

function TestimonialSlide({ t }: { t: Testimonial }) {
  return (
    <div className="min-w-full md:min-w-[calc(50%-12px)] lg:min-w-[calc(33.333%-16px)] px-2 md:px-3">
      <div className="bg-white rounded-2xl p-7 shadow-sm border border-gray-100 h-full flex flex-col hover:shadow-lg hover:border-gray-200 transition-all duration-300">
        {/* Stars */}
        <div className="flex gap-1 mb-4">
          {Array.from({ length: 5 }).map((_, si) => (
            <Star key={si} className={`w-4 h-4 ${si < t.rating ? "text-gray-900 fill-gray-900" : "text-gray-200"}`} />
          ))}
        </div>
        {/* Quote */}
        <p className="text-gray-600 text-sm leading-relaxed flex-1 italic">&ldquo;{t.text}&rdquo;</p>
        {/* Author */}
        <div className="flex items-center gap-3 mt-6 pt-5 border-t border-gray-100">
          <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 font-bold text-sm shrink-0">
            {t.name.charAt(0)}
          </div>
          <div className="min-w-0">
            <p className="font-bold text-gray-900 text-sm truncate">{t.name}</p>
            <p className="text-xs text-gray-400 truncate">{t.role}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function TestimonialsCarousel({ limit }: { limit?: number }) {
  const { testimonials, fetchTestimonials } = useTestimonialStore();
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    fetchTestimonials();
  }, [fetchTestimonials]);

  const items = (testimonials || []).slice(0, limit || 50);

  // Auto-slide every 4 seconds
  useEffect(() => {
    if (items.length === 0) return;
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % items.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [items.length]);

  if (items.length === 0) return null;

  return (
    <section className="py-28 bg-gray-50 overflow-hidden relative">
      {/* Ambient orbs */}
      <motion.div
        animate={{ x: [0, 15, -10, 0], y: [0, -20, 10, 0] }}
        transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-[20%] left-[-8%] w-[350px] h-[350px] rounded-full bg-gray-200/30 blur-3xl"
      />
      <motion.div
        animate={{ x: [0, -20, 15, 0], y: [0, 15, -20, 0] }}
        transition={{ duration: 13, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-[15%] right-[-5%] w-[280px] h-[280px] rounded-full bg-gray-200/25 blur-3xl"
      />
      <FloatingParticles count={4} dark={false} />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeIn className="text-center mb-16">
          <span className="text-gray-400 text-xs font-bold uppercase tracking-[0.3em]">Testimoni</span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-gray-900 mt-3 mb-4 tracking-tight">
            Apa Kata <span className="text-gradient-gray">Pembeli Kami</span>
          </h2>
          <p className="text-gray-500 max-w-xl mx-auto">
            Ratusan keluarga telah mempercayai kami untuk hunian mereka.
          </p>
        </FadeIn>

        {/* Featured testimonial (large) */}
        <div className="mb-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeIndex}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="max-w-3xl mx-auto"
            >
              <div className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-gray-100 text-center relative overflow-hidden group hover:shadow-xl transition-shadow duration-500">
                {/* Shimmer sweep */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 overflow-hidden">
                  <div className="absolute inset-0 animate-shimmer-slow bg-gradient-to-r from-transparent via-gray-50 to-transparent" />
                </div>
                <div className="relative z-10">
                <motion.div
                  animate={{ rotate: [0, 3, -3, 0] }}
                  transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                  className="text-6xl text-gray-200 font-serif leading-none mb-6"
                >&ldquo;</motion.div>
                <div className="flex justify-center gap-1 mb-6">
                  {Array.from({ length: 5 }).map((_, si) => (
                    <Star key={si} className={`w-5 h-5 ${si < items[activeIndex].rating ? "text-gray-900 fill-gray-900" : "text-gray-200"}`} />
                  ))}
                </div>
                <p className="text-gray-700 text-lg md:text-xl leading-relaxed italic mb-8">
                  &ldquo;{items[activeIndex].text}&rdquo;
                </p>
                <div className="flex items-center justify-center gap-3">
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 font-bold shrink-0"
                  >
                    {items[activeIndex].name.charAt(0)}
                  </motion.div>
                  <div className="text-left">
                    <p className="font-bold text-gray-900">{items[activeIndex].name}</p>
                    <p className="text-sm text-gray-400">{items[activeIndex].role}</p>
                  </div>
                </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Dot indicators */}
        <div className="flex justify-center gap-2 mb-12">
          {items.map((_, i) => (
            <button
              key={i}
              onClick={() => setActiveIndex(i)}
              className={`h-2 rounded-full transition-all duration-300 ${
                i === activeIndex ? "w-8 bg-gray-900" : "w-2 bg-gray-300 hover:bg-gray-400"
              }`}
            />
          ))}
        </div>

        {/* Mini cards row */}
        <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-2">
          {items.map((t) => (
            <TestimonialSlide key={t.id} t={t} />
          ))}
        </div>
      </div>
    </section>
  );
}
/* ─────────────────────────── FAQ ─────────────────────────── */

function FAQSection() {
  return (
    <section className="py-20 md:py-28 bg-white relative overflow-hidden">
      {/* Ambient decoration */}
      <motion.div
        animate={{ x: [0, 20, -10, 0], y: [0, -15, 10, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-[10%] right-[-5%] w-[300px] h-[300px] rounded-full bg-gray-100/60 blur-3xl"
      />
      <FloatingParticles count={3} dark={false} />

      <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeIn className="text-center mb-12">
          <span className="text-gray-500 text-sm font-bold uppercase tracking-[0.2em]">FAQ</span>
          <h2 className="text-3xl md:text-4xl font-black text-gray-900 mt-3 mb-4">Pertanyaan Umum</h2>
          <p className="text-gray-500">Jawaban atas pertanyaan yang sering ditanyakan calon pembeli.</p>
        </FadeIn>
        <FadeIn>
          <Accordion type="single" collapsible className="space-y-3">
            {FAQ_ITEMS.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
              >
                <AccordionItem value={`faq-${i}`} className="bg-gray-50 rounded-xl border-0 px-6 data-[state=open]:bg-white data-[state=open]:shadow-lg transition-all duration-300 hover:bg-gray-100/80">
                  <AccordionTrigger className="text-sm font-semibold text-gray-900 hover:text-gray-900 hover:no-underline py-5">{item.q}</AccordionTrigger>
                  <AccordionContent className="text-gray-600 text-sm leading-relaxed pb-5">{item.a}</AccordionContent>
                </AccordionItem>
              </motion.div>
            ))}
          </Accordion>
        </FadeIn>
      </div>
    </section>
  );
}

/* ─────────────────────────── GALLERY PREVIEW (Home) ─────────────────────────── */

function GalleryPreviewSection() {
  const { galleryItems, loading: galleryLoading, fetchGalleryItems } = useGalleryStore();
  const { settings: S } = useSettingsStore();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"foto" | "video">("foto");

  useEffect(() => { fetchGalleryItems(); }, [fetchGalleryItems]);

  const photos = galleryItems.filter((item) => !!item.image);
  const videos = galleryItems.filter((item) => !!item.videoUrl);

  const hasPhotos = photos.length > 0;
  const hasVideos = videos.length > 0;

  // Auto-switch tab if current tab has no items
  const effectiveTab = activeTab === "foto" && !hasPhotos && hasVideos ? "video" : activeTab;

  if (galleryLoading || (!hasPhotos && !hasVideos)) return null;

  const previewItems = (effectiveTab === "foto" ? photos : videos).slice(0, 6);

  return (
    <section className="py-20 md:py-28 bg-section-gray">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeIn className="text-center mb-12">
          <Badge variant="secondary" className="mb-4 bg-gray-100 text-gray-600 border-gray-200">
            <Camera className="w-3.5 h-3.5 mr-1.5" />
            Dokumentasi
          </Badge>
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">
            Galeri <span className="text-gray-900">Proyek</span>
          </h2>
          <p className="text-gray-500 max-w-2xl mx-auto text-lg">
            Dokumentasi proyek dan lingkungan {S.company_name}.
          </p>
        </FadeIn>

        {/* Tab Toggle — only if both exist */}
        {hasPhotos && hasVideos && (
          <FadeIn delay={0.05} className="flex justify-center mb-8">
            <div className="inline-flex bg-gray-100 rounded-xl p-1 gap-1">
              <button
                onClick={() => setActiveTab("foto")}
                className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                  effectiveTab === "foto"
                    ? "bg-white text-gray-600 shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                <span className="flex items-center gap-1.5">
                  <Camera className="w-4 h-4" />
                  Foto
                  <span className="text-[10px] bg-gray-200 text-gray-600 px-1.5 py-0.5 rounded-full">{photos.length}</span>
                </span>
              </button>
              <button
                onClick={() => setActiveTab("video")}
                className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                  effectiveTab === "video"
                    ? "bg-white text-gray-600 shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                <span className="flex items-center gap-1.5">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
                  Video
                  <span className="text-[10px] bg-gray-200 text-gray-600 px-1.5 py-0.5 rounded-full">{videos.length}</span>
                </span>
              </button>
            </div>
          </FadeIn>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {previewItems.map((item, i) => (
            <FadeIn key={item.id} delay={i * 0.05}>
              <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all overflow-hidden group">
                {/* Thumbnail */}
                <div className="relative aspect-video overflow-hidden bg-gray-100">
                  {item.videoUrl ? (() => {
                    const embedUrl = getYoutubeEmbedUrl(item.videoUrl);
                    return embedUrl ? (
                      <iframe
                        src={embedUrl}
                        title={item.title}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className="w-full h-full"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Camera className="w-10 h-10 text-gray-300" />
                      </div>
                    );
                  })() : (
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  )}
                </div>
                {/* Info */}
                <div className="p-4">
                  <h3 className="font-bold text-gray-900 text-sm mb-1 line-clamp-2 group-hover:text-gray-900 transition-colors">
                    {item.title}
                  </h3>
                  {item.description && (
                    <p className="text-xs text-gray-500 line-clamp-2">{item.description}</p>
                  )}
                  <div className="mt-2">
                    <Badge variant="secondary" className="bg-gray-100 text-gray-600 text-[10px]">
                      {CATEGORY_LABELS[item.category] || item.category}
                    </Badge>
                  </div>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
        <FadeIn className="text-center mt-10">
          <button
            onClick={() => router.push("/?tab=gallery")}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gray-100 text-gray-600 font-semibold rounded-xl hover:bg-gray-100 transition-colors"
          >
            Lihat Semua
            <ArrowRight className="w-4 h-4" />
          </button>
        </FadeIn>
      </div>
    </section>
  );
}

/* ─────────────────────────── CTA ─────────────────────────── */

function CTASection() {
  const { settings: S } = useSettingsStore();
  return (
    <section className="relative py-32 md:py-40 overflow-hidden">
      <div className="absolute inset-0">
        <img src={S.location_bg_image || "/images/location.png"} alt="" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gray-950/85" />
      </div>
      {/* Animated gradient orbs */}
      <motion.div
        animate={{ x: [0, 30, -15, 0], y: [0, -20, 15, 0], scale: [1, 1.15, 0.95, 1] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-[10%] left-[20%] w-[400px] h-[400px] rounded-full bg-white/[0.03] blur-3xl"
      />
      <motion.div
        animate={{ x: [0, -20, 25, 0], y: [0, 25, -10, 0], scale: [1, 0.9, 1.1, 1] }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-[10%] right-[15%] w-[350px] h-[350px] rounded-full bg-white/[0.02] blur-3xl"
      />
      {/* Floating particles */}
      <FloatingParticles count={5} dark={true} />

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <FadeIn>
          <div className="flex items-center justify-center gap-3 mb-8">
            <motion.div
              animate={{ scaleX: [0, 1, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="h-px w-12 bg-gray-500"
            />
            <span className="text-gray-400 text-xs font-bold uppercase tracking-[0.3em]">Jangan Tunda Lagi</span>
            <motion.div
              animate={{ scaleX: [0, 1, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
              className="h-px w-12 bg-gray-500"
            />
          </div>
          <h2 className="text-3xl md:text-5xl font-black text-white mb-6 leading-tight tracking-tight drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)]">
            Miliki Rumah Impian
            <br />
            <span className="text-gray-400">Anda Sekarang</span>
          </h2>
          <p className="text-gray-500 text-lg mb-12 max-w-xl mx-auto">
            Hubungi kami untuk konsultasi gratis. Tim marketing siap membantu Anda 24/7.
          </p>
          <motion.div
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            <a
              href={`https://wa.me/${S.contact_wa}`}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative inline-flex items-center justify-center gap-2.5 px-10 py-4 bg-white text-gray-950 font-bold rounded-xl hover:bg-gray-100 transition-all text-sm overflow-hidden"
            >
              <span className="relative z-10 flex items-center gap-2.5">
                <MessageCircle className="w-4 h-4" />
                Booking via WhatsApp
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
            </a>
          </motion.div>
        </FadeIn>
      </div>
    </section>
  );
}

/* ─────────────────────────── JASA PREVIEW (Home) ─────────────────────────── */

function ServicePreviewSection({
  onSelectService,
}: {
  onSelectService: (s: ServiceItem) => void;
}) {
  const { services, fetchServices } = useServiceStore();
  const router = useRouter();

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  // Show featured first, then newest, max 6
  const display = services
    .filter((s) => s.isFeatured)
    .concat(services.filter((s) => !s.isFeatured))
    .slice(0, 6);

  if (display.length === 0) return null;

  return (
    <section className="py-20 md:py-28 bg-white relative overflow-hidden">
      {/* Ambient floating */}
      <motion.div
        animate={{ y: [0, -20, 0], x: [0, 10, 0] }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-[30%] left-[-3%] w-[250px] h-[250px] rounded-full bg-gray-100/50 blur-3xl"
      />
      <FloatingParticles count={4} dark={false} />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeIn className="text-center mb-12">
          <Badge variant="secondary" className="mb-4 bg-gray-50 text-gray-600 border-gray-200">
            <HardHat className="w-3.5 h-3.5 mr-1.5" />
            Jasa Kami
          </Badge>
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">
            Layanan <span className="text-gray-900">Profesional</span>
          </h2>
          <p className="text-gray-500 max-w-2xl mx-auto text-lg">
            Solusi bangunan lengkap — dari konstruksi, renovasi, hingga desain interior.
          </p>
        </FadeIn>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {display.map((service) => (
            <FadeIn key={service.id} className="h-full">
              <Card
                className="group h-full overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 cursor-pointer"
                onClick={() => onSelectService(service)}
              >
                <div className="relative h-44 overflow-hidden bg-gray-200">
                  {service.image ? (
                    <img
                      src={service.image}
                      alt={service.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center">
                      <Wrench className="w-14 h-14 text-white/30" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                  <div className="absolute top-3 left-3 flex gap-1.5">
                    <Badge className="bg-white/90 text-gray-700 border-0 shadow-lg text-[10px] font-semibold backdrop-blur-sm">
                      {SERVICE_CATEGORY_LABELS[service.category] || service.category}
                    </Badge>
                    {service.isFeatured && (
                      <Badge className="bg-gray-500 text-gray-900 border-0 shadow-lg text-[10px] font-bold">
                        <Star className="w-2.5 h-2.5 mr-0.5" /> Unggulan
                      </Badge>
                    )}
                  </div>
                  {service.videoUrl && (
                    <div className="absolute top-3 right-3">
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-lg bg-gray-900/90 text-white backdrop-blur-sm flex items-center gap-0.5">
                        <Camera className="w-2.5 h-2.5" /> Video
                      </span>
                    </div>
                  )}
                  <div className="absolute bottom-3 left-3 right-3">
                    <h3 className="font-bold text-white text-sm leading-tight drop-shadow-lg">
                      {service.title}
                    </h3>
                  </div>
                </div>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-base font-extrabold text-gray-900">
                        {service.price > 0 ? `Rp ${new Intl.NumberFormat("id-ID").format(service.price)}` : "Hubungi Kami"}
                      </span>
                      {service.price > 0 && (
                        <span className="text-[10px] text-gray-400 ml-1">
                          / {SERVICE_PRICE_UNIT_MAP[service.priceUnit] || ""}
                        </span>
                      )}
                    </div>
                    {service.duration && (
                      <span className="text-[10px] font-medium text-gray-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {service.duration}
                      </span>
                    )}
                  </div>
                  {service.features.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2.5">
                      {service.features.slice(0, 2).map((f, i) => (
                        <span key={i} className="text-[9px] font-medium px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-500">
                          {f}
                        </span>
                      ))}
                      {service.features.length > 2 && (
                        <span className="text-[9px] font-medium px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-400">
                          +{service.features.length - 2}
                        </span>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </FadeIn>
          ))}
        </div>

        <FadeIn className="text-center mt-10">
          <button
            onClick={() => router.push("/?tab=jasa")}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gray-100 text-gray-600 font-semibold rounded-xl hover:bg-gray-100 transition-colors"
          >
            Lihat Semua Jasa
            <ArrowRight className="w-4 h-4" />
          </button>
        </FadeIn>
      </div>
    </section>
  );
}

/* ─────────────────────────── BLOG PREVIEW ─────────────────────────── */

function BlogPreviewSection() {
  const router = useRouter();
  const { articles, fetchArticles } = useBlogStore();
  const displayArticles = articles.slice(0, 3);

  useEffect(() => {
    fetchArticles();
  }, [fetchArticles]);

  const COLORS = [
    "from-gray-800 to-gray-900",
    "from-gray-700 to-gray-800",
    "from-gray-600 to-gray-700",
    "from-gray-500 to-gray-600",
    "from-gray-800 to-gray-950",
    "from-gray-700 to-gray-900",
    "from-gray-600 to-gray-800",
    "from-gray-500 to-gray-700",
  ];

  return (
    <section className="py-20 md:py-28 bg-section-gray relative overflow-hidden">
      {/* Ambient floating */}
      <motion.div
        animate={{ y: [0, 15, -10, 0], x: [0, -10, 5, 0] }}
        transition={{ duration: 17, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-[15%] right-[-5%] w-[280px] h-[280px] rounded-full bg-gray-200/30 blur-3xl"
      />
      <FloatingParticles count={3} dark={false} />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeIn className="text-center mb-12">
          <Badge variant="secondary" className="mb-4 bg-gray-100 text-gray-600 border-gray-200">
            <BookOpen className="w-3.5 h-3.5 mr-1.5" />
            Blog & Artikel
          </Badge>
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">
            Informasi <span className="text-gray-900">Terbaru</span>
          </h2>
          <p className="text-gray-500 max-w-2xl mx-auto text-lg">
            Tips, panduan, dan informasi seputar properti, KPR, dan investasi rumah.
          </p>
        </FadeIn>

        {displayArticles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayArticles.map((article, i) => {
              const color = COLORS[i % COLORS.length];
              const coverImg = article.images?.[0];
              return (
                <FadeIn key={article.id} delay={i * 0.1}>
                  <Card onClick={() => router.push(`/?tab=blog/${article.slug}`)} className="h-full border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden group cursor-pointer">
                    <div className="h-40 overflow-hidden relative">
                      {coverImg ? (
                        <img src={coverImg} alt={article.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      ) : (
                        <div className={`h-full bg-gradient-to-br ${color} flex items-center justify-center`}>
                          <BookOpen className="w-12 h-12 text-white/30" />
                        </div>
                      )}
                      <Badge className="absolute top-3 left-3 bg-white/20 text-white border-0 backdrop-blur-sm text-xs">
                        {article.category}
                      </Badge>
                    </div>
                    <CardContent className="p-5">
                      <div className="flex items-center gap-3 text-xs text-gray-400 mb-3">
                        <span>{article.dateFormatted || article.createdAt}</span>
                        <span>•</span>
                        <span>{article.readTime || "5 menit"}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{article.views || 0}</span>
                      </div>
                      <h3 className="font-bold text-gray-900 mb-2 group-hover:text-gray-900 transition-colors line-clamp-2">
                        {article.title}
                      </h3>
                      <p className="text-sm text-gray-500 leading-relaxed line-clamp-2">
                        {article.excerpt}
                      </p>
                    </CardContent>
                  </Card>
                </FadeIn>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-400">
            <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm">Belum ada artikel.</p>
          </div>
        )}

        <FadeIn className="text-center mt-10">
          <button
            onClick={() => router.push("/?tab=blog")}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gray-100 text-gray-600 font-semibold rounded-xl hover:bg-gray-100 transition-colors"
          >
            Lihat Semua Artikel
            <ArrowRight className="w-4 h-4" />
          </button>
        </FadeIn>
      </div>
    </section>
  );
}

/* ─────────────────────────── PAGE BANNER ─────────────────────────── */

function PageBanner({ title, subtitle }: { title: string; subtitle?: string }) {
  const { settings: S } = useSettingsStore();
  const bannerImg = S.page_banner_image;
  return (
    <section className="relative py-24 md:py-32 flex items-center justify-center overflow-hidden bg-gray-950">
      {/* Background image from settings */}
      {bannerImg && (
        <>
          <img src={bannerImg} alt="" className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gray-950/75" />
        </>
      )}
      {/* Animated gradient background (fallback when no image) */}
      {!bannerImg && (
        <div className="absolute inset-0 bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950" />
      )}
      {/* Animated floating orbs */}
      <motion.div
        animate={{ scale: [1, 1.2, 1], opacity: [0.03, 0.06, 0.03] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-white blur-3xl"
      />
      <motion.div
        animate={{ scale: [1.2, 1, 1.2], opacity: [0.04, 0.02, 0.04] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-white blur-3xl"
      />
      {/* Subtle grid pattern */}
      <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.5) 1px, transparent 0)', backgroundSize: '40px 40px' }} />

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="h-px w-10 bg-gray-500" />
            <span className="text-gray-400 text-xs font-bold uppercase tracking-[0.25em]">{subtitle}</span>
            <div className="h-px w-10 bg-gray-500" />
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white leading-tight tracking-tight drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">{title}</h1>
        </motion.div>
      </div>
    </section>
  );
}

/* ─────────────────────────── PROPERTIES (existing) ─────────────────────────── */

function PropertyCard({
  property,
  onSelect,
}: {
  property: Property;
  onSelect: (p: Property) => void;
}) {
  const finTypes = property.financingTypes ?? ["syariah", "kpr"];
  // Get cheapest KPR installment (longest tenor preferred)
  const bestKpr = getCheapestKprInstallment(property);

  return (
    <FadeIn className="h-full">
      <Card className="group h-full overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
        {/* Image */}
        <div className="relative h-52 overflow-hidden bg-gray-200">
          {property.image ? (
            <img
              src={property.image}
              alt={property.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              <Home className="w-12 h-12" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
          <div className="absolute top-3 left-3 flex gap-1.5">
            {property.tag && (
              <Badge className="bg-gray-900 text-white border-0 shadow-lg text-[10px] px-2">
                {property.tag}
              </Badge>
            )}
            <Badge className="bg-white/90 text-gray-700 border-0 shadow-lg text-[10px] px-2">
              {CATEGORY_LABELS[property.category as PropertyCategory] || property.category}
            </Badge>
          </div>
          <div className="absolute top-3 right-3 flex gap-1">
            {finTypes.includes("syariah") && (
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-gray-500/90 text-white backdrop-blur-sm">Syariah</span>
            )}
            {finTypes.includes("kpr") && (
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-gray-500/90 text-white backdrop-blur-sm">KPR</span>
            )}
          </div>
          <div className="absolute bottom-3 left-3 right-3">
            <p className="text-white text-xs flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {property.location}
            </p>
          </div>
        </div>

        <CardContent className="p-5">
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="secondary" className="bg-gray-100 text-gray-600 text-xs font-semibold">
              {CATEGORY_LABELS[property.category as PropertyCategory] || property.category}
            </Badge>
            {property.category !== "kavling" && property.type && (
              <Badge variant="secondary" className="bg-gray-100 text-gray-600 text-xs font-semibold">
                {property.type}
              </Badge>
            )}
          </div>

          <h3 className="font-bold text-base text-gray-900 mb-1 group-hover:text-gray-900 transition-colors line-clamp-1">
            {property.name}
          </h3>

          <div className="flex items-baseline gap-1 mb-3">
            <span className="text-lg font-extrabold text-gray-900">
              Rp {new Intl.NumberFormat("id-ID").format(property.price)}{" "}
              <span className="text-sm font-medium text-gray-500">Juta</span>
            </span>
          </div>

          {/* Spec pills: kavling shows LT + price/m²; non-kavling shows LT, LB, KT, KM */}
          {property.category === "kavling" ? (
            <div className="grid grid-cols-2 gap-2 mb-3">
              <div className="text-center p-2 bg-gray-50 rounded-lg">
                <p className="text-[10px] text-gray-700">LT</p>
                <p className="text-xs font-bold text-gray-700">{property.landArea}<span className="text-[10px] font-normal"> m²</span></p>
              </div>
              <div className="text-center p-2 bg-gray-50 rounded-lg">
                <p className="text-[10px] text-gray-700">Harga/m²</p>
                <p className="text-xs font-bold text-gray-700">{property.landArea > 0 ? `${new Intl.NumberFormat("id-ID").format(Math.round(property.price / property.landArea * 10) / 10)} Jt/m²` : "-"}</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-4 gap-2 mb-3">
              <div className="text-center p-2 bg-gray-50 rounded-lg">
                <p className="text-[10px] text-gray-400">LB</p>
                <p className="text-xs font-bold text-gray-700">{property.buildingArea}<span className="text-[10px] font-normal"> m²</span></p>
              </div>
              <div className="text-center p-2 bg-gray-50 rounded-lg">
                <p className="text-[10px] text-gray-400">LT</p>
                <p className="text-xs font-bold text-gray-700">{property.landArea}<span className="text-[10px] font-normal"> m²</span></p>
              </div>
              <div className="text-center p-2 bg-gray-50 rounded-lg">
                <p className="text-[10px] text-gray-400">KT</p>
                <p className="text-xs font-bold text-gray-700">{property.bedrooms}</p>
              </div>
              <div className="text-center p-2 bg-gray-50 rounded-lg">
                <p className="text-[10px] text-gray-400">KM</p>
                <p className="text-xs font-bold text-gray-700">{property.bathrooms}</p>
              </div>
            </div>
          )}

          {/* Features */}
          {(() => {
            let featList: string[] = [];
            try {
              const raw = typeof property.features === "string" ? JSON.parse(property.features) : property.features;
              featList = Array.isArray(raw) ? raw.map(String) : typeof raw === "string" && raw.trim() ? raw.split(",").map((s: string) => s.trim()).filter(Boolean) : [];
            } catch { featList = []; }
            if (featList.length === 0) return null;
            return (
              <div className="flex flex-wrap gap-1.5 mb-3">
                {featList.slice(0, 4).map((f) => (
                  <span key={f} className="text-[11px] px-2 py-0.5 bg-gray-50 text-gray-600 rounded-md border border-gray-200">
                    {f}
                  </span>
                ))}
                {featList.length > 4 && (
                  <span className="text-[11px] px-2 py-0.5 bg-gray-100 text-gray-500 rounded-md">
                    +{featList.length - 4}
                  </span>
                )}
              </div>
            );
          })()}

          <Separator className="mb-3" />

          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] text-gray-400 uppercase tracking-wider">Cicilan Mulai</p>
              <p className="text-sm font-bold text-gray-600">
                {bestKpr ? `Rp ${new Intl.NumberFormat("id-ID").format(Math.round(bestKpr.amount * 1_000_000))}/bln` : "Hubungi kami"}
              </p>
            </div>
            <Button onClick={() => onSelect(property)} size="sm" className="bg-gradient-to-r from-gray-800 to-gray-900 hover:from-gray-900 hover:to-gray-900 text-white shadow-md ">
              Detail <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </FadeIn>
  );
}

/* ─────────────────────────── PAGINATION ─────────────────────────── */
const PROYEK_PER_PAGE = 9;
const GALLERY_PER_PAGE = 12;
const JASA_PER_PAGE = 9;

function Pagination({ currentPage, totalPages, onPageChange }: { currentPage: number; totalPages: number; onPageChange: (p: number) => void }) {
  if (totalPages <= 1) return null;

  const pages: (number | "...")[] = [];
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) {
      pages.push(i);
    } else if (pages[pages.length - 1] !== "...") {
      pages.push("...");
    }
  }

  return (
    <div className="flex items-center justify-center gap-1.5 mt-10">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="w-9 h-9 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-100 hover:text-gray-900 hover:border-gray-200 transition-all disabled:opacity-30 disabled:pointer-events-none"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>
      {pages.map((p, i) =>
        p === "..." ? (
          <span key={`dots-${i}`} className="w-9 h-9 flex items-center justify-center text-gray-400 text-sm">...</span>
        ) : (
          <button
            key={p}
            onClick={() => onPageChange(p)}
            className={`w-9 h-9 flex items-center justify-center rounded-lg text-sm font-semibold transition-all ${
              currentPage === p
                ? "bg-gray-900 text-white shadow-md "
                : "border border-gray-200 text-gray-600 hover:bg-gray-100 hover:text-gray-900 hover:border-gray-200"
            }`}
          >
            {p}
          </button>
        )
      )}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="w-9 h-9 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-100 hover:text-gray-900 hover:border-gray-200 transition-all disabled:opacity-30 disabled:pointer-events-none"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}

function PropertiesSection({
  onSelectProperty,
}: {
  onSelectProperty: (p: Property) => void;
}) {
  const { properties: PROPERTIES } = usePropertyStore();
  const [filter, setFilter] = useState<"semua" | "termurah" | "terlaris">(
    "semua"
  );
  const [activeCategory, setActiveCategory] = useState<PropertyCategory | "all">("all");
  const [page, setPage] = useState(1);
  const [prevFilterKey, setPrevFilterKey] = useState(`${activeCategory}-${filter}`);

  if (prevFilterKey !== `${activeCategory}-${filter}`) {
    setPrevFilterKey(`${activeCategory}-${filter}`);
    setPage(1);
  }

  const filtered = PROPERTIES.filter((p) => {
    if (activeCategory !== "all" && p.category !== activeCategory) return false;
    if (filter === "termurah") return p.price <= 250;
    if (filter === "terlaris")
      return ["Best Seller", "Populer", "Eksklusif"].includes(p.tag);
    return true;
  });

  const totalPages = Math.ceil(filtered.length / PROYEK_PER_PAGE);
  const paged = filtered.slice((page - 1) * PROYEK_PER_PAGE, page * PROYEK_PER_PAGE);

  const categories: { key: PropertyCategory | "all"; label: string; icon: typeof Hammer }[] = [
    { key: "all", label: "Semua", icon: Home },
    { key: "inden", label: "Inden", icon: Hammer },
    { key: "kavling", label: "Kavling", icon: LandPlot },
    { key: "siap_huni", label: "Siap Huni", icon: KeyRound },
  ];

  return (
    <section className="py-20 md:py-28 bg-section-gray">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeIn className="text-center mb-12">
          <Badge
            variant="secondary"
            className="mb-4 bg-gray-100 text-gray-600 border-gray-200"
          >
            <Home className="w-3.5 h-3.5 mr-1.5" />
            Katalog Properti
          </Badge>
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">
            Pilih Rumah <span className="text-gray-900">Idaman</span> Anda
          </h2>
          <p className="text-gray-500 max-w-2xl mx-auto text-lg">
            Tersedia berbagai tipe rumah dengan harga terjangkau dan skema
            pembayaran Syariah & KPR yang fleksibel.
          </p>
        </FadeIn>

        {/* Filter Inputs */}
        <FadeIn delay={0.1} className="mb-10">
          <div className="flex flex-wrap justify-center gap-3">
            {/* Category filter pills */}
            {[
              { key: "all", label: "Semua", icon: Home },
              { key: "inden", label: "Inden", icon: Hammer },
              { key: "kavling", label: "Kavling", icon: LandPlot },
              { key: "siap_huni", label: "Siap Huni", icon: KeyRound },
            ].map((cat) => {
              const Icon = cat.icon;
              const isActive = activeCategory === cat.key;
              return (
                <button
                  key={cat.key}
                  onClick={() => setActiveCategory(cat.key as PropertyCategory | "all")}
                  className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                    isActive
                      ? "bg-gray-900 text-white shadow-lg shadow-gray-900/20"
                      : "bg-white text-gray-600 border border-gray-200 hover:border-gray-300 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {cat.label}
                </button>
              );
            })}

            {/* Divider */}
            <div className="w-px bg-gray-200 self-stretch hidden sm:block" />

            {/* Sort filter */}
            <div className="relative">
              <Select value={filter} onValueChange={(v) => setFilter(v as "semua" | "termurah" | "terlaris")}>
                <SelectTrigger className="w-[170px] h-11 text-sm font-semibold bg-white border-gray-200 rounded-xl focus:ring-gray-400 focus:border-gray-400 shadow-sm">
                  <SelectValue placeholder="Urutkan" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="semua" className="rounded-lg py-2.5">Semua Harga</SelectItem>
                  <SelectItem value="termurah" className="rounded-lg py-2.5">Termurah</SelectItem>
                  <SelectItem value="terlaris" className="rounded-lg py-2.5">Terlaris</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </FadeIn>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {paged.map((property) => (
            <PropertyCard
              key={property.id}
              property={property}
              onSelect={onSelectProperty}
            />
          ))}
        </div>

        <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
      </div>
    </section>
  );
}

/* ─────────────────────────── LIGHTBOX ─────────────────────────── */

function LightboxOverlay({
  images,
  activeIndex,
  onClose,
}: {
  images: string[];
  activeIndex: number;
  onClose: () => void;
}) {
  const [current, setCurrent] = useState(activeIndex);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft" && current > 0) setCurrent((c) => c - 1);
      if (e.key === "ArrowRight" && current < images.length - 1)
        setCurrent((c) => c + 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [current, images.length, onClose]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center"
      onClick={onClose}
    >
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-10 w-10 h-10 flex items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
      >
        <X className="w-6 h-6" />
      </button>

      <div className="absolute top-4 left-4 bg-white/10 backdrop-blur-sm text-white text-sm px-3 py-1.5 rounded-lg">
        {current + 1} / {images.length}
      </div>

      {images.length > 1 && (
        <>
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (current > 0) setCurrent((c) => c - 1);
            }}
            disabled={current === 0}
            className={`absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 z-10 w-11 h-11 flex items-center justify-center rounded-full transition-all ${
              current === 0
                ? "bg-white/5 text-white/20 cursor-not-allowed"
                : "bg-white/10 text-white hover:bg-white/20"
            }`}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (current < images.length - 1) setCurrent((c) => c + 1);
            }}
            disabled={current === images.length - 1}
            className={`absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 z-10 w-11 h-11 flex items-center justify-center rounded-full transition-all ${
              current === images.length - 1
                ? "bg-white/5 text-white/20 cursor-not-allowed"
                : "bg-white/10 text-white hover:bg-white/20"
            }`}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>
          </button>
        </>
      )}

      <AnimatePresence mode="wait">
        <motion.img
          key={current}
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.92 }}
          transition={{ duration: 0.25 }}
          src={images[current]}
          alt={`Foto ${current + 1}`}
          className="max-w-[90vw] max-h-[85vh] object-contain rounded-lg"
          onClick={(e) => e.stopPropagation()}
        />
      </AnimatePresence>

      {images.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 max-w-[90vw] overflow-x-auto px-2">
          {images.map((img, idx) => (
            <button
              key={idx}
              onClick={(e) => {
                e.stopPropagation();
                setCurrent(idx);
              }}
              className={`flex-shrink-0 w-16 h-12 rounded-lg overflow-hidden border-2 transition-all cursor-pointer ${
                current === idx
                  ? "border-gray-500 opacity-100"
                  : "border-transparent opacity-40 hover:opacity-80"
              }`}
            >
              <img
                src={img}
                alt={`Mini ${idx + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </motion.div>
  );
}

/* ─────────────────────────── PROPERTY GALLERY ─────────────────────────── */

function PropertyGallery({
  images,
  name,
  tag,
  location,
}: {
  images: string[];
  name: string;
  tag: string;
  location: string;
}) {
  const [activeImg, setActiveImg] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  return (
    <>
      <div
        className="relative h-72 sm:h-80 overflow-hidden rounded-t-xl cursor-pointer group"
        onClick={() => setLightboxOpen(true)}
      >
        <AnimatePresence mode="wait">
          {images[activeImg] ? (
            <motion.img
              key={activeImg}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              src={images[activeImg]}
              alt={`${name} - Foto ${activeImg + 1}`}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-400">
              <Home className="w-12 h-12" />
            </div>
          )}
        </AnimatePresence>
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        <div className="absolute top-3 left-3 z-10 w-9 h-9 flex items-center justify-center rounded-full bg-black/40 text-white opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm">
          <Camera className="w-4 h-4" />
        </div>
        <div className="absolute bottom-4 left-6 right-6">
          <Badge className="bg-gray-900 text-white border-0 mb-2">
            {tag}
          </Badge>
          <h3 className="text-2xl font-extrabold text-white">
            {name}
          </h3>
          <p className="text-white/80 text-sm flex items-center gap-1 mt-1">
            <MapPin className="w-3.5 h-3.5" />
            {location}
          </p>
        </div>
        {images.length > 1 && (
          <div className="absolute top-3 right-3 bg-black/50 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-lg">
            {activeImg + 1}/{images.length}
          </div>
        )}
      </div>

      {images.length > 1 && (
        <div className="flex gap-2 p-3 bg-gray-50 overflow-x-auto">
          {images.filter(Boolean).map((img, idx) => (
            <button
              key={idx}
              onClick={() => {
                const realIdx = images.indexOf(img);
                setActiveImg(realIdx);
                setLightboxOpen(true);
              }}
              className={`flex-shrink-0 w-20 h-14 rounded-lg overflow-hidden border-2 transition-all cursor-pointer ${
                activeImg === images.indexOf(img)
                  ? "border-gray-900 shadow-md "
                  : "border-transparent opacity-60 hover:opacity-100"
              }`}
            >
              <img
                src={img}
                alt={`Thumbnail ${idx + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}

      <AnimatePresence>
        {lightboxOpen && (
          <LightboxOverlay
            images={images}
            activeIndex={activeImg}
            onClose={() => setLightboxOpen(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
}

/* ─────────────────────────── DETAIL SIMULASI CICILAN ─────────────────────────── */

function DetailSimulasiCicilan({ property }: { property: Property }) {
  const { settings: S } = useSettingsStore();
  const finTypes = property.financingTypes ?? ["syariah", "kpr"];
  const hasSyariah = finTypes.includes("syariah");
  const hasKPR = finTypes.includes("kpr");

  const [finType, setFinType] = useState<"syariah" | "kpr">(hasSyariah ? "syariah" : "kpr");
  const [dp, setDp] = useState(
    hasSyariah ? String(property.dpOptions?.[0] ?? 30) : String(property.kprDpOptions?.[0] ?? 1000000)
  );
  const [tenor, setTenor] = useState(
    hasSyariah ? String(property.tenorOptions?.[property.tenorOptions.length - 1] ?? 5) : String(property.kprTenorOptions?.[0] ?? 5)
  );

  if (!hasSyariah && !hasKPR) return null;

  const isKpr = finType === "kpr";
  const dpNum = parseInt(dp);
  const tenorNum = parseInt(tenor);

  const dpOptions = isKpr ? (property.kprDpOptions ?? [1000000, 2000000, 3000000, 4000000, 5000000]) : (property.dpOptions ?? [30, 50]);
  const tenorOptions = isKpr ? (property.kprTenorOptions ?? [5, 10, 15, 20]) : (property.tenorOptions ?? [1, 5]);
  const dpMin = dpOptions[0];
  const dpMax = dpOptions[dpOptions.length - 1];
  const tenorMin = tenorOptions[0];
  const tenorMax = tenorOptions[tenorOptions.length - 1];

  const formatRp = (n: number) => new Intl.NumberFormat("id-ID").format(Math.round(n));
  const formatRpShort = (n: number) => {
    if (n >= 1_000_000_000) return (n / 1_000_000_000).toFixed(1).replace('.0', '') + ' M';
    if (n >= 1_000_000) return (n / 1_000_000).toFixed(0) + ' jt';
    if (n >= 1_000) return (n / 1_000).toFixed(0) + ' rb';
    return String(n);
  };
  const formatDpLabel = (val: number) => isKpr ? `Rp ${formatRpShort(val)}` : `${val}%`;

  // DP amount in juta
  const dpAmountJuta = isKpr ? dpNum / 1_000_000 : property.price * dpNum / 100;
  const remainingJuta = property.price - dpAmountJuta;

  // Syariah calculation
  const syariahMonthly = (() => {
    if (!hasSyariah) return 0;
    const margin = property.syariahMargin ?? 15;
    if (property.price <= 0 || margin <= 0 || tenorNum <= 0) return 0;
    const dpAmt = property.price * 1_000_000 * (dpNum / 100);
    const sellingPrice = property.price * 1_000_000 * (1 + margin / 100);
    const loan = sellingPrice - dpAmt;
    return loan / (tenorNum * 12) / 1_000_000;
  })();

  // KPR calculation
  const kprMonthly = (() => {
    if (!hasKPR) return 0;
    const saved = property.kprInstallments?.[String(dpNum)]?.[String(tenorNum)];
    if (saved && saved > 0) return saved;
    const rate = (property.kprInterestRate ?? 7.5) / 100;
    const loanRupiah = remainingJuta * 1_000_000;
    const r = rate / 12;
    const n = tenorNum * 12;
    if (loanRupiah <= 0 || r === 0 || n === 0) return 0;
    return (loanRupiah * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1) / 1_000_000;
  })();

  const monthly = isKpr ? kprMonthly : syariahMonthly;

  const handleFinTypeChange = (type: "syariah" | "kpr") => {
    setFinType(type);
    if (type === "syariah") {
      const dps = property.dpOptions ?? [30, 50];
      if (!dps.includes(dpNum)) setDp(String(dps[0]));
      const tenors = property.tenorOptions ?? [1, 5];
      if (!tenors.includes(tenorNum)) setTenor(String(tenors[tenors.length - 1]));
    } else {
      const dps = property.kprDpOptions ?? [1000000, 2000000, 3000000, 4000000, 5000000];
      if (!dps.includes(dpNum)) setDp(String(dps[0]));
      const tenors = property.kprTenorOptions ?? [5, 10, 15, 20];
      if (!tenors.includes(tenorNum)) setTenor(String(tenors[0]));
    }
  };

  return (
    <div className="mb-5 border border-gray-200 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-800 to-gray-900 px-5 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Calculator className="w-5 h-5 text-white" />
          <span className="text-white font-bold text-sm">Simulasi Cicilan</span>
        </div>
        {/* Fin type tabs */}
        {hasSyariah && hasKPR && (
          <div className="inline-flex bg-white/20 rounded-lg p-0.5">
            {(["syariah", "kpr"] as const).map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => handleFinTypeChange(type)}
                className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${
                  finType === type
                    ? "bg-white text-gray-600 shadow-sm"
                    : "text-white/80 hover:text-white"
                }`}
              >
                {type === "syariah" ? "Syariah" : "KPR"}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="p-5 space-y-4">
        {/* Result */}
        <div className="text-center py-2">
          <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-0.5">Cicilan Bulanan</p>
          <p className="text-3xl font-extrabold text-gray-900">
            Rp {formatRp(monthly * 1_000_000)}
            <span className="text-sm font-medium text-gray-400 ml-1">/bln</span>
          </p>
          <p className="text-[10px] text-gray-400 mt-1">
            {isKpr
              ? `KPR ${tenor} thn · DP ${formatDpLabel(dpNum)}`
              : `Syariah ${tenor} thn · DP ${dpNum}%`}
          </p>
        </div>

        {/* DP Slider */}
        <div>
          <p className="text-xs font-semibold text-gray-600 mb-1.5">
            Uang Muka (DP): <span className="text-gray-900">{formatDpLabel(dpNum)}</span>
          </p>
          <input
            type="range"
            min={dpMin}
            max={dpMax}
            step={dpOptions.length > 1 ? (dpOptions[1] - dpOptions[0]) : (isKpr ? 1000000 : 5)}
            value={dp}
            onChange={(e) => {
              const val = parseInt(e.target.value);
              const closest = dpOptions.reduce((a, b) =>
                Math.abs(b - val) < Math.abs(a - val) ? b : a
              );
              setDp(String(closest));
            }}
            className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-gray-900"
          />
          <div className="flex justify-between text-[10px] text-gray-400 mt-1">
            {dpOptions.map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => setDp(String(opt))}
                className={`${dpNum === opt ? "text-gray-900 font-bold" : "hover:text-gray-600"} transition-colors`}
              >
                {formatDpLabel(opt)}
              </button>
            ))}
          </div>
        </div>

        {/* Tenor Slider */}
        <div>
          <p className="text-xs font-semibold text-gray-600 mb-1.5">
            Tenor: <span className="text-gray-900">{tenor} Tahun</span>
          </p>
          <input
            type="range"
            min={tenorMin}
            max={tenorMax}
            step={1}
            value={tenor}
            onChange={(e) => {
              const val = parseInt(e.target.value);
              const closest = tenorOptions.reduce((a, b) =>
                Math.abs(b - val) < Math.abs(a - val) ? b : a
              );
              setTenor(String(closest));
            }}
            className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-gray-900"
          />
          <div className="flex justify-between text-[10px] text-gray-400 mt-1">
            {tenorOptions.map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => setTenor(String(opt))}
                className={`${tenorNum === opt ? "text-gray-900 font-bold" : "hover:text-gray-600"} transition-colors`}
              >
                {opt} Thn
              </button>
            ))}
          </div>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="bg-gray-50 rounded-lg p-2">
            <p className="text-[10px] text-gray-400">Harga</p>
            <p className="text-xs font-bold text-gray-700">{new Intl.NumberFormat("id-ID").format(property.price)} jt</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-2">
            <p className="text-[10px] text-gray-400">DP</p>
            <p className="text-xs font-bold text-gray-700">{isKpr ? formatRpShort(dpNum) : `${dpNum}%`}</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-2">
            <p className="text-[10px] text-gray-400">Sisa</p>
            <p className="text-xs font-bold text-gray-700">{remainingJuta.toFixed(0)} jt</p>
          </div>
        </div>

        {/* WA Button */}
        <a
          href={`https://wa.me/${S.contact_wa}?text=Halo,%20saya%20tertarik%20simulasi%20cicilan:%0AProperti:%20${encodeURIComponent(property.name)}%0AHarga:%20Rp%20${property.price}%20Juta%0ATipe:%20${isKpr ? "KPR" : "Syariah"}%0ADP:%20${encodeURIComponent(formatDpLabel(dpNum))}%0ATenor:%20${tenor}%20tahun%0ACicilan:%20Rp%20${formatRp(monthly * 1_000_000)}/bulan`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-gray-900 text-white text-sm font-semibold rounded-lg hover:bg-gray-800 transition-colors"
        >
          <MessageCircle className="w-4 h-4" />
          Konsultasi via WhatsApp
        </a>
      </div>
    </div>
  );
}

/* ─────────────────────────── PROPERTY DETAIL DIALOG ─────────────────────────── */

function PropertyDetailDialog({
  property,
  open,
  onClose,
}: {
  property: Property | null;
  open: boolean;
  onClose: () => void;
}) {
  const { settings: S } = useSettingsStore();
  const images = property?.gallery || (property ? [property.image] : []);

  if (!property) return null;

  const formatRp = (n: number) =>
    new Intl.NumberFormat("id-ID").format(Math.round(n));

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0">
        <DialogHeader className="sr-only">
          <DialogTitle>{property.name} - {property.type}</DialogTitle>
          <DialogDescription>Detail properti {property.name} tipe {property.type} di {property.location}</DialogDescription>
        </DialogHeader>
        <PropertyGallery
          images={images}
          name={property.name}
          tag={property.tag}
          location={property.location}
        />

        <div className="p-6">
          {/* Title & Badges */}
          <div className="flex items-start gap-2 mb-4">
            <div className="flex-1">
              <h3 className="text-xl font-extrabold text-gray-900">{property.name}</h3>
              <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                <MapPin className="w-3.5 h-3.5" />
                {property.location}
              </p>
            </div>
            <div className="flex flex-col gap-1.5">
              <Badge variant="secondary" className="bg-gray-100 text-gray-600 text-xs font-semibold w-fit">
                {CATEGORY_LABELS[property.category as PropertyCategory] || property.category}
              </Badge>
              {property.category !== "kavling" && (
              <Badge variant="secondary" className="bg-gray-100 text-gray-600 text-xs w-fit">
                {property.type}
              </Badge>
              )}
              <div className="flex gap-1">
                {(property.financingTypes ?? []).includes("syariah") && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-gray-100 text-gray-600">Syariah</span>
                )}
                {(property.financingTypes ?? []).includes("kpr") && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-gray-200 text-gray-700">KPR Bank</span>
                )}
              </div>
            </div>
          </div>

          {/* Price & Type */}
          <div className="grid grid-cols-2 gap-4 mb-5">
            <div className="bg-gray-100 rounded-xl p-4 text-center">
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">{property.category === "kavling" ? "Harga Tanah" : "Harga Rumah"}</p>
              <p className="text-base font-extrabold text-gray-600">Rp {new Intl.NumberFormat("id-ID").format(property.price)} Juta</p>
            </div>
            {property.category === "kavling" ? (
              <div className="bg-gray-50 rounded-xl p-4 text-center">
                <p className="text-xs text-gray-700 uppercase tracking-wider mb-1">Luas Tanah</p>
                <p className="text-xl font-extrabold text-gray-600">{property.landArea} Meter²</p>
                {property.landArea > 0 && (
                  <p className="text-[11px] text-gray-400 mt-0.5">
                    Harga per m²: Rp {new Intl.NumberFormat("id-ID").format(Math.round(property.price / property.landArea * 10) / 10)} Juta
                  </p>
                )}
              </div>
            ) : (
              <div className="bg-gray-50 rounded-xl p-4 text-center">
                <p className="text-xs text-gray-700 uppercase tracking-wider mb-1">Tipe Bangunan</p>
                <p className="text-xl font-extrabold text-gray-600">{property.type}</p>
                <p className="text-[11px] text-gray-400 mt-0.5">LB {property.buildingArea} m² / LT {property.landArea} m²</p>
              </div>
            )}
          </div>

          {/* Spec Grid: only for non-kavling */}
          {property.category !== "kavling" && (
          <div className="grid grid-cols-4 gap-2 mb-5">
            <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-xl">
              <Building2 className="w-5 h-5 text-gray-500 shrink-0" />
              <div>
                <p className="text-[10px] text-gray-400">Luas Bangun</p>
                <p className="font-bold text-sm">{property.buildingArea} m²</p>
              </div>
            </div>
            <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-xl">
              <LandPlot className="w-5 h-5 text-gray-500 shrink-0" />
              <div>
                <p className="text-[10px] text-gray-400">Luas Tanah</p>
                <p className="font-bold text-sm">{property.landArea} m²</p>
              </div>
            </div>
            <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-xl">
              <Home className="w-5 h-5 text-gray-500 shrink-0" />
              <div>
                <p className="text-[10px] text-gray-400">Kamar Tidur</p>
                <p className="font-bold text-sm">{property.bedrooms}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-xl">
              <Users className="w-5 h-5 text-gray-500 shrink-0" />
              <div>
                <p className="text-[10px] text-gray-400">Kamar Mandi</p>
                <p className="font-bold text-sm">{property.bathrooms}</p>
              </div>
            </div>
          </div>
          )}

          {/* Description */}
          {property.description && (
            <div className="mb-5">
              <h4 className="font-bold text-gray-900 mb-2">Deskripsi</h4>
              <p className="text-sm text-gray-600 leading-relaxed">{property.description}</p>
            </div>
          )}

          {/* Video */}
          {(() => {
            const embedUrl = getYoutubeEmbedUrl(property.videoUrl || "");
            if (!embedUrl) return null;
            return (
              <div className="mb-5">
                <h4 className="font-bold text-gray-900 mb-2">Video Proyek</h4>
                <p className="text-sm text-gray-500 mb-3">Simak video dokumentasi dan review proyek {property.name} berikut ini.</p>
                <div className="relative w-full overflow-hidden rounded-xl" style={{ paddingBottom: "56.25%" }}>
                  <iframe
                    src={embedUrl}
                    title={property.name}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                    className="absolute inset-0 w-full h-full rounded-xl"
                  />
                </div>
              </div>
            );
          })()}

          {/* Features */}
          {(() => {
            let featList: string[] = [];
            try {
              const raw = typeof property.features === "string" ? JSON.parse(property.features) : property.features;
              featList = Array.isArray(raw) ? raw.map(String) : typeof raw === "string" && raw.trim() ? raw.split(",").map((s: string) => s.trim()).filter(Boolean) : [];
            } catch { featList = []; }
            if (featList.length === 0) return null;
            return (
              <div className="mb-5">
                <h4 className="font-bold text-gray-900 mb-2">Fitur Unggulan</h4>
                <div className="flex flex-wrap gap-2">
                  {featList.map((f) => (
                    <div key={f} className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 text-gray-600 rounded-lg text-sm">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      {f}
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}

          {/* Simulasi Cicilan Calculator */}
          <DetailSimulasiCicilan property={property} />


        </div>
      </DialogContent>
    </Dialog>
  );
}

/* ─────────────────────────── CALCULATOR ─────────────────────────── */

function CalculatorSection() {
  const { settings: S } = useSettingsStore();
  const { properties: PROPERTIES } = usePropertyStore();
  const [finType, setFinType] = useState<"syariah" | "kpr">("syariah");
  const [selectedPropId, setSelectedPropId] = useState("");
  const [dp, setDp] = useState("30");
  const [tenor, setTenor] = useState("5");

  const effectivePropId = selectedPropId || PROPERTIES[0]?.id || "";

  const prop = PROPERTIES.find((p) => p.id === effectivePropId);
  const dpNum = parseInt(dp);
  const tenorNum = parseInt(tenor);

  // Available financing types for this property
  const finTypes = prop?.financingTypes ?? ["syariah", "kpr"];
  const hasSyariah = finTypes.includes("syariah");
  const hasKPR = finTypes.includes("kpr");

  // Effective fin type: only show what's available
  const effectiveFinType = !hasSyariah && hasKPR ? "kpr" : !hasKPR && hasSyariah ? "syariah" : finType;
  const isKpr = effectiveFinType === "kpr";

  // DP amount in juta: Syariah uses %, KPR uses nominal rupiah → convert to juta
  const dpAmountJuta = prop ? (isKpr ? dpNum / 1_000_000 : prop.price * dpNum / 100) : 0;
  const remainingJuta = prop ? (prop.price - dpAmountJuta) : 0;

  /* Syariah: auto-calculate from margin (DP in %) */
  const syariahMonthly = (() => {
    if (!prop || !hasSyariah) return 0;
    const margin = prop.syariahMargin ?? 15;
    if (prop.price <= 0 || margin <= 0 || tenorNum <= 0) return 0;
    const dpAmt = prop.price * 1_000_000 * (dpNum / 100);
    const sellingPrice = prop.price * 1_000_000 * (1 + margin / 100);
    const loan = sellingPrice - dpAmt;
    return loan / (tenorNum * 12) / 1_000_000;
  })();

  /* KPR: from saved grid data or annuity formula fallback (DP in nominal rupiah) */
  const kprMonthly = (() => {
    if (!prop || !hasKPR) return 0;
    // Try from saved KPR grid first (key is DP nominal as string)
    const saved = prop.kprInstallments?.[String(dpNum)]?.[String(tenorNum)];
    if (saved && saved > 0) return saved;
    // Fallback: annuity formula with saved interest rate
    const rate = (prop.kprInterestRate ?? 7.5) / 100;
    const loanRupiah = remainingJuta * 1_000_000;
    const r = rate / 12;
    const n = tenorNum * 12;
    if (loanRupiah <= 0 || r === 0 || n === 0) return 0;
    return (loanRupiah * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1) / 1_000_000;
  })();

  const monthly = effectiveFinType === "syariah" ? syariahMonthly : kprMonthly;
  const isFlat = effectiveFinType === "syariah";

  const formatRp = (n: number) =>
    new Intl.NumberFormat("id-ID").format(Math.round(n));

  const handlePropertyChange = (newId: string) => {
    setSelectedPropId(newId);
    const newProp = PROPERTIES.find((p) => p.id === newId);
    if (newProp) {
      const newTypes = newProp.financingTypes ?? ["syariah", "kpr"];
      if (finType === "syariah" && newTypes.includes("syariah")) {
        if (!newProp.dpOptions.includes(dpNum)) setDp(String(newProp.dpOptions[0]));
        if (!newProp.tenorOptions.includes(tenorNum)) setTenor(String(newProp.tenorOptions[newProp.tenorOptions.length - 1]));
      } else if (finType === "kpr" && newTypes.includes("kpr")) {
        const dps = newProp.kprDpOptions ?? [1000000, 2000000, 3000000, 4000000, 5000000];
        if (!dps.includes(dpNum)) setDp(String(dps[0]));
        const tenors = newProp.kprTenorOptions ?? [5, 10, 15, 20];
        if (!tenors.includes(tenorNum)) setTenor(String(tenors[0]));
      } else {
        // Switch to first available type
        const first = newTypes[0] || "syariah";
        setFinType(first as "syariah" | "kpr");
      }
    }
  };

  const handleFinTypeChange = (type: "syariah" | "kpr") => {
    setFinType(type);
    if (type === "syariah" && prop) {
      if (!prop.dpOptions.includes(dpNum)) setDp(String(prop.dpOptions[0]));
      if (!prop.tenorOptions.includes(tenorNum)) setTenor(String(prop.tenorOptions[prop.tenorOptions.length - 1]));
    } else if (type === "kpr" && prop) {
      const dps = prop.kprDpOptions ?? [1000000, 2000000, 3000000, 4000000, 5000000];
      if (!dps.includes(dpNum)) setDp(String(dps[0]));
      const tenors = prop.kprTenorOptions ?? [5, 10, 15, 20];
      if (!tenors.includes(tenorNum)) setTenor(String(tenors[0]));
    }
  };

  const dpOptions = effectiveFinType === "syariah"
    ? (prop?.dpOptions ?? [30, 50])
    : (prop?.kprDpOptions ?? [1000000, 2000000, 3000000, 4000000, 5000000]);
  const tenorOptions = effectiveFinType === "syariah"
    ? (prop?.tenorOptions ?? [1, 5])
    : (prop?.kprTenorOptions ?? [5, 10, 15, 20]);
  const dpMin = dpOptions[0];
  const dpMax = dpOptions[dpOptions.length - 1];
  const tenorMin = tenorOptions[0];
  const tenorMax = tenorOptions[tenorOptions.length - 1];

  // Format DP label: Rp for KPR, % for Syariah
  const formatRpShort = (n: number) => {
    if (n >= 1_000_000_000) return (n / 1_000_000_000).toFixed(1).replace('.0', '') + ' M';
    if (n >= 1_000_000) return (n / 1_000_000).toFixed(0) + ' jt';
    if (n >= 1_000) return (n / 1_000).toFixed(0) + ' rb';
    return String(n);
  };
  const formatDpLabel = (val: number) => isKpr ? `Rp ${formatRpShort(val)}` : `${val}%`;

  return (
    <section id="simulasi" className="py-20 md:py-28 bg-section-gray relative">
      {/* Decorative circles — clipped independently */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-gray-200/50 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-gray-200/50 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeIn className="text-center mb-8">
          <Badge
            variant="secondary"
            className="mb-4 bg-gray-100 text-gray-600 border-gray-200"
          >
            <Calculator className="w-3.5 h-3.5 mr-1.5" />
            Simulasi Cicilan
          </Badge>
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">
            Hitung <span className="text-gray-900">Cicilan</span> Anda
          </h2>
          <p className="text-gray-500 max-w-2xl mx-auto text-lg">
            Kalkulator simulasi cicilan {effectiveFinType === "syariah" ? "syariah" : "KPR"}. Tentukan DP dan tenor sesuai
            kemampuan Anda.
          </p>
        </FadeIn>

        {/* Financing Type Tabs: only show available types */}
        {hasSyariah && hasKPR && (
        <FadeIn delay={0.05} className="flex justify-center mb-10">
          <div className="inline-flex bg-white rounded-2xl p-1.5 shadow-md border border-gray-100">
            {(["syariah", "kpr"] as const).map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => handleFinTypeChange(type)}
                className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 ${
                  finType === type
                    ? "bg-gradient-to-r from-gray-800 to-gray-900 text-white shadow-lg "
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                }`}
              >
                {type === "syariah" ? "Islamic (Syariah)" : "KPR Bank"}
              </button>
            ))}
          </div>
        </FadeIn>
        )}

        <div className="grid md:grid-cols-2 gap-6 lg:gap-8 max-w-5xl mx-auto items-start">
          <FadeIn direction="left" className="min-w-0 overflow-hidden">
            <Card className="border-0 shadow-xl min-w-0 overflow-hidden">
              <CardContent className="p-5 md:p-8 space-y-6">
                <div>
                  <Label className="text-sm font-semibold text-gray-700 mb-2 block">
                    Pilih Properti
                  </Label>
                  <Select value={effectivePropId} onValueChange={handlePropertyChange}>
                    <SelectTrigger className="h-12 text-sm md:text-base w-full !whitespace-normal rounded-xl border-gray-200 shadow-sm focus:ring-gray-400 focus:border-gray-400">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="max-w-[min(90vw,20rem)] rounded-xl">
                      {PROPERTIES.map((p) => (
                        <SelectItem key={p.id} value={p.id} className="py-3 rounded-lg">
                          <div className="flex flex-col gap-0.5">
                            <span className="font-semibold text-sm leading-tight">{p.name}</span>
                            <span className="text-xs text-gray-500">Rp {new Intl.NumberFormat("id-ID").format(p.price)} Juta</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-sm font-semibold text-gray-700 mb-2 block">
                    Uang Muka (DP): {formatDpLabel(dpNum)}
                  </Label>
                  {isKpr ? (
                    // KPR: slider DP selection (nominal rupiah)
                    <>
                      <input
                        type="range"
                        min={dpMin}
                        max={dpMax}
                        step={dpOptions.length > 1 ? (dpOptions[1] - dpOptions[0]) : 1000000}
                        value={dp}
                        onChange={(e) => {
                          const val = parseInt(e.target.value);
                          const closest = dpOptions.reduce((a, b) =>
                            Math.abs(b - val) < Math.abs(a - val) ? b : a
                          );
                          setDp(String(closest));
                        }}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-gray-900"
                      />
                      <div className="flex justify-between text-xs text-gray-400 mt-1">
                        {dpOptions.map((opt) => (
                          <button
                            key={opt}
                            type="button"
                            onClick={() => setDp(String(opt))}
                            className={`${dpNum === opt ? "text-gray-900 font-bold" : "hover:text-gray-600"} transition-colors`}
                          >
                            Rp {formatRpShort(opt)}
                          </button>
                        ))}
                      </div>
                    </>
                  ) : (
                    // Syariah: slider DP (percentage)
                    <>
                      <input
                        type="range"
                        min={dpMin}
                        max={dpMax}
                        step={dpOptions.length > 2 && (dpOptions[1] - dpOptions[0]) > 5 ? (dpOptions[1] - dpOptions[0]) : 5}
                        value={dp}
                        onChange={(e) => {
                          const val = parseInt(e.target.value);
                          const closest = dpOptions.reduce((a, b) =>
                            Math.abs(b - val) < Math.abs(a - val) ? b : a
                          );
                          setDp(String(closest));
                        }}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-gray-900"
                      />
                      <div className="flex justify-between text-xs text-gray-400 mt-1">
                        {dpOptions.map((opt) => (
                          <button
                            key={opt}
                            type="button"
                            onClick={() => setDp(String(opt))}
                            className={`${dpNum === opt ? "text-gray-900 font-bold" : "hover:text-gray-600"} transition-colors`}
                          >
                            {opt}%
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>

                {/* Tenor: progress bar for both Syariah & KPR */}
                <div>
                  <Label className="text-sm font-semibold text-gray-700 mb-2 block">
                    Tenor{isKpr ? " KPR" : ""}: {tenor} Tahun
                  </Label>
                  <input
                    type="range"
                    min={tenorMin}
                    max={tenorMax}
                    step={1}
                    value={tenor}
                    onChange={(e) => {
                      const val = parseInt(e.target.value);
                      const closest = tenorOptions.reduce((a, b) =>
                        Math.abs(b - val) < Math.abs(a - val) ? b : a
                      );
                      setTenor(String(closest));
                    }}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-gray-900"
                  />
                  <div className="flex justify-between text-xs text-gray-400 mt-1">
                    {tenorOptions.map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => setTenor(String(opt))}
                        className={`${tenorNum === opt ? "text-gray-900 font-bold" : "hover:text-gray-600"} transition-colors`}
                      >
                        {opt} Tahun
                      </button>
                    ))}
                  </div>
                </div>

                <div className={`rounded-xl p-4 border ${effectiveFinType === "syariah" ? "bg-gray-50 border-gray-200" : "bg-gray-50 border-gray-200"}`}>
                  <p className={`text-xs flex items-center gap-1.5 ${effectiveFinType === "syariah" ? "text-gray-600" : "text-blue-700"}`}>
                    {effectiveFinType === "syariah"
                      ? <><Shield className="w-3.5 h-3.5" /> Skema Syariah — tanpa riba, tanpa denda, tanpa penalti. Cicilan flat per bulan.</>
                      : <><Percent className="w-3.5 h-3.5" /> Simulasi KPR Bank — bunga fluktuatif. {prop?.kprInstallments?.[dpNum]?.[tenorNum] ? 'Data dari admin.' : `Estimasi bunga eff. ${prop?.kprInterestRate ?? 7.5}% p.a.`}</>}
                  </p>
                </div>
              </CardContent>
            </Card>
          </FadeIn>

          <FadeIn direction="right" className="min-w-0 overflow-hidden">
            <Card className="border-0 shadow-xl text-white bg-gradient-to-br from-gray-800 to-gray-900 min-w-0 overflow-hidden">
              <CardContent className="p-5 md:p-8">
                <div className="text-center mb-8">
                  <p className="text-gray-400 text-sm uppercase tracking-wider mb-2">
                    Cicilan Bulanan
                  </p>
                  <p className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold break-all">
                    Rp {formatRp(monthly * 1_000_000)}
                  </p>
                  <p className="text-gray-400 text-sm mt-2">
                    /bulan ({isFlat ? "flat" : "annuity"})
                  </p>
                  <Badge className="mt-3 bg-gray-500/20 text-gray-300 border-gray-500/30 text-xs">
                    {effectiveFinType === "syariah" ? "Otomatis dari margin" : prop?.kprInstallments?.[dpNum]?.[tenorNum] ? "Data dari admin" : `Estimasi ${prop?.kprInterestRate ?? 7.5}% p.a.`}
                  </Badge>
                </div>

                <Separator className="bg-white/20 mb-6" />

                <div className="space-y-4">
                  {[
                    { label: "Harga Rumah", value: `Rp ${prop ? new Intl.NumberFormat("id-ID").format(prop.price) : "0"} Juta` },
                    { label: `Uang Muka (${formatDpLabel(dpNum)})`, value: `Rp ${new Intl.NumberFormat("id-ID").format(dpAmountJuta)} Juta` },
                    { label: "Sisa Pembayaran", value: `Rp ${new Intl.NumberFormat("id-ID").format(remainingJuta)} Juta` },
                    { label: `Tenor (${tenor} tahun)`, value: `${tenorNum * 12} bulan` },
                  ].map((row) => (
                    <div key={row.label} className="flex justify-between items-center gap-2 min-w-0">
                      <span className="text-gray-400 text-sm shrink-0">{row.label}</span>
                      <span className="font-bold text-sm md:text-base text-right break-all min-w-0">{row.value}</span>
                    </div>
                  ))}
                </div>

                <Separator className="bg-white/20 my-6" />

                <a
                  href={`https://wa.me/${S.contact_wa}?text=Halo,%20saya%20tertarik%20simulasi%20cicilan:%0AProperti:%20${encodeURIComponent(prop?.name ?? "")}%0AHarga:%20Rp%20${prop?.price}%20Juta%0ATipe:%20${effectiveFinType === "syariah" ? "Syariah" : "KPR"}%0ADP:%20${encodeURIComponent(formatDpLabel(dpNum))}%0ATenor:%20${tenor}%20tahun%0ACicilan:%20Rp%20${formatRp(monthly * 1_000_000)}/bulan`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full px-6 py-4 bg-white text-gray-900 font-bold rounded-xl hover:bg-gray-100 transition-colors shadow-lg text-lg"
                >
                  <MessageCircle className="w-5 h-5" />
                  Konsultasi via WhatsApp
                </a>
              </CardContent>
            </Card>
          </FadeIn>
        </div>

        {/* Installment table */}
        {prop && (
          <FadeIn className="mt-12 max-w-5xl mx-auto">
            <Card className="border-0 shadow-xl overflow-hidden">
              <CardContent className="p-6 md:p-8">
                <h3 className="text-xl font-extrabold text-gray-900 mb-1">
                  Tabel Cicilan {effectiveFinType === "syariah" ? "Syariah" : "KPR"} — {prop.name}
                </h3>
                <p className="text-sm text-gray-500 mb-6">
                  Rp {new Intl.NumberFormat("id-ID").format(prop.price)} Juta
                  {effectiveFinType === "syariah"
                    ? ` · Margin ${(prop.syariahMargin ?? 15)}% · Otomatis dihitung`
                    : " · Bunga fluktuatif per bank"}
                </p>

                <div className="overflow-x-auto">
                  <table className="w-full text-sm border-collapse">
                    <thead>
                      <tr className={`text-white ${effectiveFinType === "syariah" ? "bg-gradient-to-r from-gray-700 to-gray-800" : "bg-gradient-to-r from-gray-800 to-gray-900"}`}>
                        <th className="px-4 py-3 text-left font-semibold rounded-tl-xl">
                          DP {isKpr ? "(Rp)" : "(%)"} ↓ / Tenor →
                        </th>
                        {tenorOptions.map((t) => (
                          <th
                            key={t}
                            className={`px-4 py-3 text-center font-semibold ${t === tenorMax ? "rounded-tr-xl" : ""}`}
                          >
                            {t} Thn
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {dpOptions.map((dpVal, idx) => (
                        <tr
                          key={dpVal}
                          className={`${idx % 2 === 0 ? "bg-white" : effectiveFinType === "syariah" ? "bg-gray-50/50" : "bg-gray-100/50"} ${
                            dpVal === dpNum ? "ring-2 ring-inset " + (effectiveFinType === "syariah" ? "ring-gray-500" : "ring-gray-500") : ""
                          }`}
                        >
                          <td className="px-4 py-3 font-semibold text-gray-700">
                            {isKpr ? `Rp ${formatRpShort(dpVal)}` : `${dpVal}%`}
                          </td>
                          {tenorOptions.map((t) => {
                            let val = 0;
                            if (effectiveFinType === "syariah") {
                              // Auto-calculate from price + margin (DP in %)
                              const margin = prop.syariahMargin ?? 15;
                              const dpAmt = prop.price * (dpVal / 100);
                              const sp = prop.price * (1 + margin / 100);
                              const loan = sp - dpAmt;
                              val = loan / (t * 12);
                            } else {
                              // KPR: from saved grid (DP in nominal) or annuity fallback
                              const saved = prop.kprInstallments?.[String(dpVal)]?.[String(t)];
                              if (saved && saved > 0) { val = saved; }
                              else {
                                const dpJuta = dpVal / 1_000_000;
                                const loanRupiah = (prop.price - dpJuta) * 1_000_000;
                                const r = 0.075 / 12;
                                const n = t * 12;
                                if (loanRupiah > 0 && r > 0 && n > 0) val = (loanRupiah * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1) / 1_000_000;
                              }
                            }
                            const isActive = dpVal === dpNum && t === tenorNum;
                            return (
                              <td
                                key={t}
                                className={`px-4 py-3 text-center ${
                                  isActive
                                    ? effectiveFinType === "syariah"
                                      ? "bg-gray-200 font-extrabold text-gray-800"
                                      : "bg-gray-100 font-extrabold text-gray-600"
                                    : "text-gray-600"
                                }`}
                              >
                                {val > 0
                                  ? `Rp ${formatRp(val * 1_000_000)}`
                                  : "-"}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="mt-4 flex items-center gap-2 text-xs text-gray-400">
                  <div className={`w-3 h-3 rounded border ${effectiveFinType === "syariah" ? "bg-gray-200 border-gray-300" : "bg-gray-100 border-gray-300"}`} />
                  <span>= Kombinasi yang sedang dipilih</span>
                  {effectiveFinType === "syariah" && (
                    <span className="ml-2">✓ Otomatis — Akad Murabahah, cicilan flat per bulan</span>
                  )}
                </div>
              </CardContent>
            </Card>
          </FadeIn>
        )}
      </div>
    </section>
  );
}

/* ─────────────────────────── LOCATION ─────────────────────────── */

function LocationSection() {
  const { settings: S } = useSettingsStore();
  return (
    <section className="py-20 md:py-28 bg-white relative overflow-hidden">
      {/* Animated background decoration */}
      <div className="absolute top-0 right-0 w-72 h-72 bg-gray-100/50 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-gray-100/50 rounded-full blur-3xl" />

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeIn className="text-center mb-14">
          <Badge variant="secondary" className="mb-4 bg-gray-100 text-gray-600 border-gray-200">
            <MapPin className="w-3.5 h-3.5 mr-1.5" />
            Lokasi Strategis
          </Badge>
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">
            Berlokasi di <span className="text-gray-900">Jantung Bandung</span>
          </h2>
          <p className="text-gray-500 text-lg mb-8 leading-relaxed max-w-2xl mx-auto">
            {S.company_name} berlokasi di {S.contact_address} dengan akses mudah ke berbagai fasilitas penting.
          </p>
        </FadeIn>

        <FadeIn delay={0.15} className="mb-14">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[
              { icon: Building2, text: "Dekat Pusat Kota" },
              { icon: Home, text: "Dekat Sekolah & Kampus" },
              { icon: Heart, text: "Dekat Rumah Sakit" },
              { icon: Car, text: "Akses Tol & Jalan Utama" },
              { icon: Users, text: "Dekat Pusat Perbelanjaan" },
              { icon: TreePine, text: "Lingkungan Asri & Hijau" },
            ].map((item, i) => (
              <motion.div
                key={item.text}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                className="flex flex-col items-center gap-2.5 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors group"
              >
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm group-hover:shadow-md group-hover:scale-110 transition-all">
                  <item.icon className="w-5 h-5 text-gray-700" />
                </div>
                <span className="text-sm font-medium text-gray-600 text-center">{item.text}</span>
              </motion.div>
            ))}
          </div>
        </FadeIn>

        {/* Contact cards centered */}
        <FadeIn delay={0.25}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <a
              href={`https://wa.me/${S.contact_wa}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center gap-2.5 p-5 bg-gray-50 border border-gray-100 rounded-2xl hover:bg-gray-100 hover:border-gray-200 transition-all group"
            >
              <div className="w-11 h-11 bg-gray-900 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <MessageCircle className="w-5 h-5 text-white" />
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">WhatsApp</p>
                <p className="font-bold text-gray-900 text-sm">{S.contact_phone}</p>
              </div>
            </a>

            <a
              href={`tel:${S.contact_phone.replace(/-/g, "")}`}
              className="flex flex-col items-center gap-2.5 p-5 bg-gray-50 border border-gray-100 rounded-2xl hover:bg-gray-100 hover:border-gray-200 transition-all group"
            >
              <div className="w-11 h-11 bg-gray-700 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <Phone className="w-5 h-5 text-white" />
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Telepon</p>
                <p className="font-bold text-gray-900 text-sm">{S.contact_phone}</p>
              </div>
            </a>

            <a
              href={`https://instagram.com/${S.social_instagram}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center gap-2.5 p-5 bg-gray-50 border border-gray-100 rounded-2xl hover:bg-gray-100 hover:border-gray-200 transition-all group"
            >
              <div className="w-11 h-11 bg-gray-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <Instagram className="w-5 h-5 text-white" />
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Instagram</p>
                <p className="font-bold text-gray-900 text-sm">{`@${S.social_instagram}`}</p>
              </div>
            </a>

            <div className="flex flex-col items-center gap-2.5 p-5 bg-gray-50 border border-gray-100 rounded-2xl">
              <div className="w-11 h-11 bg-gray-500 rounded-xl flex items-center justify-center">
                <MapPin className="w-5 h-5 text-white" />
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Alamat</p>
                <p className="font-bold text-gray-900 text-sm leading-tight">{S.contact_address}</p>
              </div>
            </div>
          </div>
        </FadeIn>

        {/* Map */}
        <FadeIn delay={0.35} className="mt-12">
          <MapWrapper latitude={S.map_latitude} longitude={S.map_longitude} companyName={S.company_name} />
        </FadeIn>
      </div>
    </section>
  );
}

/* ─────────────────────────── CONTACT ─────────────────────────── */

function ContactSection() {
  const { settings: S } = useSettingsStore();
  const [formData, setFormData] = useState({
    nama: "",
    nomor: "",
    minat: "",
    pesan: "",
  });
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const text = `Halo, saya ${formData.nama}.%0A%0ANomor: ${formData.nomor}%0AMinat: ${formData.minat}%0A%0APesan:%0A${formData.pesan}`;
    const waUrl = `https://wa.me/${S.contact_wa}?text=${text}`;
    window.open(waUrl, "_blank", "noopener,noreferrer");
    setSent(true);
    setTimeout(() => setSent(false), 4000);
  };

  return (
    <section className="py-20 md:py-28 bg-section-gray relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-gray-200/30 rounded-full blur-3xl" />

      <div className="relative max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeIn className="text-center mb-12">
          <Badge variant="secondary" className="mb-4 bg-gray-100 text-gray-600 border-gray-200">
            <Phone className="w-3.5 h-3.5 mr-1.5" />
            Hubungi Kami
          </Badge>
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">
            Tim Marketing Kami Siap <span className="text-gray-900">Melayani</span> Anda
          </h2>
          <p className="text-gray-500 max-w-xl mx-auto text-lg">
            Isi form di bawah, pesan otomatis dikirim ke WhatsApp kami.
          </p>
        </FadeIn>

        {/* Contact Form - centered */}
        <FadeIn delay={0.1}>
          <Card className="border-0 shadow-xl">
            <CardContent className="p-6 md:p-8">
              <div className="flex items-center justify-center gap-3 mb-8">
                <div className="w-10 h-10 bg-gray-900 rounded-xl flex items-center justify-center shadow-md">
                  <Send className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Kirim Pesan via WhatsApp</h3>
                  <p className="text-xs text-gray-400">Respon cepat dari tim marketing kami</p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-semibold text-gray-700 mb-2 block">
                      Nama Lengkap <span className="text-gray-500">*</span>
                    </Label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        required
                        placeholder="Masukkan nama Anda"
                        value={formData.nama}
                        onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                        className="pl-11 h-11 rounded-xl border-gray-200 shadow-sm focus:ring-gray-400 focus:border-gray-400"
                      />
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-semibold text-gray-700 mb-2 block">
                      Nomor WhatsApp <span className="text-gray-500">*</span>
                    </Label>
                    <div className="relative">
                      <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        required
                        type="tel"
                        placeholder="08xxxxxxxxxx"
                        value={formData.nomor}
                        onChange={(e) => setFormData({ ...formData, nomor: e.target.value })}
                        className="pl-11 h-11 rounded-xl border-gray-200 shadow-sm focus:ring-gray-400 focus:border-gray-400"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-semibold text-gray-700 mb-2 block">
                    Saya Tertarik Dengan
                  </Label>
                  <Select value={formData.minat} onValueChange={(v) => setFormData({ ...formData, minat: v })}>
                    <SelectTrigger className="h-11 rounded-xl border-gray-200 shadow-sm focus:ring-gray-400 focus:border-gray-400">
                      <SelectValue placeholder="Pilih topik..." />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      <SelectItem value="Info Properti" className="py-2.5 rounded-lg">Info Properti / Tipe Rumah</SelectItem>
                      <SelectItem value="Simulasi Cicilan" className="py-2.5 rounded-lg">Simulasi Cicilan</SelectItem>
                      <SelectItem value="Jadwal Survey" className="py-2.5 rounded-lg">Jadwal Survey Lokasi</SelectItem>
                      <SelectItem value="Syariah" className="py-2.5 rounded-lg">Skema Pembayaran Syariah</SelectItem>
                      <SelectItem value="KPR" className="py-2.5 rounded-lg">Skema Pembayaran KPR Bank</SelectItem>
                      <SelectItem value="Promo" className="py-2.5 rounded-lg">Info Promo / Diskon</SelectItem>
                      <SelectItem value="Lainnya" className="py-2.5 rounded-lg">Lainnya</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-sm font-semibold text-gray-700 mb-2 block">
                    Pesan <span className="text-gray-500">*</span>
                  </Label>
                  <Textarea
                    required
                    rows={4}
                    placeholder="Tulis pesan atau pertanyaan Anda di sini..."
                    value={formData.pesan}
                    onChange={(e) => setFormData({ ...formData, pesan: e.target.value })}
                    className="resize-none rounded-xl border-gray-200 shadow-sm focus:ring-gray-400 focus:border-gray-400"
                  />
                </div>

                {sent && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-center gap-2 p-3 bg-gray-50 border border-gray-200 rounded-xl"
                  >
                    <CheckCircle2 className="w-5 h-5 text-gray-600 shrink-0" />
                    <p className="text-sm text-gray-600 font-medium">Pesan berhasil dikirim ke WhatsApp!</p>
                  </motion.div>
                )}

                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-gray-900 text-white font-bold rounded-xl hover:bg-gray-800 transition-all active:scale-[0.98] shadow-lg hover:shadow-xl text-base"
                >
                  <Send className="w-5 h-5" />
                  Kirim via WhatsApp
                </button>
              </form>
            </CardContent>
          </Card>
        </FadeIn>

        {/* Quick contact buttons - centered */}
        <FadeIn delay={0.2} className="mt-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <a
              href={`https://wa.me/${S.contact_wa}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2.5 py-3 bg-gray-900 text-white font-semibold rounded-xl hover:bg-gray-800 transition-colors shadow-sm"
            >
              <MessageCircle className="w-4 h-4" />
              WhatsApp
            </a>
            <a
              href={`tel:${S.contact_phone.replace(/-/g, "")}`}
              className="flex items-center justify-center gap-2.5 py-3 bg-gray-700 text-white font-semibold rounded-xl hover:bg-gray-600 transition-colors shadow-sm"
            >
              <Phone className="w-4 h-4" />
              Telepon
            </a>
            <a
              href={`https://instagram.com/${S.social_instagram}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2.5 py-3 bg-gray-500 text-white font-semibold rounded-xl hover:bg-gray-400 transition-colors shadow-sm"
            >
              <Instagram className="w-4 h-4" />
              Instagram
            </a>
          </div>
        </FadeIn>

        {/* Map */}
        <FadeIn delay={0.3} className="mt-12">
          <MapWrapper latitude={S.map_latitude} longitude={S.map_longitude} companyName={S.company_name} />
        </FadeIn>
      </div>
    </section>
  );
}

/* ─────────────────────────── GALLERY PAGE ─────────────────────────── */

function ProyekGallery() {
  const { galleryItems, loading: galleryLoading, fetchGalleryItems } = useGalleryStore();
  const { settings: S } = useSettingsStore();
  const [activeTab, setActiveTab] = useState<"foto" | "video">("foto");
  const [activeCategory, setActiveCategory] = useState<GalleryCategory>("all");
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [page, setPage] = useState(1);
  const [prevCategory, setPrevCategory] = useState(activeCategory);
  const [prevTab, setPrevTab] = useState(activeTab);

  useEffect(() => { fetchGalleryItems(); }, [fetchGalleryItems]);

  if (prevCategory !== activeCategory || prevTab !== activeTab) {
    setPrevCategory(activeCategory);
    setPrevTab(activeTab);
    setPage(1);
  }

  // Separate items into foto and video
  const photos = galleryItems.filter((item) => !!item.image);
  const videos = galleryItems.filter((item) => !!item.videoUrl);

  // Filter by category
  const filterByCategory = (items: typeof galleryItems) =>
    activeCategory === "all" ? items : items.filter((img) => img.category === activeCategory);

  const filteredPhotos = filterByCategory(photos);
  const filteredVideos = filterByCategory(videos);

  const currentItems = activeTab === "foto" ? filteredPhotos : filteredVideos;
  const totalPages = Math.ceil(currentItems.length / GALLERY_PER_PAGE);
  const paged = currentItems.slice((page - 1) * GALLERY_PER_PAGE, page * GALLERY_PER_PAGE);

  if (galleryLoading) {
    return (
      <section className="py-20 md:py-28 bg-section-gray">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn className="text-center mb-12">
            <Badge variant="secondary" className="mb-4 bg-gray-100 text-gray-600 border-gray-200">
              <Camera className="w-3.5 h-3.5 mr-1.5" />
              Gallery
            </Badge>
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">
              Dokumentasi <span className="text-gray-900">Proyek</span> Kami
            </h2>
          </FadeIn>
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 border-4 border-gray-200 border-t-gray-900 rounded-full animate-spin" />
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 md:py-28 bg-section-gray">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeIn className="text-center mb-12">
          <Badge variant="secondary" className="mb-4 bg-gray-100 text-gray-600 border-gray-200">
            <Camera className="w-3.5 h-3.5 mr-1.5" />
            Gallery
          </Badge>
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">
            Dokumentasi <span className="text-gray-900">Proyek</span> Kami
          </h2>
          <p className="text-gray-500 max-w-2xl mx-auto text-lg">
            Lihat foto dan video proyek serta lingkungan {S.company_name}.
          </p>
        </FadeIn>

        {/* Foto / Video Tab Toggle */}
        <FadeIn delay={0.05} className="flex justify-center mb-6">
          <div className="inline-flex bg-gray-100 rounded-xl p-1 gap-1">
            <button
              onClick={() => setActiveTab("foto")}
              className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                activeTab === "foto"
                  ? "bg-white text-gray-600 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <span className="flex items-center gap-1.5">
                <Camera className="w-4 h-4" />
                Foto
                <span className="text-[10px] bg-gray-200 text-gray-600 px-1.5 py-0.5 rounded-full">{filteredPhotos.length}</span>
              </span>
            </button>
            <button
              onClick={() => setActiveTab("video")}
              className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                activeTab === "video"
                  ? "bg-white text-gray-600 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <span className="flex items-center gap-1.5">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
                Video
                <span className="text-[10px] bg-gray-200 text-gray-600 px-1.5 py-0.5 rounded-full">{filteredVideos.length}</span>
              </span>
            </button>
          </div>
        </FadeIn>

        <FadeIn delay={0.1} className="flex flex-wrap justify-center gap-3 mb-10">
          {/* Category filter pills */}
          {[
            { key: "all", label: "Semua" },
            { key: "inden", label: "Inden" },
            { key: "kavling", label: "Kavling" },
            { key: "siap_huni", label: "Siap Huni" },
            { key: "lingkungan", label: "Lingkungan" },
            { key: "proses_bangun", label: "Proses Bangun" },
          ].map((cat) => {
            const isActive = activeCategory === cat.key;
            return (
              <button
                key={cat.key}
                onClick={() => setActiveCategory(cat.key as GalleryCategory)}
                className={`px-4 py-2 text-sm font-semibold rounded-xl transition-all duration-200 ${
                  isActive
                    ? "bg-gray-900 text-white shadow-lg shadow-gray-900/20"
                    : "bg-white text-gray-600 border border-gray-200 hover:border-gray-300 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </FadeIn>

        {/* Foto Tab Content */}
        {activeTab === "foto" && (
          <>
            {paged.length === 0 ? (
              <div className="text-center py-16">
                <Camera className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-400 text-lg">Belum ada foto untuk kategori ini.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {paged.map((img, i) => (
                  <FadeIn key={`${img.id}-${activeCategory}-${page}`} delay={i * 0.05}>
                    <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all overflow-hidden group cursor-pointer" onClick={() => { setLightboxIndex((page - 1) * GALLERY_PER_PAGE + i); setLightboxOpen(true); }}>
                      {/* Thumbnail */}
                      <div className="relative aspect-video overflow-hidden bg-gray-100">
                        <img
                          src={img.image}
                          alt={img.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                      {/* Info */}
                      <div className="p-4">
                        <h3 className="font-bold text-gray-900 text-sm mb-1 line-clamp-2 group-hover:text-gray-900 transition-colors">
                          {img.title}
                        </h3>
                        {img.description && (
                          <p className="text-xs text-gray-500 line-clamp-2">{img.description}</p>
                        )}
                        <div className="mt-2">
                          <Badge variant="secondary" className="bg-gray-100 text-gray-600 text-[10px]">
                            {CATEGORY_LABELS[img.category] || img.category}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </FadeIn>
                ))}
              </div>
            )}
            <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
            <AnimatePresence>
              {lightboxOpen && (
                <LightboxOverlay
                  images={filteredPhotos.map((img) => img.image)}
                  activeIndex={lightboxIndex}
                  onClose={() => setLightboxOpen(false)}
                />
              )}
            </AnimatePresence>
          </>
        )}

        {/* Video Tab Content */}
        {activeTab === "video" && (
          <>
            {paged.length === 0 ? (
              <div className="text-center py-16">
                <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
                <p className="text-gray-400 text-lg">Belum ada video untuk kategori ini.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {paged.map((item, i) => {
                  const embedUrl = getYoutubeEmbedUrl(item.videoUrl);
                  return (
                    <FadeIn key={`${item.id}-${activeCategory}-${page}`} delay={i * 0.05}>
                      <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all overflow-hidden group">
                        {/* Thumbnail */}
                        <div className="relative aspect-video overflow-hidden bg-gray-100">
                          {embedUrl ? (
                            <iframe
                              src={embedUrl}
                              title={item.title}
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              allowFullScreen
                              className="w-full h-full"
                              loading="lazy"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Camera className="w-10 h-10 text-gray-300" />
                            </div>
                          )}
                        </div>
                        {/* Info */}
                        <div className="p-4">
                          <h3 className="font-bold text-gray-900 text-sm mb-1 line-clamp-2 group-hover:text-gray-900 transition-colors">
                            {item.title}
                          </h3>
                          {item.description && (
                            <p className="text-xs text-gray-500 line-clamp-2">{item.description}</p>
                          )}
                          <div className="mt-2">
                            <Badge variant="secondary" className="bg-gray-100 text-gray-600 text-[10px]">
                              {CATEGORY_LABELS[item.category] || item.category}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </FadeIn>
                  );
                })}
              </div>
            )}
            <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
          </>
        )}
      </div>
    </section>
  );
}

/* ─────────────────────────── TENTANG KAMI PAGE ─────────────────────────── */

function TentangKamiPage() {
  const { galleryItems, fetchGalleryItems } = useGalleryStore();
  const { bankItems, loading: bankLoading, fetchBankItems } = useBankStore();
  const { settings: S } = useSettingsStore();
  useEffect(() => { fetchGalleryItems(); }, [fetchGalleryItems]);
  useEffect(() => { fetchBankItems(); }, [fetchBankItems]);
  const homeGalleryItems = galleryItems.slice(0, 8);

  return (
    <>
      {/* Banner */}
      <PageBanner title="Tentang Kami" subtitle={`Mengenal lebih dekat ${S.company_name}`} />

      {/* ═══════ PROFIL PERUSAHAAN ═══════ */}
      <section className="py-20 md:py-28 bg-section-gray">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <FadeIn direction="left">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                <img
                  src={S.tentangkami_image || "/images/properties/hero_cover.png"}
                  alt={S.company_name}
                  className="w-full h-[400px] object-cover"
                />
                <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/70 to-transparent p-6">
                  <p className="text-white font-bold text-lg">{S.company_legal_name}</p>
                </div>
              </div>
            </FadeIn>
            <FadeIn direction="right">
              <Badge variant="secondary" className="mb-4 bg-gray-100 text-gray-600 border-gray-200">
                <Building2 className="w-3.5 h-3.5 mr-1.5" />
                Profil Perusahaan
              </Badge>
              <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-6">
                Platform Perumahan <span className="text-gray-900">Terpercaya</span> di Indonesia
              </h2>
              <p className="text-gray-600 text-lg leading-relaxed mb-4">
                {S.company_name} adalah platform perumahan yang menghimpun developer-developer perumahan terpilih di bawah naungan {S.company_legal_name}. Kami berperan sebagai jembatan antara pengembang properti berkualitas dan calon pembeli rumah yang mencari hunian terbaik.
              </p>
              <p className="text-gray-600 text-lg leading-relaxed mb-4">
                Setiap mitra developer yang bergabung telah melalui proses kurasi ketat — dari legalitas, kualitas bangunan, hingga track record. Tujuan kami: memudahkan Anda menemukan rumah idaman dengan pilihan terluas dari developer terpercaya.
              </p>
              <p className="text-gray-600 text-lg leading-relaxed">
                Dengan skema pembayaran fleksibel mulai dari Syariah hingga KPR Bank, {S.company_name} memastikan setiap keluarga Indonesia punya akses ke hunian berkualitas.
              </p>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ═══════ VISI & MISI ═══════ */}
      <section className="py-20 md:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn className="text-center mb-12">
            <Badge variant="secondary" className="mb-4 bg-gray-50 text-gray-600 border-gray-200">
              <Sparkles className="w-3.5 h-3.5 mr-1.5" />
              Visi & Misi
            </Badge>
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">
              Arah & <span className="text-gray-900">Tujuan</span> Kami
            </h2>
          </FadeIn>
          <div className="grid md:grid-cols-2 gap-8">
            <FadeIn>
              <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-8 md:p-10 text-white h-full shadow-xl">
                <div className="w-16 h-16 bg-white/15 rounded-2xl flex items-center justify-center mb-6">
                  <Eye className="w-8 h-8 text-yellow-300" />
                </div>
                <h3 className="text-2xl font-extrabold mb-4">Visi</h3>
                <p className="text-gray-400 text-lg leading-relaxed">
                  Menjadi platform perumahan terdepan di Indonesia yang menyatukan developer terbaik dan memberikan hunian berkualitas, terjangkau, serta penuh keberkahan bagi seluruh keluarga Indonesia.
                </p>
              </div>
            </FadeIn>
            <FadeIn delay={0.15}>
              <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-8 md:p-10 text-white h-full shadow-xl">
                <div className="w-16 h-16 bg-white/15 rounded-2xl flex items-center justify-center mb-6">
                  <BookOpen className="w-8 h-8 text-yellow-300" />
                </div>
                <h3 className="text-2xl font-extrabold mb-4">Misi</h3>
                <ul className="text-gray-300 text-lg leading-relaxed space-y-3">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-400 mt-1 shrink-0" />
                    <span>Mengkurasi developer perumahan berkualitas dan berintegritas tinggi</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-400 mt-1 shrink-0" />
                    <span>Menyediakan pilihan hunian terluas dari berbagai mitra developer</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-400 mt-1 shrink-0" />
                    <span>Menjamin transparansi harga, legalitas, dan kualitas setiap properti</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-400 mt-1 shrink-0" />
                    <span>Memberikan pendampingan penuh dari konsultasi hingga serah terima kunci</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-400 mt-1 shrink-0" />
                    <span>Menghadirkan skema pembayaran Syariah & KPR yang mudah dan aman</span>
                  </li>
                </ul>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ═══════ NILAI PERUSAHAAN ═══════ */}
      <section className="py-20 md:py-28 bg-section-gray">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn className="text-center mb-16">
            <Badge variant="secondary" className="mb-4 bg-gray-100 text-gray-600 border-gray-200">
              <Award className="w-3.5 h-3.5 mr-1.5" />
              Nilai-Nilai Kami
            </Badge>
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">
              Prinsip yang <span className="text-gray-900">Kami Pegang</span>
            </h2>
            <p className="text-gray-500 max-w-2xl mx-auto text-lg">
              Setiap keputusan yang kami ambil berlandaskan pada nilai-nilai inti yang memastikan kepercayaan dan kenyamanan Anda.
            </p>
          </FadeIn>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: Shield, title: "Profesional", desc: "Tim berpengalaman dengan standar layanan tertinggi. Setiap proses dijalankan secara sistematis dan terstruktur.", gradient: "from-gray-800 to-gray-900" },
              { icon: Eye, title: "Transparan", desc: "Harga jelas, legalitas terbuka, progres proyek bisa dipantau. Tidak ada biaya tersembunyi.", gradient: "from-blue-500 to-blue-600" },
              { icon: CheckCircle2, title: "Terpercaya", desc: "Setiap mitra developer telah melalui proses verifikasi ketat. Reputasi adalah fondasi bisnis kami.", gradient: "from-gray-600 to-gray-700" },
              { icon: HeartHandshake, title: "Kolaboratif", desc: "Sinergi antara platform, developer, dan pembeli. Semua pihak mendapatkan manfaat.", gradient: "from-amber-500 to-amber-600" },
              { icon: Sparkles, title: "Inovatif", desc: "Terus beradaptasi dengan teknologi dan tren properti terbaru untuk pengalaman yang lebih baik.", gradient: "from-purple-500 to-purple-600" },
              { icon: Users, title: "Berorientasi Keluarga", desc: "Setiap rumah yang kami tawarkan dirancang untuk kenyamanan dan kebahagiaan keluarga.", gradient: "from-pink-500 to-pink-600" },
            ].map((val, i) => {
              const Icon = val.icon;
              return (
                <FadeIn key={val.title} delay={i * 0.08}>
                  <Card className="h-full border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group">
                    <CardContent className="p-6">
                      <div className={`w-14 h-14 bg-gradient-to-br ${val.gradient} rounded-2xl flex items-center justify-center mb-5 shadow-lg group-hover:scale-110 transition-transform`}>
                        <Icon className="w-7 h-7 text-white" />
                      </div>
                      <h3 className="text-lg font-bold text-gray-900 mb-2">{val.title}</h3>
                      <p className="text-gray-500 leading-relaxed text-sm">{val.desc}</p>
                    </CardContent>
                  </Card>
                </FadeIn>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══════ KEUNGGULAN PLATFORM ═══════ */}
      <TentangKamiKeunggulanSection />

      {/* ═══════ TIMELINE / PERJALANAN BISNIS ═══════ */}
      <section className="py-20 md:py-28 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gray-1000/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-gray-500/5 rounded-full blur-3xl" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn className="text-center mb-16">
            <Badge variant="secondary" className="mb-4 bg-white/10 text-amber-300 border-white/20">
              <Clock className="w-3.5 h-3.5 mr-1.5" />
              Perjalanan Kami
            </Badge>
            <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4">
              Milestone <span className="text-amber-300">Bisnis</span>
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto text-lg">
              Dari satu proyek menjadi platform perumahan yang menghimpun puluhan mitra developer.
            </p>
          </FadeIn>

          {/* Stats row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
            {[
              { value: `${S.total_units_sold}+`, label: "Unit Terjual", icon: Home },
              { value: "3+", label: "Mitra Developer", icon: Building2 },
              { value: "10+", label: "Proyek Perumahan", icon: LandPlot },
              { value: "98%", label: "Kepuasan Klien", icon: ThumbsUp },
            ].map((stat, i) => {
              const Icon = stat.icon;
              return (
                <FadeIn key={stat.label} delay={i * 0.1}>
                  <div className="text-center bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                    <Icon className="w-6 h-6 text-amber-300 mx-auto mb-2" />
                    <p className="text-3xl md:text-4xl font-extrabold text-white">{stat.value}</p>
                    <p className="text-gray-400 text-sm mt-1">{stat.label}</p>
                  </div>
                </FadeIn>
              );
            })}
          </div>

          {/* Timeline */}
          <FadeIn>
            <div className="max-w-3xl mx-auto space-y-0">
              {[
                { year: "2018", title: "Awal Mula", desc: `${S.company_legal_name} didirikan. Memulai proyek perumahan pertama di kawasan Bandung dengan fokus hunian syariah.`, color: "bg-gray-1000" },
                { year: "2020", title: "Ekspansi Proyek", desc: "Membuka proyek kedua di kawasan Sentul. Memperluas portofolio dengan klaster baru dan konsep modern.", color: "bg-gray-500" },
                { year: "2022", title: "Mitra Pertama Bergabung", desc: `Developer mitra pertama resmi bergabung. ${S.company_name} mulai bertransformasi dari single developer menjadi platform.`, color: "bg-gray-500" },
                { year: "2023", title: `${S.total_units_sold} Unit Terjual`, desc: `Milestone ${S.total_units_sold} unit rumah terjual dari seluruh mitra developer. Platform terus berkembang.`, color: "bg-gray-500" },
                { year: "2024", title: "Digital Platform Launch", desc: "Peluncuran platform digital untuk memudahkan calon pembeli menemukan dan membandingkan proyek dari berbagai mitra.", color: "bg-purple-500" },
                { year: "2025", title: "Terus Bertumbuh", desc: "Semakin banyak mitra developer terpilih bergabung. Menyediakan jasa konstruksi lengkap bagi konsumen.", color: "bg-gray-500" },
              ].map((item, i) => (
                <div key={item.year} className="flex gap-6 group">
                  <div className="flex flex-col items-center">
                    <div className={`w-14 h-14 ${item.color} rounded-full flex items-center justify-center text-white font-extrabold text-sm shrink-0 shadow-lg group-hover:scale-110 transition-transform`}>
                      {item.year}
                    </div>
                    {i < 5 && <div className="w-0.5 h-full bg-white/10 mt-2" />}
                  </div>
                  <div className="pb-10">
                    <h4 className="text-lg font-bold text-white mb-1">{item.title}</h4>
                    <p className="text-gray-400 text-sm leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ═══════ LEGALITAS ═══════ */}
      <section className="py-20 md:py-28 bg-section-gray">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn className="text-center mb-12">
            <Badge variant="secondary" className="mb-4 bg-gray-50 text-gray-600 border-gray-200">
              <Shield className="w-3.5 h-3.5 mr-1.5" />
              Legalitas Perusahaan
            </Badge>
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">
              Dokumen <span className="text-gray-900">Lengkap & Terverifikasi</span>
            </h2>
            <p className="text-gray-500 max-w-2xl mx-auto text-lg">
              {S.company_legal_name} beroperasi secara legal dengan seluruh dokumen perizinan lengkap.
            </p>
          </FadeIn>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-5 mb-12">
            {[
              { title: "Akta Pendirian", desc: "Akta Notaris pendirian perusahaan", icon: FileText },
              { title: "NIB / OSS", desc: "Nomor Induk Berusaha terdaftar", icon: FileText },
              { title: "SIUP / IUJK", desc: "Izin usaha jasa konstruksi", icon: Building2 },
              { title: "NPWP Badan", desc: "Terdaftar di Direktorat Pajak", icon: FileText },
              { title: "SK Kemenkumham", desc: "Pengesahan badan hukum", icon: Shield },
              { title: "Rekening Bank", desc: "Rekening perusahaan resmi", icon: LandPlot },
            ].map((item, i) => {
              const Icon = item.icon;
              return (
                <FadeIn key={item.title} delay={i * 0.08}>
                  <Card className="h-full border-0 shadow-md hover:shadow-lg transition-shadow text-center">
                    <CardContent className="p-5">
                      <div className="w-12 h-12 mx-auto bg-gray-100 rounded-xl flex items-center justify-center mb-3">
                        <Icon className="w-6 h-6 text-gray-600" />
                      </div>
                      <h4 className="font-bold text-gray-900 text-sm mb-1">{item.title}</h4>
                      <p className="text-xs text-gray-500">{item.desc}</p>
                    </CardContent>
                  </Card>
                </FadeIn>
              );
            })}
          </div>
          <FadeIn>
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 md:p-8">
              <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-7 h-7 text-gray-600" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 text-lg mb-1">Jaminan Legalitas Setiap Proyek Mitra</h4>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    Setiap developer mitra yang bergabung dengan {S.company_name} wajib memenuhi standar legalitas minimum:
                    Sertifikat SHM, IMB/PBG, perizinan lingkungan, dan dokumen perjanjian pengembang. Kami melakukan audit berkala
                    untuk memastikan semua dokumen tetap valid dan up-to-date.
                  </p>
                </div>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ═══════ MITRA PERBANKAN ═══════ */}
      <section className="py-16 md:py-20 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn className="text-center mb-10">
            <Badge variant="secondary" className="mb-4 bg-gray-50 text-gray-600 border-gray-200">
              <Handshake className="w-3.5 h-3.5 mr-1.5" />
              Mitra Perbankan
            </Badge>
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">
              Didukung <span className="text-gray-900">Bank & Lembaga Keuangan</span> Terpercaya
            </h2>
          </FadeIn>
          {bankLoading ? (
            <div className="flex gap-6 justify-center">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="w-28 h-12 bg-gray-100 rounded-lg animate-pulse shrink-0" />
              ))}
            </div>
          ) : bankItems.length === 0 ? (
            <p className="text-center text-gray-400 py-8">Belum ada data mitra bank</p>
          ) : (
            <>
              <div className="relative">
                <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
                <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />
                <div
                  className="flex gap-8 w-max hover:[animation-play-state:paused]"
                  style={{ animation: "bank-slide 25s linear infinite" }}
                >
                  {[...bankItems, ...bankItems].map((bank, i) => (
                    <div
                      key={`${bank.id}-${i}`}
                      className="flex flex-col items-center justify-center w-28 h-20 shrink-0 bg-gray-50 rounded-xl border border-gray-100 hover:border-gray-200 hover:shadow-md transition-all"
                    >
                      {bank.image ? (
                        <img
                          src={bank.image}
                          alt={bank.name}
                          className="w-20 h-10 object-contain"
                          onError={(e) => {
                            const img = e.currentTarget;
                            img.style.display = "none";
                            const fb = img.nextElementSibling as HTMLElement;
                            if (fb) fb.style.display = "flex";
                          }}
                        />
                      ) : (
                        <div className="w-8 h-8 bg-gray-900 text-gray-300 rounded-lg flex items-center justify-center">
                          <LandPlot className="w-4 h-4 text-white" />
                        </div>
                      )}
                      <span className="text-[10px] text-gray-500 mt-1 truncate max-w-full px-1">{bank.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </section>

      {/* ═══════ GALERI ═══════ */}
      <section className="py-20 md:py-28 bg-section-gray">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn className="text-center mb-12">
            <Badge variant="secondary" className="mb-4 bg-gray-100 text-gray-600 border-gray-200">
              <Camera className="w-3.5 h-3.5 mr-1.5" />
              Dokumentasi
            </Badge>
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">
              Galeri <span className="text-gray-900">Foto</span>
            </h2>
          </FadeIn>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {homeGalleryItems.map((img, i) => (
              <FadeIn key={img.id} delay={i * 0.05}>
                <div className="aspect-[4/3] overflow-hidden rounded-xl shadow-md">
                  <img src={img.image} alt={img.title} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                </div>
              </FadeIn>
            ))}
          </div>
          <FadeIn className="text-center mt-10">
            <button
              onClick={() => (typeof window !== "undefined") && window.location.assign("/?tab=gallery")}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gray-100 text-gray-600 font-semibold rounded-xl hover:bg-gray-100 transition-colors"
            >
              Lihat Semua Foto
              <ArrowRight className="w-4 h-4" />
            </button>
          </FadeIn>
        </div>
      </section>

      {/* ═══════ TESTIMONI ═══════ */}
      <TestimonialsCarousel />
    </>
  );
}

/* ─────────────────────────── BLOG ARTICLE PAGE ─────────────────────────── */

function BlogArticlePage({ slug }: { slug: string }) {
  const { settings: S } = useSettingsStore();
  const activeTab = `blog/${slug}`;
  const router = useRouter();
  const { articles, fetchArticleBySlug, refetchArticles } = useBlogStore();
  const [viewCount, setViewCount] = useState(0);

  // Fetch article by slug if not already in store
  useEffect(() => {
    if (!articles.find((a) => a.slug === slug)) {
      fetchArticleBySlug(slug);
    }
    // Also make sure all articles are loaded for "Artikel Lainnya"
    if (!articles.length) {
      refetchArticles();
    }
  }, [slug, articles, fetchArticleBySlug, refetchArticles]);

  // Increment views on visit (once per session per slug)
  useEffect(() => {
    const sessionKey = `viewed_${slug}`;
    if (!sessionStorage.getItem(sessionKey)) {
      fetch("/api/blogs/views", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.views !== undefined) {
            setViewCount(data.views);
            sessionStorage.setItem(sessionKey, "1");
          }
        })
        .catch(() => {});
    }
  }, [slug]);

  const article = articles.find((a) => a.slug === slug);
  const coverImg = article?.images?.[0];
  const displayViews = viewCount || article?.views || 0;

  // Loading state
  if (!article) {
    return (
      <>
        <Navbar activeTab={activeTab} />
        <div className="min-h-screen flex flex-col items-center justify-center bg-section-gray">
          <div className="w-10 h-10 border-4 border-gray-200 border-t-gray-900 rounded-full animate-spin mb-4" />
          <p className="text-gray-400 text-sm">Memuat artikel...</p>
        </div>
        <Chatbot />
      </>
    );
  }

  // Get other articles for "Artikel Lainnya"
  const otherArticles = articles.filter((a) => a.id !== article.id).slice(0, 3);

  return (
    <>
      <Navbar activeTab={activeTab} />

      {/* Hero image */}
      <div className="relative h-72 md:h-96 overflow-hidden">
        {coverImg ? (
          <img src={coverImg} alt={article.title} className="w-full h-full object-cover" />
        ) : (
          <div className="h-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
            <BookOpen className="w-24 h-24 text-white/20" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-black/10" />
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-12">
          <div className="max-w-4xl mx-auto">
            <button
              onClick={() => router.push("/?tab=blog")}
              className="inline-flex items-center gap-1.5 text-white/70 hover:text-white text-sm mb-4 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Kembali ke Blog
            </button>
            <Badge className="bg-white/20 text-white border-0 backdrop-blur-sm text-sm mb-3">
              {article.category}
            </Badge>
            <h1 className="text-2xl md:text-4xl font-extrabold text-white leading-tight drop-shadow-lg">
              {article.title}
            </h1>
          </div>
        </div>
      </div>

      {/* Article content */}
      <article className="py-10 md:py-16 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 overflow-x-visible">
          {/* Meta */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400 mb-8 pb-8 border-b border-gray-100">
            <div className="flex items-center gap-1.5">
              <User className="w-4 h-4" />
              <span>{article.author}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4" />
              <span>{article.dateFormatted || article.createdAt}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="w-4 h-4" />
              <span>{article.readTime || "5 menit"}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Eye className="w-4 h-4" />
              <span>{displayViews} dibaca</span>
            </div>
          </div>

          {/* Excerpt */}
          {article.excerpt && (
            <p className="text-lg text-gray-600 leading-relaxed font-medium mb-10 border-l-4 border-gray-900 pl-5 italic">
              {article.excerpt}
            </p>
          )}

          {/* Rich HTML content */}
          <div
            className="prose prose-sm md:prose-base max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 prose-a:text-gray-900 prose-img:rounded-xl prose-blockquote:border-l-gray-900 prose-blockquote:text-gray-500 prose-blockquote:italic prose-li:text-gray-700
            [&>*]:!max-w-full [&_*]:!max-w-full [&_img]:max-w-full [&_img]:h-auto [&_video]:max-w-full [&_iframe]:max-w-full [&_table]:table-fixed [&_td]:break-words [&_th]:break-words [&_p]:break-words [&_p]:overflow-wrap-anywhere [&_span]:!inline [&_span]:break-words [&_br]:block"
            dangerouslySetInnerHTML={{ __html: (article.content || "<p class='text-gray-400'>Konten belum tersedia.</p>").replace(/&nbsp;/g, " ") }}
          />

          {/* Footer CTA */}
          <div className="mt-12 p-6 bg-gray-50 rounded-2xl border border-gray-100">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <p className="font-bold text-gray-900 mb-1">Tertarik dengan properti kami?</p>
                <p className="text-sm text-gray-500">Konsultasikan kebutuhan rumah Anda secara gratis.</p>
              </div>
              <a
                href={`https://wa.me/${S.contact_wa}?text=Halo,%20saya%20tertarik%20dengan%20properti%20${encodeURIComponent(S.company_name)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-gray-900 hover:bg-gray-800 text-white font-semibold rounded-xl text-sm transition-colors whitespace-nowrap"
              >
                <MessageCircle className="w-4 h-4" />
                Hubungi via WhatsApp
              </a>
            </div>
          </div>
        </div>
      </article>

      {/* Artikel Lainnya */}
      {otherArticles.length > 0 && (
        <section className="py-12 md:py-16 bg-section-gray">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-8">Artikel Lainnya</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {otherArticles.map((a) => {
                const img = a.images?.[0];
                return (
                  <Card
                    key={a.id}
                    onClick={() => router.push(`/?tab=blog/${a.slug}`)}
                    className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden group cursor-pointer"
                  >
                    <div className="h-36 overflow-hidden relative">
                      {img ? (
                        <img src={img} alt={a.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      ) : (
                        <div className="h-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                          <BookOpen className="w-10 h-10 text-white/20" />
                        </div>
                      )}
                    </div>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 text-xs text-gray-400 mb-2">
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{a.readTime || "5 menit"}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{a.views || 0}</span>
                      </div>
                      <h3 className="font-bold text-gray-900 text-sm group-hover:text-gray-900 transition-colors line-clamp-2 leading-snug">
                        {a.title}
                      </h3>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>
      )}

      <Footer />
      <Chatbot />
    </>
  );
}

/* ─────────────────────────── BLOG PAGE ─────────────────────────── */

function BlogPage() {
  const router = useRouter();
  const { settings: S } = useSettingsStore();
  const BLOG_PER_PAGE = 6;
  const [page, setPage] = useState(1);
  const { articles, refetchArticles } = useBlogStore();

  useEffect(() => { refetchArticles(); }, [refetchArticles]);

  const featuredArticle = articles[0];
  const restArticles = articles.slice(1);
  const totalPages = Math.ceil(restArticles.length / BLOG_PER_PAGE);
  const paged = restArticles.slice((page - 1) * BLOG_PER_PAGE, page * BLOG_PER_PAGE);
  const popularArticles = articles.slice(0, 4);

  // Gather categories from real data
  const categories = [...new Set(articles.map((a) => a.category))];

  const COLORS = [
    "from-gray-800 to-gray-900",
    "from-gray-800 to-gray-900",
    "from-gray-700 to-gray-800",
    "from-gray-600 to-gray-700",
    "from-gray-500 to-gray-600",
    "from-gray-800 to-gray-950",
    "from-gray-700 to-gray-900",
    "from-gray-600 to-gray-800",
  ];

  return (
    <>
      <PageBanner title="Blog & Artikel" subtitle="Tips, panduan, dan informasi seputar properti, KPR, dan investasi rumah" />
      <section className="py-16 md:py-24 bg-section-gray">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {articles.length === 0 ? (
            <div className="text-center py-20">
              <BookOpen className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-xl font-bold text-gray-400 mb-2">Belum Ada Artikel</h3>
              <p className="text-sm text-gray-400">Artikel akan segera tersedia.</p>
            </div>
          ) : (
          <div className="flex flex-col lg:flex-row gap-8">
            {/* ── Main Content ── */}
            <div className="flex-1 min-w-0">
              {/* Featured Article (Full Width) */}
              {featuredArticle && page === 1 && (
                <FadeIn>
                  <Card onClick={() => router.push(`/?tab=blog/${featuredArticle.slug}`)} className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden group cursor-pointer mb-8">
                    <div className="h-64 md:h-72 overflow-hidden relative">
                      {featuredArticle.images?.[0] ? (
                        <img src={featuredArticle.images[0]} alt={featuredArticle.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      ) : (
                        <div className={`h-full bg-gradient-to-br ${COLORS[0]} flex items-center justify-center`}>
                          <BookOpen className="w-24 h-24 text-white/15" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                      <Badge className="absolute top-4 left-4 bg-white/20 text-white border-0 backdrop-blur-sm text-sm px-3 py-1 z-10">
                        {featuredArticle.category}
                      </Badge>
                      <Badge className="absolute top-4 right-4 bg-white/90 text-gray-900 border-0 text-xs font-bold px-2.5 py-1 z-10 backdrop-blur-sm">
                        <Star className="w-3.5 h-3.5 mr-1" />
                        Artikel Pilihan
                      </Badge>
                      <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 z-10">
                        <div className="flex items-center gap-3 text-sm text-white/70 mb-3">
                          <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" />{featuredArticle.dateFormatted}</span>
                          <span>•</span>
                          <span>{featuredArticle.readTime || "5 menit"}</span>
                          <span>•</span>
                          <span className="flex items-center gap-1.5"><Eye className="w-4 h-4" />{featuredArticle.views || 0}</span>
                        </div>
                        <h2 className="text-xl md:text-3xl font-extrabold text-white mb-3 group-hover:text-gray-300 transition-colors leading-tight drop-shadow-lg">
                          {featuredArticle.title}
                        </h2>
                        <p className="text-white/80 leading-relaxed mb-4 max-w-2xl">
                          {featuredArticle.excerpt}
                        </p>
                        <span className="inline-flex items-center gap-1.5 text-white font-semibold text-sm group-hover:gap-2.5 transition-all">
                          Baca selengkapnya
                          <ArrowRight className="w-4 h-4" />
                        </span>
                      </div>
                    </div>
                  </Card>
                </FadeIn>
              )}

              {/* Articles Grid */}
              {paged.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {paged.map((article, i) => {
                  const color = COLORS[(i + 1) % COLORS.length];
                  const coverImg = article.images?.[0];
                  return (
                    <FadeIn key={`${article.id}-${page}`} delay={i * 0.05}>
                      <Card onClick={() => router.push(`/?tab=blog/${article.slug}`)} className="h-full border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden group cursor-pointer">
                        <div className="h-44 overflow-hidden relative">
                          {coverImg ? (
                            <img src={coverImg} alt={article.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                          ) : (
                            <div className={`h-full bg-gradient-to-br ${color} flex items-center justify-center`}>
                              <BookOpen className="w-16 h-16 text-white/20" />
                            </div>
                          )}
                          <Badge className="absolute top-3 left-3 bg-white/20 text-white border-0 backdrop-blur-sm text-xs z-10">
                            {article.category}
                          </Badge>
                        </div>
                        <CardContent className="p-5">
                          <div className="flex items-center gap-3 text-xs text-gray-400 mb-3">
                            <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{article.dateFormatted}</span>
                            <span>•</span>
                            <span>{article.readTime || "5 menit"}</span>
                            <span>•</span>
                            <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{article.views || 0}</span>
                          </div>
                          <h3 className="font-bold text-gray-900 mb-2 group-hover:text-gray-900 transition-colors line-clamp-2 leading-snug">
                            {article.title}
                          </h3>
                          <p className="text-sm text-gray-500 leading-relaxed line-clamp-2">
                            {article.excerpt}
                          </p>
                        </CardContent>
                      </Card>
                    </FadeIn>
                  );
                })}
              </div>
              ) : (
                <div className="text-center py-12 text-gray-400">
                  <p className="text-sm">Tidak ada artikel lagi.</p>
                </div>
              )}

              <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
            </div>

            {/* ── Sidebar ── */}
            <aside className="w-full lg:w-[340px] shrink-0 space-y-6">
              {/* Artikel Populer */}
              {popularArticles.length > 0 && (
              <FadeIn delay={0.15}>
                <Card className="border-0 shadow-lg overflow-hidden">
                  <div className="bg-gradient-to-r from-gray-800 to-gray-900 px-5 py-4">
                    <h3 className="text-white font-bold flex items-center gap-2">
                      <TrendingUp className="w-4 h-4" />
                      Artikel Populer
                    </h3>
                  </div>
                  <CardContent className="p-4">
                    <div className="space-y-4">
                      {popularArticles.map((article, idx) => {
                        const coverImg = article.images?.[0];
                        return (
                          <a
                            key={article.id}
                            onClick={(e) => { e.preventDefault(); router.push(`/?tab=blog/${article.slug}`); }}
                            href={`/?tab=blog/${article.slug}`}
                            className={`flex gap-3 group cursor-pointer ${idx < 3 ? "pb-4 border-b border-gray-100" : ""}`}
                          >
                            <div className="relative shrink-0">
                              {coverImg ? (
                                <img src={coverImg} alt={article.title} className="w-16 h-16 rounded-lg object-cover" />
                              ) : (
                                <div className="w-16 h-16 rounded-lg bg-gray-100 flex items-center justify-center">
                                  <BookOpen className="w-5 h-5 text-gray-300" />
                                </div>
                              )}
                              <div className="absolute -top-1.5 -left-1.5 w-5 h-5 bg-gray-900 text-white rounded-full flex items-center justify-center text-[10px] font-bold z-10">
                                {idx + 1}
                              </div>
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-semibold text-gray-800 group-hover:text-gray-900 transition-colors line-clamp-2 leading-snug">
                                {article.title}
                              </p>
                              <div className="flex items-center gap-2 mt-1.5">
                                <span className="text-[11px] text-gray-400">{article.dateFormatted}</span>
                                <span className="text-[11px] text-gray-300">•</span>
                                <span className="text-[11px] text-gray-400">{article.readTime || "5 menit"}</span>
                                <span className="text-[11px] text-gray-300">•</span>
                                <span className="flex items-center gap-0.5 text-[11px] text-gray-400"><Eye className="w-3 h-3" />{article.views || 0}</span>
                              </div>
                            </div>
                          </a>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </FadeIn>
              )}

              {/* Kategori */}
              {categories.length > 0 && (
              <FadeIn delay={0.25}>
                <Card className="border-0 shadow-lg overflow-hidden">
                  <div className="bg-gradient-to-r from-gray-700 to-gray-800 px-5 py-4">
                    <h3 className="text-white font-bold flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      Kategori
                    </h3>
                  </div>
                  <CardContent className="p-4">
                    <div className="flex flex-wrap gap-2">
                      {categories.map((cat) => {
                        const count = articles.filter((a) => a.category === cat).length;
                        return (
                          <span
                            key={cat}
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 hover:border-gray-200 rounded-lg text-sm text-gray-600 hover:text-gray-900 font-medium transition-colors cursor-default"
                          >
                            {cat}
                            <span className="text-xs bg-gray-200 text-gray-500 px-1.5 py-0.5 rounded-full">{count}</span>
                          </span>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </FadeIn>
              )}

              {/* CTA WhatsApp */}
              <FadeIn delay={0.35}>
                <Card className="border-0 shadow-lg overflow-hidden bg-gradient-to-br from-gray-800 to-gray-900 text-white">
                  <CardContent className="p-6 text-center">
                    <div className="w-14 h-14 bg-gray-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <MessageCircle className="w-7 h-7 text-gray-300" />
                    </div>
                    <h4 className="font-bold text-lg mb-2">Masih Bingung?</h4>
                    <p className="text-sm text-gray-400 mb-5 leading-relaxed">
                      Konsultasikan kebutuhan rumah Anda dengan tim ahli kami secara gratis.
                    </p>
                    <a
                      href={`https://wa.me/${S.contact_wa}?text=Halo,%20saya%20ingin%20konsultasi%20tentang%20rumah`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-gray-900 hover:bg-gray-800 text-white font-semibold rounded-xl text-sm transition-colors w-full justify-center"
                    >
                      <Phone className="w-4 h-4" />
                      Hubungi via WhatsApp
                    </a>
                  </CardContent>
                </Card>
              </FadeIn>
            </aside>
          </div>
          )}
        </div>
      </section>
    </>
  );
}

/* ─────────────────────────── KONTAK PAGE ─────────────────────────── */

function KontakPage() {
  const { settings: S } = useSettingsStore();
  return (
    <>
      <PageBanner title="Hubungi Kami" subtitle="Tim marketing kami siap melayani Anda" />
      <ContactSection />
    </>
  );
}

/* ─────────────────────────── GALLERY PAGE WRAPPER ─────────────────────────── */

function GalleryPage() {
  const { settings: S } = useSettingsStore();
  return (
    <>
      <PageBanner title="Gallery" subtitle="Dokumentasi foto proyek dan lingkungan kami" />
      <ProyekGallery />
    </>
  );
}

/* ─────────────────────────── JASA DATA ─────────────────────────── */

const SERVICE_CATEGORY_LABELS: Record<string, string> = {
  konstruksi: "Konstruksi Rumah",
  renovasi: "Renovasi Rumah",
  desain_arsitektur: "Desain Arsitektur",
  desain_interior: "Desain Interior",
  jasa_gambar: "Jasa Gambar / IMB",
  pengecatan: "Pengecatan",
  instalasi_listrik: "Instalasi Listrik",
  instalasi_pipa: "Instalasi Pipa / Sanitasi",
  taman_landscape: "Taman & Landscape",
  konsultasi: "Konsultasi Bangunan",
};

const SERVICE_PRICE_UNIT_MAP: Record<string, string> = {
  proyek: "Per Proyek",
  per_m2: "Per m²",
  per_bulan: "Per Bulan",
  jam: "Per Jam",
};

const SERVICE_CATEGORY_ICONS: Record<string, typeof Wrench> = {
  konstruksi: HardHat,
  renovasi: Hammer,
  desain_arsitektur: Ruler,
  desain_interior: Paintbrush,
  jasa_gambar: FileText,
  pengecatan: Paintbrush,
  instalasi_listrik: Zap,
  instalasi_pipa: Droplets,
  taman_landscape: TreeIcon,
  konsultasi: MessageSquare,
};

const SERVICE_CATEGORY_GRADIENTS: Record<string, string> = {
  konstruksi: "from-gray-800 to-gray-900",
  renovasi: "from-gray-700 to-gray-800",
  desain_arsitektur: "from-gray-600 to-gray-700",
  desain_interior: "from-gray-500 to-gray-600",
  jasa_gambar: "from-gray-800 to-gray-950",
  pengecatan: "from-gray-700 to-gray-900",
  instalasi_listrik: "from-gray-600 to-gray-800",
  instalasi_pipa: "from-gray-500 to-gray-700",
  taman_landscape: "from-gray-800 to-gray-900",
  konsultasi: "from-gray-700 to-gray-800",
};

/* ─────────────────────────── JASA PAGE ─────────────────────────── */

function ServiceCard({
  service,
  onSelect,
}: {
  service: ServiceItem;
  onSelect: (s: ServiceItem) => void;
}) {
  const catLabel = SERVICE_CATEGORY_LABELS[service.category] || service.category;
  const unitLabel = SERVICE_PRICE_UNIT_MAP[service.priceUnit] || service.priceUnit;
  const IconComponent = SERVICE_CATEGORY_ICONS[service.category] || Wrench;
  const gradient = SERVICE_CATEGORY_GRADIENTS[service.category] || "from-gray-800 to-gray-900";

  return (
    <FadeIn className="h-full">
      <Card
        className="group h-full overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 cursor-pointer"
        onClick={() => onSelect(service)}
      >
        {/* Image */}
        <div className="relative h-48 overflow-hidden bg-gray-200">
          {service.image ? (
            <img
              src={service.image}
              alt={service.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className={`w-full h-full bg-gradient-to-br ${gradient} flex items-center justify-center`}>
              <IconComponent className="w-16 h-16 text-white/30" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          <div className="absolute top-3 left-3 flex gap-1.5">
            <Badge className="bg-white/90 text-gray-700 border-0 shadow-lg text-xs font-semibold backdrop-blur-sm">
              {catLabel}
            </Badge>
            {service.isFeatured && (
              <Badge className="bg-gray-500 text-gray-900 border-0 shadow-lg text-xs font-bold">
                <Star className="w-3 h-3 mr-1" /> Unggulan
              </Badge>
            )}
          </div>
          {service.videoUrl && (
            <div className="absolute top-3 right-3">
              <span className="text-[9px] font-bold px-2 py-1 rounded-lg bg-gray-900/90 text-white backdrop-blur-sm flex items-center gap-1">
                <Camera className="w-3 h-3" /> Video
              </span>
            </div>
          )}
        </div>
        <CardContent className="p-5">
          {/* Title */}
          <h3 className="font-bold text-gray-900 text-lg leading-tight mb-2 group-hover:text-gray-900 transition-colors">
            {service.title}
          </h3>

          {/* Description snippet */}
          {service.description && (
            <p className="text-gray-500 text-sm leading-relaxed mb-3 line-clamp-2">
              {service.description.replace(/<[^>]*>/g, "")}
            </p>
          )}

          {/* Features pills */}
          {service.features.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-3">
              {service.features.slice(0, 3).map((feat, i) => (
                <span
                  key={i}
                  className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-gray-100 text-gray-600"
                >
                  {feat}
                </span>
              ))}
              {service.features.length > 3 && (
                <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-gray-100 text-gray-400">
                  +{service.features.length - 3}
                </span>
              )}
            </div>
          )}

          {/* Price + Duration */}
          <div className="flex items-center justify-between pt-3 border-t border-gray-100">
            <div>
              <span className="text-lg font-extrabold text-gray-900">
                {service.price > 0 ? `Rp ${new Intl.NumberFormat("id-ID").format(service.price)}` : "Hubungi Kami"}
              </span>
              {service.price > 0 && (
                <span className="text-xs text-gray-400 ml-1">/ {unitLabel}</span>
              )}
            </div>
            {service.duration && (
              <span className="text-xs font-medium text-gray-500 flex items-center gap-1">
                <Clock className="w-3 h-3" /> {service.duration}
              </span>
            )}
          </div>
        </CardContent>
      </Card>
    </FadeIn>
  );
}

function ServiceDetailDialog({
  service,
  open,
  onClose,
}: {
  service: ServiceItem | null;
  open: boolean;
  onClose: () => void;
}) {
  const { settings: S } = useSettingsStore();
  if (!service) return null;
  const catLabel = SERVICE_CATEGORY_LABELS[service.category] || service.category;
  const unitLabel = SERVICE_PRICE_UNIT_MAP[service.priceUnit] || service.priceUnit;
  const IconComponent = SERVICE_CATEGORY_ICONS[service.category] || Wrench;
  const gradient = SERVICE_CATEGORY_GRADIENTS[service.category] || "from-gray-800 to-gray-900";
  const embedUrl = getYoutubeEmbedUrl(service.videoUrl);

  const waText = encodeURIComponent(
    `Halo, saya tertarik dengan jasa *${service.title}* (${catLabel}). Mohon info lebih lanjut.`
  );

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent aria-describedby={undefined} className="sm:max-w-3xl max-h-[90vh] overflow-y-auto p-0 gap-0">
        <DialogTitle className="sr-only">{service.title}</DialogTitle>
        {/* Hero Image */}
        <div className="relative h-64 sm:h-80 bg-gray-200">
          {service.image ? (
            <img
              src={service.image}
              alt={service.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className={`w-full h-full bg-gradient-to-br ${gradient} flex items-center justify-center`}>
              <IconComponent className="w-24 h-24 text-white/20" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-6">
            <Badge className="mb-3 bg-white/90 text-gray-700 border-0 shadow-lg text-xs font-semibold">
              {catLabel}
            </Badge>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight">
              {service.title}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-9 h-9 bg-black/40 hover:bg-black/60 text-white rounded-full flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Price + Duration row */}
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px] bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-4 border border-gray-200">
              <p className="text-xs text-gray-500 mb-1 font-medium">Harga</p>
              <p className="text-xl font-extrabold text-gray-900">
                {service.price > 0 ? `Rp ${new Intl.NumberFormat("id-ID").format(service.price)}` : "Hubungi Kami"}
              </p>
              {service.price > 0 && (
                <p className="text-xs text-gray-400 mt-0.5">/ {unitLabel}</p>
              )}
            </div>
            {service.duration && (
              <div className="flex-1 min-w-[200px] bg-gray-50 rounded-xl p-4 border border-gray-200">
                <p className="text-xs text-gray-500 mb-1 font-medium">Estimasi Durasi</p>
                <p className="text-xl font-extrabold text-gray-900">{service.duration}</p>
                <p className="text-xs text-gray-400 mt-0.5">Waktu pengerjaan</p>
              </div>
            )}
          </div>

          {/* Description */}
          {service.description && (
            <div>
              <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                <FileText className="w-4 h-4 text-gray-500" />
                Deskripsi
              </h3>
              <div
                className="prose prose-sm max-w-none text-gray-600 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: service.description }}
              />
            </div>
          )}

          {/* Features */}
          {service.features.length > 0 && (
            <div>
              <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-gray-500" />
                Keunggulan
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {service.features.map((feat, i) => (
                  <div key={i} className="flex items-start gap-2.5 bg-gray-50 rounded-lg p-3">
                    <CheckCircle2 className="w-4 h-4 text-gray-500 mt-0.5 shrink-0" />
                    <span className="text-sm text-gray-700">{feat}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Video */}
          {embedUrl && (
            <div>
              <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                <Camera className="w-4 h-4 text-gray-500" />
                Video Preview
              </h3>
              <div className="aspect-video rounded-xl overflow-hidden shadow-lg">
                <iframe
                  src={embedUrl}
                  title={service.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full"
                />
              </div>
            </div>
          )}

          {/* CTA */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <a
              href={`https://wa.me/${S.contact_wa}?text=${waText}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-gray-900 text-white font-bold rounded-xl shadow-lg hover:bg-gray-800 transition-all active:scale-95"
            >
              <MessageCircle className="w-5 h-5" />
              Tanya via WhatsApp
            </a>
            <a
              href={`https://wa.me/${S.contact_wa}?text=${waText}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-gray-900 text-white font-bold rounded-xl shadow-lg hover:bg-gray-800 transition-all active:scale-95"
            >
              <Phone className="w-5 h-5" />
              Hubungi Kami
            </a>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function JasaListingSection({
  onSelectService,
}: {
  onSelectService: (s: ServiceItem) => void;
}) {
  const { services, fetchServices } = useServiceStore();
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [prevFilterKey, setPrevFilterKey] = useState(`${activeCategory}`);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  if (prevFilterKey !== `${activeCategory}`) {
    setPrevFilterKey(`${activeCategory}`);
    setPage(1);
  }

  const filtered = activeCategory === "all"
    ? services
    : services.filter((s) => s.category === activeCategory);

  const totalPages = Math.ceil(filtered.length / JASA_PER_PAGE);
  const paged = filtered.slice((page - 1) * JASA_PER_PAGE, page * JASA_PER_PAGE);

  return (
    <section className="py-20 md:py-28 bg-section-gray">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeIn className="text-center mb-12">
          <Badge variant="secondary" className="mb-4 bg-gray-50 text-gray-600 border-gray-200">
            <HardHat className="w-3.5 h-3.5 mr-1.5" />
            Layanan Jasa Kami
          </Badge>
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">
            Solusi Bangunan <span className="text-gray-900">Profesional</span>
          </h2>
          <p className="text-gray-500 max-w-2xl mx-auto text-lg">
            Dari konstruksi hingga desain interior — semua kebutuhan bangunan Anda
            ditangani oleh tim berpengalaman.
          </p>
        </FadeIn>

        {/* Category Filter */}
        <FadeIn delay={0.1} className="flex flex-wrap justify-center gap-2.5 mb-10">
          <button
            onClick={() => setActiveCategory("all")}
            className={`px-5 py-2.5 text-sm font-semibold rounded-xl transition-all duration-200 ${
              activeCategory === "all"
                ? "bg-gray-900 text-white shadow-lg shadow-gray-900/20"
                : "bg-white text-gray-600 border border-gray-200 hover:border-gray-300 hover:bg-gray-50 hover:text-gray-900"
            }`}
          >
            Semua Jasa
          </button>
          {Object.entries(SERVICE_CATEGORY_LABELS).map(([key, label]) => {
            const Icon = SERVICE_CATEGORY_ICONS[key] || Wrench;
            return (
              <button
                key={key}
                onClick={() => setActiveCategory(key)}
                className={`px-4 py-2.5 text-sm font-semibold rounded-xl transition-all duration-200 flex items-center gap-2 ${
                  activeCategory === key
                    ? "bg-gray-900 text-white shadow-lg shadow-gray-900/20"
                    : "bg-white text-gray-600 border border-gray-200 hover:border-gray-300 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            );
          })}
        </FadeIn>

        {/* Grid */}
        {paged.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {paged.map((service) => (
                <ServiceCard
                  key={service.id}
                  service={service}
                  onSelect={onSelectService}
                />
              ))}
            </div>
            <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
          </>
        ) : (
          <div className="text-center py-20">
            <Wrench className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-gray-400 mb-2">
              Belum ada jasa tersedia
            </h3>
            <p className="text-gray-400 text-sm">
              Jasa yang dipublikasikan akan muncul di sini.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}

function JasaPage({
  onSelectService,
}: {
  onSelectService: (s: ServiceItem) => void;
}) {
  const { settings: S } = useSettingsStore();
  return (
    <>
      <PageBanner
        title="Jasa & Layanan"
        subtitle="Solusi bangunan profesional dari konstruksi hingga desain interior"
      />
      <JasaListingSection onSelectService={onSelectService} />
    </>
  );
}

/* ─────────────────────────── MITRA PAGE ─────────────────────────── */

function MitraPage() {
  const { settings: S } = useSettingsStore();
  const { mitraList, loading, fetchMitraList } = useMitraStore();

  useEffect(() => {
    fetchMitraList();
  }, [fetchMitraList]);

  return (
    <>
      <PageBanner
        title="Mitra Developer"
        subtitle="Developer perumahan terpilih yang bergabung dengan platform kami"
      />

      <section className="py-20 md:py-28 bg-section-gray">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn className="text-center mb-16">
            <Badge variant="secondary" className="mb-4 bg-gray-100 text-gray-600 border-gray-200">
              <Handshake className="w-3.5 h-3.5 mr-1.5" />
              Mitra Terpercaya
            </Badge>
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">
              Developer <span className="text-gray-900">Terpilih</span> & Terverifikasi
            </h2>
            <p className="text-gray-500 max-w-2xl mx-auto text-lg">
              Setiap mitra developer yang bergabung telah melalui proses kurasi ketat — dari legalitas, kualitas bangunan, hingga track record.
            </p>
          </FadeIn>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="bg-white rounded-2xl shadow-lg animate-pulse h-64" />
              ))}
            </div>
          ) : mitraList.length === 0 ? (
            <div className="text-center py-20">
              <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-gray-400 mb-2">Belum ada mitra terdaftar</h3>
              <p className="text-gray-400 text-sm">Developer mitra yang terdaftar akan tampil di sini.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {mitraList.map((mitra, i) => (
                <FadeIn key={mitra.id} delay={i * 0.08}>
                  <Card className="h-full border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group overflow-hidden">
                    {/* Top accent */}
                    <div className="h-1.5 bg-gradient-to-r from-gray-800 via-gray-600 to-gray-800" />
                    <CardContent className="p-6">
                      {/* Logo / Initial */}
                      <div className="flex items-start gap-4 mb-4">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center shadow-lg shrink-0 overflow-hidden group-hover:scale-105 transition-transform">
                          {mitra.logo ? (
                            <img src={mitra.logo} alt={mitra.name} className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-white font-extrabold text-xl">
                              {mitra.name.charAt(0).toUpperCase()}
                            </span>
                          )}
                        </div>
                        <div className="min-w-0">
                          <h3 className="text-lg font-bold text-gray-900 truncate">{mitra.name}</h3>
                          <p className="text-sm text-gray-500 flex items-center gap-1 mt-0.5">
                            <MapPin className="w-3.5 h-3.5 shrink-0" />
                            <span className="truncate">{mitra.address || "Indonesia"}</span>
                          </p>
                        </div>
                      </div>

                      {/* Description */}
                      {mitra.description && (
                        <p className="text-gray-600 text-sm leading-relaxed mb-4 line-clamp-3">
                          {mitra.description}
                        </p>
                      )}

                      {/* Stats */}
                      <div className="flex items-center gap-4 pt-4 border-t border-gray-100">
                        <div className="flex items-center gap-1.5 text-sm">
                          <Building2 className="w-4 h-4 text-gray-500" />
                          <span className="font-bold text-gray-900">{mitra.propertyCount}</span>
                          <span className="text-gray-500">Proyek</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-sm">
                          <CheckCircle2 className="w-4 h-4 text-gray-500" />
                          <span className="text-gray-500">Terverifikasi</span>
                        </div>
                      </div>

                      {/* Contact */}
                      {(mitra.phone || mitra.email || mitra.website) && (
                        <div className="flex flex-wrap gap-2 mt-4">
                          {mitra.website && (
                            <a
                              href={mitra.website.startsWith("http") ? mitra.website : `https://${mitra.website}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-gray-50 text-gray-600 hover:bg-gray-100 transition-colors"
                            >
                              <Globe className="w-3 h-3" /> Website
                            </a>
                          )}
                          {mitra.phone && (
                            <a
                              href={`https://wa.me/${mitra.phone.replace(/^0/, "62")}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-gray-50 text-gray-600 hover:bg-gray-100 transition-colors"
                            >
                              <Phone className="w-3 h-3" /> WhatsApp
                            </a>
                          )}
                          {mitra.email && (
                            <a
                              href={`mailto:${mitra.email}`}
                              className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-gray-50 text-blue-700 hover:bg-blue-100 transition-colors"
                            >
                              <MessageSquare className="w-3 h-3" /> Email
                            </a>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </FadeIn>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA — Bergabung sebagai Mitra */}
      <section className="py-20 md:py-28 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-72 h-72 bg-gray-1000/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-gray-500/10 rounded-full blur-3xl" />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <FadeIn>
            <Badge variant="secondary" className="mb-6 bg-white/10 text-gray-300 border-white/20">
              <Handshake className="w-3.5 h-3.5 mr-1.5" />
              Bergabunglah
            </Badge>
            <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4">
              Tertarik Bergabung sebagai <span className="text-gray-300">Mitra Developer</span>?
            </h2>
            <p className="text-gray-400 text-lg leading-relaxed mb-8 max-w-2xl mx-auto">
              Jika Anda adalah developer perumahan dengan legalitas lengkap dan track record baik,
              bergabunglah dengan {S.company_name} untuk memperluas jangkauan pemasaran Anda.
            </p>
            <a
              href={`https://wa.me/${S.contact_wa}?text=Halo,%20saya%20tertarik%20bergabung%20sebagai%20mitra%20developer`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-gray-900 font-bold rounded-2xl shadow-2xl hover:bg-gray-100 transition-all active:scale-95 text-lg"
            >
              Hubungi Kami
              <ArrowRight className="w-5 h-5" />
            </a>
          </FadeIn>
        </div>
      </section>
    </>
  );
}

/* ─────────────────────────── PROYEK PAGE ─────────────────────────── */

function ProyekPage({
  onSelectProperty,
}: {
  onSelectProperty: (p: Property) => void;
}) {
  const { settings: S } = useSettingsStore();
  return (
    <>
      <PageBanner title="Proyek Kami" subtitle="Pilih rumah idaman Anda dari berbagai tipe yang tersedia" />
      <PropertiesSection onSelectProperty={onSelectProperty} />
    </>
  );
}

/* ─────────────────────────── FOOTER ─────────────────────────── */

function Footer() {
  const { settings: S } = useSettingsStore();
  return (
    <footer className="bg-gray-950 text-gray-400 mt-auto border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-16">
          {/* Brand */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-5">
              <img src={S.logo_url || "/images/logo-brr.png"} alt="Logo" className="w-10 h-10 rounded-lg object-contain" />
              <div className="flex flex-col leading-tight">
                <span className="text-[10px] text-gray-500 font-semibold tracking-wider uppercase">{S.company_legal_name}</span>
                <span className="text-sm text-white font-black">{S.company_name}</span>
              </div>
            </div>
            <p className="text-gray-500 text-sm leading-relaxed mb-5 max-w-sm">
              Platform perumahan terpercaya yang menghimpun developer terpilih. Menyediakan hunian berkualitas dengan skema Syariah &amp; KPR.
            </p>
            <div className="flex gap-2">
              <a href={`https://instagram.com/${S.social_instagram}`} target="_blank" rel="noopener noreferrer" className="w-9 h-9 bg-gray-800 hover:bg-gray-700 rounded-lg flex items-center justify-center transition-colors"><Instagram className="w-4 h-4" /></a>
              <a href={`https://wa.me/${S.contact_wa}`} target="_blank" rel="noopener noreferrer" className="w-9 h-9 bg-gray-800 hover:bg-gray-700 rounded-lg flex items-center justify-center transition-colors"><MessageCircle className="w-4 h-4" /></a>
            </div>
          </div>

          {/* Menu */}
          <div>
            <h4 className="text-white font-bold text-sm mb-5">Navigasi</h4>
            <ul className="space-y-2.5">
              {NAV_LINKS.map((link) => (
                <li key={link.tab}><a href={`/?tab=${link.tab}`} className="text-sm hover:text-white transition-colors">{link.label}</a></li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-bold text-sm mb-5">Kontak</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-2.5"><Phone className="w-4 h-4 text-gray-500 mt-0.5 shrink-0" /><div><p className="text-sm">{S.contact_phone}</p><p className="text-xs text-gray-600">{S.contact_person}</p></div></li>
              <li className="flex items-start gap-2.5"><MapPin className="w-4 h-4 text-gray-500 mt-0.5 shrink-0" /><p className="text-sm">{S.contact_address}</p></li>
              <li className="flex items-start gap-2.5"><Instagram className="w-4 h-4 text-gray-500 mt-0.5 shrink-0" /><p className="text-sm">@{S.social_instagram}</p></li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-8 border-t border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-600">&copy; {new Date().getFullYear()} {S.company_legal_name}. All rights reserved.</p>
          <p className="text-xs text-gray-700">Built with ❤️ for better living.</p>
        </div>
      </div>
    </footer>
  );
}

/* ─────────────────────────── LOADING ─────────────────────────── */

function LoadingSpinner() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-gray-200 border-t-gray-900 rounded-full animate-spin" />
        <p className="text-gray-500 text-sm">Memuat...</p>
      </div>
    </div>
  );
}

/* ─────────────────────────── MAIN PAGE ─────────────────────────── */

function PageContent() {
  const searchParams = useSearchParams();
  const tab = searchParams.get("tab") || "home";
  const { settings: S, fetchSettings } = useSettingsStore();
  const { properties: PROPERTIES, loading: propertiesLoading, refetchProperties } = usePropertyStore();
  const [selectedProperty, setSelectedProperty] = useState<
    Property | null
  >(null);
  const [selectedService, setSelectedService] = useState<
    ServiceItem | null
  >(null);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  useEffect(() => {
    refetchProperties();
  }, [refetchProperties]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [tab]);

  const handleSelectProperty = useCallback((p: Property) => {
    setSelectedProperty(p);
  }, []);

  const handleSelectService = useCallback((s: ServiceItem) => {
    setSelectedService(s);
  }, []);

  const renderContent = () => {
    // Check if it's a blog article URL: ?tab=blog/slug (before switch since switch uses strict ===)
    const blogSlugMatch = tab.match(/^blog\/(.+)$/);
    if (blogSlugMatch) {
      return <BlogArticlePage slug={blogSlugMatch[1]} />;
    }

    switch (tab) {
      case "tentang":
        return (
          <>
            <Navbar activeTab={tab} />
            <TentangKamiPage />
            <Footer />
            <Chatbot />
          </>
        );
      case "proyek":
        return (
          <>
            <Navbar activeTab={tab} />
            <ProyekPage onSelectProperty={handleSelectProperty} />
            <PropertyDetailDialog
              property={selectedProperty}
              open={!!selectedProperty}
              onClose={() => setSelectedProperty(null)}
            />
            <Footer />
            <Chatbot />
          </>
        );
      case "jasa":
        return (
          <>
            <Navbar activeTab={tab} />
            <JasaPage onSelectService={handleSelectService} />
            <ServiceDetailDialog
              service={selectedService!}
              open={!!selectedService}
              onClose={() => setSelectedService(null)}
            />
            <Footer />
            <Chatbot />
          </>
        );
      case "mitra":
        return (
          <>
            <Navbar activeTab={tab} />
            <MitraPage />
            <Footer />
            <Chatbot />
          </>
        );
      case "gallery":
        return (
          <>
            <Navbar activeTab={tab} />
            <GalleryPage />
            <Footer />
            <Chatbot />
          </>
        );
      case "blog":
        return (
          <>
            <Navbar activeTab={tab} />
            <BlogPage />
            <Footer />
            <Chatbot />
          </>
        );
      case "kontak":
        return (
          <>
            <Navbar activeTab={tab} />
            <KontakPage />
            <Footer />
            <Chatbot />
          </>
        );
      default:
        return (
          <>
            <Navbar activeTab={tab} />
            <Hero />
            <MarqueeStrip />
            <VideoOverviewSection />
            <WhyChooseSection />
            <PropertyShowcaseSection onSelectProperty={handleSelectProperty} />
            <HowToBuySection />
            <ServicePreviewSection onSelectService={handleSelectService} />
            <TestimonialsCarousel limit={6} />
            <BlogPreviewSection />
            <FAQSection />
            <CTASection />
            <PropertyDetailDialog
              property={selectedProperty}
              open={!!selectedProperty}
              onClose={() => setSelectedProperty(null)}
            />
            <ServiceDetailDialog
              service={selectedService!}
              open={!!selectedService}
              onClose={() => setSelectedService(null)}
            />
            <Footer />
            <Chatbot />
          </>
        );
    }
  };

  return <main className="min-h-screen flex flex-col bg-white">{renderContent()}</main>;
}

export default function HomePage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <PageContent />
    </Suspense>
  );
}
