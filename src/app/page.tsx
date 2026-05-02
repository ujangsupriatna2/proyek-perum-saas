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
  SlidersHorizontal,
  Mail,
  Youtube,
  Music,
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
  { icon: MapPin, title: "Lokasi Strategis", desc: "Berada di lokasi primadona, dekat akses tol & fasilitas umum." },
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
    gradient: "from-gray-600 to-gray-700",
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

/* ── Sparkle Luxury Cursor Trail ── */
function SparkleCursor() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Array<{
    x: number; y: number; vx: number; vy: number;
    life: number; maxLife: number; size: number;
    type: 'star' | 'dot' | 'diamond';
    rotation: number; rotSpeed: number;
    color: string; alpha: number;
    glow: boolean;
  }>>([]);
  const textZonesRef = useRef<Array<{ x: number; y: number; w: number; h: number }>>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    // ─── Device detection ───
    const isMobile = /Android|iPhone|iPad|iPod|Opera Mini|IEMobile/i.test(navigator.userAgent)
      || window.innerWidth < 768;
    const MAX_PARTICLES = isMobile ? 120 : 400;
    const AMBIENT_MAX_PER_FRAME = isMobile ? 1 : 2;
    const AMBIENT_INTERVAL = isMobile ? 18 : 8;
    const SCROLL_MAX_PER_FRAME = isMobile ? 1 : 3;
    const FRAME_SKIP = isMobile ? 2 : 1; // draw every N frames

    let W = 0, H = 0;
    const resize = () => {
      W = window.innerWidth;
      H = document.documentElement.scrollHeight;
      canvas.width = W;
      canvas.height = window.innerHeight;
      collectTextZones();
    };

    let collectPending = false;
    const scheduleCollect = () => {
      if (collectPending) return;
      collectPending = true;
      setTimeout(() => { collectPending = false; collectTextZones(); }, 500);
    };

    const collectTextZones = () => {
      textZonesRef.current = [];
      const selectors = 'h1, h2, h3, h4, .text-hero-glossy, .text-hero-glossy-accent, [class*="shimmer"]';
      const els = document.querySelectorAll(selectors);
      els.forEach(el => {
        const rect = el.getBoundingClientRect();
        if (rect.width > 50 && rect.height > 10) {
          textZonesRef.current.push({
            x: rect.left,
            y: rect.top + window.scrollY,
            w: rect.width,
            h: rect.height,
          });
        }
      });
    };

    resize();
    window.addEventListener("resize", resize);
    // Debounced scroll zone refresh (no canvas resize!)
    let scrollTimer: ReturnType<typeof setTimeout>;
    const onScroll = () => {
      clearTimeout(scrollTimer);
      scrollTimer = setTimeout(scheduleCollect, 200);
    };
    window.addEventListener("scroll", onScroll, { passive: true });

    // Re-collect on mutation (debounced)
    const observer = new MutationObserver(scheduleCollect);
    observer.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['class', 'style'] });
    const zoneInterval = setInterval(scheduleCollect, 5000);

    let mouseX = -100, mouseY = -100;
    let lastX = -100, lastY = -100;
    let frame = 0;
    let lastScrollY = window.scrollY;
    let animId = 0;
    let idleFrames = 0;

    const colors = [
      "rgba(200, 200, 210, ",
      "rgba(220, 220, 230, ",
      "rgba(180, 180, 195, ",
      "rgba(255, 255, 255, ",
      "rgba(170, 160, 150, ",
      "rgba(210, 200, 190, ",
    ];
    const glowColors = [
      "rgba(255, 255, 255, ",
      "rgba(220, 215, 210, ",
      "rgba(200, 195, 185, ",
      "rgba(240, 240, 245, ",
    ];

    const spawnParticles = (x: number, y: number, count: number, opts?: { glow?: boolean; sizeMul?: number; lifeMul?: number }) => {
      const sizeMul = opts?.sizeMul ?? 1;
      const lifeMul = opts?.lifeMul ?? 1;
      const useGlow = opts?.glow ?? false;
      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 0.3 + Math.random() * 1.5;
        const types: Array<'star' | 'dot' | 'diamond'> = ['star', 'dot', 'diamond'];
        particlesRef.current.push({
          x: x + (Math.random() - 0.5) * 14,
          y: y + (Math.random() - 0.5) * 14,
          vx: Math.cos(angle) * speed * (useGlow ? 0.6 : 1),
          vy: Math.sin(angle) * speed * (useGlow ? 0.4 : 1) - 0.5 - Math.random() * 0.8,
          life: 1,
          maxLife: (25 + Math.random() * 35) * lifeMul,
          size: (1 + Math.random() * 3) * sizeMul,
          type: types[Math.floor(Math.random() * types.length)],
          rotation: Math.random() * Math.PI * 2,
          rotSpeed: (Math.random() - 0.5) * 0.1,
          color: useGlow
            ? glowColors[Math.floor(Math.random() * glowColors.length)]
            : colors[Math.floor(Math.random() * colors.length)],
          alpha: useGlow ? 0.3 + Math.random() * 0.3 : 0.6 + Math.random() * 0.4,
          glow: useGlow,
        });
      }
    };

    const drawStar = (cx: number, cy: number, r: number, rotation: number, alpha: number) => {
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(rotation);
      ctx.globalAlpha = alpha;
      ctx.beginPath();
      for (let i = 0; i < 4; i++) {
        const a = (i / 4) * Math.PI * 2;
        ctx.moveTo(0, 0);
        ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
      }
      ctx.strokeStyle = "rgba(255,255,255,0.8)";
      ctx.lineWidth = 0.5;
      ctx.stroke();
      ctx.globalAlpha = 1;
      ctx.restore();
    };

    const drawDiamond = (cx: number, cy: number, s: number, rotation: number, alpha: number) => {
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(rotation);
      ctx.globalAlpha = alpha;
      ctx.beginPath();
      ctx.moveTo(0, -s);
      ctx.lineTo(s * 0.6, 0);
      ctx.lineTo(0, s);
      ctx.lineTo(-s * 0.6, 0);
      ctx.closePath();
      ctx.fillStyle = "rgba(255,255,255,0.7)";
      ctx.fill();
      ctx.globalAlpha = 1;
      ctx.restore();
    };

    const onMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      idleFrames = 0; // wake up
    };
    const onTouchMove = (e: TouchEvent) => {
      mouseX = e.touches[0].clientX;
      mouseY = e.touches[0].clientY;
      idleFrames = 0;
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("touchmove", onTouchMove, { passive: true });

    const animate = () => {
      frame++;

      // ─── Idle detection: skip draw if no particles & mouse idle ───
      const pLen = particlesRef.current.length;
      if (pLen === 0 && idleFrames > 120) {
        // Check if there are visible text zones that need ambient
        const scrollY = window.scrollY;
        const viewBottom = scrollY + window.innerHeight;
        const viewTop = scrollY;
        let hasVisibleZone = false;
        for (const z of textZonesRef.current) {
          if (z.y + z.h > viewTop && z.y < viewBottom) { hasVisibleZone = true; break; }
        }
        if (!hasVisibleZone) {
          // Truly idle — sleep and check again later
          idleFrames++;
          if (idleFrames % 60 === 0) {
            // Wake up every ~1s to re-check
            animId = requestAnimationFrame(animate);
          } else {
            animId = requestAnimationFrame(animate);
          }
          return;
        }
      }

      // Frame skip for mobile
      if (frame % FRAME_SKIP !== 0 && pLen > 50) {
        // Still update positions but don't draw
        for (const p of particlesRef.current) {
          p.x += p.vx;
          p.y += p.vy;
          p.life -= 1 / p.maxLife;
        }
        animId = requestAnimationFrame(animate);
        return;
      }

      ctx.clearRect(0, 0, W, H);

      const scrollY = window.scrollY;
      const viewBottom = scrollY + window.innerHeight;
      const viewTop = scrollY;

      // ─── Ambient sparkle on visible text zones (max N per frame) ───
      if (frame % AMBIENT_INTERVAL === 0 && pLen < MAX_PARTICLES * 0.7) {
        const zones = textZonesRef.current;
        let spawned = 0;
        for (let z = 0; z < zones.length && spawned < AMBIENT_MAX_PER_FRAME; z++) {
          const zone = zones[z];
          const zoneBottom = zone.y + zone.h;
          if (zoneBottom < viewTop || zone.y > viewBottom) continue;
          if (Math.random() < 0.35) {
            const screenX = zone.x + Math.random() * zone.w;
            const screenY = zone.y + Math.random() * zone.h - scrollY;
            spawnParticles(screenX, screenY, 1, {
              glow: true,
              sizeMul: 0.8 + Math.random() * 0.6,
              lifeMul: 1.2 + Math.random() * 0.5,
            });
            spawned++;
          }
        }
      }

      // ─── Sparkle burst when scrolling (max N per frame) ───
      const scrollDelta = Math.abs(scrollY - lastScrollY);
      if (scrollDelta > 2 && pLen < MAX_PARTICLES * 0.85) {
        const zones = textZonesRef.current;
        let spawned = 0;
        for (let z = 0; z < zones.length && spawned < SCROLL_MAX_PER_FRAME; z++) {
          const zone = zones[z];
          if (zone.y + zone.h < viewTop || zone.y > viewBottom) continue;
          if (Math.random() < 0.4) {
            const screenX = zone.x + Math.random() * zone.w;
            const screenY = zone.y + Math.random() * zone.h - scrollY;
            if (screenY > -20 && screenY < window.innerHeight + 20) {
              spawnParticles(screenX, screenY, 1 + Math.floor(Math.random() * 2), {
                glow: true,
                sizeMul: 0.7 + Math.random() * 0.5,
                lifeMul: 1.0 + Math.random() * 0.3,
              });
              spawned++;
            }
          }
        }
        lastScrollY = scrollY;
        idleFrames = 0;
      } else if (scrollDelta <= 2) {
        lastScrollY = scrollY;
      }

      // ─── Cursor trail ───
      const dx = mouseX - lastX;
      const dy = mouseY - lastY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist > 3 && mouseX > 0) {
        const count = Math.min(isMobile ? 2 : 3, Math.ceil(dist / 8));
        spawnParticles(mouseX, mouseY, count);
        lastX = mouseX;
        lastY = mouseY;
      } else if (dist <= 3) {
        lastX = mouseX;
        lastY = mouseY;
      }

      // Cap particles
      if (particlesRef.current.length > MAX_PARTICLES) {
        particlesRef.current.splice(0, particlesRef.current.length - MAX_PARTICLES);
      }

      // ─── Update & draw particles ───
      for (let i = particlesRef.current.length - 1; i >= 0; i--) {
        const p = particlesRef.current[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += p.glow ? 0.005 : 0.01;
        p.vx *= p.glow ? 0.99 : 0.98;
        p.vy *= p.glow ? 0.99 : 0.98;
        p.rotation += p.rotSpeed;
        p.life -= 1 / p.maxLife;

        if (p.life <= 0) {
          // Swap-remove for O(1) instead of splice
          particlesRef.current[i] = particlesRef.current[particlesRef.current.length - 1];
          particlesRef.current.pop();
          continue;
        }

        const alpha = p.alpha * p.life;
        const size = p.size * (0.5 + p.life * 0.5);
        const glowR = p.glow ? size * 3.5 : size * 2.5;

        ctx.beginPath();
        ctx.arc(p.x, p.y, glowR, 0, Math.PI * 2);
        ctx.fillStyle = p.color + (alpha * (p.glow ? 0.1 : 0.15)).toFixed(3) + ")";
        ctx.fill();

        if (p.type === 'star') {
          drawStar(p.x, p.y, size * 1.5, p.rotation, alpha);
        } else if (p.type === 'diamond') {
          drawDiamond(p.x, p.y, size, p.rotation, alpha);
        } else {
          ctx.beginPath();
          ctx.arc(p.x, p.y, size * 0.8, 0, Math.PI * 2);
          ctx.fillStyle = p.color + alpha.toFixed(3) + ")";
          ctx.fill();
        }
      }

      // Soft glow around cursor
      if (mouseX > 0) {
        const pulse = 0.03 + Math.sin(frame * 0.05) * 0.015;
        const grad = ctx.createRadialGradient(mouseX, mouseY, 0, mouseX, mouseY, 30);
        grad.addColorStop(0, `rgba(200, 200, 210, ${pulse})`);
        grad.addColorStop(1, "transparent");
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(mouseX, mouseY, 30, 0, Math.PI * 2);
        ctx.fill();
      }

      // Track idle
      if (dist <= 3 && scrollDelta <= 2 && pLen === 0) {
        idleFrames++;
      }

      animId = requestAnimationFrame(animate);
    };

    animId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animId);
      clearInterval(zoneInterval);
      clearTimeout(scrollTimer);
      observer.disconnect();
      window.removeEventListener("resize", resize);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("touchmove", onTouchMove);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none"
      style={{ zIndex: 9999 }}
    />
  );
}

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

/* removed */

