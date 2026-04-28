import { NextRequest, NextResponse } from "next/server";

/* ───────────────────────── CACHED DATA ───────────────────────── */

interface DbProperty {
  id: string;
  name: string;
  slug: string;
  type: string;
  category: string;
  price: number;
  location: string;
  bedrooms: number;
  bathrooms: number;
  landArea: number;
  buildingArea: number;
  status: string;
  description: string;
  features: string;
  images: string;
  tag: string;
  installment: string;
  financingTypes: string;
  dpOptions: string;
  tenorOptions: string;
  installments: string;
  syariahMargin: number;
  kprDpOptions: string;
  kprTenorOptions: string;
  kprInstallments: string;
  isFeatured: boolean;
}

interface ParsedProperty {
  name: string;
  type: string;
  category: string;
  price: number; // in millions
  location: string;
  bedrooms: number;
  bathrooms: number;
  tag: string;
  features: string[];
  dpOptions: number[];
  tenorOptions: number[];
  installments: Record<string, Record<string, number>>;
  kprDpOptions: number[];
  kprTenorOptions: number[];
  kprInstallments: Record<string, Record<string, number>>;
  financingTypes: string[];
}

let cachedProperties: ParsedProperty[] = [];
let cachedContactPhone = "";
let cachedContactWA = "";
let cachedContactPerson = "";
let cachedInstagram = "";
let cachedCompanyName = "";
let settingsCacheTime = 0;

function safeJsonParse<T>(str: string, fallback: T): T {
  try {
    return JSON.parse(str);
  } catch {
    return fallback;
  }
}

function parseProperty(p: DbProperty): ParsedProperty {
  return {
    name: p.name,
    type: p.type,
    category: p.category,
    price: p.price,
    location: p.location,
    bedrooms: p.bedrooms,
    bathrooms: p.bathrooms,
    tag: p.tag,
    features: safeJsonParse<string[]>(p.features, []),
    dpOptions: safeJsonParse<number[]>(p.dpOptions, [30]),
    tenorOptions: safeJsonParse<number[]>(p.tenorOptions, [1, 2, 3, 4, 5]),
    installments: safeJsonParse(p.installments, {}),
    kprDpOptions: safeJsonParse<number[]>(p.kprDpOptions, [0, 10, 15, 20, 25, 30]),
    kprTenorOptions: safeJsonParse<number[]>(p.kprTenorOptions, [5, 10, 15, 20, 25]),
    kprInstallments: safeJsonParse(p.kprInstallments, {}),
    financingTypes: safeJsonParse<string[]>(p.financingTypes, ["syariah", "kpr"]),
  };
}

function getContactFooter(): string {
  return `\n\n---\n📱 **WhatsApp**: ${cachedContactPhone}\n📸 **Instagram**: ${cachedInstagram}`;
}

async function refreshData() {
  const now = Date.now();
  if (now - settingsCacheTime < 5 * 60 * 1000) return; // cache 5 min
  try {
    const { db } = await import("@/lib/db");

    // Fetch settings
    const rows = await db.setting.findMany({
      where: { key: { in: ["contact_phone", "contact_wa", "contact_person", "social_instagram", "company_name"] } },
    });
    for (const r of rows) {
      if (r.value) {
        switch (r.key) {
          case "contact_phone": cachedContactPhone = r.value; break;
          case "contact_wa": cachedContactWA = r.value; break;
          case "contact_person": cachedContactPerson = r.value; break;
          case "social_instagram": cachedInstagram = r.value.startsWith("@") ? r.value : `@${r.value}`; break;
          case "company_name": cachedCompanyName = r.value; break;
        }
      }
    }

    // Fetch properties
    const props = await db.property.findMany({
      where: { status: "available" },
      orderBy: { isFeatured: "desc" },
    });
    cachedProperties = props.map(parseProperty);

    settingsCacheTime = now;
  } catch (e) {
    console.error("Failed to refresh chatbot data:", e);
  }
}

function formatRp(millions: number): string {
  return new Intl.NumberFormat("id-ID").format(millions * 1_000_000);
}