/* ── Constellation-style particles: diamonds, rings, small crosses ── */
function ConstellationParticles({ count = 10, dark = false }: { count?: number; dark?: boolean }) {
  const particles = Array.from({ length: count }, (_, i) => ({
    id: i,
    size: 4 + (i * 5) % 10,
    left: `${(i * 11 + 3) % 95}%`,
    top: `${(i * 17 + 7) % 90}%`,
    delay: i * 0.7,
    duration: 10 + (i % 4) * 3,
    rotation: i * 30,
    shape: i % 4, // 0: diamond, 1: ring, 2: cross/plus, 3: small line
  }));
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          animate={{
            y: [0, -18 - p.size * 1.5, 8, 0],
            x: [0, -12 + p.size * 0.5, 6, 0],
            opacity: [0.1, 0.3, 0.15, 0.1],
            rotate: [p.rotation, p.rotation + 90, p.rotation + 180, p.rotation],
          }}
          transition={{ duration: p.duration, repeat: Infinity, delay: p.delay, ease: "easeInOut" }}
          className={`absolute ${dark ? "border-white/20" : "border-gray-500/20"}`}
          style={{
            width: p.size,
            height: p.size,
            left: p.left,
            top: p.top,
            borderRadius: p.shape === 0 ? "1px" : p.shape === 1 ? "50%" : "0",
            borderWidth: p.shape === 3 ? "0" : "1px",
            borderStyle: p.shape === 2 ? "dashed" : "solid",
            backgroundColor: p.shape === 1 ? "transparent" : (dark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)"),
            ...(p.shape === 3 ? {
              backgroundImage: dark
                ? "linear-gradient(45deg, rgba(255,255,255,0.25) 25%, transparent 25%, transparent 75%, rgba(255,255,255,0.25) 75%)"
                : "linear-gradient(45deg, rgba(0,0,0,0.2) 25%, transparent 25%, transparent 75%, rgba(0,0,0,0.2) 75%)",
              backgroundSize: "2px 2px",
            } : {}),
          }}
        />
      ))}
      {/* Constellation connecting lines */}
      <svg className="absolute inset-0 w-full h-full" style={{ opacity: dark ? 0.06 : 0.04 }}>
        {particles.slice(0, Math.min(count, 5)).map((p, i) => {
          if (i === 0) return null;
          const prev = particles[i - 1];
          const x1 = parseFloat(prev.left) / 100 * 100 + prev.size / 2;
          const y1 = parseFloat(prev.top) / 100 * 100 + prev.size / 2;
          const x2 = parseFloat(p.left) / 100 * 100 + p.size / 2;
          const y2 = parseFloat(p.top) / 100 * 100 + p.size / 2;
          return (
            <line key={`line-${p.id}`} x1={`${x1}%`} y1={`${y1}%`} x2={`${x2}%`} y2={`${y2}%`}
              stroke={dark ? "white" : "#6b7280"} strokeWidth="0.5" strokeDasharray="4 4" />
          );
        })}
      </svg>
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
            {S.logo_url ? (
              <img src={S.logo_url} alt="Logo" className="w-10 h-10 md:w-11 md:h-11 rounded-xl object-contain" />
            ) : (
              <div className={`w-10 h-10 md:w-11 md:h-11 rounded-xl flex items-center justify-center ${isSolid ? 'bg-gray-900' : 'bg-white/15 backdrop-blur-sm'}`}>
                <Building2 className={`w-5 h-5 ${isSolid ? 'text-white' : 'text-white'}`} />
              </div>
            )}
            <span className={`text-xs md:text-sm font-bold tracking-wider uppercase ${isSolid ? 'text-gray-700' : 'text-white'} transition-colors`}>
              {S.company_legal_name}
            </span>
          </a>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-0.5">
            {NAV_LINKS.map((link) => (
              <a
                key={link.tab}
                href={`/?tab=${link.tab}`}
                onClick={(e) => { e.preventDefault(); handleNav(link.tab); }}
                className={`px-4 py-2 text-[13px] font-medium rounded-lg transition-all ${
                  isSolid
                    ? "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                    : "text-white/80 hover:text-white hover:bg-white/10"
                }`}
              >
                {link.label}
              </a>
            ))}
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
              {NAV_LINKS.map((link) => (
                <button
                  key={link.tab}
                  onClick={() => handleNav(link.tab)}
                  className="px-4 py-3 font-medium rounded-xl transition-colors text-left text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                >
                  {link.label}
                </button>
              ))}
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
        {S.hero_bg_image ? (
          <img
            src={S.hero_bg_image}
            alt={S.company_name}
            className="w-full h-full object-cover animate-ken-burns"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-gray-950 via-gray-800 to-black" />
        )}
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
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="text-[2rem] sm:text-5xl md:text-6xl lg:text-[4.5rem] font-black leading-[1.1] sm:leading-[1.1] mb-4 sm:mb-6 tracking-tight drop-shadow-[0_4px_30px_rgba(0,0,0,0.8)]"
        >
          <span className="block text-hero-glossy">Temukan Hunian</span>
          <span className="block mt-1 sm:mt-1 text-hero-glossy-accent">Idaman Anda <motion.span
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 1.0 }}
            className="inline-block -webkit-text-fill-color-transparent bg-clip-text"
            style={{ WebkitTextFillColor: 'transparent' }}
          >di Sini</motion.span></span>
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
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center mb-12 sm:mb-16 px-4 sm:px-0">
          <motion.a
            href={`https://wa.me/${S.contact_wa}`}
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, y: 25, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.8, ease: [0.16, 1, 0.3, 1] }}
            whileHover={{ scale: 1.03, y: -2 }}
            whileTap={{ scale: 0.97 }}
            className="group relative inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3.5 sm:py-4 bg-white text-gray-950 font-bold rounded-xl hover:bg-gray-100 transition-all text-sm shadow-lg shadow-white/10 overflow-hidden"
          >
            <span className="relative z-10 flex items-center gap-2">
              <MessageCircle className="w-4 h-4" />
              Booking via WhatsApp
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
          </motion.a>
          <motion.button
            initial={{ opacity: 0, y: 25, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.92, ease: [0.16, 1, 0.3, 1] }}
            whileHover={{ scale: 1.03, y: -2 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => router.push("/?tab=proyek")}
            className="inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3.5 sm:py-4 border border-white/25 text-white font-semibold rounded-xl hover:bg-white/10 hover:border-white/50 transition-all text-sm backdrop-blur-sm"
          >
            Lihat Semua Proyek
            <ArrowRight className="w-4 h-4" />
          </motion.button>
        </div>

        {/* Stats Row */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.0 }}
          className="grid grid-cols-3 gap-3 sm:gap-5 max-w-sm sm:max-w-xl mx-auto"
        >
          {[
            { value: "3+", label: "Mitra Developer", icon: "🤝" },
            { value: `${S.total_units_sold}+`, label: "Unit Terjual", icon: "🏠" },
            { value: "10+", label: "Proyek Perumahan", icon: "🏗️" },
          ].map((stat, idx) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.6, delay: 1.1 + idx * 0.15 }}
              whileHover={{ scale: 1.05, y: -4 }}
              className="group relative"
            >
              <div className="relative bg-white/[0.07] backdrop-blur-sm border border-white/[0.12] rounded-2xl p-3 sm:p-5 text-center cursor-default overflow-hidden transition-all duration-300 group-hover:bg-white/[0.12] group-hover:border-white/25">
                {/* Shimmer sweep */}
                <motion.div
                  animate={{ x: ["-200%", "200%"] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear", delay: idx * 0.5 }}
                  className="absolute inset-0 w-[50%] bg-gradient-to-r from-transparent via-white/[0.06] to-transparent pointer-events-none"
                />
                {/* Top glow line */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[60%] h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />
                {/* Icon */}
                <motion.div
                  animate={{ y: [0, -3, 0] }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", delay: idx * 0.3 }}
                  className="text-lg sm:text-xl mb-1 sm:mb-2"
                >
                  {stat.icon}
                </motion.div>
                {/* Value */}
                <motion.div
                  className="text-xl sm:text-3xl font-black text-white drop-shadow-[0_1px_8px_rgba(0,0,0,0.5)]"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.3 + idx * 0.15 }}
                >
                  {stat.value}
                </motion.div>
                {/* Label */}
                <div className="text-[8px] sm:text-[11px] text-white/40 mt-1 sm:mt-1.5 font-semibold uppercase tracking-wider">{stat.label}</div>
              </div>
            </motion.div>
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
    "Lokasi Strategis",
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
  const [playing, setPlaying] = useState(true);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);

  const fmt = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  // Attach video events when videoUrl is available (ref is set after render)
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const onTime = () => {
      setCurrentTime(video.currentTime);
      setDuration(video.duration || 0);
      setProgress(video.duration ? (video.currentTime / video.duration) * 100 : 0);
    };
    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    const onEnded = () => setPlaying(false);
    const tryUnmute = () => {
      video.muted = false;
      setMuted(false);
    };

    video.addEventListener('timeupdate', onTime);
    video.addEventListener('loadedmetadata', onTime);
    video.addEventListener('play', onPlay);
    video.addEventListener('pause', onPause);
    video.addEventListener('ended', onEnded);
    video.addEventListener('playing', tryUnmute);

    return () => {
      video.removeEventListener('timeupdate', onTime);
      video.removeEventListener('loadedmetadata', onTime);
      video.removeEventListener('play', onPlay);
      video.removeEventListener('pause', onPause);
      video.removeEventListener('ended', onEnded);
      video.removeEventListener('playing', tryUnmute);
    };
  }, [videoUrl]);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) { video.play(); }
    else { video.pause(); }
  };

  const seekTo = (e: React.MouseEvent<HTMLDivElement>) => {
    const video = videoRef.current;
    const bar = progressRef.current;
    if (!video || !bar || !video.duration) return;
    const rect = bar.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    video.currentTime = ratio * video.duration;
  };

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
          <span className="block text-gray-400 text-xs font-bold uppercase tracking-[0.3em]">Kenali Kami</span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-shimmer-silver mt-4 mb-5 tracking-tight">
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
            <div className="relative rounded-2xl overflow-hidden border border-gray-200 shadow-xl shadow-gray-200/50 bg-black group">
              <video
                ref={videoRef}
                src={videoUrl}
                autoPlay
                muted={muted}
                loop
                playsInline
                preload="auto"
                className="w-full aspect-video object-cover"
                onClick={togglePlay}
              />

              {/* Quick pause/play pulse on click */}
              <div className="absolute inset-0 z-[5] pointer-events-none">
                {!playing && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-14 h-14 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center shadow-lg animate-scale-in">
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-gray-800 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                  </div>
                )}
              </div>

              {/* Controls bar - show on hover */}
              <div className="absolute bottom-0 left-0 right-0 z-10 bg-gradient-to-t from-black/70 via-black/30 to-transparent px-3 pb-3 pt-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                {/* Progress bar */}
                <div
                  ref={progressRef}
                  onClick={seekTo}
                  className="w-full h-1.5 bg-white/30 rounded-full cursor-pointer mb-2.5 group/bar hover:h-2.5 transition-all"
                >
                  <div
                    className="h-full bg-white rounded-full relative transition-[width] duration-100"
                    style={{ width: `${progress}%` }}
                  >
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow opacity-0 group-hover/bar:opacity-100 transition-opacity" />
                  </div>
                </div>

                <div className="flex items-center justify-between gap-2">
                  {/* Left: play + time */}
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={togglePlay}
                      className="w-9 h-9 rounded-full bg-white/15 backdrop-blur-sm text-white flex items-center justify-center hover:bg-white/30 transition-colors"
                    >
                      {playing ? (
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                        </svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      )}
                    </button>
                    <span className="text-white/90 text-xs font-mono tabular-nums">
                      {fmt(currentTime)} / {fmt(duration)}
                    </span>
                  </div>

                  {/* Right: mute */}
                  <button
                    type="button"
                    onClick={() => {
                      const next = !muted;
                      setMuted(next);
                      if (videoRef.current) videoRef.current.muted = next;
                    }}
                    className="w-9 h-9 rounded-full bg-white/15 backdrop-blur-sm text-white flex items-center justify-center hover:bg-white/30 transition-colors"
                    title={muted ? "Nyalakan suara" : "Matikan suara"}
                  >
                    {muted ? (
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707A1 1 0 0112 5v14a1 1 0 01-1.707.707L5.586 15z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.536 8.464a5 5 0 010 7.072M17.95 6.05a8 8 0 010 11.9M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707A1 1 0 0112 5v14a1 1 0 01-1.707.707L5.586 15z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
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
          <span className="block text-gray-500 text-xs font-bold uppercase tracking-[0.3em]">Mengapa Kami</span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-shimmer-silver-dark mt-4 mb-5 tracking-tight">
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

/* ─────────────────────────── TENTANG KAMI KEUNGGULAN (Redesigned) ─────────────────────────── */

function TentangKamiKeunggulanSection() {
  const { settings: S } = useSettingsStore();
  return (
    <section className="py-24 md:py-32 bg-gray-50 relative overflow-hidden">
      <ConstellationParticles count={7} dark={false} />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeIn className="text-center mb-16">
          <span className="inline-block px-3 py-1 bg-white text-gray-500 text-[10px] font-bold uppercase tracking-[0.25em] rounded-full mb-4">Keunggulan Kami</span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-gray-900 tracking-tight">
            Mengapa Berpercaya pada Kami?
          </h2>
          <p className="text-gray-500 max-w-2xl mx-auto text-lg mt-4">
            Bukan sekadar janji, tapi bukti nyata dari ratusan keluarga yang sudah mempercayai {S.company_name}.
          </p>
        </FadeIn>

        {/* Vertical cards with alternating icon sides */}
        <div className="grid md:grid-cols-2 gap-5">
          {FEATURES_TENTANG.map((feat, i) => {
            const Icon = feat.icon;
            const isEven = i % 2 === 0;
            return (
              <FadeIn key={feat.title} delay={i * 0.07}>
                <Card className="h-full border border-gray-100 hover:border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden">
                  <CardContent className="p-6 md:p-8">
                    <div className="flex items-start gap-5">
                      {/* Icon on alternating side */}
                      <div className={`shrink-0 w-14 h-14 bg-gray-900 rounded-2xl flex items-center justify-center shadow-lg ${isEven ? 'order-0' : 'order-0 md:order-last'}`}>
                        <Icon className="w-7 h-7 text-white" />
                      </div>
                      <div className={`flex-1 min-w-0 ${isEven ? '' : 'md:text-right'}`}>
                        <h3 className="text-lg font-extrabold text-gray-900 leading-tight">{feat.title}</h3>
                        <p className="text-gray-400 text-sm mt-1 mb-4">{feat.subtitle}</p>
                        <ul className={`space-y-2 mb-4 ${isEven ? '' : 'md:[&>li]:flex-row-reverse'}`}>
                          {feat.points.map((point, j) => (
                            <li key={j} className={`flex items-start gap-2 ${isEven ? '' : 'md:flex-row-reverse'}`}>
                              <CheckCircle2 className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                              <span className="text-gray-600 text-sm leading-relaxed">{point.replace("{{UNITS}}", S.total_units_sold)}</span>
                            </li>
                          ))}
                        </ul>
                        <div className="bg-gray-50 border border-gray-100 rounded-xl p-3">
                          <p className={`text-sm text-gray-600 flex items-start gap-2 ${isEven ? '' : 'md:flex-row-reverse'}`}>
                            <Award className="w-4 h-4 mt-0.5 shrink-0" />
                            <span><strong className="font-semibold">Bukti:</strong> {feat.proof}</span>
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
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
  onSelect?: (p: Property) => void;
}) {
  const router = useRouter();
  const finTypes = property.financingTypes ?? ["syariah", "kpr"];
  const bestKpr = getCheapestKprInstallment(property);

  const handleClick = () => {
    if (onSelect) {
      onSelect(property);
    } else {
      router.push(`/?tab=proyek/${property.slug}`);
    }
  };

  return (
    <FadeIn className="h-full">
      <div
        className="group h-full bg-white rounded-2xl border border-gray-200/80 hover:border-gray-300 hover:shadow-2xl transition-all duration-500 overflow-hidden cursor-pointer"
        onClick={handleClick}
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

function PropertyShowcaseSection() {
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
        <FadeIn className="text-center mb-10">
          <span className="block text-gray-400 text-xs font-bold uppercase tracking-[0.3em]">Proyek Unggulan</span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-shimmer-silver mt-3 mb-3 tracking-tight">
            Pilih Hunian <span className="text-gradient-gray">Idaman Anda</span>
          </h2>
          <p className="text-gray-500 max-w-lg mx-auto leading-relaxed">
            Tersedia berbagai tipe — Siap Huni, Kavling, dan Inden — dengan skema pembayaran yang fleksibel.
          </p>
        </FadeIn>
        {/* Filter */}
        <FadeIn delay={0.15} className="flex justify-center gap-1.5 mb-10">
          {(["all", "inden", "kavling", "siap_huni"] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
                activeCategory === cat
                  ? "bg-gray-900 text-white"
                  : "bg-white text-gray-500 border border-gray-200 hover:border-gray-300 hover:text-gray-900"
              }`}
            >
              {cat === "all" ? "Semua" : CATEGORY_LABELS[cat]}
            </button>
          ))}
        </FadeIn>

        {/* Property Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.slice(0, 6).map((property) => (
            <PremiumPropertyCard key={property.id} property={property} />
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
          <span className="block text-gray-400 text-xs font-bold uppercase tracking-[0.3em]">Cara Memiliki Rumah</span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-shimmer-silver mt-3 mb-4 tracking-tight">
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
          <span className="block text-gray-400 text-xs font-bold uppercase tracking-[0.3em]">Testimoni</span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-shimmer-silver mt-3 mb-4 tracking-tight">
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
          <span className="block text-gray-400 text-xs font-bold uppercase tracking-[0.3em]">FAQ</span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-shimmer-silver mt-3 mb-4 tracking-tight">Pertanyaan Umum</h2>
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
          <span className="block text-gray-400 text-xs font-bold uppercase tracking-[0.3em]">Gallery</span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-shimmer-silver mt-3 mb-4 tracking-tight">
            Galeri <span className="text-gradient-gray">Proyek</span>
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
        {S.location_bg_image ? (
          <img src={S.location_bg_image} alt="" className="w-full h-full object-cover" />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-gray-950 via-gray-900 to-black" />
        )}
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
            <span className="block text-gray-400 text-xs font-bold uppercase tracking-[0.3em]">Jangan Tunda Lagi</span>
            <motion.div
              animate={{ scaleX: [0, 1, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
              className="h-px w-12 bg-gray-500"
            />
          </div>
          <h2 className="text-3xl md:text-5xl font-black text-shimmer-silver-dark mb-6 leading-tight tracking-tight">
            Miliki Rumah Impian
            <br />
            Anda Sekarang
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

function ServicePreviewSection() {
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
          <span className="block text-gray-400 text-xs font-bold uppercase tracking-[0.3em]">Jasa Kami</span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-shimmer-silver mt-3 mb-4 tracking-tight">
            Layanan <span className="text-gradient-gray">Profesional</span>
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
                onClick={() => router.push(`/?tab=jasa/${service.slug}`)}
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
          <span className="block text-gray-400 text-xs font-bold uppercase tracking-[0.3em]">Blog & Artikel</span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-shimmer-silver mt-3 mb-4 tracking-tight">
            Informasi <span className="text-gradient-gray">Terbaru</span>
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
      <motion.div
        animate={{ y: [0, -20, 15, 0], x: [0, 15, -10, 0], scale: [1, 1.15, 0.95, 1] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-[10%] right-[15%] w-72 h-72 rounded-full bg-white blur-3xl opacity-[0.04]"
      />
      <FloatingParticles count={3} dark={true} />
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
  onSelect?: (p: Property) => void;
}) {
  const router = useRouter();
  const finTypes = property.financingTypes ?? ["syariah", "kpr"];
  // Get cheapest KPR installment (longest tenor preferred)
  const bestKpr = getCheapestKprInstallment(property);

  const handleClick = () => {
    if (onSelect) {
      onSelect(property);
    } else {
      router.push(`/?tab=proyek/${property.slug}`);
    }
  };

  return (
    <FadeIn className="h-full">
      <Card className="group h-full overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 cursor-pointer" onClick={handleClick}>
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
            <Button onClick={(e) => { e.stopPropagation(); handleClick(); }} size="sm" className="bg-gradient-to-r from-gray-800 to-gray-900 hover:from-gray-900 hover:to-gray-900 text-white shadow-md ">
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

function PropertiesSection() {
  const { properties: PROPERTIES } = usePropertyStore();
  const [showFilter, setShowFilter] = useState(false);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedPrices, setSelectedPrices] = useState<string[]>([]);
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  const [page, setPage] = useState(1);

  // Derive unique locations from data
  const uniqueLocations = [...new Set(PROPERTIES.map((p) => p.location).filter(Boolean))];

  // Reset page when filters change
  const filterKey = `${selectedTypes.join(",")}-${selectedPrices.join(",")}-${selectedLocations.join(",")}`;
  useEffect(() => { setPage(1); }, [filterKey]);

  const toggleCheckbox = (arr: string[], setArr: (v: string[]) => void, val: string) => {
    setArr(arr.includes(val) ? arr.filter((v) => v !== val) : [...arr, val]);
  };

  // Count active filters
  const activeFilterCount = selectedTypes.length + selectedPrices.length + selectedLocations.length;

  const filtered = PROPERTIES.filter((p) => {
    // Tipe filter
    if (selectedTypes.length > 0 && !selectedTypes.includes(p.category)) return false;
    // Harga filter
    if (selectedPrices.includes("termurah") && p.price > 250) return false;
    if (selectedPrices.includes("mid") && (p.price <= 250 || p.price > 500)) return false;
    if (selectedPrices.includes("premium") && p.price <= 500) return false;
    if (selectedPrices.includes("terlaris") && !["Best Seller", "Populer", "Eksklusif"].includes(p.tag)) return false;
    // Lokasi filter
    if (selectedLocations.length > 0 && !selectedLocations.includes(p.location)) return false;
    return true;
  });

  const totalPages = Math.ceil(filtered.length / PROYEK_PER_PAGE);
  const paged = filtered.slice((page - 1) * PROYEK_PER_PAGE, page * PROYEK_PER_PAGE);

  // Checkbox styles
  const cbBase = "w-4 h-4 rounded border-gray-300 text-gray-900 focus:ring-gray-900 focus:ring-offset-0 cursor-pointer transition-colors";
  const cbLabel = "text-sm text-gray-600 cursor-pointer select-none hover:text-gray-900 transition-colors";

  return (
    <section className="py-20 md:py-28 bg-section-gray relative overflow-hidden">
      {/* Ambient floating orb */}
      <motion.div
        animate={{ y: [0, -15, 10, 0], x: [0, 12, -8, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-[10%] right-[-5%] w-[300px] h-[300px] rounded-full bg-gray-200/30 blur-3xl"
      />
      <FloatingParticles count={4} dark={false} />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeIn className="text-center mb-12">
          <span className="block text-gray-400 text-xs font-bold uppercase tracking-[0.3em]">Katalog Properti</span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-shimmer-silver mt-3 mb-4 tracking-tight">
            Pilih Rumah <span className="text-gradient-gray">Idaman</span> Anda
          </h2>
          <p className="text-gray-500 max-w-2xl mx-auto text-lg">
            Tersedia berbagai tipe rumah dengan harga terjangkau dan skema
            pembayaran Syariah & KPR yang fleksibel.
          </p>
        </FadeIn>

        {/* Filter Toggle Button */}
        <FadeIn delay={0.1} className="mb-6">
          <button
            onClick={() => setShowFilter(!showFilter)}
            className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-xl bg-white border border-gray-200 text-sm font-medium text-gray-700 hover:border-gray-300 hover:text-gray-900 hover:shadow-sm transition-all"
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>{showFilter ? "Sembunyikan Filter" : "Tampilkan Filter"}</span>
            {activeFilterCount > 0 && (
              <span className="ml-1 px-2 py-0.5 bg-gray-900 text-white text-xs font-bold rounded-full">
                {activeFilterCount}
              </span>
            )}
          </button>
          {activeFilterCount > 0 && (
            <button
              onClick={() => { setSelectedTypes([]); setSelectedPrices([]); setSelectedLocations([]); }}
              className="ml-3 text-xs text-gray-400 hover:text-gray-600 underline underline-offset-2 transition-colors"
            >
              Reset semua
            </button>
          )}
        </FadeIn>

        {/* Filter Panel */}
        <AnimatePresence>
          {showFilter && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="overflow-hidden mb-10"
            >
              <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-10">
                  {/* Tipe Properti */}
                  <div>
                    <h4 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wider">Tipe Properti</h4>
                    <div className="space-y-3">
                      {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                        <label key={key} className="flex items-center gap-3 group">
                          <input
                            type="checkbox"
                            checked={selectedTypes.includes(key)}
                            onChange={() => toggleCheckbox(selectedTypes, setSelectedTypes, key)}
                            className={cbBase}
                          />
                          <span className={cbLabel}>{label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Harga */}
                  <div>
                    <h4 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wider">Rentang Harga</h4>
                    <div className="space-y-3">
                      {[
                        { key: "termurah", label: "Di bawah Rp 250 Juta" },
                        { key: "mid", label: "Rp 250 Juta – Rp 500 Juta" },
                        { key: "premium", label: "Di atas Rp 500 Juta" },
                        { key: "terlaris", label: "★ Terlaris / Best Seller" },
                      ].map((item) => (
                        <label key={item.key} className="flex items-center gap-3 group">
                          <input
                            type="checkbox"
                            checked={selectedPrices.includes(item.key)}
                            onChange={() => toggleCheckbox(selectedPrices, setSelectedPrices, item.key)}
                            className={cbBase}
                          />
                          <span className={cbLabel}>{item.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Lokasi */}
                  <div>
                    <h4 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wider">Lokasi</h4>
                    <div className="space-y-3 max-h-48 overflow-y-auto pr-2">
                      {uniqueLocations.length > 0 ? uniqueLocations.map((loc) => (
                        <label key={loc} className="flex items-center gap-3 group">
                          <input
                            type="checkbox"
                            checked={selectedLocations.includes(loc)}
                            onChange={() => toggleCheckbox(selectedLocations, setSelectedLocations, loc)}
                            className={cbBase}
                          />
                          <span className={cbLabel}>{loc}</span>
                        </label>
                      )) : (
                        <p className="text-sm text-gray-400 italic">Belum ada data lokasi</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results count */}
        <div className="mb-6 text-sm text-gray-400">
          Menampilkan <span className="font-semibold text-gray-700">{filtered.length}</span> properti
          {activeFilterCount > 0 && (
            <span> dengan <span className="font-semibold text-gray-700">{activeFilterCount}</span> filter aktif</span>
          )}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {paged.map((property) => (
            <PropertyCard
              key={property.id}
              property={property}
            />
          ))}
          {paged.length === 0 && (
            <div className="col-span-full text-center py-20">
              <Home className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 font-medium">Tidak ada properti yang cocok dengan filter.</p>
              <button
                onClick={() => { setSelectedTypes([]); setSelectedPrices([]); setSelectedLocations([]); }}
                className="mt-3 text-sm text-gray-900 underline underline-offset-2 hover:text-gray-600 transition-colors"
              >
                Reset filter
              </button>
            </div>
          )}
        </div>

        <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />

        {/* Cicilan Simulation Calculator */}
        <CicilanCalculator />
      </div>
    </section>
  );
}

/* ─────────────────────── CICILAN CALCULATOR ─────────────────────── */

function CicilanCalculator() {
  const { settings: S } = useSettingsStore();
  const [hargaProperti, setHargaProperti] = useState<string>("300");
  const [dpPercent, setDpPercent] = useState<string>("0");
  const [tenor, setTenor] = useState<string>("20");
  const [bungaPercent, setBungaPercent] = useState<string>("7");

  const harga = parseFloat(hargaProperti) * 1_000_000; // convert juta to exact
  const dp = harga * (parseFloat(dpPercent) / 100);
  const pinjaman = harga - dp;
  const tahun = parseInt(tenor);
  const bulan = tahun * 12;
  const bunga = parseFloat(bungaPercent) / 100 / 12; // monthly rate

  // Fixed installment (anuitas)
  const cicilanBulanan = bulan > 0 && bunga > 0
    ? pinjaman * (bunga * Math.pow(1 + bunga, bulan)) / (Math.pow(1 + bunga, bulan) - 1)
    : bulan > 0 ? pinjaman / bulan : 0;

  const totalBayar = cicilanBulanan * bulan;
  const totalBunga = totalBayar - pinjaman;

  const fmtRp = (n: number) =>
    new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.6 }}
      className="mt-20 bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden"
    >
      {/* Header */}
      <div className="bg-gray-900 px-6 py-5 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
          <Calculator className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="text-white font-bold text-lg">Simulasi Cicilan</h3>
          <p className="text-gray-400 text-xs">Hitung estimasi cicilan bulanan KPR Anda</p>
        </div>
      </div>

      <div className="p-6 md:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Inputs */}
          <div className="space-y-5">
            {/* Harga Properti */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Harga Properti</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400 font-medium">Rp</span>
                <input
                  type="number"
                  value={hargaProperti}
                  onChange={(e) => setHargaProperti(e.target.value)}
                  className="w-full pl-10 pr-14 py-3 rounded-xl border border-gray-200 text-gray-900 font-semibold focus:ring-2 focus:ring-gray-900 focus:border-gray-900 outline-none transition-all"
                  min="50"
                  step="10"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">Juta</span>
              </div>
            </div>

            {/* DP */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Uang Muka (DP)</label>
              <div className="relative">
                <input
                  type="range"
                  min="0"                  max="50"
                  step="5"
                  value={dpPercent}
                  onChange={(e) => setDpPercent(e.target.value)}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-gray-900"
                />
                <span className="absolute right-0 top-1 text-sm font-bold text-gray-900">{dpPercent}%</span>
              </div>
              <p className="text-xs text-gray-400 mt-1">DP: {fmtRp(dp)}</p>
            </div>

            {/* Tenor */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Jangka Waktu (Tenor)</label>
              <div className="grid grid-cols-4 gap-2">
                {[5, 10, 15, 20, 25, 30].map((t) => (
                  <button
                    key={t}
                    onClick={() => setTenor(String(t))}
                    className={`py-2.5 rounded-lg text-sm font-medium transition-all ${
                      tenor === String(t)
                        ? "bg-gray-900 text-white shadow-md"
                        : "bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-700"
                    }`}
                  >
                    {t} Thn
                  </button>
                ))}
              </div>
            </div>

            {/* Bunga */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Suku Bunga KPR</label>
              <div className="relative">
                <input
                  type="range"
                  min="5"
                  max="12"
                  step="0.5"
                  value={bungaPercent}
                  onChange={(e) => setBungaPercent(e.target.value)}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-gray-900"
                />
                <span className="absolute right-0 top-1 text-sm font-bold text-gray-900">{bungaPercent}% p.a.</span>
              </div>
            </div>
          </div>

          {/* Results */}
          <div className="bg-gray-50 rounded-xl p-6 flex flex-col justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1">Estimasi Cicilan Bulanan</p>
              <p className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight">
                {fmtRp(cicilanBulanan)}<span className="text-base font-medium text-gray-400">/bln</span>
              </p>
            </div>

            <div className="mt-8 space-y-3">
              <div className="flex items-center justify-between py-2 border-b border-gray-200">
                <span className="text-sm text-gray-500">Harga Properti</span>
                <span className="text-sm font-semibold text-gray-700">{fmtRp(harga)}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-gray-200">
                <span className="text-sm text-gray-500">Uang Muka ({dpPercent}%)</span>
                <span className="text-sm font-semibold text-gray-700">{fmtRp(dp)}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-gray-200">
                <span className="text-sm text-gray-500">Jumlah Pinjaman</span>
                <span className="text-sm font-semibold text-gray-700">{fmtRp(pinjaman)}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-gray-200">
                <span className="text-sm text-gray-500">Total Bunga ({tenor} thn)</span>
                <span className="text-sm font-semibold text-gray-600">{fmtRp(totalBunga)}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-gray-200">
                <span className="text-sm text-gray-500">Total Pembayaran</span>
                <span className="text-sm font-bold text-gray-900">{fmtRp(totalBayar)}</span>
              </div>
            </div>

            <a
              href={`https://wa.me/${S.contact_wa}?text=${encodeURIComponent(
                `Halo, saya tertarik dengan simulasi KPR.\n\nHarga: ${fmtRp(harga)}\nDP: ${dpPercent}% (${fmtRp(dp)})\nTenor: ${tenor} tahun\nCicilan: ${fmtRp(cicilanBulanan)}/bln\n\nMohon info lebih lanjut.`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 w-full py-3.5 bg-gray-900 hover:bg-gray-800 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all hover:shadow-lg"
            >
              <MessageCircle className="w-4 h-4" />
              Konsultasi via WhatsApp
            </a>
          </div>
        </div>
      </div>
    </motion.div>
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
        className="relative aspect-square overflow-hidden rounded-t-2xl cursor-pointer group"
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
        <div className="flex gap-2 p-3 bg-gray-50 overflow-x-auto rounded-b-2xl border border-t-0 border-gray-200">
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

function PropertyDetailPage({ slug }: { slug: string }) {
  const { properties: PROPERTIES } = usePropertyStore();
  const { settings: S } = useSettingsStore();
  const property = PROPERTIES.find((p) => p.slug === slug);
  const router = useRouter();

  if (!property) {
    return (
      <>
        <Navbar activeTab="proyek" />
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="text-center">
            <Home className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">Properti Tidak Ditemukan</h2>
            <p className="text-gray-500 mb-6">Properti yang Anda cari tidak tersedia atau sudah dihapus.</p>
            <button
              onClick={() => router.push("/?tab=proyek")}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 text-white font-bold rounded-xl hover:bg-gray-800 transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              Kembali ke Proyek
            </button>
          </div>
        </div>
        <Footer />
        <Chatbot />
      </>
    );
  }

  const images = property.gallery || [property.image].filter(Boolean);
  const formatRp = (n: number) =>
    new Intl.NumberFormat("id-ID").format(Math.round(n));

  return (
    <>
      <Navbar activeTab="proyek" />
      <article className="bg-white pt-20 md:pt-24">
        {/* Hero gallery - constrained to content width */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <PropertyGallery
            images={images}
            name={property.name}
            tag={property.tag}
            location={property.location}
          />
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-gray-400 mb-8">
            <button onClick={() => router.push("/?tab=proyek")} className="hover:text-gray-700 transition-colors">Proyek</button>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-gray-700 font-medium truncate max-w-xs">{property.name}</span>
          </nav>

          {/* Title & Badges */}
          <div className="flex flex-col md:flex-row md:items-start gap-4 mb-8">
            <div className="flex-1">
              <h1 className="text-2xl md:text-3xl font-black text-gray-900 mb-2">{property.name}</h1>
              <p className="text-gray-500 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 shrink-0" />
                {property.location}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary" className="bg-gray-100 text-gray-600 text-xs font-semibold">
                {CATEGORY_LABELS[property.category as PropertyCategory] || property.category}
              </Badge>
              {property.category !== "kavling" && (
                <Badge variant="secondary" className="bg-gray-100 text-gray-600 text-xs">
                  {property.type}
                </Badge>
              )}
              {(property.financingTypes ?? []).includes("syariah") && (
                <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-gray-100 text-gray-600">Syariah</span>
              )}
              {(property.financingTypes ?? []).includes("kpr") && (
                <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-gray-200 text-gray-700">KPR Bank</span>
              )}
            </div>
          </div>

          {/* Price & Type */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
            <div className="bg-gray-50 rounded-2xl p-6 text-center border border-gray-100">
              <p className="text-xs text-gray-400 uppercase tracking-wider mb-2 font-semibold">{property.category === "kavling" ? "Harga Tanah" : "Harga Rumah"}</p>
              <p className="text-2xl font-black text-gray-900">Rp {new Intl.NumberFormat("id-ID").format(property.price)} Juta</p>
            </div>
            {property.category === "kavling" ? (
              <div className="bg-gray-50 rounded-2xl p-6 text-center border border-gray-100">
                <p className="text-xs text-gray-400 uppercase tracking-wider mb-2 font-semibold">Luas Tanah</p>
                <p className="text-2xl font-black text-gray-900">{property.landArea} m²</p>
                {property.landArea > 0 && (
                  <p className="text-xs text-gray-400 mt-1">
                    Rp {new Intl.NumberFormat("id-ID").format(Math.round(property.price / property.landArea * 10) / 10)} Juta/m²
                  </p>
                )}
              </div>
            ) : (
              <div className="bg-gray-50 rounded-2xl p-6 text-center border border-gray-100">
                <p className="text-xs text-gray-400 uppercase tracking-wider mb-2 font-semibold">Tipe Bangunan</p>
                <p className="text-2xl font-black text-gray-900">{property.type}</p>
                <p className="text-xs text-gray-400 mt-1">LB {property.buildingArea} m² / LT {property.landArea} m²</p>
              </div>
            )}
          </div>

          {/* Spec Grid */}
          {property.category !== "kavling" && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl border border-gray-100">
                <Building2 className="w-5 h-5 text-gray-400 shrink-0" />
                <div>
                  <p className="text-[10px] text-gray-400 uppercase tracking-wider">Luas Bangun</p>
                  <p className="font-bold text-sm text-gray-900">{property.buildingArea} m²</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl border border-gray-100">
                <LandPlot className="w-5 h-5 text-gray-400 shrink-0" />
                <div>
                  <p className="text-[10px] text-gray-400 uppercase tracking-wider">Luas Tanah</p>
                  <p className="font-bold text-sm text-gray-900">{property.landArea} m²</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl border border-gray-100">
                <Home className="w-5 h-5 text-gray-400 shrink-0" />
                <div>
                  <p className="text-[10px] text-gray-400 uppercase tracking-wider">Kamar Tidur</p>
                  <p className="font-bold text-sm text-gray-900">{property.bedrooms}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl border border-gray-100">
                <Users className="w-5 h-5 text-gray-400 shrink-0" />
                <div>
                  <p className="text-[10px] text-gray-400 uppercase tracking-wider">Kamar Mandi</p>
                  <p className="font-bold text-sm text-gray-900">{property.bathrooms}</p>
                </div>
              </div>
            </div>
          )}

          {/* Description */}
          {property.description && (
            <div className="mb-8">
              <h2 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                <FileText className="w-4 h-4 text-gray-400" />
                Deskripsi
              </h2>
              <p className="text-gray-600 leading-relaxed">{property.description}</p>
            </div>
          )}

          {/* Video */}
          {(() => {
            const embedUrl = getYoutubeEmbedUrl(property.videoUrl || "");
            if (!embedUrl) return null;
            return (
              <div className="mb-8">
                <h2 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <Camera className="w-4 h-4 text-gray-400" />
                  Video Proyek
                </h2>
                <p className="text-sm text-gray-500 mb-4">Simak video dokumentasi dan review proyek {property.name}.</p>
                <div className="relative w-full overflow-hidden rounded-2xl" style={{ paddingBottom: "56.25%" }}>
                  <iframe
                    src={embedUrl}
                    title={property.name}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                    className="absolute inset-0 w-full h-full rounded-2xl"
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
              <div className="mb-8">
                <h2 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-gray-400" />
                  Fitur Unggulan
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {featList.map((f) => (
                    <div key={f} className="flex items-center gap-2.5 px-4 py-3 bg-gray-50 text-gray-700 rounded-xl text-sm border border-gray-100">
                      <CheckCircle2 className="w-4 h-4 text-gray-500 shrink-0" />
                      {f}
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}

          {/* Simulasi Cicilan */}
          <DetailSimulasiCicilan property={property} />

          {/* WhatsApp CTA */}
          <div className="mt-10 bg-gray-950 rounded-2xl p-6 md:p-8 text-center">
            <h3 className="text-lg md:text-xl font-bold text-white mb-2">Tertarik dengan {property.name}?</h3>
            <p className="text-gray-400 text-sm mb-6">Hubungi tim marketing kami untuk info lebih lanjut dan jadwal survey lokasi.</p>
            <a
              href={`https://wa.me/${S.contact_wa}?text=${encodeURIComponent(`Halo, saya tertarik dengan properti *${property.name}* (${property.type}) di ${property.location}. Mohon info lebih lanjut.`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2.5 px-8 py-3.5 bg-white text-gray-900 font-bold rounded-xl hover:bg-gray-100 transition-all shadow-lg"
            >
              <MessageCircle className="w-5 h-5" />
              Tanya via WhatsApp
            </a>
          </div>
        </div>
      </article>
      <Footer />
      <Chatbot />
    </>
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
    <section id="simulasi" className="py-20 md:py-28 bg-section-gray relative overflow-hidden">
      {/* Ambient floating orb */}
      <motion.div
        animate={{ y: [0, -15, 10, 0], x: [0, 12, -8, 0] }}
        transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-[10%] right-[-5%] w-[300px] h-[300px] rounded-full bg-gray-200/30 blur-3xl"
      />
      <FloatingParticles count={3} dark={false} />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeIn className="text-center mb-8">
          <span className="block text-gray-400 text-xs font-bold uppercase tracking-[0.3em]">Simulasi Cicilan</span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-shimmer-silver mt-3 mb-4 tracking-tight">
            Hitung <span className="text-gradient-gray">Cicilan</span> Anda
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
      {/* Ambient floating orb */}
      <motion.div
        animate={{ y: [0, -15, 10, 0], x: [0, 12, -8, 0] }}
        transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-[15%] right-[-5%] w-[300px] h-[300px] rounded-full bg-gray-100/50 blur-3xl"
      />
      <FloatingParticles count={3} dark={false} />

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeIn className="text-center mb-14">
          <span className="block text-gray-400 text-xs font-bold uppercase tracking-[0.3em]">Lokasi Strategis</span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-shimmer-silver mt-3 mb-4 tracking-tight">
            Berlokasi di <span className="text-gradient-gray">Berbagai Kota Strategis</span>
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

  const contactItems = [
    {
      icon: Phone,
      label: "Telepon",
      value: S.contact_phone,
      href: `tel:${S.contact_phone.replace(/-/g, "")}`,
      color: "bg-gray-900",
    },
    {
      icon: MessageCircle,
      label: "WhatsApp",
      value: S.contact_wa ? `+${S.contact_wa.replace(/^(\d{2})(\d{3})(\d{4})(\d{4})$/, "$1 $2-$3-$4")}` : "-",
      href: `https://wa.me/${S.contact_wa}`,
      color: "bg-gray-800",
    },
    {
      icon: Mail,
      label: "Email",
      value: S.contact_email,
      href: `mailto:${S.contact_email}`,
      color: "bg-gray-700",
    },
    {
      icon: MapPin,
      label: "Alamat",
      value: S.contact_address,
      href: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(S.contact_address)}`,
      color: "bg-gray-600",
    },
    {
      icon: User,
      label: "Contact Person",
      value: S.contact_person,
      href: `https://wa.me/${S.contact_wa}?text=Halo, saya ingin bicara dengan ${S.contact_person}`,
      color: "bg-gray-500",
    },
  ];

  const socials = [
    { icon: Instagram, label: "Instagram", value: S.social_instagram, href: `https://instagram.com/${S.social_instagram}`, color: "from-purple-500 to-pink-500" },
    { icon: Globe, label: "Facebook", value: S.social_facebook, href: `https://facebook.com/${S.social_facebook}`, color: "from-blue-600 to-blue-500" },
    { icon: Youtube, label: "YouTube", value: S.social_youtube, href: `https://youtube.com/@${S.social_youtube}`, color: "from-red-600 to-red-500" },
    { icon: Music, label: "TikTok", value: S.social_tiktok, href: `https://tiktok.com/@${S.social_tiktok}`, color: "from-gray-900 to-gray-700" },
  ].filter((s) => s.value);

  return (
    <section className="py-20 md:py-28 bg-section-gray relative overflow-hidden">
      {/* Ambient floating orb */}
      <motion.div
        animate={{ y: [0, -15, 10, 0], x: [0, 12, -8, 0] }}
        transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-[10%] left-[-5%] w-[350px] h-[350px] rounded-full bg-gray-200/30 blur-3xl"
      />
      <FloatingParticles count={3} dark={false} />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Heading */}
        <FadeIn className="text-center mb-14">
          <span className="block text-gray-400 text-xs font-bold uppercase tracking-[0.3em]">Hubungi Kami</span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-shimmer-silver mt-3 mb-4 tracking-tight">
            Tim Marketing Kami Siap <span className="text-gradient-gray">Melayani</span> Anda
          </h2>
          <p className="text-gray-500 max-w-xl mx-auto text-lg">
            Jangan ragu untuk menghubungi kami melalui berbagai channel di bawah ini.
          </p>
        </FadeIn>

        {/* Two-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-10">
          {/* ── Left Column: Contact Info ── */}
          <FadeIn delay={0.05} className="lg:col-span-2 space-y-6">
            {/* Contact Cards */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-1">
              <h3 className="text-lg font-bold text-gray-900 mb-5">Informasi Kontak</h3>
              {contactItems.map((item, idx) => (
                <a
                  key={idx}
                  href={item.href}
                  target={item.href.startsWith("http") ? "_blank" : undefined}
                  rel={item.href.startsWith("http") ? "noopener noreferrer" : undefined}
                  className="flex items-start gap-4 p-3 -mx-3 rounded-xl hover:bg-gray-50 transition-colors group"
                >
                  <div className={`w-10 h-10 ${item.color} rounded-xl flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform shadow-sm`}>
                    <item.icon className="w-[18px] h-[18px] text-white" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">{item.label}</p>
                    <p className="text-sm font-medium text-gray-800 mt-0.5 break-words">{item.value}</p>
                  </div>
                </a>
              ))}
            </div>

            {/* Social Media */}
            {socials.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-5">Media Sosial</h3>
                <div className="grid grid-cols-2 gap-3">
                  {socials.map((s, idx) => (
                    <a
                      key={idx}
                      href={s.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all group"
                    >
                      <div className={`w-9 h-9 bg-gradient-to-br ${s.color} rounded-lg flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform shadow-sm`}>
                        <s.icon className="w-4 h-4 text-white" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-gray-900">{s.label}</p>
                        <p className="text-[11px] text-gray-400 truncate">@{s.value}</p>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* WhatsApp CTA */}
            <a
              href={`https://wa.me/${S.contact_wa}?text=Halo, saya tertarik dengan properti ${S.company_name}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-3 w-full py-4 bg-gray-900 text-white font-bold rounded-2xl hover:bg-gray-800 transition-all active:scale-[0.98] shadow-lg hover:shadow-xl group"
            >
              <div className="relative">
                <MessageCircle className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-green-400 rounded-full animate-pulse" />
              </div>
              Chat via WhatsApp Sekarang
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </a>
          </FadeIn>

          {/* ── Right Column: Contact Form ── */}
          <FadeIn delay={0.15} className="lg:col-span-3">
            <Card className="border-0 shadow-xl h-full">
              <CardContent className="p-6 md:p-8">
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-10 h-10 bg-gray-900 rounded-xl flex items-center justify-center shadow-md">
                    <Send className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">Kirim Pesan</h3>
                    <p className="text-xs text-gray-400">Pesan otomatis dikirim ke WhatsApp kami</p>
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
                      className="flex items-center gap-2 p-3 bg-gray-50 border border-gray-200 rounded-xl"
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
        </div>

        {/* Map - Full Width */}
        <FadeIn delay={0.25} className="mt-12">
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
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [page, setPage] = useState(1);

  useEffect(() => { fetchGalleryItems(); }, [fetchGalleryItems]);

  // Separate items into foto and video
  const photos = galleryItems.filter((item) => !!item.image);
  const videos = galleryItems.filter((item) => !!item.videoUrl);

  const currentItems = activeTab === "foto" ? photos : videos;
  const totalPages = Math.ceil(currentItems.length / GALLERY_PER_PAGE);
  const paged = currentItems.slice((page - 1) * GALLERY_PER_PAGE, page * GALLERY_PER_PAGE);

  if (galleryLoading) {
    return (
      <section className="py-20 md:py-28 bg-section-gray">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn className="text-center mb-12">
            <span className="block text-gray-400 text-xs font-bold uppercase tracking-[0.3em]">Gallery</span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-shimmer-silver mt-3 mb-4 tracking-tight">
              Dokumentasi <span className="text-gradient-gray">Proyek</span> Kami
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
    <section className="py-20 md:py-28 bg-section-gray relative overflow-hidden">
      {/* Ambient floating orb */}
      <motion.div
        animate={{ y: [0, -15, 10, 0], x: [0, 12, -8, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-[10%] right-[-5%] w-[300px] h-[300px] rounded-full bg-gray-200/30 blur-3xl"
      />
      <FloatingParticles count={3} dark={false} />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeIn className="text-center mb-12">
          <span className="block text-gray-400 text-xs font-bold uppercase tracking-[0.3em]">Gallery</span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-shimmer-silver mt-3 mb-4 tracking-tight">
            Dokumentasi <span className="text-gradient-gray">Proyek</span> Kami
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
                <span className="text-[10px] bg-gray-200 text-gray-600 px-1.5 py-0.5 rounded-full">{photos.length}</span>
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
                <span className="text-[10px] bg-gray-200 text-gray-600 px-1.5 py-0.5 rounded-full">{videos.length}</span>
              </span>
            </button>
          </div>
        </FadeIn>



        {/* Foto Tab Content - Masonry Grid */}
        {activeTab === "foto" && (
          <>
            {paged.length === 0 ? (
              <div className="text-center py-16">
                <Camera className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-400 text-lg">Belum ada foto.</p>
              </div>
            ) : (
              <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-2">
                {paged.map((img, i) => (
                  <FadeIn key={`${img.id}-${page}`} delay={i * 0.04}>
                    <div className="break-inside-avoid mb-2 cursor-pointer group" onClick={() => { setLightboxIndex((page - 1) * GALLERY_PER_PAGE + i); setLightboxOpen(true); }}>
                      <div className="relative rounded-lg overflow-hidden bg-gray-100">
                        <img
                          src={img.image}
                          alt={img.title}
                          className="w-full h-auto object-cover group-hover:scale-[1.03] transition-transform duration-500"
                        />
                        {/* Hover overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/0 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                          <h3 className="text-white font-bold text-sm leading-tight line-clamp-2">{img.title}</h3>
                          {img.description && (
                            <p className="text-white/70 text-xs line-clamp-1 mt-0.5">{img.description}</p>
                          )}
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
                  images={photos.map((img) => img.image)}
                  activeIndex={lightboxIndex}
                  onClose={() => setLightboxOpen(false)}
                />
              )}
            </AnimatePresence>
          </>
        )}

        {/* Video Tab Content - Masonry Grid */}
        {activeTab === "video" && (
          <>
            {paged.length === 0 ? (
              <div className="text-center py-16">
                <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
                <p className="text-gray-400 text-lg">Belum ada video.</p>
              </div>
            ) : (
              <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-2">
                {paged.map((item, i) => {
                  const embedUrl = getYoutubeEmbedUrl(item.videoUrl);
                  return (
                    <FadeIn key={`${item.id}-${page}`} delay={i * 0.04}>
                      <div className="break-inside-avoid mb-2 group">
                        <div className="relative rounded-lg overflow-hidden bg-gray-100">
                          <div className="relative aspect-video">
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
                          <div className="px-3 py-2 bg-white">
                            <h3 className="font-bold text-gray-900 text-sm leading-tight line-clamp-1">{item.title}</h3>
                            {item.description && (
                              <p className="text-xs text-gray-500 line-clamp-1 mt-0.5">{item.description}</p>
                            )}
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

/* ─────────────────────────── TENTANG KAMI PAGE (Redesigned) ─────────────────────────── */

function TentangKamiPage() {
  const { galleryItems, fetchGalleryItems } = useGalleryStore();
  const { bankItems, loading: bankLoading, fetchBankItems } = useBankStore();
  const { settings: S } = useSettingsStore();
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  useEffect(() => { fetchGalleryItems(); }, [fetchGalleryItems]);
  useEffect(() => { fetchBankItems(); }, [fetchBankItems]);
  const homeGalleryItems = galleryItems.slice(0, 8);

  return (
    <>
      {/* Banner */}
      <PageBanner title="Tentang Kami" subtitle={`Mengenal lebih dekat ${S.company_name}`} />

      {/* ═══════ PROFIL PERUSAHAAN — Redesigned: Text left, image right, diagonal bg ═══════ */}
      <section className="py-24 md:py-32 bg-white relative overflow-hidden">
        {/* Diagonal subtle lines background */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: `repeating-linear-gradient(135deg, #000 0px, #000 1px, transparent 1px, transparent 40px)`,
        }} />
        <ConstellationParticles count={8} dark={false} />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Text — now on LEFT */}
            <FadeIn direction="right">
              <span className="inline-block px-3 py-1 bg-gray-100 text-gray-500 text-[10px] font-bold uppercase tracking-[0.25em] rounded-full mb-5">Profil Perusahaan</span>
              <h2 className="text-3xl md:text-4xl lg:text-[2.75rem] font-black text-gray-900 mt-2 mb-6 tracking-tight leading-[1.15]">
                Platform Perumahan <span className="bg-gradient-to-r from-gray-800 to-gray-500 bg-clip-text text-transparent">Terpercaya</span> di Indonesia
              </h2>
              <div className="space-y-4">
                <p className="text-gray-600 text-lg leading-relaxed">
                  {S.company_name} adalah platform perumahan yang menghimpun developer-developer perumahan terpilih di bawah naungan {S.company_legal_name}. Kami berperan sebagai jembatan antara pengembang properti berkualitas dan calon pembeli rumah yang mencari hunian terbaik.
                </p>
                <p className="text-gray-600 text-lg leading-relaxed">
                  Setiap mitra developer yang bergabung telah melalui proses kurasi ketat — dari legalitas, kualitas bangunan, hingga track record. Tujuan kami: memudahkan Anda menemukan rumah idaman dengan pilihan terluas dari developer terpercaya.
                </p>
                <p className="text-gray-600 text-lg leading-relaxed">
                  Dengan skema pembayaran fleksibel mulai dari Syariah hingga KPR Bank, {S.company_name} memastikan setiap keluarga Indonesia punya akses ke hunian berkualitas.
                </p>
              </div>
            </FadeIn>
            {/* Image — now on RIGHT with offset frame */}
            <FadeIn direction="left">
              <div className="relative">
                {/* Offset decorative frame */}
                <div className="absolute -top-4 -right-4 w-full h-full border-2 border-gray-200 rounded-2xl" />
                <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                  {S.tentangkami_image ? (
                    <img
                      src={S.tentangkami_image}
                      alt={S.company_name}
                      className="w-full h-[420px] object-cover"
                    />
                  ) : (
                    <div className="w-full h-[420px] bg-gradient-to-br from-gray-800 via-gray-900 to-black flex items-center justify-center">
                      <Building2 className="w-16 h-16 text-gray-600" />
                    </div>
                  )}
                </div>
                {/* Company name badge */}
                <div className="absolute -bottom-5 -left-5 bg-gray-900 text-white px-6 py-3 rounded-xl shadow-xl">
                  <p className="font-bold text-sm">{S.company_legal_name}</p>
                </div>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ═══════ VISI & MISI — Redesigned: Visi hero statement, Misi below ═══════ */}
      <section className="py-24 md:py-32 bg-gradient-to-b from-gray-50 to-white relative overflow-hidden">
        <ConstellationParticles count={6} dark={false} />
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn className="text-center mb-14">
            <span className="inline-block px-3 py-1 bg-gray-100 text-gray-500 text-[10px] font-bold uppercase tracking-[0.25em] rounded-full mb-4">Visi &amp; Misi</span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-gray-900 tracking-tight">
              Arah &amp; <span className="bg-gradient-to-r from-gray-800 to-gray-500 bg-clip-text text-transparent">Tujuan</span> Kami
            </h2>
          </FadeIn>

          {/* VISI — full-width featured statement */}
          <FadeIn className="mb-10">
            <div className="relative bg-gray-900 rounded-3xl p-10 md:p-14 text-center overflow-hidden">
              {/* Decorative corner elements */}
              <div className="absolute top-6 left-6 w-12 h-12 border-t-2 border-l-2 border-white/20 rounded-tl-lg" />
              <div className="absolute bottom-6 right-6 w-12 h-12 border-b-2 border-r-2 border-white/20 rounded-br-lg" />
              <div className="absolute top-4 right-8">
                <Eye className="w-10 h-10 text-white/10" />
              </div>
              <div className="relative">
                <p className="text-gray-400 text-xs font-bold uppercase tracking-[0.3em] mb-5">Visi Kami</p>
                <blockquote className="text-white text-xl md:text-2xl lg:text-3xl font-bold leading-relaxed max-w-3xl mx-auto">
                  &ldquo;Menjadi platform perumahan terdepan di Indonesia yang menyatukan developer terbaik dan memberikan hunian berkualitas, terjangkau, serta penuh keberkahan bagi seluruh keluarga Indonesia.&rdquo;
                </blockquote>
              </div>
            </div>
          </FadeIn>

          {/* MISI — grid of 5 items */}
          <FadeIn delay={0.1}>
            <div className="bg-white border border-gray-200 rounded-2xl p-8 md:p-10 shadow-sm">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 bg-gray-900 rounded-xl flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-xl font-extrabold text-gray-900">Misi Kami</h3>
              </div>
              <div className="grid sm:grid-cols-2 gap-x-8 gap-y-5">
                {[
                  "Mengkurasi developer perumahan berkualitas dan berintegritas tinggi",
                  "Menyediakan pilihan hunian terluas dari berbagai mitra developer",
                  "Menjamin transparansi harga, legalitas, dan kualitas setiap properti",
                  "Memberikan pendampingan penuh dari konsultasi hingga serah terima kunci",
                  "Menghadirkan skema pembayaran Syariah & KPR yang mudah dan aman",
                ].map((misi, i) => (
                  <FadeIn key={i} delay={0.05 * i}>
                    <div className="flex items-start gap-3 group">
                      <span className="shrink-0 w-7 h-7 bg-gray-100 group-hover:bg-gray-900 group-hover:text-white text-gray-500 rounded-lg flex items-center justify-center font-bold text-xs transition-colors mt-0.5">
                        {i + 1}
                      </span>
                      <p className="text-gray-700 text-sm leading-relaxed pt-1">{misi}</p>
                    </div>
                  </FadeIn>
                ))}
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ═══════ NILAI PERUSAHAAN — Redesigned: Bento grid layout ═══════ */}
      <section className="py-24 md:py-32 bg-white relative overflow-hidden">
        {/* Subtle grid background */}
        <div className="absolute inset-0 opacity-[0.025]" style={{
          backgroundImage: `radial-gradient(circle, #000 1px, transparent 1px)`,
          backgroundSize: "24px 24px",
        }} />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn className="text-center mb-16">
            <span className="inline-block px-3 py-1 bg-gray-100 text-gray-500 text-[10px] font-bold uppercase tracking-[0.25em] rounded-full mb-4">Nilai-Nilai Kami</span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-gray-900 tracking-tight">
              Prinsip yang <span className="bg-gradient-to-r from-gray-800 to-gray-500 bg-clip-text text-transparent">Kami Pegang</span>
            </h2>
            <p className="text-gray-500 max-w-2xl mx-auto text-lg mt-4">
              Setiap keputusan yang kami ambil berlandaskan pada nilai-nilai inti yang memastikan kepercayaan dan kenyamanan Anda.
            </p>
          </FadeIn>

          {/* Bento grid: first item large, rest smaller */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Featured large card — spans 2 cols */}
            <FadeIn className="md:col-span-2 lg:col-span-2">
              <Card className="h-full border border-gray-100 hover:border-gray-200 transition-all duration-300 hover:shadow-lg overflow-hidden group">
                <CardContent className="p-8">
                  <div className="flex items-start gap-6">
                    <div className="w-16 h-16 bg-gray-900 rounded-2xl flex items-center justify-center shrink-0 shadow-lg group-hover:scale-110 transition-transform">
                      <Shield className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">Profesional</h3>
                      <p className="text-gray-500 leading-relaxed">Tim berpengalaman dengan standar layanan tertinggi. Setiap proses dijalankan secara sistematis dan terstruktur untuk memberikan hasil terbaik bagi setiap klien.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </FadeIn>

            {/* Smaller value cards */}
            {[
              { icon: Eye, title: "Transparan", desc: "Harga jelas, legalitas terbuka, progres proyek bisa dipantau. Tidak ada biaya tersembunyi." },
              { icon: CheckCircle2, title: "Terpercaya", desc: "Setiap mitra developer telah melalui proses verifikasi ketat. Reputasi adalah fondasi bisnis kami." },
              { icon: HeartHandshake, title: "Kolaboratif", desc: "Sinergi antara platform, developer, dan pembeli. Semua pihak mendapatkan manfaat." },
              { icon: Sparkles, title: "Inovatif", desc: "Terus beradaptasi dengan teknologi dan tren properti terbaru untuk pengalaman yang lebih baik." },
              { icon: Users, title: "Berorientasi Keluarga", desc: "Setiap rumah yang kami tawarkan dirancang untuk kenyamanan dan kebahagiaan keluarga." },
            ].map((val, i) => {
              const Icon = val.icon;
              return (
                <FadeIn key={val.title} delay={0.06 * i}>
                  <Card className="h-full border border-gray-100 hover:border-gray-200 transition-all duration-300 hover:shadow-lg group">
                    <CardContent className="p-6">
                      <div className="w-12 h-12 bg-gray-100 group-hover:bg-gray-900 rounded-xl flex items-center justify-center mb-4 transition-colors">
                        <Icon className="w-6 h-6 text-gray-600 group-hover:text-white transition-colors" />
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

      {/* ═══════ TIMELINE — Redesigned: Horizontal scroll ═══════ */}
      <section className="py-24 md:py-32 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 relative overflow-hidden">
        <ConstellationParticles count={12} dark={true} />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn className="text-center mb-14">
            <span className="block text-gray-500 text-[10px] font-bold uppercase tracking-[0.3em]">Perjalanan Kami</span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-white mt-3 mb-4">
              Milestone Bisnis
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto text-lg">
              Dari satu proyek menjadi platform perumahan yang menghimpun puluhan mitra developer.
            </p>
          </FadeIn>

          {/* Stats row — redesigned with border-top accent */}
          <FadeIn>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
              {[
                { value: `${S.total_units_sold}+`, label: "Unit Terjual", icon: Home },
                { value: "3+", label: "Mitra Developer", icon: Building2 },
                { value: "10+", label: "Proyek Perumahan", icon: LandPlot },
                { value: "98%", label: "Kepuasan Klien", icon: ThumbsUp },
              ].map((stat, i) => {
                const Icon = stat.icon;
                return (
                  <FadeIn key={stat.label} delay={i * 0.08}>
                    <div className="text-center relative group">
                      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-white/30 group-hover:w-12 group-hover:bg-white/60 transition-all" />
                      <Icon className="w-5 h-5 text-gray-500 mx-auto mb-3 mt-4" />
                      <p className="text-3xl md:text-4xl font-extrabold text-white">{stat.value}</p>
                      <p className="text-gray-500 text-xs mt-1 uppercase tracking-wider">{stat.label}</p>
                    </div>
                  </FadeIn>
                );
              })}
            </div>
          </FadeIn>

          {/* Horizontal timeline — scrollable */}
          <FadeIn>
            <div className="relative overflow-x-auto pb-4 -mx-4 px-4">
              <div className="flex gap-0 min-w-max">
                {[
                  { year: "2018", title: "Awal Mula", desc: `${S.company_legal_name} didirikan. Memulai proyek perumahan pertama dengan fokus hunian syariah.` },
                  { year: "2020", title: "Ekspansi Proyek", desc: "Membuka proyek kedua di kawasan Sentul. Memperluas portofolio dengan klaster baru dan konsep modern." },
                  { year: "2022", title: "Mitra Pertama Bergabung", desc: `Developer mitra pertama resmi bergabung. ${S.company_name} mulai bertransformasi dari single developer menjadi platform.` },
                  { year: "2023", title: `${S.total_units_sold} Unit Terjual`, desc: `Milestone ${S.total_units_sold} unit rumah terjual dari seluruh mitra developer. Platform terus berkembang.` },
                  { year: "2024", title: "Digital Platform Launch", desc: "Peluncuran platform digital untuk memudahkan calon pembeli menemukan dan membandingkan proyek dari berbagai mitra." },
                  { year: "2025", title: "Skalabilitas & Ekosistem", desc: "Memperkuat ekosistem mitra developer dan meluncurkan layanan jasa konstruksi terintegrasi. Basis klien terus meluas ke berbagai kota." },
                  { year: "2026", title: "Era Baru Hunian Digital", desc: `Memasuki fase baru dengan puluhan proyek aktif dan 3+ mitra developer terpilih. Platform ${S.company_name} kini menjadi destinasi utama pencari hunian syariah di Indonesia.`, highlight: true },
                ].map((item, i) => (
                  <div key={item.year} className="relative flex flex-col items-center w-52 shrink-0 group">
                    {/* Connector line */}
                    {i < 6 && <div className="absolute top-6 left-[calc(50%+20px)] w-[calc(100%-40px)] h-px bg-white/10" />}
                    {/* Node */}
                    <div className={`w-12 h-12 ${item.highlight ? 'bg-white text-gray-900 ring-2 ring-white/20' : 'bg-gray-800 text-gray-300 border border-white/10'} rounded-xl flex items-center justify-center font-extrabold text-xs shrink-0 shadow-lg group-hover:scale-110 transition-transform z-10`}>
                      {item.year}
                    </div>
                    {item.highlight && (
                      <span className="mt-2 inline-flex items-center gap-1 px-2 py-0.5 bg-white/10 rounded-full text-[9px] font-bold uppercase tracking-wider text-gray-300 z-10">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                        Sekarang
                      </span>
                    )}
                    {/* Content card */}
                    <div className={`mt-4 p-4 rounded-xl w-full ${item.highlight ? 'bg-white/10 border border-white/10' : 'bg-white/[0.03]'} text-center transition-all group-hover:bg-white/[0.08]`}>
                      <h4 className={`text-sm font-bold ${item.highlight ? 'text-white' : 'text-gray-300'} mb-1`}>{item.title}</h4>
                      <p className="text-xs text-gray-500 leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ═══════ LEGALITAS — Redesigned: Horizontal feature list ═══════ */}
      <section className="py-24 md:py-32 bg-gray-50 relative overflow-hidden">
        <ConstellationParticles count={5} dark={false} />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn className="text-center mb-14">
            <span className="inline-block px-3 py-1 bg-white text-gray-500 text-[10px] font-bold uppercase tracking-[0.25em] rounded-full mb-4">Legalitas Perusahaan</span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-gray-900 tracking-tight">
              Dokumen <span className="bg-gradient-to-r from-gray-800 to-gray-500 bg-clip-text text-transparent">Lengkap &amp; Terverifikasi</span>
            </h2>
            <p className="text-gray-500 max-w-2xl mx-auto text-lg mt-4">
              {S.company_legal_name} beroperasi secara legal dengan seluruh dokumen perizinan lengkap.
            </p>
          </FadeIn>

          {/* Legal items — horizontal row with dividers */}
          <FadeIn>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-10">
              <div className="grid grid-cols-2 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-gray-100">
                {[
                  { title: "Akta Pendirian", desc: "Akta Notaris pendirian perusahaan", icon: FileText },
                  { title: "NIB / OSS", desc: "Nomor Induk Berusaha terdaftar", icon: FileText },
                  { title: "SIUP / IUJK", desc: "Izin usaha jasa konstruksi", icon: Building2 },
                  { title: "NPWP Badan", desc: "Terdaftar di Direktorat Pajak", icon: FileText },
                  { title: "SK Kemenkumham", desc: "Pengesahan badan hukum", icon: Shield },
                  { title: "Rekening Bank", desc: "Rekening perusahaan resmi", icon: LandPlot },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.title} className="flex items-center gap-4 p-5 hover:bg-gray-50 transition-colors">
                      <div className="w-10 h-10 bg-gray-900 rounded-lg flex items-center justify-center shrink-0">
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-bold text-gray-900 text-sm truncate">{item.title}</h4>
                        <p className="text-xs text-gray-400 truncate">{item.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </FadeIn>

          {/* Guarantee statement */}
          <FadeIn>
            <div className="bg-gray-900 rounded-2xl p-6 md:p-8 text-white">
              <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-6 h-6 text-gray-300" />
                </div>
                <div>
                  <h4 className="font-bold text-lg mb-1">Jaminan Legalitas Setiap Proyek Mitra</h4>
                  <p className="text-gray-400 text-sm leading-relaxed">
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

      {/* ═══════ MITRA PERBANKAN — Redesigned: Grid instead of scroll ═══════ */}
      <section className="py-24 md:py-32 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn className="text-center mb-14">
            <span className="inline-block px-3 py-1 bg-gray-100 text-gray-500 text-[10px] font-bold uppercase tracking-[0.25em] rounded-full mb-4">Mitra Perbankan</span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-gray-900 tracking-tight">
              Didukung <span className="bg-gradient-to-r from-gray-800 to-gray-500 bg-clip-text text-transparent">Bank &amp; Lembaga Keuangan</span> Terpercaya
            </h2>
          </FadeIn>
          {bankLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-20 bg-gray-100 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : bankItems.length === 0 ? (
            <p className="text-center text-gray-400 py-8">Belum ada data mitra bank</p>
          ) : (
            <FadeIn>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 max-w-4xl mx-auto">
                {bankItems.map((bank) => (
                  <div
                    key={bank.id}
                    className="flex flex-col items-center justify-center h-20 bg-gray-50 rounded-xl border border-gray-100 hover:border-gray-300 hover:shadow-md transition-all group"
                  >
                    {bank.image ? (
                      <img
                        src={bank.image}
                        alt={bank.name}
                        className="w-16 h-8 object-contain"
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
                    <span className="text-[10px] text-gray-400 mt-1.5 truncate max-w-full px-1 font-medium">{bank.name}</span>
                  </div>
                ))}
              </div>
            </FadeIn>
          )}
        </div>
      </section>

      {/* ═══════ GALERI — Redesigned: Grid layout instead of masonry ═══════ */}
      <section className="py-24 md:py-32 bg-gray-50 relative overflow-hidden">
        <ConstellationParticles count={6} dark={false} />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn className="text-center mb-14">
            <span className="inline-block px-3 py-1 bg-white text-gray-500 text-[10px] font-bold uppercase tracking-[0.25em] rounded-full mb-4">Dokumentasi</span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-gray-900 tracking-tight">
              Galeri <span className="bg-gradient-to-r from-gray-800 to-gray-500 bg-clip-text text-transparent">Foto</span>
            </h2>
          </FadeIn>

          {homeGalleryItems.length === 0 ? (
            <div className="text-center py-16">
              <Camera className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-400 text-lg">Belum ada foto dokumentasi.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {homeGalleryItems.slice(0, 8).map((img, i) => (
                <FadeIn key={img.id} delay={i * 0.05}>
                  <div
                    className={`relative rounded-xl overflow-hidden bg-gray-100 cursor-pointer group ${i === 0 ? 'md:col-span-2 md:row-span-2' : ''}`}
                    onClick={() => { setLightboxIndex(i); setLightboxOpen(true); }}
                  >
                    <img
                      src={img.image}
                      alt={img.title}
                      className={`w-full object-cover group-hover:scale-105 transition-transform duration-500 ${i === 0 ? 'h-full min-h-[200px] md:min-h-[340px]' : 'h-40 md:h-48'}`}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                      <p className="text-white font-semibold text-sm truncate">{img.title}</p>
                    </div>
                  </div>
                </FadeIn>
              ))}
            </div>
          )}

          <FadeIn className="text-center mt-10">
            <button
              onClick={() => (typeof window !== "undefined") && window.location.assign("/?tab=gallery")}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 text-white font-semibold rounded-xl hover:bg-gray-800 transition-colors"
            >
              Lihat Semua Foto
              <ArrowRight className="w-4 h-4" />
            </button>
          </FadeIn>
        </div>
      </section>

      {/* ═══════ TESTIMONI ═══════ */}
      <TestimonialsCarousel />

      {/* Lightbox */}
      {lightboxOpen && (
        <LightboxOverlay
          images={homeGalleryItems.map((g) => g.image)}
          activeIndex={lightboxIndex}
          onClose={() => setLightboxOpen(false)}
        />
      )}
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

      {/* Hero image - constrained to content width */}
      <div className="pt-20 md:pt-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative h-64 sm:h-80 overflow-hidden rounded-2xl">
            {coverImg ? (
              <img src={coverImg} alt={article.title} className="w-full h-full object-cover" />
            ) : (
              <div className="h-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                <BookOpen className="w-24 h-24 text-white/20" />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-black/10" />
            <div className="absolute bottom-0 left-0 right-0 p-5 md:p-8">
              <button
                onClick={() => router.push("/?tab=blog")}
                className="inline-flex items-center gap-1.5 text-white/70 hover:text-white text-sm mb-3 transition-colors"
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
      </div>

      {/* Article content */}
      <article className="py-10 md:py-16 bg-white relative overflow-hidden">
        {/* Ambient floating orb */}
        <motion.div
          animate={{ y: [0, -15, 10, 0], x: [0, 12, -8, 0] }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[15%] right-[-5%] w-[300px] h-[300px] rounded-full bg-gray-100/50 blur-3xl"
        />
        <FloatingParticles count={3} dark={false} />
        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 overflow-x-visible">
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
      <section className="py-16 md:py-24 bg-section-gray relative overflow-hidden">
        {/* Ambient floating orb */}
        <motion.div
          animate={{ y: [0, -15, 10, 0], x: [0, 12, -8, 0] }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[10%] right-[-5%] w-[300px] h-[300px] rounded-full bg-gray-200/30 blur-3xl"
        />
        <FloatingParticles count={4} dark={false} />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
  onSelect?: (s: ServiceItem) => void;
}) {
  const router = useRouter();
  const catLabel = SERVICE_CATEGORY_LABELS[service.category] || service.category;
  const unitLabel = SERVICE_PRICE_UNIT_MAP[service.priceUnit] || service.priceUnit;
  const IconComponent = SERVICE_CATEGORY_ICONS[service.category] || Wrench;

  const handleClick = () => {
    if (onSelect) {
      onSelect(service);
    } else {
      router.push(`/?tab=jasa/${service.slug}`);
    }
  };

  return (
    <FadeIn className="h-full">
      <div
        className="group h-full bg-white rounded-2xl border border-gray-100 overflow-hidden cursor-pointer hover:shadow-xl hover:border-gray-200 hover:-translate-y-1 transition-all duration-300"
        onClick={handleClick}
      >
        {/* Image */}
        <div className="relative h-48 overflow-hidden bg-gray-100">
          {service.image ? (
            <img
              src={service.image}
              alt={service.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
              <IconComponent className="w-12 h-12 text-white/15" />
            </div>
          )}
          {/* Top badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5">
            <Badge className="bg-white/90 backdrop-blur-sm text-gray-700 border-0 text-xs font-semibold shadow-sm">
              {catLabel}
            </Badge>
            {service.isFeatured && (
              <Badge className="bg-gray-900 text-white border-0 text-[10px] font-bold shadow-sm">
                <Star className="w-3 h-3 mr-1" /> Unggulan
              </Badge>
            )}
          </div>
          {/* Video indicator */}
          {service.videoUrl && (
            <div className="absolute top-3 right-3">
              <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-lg bg-black/50 text-white backdrop-blur-sm">
                <Camera className="w-3 h-3" /> Video
              </span>
            </div>
          )}
          {/* Bottom gradient on image */}
          <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/20 to-transparent" />
        </div>

        {/* Content */}
        <div className="p-5">
          {/* Features */}
          {service.features.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-3">
              {service.features.slice(0, 3).map((feat, i) => (
                <span
                  key={i}
                  className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-gray-100 text-gray-500"
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

          {/* Title */}
          <h3 className="font-bold text-gray-900 text-lg leading-tight mb-1.5 group-hover:text-gray-900 transition-colors">
            {service.title}
          </h3>

          {/* Description */}
          {service.description && (
            <p className="text-gray-500 text-sm leading-relaxed mb-4 line-clamp-2">
              {service.description}
            </p>
          )}

          {/* Price + Duration + Arrow */}
          <div className="flex items-end justify-between pt-4 border-t border-gray-100">
            <div>
              <span className="text-xl font-black text-gray-900">
                {service.price > 0 ? `Rp ${new Intl.NumberFormat("id-ID").format(service.price)}` : "Hubungi Kami"}
              </span>
              {service.price > 0 && (
                <span className="text-xs text-gray-400 ml-1">/ {unitLabel}</span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {service.duration && (
                <span className="text-xs font-medium text-gray-400 flex items-center gap-1">
                  <Clock className="w-3 h-3" /> {service.duration}
                </span>
              )}
              <span className="w-9 h-9 rounded-xl bg-gray-900 flex items-center justify-center text-white group-hover:bg-gray-800 group-hover:scale-105 transition-all duration-300">
                <ArrowRight className="w-4 h-4" />
              </span>
            </div>
          </div>
        </div>
      </div>
    </FadeIn>
  );
}

function ServiceDetailPage({ slug }: { slug: string }) {
  const { settings: S } = useSettingsStore();
  const { services, fetchServices } = useServiceStore();
  const router = useRouter();
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  const service = services.find((s) => s.slug === slug);

  // Build all images array (main image + images array)
  const allImages = service ? (() => {
    const imgs = service.images && service.images.length > 0
      ? [...service.images]
      : service.image ? [service.image] : [];
    // Ensure main image is first
    if (service.image && !imgs.includes(service.image)) {
      imgs.unshift(service.image);
    }
    return imgs;
  })() : [];

  if (!service) {
    return (
      <>
        <Navbar activeTab="jasa" />
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="text-center">
            <Wrench className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">Jasa Tidak Ditemukan</h2>
            <p className="text-gray-500 mb-6">Jasa yang Anda cari tidak tersedia atau sudah dihapus.</p>
            <button
              onClick={() => router.push("/?tab=jasa")}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 text-white font-bold rounded-xl hover:bg-gray-800 transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              Kembali ke Jasa
            </button>
          </div>
        </div>
        <Footer />
        <Chatbot />
      </>
    );
  }

  const catLabel = SERVICE_CATEGORY_LABELS[service.category] || service.category;
  const unitLabel = SERVICE_PRICE_UNIT_MAP[service.priceUnit] || service.priceUnit;
  const IconComponent = SERVICE_CATEGORY_ICONS[service.category] || Wrench;
  const gradient = SERVICE_CATEGORY_GRADIENTS[service.category] || "from-gray-800 to-gray-900";
  const embedUrl = getYoutubeEmbedUrl(service.videoUrl);

  const waText = encodeURIComponent(
    `Halo, saya tertarik dengan jasa *${service.title}* (${catLabel}). Mohon info lebih lanjut.`
  );

  return (
    <>
      <Navbar activeTab="jasa" />
      <article className="bg-white pt-20 md:pt-24">
        {/* Hero - Image Gallery */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {allImages.length > 0 ? (
            allImages.length === 1 ? (
              <div className="relative aspect-square bg-gray-200 rounded-2xl overflow-hidden cursor-pointer" onClick={() => { setLightboxIndex(0); setLightboxOpen(true); }}>
                <img src={allImages[0]} alt={service.title} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-5 md:p-8">
                  <Badge className="mb-3 bg-white/90 text-gray-700 border-0 shadow-lg text-xs font-semibold">
                    {catLabel}
                  </Badge>
                  <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-white leading-tight">
                    {service.title}
                  </h1>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {/* Main image */}
                <div
                  className="relative aspect-[4/3] sm:aspect-video bg-gray-200 rounded-2xl overflow-hidden cursor-pointer group"
                  onClick={() => { setLightboxIndex(0); setLightboxOpen(true); }}
                >
                  <img src={allImages[0]} alt={service.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-5 md:p-8">
                    <Badge className="mb-3 bg-white/90 text-gray-700 border-0 shadow-lg text-xs font-semibold">
                      {catLabel}
                    </Badge>
                    <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-white leading-tight">
                      {service.title}
                    </h1>
                  </div>
                  <div className="absolute top-3 right-3 bg-black/50 backdrop-blur-sm text-white text-xs px-2.5 py-1 rounded-lg">
                    <Camera className="w-3.5 h-3.5 inline mr-1 -mt-0.5" />
                    {allImages.length} foto
                  </div>
                </div>
                {/* Thumbnail grid */}
                {allImages.length > 1 && (
                  <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
                    {allImages.slice(1, 6).map((img, i) => (
                      <div
                        key={i}
                        className="aspect-square rounded-lg overflow-hidden cursor-pointer group relative"
                        onClick={() => { setLightboxIndex(i + 1); setLightboxOpen(true); }}
                      >
                        <img src={img} alt={`${service.title} ${i + 2}`} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors" />
                      </div>
                    ))}
                    {allImages.length > 6 && (
                      <div
                        className="aspect-square rounded-lg overflow-hidden cursor-pointer relative"
                        onClick={() => { setLightboxIndex(0); setLightboxOpen(true); }}
                      >
                        <img src={allImages[5]} alt="" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                          <span className="text-white font-bold text-sm">+{allImages.length - 6}</span>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          ) : (
            <div className="relative aspect-[4/3] sm:aspect-video rounded-2xl overflow-hidden">
              <div className={`w-full h-full bg-gradient-to-br ${gradient} flex items-center justify-center`}>
                <IconComponent className="w-24 h-24 text-white/20" />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-5 md:p-8">
                <Badge className="mb-3 bg-white/90 text-gray-700 border-0 shadow-lg text-xs font-semibold">
                  {catLabel}
                </Badge>
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-white leading-tight">
                  {service.title}
                </h1>
              </div>
            </div>
          )}
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-gray-400 mb-8">
            <button onClick={() => router.push("/?tab=jasa")} className="hover:text-gray-700 transition-colors">Jasa</button>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-gray-700 font-medium truncate max-w-xs">{service.title}</span>
          </nav>

          {/* Price + Duration */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
            <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
              <p className="text-xs text-gray-400 uppercase tracking-wider mb-2 font-semibold">Harga</p>
              <p className="text-2xl font-black text-gray-900">
                {service.price > 0 ? `Rp ${new Intl.NumberFormat("id-ID").format(service.price)}` : "Hubungi Kami"}
              </p>
              {service.price > 0 && (
                <p className="text-xs text-gray-400 mt-1">/ {unitLabel}</p>
              )}
            </div>
            {service.duration && (
              <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                <p className="text-xs text-gray-400 uppercase tracking-wider mb-2 font-semibold">Estimasi Durasi</p>
                <p className="text-2xl font-black text-gray-900">{service.duration}</p>
                <p className="text-xs text-gray-400 mt-1">Waktu pengerjaan</p>
              </div>
            )}
          </div>

          {/* Description */}
          {service.description && (
            <div className="mb-10">
              <h2 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                <FileText className="w-4 h-4 text-gray-400" />
                Deskripsi
              </h2>
              <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-line">
                {service.description}
              </p>
            </div>
          )}

          {/* Features */}
          {service.features.length > 0 && (
            <div className="mb-10">
              <h2 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-gray-400" />
                Keunggulan
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {service.features.map((feat, i) => (
                  <div key={i} className="flex items-start gap-2.5 bg-gray-50 rounded-xl p-4 border border-gray-100">
                    <CheckCircle2 className="w-4 h-4 text-gray-500 mt-0.5 shrink-0" />
                    <span className="text-sm text-gray-700">{feat}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Video */}
          {embedUrl && (
            <div className="mb-10">
              <h2 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                <Camera className="w-4 h-4 text-gray-400" />
                Video Preview
              </h2>
              <div className="aspect-video rounded-2xl overflow-hidden shadow-lg">
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
          <div className="bg-gray-950 rounded-2xl p-6 md:p-8 text-center">
            <h3 className="text-lg md:text-xl font-bold text-white mb-2">Butuh Jasa {service.title}?</h3>
            <p className="text-gray-400 text-sm mb-6">Hubungi kami untuk konsultasi dan survei gratis.</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a
                href={`https://wa.me/${S.contact_wa}?text=${waText}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-white text-gray-900 font-bold rounded-xl hover:bg-gray-100 transition-all shadow-lg"
              >
                <MessageCircle className="w-5 h-5" />
                Tanya via WhatsApp
              </a>
              <a
                href={`tel:${S.contact_phone}`}
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-gray-800 text-white font-bold rounded-xl hover:bg-gray-700 transition-all"
              >
                <Phone className="w-5 h-5" />
                Hubungi Kami
              </a>
            </div>
          </div>
        </div>
      </article>

      {/* Lightbox */}
      {lightboxOpen && allImages.length > 0 && (
        <LightboxOverlay
          images={allImages}
          activeIndex={lightboxIndex}
          onClose={() => setLightboxOpen(false)}
        />
      )}

      <Footer />
      <Chatbot />
    </>
  );
}

function JasaListingSection() {
  const { services, fetchServices } = useServiceStore();
  const [page, setPage] = useState(1);
  const [showFilter, setShowFilter] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  // Extract unique categories
  const categories = Array.from(new Set(services.map((s) => s.category).filter(Boolean)));
  const categoryLabels: Record<string, string> = {};
  categories.forEach((c) => {
    categoryLabels[c] = c.charAt(0).toUpperCase() + c.slice(1).replace(/[_-]/g, " ");
  });

  const toggleCheckbox = (arr: string[], setArr: (v: string[]) => void, val: string) => {
    setArr(arr.includes(val) ? arr.filter((v) => v !== val) : [...arr, val]);
  };

  const filtered = selectedCategories.length === 0
    ? services
    : services.filter((s) => selectedCategories.includes(s.category));

  // Reset page when filter changes
  const filterKey = selectedCategories.join(",");
  useEffect(() => { setPage(1); }, [filterKey]);

  const totalPages = Math.ceil(filtered.length / JASA_PER_PAGE);
  const paged = filtered.slice((page - 1) * JASA_PER_PAGE, page * JASA_PER_PAGE);

  // Checkbox styles
  const cbBase = "w-4 h-4 rounded border-gray-300 text-gray-900 focus:ring-gray-900 focus:ring-offset-0 cursor-pointer transition-colors";
  const cbLabel = "text-sm text-gray-600 cursor-pointer select-none hover:text-gray-900 transition-colors";

  return (
    <section className="py-20 md:py-28 bg-section-gray relative overflow-hidden">
      {/* Ambient floating orb */}
      <motion.div
        animate={{ y: [0, -15, 10, 0], x: [0, 12, -8, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-[10%] right-[-5%] w-[300px] h-[300px] rounded-full bg-gray-200/30 blur-3xl"
      />
      <FloatingParticles count={3} dark={false} />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeIn className="text-center mb-10">
          <span className="block text-gray-400 text-xs font-bold uppercase tracking-[0.3em]">Layanan Jasa Kami</span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-shimmer-silver mt-3 mb-4 tracking-tight">
            Solusi Bangunan <span className="text-gradient-gray">Profesional</span>
          </h2>
          <p className="text-gray-500 max-w-2xl mx-auto text-lg">
            Dari konstruksi hingga desain interior — semua kebutuhan bangunan Anda
            ditangani oleh tim berpengalaman.
          </p>
        </FadeIn>

        {/* Filter Toggle Button */}
        <FadeIn delay={0.1} className="mb-6">
          <button
            onClick={() => setShowFilter(!showFilter)}
            className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-xl bg-white border border-gray-200 text-sm font-medium text-gray-700 hover:border-gray-300 hover:text-gray-900 hover:shadow-sm transition-all"
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>{showFilter ? "Sembunyikan Filter" : "Tampilkan Filter"}</span>
            {selectedCategories.length > 0 && (
              <span className="ml-1 px-2 py-0.5 bg-gray-900 text-white text-xs font-bold rounded-full">
                {selectedCategories.length}
              </span>
            )}
          </button>
          {selectedCategories.length > 0 && (
            <button
              onClick={() => setSelectedCategories([])}
              className="ml-3 text-xs text-gray-400 hover:text-gray-600 underline underline-offset-2 transition-colors"
            >
              Reset semua
            </button>
          )}
        </FadeIn>

        {/* Filter Panel */}
        <AnimatePresence>
          {showFilter && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="overflow-hidden mb-10"
            >
              <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-10">
                  {/* Kategori */}
                  <div>
                    <h4 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wider">Kategori Jasa</h4>
                    <div className="space-y-3">
                      {categories.length > 0 ? categories.map((cat) => (
                        <label key={cat} className="flex items-center gap-3 group">
                          <input
                            type="checkbox"
                            checked={selectedCategories.includes(cat)}
                            onChange={() => toggleCheckbox(selectedCategories, setSelectedCategories, cat)}
                            className={cbBase}
                          />
                          <span className={cbLabel}>{categoryLabels[cat]}</span>
                        </label>
                      )) : (
                        <p className="text-sm text-gray-400 italic">Belum ada kategori</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results count */}
        <div className="mb-6 text-sm text-gray-400">
          Menampilkan <span className="font-semibold text-gray-700">{filtered.length}</span> jasa
          {selectedCategories.length > 0 && (
            <span> dengan <span className="font-semibold text-gray-700">{selectedCategories.length}</span> filter aktif</span>
          )}
        </div>

        {/* Service cards */}
        {paged.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {paged.map((service) => (
                <ServiceCard
                  key={service.id}
                  service={service}
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

        {/* How it works */}
        <FadeIn delay={0.1} className="mt-20">
          <div className="text-center mb-12">
            <span className="block text-gray-400 text-xs font-bold uppercase tracking-[0.3em]">Proses Kerja</span>
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-black text-shimmer-silver mt-3 mb-3 tracking-tight">
              Bagaimana Cara <span className="text-gradient-gray">Bekerja</span> dengan Kami
            </h2>
            <p className="text-gray-500 max-w-xl mx-auto">Proses yang simpel dan terstruktur untuk hasil terbaik.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { num: "01", title: "Konsultasi", desc: "Ceritakan kebutuhan Anda. Tim kami akan survey dan memberikan saran terbaik.", icon: MessageSquare },
              { num: "02", title: "RAB & Desain", desc: "Kami buatkan Rincian Anggaran Biaya dan desain pekerjaan untuk persetujuan Anda.", icon: FileText },
              { num: "03", title: "Pengerjaan", desc: "Tim profesional mulai bekerja sesuai timeline yang sudah disepakati bersama.", icon: HardHat },
              { num: "04", title: "Serah Terima", desc: "Quality check menyeluruh sebelum serah terima. Bergaransi untuk setiap pekerjaan.", icon: KeyRound },
            ].map((step, i) => (
              <div key={i} className="relative text-center group">
                {i < 3 && (
                  <div className="hidden lg:block absolute top-10 left-[60%] w-[80%] h-px bg-gray-200" />
                )}
                <div className="w-20 h-20 mx-auto rounded-2xl bg-white border border-gray-100 shadow-sm flex items-center justify-center mb-4 group-hover:shadow-md group-hover:border-gray-200 transition-all">
                  <step.icon className="w-8 h-8 text-gray-400 group-hover:text-gray-700 transition-colors" />
                </div>
                <span className="text-xs font-bold text-gray-300 tracking-widest">{step.num}</span>
                <h4 className="font-bold text-gray-900 mt-1 mb-1.5">{step.title}</h4>
                <p className="text-gray-500 text-sm leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </FadeIn>

        {/* CTA Section */}
        <FadeIn delay={0.15} className="mt-20">
          <div className="relative bg-gray-950 rounded-3xl overflow-hidden p-8 md:p-12 text-center">
            <motion.div
              animate={{ y: [0, -15, 10, 0], x: [0, 12, -8, 0] }}
              transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-[-20%] right-[-10%] w-[300px] h-[300px] rounded-full bg-gray-800/30 blur-3xl"
            />
            <motion.div
              animate={{ y: [0, 10, -15, 0], x: [0, -8, 12, 0] }}
              transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
              className="absolute bottom-[-20%] left-[-10%] w-[250px] h-[250px] rounded-full bg-gray-700/20 blur-3xl"
            />
            <div className="relative">
              <h3 className="text-2xl md:text-3xl font-black text-white mb-3">
                Butuh Jasa Bangunan?
              </h3>
              <p className="text-gray-400 max-w-lg mx-auto mb-8">
                Konsultasikan kebutuhan Anda sekarang. Tim marketing kami siap membantu dari survey hingga serah terima.
              </p>
              <a
                href={`https://wa.me/${useSettingsStore.getState().settings.contact_wa}?text=${encodeURIComponent("Halo, saya ingin konsultasi tentang jasa bangunan.")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2.5 px-8 py-4 bg-white text-gray-900 font-bold rounded-xl shadow-lg hover:bg-gray-100 transition-all hover:shadow-xl active:scale-95"
              >
                <MessageCircle className="w-5 h-5" />
                Konsultasi Gratis via WhatsApp
              </a>
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

function JasaPage() {
  const { settings: S } = useSettingsStore();
  return (
    <>
      <PageBanner
        title="Jasa & Layanan"
        subtitle="Solusi bangunan profesional dari konstruksi hingga desain interior"
      />
      <JasaListingSection />
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

      {/* ── Section 1: Hero Stats (light) ── */}
      <section className="py-16 md:py-20 bg-white relative overflow-hidden">
        <motion.div
          animate={{ y: [0, -15, 10, 0], x: [0, 12, -8, 0] }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[10%] right-[-5%] w-[300px] h-[300px] rounded-full bg-gray-100/60 blur-3xl"
        />
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn className="text-center mb-12">
            <span className="block text-gray-400 text-xs font-bold uppercase tracking-[0.3em]">Mitra Kami</span>
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-black text-shimmer-silver mt-3 mb-3 tracking-tight">
              Platform Perumahan <span className="text-gradient-gray">Terpercaya</span>
            </h2>
            <p className="text-gray-500 mt-3 max-w-xl mx-auto">
              Menghubungkan calon pembeli dengan developer terpilih yang telah melewati proses verifikasi ketat.
            </p>
          </FadeIn>
          <FadeIn delay={0.1}>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { value: `${S.total_units_sold}+`, label: "Unit Terjual", icon: Home },
                { value: `${mitraList.length || "3"}+`, label: "Mitra Developer", icon: Building2 },
                { value: "10+", label: "Proyek Perumahan", icon: LandPlot },
                { value: "100%", label: "Legalitas Lengkap", icon: Shield },
              ].map((stat, i) => (
                <div key={i} className="bg-gray-50 border border-gray-100 rounded-2xl p-5 text-center hover:bg-white hover:shadow-md hover:border-gray-200 transition-all">
                  <stat.icon className="w-5 h-5 text-gray-400 mx-auto mb-2" />
                  <p className="text-2xl md:text-3xl font-black text-gray-900">{stat.value}</p>
                  <p className="text-xs text-gray-500 mt-1">{stat.label}</p>
                </div>
              ))}
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ── Section 2: Daftar Mitra (gray) ── */}
      <section className="py-20 md:py-28 bg-gray-50 relative overflow-hidden">
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn className="text-center mb-14">
            <span className="block text-gray-400 text-xs font-bold uppercase tracking-[0.3em]">Mitra Terpercaya</span>
            <h2 className="text-3xl md:text-4xl font-black text-shimmer-silver mt-3 mb-4 tracking-tight">
              Developer <span className="text-gradient-gray">Terpilih</span> &amp; Terverifikasi
            </h2>
            <p className="text-gray-500 max-w-xl mx-auto">
              Setiap mitra telah melalui proses kurasi ketat — legalitas, kualitas, dan track record.
            </p>
          </FadeIn>

          {loading ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="bg-gray-50 rounded-2xl animate-pulse h-28" />
              ))}
            </div>
          ) : mitraList.length === 0 ? (
            <div className="text-center py-16">
              <Building2 className="w-14 h-14 text-gray-200 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-gray-400 mb-2">Belum ada mitra terdaftar</h3>
              <p className="text-gray-400 text-sm">Developer mitra yang terdaftar akan tampil di sini.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {mitraList.map((mitra, i) => (
                <FadeIn key={mitra.id} delay={i * 0.06}>
                  <div className="group bg-gray-50 hover:bg-white border border-gray-100 hover:border-gray-200 hover:shadow-lg rounded-2xl p-5 md:p-6 transition-all duration-300">
                    <div className="flex flex-col sm:flex-row items-start gap-4 md:gap-6">
                      {/* Logo */}
                      <div className="w-14 h-14 md:w-16 md:h-16 rounded-xl bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center shadow-md shrink-0 overflow-hidden group-hover:shadow-lg group-hover:scale-105 transition-all">
                        {mitra.logo ? (
                          <img src={mitra.logo} alt={mitra.name} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-white font-extrabold text-lg">{mitra.name.charAt(0).toUpperCase()}</span>
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 mb-1">
                          <h3 className="text-lg font-bold text-gray-900 truncate">{mitra.name}</h3>
                          <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-gray-900 text-white w-fit">Terverifikasi</span>
                        </div>
                        <p className="text-sm text-gray-500 flex items-center gap-1 mb-2">
                          <MapPin className="w-3.5 h-3.5 shrink-0" />
                          {mitra.address || "Indonesia"}
                        </p>
                        {mitra.description && (
                          <p className="text-gray-500 text-sm leading-relaxed line-clamp-2">{mitra.description}</p>
                        )}
                      </div>

                      {/* Stats + Contact */}
                      <div className="flex sm:flex-col items-center sm:items-end gap-3 sm:gap-2 shrink-0 sm:w-32">
                        <div className="flex items-center gap-4 sm:gap-2 text-sm">
                          <div className="flex items-center gap-1.5">
                            <Building2 className="w-4 h-4 text-gray-400" />
                            <span className="font-bold text-gray-900">{mitra.propertyCount}</span>
                            <span className="text-gray-400 text-xs">Proyek</span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          {mitra.website && (
                            <a
                              href={mitra.website.startsWith("http") ? mitra.website : `https://${mitra.website}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="w-8 h-8 rounded-lg bg-gray-200/80 hover:bg-gray-900 hover:text-white text-gray-600 flex items-center justify-center transition-all"
                            >
                              <Globe className="w-4 h-4" />
                            </a>
                          )}
                          {mitra.phone && (
                            <a
                              href={`https://wa.me/${mitra.phone.replace(/^0/, "62")}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="w-8 h-8 rounded-lg bg-gray-200/80 hover:bg-gray-900 hover:text-white text-gray-600 flex items-center justify-center transition-all"
                            >
                              <MessageCircle className="w-4 h-4" />
                            </a>
                          )}
                          {mitra.email && (
                            <a
                              href={`mailto:${mitra.email}`}
                              className="w-8 h-8 rounded-lg bg-gray-200/80 hover:bg-gray-900 hover:text-white text-gray-600 flex items-center justify-center transition-all"
                            >
                              <Mail className="w-4 h-4" />
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </FadeIn>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── Section 3: Cara Bergabung (dark) ── */}
      <section className="py-20 md:py-28 bg-gray-950 relative overflow-hidden">
        <motion.div
          animate={{ y: [0, -20, 15, 0], x: [0, 15, -10, 0] }}
          transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[-10%] left-[-5%] w-[400px] h-[400px] rounded-full bg-gray-800/20 blur-3xl"
        />
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn className="text-center mb-14">
            <span className="block text-gray-500 text-xs font-bold uppercase tracking-[0.3em]">Bergabunglah</span>
            <h2 className="text-3xl md:text-4xl font-black text-shimmer-silver-dark mt-3 mb-4">
              Cara Menjadi <span className="text-shimmer-silver-dark">Mitra Developer</span>
            </h2>
            <p className="text-gray-500 max-w-xl mx-auto">
              Proses kurasi transparan untuk menjaga kualitas setiap mitra di platform kami.
            </p>
          </FadeIn>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { num: "01", title: "Ajukan Pendaftaran", desc: "Hubungi tim kami via WhatsApp. Sampaikan profil developer beserta portofolio proyek.", icon: MessageCircle },
              { num: "02", title: "Verifikasi Legalitas", desc: "Tim kami verifikasi SHM, IMB/PBG, perizinan usaha, dan track record perusahaan Anda.", icon: FileText },
              { num: "03", title: "Onboarding & Listing", desc: "Setelah lolos verifikasi, akun developer dibuat dan proyek langsung listing di platform.", icon: Building2 },
              { num: "04", title: "Mulai Terima Lead", desc: "Calon pembeli menghubungi langsung. Tim marketing bantu proses closing dan KPR.", icon: Handshake },
            ].map((step, i) => (
              <FadeIn key={i} delay={i * 0.08}>
                <div className="relative bg-white/[0.04] border border-white/[0.08] rounded-2xl p-6 hover:bg-white/[0.07] hover:border-white/[0.12] transition-all group">
                  <span className="text-xs font-bold text-gray-600 tracking-widest">{step.num}</span>
                  <div className="w-11 h-11 rounded-xl bg-white/[0.08] flex items-center justify-center my-3 group-hover:bg-white/[0.12] transition-colors">
                    <step.icon className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" />
                  </div>
                  <h4 className="font-bold text-white text-sm mb-1.5">{step.title}</h4>
                  <p className="text-gray-500 text-xs leading-relaxed">{step.desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>

          {/* CTA */}
          <FadeIn delay={0.3} className="mt-14">
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a
                href={`https://wa.me/${S.contact_wa}?text=${encodeURIComponent("Halo, saya tertarik bergabung sebagai mitra developer. Mohon info persyaratan dan prosesnya.")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2.5 px-8 py-4 bg-white text-gray-900 font-bold rounded-xl hover:bg-gray-100 transition-all active:scale-95"
              >
                <MessageCircle className="w-5 h-5" />
                Daftar via WhatsApp
              </a>
              <a
                href={`tel:${S.contact_phone}`}
                className="inline-flex items-center justify-center gap-2.5 px-8 py-4 bg-white/10 text-white font-bold rounded-xl border border-white/10 hover:bg-white/15 transition-all active:scale-95"
              >
                <Phone className="w-5 h-5" />
                Hubungi Kami
              </a>
            </div>
          </FadeIn>
        </div>
      </section>
    </>
  );
}

/* ─────────────────────────── PROYEK PAGE ─────────────────────────── */

function ProyekPage() {
  const { settings: S } = useSettingsStore();
  return (
    <>
      <PageBanner title="Proyek Kami" subtitle="Pilih rumah idaman Anda dari berbagai tipe yang tersedia" />
      <PropertiesSection />
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
              {S.logo_url ? (
                <img src={S.logo_url} alt="Logo" className="w-10 h-10 rounded-lg object-contain" />
              ) : (
                <div className="w-10 h-10 rounded-lg bg-gray-800 flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-gray-400" />
                </div>
              )}
              <span className="text-sm text-white font-bold tracking-wider uppercase">{S.company_legal_name}</span>
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

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  useEffect(() => {
    refetchProperties();
  }, [refetchProperties]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [tab]);

  const renderContent = () => {
    // Check slug-based routes (before switch since switch uses strict ===)
    const blogSlugMatch = tab.match(/^blog\/(.+)$/);
    if (blogSlugMatch) {
      return (
        <>
          <Navbar activeTab="blog" />
          <BlogArticlePage slug={blogSlugMatch[1]} />
          <Footer />
          <Chatbot />
        </>
      );
    }

    const proyekSlugMatch = tab.match(/^proyek\/(.+)$/);
    if (proyekSlugMatch) {
      return <PropertyDetailPage slug={proyekSlugMatch[1]} />;
    }

    const jasaSlugMatch = tab.match(/^jasa\/(.+)$/);
    if (jasaSlugMatch) {
      return <ServiceDetailPage slug={jasaSlugMatch[1]} />;
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
            <ProyekPage />
            <Footer />
            <Chatbot />
          </>
        );
      case "jasa":
        return (
          <>
            <Navbar activeTab={tab} />
            <JasaPage />
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
            <PropertyShowcaseSection />
            <HowToBuySection />
            <ServicePreviewSection />
            <TestimonialsCarousel limit={6} />
            <BlogPreviewSection />
            <FAQSection />
            <CTASection />
            <Footer />
            <Chatbot />
          </>
        );
    }
  };

  return (
    <main className="min-h-screen flex flex-col bg-white">
      <SparkleCursor />
      {renderContent()}
    </main>
  );
}

export default function HomePage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <PageContent />
    </Suspense>
  );
}