function getCheapestInstallment(p: ParsedProperty): { dp: number; tenor: number; monthly: number } {
  let cheapest = { dp: 0, tenor: 0, monthly: Infinity };
  for (const [dpKey, tenors] of Object.entries(p.installments)) {
    for (const [tenorKey, val] of Object.entries(tenors)) {
      if (val < cheapest.monthly) {
        cheapest = { dp: Number(dpKey), tenor: Number(tenorKey), monthly: val };
      }
    }
  }
  if (!isFinite(cheapest.monthly)) cheapest.monthly = 0;
  return cheapest;
}

/* ───────────────────────── RULE-BASED FALLBACK ───────────────────────── */

function fallbackResponse(message: string): string {
  const q = message.toLowerCase().trim();
  const PROPS = cachedProperties;

  // If no properties in DB, return generic response
  if (PROPS.length === 0) {
    if (/^(hai|halo|hello|hi|hey|selamat|assalam|pagi|siang|sore|malam)/.test(q)) {
      return `Halo! 👋 Terima kasih sudah menghubungi ${cachedCompanyName || "kami"}.\n\nSaat ini belum ada properti yang tersedia. Silakan hubungi tim marketing kami untuk info terbaru.${getContactFooter()}`;
    }
    return `Maaf, saat ini data properti belum tersedia. Silakan hubungi tim marketing kami untuk informasi terbaru.${getContactFooter()}`;
  }

  // Greeting
  if (/^(hai|halo|hello|hi|hey|selamat|assalam|pagi|siang|sore|malam)/.test(q)) {
    return `Halo! 👋 Terima kasih sudah menghubungi ${cachedCompanyName}.\n\nSaya bisa membantu Anda dengan informasi seputar:\n• 🏠 Daftar properti & harga\n• 💰 Simulasi cicilan\n• 📍 Lokasi & fasilitas\n• 📋 Skema pembayaran\n\nSilakan tanyakan apa saja!${getContactFooter()}`;
  }

  // Termurah / cheapest
  if (/termurah|murah|paling murah|harga terendah|budget kecil|cicilan paling kecil|cicilan terendah/.test(q)) {
    const sorted = [...PROPS].sort((a, b) => a.price - b.price);
    const cheapest = sorted[0];
    const ci = getCheapestInstallment(cheapest);
    const feats = Array.isArray(cheapest.features) ? cheapest.features : typeof cheapest.features === "string" ? safeJsonParse<string[]>(cheapest.features, []) : [];
    const featureStr = feats.length > 0 ? feats.join(", ") : "-";
    return `🏠 **Properti Termurah: ${cheapest.name}**\n\n• Tipe: **${cheapest.type}** (${cheapest.bedrooms} KT / ${cheapest.bathrooms} KM)\n• Harga: **Rp ${formatRp(cheapest.price)}**\n• Lokasi: ${cheapest.location}\n• Kategori: ${cheapest.category}\n• Fitur: ${featureStr}\n\n💰 Cicilan termurah (DP ${ci.dp}%, tenor ${ci.tenor} tahun):\n**Rp ${formatRp(ci.monthly)}/bulan** (FLAT, tanpa riba)${getContactFooter()}`;
  }

  // Specific property search
  const prop = PROPS.find(
    (p) =>
      p.name.toLowerCase().includes(q) ||
      q.includes(p.name.toLowerCase()) ||
      q.includes(p.type.toLowerCase()) ||
      q.includes(p.tag.toLowerCase())
  );
  if (prop) {
    const ci = getCheapestInstallment(prop);
    const feats = Array.isArray(prop.features) ? prop.features : typeof prop.features === "string" ? safeJsonParse<string[]>(prop.features, []) : [];
    const featureStr = feats.length > 0 ? feats.join(", ") : "-";
    const tenorStr = prop.tenorOptions.map(String).join(", ");
    const dpStr = prop.dpOptions.map((d) => d + "%").join(", ");
    const financeStr = prop.financingTypes.map((f) => f === "syariah" ? "Syariah" : "KPR").join(" & ");
    return `🏠 **${prop.name}** ${prop.tag ? `(${prop.tag})` : ""}\n\n• Tipe: **${prop.type}** — ${prop.bedrooms} KT / ${prop.bathrooms} KM\n• Harga: **Rp ${formatRp(prop.price)}**\n• Lokasi: ${prop.location}\n• Kategori: ${prop.category}\n• Skema: ${financeStr}\n• Fitur: ${featureStr}\n\n💰 Cicilan mulai **Rp ${formatRp(ci.monthly)}/bulan**\n(DP ${ci.dp}%, tenor ${ci.tenor} tahun — FLAT, tanpa riba)\n\n📋 Pilihan DP: ${dpStr}\n📋 Pilihan Tenor: ${tenorStr} tahun${getContactFooter()}`;
  }

  // Search by type number
  const typeNums = q.replace(/[^0-9]/g, "");
  if (typeNums) {
    const byType = PROPS.filter((p) => p.type.replace(/[^0-9]/g, "").includes(typeNums));
    if (byType.length > 0) {
      const lines = byType.map((p) => {
        const ci = getCheapestInstallment(p);
        return `• **${p.name}** — Rp ${formatRp(p.price)}, cicilan mulai Rp ${formatRp(ci.monthly)}/bln`;
      });
      return `📋 Properti ditemukan:\n\n${lines.join("\n")}\n\nSemua cicilan **FLAT**, tanpa riba, tanpa denda, tanpa penalti.${getContactFooter()}`;
    }
  }

  // Semua properti / daftar / list
  if (/semua|daftar|list|tipe apa|properti apa|jenis|unit|available|tersedia/.test(q)) {
    const sorted = [...PROPS].sort((a, b) => a.price - b.price);
    const lines = sorted.map((p, i) => {
      const ci = getCheapestInstallment(p);
      return `${i + 1}. **${p.name}** — Tipe ${p.type}, Rp ${formatRp(p.price)}\n   Cicilan mulai Rp ${formatRp(ci.monthly)}/bulan`;
    });
    return `📋 **Daftar Properti ${cachedCompanyName}:**\n\n${lines.join("\n\n")}\n\nSemua skema **Syariah & KPR** — cicilan FLAT, tanpa riba, tanpa denda, tanpa penalti.${getContactFooter()}`;
  }

  // Cicilan / installment question
  if (/cicilan|angsuran|monthly|per bulan|bayar per/.test(q)) {
    // Try to find which property
    let matchedProp = prop;
    if (!matchedProp && typeNums) {
      const byType = PROPS.filter((p) => p.type.replace(/[^0-9]/g, "").includes(typeNums));
      if (byType.length === 1) matchedProp = byType[0];
    }

    if (matchedProp) {
      const ci = getCheapestInstallment(matchedProp);
      const dpStr = matchedProp.dpOptions.map((d) => d + "%").join(", ");
      const tenorStr = matchedProp.tenorOptions.map((t) => t + "thn").join(", ");
      const installEntries = Object.entries(matchedProp.installments);
      if (installEntries.length > 0) {
        const tenors = matchedProp.tenorOptions;
        const dps = matchedProp.dpOptions;
        const header = `| DP↓ \\ Tenor→ | ${tenors.map((t) => t + " thn").join(" | ")} |`;
        const sep = `| ${"---"} | ${tenors.map(() => "---").join(" | ")} |`;
        const rows = dps.map((d) => {
          const dKey = String(d);
          const tenorData = matchedProp.installments[dKey] || {};
          const cells = tenors.map((t) => {
            const val = tenorData[String(t)];
            return val ? `Rp ${formatRp(val)}` : "-";
          }).join(" | ");
          return `| ${d}% | ${cells} |`;
        });
        return `💰 **Cicilan ${matchedProp.name}** — Tipe ${matchedProp.type} (Rp ${formatRp(matchedProp.price)})\n\nCicilan **FLAT**, tidak berubah selama tenor. Skema syariah (tanpa riba, tanpa denda, tanpa penalti).\n\n${header}\n${sep}\n${rows.join("\n")}\n\nPilihan DP: ${dpStr}\nPilihan Tenor: ${tenorStr}${getContactFooter()}`;
      }
      return `💰 **${matchedProp.name}** — Tipe ${matchedProp.type} (Rp ${formatRp(matchedProp.price)})\n\nCicilan mulai **Rp ${formatRp(ci.monthly)}/bulan** (DP ${ci.dp}%, tenor ${ci.tenor} tahun)\n\nPilihan DP: ${dpStr}\nPilihan Tenor: ${tenorStr}${getContactFooter()}`;
    }

    // Generic cicilan overview
    const sorted = [...PROPS].sort((a, b) => a.price - b.price);
    const lines = sorted.map((p) => {
      const ci = getCheapestInstallment(p);
      return `• ${p.name} (Tipe ${p.type}): mulai **Rp ${formatRp(ci.monthly)}/bulan**`;
    });
    return `💰 **Ringkasan Cicilan Termurah:**\n\n${lines.join("\n")}\n\nSemua cicilan **tanpa riba, tanpa denda, tanpa penalti**. Hubungi kami untuk simulasi lengkap sesuai DP dan tenor yang Anda inginkan.${getContactFooter()}`;
  }

  // Lokasi
  if (/lokasi|alamat|di mana|letak|map|posisi|koordinat/.test(q)) {
    const locations = [...new Set(PROPS.map((p) => p.location).filter(Boolean))];
    const locStr = locations.length > 0 ? locations.join(", ") : "-";
    return `📍 **Lokasi ${cachedCompanyName}:**\n\n${locStr}\n\nKunjungi lokasi kami atau hubungi untuk informasi lebih lanjut!${getContactFooter()}`;
  }

  // Syariah / pembayaran / skema
  if (/syariah|pembayaran|skema|rib[aá]|denda|penalti|dp|uang muka|down payment|bunga|bank/.test(q)) {
    return `💳 **Skema Pembayaran ${cachedCompanyName}:**\n\n✅ **Syariah** — BEBAS RIBA, tanpa bunga bank, tanpa denda, cicilan FLAT\n✅ **KPR Bank** — kerjasama dengan bank ternama, angsuran kompetitif\n✅ DP fleksibel mulai dari **10%**\n✅ Tenor hingga **25 tahun** (KPR) / **7 tahun** (Syariah)${getContactFooter()}`;
  }

  // Keunggulan / kelebihan / fasilitas
  if (/keunggulan|kelebihan|fasilitas|kenapa|alasan|unggul|superior/.test(q)) {
    return `⭐ **Keunggulan ${cachedCompanyName}:**\n\n1. Lokasi strategis\n2. Dekat fasilitas publik (sekolah, RS, mall, tol)\n3. Lingkungan asri dan hijau\n4. Desain modern minimalis, material premium\n5. One gate system + keamanan 24 jam\n6. Fasilitas: mushola, playground, area olahraga\n7. Skema Syariah & KPR Bank\n8. Investasi menguntungkan (harga naik setiap tahun)${getContactFooter()}`;
  }

  // Kontak / hubungi
  if (/kontak|hubungi|telepon|wa|whatsapp|call|nomor|marketing|sales/.test(q)) {
    return `📞 **Kontak ${cachedCompanyName}:**\n\n📱 WhatsApp: **${cachedContactPhone}** (${cachedContactPerson})\n📸 Instagram: **${cachedInstagram}**\n\nHubungi kami untuk konsultasi gratis!${getContactFooter()}`;
  }

  // Harga
  if (/harga|biaya|total|berapa/.test(q)) {
    const sorted = [...PROPS].sort((a, b) => a.price - b.price);
    const lines = sorted.map((p) => `• **${p.name}** — Tipe ${p.type}: Rp ${formatRp(p.price)}`);
    return `💰 **Harga Properti ${cachedCompanyName}:**\n\n${lines.join("\n")}\n\nHarga sudah termasuk sertifikat. Tersedia skema Syariah & KPR Bank.${getContactFooter()}`;
  }

  // Kategori: siap huni, kavling, inden
  if (/siap huni|siap_huni|ready| rumah jadi/.test(q)) {
    const filtered = PROPS.filter((p) => p.category === "siap_huni");
    if (filtered.length > 0) {
      const lines = filtered.map((p) => {
        const ci = getCheapestInstallment(p);
        return `• **${p.name}** — Tipe ${p.type}, Rp ${formatRp(p.price)}, cicilan mulai Rp ${formatRp(ci.monthly)}/bln`;
      });
      return `🏠 **Properti Siap Huni:**\n\n${lines.join("\n")}${getContactFooter()}`;
    }
    return `Saat ini belum ada properti Siap Huni yang tersedia.${getContactFooter()}`;
  }

  if (/kavling/.test(q)) {
    const filtered = PROPS.filter((p) => p.category === "kavling");
    if (filtered.length > 0) {
      const lines = filtered.map((p) => {
        const ci = getCheapestInstallment(p);
        return `• **${p.name}** — Tipe ${p.type}, Rp ${formatRp(p.price)}, cicilan mulai Rp ${formatRp(ci.monthly)}/bln`;
      });
      return `🏗️ **Properti Kavling:**\n\n${lines.join("\n")}${getContactFooter()}`;
    }
    return `Saat ini belum ada properti Kavling yang tersedia.${getContactFooter()}`;
  }

  if (/inden|indent|pre.?sale/.test(q)) {
    const filtered = PROPS.filter((p) => p.category === "inden");
    if (filtered.length > 0) {
      const lines = filtered.map((p) => {
        const ci = getCheapestInstallment(p);
        return `• **${p.name}** — Tipe ${p.type}, Rp ${formatRp(p.price)}, cicilan mulai Rp ${formatRp(ci.monthly)}/bln`;
      });
      return `📋 **Properti Inden:**\n\n${lines.join("\n")}${getContactFooter()}`;
    }
    return `Saat ini belum ada properti Inden yang tersedia.${getContactFooter()}`;
  }

  // DP / uang muka
  if (/^(dp|uang muka|down payment)$/.test(q) || q.length < 5 && /dp/.test(q)) {
    return `💰 **Uang Muka (DP):**\n\n• DP mulai dari **10%** (KPR) / **30%** (Syariah)\n• Pilihan DP bervariasi tergantung tipe\n• Bisa dicicil juga setelah DP${getContactFooter()}`;
  }

  // Tenor
  if (/tenor|waktu|durasi|jangka|berapa tahun|berapa lama/.test(q)) {
    return `📅 **Tenor Cicilan:**\n\n• **Syariah:** 1–7 tahun (cicilan FLAT)\n• **KPR Bank:** 5–25 tahun (angsuran kompetitif)\n• Tanpa denda, tanpa penalti pelunasan awal${getContactFooter()}`;
  }

  // Thank you
  if (/terima kasih|makasih|thanks|thank you/.test(q)) {
    return `Sama-sama! 😊 Senang bisa membantu.\n\nJika ada pertanyaan lain, jangan ragu untuk bertanya ya.${getContactFooter()}`;
  }

  // Yes/no / short responses
  if (/^(ya|y|ok|oke|siap|sip|mantap|bagus|boleh)$/.test(q)) {
    return `Baik! 🙏 Ada yang ingin ditanyakan lebih lanjut?${getContactFooter()}`;
  }

  if (/^(tidak|ga|gak|engga|nggak)$/.test(q)) {
    return `Baik, tidak masalah! 😊 Jika suatu saat Anda butuh informasi, jangan ragu untuk chat saya kembali.${getContactFooter()}`;
  }

  // Default fallback
  return `Terima kasih atas pertanyaan Anda! Untuk informasi lebih detail, silakan tanyakan hal-hal berikut:\n\n• "Daftar properti" — melihat semua unit\n• "Rumah termurah" — unit paling terjangkau\n• "Cicilan" — simulasi cicilan\n• "Lokasi" — info lokasi\n• "Syariah" — skema pembayaran\n• "Keunggulan" — fasilitas & kelebihan\n• "Siap Huni" / "Kavling" / "Inden" — per kategori\n\nAtau hubungi langsung tim marketing kami untuk konsultasi gratis!${getContactFooter()}`;
}

/* ───────────────────────── API HANDLER ───────────────────────── */

export async function POST(req: NextRequest) {
  try {
    const { message, sessionId } = await req.json();

    // Refresh data cache
    await refreshData();

    if (!message || typeof message !== "string") {
      return NextResponse.json(
        { response: `Maaf, pesan tidak valid. Silakan coba lagi.${getContactFooter()}` },
        { status: 200 }
      );
    }

    // Rule-based response only
    const aiResponse = fallbackResponse(message);

    // Ensure contact info is appended
    const response = aiResponse.includes(cachedContactPhone) ? aiResponse : aiResponse + getContactFooter();

    return NextResponse.json({ response });
  } catch (error: any) {
    console.error("Chatbot API fatal error:", error);
    const fallback = fallbackResponse("umum");
    return NextResponse.json({ response: fallback }, { status: 200 });
  }
}
