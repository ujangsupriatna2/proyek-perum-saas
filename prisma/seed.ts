import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const db = new PrismaClient();

// ════════════════════════════════════════════════════════════
//  TYPES
// ════════════════════════════════════════════════════════════

type AdminRole = "superadmin" | "admin";

interface AdminSeed {
  name: string;
  email: string;
  password: string;
  role: AdminRole;
  mitraSlug?: string; // link to a mitra; omit = null (superadmin)
}

interface PropertySeed {
  mitraSlug: string;
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
  financingTypes: string;
  dpOptions: string;
  tenorOptions: string;
  installments: string;
  syariahMargin: number;
  kprDpOptions: string;
  kprTenorOptions: string;
  kprInstallments: string;
  kprInterestRate: number;
  kprInterestType: string;
  videoUrl: string;
  isFeatured: boolean;
}

interface TestimonialSeed {
  mitraSlug: string;
  name: string;
  role: string;
  text: string;
  rating: number;
}

interface BlogPostSeed {
  mitraSlug: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
  author: string;
  published: boolean;
  readTime: string;
}

interface GalleryItemSeed {
  mitraSlug: string;
  title: string;
  category: string;
  image: string;
  description: string;
  sortOrder: number;
}

interface BankSeed {
  mitraSlug: string;
  name: string;
  description: string;
  image: string;
  sortOrder: number;
  isActive: boolean;
}

interface SettingSeed {
  mitraSlug: string;
  key: string;
  value: string;
  label: string;
  group: string;
}

// ════════════════════════════════════════════════════════════
//  MITRA DATA
// ════════════════════════════════════════════════════════════

const MITRA_DATA = [
  {
    name: "Bandung Raya Residence",
    slug: "bandung-raya-residence",
    subdomain: "brr",
    logo: "/images/logo-brr.png",
    description:
      "Perumahan modern terkemuka di kawasan Bandung dengan konsep hunian asri, aman, dan terjangkau. Menyediakan berbagai tipe rumah dari tipe 21 hingga tipe 45 dengan pembiayaan syariah dan KPR.",
    address: "Bandung, Jawa Barat",
    phone: "0812-8965-6707",
    email: "info@brr.co.id",
    isActive: true,
  },
  {
    name: "Cimahi Green Valley",
    slug: "cimahi-green-valley",
    subdomain: "cgv",
    logo: "/images/logo-cgv.png",
    description:
      "Kawasan hunian hijau di Cimahi dengan konsep eco-living. Lingkungan asri dikelilingi pepohonan dan taman, cocok untuk keluarga yang mendambakan keseimbangan hidup dengan alam.",
    address: "Cimahi, Jawa Barat",
    phone: "0813-1234-5678",
    email: "info@cgv.co.id",
    isActive: true,
  },
  {
    name: "Sumedang Hills",
    slug: "sumedang-hills",
    subdomain: "sh",
    logo: "/images/logo-sh.png",
    description:
      "Perumahan premium di kawasan pegunungan Sumedang dengan pemandangan indah dan udara segar. Ideal untuk investasi maupun hunian keluarga.",
    address: "Sumedang, Jawa Barat",
    phone: "0821-9876-5432",
    email: "info@sumedanghills.co.id",
    isActive: true,
  },
];

// ════════════════════════════════════════════════════════════
//  ADMIN DATA
// ════════════════════════════════════════════════════════════

const ADMINS_DATA: AdminSeed[] = [
  {
    name: "Super Admin",
    email: "admin@brr.co.id",
    password: "admin123",
    role: "superadmin",
    // mitraSlug omitted → mitraId = null (can access all)
  },
  {
    name: "Marketing BRR",
    email: "marketing@brr.co.id",
    password: "marketing123",
    role: "admin",
    mitraSlug: "bandung-raya-residence",
  },
  {
    name: "Admin CGV",
    email: "admin@cgv.co.id",
    password: "admin123",
    role: "admin",
    mitraSlug: "cimahi-green-valley",
  },
];

// ════════════════════════════════════════════════════════════
//  PROPERTIES — Bandung Raya Residence (8 units)
// ════════════════════════════════════════════════════════════

const BRR_PROPERTIES: Omit<PropertySeed, "mitraSlug">[] = [
  {
    name: "Tipe 21 Majapahit",
    slug: "tipe-21-majapahit",
    type: "Type 21/60",
    category: "siap_huni",
    price: 150000000,
    location: "Bandung Raya Residence",
    bedrooms: 1,
    bathrooms: 1,
    landArea: 60,
    buildingArea: 21,
    status: "available",
    description:
      "Rumah tipe 21 dengan desain modern minimalis. Cocok untuk pasangan muda atau single yang baru mulai investasi properti. Dilengkapi dengan 1 kamar tidur, 1 kamar mandi, dan carport. Lokasi strategis dekat dengan fasilitas umum.",
    features: '["Carport","Taman Depan","Listrik 1300W","Air PDAM","Dinding Bata Ringan","Lantai Keramik","Plafon PVC","Pintu Panel","Jendela Aluminium"]',
    images: '["/images/properties/type-21.png","/images/properties/majapahit.png","/images/properties/majapahit_detail.png"]',
    tag: "Best Seller",
    financingTypes: '["syariah","kpr"]',
    dpOptions: "[30,35,40,45,50]",
    tenorOptions: "[1,2,3,4,5,7,10]",
    installments: JSON.stringify({
      "30|1": 11500000,
      "30|3": 4200000,
      "30|5": 2750000,
      "30|7": 2100000,
      "30|10": 1550000,
      "40|1": 9900000,
      "40|3": 3600000,
      "40|5": 2350000,
      "40|7": 1800000,
      "50|1": 8200000,
      "50|3": 3000000,
      "50|5": 1950000,
    }),
    syariahMargin: 15,
    kprDpOptions: "[0,10,15,20,25,30]",
    kprTenorOptions: "[5,10,15,20,25]",
    kprInstallments: JSON.stringify({
      "0|5": 3200000,
      "0|10": 1900000,
      "10|10": 1650000,
      "20|10": 1400000,
      "20|15": 1050000,
      "30|10": 1150000,
      "30|15": 850000,
    }),
    kprInterestRate: 7.5,
    kprInterestType: "annuity",
    videoUrl: "",
    isFeatured: true,
  },
  {
    name: "Tipe 36 Sentul D33",
    slug: "tipe-36-sentul-d33",
    type: "Type 36/72",
    category: "inden",
    price: 299000000,
    location: "Bandung Raya Residence",
    bedrooms: 2,
    bathrooms: 1,
    landArea: 72,
    buildingArea: 36,
    status: "available",
    description:
      "Rumah tipe 36 dengan 2 kamar tidur, ideal untuk keluarga kecil. Desain modern dengan taman depan dan belakang. Dilengkapi kitchen set, instalasi AC, dan carport. Cluster dengan keamanan 24 jam.",
    features: '["2 Kamar Tidur","Carport","Taman Depan & Belakang","Kitchen Set","Instalasi AC","Listrik 2200W","Air PDAM","Dinding Bata Ringan","Lantai Granit 60x60","Plafon Gypsum","Pintu Panel Solid","Jendela Aluminium"]',
    images: '["/images/properties/type-36.png","/images/properties/sentul_d33.png","/images/properties/sentul_d33_detail.png"]',
    tag: "Promo",
    financingTypes: '["syariah","kpr"]',
    dpOptions: "[30,35,40,45,50]",
    tenorOptions: "[1,2,3,4,5,7,10,15]",
    installments: JSON.stringify({
      "30|1": 22750000,
      "30|3": 8200000,
      "30|5": 5300000,
      "30|7": 4100000,
      "30|10": 3050000,
      "30|15": 2200000,
      "40|1": 19500000,
      "40|3": 7000000,
      "40|5": 4550000,
      "40|7": 3500000,
      "50|1": 16200000,
      "50|3": 5900000,
      "50|5": 3800000,
    }),
    syariahMargin: 15,
    kprDpOptions: "[0,10,15,20,25,30]",
    kprTenorOptions: "[5,10,15,20,25]",
    kprInstallments: JSON.stringify({
      "0|5": 6300000,
      "0|10": 3700000,
      "10|10": 3250000,
      "20|10": 2750000,
      "20|15": 2050000,
      "30|10": 2250000,
      "30|15": 1700000,
    }),
    kprInterestRate: 7.5,
    kprInterestType: "annuity",
    videoUrl: "",
    isFeatured: true,
  },
  {
    name: "Tipe 40 Belanda",
    slug: "tipe-40-belanda",
    type: "Type 40/90",
    category: "siap_huni",
    price: 450000000,
    location: "Bandung Raya Residence",
    bedrooms: 2,
    bathrooms: 1,
    landArea: 90,
    buildingArea: 40,
    status: "available",
    description:
      "Rumah tipe 40 dengan desain klasik Belanda yang elegan. 2 kamar tidur luas dengan taman yang asri. Finishing premium dengan material berkualitas tinggi. Lingkungan cluster yang aman dan nyaman untuk keluarga.",
    features: '["2 Kamar Tidur","Carport 1 Mobil","Taman Luas","Kitchen Set Premium","Instalasi AC 2 Unit","Listrik 2200W","Air PDAM","Dinding Double Brick","Lantai Granit 60x60","Plafon Gypsum Board","Pintu Panel Solid Mahoni","Jendela Kayu Klasik","Canopy BESI"]',
    images: '["/images/properties/belanda.png","/images/properties/classic-belanda.png","/images/properties/belanda_detail.png"]',
    tag: "Premium",
    financingTypes: '["syariah","kpr"]',
    dpOptions: "[30,35,40,45,50]",
    tenorOptions: "[1,2,3,4,5,7,10,15,20]",
    installments: JSON.stringify({
      "30|1": 34200000,
      "30|3": 12400000,
      "30|5": 8000000,
      "30|7": 6200000,
      "30|10": 4600000,
      "30|15": 3350000,
      "30|20": 2700000,
      "40|1": 29300000,
      "40|3": 10600000,
      "40|5": 6900000,
      "40|7": 5300000,
      "50|1": 24400000,
      "50|3": 8800000,
      "50|5": 5700000,
    }),
    syariahMargin: 15,
    kprDpOptions: "[0,10,15,20,25,30]",
    kprTenorOptions: "[5,10,15,20,25]",
    kprInstallments: JSON.stringify({
      "0|5": 9500000,
      "0|10": 5600000,
      "10|10": 4900000,
      "20|10": 4150000,
      "20|15": 3100000,
      "30|10": 3400000,
      "30|15": 2550000,
    }),
    kprInterestRate: 7.5,
    kprInterestType: "annuity",
    videoUrl: "",
    isFeatured: true,
  },
  {
    name: "Tipe 45 Sentul B2",
    slug: "tipe-45-sentul-b2",
    type: "Type 45/84",
    category: "inden",
    price: 520000000,
    location: "Bandung Raya Residence",
    bedrooms: 2,
    bathrooms: 2,
    landArea: 84,
    buildingArea: 45,
    status: "available",
    description:
      "Rumah tipe 45 dengan 2 kamar tidur dan 2 kamar mandi. Desain modern minimalis yang elegan. Dilengkapi dengan ruang keluarga luas, kitchen set, dan taman. Cocok untuk keluarga yang menginginkan kenyamanan maksimal.",
    features: '["2 Kamar Tidur","2 Kamar Mandi","Carport 1 Mobil","Taman","Ruang Keluarga Luas","Kitchen Set","Instalasi AC","Listrik 2200W","Air PDAM","Dinding Bata Ringan","Lantai Granit 60x60","Plafon Gypsum","Pintu Panel","Jendela Aluminium","Water Heater"]',
    images: '["/images/properties/type-45.png","/images/properties/type45.png","/images/properties/sentul_b2.png","/images/properties/sentul_b2_detail.png","/images/properties/type45_detail.png"]',
    tag: "",
    financingTypes: '["syariah","kpr"]',
    dpOptions: "[30,35,40,45,50]",
    tenorOptions: "[1,2,3,4,5,7,10,15,20]",
    installments: JSON.stringify({
      "30|1": 39500000,
      "30|3": 14300000,
      "30|5": 9300000,
      "30|7": 7150000,
      "30|10": 5300000,
      "30|15": 3850000,
      "30|20": 3100000,
      "40|1": 33800000,
      "40|3": 12200000,
      "40|5": 8000000,
      "50|1": 28100000,
      "50|3": 10200000,
      "50|5": 6600000,
    }),
    syariahMargin: 15,
    kprDpOptions: "[0,10,15,20,25,30]",
    kprTenorOptions: "[5,10,15,20,25]",
    kprInstallments: JSON.stringify({
      "0|5": 11000000,
      "0|10": 6500000,
      "10|10": 5700000,
      "20|10": 4800000,
      "20|15": 3600000,
      "30|10": 3900000,
      "30|15": 2950000,
    }),
    kprInterestRate: 7.5,
    kprInterestType: "annuity",
    videoUrl: "",
    isFeatured: false,
  },
  {
    name: "Tipe 30 TBA7",
    slug: "tipe-30-tba7",
    type: "Type 30/66",
    category: "proses_bangun",
    price: 225000000,
    location: "Bandung Raya Residence",
    bedrooms: 2,
    bathrooms: 1,
    landArea: 66,
    buildingArea: 30,
    status: "available",
    description:
      "Rumah tipe 30 sedang dalam proses pembangunan. 2 kamar tidur dengan desain compact namun fungsional. DP ringan bisa dicicil 6 bulan. Lokasi strategis di kawasan yang sedang berkembang pesat.",
    features: '["2 Kamar Tidur","Carport","Taman Depan","Listrik 1300W","Air PDAM","Dinding Bata Ringan","Lantai Keramik","Plafon PVC","Pintu Panel","Jendela Aluminium"]',
    images: '["/images/properties/tba7.png","/images/properties/tba7_detail.png"]',
    tag: "DP Ringan",
    financingTypes: '["syariah"]',
    dpOptions: "[20,25,30,35,40]",
    tenorOptions: "[1,2,3,4,5,7,10]",
    installments: JSON.stringify({
      "20|1": 19100000,
      "20|3": 6900000,
      "20|5": 4500000,
      "20|7": 3500000,
      "20|10": 2600000,
      "30|1": 16700000,
      "30|3": 6000000,
      "30|5": 3900000,
      "30|7": 3050000,
      "30|10": 2250000,
    }),
    syariahMargin: 12,
    kprDpOptions: "[0,10,15,20,25,30]",
    kprTenorOptions: "[5,10,15,20,25]",
    kprInstallments: JSON.stringify({}),
    kprInterestRate: 7.5,
    kprInterestType: "annuity",
    videoUrl: "",
    isFeatured: false,
  },
  {
    name: "Tipe 28 E9",
    slug: "tipe-28-e9",
    type: "Type 28/60",
    category: "siap_huni",
    price: 198000000,
    location: "Bandung Raya Residence",
    bedrooms: 2,
    bathrooms: 1,
    landArea: 60,
    buildingArea: 28,
    status: "available",
    description:
      "Rumah tipe 28 siap huni. Desain compact modern dengan 2 kamar tidur. Cocok untuk keluarga muda yang baru memulai. Lingkungan aman dengan one gate system dan security 24 jam.",
    features: '["2 Kamar Tidur","Carport","Taman Depan","Listrik 1300W","Air PDAM","Dinding Bata Ringan","Lantai Keramik","Plafon PVC","Pintu Panel","Jendela Aluminium"]',
    images: '["/images/properties/e9.png","/images/properties/e9_detail.png"]',
    tag: "",
    financingTypes: '["syariah","kpr"]',
    dpOptions: "[30,35,40,45,50]",
    tenorOptions: "[1,2,3,4,5,7,10]",
    installments: JSON.stringify({
      "30|1": 15050000,
      "30|3": 5450000,
      "30|5": 3500000,
      "30|7": 2700000,
      "30|10": 2000000,
      "40|1": 12900000,
      "40|3": 4650000,
      "40|5": 3000000,
      "50|1": 10700000,
      "50|3": 3900000,
      "50|5": 2550000,
    }),
    syariahMargin: 15,
    kprDpOptions: "[0,10,15,20,25,30]",
    kprTenorOptions: "[5,10,15,20,25]",
    kprInstallments: JSON.stringify({
      "0|5": 4200000,
      "0|10": 2500000,
      "10|10": 2200000,
      "20|10": 1850000,
      "30|10": 1500000,
    }),
    kprInterestRate: 7.5,
    kprInterestType: "annuity",
    videoUrl: "",
    isFeatured: false,
  },
  {
    name: "Tipe 36 Manjah",
    slug: "tipe-36-manjah",
    type: "Type 36/78",
    category: "siap_huni",
    price: 320000000,
    location: "Bandung Raya Residence",
    bedrooms: 2,
    bathrooms: 1,
    landArea: 78,
    buildingArea: 36,
    status: "available",
    description:
      "Rumah tipe 36 siap huni dengan lahan lebih luas 78m². 2 kamar tidur dengan taman yang asri dan luas. Lingkungan yang sudah tertata dengan baik, dekat masjid dan taman bermain anak.",
    features: '["2 Kamar Tidur","Carport","Taman Luas","Kitchen Set","Instalasi AC","Listrik 2200W","Air PDAM","Dinding Bata Ringan","Lantai Granit 60x60","Plafon Gypsum","Pintu Panel","Jendela Aluminium"]',
    images: '["/images/properties/manjah.png","/images/properties/manjah_detail.png"]',
    tag: "Siap Huni",
    financingTypes: '["syariah","kpr"]',
    dpOptions: "[30,35,40,45,50]",
    tenorOptions: "[1,2,3,4,5,7,10,15]",
    installments: JSON.stringify({
      "30|1": 24300000,
      "30|3": 8800000,
      "30|5": 5700000,
      "30|7": 4400000,
      "30|10": 3250000,
      "30|15": 2350000,
      "40|1": 20800000,
      "40|3": 7500000,
      "40|5": 4900000,
      "50|1": 17300000,
      "50|3": 6300000,
      "50|5": 4100000,
    }),
    syariahMargin: 15,
    kprDpOptions: "[0,10,15,20,25,30]",
    kprTenorOptions: "[5,10,15,20,25]",
    kprInstallments: JSON.stringify({
      "0|5": 6800000,
      "0|10": 4000000,
      "10|10": 3500000,
      "20|10": 2950000,
      "20|15": 2200000,
      "30|10": 2400000,
      "30|15": 1800000,
    }),
    kprInterestRate: 7.5,
    kprInterestType: "annuity",
    videoUrl: "",
    isFeatured: false,
  },
  {
    name: "Tipe 30 D39",
    slug: "tipe-30-d39",
    type: "Type 30/72",
    category: "inden",
    price: 250000000,
    location: "Bandung Raya Residence",
    bedrooms: 2,
    bathrooms: 1,
    landArea: 72,
    buildingArea: 30,
    status: "available",
    description:
      "Rumah tipe 30 inden dengan lahan 72m². Investasi cerdas dengan harga masih terjangkau. Desain modern minimalis, 2 kamar tidur. Lokasi premium di kawasan hunian berkembang. DP bisa dicicil hingga 6 bulan.",
    features: '["2 Kamar Tidur","Carport","Taman Depan","Listrik 1300W","Air PDAM","Dinding Bata Ringan","Lantai Keramik","Plafon PVC","Pintu Panel","Jendela Aluminium"]',
    images: '["/images/properties/d39.png","/images/properties/d39_detail.png"]',
    tag: "Investasi",
    financingTypes: '["syariah"]',
    dpOptions: "[20,25,30,35,40,45,50]",
    tenorOptions: "[1,2,3,4,5,7,10]",
    installments: JSON.stringify({
      "20|1": 21200000,
      "20|3": 7700000,
      "20|5": 5000000,
      "20|7": 3850000,
      "20|10": 2850000,
      "30|1": 18500000,
      "30|3": 6700000,
      "30|5": 4300000,
      "30|7": 3350000,
      "30|10": 2500000,
      "40|1": 15800000,
      "40|3": 5700000,
      "40|5": 3700000,
      "50|1": 13100000,
      "50|3": 4800000,
      "50|5": 3100000,
    }),
    syariahMargin: 13,
    kprDpOptions: "[0,10,15,20,25,30]",
    kprTenorOptions: "[5,10,15,20,25]",
    kprInstallments: JSON.stringify({}),
    kprInterestRate: 7.5,
    kprInterestType: "annuity",
    videoUrl: "",
    isFeatured: false,
  },
];

// ──── Properties — Cimahi Green Valley (2 units) ────

const CGV_PROPERTIES: Omit<PropertySeed, "mitraSlug">[] = [
  {
    name: "Tipe 38 Green A1",
    slug: "tipe-38-green-a1",
    type: "Type 38/72",
    category: "siap_huni",
    price: 285000000,
    location: "Cimahi Green Valley",
    bedrooms: 2,
    bathrooms: 1,
    landArea: 72,
    buildingArea: 38,
    status: "available",
    description:
      "Rumah tipe 38 dengan konsep eco-living. Desain tropis modern dengan ventilasi silang yang optimal. Taman hijau di depan dan belakang rumah. Lingkungan asri dikelilingi pepohonan rindang. Ideal untuk keluarga yang mendambakan hidup harmonis dengan alam.",
    features: '["2 Kamar Tidur","Carport","Taman Depan & Belakang","Kitchen Set","Instalasi AC","Listrik 2200W","Air PDAM","Ventilasi Silang","Lantai Granit 60x60","Plafon Gypsum","Pintu Panel","Jendela Aluminium","Solar Water Heater"]',
    images: '["/images/properties/type-38-green.png","/images/properties/green-a1.png","/images/properties/green-a1_detail.png"]',
    tag: "Eco Living",
    financingTypes: '["syariah","kpr"]',
    dpOptions: "[30,35,40,45,50]",
    tenorOptions: "[1,2,3,5,7,10,15]",
    installments: JSON.stringify({
      "30|1": 21700000,
      "30|3": 7800000,
      "30|5": 5100000,
      "30|7": 3900000,
      "30|10": 2900000,
      "30|15": 2100000,
      "40|1": 18600000,
      "40|3": 6700000,
      "40|5": 4400000,
      "50|1": 15500000,
      "50|3": 5600000,
      "50|5": 3600000,
    }),
    syariahMargin: 14,
    kprDpOptions: "[0,10,15,20,25,30]",
    kprTenorOptions: "[5,10,15,20,25]",
    kprInstallments: JSON.stringify({
      "0|5": 6000000,
      "0|10": 3500000,
      "10|10": 3100000,
      "20|10": 2600000,
      "30|10": 2100000,
    }),
    kprInterestRate: 7.5,
    kprInterestType: "annuity",
    videoUrl: "",
    isFeatured: true,
  },
  {
    name: "Tipe 50 Valley B2",
    slug: "tipe-50-valley-b2",
    type: "Type 50/100",
    category: "inden",
    price: 480000000,
    location: "Cimahi Green Valley",
    bedrooms: 3,
    bathrooms: 2,
    landArea: 100,
    buildingArea: 50,
    status: "available",
    description:
      "Rumah tipe 50 premium di kawasan valley dengan pemandangan perbukitan. 3 kamar tidur dan 2 kamar mandi. Desain kontemporer dengan material ramah lingkungan. Rooftop garden dan ruang keluarga luas. Sertifikat SHM pecah per unit.",
    features: '["3 Kamar Tidur","2 Kamar Mandi","Carport 2 Mobil","Taman Luas","Rooftop Garden","Ruang Keluarga Luas","Kitchen Set Premium","Instalasi AC 3 Unit","Listrik 3500W","Air PDAM","Dinding Double Brick","Lantai Granit 60x60","Plafon Gypsum Board","Pintu Panel Solid","Jendela Aluminium Expansi","Smart Home System"]',
    images: '["/images/properties/type-50-valley.png","/images/properties/valley-b2.png","/images/properties/valley-b2_detail.png"]',
    tag: "Premium Valley",
    financingTypes: '["syariah","kpr"]',
    dpOptions: "[30,35,40,45,50]",
    tenorOptions: "[1,2,3,5,7,10,15,20]",
    installments: JSON.stringify({
      "30|1": 36500000,
      "30|3": 13100000,
      "30|5": 8500000,
      "30|7": 6600000,
      "30|10": 4900000,
      "30|15": 3550000,
      "30|20": 2850000,
      "40|1": 31300000,
      "40|3": 11300000,
      "40|5": 7300000,
      "50|1": 26000000,
      "50|3": 9400000,
      "50|5": 6100000,
    }),
    syariahMargin: 14,
    kprDpOptions: "[0,10,15,20,25,30]",
    kprTenorOptions: "[5,10,15,20,25]",
    kprInstallments: JSON.stringify({
      "0|5": 10000000,
      "0|10": 5900000,
      "10|10": 5200000,
      "20|10": 4400000,
      "20|15": 3300000,
      "30|10": 3600000,
      "30|15": 2700000,
    }),
    kprInterestRate: 7.5,
    kprInterestType: "annuity",
    videoUrl: "",
    isFeatured: true,
  },
];

// ════════════════════════════════════════════════════════════
//  TESTIMONIALS — Bandung Raya Residence (20)
// ════════════════════════════════════════════════════════════

const BRR_TESTIMONIALS: Omit<TestimonialSeed, "mitraSlug">[] = [
  { name: "Ahmad Fauzi", role: "Penghuni Tipe Anggrek A1", text: "Proses pembelian rumah sangat mudah dan transparan. Tim marketing ramah dan selalu siap membantu. Cicilan syariah membuat hati tenang tanpa riba.", rating: 5 },
  { name: "Siti Nurhaliza", role: "Penghuni Tipe Melati B3", text: "Lingkungan yang asri dan aman untuk keluarga. Anak-anak bisa bermain dengan nyaman. Sangat puas dengan kualitas bangunan rumah.", rating: 5 },
  { name: "Budi Santoso", role: "Penghuni Type Mawar C2", text: "Harga sangat kompetitif dibanding perumahan lain di sekitar Bandung. DP ringan dan proses KPR syariah cepat. Recommended!", rating: 5 },
  { name: "Dewi Lestari", role: "Penghuni Tipe Dahlia A5", text: "Sertifikat SHM sudah pecah per unit, jadi sangat aman. Lokasi strategis dekat dengan akses tol dan fasilitas umum.", rating: 5 },
  { name: "Rizky Pratama", role: "Penghuni Tipe Anggrek B1", text: "Infrastruktur perumahan sangat bagus, jalan lebar, drainase tertata rapi. Banjir? Tidak pernah selama 2 tahun tinggal di sini.", rating: 5 },
  { name: "Anisa Rahma", role: "Penghuni Tipe Melati A2", text: "Komunitas warga sangat harmonis. Ada kegiatan rutin seperti pengajian dan arisan. Betah banget tinggal di sini!", rating: 5 },
  { name: "Hendra Wijaya", role: "Penghuni Tipe Mawar A1", text: "Proses akad cepat, hanya 2 minggu dari booking fee. Tim BRR sangat profesional dan kooperatif dengan bank syariah.", rating: 4 },
  { name: "Rina Marlina", role: "Penghuni Tipe Dahlia B4", text: "Desain rumah modern minimalis sesuai dengan selera millenial. Finishing rapi dan material berkualitas tinggi.", rating: 5 },
  { name: "Dedi Mulyadi", role: "Penghuni Tipe Anggrek C3", text: "Investasi properti terbaik yang pernah saya lakukan. Harga rumah sudah naik 30% sejak saya beli 2 tahun lalu.", rating: 5 },
  { name: "Lina Susanti", role: "Penghuni Tipe Melati C1", text: "Keamanan 24 jam dengan CCTV dan security. Sangat nyaman untuk keluarga dengan anak kecil.", rating: 5 },
  { name: "Wahyu Hidayat", role: "Penghuni Tipe Mawar B2", text: "Akses ke pusat kota Bandung hanya 15 menit. Dekat dengan sekolah, rumah sakit, dan pusat perbelanjaan.", rating: 4 },
  { name: "Fitri Handayani", role: "Penghuni Tipe Dahlia A3", text: "Taman dan ruang terbuka hijau yang luas. Udara segar setiap pagi. Perfect untuk quality time keluarga.", rating: 5 },
  { name: "Agus Setiawan", role: "Penghuni Tipe Anggrek A4", text: "Pembelian cash keras dapat diskon yang menarik. Saya berhemat puluhan juta dibanding beli di developer lain.", rating: 5 },
  { name: "Yuni Astuti", role: "Penghuni Tipe Melati B5", text: "Listrik underground dan air bersih 24 jam. Tidak pernah mati lampu atau kekurangan air. Sangat memuaskan.", rating: 5 },
  { name: "Irfan Maulana", role: "Penghuni Tipe Mawar C4", text: "DP bisa dicicil 6 bulan sangat membantu. Saya yang gaji UMR pun bisa punya rumah impian. Terima kasih BRR!", rating: 5 },
  { name: "Nita Puspita", role: "Penghuni Tipe Dahlia C2", text: "Rumah sudah termasuk instalasi AC, kitchen set, dan carport. Jadi tinggal bawa koper langsung huni.", rating: 5 },
  { name: "Joko Susilo", role: "Penghuni Tipe Anggrek B5", text: "After sales service sangat responsif. Ada kendala kecil langsung ditangani. Developer yang bertanggung jawab.", rating: 4 },
  { name: "Mega Putri", role: "Penghuni Tipe Melati A4", text: "Saya rekomendasikan BRR ke semua teman dan saudara. Kualitas bangunan premium tapi harga masih terjangkau.", rating: 5 },
  { name: "Dian Prasetyo", role: "Penghuni Tipe Mawar A3", text: "Cicilan flat tanpa naik selama tenor. Tidak seperti KPR konvensional yang bisa berubah-ubah. Sungguh syariah!", rating: 5 },
  { name: "Ratna Sari", role: "Penghuni Tipe Dahlia B1", text: "Perumahan yang benar-benar mengutamakan kenyamanan penghuni. Taman bermain anak, masjid, dan lapangan olahraga tersedia lengkap.", rating: 5 },
];

// ──── Testimonials — Cimahi Green Valley (3) ────

const CGV_TESTIMONIALS: Omit<TestimonialSeed, "mitraSlug">[] = [
  { name: "Dina Permata", role: "Penghuni Tipe 38 Green A1", text: "Konsep eco-living benar-benar terasa. Udara segar, banyak pohon, dan suara burung setiap pagi. Anak-anak jadi lebih sehat dan aktif bermain di luar.", rating: 5 },
  { name: "Ridwan Kamil", role: "Penghuni Tipe 50 Valley B2", text: "Lokasi di Cimahi sangat strategis, dekat akses tol dan pusat kota. Rumah dengan desain tropis yang sejuk. Cicilan syariah sangat membantu.", rating: 5 },
  { name: "Tina Susanti", role: "Calon Penghuni", text: "Sudah survei beberapa lokasi, dan Cimahi Green Valley paling cocok. Lingkungan hijau, keamanan baik, dan developer responsif.", rating: 4 },
];

// ════════════════════════════════════════════════════════════
//  BLOG POSTS — Bandung Raya Residence (5)
// ════════════════════════════════════════════════════════════

const BRR_BLOGS: Omit<BlogPostSeed, "mitraSlug">[] = [
  {
    title: "Tips Memilih Rumah Pertama untuk Keluarga Muda",
    slug: "tips-memilih-rumah-pertama",
    excerpt: "Panduan lengkap bagi keluarga muda yang ingin membeli rumah pertama. Dari menentukan budget hingga memilih lokasi strategis.",
    content: `<h2>Pendahuluan</h2>
<p>Membeli rumah pertama adalah salah satu keputusan finansial terbesar dalam hidup. Bagi keluarga muda, hal ini bisa terasa sangat menakutkan namun juga mendebarkan. Artikel ini akan membantu Anda membuat keputusan yang tepat.</p>

<h2>1. Tentukan Budget dengan Realistis</h2>
<p>Langkah pertama adalah menentukan berapa yang mampu Anda bayar. Perhitungan umumnya, cicilan rumah sebaiknya tidak lebih dari 30% dari penghasilan bulanan. Jangan lupa pertimbangkan biaya DP, notaris, dan biaya lainnya.</p>

<h2>2. Pilih Lokasi yang Strategis</h2>
<p>Lokasi adalah faktor kunci yang menentukan nilai properti. Pertimbangkan:</p>
<ul>
<li>Jarak ke tempat kerja</li>
<li>Dekat dengan fasilitas pendidikan</li>
<li>Akses ke rumah sakit dan pusat kesehatan</li>
<li>Dekat dengan pusat perbelanjaan</li>
<li>Akses tol dan transportasi umum</li>
</ul>

<h2>3. Perhatikan Legalitas</h2>
<p>Pastikan rumah yang Anda beli memiliki legalitas yang jelas. Pilih developer yang terpercaya dengan sertifikat SHM yang sudah pecah per unit. Ini memberikan keamanan hukum bagi Anda sebagai pemilik.</p>

<h2>4. Pertimbangkan Skema Pembiayaan</h2>
<p>Ada dua opsi utama pembiayaan:</p>
<ul>
<li><strong>KPR Syariah:</strong> Cicilan flat tanpa bunga, tenang tanpa riba</li>
<li><strong>KPR Konvensional:</strong> Bunga fluktuatif, bisa lebih murah di awal</li>
</ul>

<h2>Kesimpulan</h2>
<p>Membeli rumah pertama membutuhkan persiapan matang. Dengan perencanaan yang tepat, rumah impian bukan lagi sekadar impian. Bandung Raya Residence menyediakan berbagai tipe rumah yang sesuai untuk keluarga muda dengan cicilan yang terjangkau.</p>`,
    category: "Tips Properti",
    author: "Admin BRR",
    published: true,
    readTime: "5 menit",
  },
  {
    title: "Keuntungan KPR Syariah vs KPR Konvensional",
    slug: "keuntungan-kpr-syariah-vs-konvensional",
    excerpt: "Perbandingan mendalam antara KPR Syariah dan KPR Konvensional. Mana yang lebih cocok untuk Anda?",
    content: `<h2>KPR Syariah</h2>
<p>KPR Syariah menggunakan akad murabahah (jual beli) dengan margin yang sudah ditentukan di awal. Cicilan bersifat flat sepanjang tenor.</p>

<h3>Kelebihan:</h3>
<ul>
<li>Cicilan tetap (flat) selama tenor</li>
<li>Tanpa bunga (riba)</li>
<li>Tanpa denda pelunasan awal</li>
<li>Proses lebih transparan</li>
<li>Tenang secara finansial</li>
</ul>

<h2>KPR Konvensional</h2>
<p>KPR Konvensional menggunakan akad pinjaman dengan bunga yang bisa tetap atau mengambang.</p>

<h3>Kelebihan:</h3>
<ul>
<li>DP bisa lebih rendah (0-10%)</li>
<li>Tenor lebih panjang (hingga 25 tahun)</li>
<li>Bisa lebih murah di kondisi suku bunga rendah</li>
</ul>

<h2>Kesimpulan</h2>
<p>Untuk Anda yang menginginkan ketenangan dan kepastian, KPR Syariah adalah pilihan terbaik. Bandung Raya Residence bekerja sama dengan berbagai bank syariah ternama untuk memudahkan proses pembiayaan Anda.</p>`,
    category: "Finansial",
    author: "Admin BRR",
    published: true,
    readTime: "4 menit",
  },
  {
    title: "Mengapa Bandung Raya Residence Cocok untuk Investasi?",
    slug: "mengapa-brr-cocok-untuk-investasi",
    excerpt: "Analisis mengapa Bandung Raya Residence adalah pilihan investasi properti yang cerah dengan potensi capital gain tinggi.",
    content: `<h2>Lokasi Premium</h2>
<p>Terletak di kawasan Bandung yang terus berkembang, Bandung Raya Residence menawarkan lokasi premium dengan akses mudah ke pusat kota, tol, dan fasilitas umum.</p>

<h2>Harga Terjangkau, Nilai Tinggi</h2>
<p>Dibandingkan perumahan sejenis di area yang sama, BRR menawarkan harga yang sangat kompetitif. Dalam 2 tahun terakhir, harga properti di kawasan ini sudah naik rata-rata 30%.</p>

<h2>Infrastruktur Terintegrasi</h2>
<ul>
<li>Jalan lingkungan lebar</li>
<li>Drainase tertata rapi</li>
<li>Listrik underground</li>
<li>Air bersih 24 jam</li>
<li>Keamanan 24 jam</li>
</ul>

<h2>Fasilitas Lengkap</h2>
<p>Perumahan dilengkapi dengan masjid, taman bermain anak, lapangan olahraga, dan ruang terbuka hijau yang luas.</p>

<h2>Kesimpulan</h2>
<p>Investasi di Bandung Raya Residence adalah keputusan cerdas. Dengan harga mulai dari Rp 150 juta, Anda sudah bisa memiliki rumah di lokasi premium dengan potensi kenaikan nilai yang tinggi.</p>`,
    category: "Investasi",
    author: "Admin BRR",
    published: true,
    readTime: "4 menit",
  },
  {
    title: "Fasilitas Lengkap di Bandung Raya Residence",
    slug: "fasilitas-lengkap-bandung-raya-residence",
    excerpt: "Temukan berbagai fasilitas yang tersedia di kawasan Bandung Raya Residence untuk kenyamanan seluruh penghuni.",
    content: `<h2>Keamanan 24 Jam</h2>
<p>Sistem keamanan terintegrasi dengan CCTV, security patrol, dan one gate system menjadikan kawasan ini aman untuk seluruh penghuni.</p>

<h2>Masjid</h2>
<p>Masjid yang luas dan nyaman untuk ibadah sehari-hari dan kegiatan keagamaan warga.</p>

<h2>Taman & Ruang Terbuka Hijau</h2>
<p>Taman bermain anak, taman bunga, dan ruang terbuka hijau yang luas untuk refreshing dan olahraga.</p>

<h2>Lapangan Olahraga</h2>
<p>Lapangan futsal dan badminton tersedia untuk warga yang aktif berolahraga.</p>

<h2>Akses & Infrastruktur</h2>
<ul>
<li>Jalan lingkungan lebar 6 meter</li>
<li>Listrik underground PLN</li>
<li>Air bersih PDAM 24 jam</li>
<li>Drainase tertata</li>
<li>Akses mudah ke tol dan jalan utama</li>
</ul>`,
    category: "Fasilitas",
    author: "Admin BRR",
    published: true,
    readTime: "3 menit",
  },
  {
    title: "Proses Pembelian Rumah di BRR Step by Step",
    slug: "proses-pembelian-rumah-di-brr",
    excerpt: "Panduan langkah demi langkah cara membeli rumah di Bandung Raya Residence dari awal hingga serah terima kunci.",
    content: `<h2>Step 1: Konsultasi</h2>
<p>Hubungi tim marketing kami via WhatsApp atau kunjungi marketing office. Tim kami akan membantu Anda memilih tipe rumah yang sesuai dengan kebutuhan dan budget.</p>

<h2>Step 2: Survei Lokasi</h2>
<p>Jadwalkan kunjungan ke lokasi untuk melihat langsung lingkungan, tipe rumah, dan fasilitas yang tersedia.</p>

<h2>Step 3: Booking Fee</h2>
<p>Jika sudah yakin, bayar booking fee untuk mengunci unit. Booking fee bisa dicicil hingga 6 bulan.</p>

<h2>Step 4: Verifikasi & Akad</h2>
<p>Proses verifikasi data dan penandatanganan akad jual beli. Tim BRR akan membantu koordinasi dengan bank pilihan Anda.</p>

<h2>Step 5: Serah Terima</h2>
<p>Setelah pembangunan selesai dan cicilan DP lunas, dilakukan serah terima kunci. Rumah siap huni!</p>

<h2>Step 6: After Sales</h2>
<p>Tim after sales siap membantu jika ada kendala. Garansi maintenance 12 bulan untuk kenyamanan Anda.</p>`,
    category: "Panduan",
    author: "Admin BRR",
    published: false,
    readTime: "3 menit",
  },
];

// ──── Blog Posts — Cimahi Green Valley (1) ────

const CGV_BLOGS: Omit<BlogPostSeed, "mitraSlug">[] = [
  {
    title: "Mengapa Cimahi Green Valley Cocok untuk Keluarga Hijau?",
    slug: "mengapa-cgv-cocok-untuk-keluarga",
    excerpt: "Konsep eco-living yang diusung Cimahi Green Valley menjadikannya pilihan ideal bagi keluarga yang peduli lingkungan dan kesehatan.",
    content: `<h2>Konsep Eco-Living</h2>
<p>Cimahi Green Valley menghadirkan konsep hunian yang selaras dengan alam. Setiap unit dirancang dengan ventilasi silang optimal, taman hijau, dan material ramah lingkungan.</p>

<h2>Udara Segar Setiap Hari</h2>
<p>Kawasan ini dikelilingi oleh ratusan pohon dan taman yang terawat. Udara di sini jauh lebih bersih dibanding kawasan perkotaan, cocok untuk tumbuh kembang anak.</p>

<h2>Fasilitas Hijau</h2>
<ul>
<li>Community garden untuk urban farming</li>
<li>Jogging track di antara pohon-pohon</li>
<li>Taman bermain anak dengan lantai rumput alami</li>
<li>Area composting terpadu</li>
</ul>

<h2>Investasi Masa Depan</h2>
<p>Tren hunian hijau terus meningkat. Investasi di Cimahi Green Valley bukan hanya untuk tempat tinggal, tetapi juga untuk masa depan yang lebih baik bagi generasi berikutnya.</p>

<h2>Kesimpulan</h2>
<p>Cimahi Green Valley adalah jawaban bagi keluarga yang ingin hidup lebih sehat dan bertanggung jawab terhadap lingkungan, tanpa mengorbankan kenyamanan modern.</p>`,
    category: "Tips Properti",
    author: "Admin CGV",
    published: true,
    readTime: "4 menit",
  },
];

// ════════════════════════════════════════════════════════════
//  GALLERY — Bandung Raya Residence (19)
// ════════════════════════════════════════════════════════════

const BRR_GALLERY: Omit<GalleryItemSeed, "mitraSlug">[] = [
  { title: "Gerbang Utama Bandung Raya Residence", category: "Fasilitas", image: "/images/properties/hero_cover.png", description: "Gerbang utama perumahan dengan keamanan 24 jam", sortOrder: 1 },
  { title: "Tipe 21 Majapahit - Tampak Depan", category: "Tipe 21", image: "/images/properties/type-21.png", description: "Desain modern minimalis untuk keluarga muda", sortOrder: 2 },
  { title: "Tipe 21 Majapahit - Interior", category: "Tipe 21", image: "/images/properties/majapahit.png", description: "Interior rumah tipe 21 yang fungsional", sortOrder: 3 },
  { title: "Tipe 36 Sentul D33 - Tampak Depan", category: "Tipe 36", image: "/images/properties/sentul_d33.png", description: "Rumah tipe 36 ideal untuk keluarga kecil", sortOrder: 4 },
  { title: "Tipe 36 Sentul D33 - Detail", category: "Tipe 36", image: "/images/properties/sentul_d33_detail.png", description: "Detail finishing rumah tipe 36", sortOrder: 5 },
  { title: "Tipe 40 Belanda - Tampak Depan", category: "Tipe 40", image: "/images/properties/belanda.png", description: "Desain klasik Belanda yang elegan", sortOrder: 6 },
  { title: "Tipe 40 Belanda - Klasik", category: "Tipe 40", image: "/images/properties/classic-belanda.png", description: "Nuansa klasik Belanda yang premium", sortOrder: 7 },
  { title: "Tipe 40 Belanda - Detail Interior", category: "Tipe 40", image: "/images/properties/belanda_detail.png", description: "Detail interior premium tipe 40", sortOrder: 8 },
  { title: "Tipe 45 Sentul B2 - Tampak Depan", category: "Tipe 45", image: "/images/properties/type45.png", description: "Rumah tipe 45 dengan 2 kamar mandi", sortOrder: 9 },
  { title: "Tipe 45 Sentul B2 - Cluster", category: "Tipe 45", image: "/images/properties/sentul_b2.png", description: "Lingkungan cluster tipe 45", sortOrder: 10 },
  { title: "Tipe 45 Sentul B2 - Detail", category: "Tipe 45", image: "/images/properties/sentul_b2_detail.png", description: "Detail rumah tipe 45", sortOrder: 11 },
  { title: "Tipe 30 TBA7 - Tampak Depan", category: "Tipe 30", image: "/images/properties/tba7.png", description: "Rumah tipe 30 dengan DP ringan", sortOrder: 12 },
  { title: "Tipe 30 TBA7 - Detail", category: "Tipe 30", image: "/images/properties/tba7_detail.png", description: "Detail finishing tipe 30", sortOrder: 13 },
  { title: "Tipe 28 E9 - Tampak Depan", category: "Tipe 28", image: "/images/properties/e9.png", description: "Rumah compact siap huni tipe 28", sortOrder: 14 },
  { title: "Tipe 28 E9 - Detail", category: "Tipe 28", image: "/images/properties/e9_detail.png", description: "Detail rumah tipe 28", sortOrder: 15 },
  { title: "Tipe 36 Manjah - Tampak Depan", category: "Tipe 36", image: "/images/properties/manjah.png", description: "Tipe 36 dengan lahan luas 78m²", sortOrder: 16 },
  { title: "Tipe 36 Manjah - Detail", category: "Tipe 36", image: "/images/properties/manjah_detail.png", description: "Detail rumah manjah", sortOrder: 17 },
  { title: "Tipe 30 D39 - Tampak Depan", category: "Tipe 30", image: "/images/properties/d39.png", description: "Tipe 30 untuk investasi cerdas", sortOrder: 18 },
  { title: "Tipe 30 D39 - Detail", category: "Tipe 30", image: "/images/properties/d39_detail.png", description: "Detail rumah tipe 30 D39", sortOrder: 19 },
];

// ──── Gallery — Cimahi Green Valley (3) ────

const CGV_GALLERY: Omit<GalleryItemSeed, "mitraSlug">[] = [
  { title: "Gerbang Utama Cimahi Green Valley", category: "Fasilitas", image: "/images/properties/hero_cover.png", description: "Gerbang utama kawasan eco-living dengan konsep hijau", sortOrder: 1 },
  { title: "Tipe 38 Green A1 - Tampak Depan", category: "Tipe 38", image: "/images/properties/type-38-green.png", description: "Rumah tropis modern dengan taman hijau", sortOrder: 2 },
  { title: "Tipe 50 Valley B2 - Tampak Depan", category: "Tipe 50", image: "/images/properties/type-50-valley.png", description: "Rumah premium dengan pemandangan perbukitan", sortOrder: 3 },
];

// ════════════════════════════════════════════════════════════
//  BANKS — Bandung Raya Residence (5)
// ════════════════════════════════════════════════════════════

const BRR_BANKS: Omit<BankSeed, "mitraSlug">[] = [
  { name: "Bank Syariah Indonesia (BSI)", description: "Bank syariah terbesar di Indonesia dengan produk KPR Syariah yang fleksibel.", image: "", sortOrder: 1, isActive: true },
  { name: "Bank Muamalat Indonesia", description: "Bank syariah pertama di Indonesia dengan layanan KPR iB Hasanah.", image: "", sortOrder: 2, isActive: true },
  { name: "Bank BCA Syariah", description: "Anak usaha BCA dengan produk KPR Syariah yang terpercaya.", image: "", sortOrder: 3, isActive: true },
  { name: "Bank Mega Syariah", description: "KPR Syariah dengan proses cepat dan cicilan ringan.", image: "", sortOrder: 4, isActive: true },
  { name: "BTN Syariah", description: "Bank Tabungan Negara Syariah, spesialis pembiayaan perumahan.", image: "", sortOrder: 5, isActive: true },
];

// ──── Banks — Cimahi Green Valley (2) ────

const CGV_BANKS: Omit<BankSeed, "mitraSlug">[] = [
  { name: "Bank Syariah Indonesia (BSI)", description: "Bank syariah terbesar di Indonesia. Mitra utama pembiayaan Cimahi Green Valley.", image: "", sortOrder: 1, isActive: true },
  { name: "Bank BCA Syariah", description: "Anak usaha BCA dengan produk KPR Syariah yang terpercaya dan proses cepat.", image: "", sortOrder: 2, isActive: true },
];

// ════════════════════════════════════════════════════════════
//  SETTINGS — Bandung Raya Residence
// ════════════════════════════════════════════════════════════

const BRR_SETTINGS: Omit<SettingSeed, "mitraSlug">[] = [
  { key: "company_name", value: "Bandung Raya Residence", label: "Nama Perusahaan", group: "company" },
  { key: "company_legal_name", value: "PT Bumi Sanggar Meubel", label: "Nama Legal Perusahaan", group: "company" },
  { key: "total_units_sold", value: "500", label: "Total Unit Terjual", group: "company" },
  { key: "logo_url", value: "/images/logo-brr.png", label: "URL Logo", group: "company" },
  { key: "hero_bg_image", value: "/images/properties/hero_cover.png", label: "Background Hero", group: "company" },
  { key: "location_bg_image", value: "/images/location.png", label: "Background Lokasi", group: "company" },
  { key: "page_banner_image", value: "/images/properties/hero_cover.png", label: "Banner Halaman", group: "company" },
  { key: "tentangkami_image", value: "/images/properties/hero_cover.png", label: "Gambar Tentang Kami", group: "company" },
  { key: "contact_phone", value: "0812-8965-6707", label: "Telepon", group: "contact" },
  { key: "contact_email", value: "info@brr.co.id", label: "Email", group: "contact" },
  { key: "contact_wa", value: "6281289656707", label: "WhatsApp", group: "contact" },
  { key: "contact_address", value: "Bandung, Jawa Barat", label: "Alamat", group: "contact" },
  { key: "contact_person", value: "Fadhil BSM", label: "Contact Person", group: "contact" },
  { key: "map_latitude", value: "-6.9204", label: "Latitude Peta", group: "map" },
  { key: "map_longitude", value: "107.7518", label: "Longitude Peta", group: "map" },
  { key: "social_instagram", value: "bandung.raya.residence", label: "Instagram", group: "social" },
  { key: "social_facebook", value: "", label: "Facebook", group: "social" },
  { key: "social_youtube", value: "", label: "YouTube", group: "social" },
  { key: "social_tiktok", value: "", label: "TikTok", group: "social" },
];

// ──── Settings — Cimahi Green Valley ────

const CGV_SETTINGS: Omit<SettingSeed, "mitraSlug">[] = [
  { key: "company_name", value: "Cimahi Green Valley", label: "Nama Perusahaan", group: "company" },
  { key: "company_legal_name", value: "PT Cimahi Green Development", label: "Nama Legal Perusahaan", group: "company" },
  { key: "total_units_sold", value: "120", label: "Total Unit Terjual", group: "company" },
  { key: "logo_url", value: "/images/logo-cgv.png", label: "URL Logo", group: "company" },
  { key: "hero_bg_image", value: "/images/properties/hero_cover.png", label: "Background Hero", group: "company" },
  { key: "location_bg_image", value: "/images/location.png", label: "Background Lokasi", group: "company" },
  { key: "page_banner_image", value: "/images/properties/hero_cover.png", label: "Banner Halaman", group: "company" },
  { key: "tentangkami_image", value: "/images/properties/hero_cover.png", label: "Gambar Tentang Kami", group: "company" },
  { key: "contact_phone", value: "0813-1234-5678", label: "Telepon", group: "contact" },
  { key: "contact_email", value: "info@cgv.co.id", label: "Email", group: "contact" },
  { key: "contact_wa", value: "6281312345678", label: "WhatsApp", group: "contact" },
  { key: "contact_address", value: "Cimahi, Jawa Barat", label: "Alamat", group: "contact" },
  { key: "contact_person", value: "Rina CGV", label: "Contact Person", group: "contact" },
  { key: "map_latitude", value: "-6.8736", label: "Latitude Peta", group: "map" },
  { key: "map_longitude", value: "107.5434", label: "Longitude Peta", group: "map" },
  { key: "social_instagram", value: "cimahigreenvalley", label: "Instagram", group: "social" },
  { key: "social_facebook", value: "CimahiGreenValley", label: "Facebook", group: "social" },
  { key: "social_youtube", value: "", label: "YouTube", group: "social" },
  { key: "social_tiktok", value: "cimahigreenvalley", label: "TikTok", group: "social" },
];

// ════════════════════════════════════════════════════════════
//  HELPERS
// ════════════════════════════════════════════════════════════

/** Lookup map: slug → mitra ID */
type MitraMap = Record<string, string>;

async function buildMitraMap(): Promise<MitraMap> {
  const mitras = await db.mitra.findMany({ select: { id: true, slug: true } });
  const map: MitraMap = {};
  for (const m of mitras) {
    map[m.slug] = m.id;
  }
  return map;
}

/** Strip mitraId from property data before passing to Prisma */
function propertyPayload(p: Omit<PropertySeed, "mitraSlug">, mitraId: string) {
  return { ...p, mitraId };
}

// ════════════════════════════════════════════════════════════
//  SEED FUNCTIONS
// ════════════════════════════════════════════════════════════

async function seedMitra() {
  console.log("\n━━━ Seeding Mitra (Partners) ━━━");

  const existingCount = await db.mitra.count();
  if (existingCount > 0) {
    console.log(`  [SKIP] Sudah ada ${existingCount} mitra`);
    return;
  }

  for (const m of MITRA_DATA) {
    await db.mitra.create({ data: m });
    console.log(`  [OK] ${m.name} (${m.subdomain})`);
  }
  console.log(`  [SUM] ${MITRA_DATA.length} mitra berhasil dibuat`);
}

async function seedAdmins() {
  console.log("\n━━━ Seeding Admins ━━━");

  const mitraMap = await buildMitraMap();

  for (const admin of ADMINS_DATA) {
    const existing = await db.admin.findUnique({ where: { email: admin.email } });
    if (existing) {
      console.log(`  [SKIP] ${admin.email} sudah ada`);
      continue;
    }

    const hashedPassword = await hash(admin.password, 12);
    const mitraId = admin.mitraSlug ? mitraMap[admin.mitraSlug] ?? null : null;

    await db.admin.create({
      data: {
        name: admin.name,
        email: admin.email,
        password: hashedPassword,
        role: admin.role,
        mitraId,
      },
    });

    const mitraLabel = mitraId ? `mitra: ${admin.mitraSlug}` : "SUPERADMIN (akses semua)";
    console.log(`  [OK] ${admin.name} (${admin.email}) — role: ${admin.role} — ${mitraLabel}`);
    console.log(`       Password: ${admin.password}`);
  }
}

async function seedProperties() {
  console.log("\n━━━ Seeding Properties ━━━");

  const mitraMap = await buildMitraMap();

  // BRR properties
  const brrId = mitraMap["bandung-raya-residence"];
  if (brrId) {
    const existingBrr = await db.property.count({ where: { mitraId: brrId } });
    if (existingBrr === 0) {
      for (const p of BRR_PROPERTIES) {
        await db.property.create({ data: propertyPayload(p, brrId) });
        console.log(`  [OK] [BRR] ${p.name} — Rp ${p.price.toLocaleString("id-ID")}`);
      }
      console.log(`  [SUM] ${BRR_PROPERTIES.length} properti BRR berhasil dibuat`);
    } else {
      console.log(`  [SKIP] Sudah ada ${existingBrr} properti BRR`);
    }
  }

  // CGV properties
  const cgvId = mitraMap["cimahi-green-valley"];
  if (cgvId) {
    const existingCgv = await db.property.count({ where: { mitraId: cgvId } });
    if (existingCgv === 0) {
      for (const p of CGV_PROPERTIES) {
        await db.property.create({ data: propertyPayload(p, cgvId) });
        console.log(`  [OK] [CGV] ${p.name} — Rp ${p.price.toLocaleString("id-ID")}`);
      }
      console.log(`  [SUM] ${CGV_PROPERTIES.length} properti CGV berhasil dibuat`);
    } else {
      console.log(`  [SKIP] Sudah ada ${existingCgv} properti CGV`);
    }
  }
}

async function seedTestimonials() {
  console.log("\n━━━ Seeding Testimonials ━━━");

  const mitraMap = await buildMitraMap();

  // BRR testimonials
  const brrId = mitraMap["bandung-raya-residence"];
  if (brrId) {
    const existingBrr = await db.testimonial.count({ where: { mitraId: brrId } });
    if (existingBrr === 0) {
      for (const t of BRR_TESTIMONIALS) {
        await db.testimonial.create({
          data: { ...t, mitraId: brrId, featured: t.rating === 5 },
        });
      }
      console.log(`  [SUM] ${BRR_TESTIMONIALS.length} testimoni BRR berhasil dibuat`);
    } else {
      console.log(`  [SKIP] Sudah ada ${existingBrr} testimoni BRR`);
    }
  }

  // CGV testimonials
  const cgvId = mitraMap["cimahi-green-valley"];
  if (cgvId) {
    const existingCgv = await db.testimonial.count({ where: { mitraId: cgvId } });
    if (existingCgv === 0) {
      for (const t of CGV_TESTIMONIALS) {
        await db.testimonial.create({
          data: { ...t, mitraId: cgvId, featured: t.rating === 5 },
        });
      }
      console.log(`  [SUM] ${CGV_TESTIMONIALS.length} testimoni CGV berhasil dibuat`);
    } else {
      console.log(`  [SKIP] Sudah ada ${existingCgv} testimoni CGV`);
    }
  }
}

async function seedBlogs() {
  console.log("\n━━━ Seeding Blog Posts ━━━");

  const mitraMap = await buildMitraMap();

  // BRR blogs
  const brrId = mitraMap["bandung-raya-residence"];
  if (brrId) {
    const existingBrr = await db.blogPost.count({ where: { mitraId: brrId } });
    if (existingBrr === 0) {
      for (const b of BRR_BLOGS) {
        await db.blogPost.create({ data: { ...b, mitraId: brrId } });
        console.log(`  [OK] [BRR] "${b.title}" — ${b.published ? "Published" : "Draft"}`);
      }
      console.log(`  [SUM] ${BRR_BLOGS.length} artikel BRR berhasil dibuat`);
    } else {
      console.log(`  [SKIP] Sudah ada ${existingBrr} artikel BRR`);
    }
  }

  // CGV blogs
  const cgvId = mitraMap["cimahi-green-valley"];
  if (cgvId) {
    const existingCgv = await db.blogPost.count({ where: { mitraId: cgvId } });
    if (existingCgv === 0) {
      for (const b of CGV_BLOGS) {
        await db.blogPost.create({ data: { ...b, mitraId: cgvId } });
        console.log(`  [OK] [CGV] "${b.title}" — ${b.published ? "Published" : "Draft"}`);
      }
      console.log(`  [SUM] ${CGV_BLOGS.length} artikel CGV berhasil dibuat`);
    } else {
      console.log(`  [SKIP] Sudah ada ${existingCgv} artikel CGV`);
    }
  }
}

async function seedGallery() {
  console.log("\n━━━ Seeding Gallery ━━━");

  const mitraMap = await buildMitraMap();

  // BRR gallery
  const brrId = mitraMap["bandung-raya-residence"];
  if (brrId) {
    const existingBrr = await db.galleryItem.count({ where: { mitraId: brrId } });
    if (existingBrr === 0) {
      for (const g of BRR_GALLERY) {
        await db.galleryItem.create({ data: { ...g, mitraId: brrId } });
      }
      console.log(`  [SUM] ${BRR_GALLERY.length} item galeri BRR berhasil dibuat`);
    } else {
      console.log(`  [SKIP] Sudah ada ${existingBrr} item galeri BRR`);
    }
  }

  // CGV gallery
  const cgvId = mitraMap["cimahi-green-valley"];
  if (cgvId) {
    const existingCgv = await db.galleryItem.count({ where: { mitraId: cgvId } });
    if (existingCgv === 0) {
      for (const g of CGV_GALLERY) {
        await db.galleryItem.create({ data: { ...g, mitraId: cgvId } });
      }
      console.log(`  [SUM] ${CGV_GALLERY.length} item galeri CGV berhasil dibuat`);
    } else {
      console.log(`  [SKIP] Sudah ada ${existingCgv} item galeri CGV`);
    }
  }
}

async function seedBanks() {
  console.log("\n━━━ Seeding Banks ━━━");

  const mitraMap = await buildMitraMap();

  // BRR banks
  const brrId = mitraMap["bandung-raya-residence"];
  if (brrId) {
    const existingBrr = await db.bank.count({ where: { mitraId: brrId } });
    if (existingBrr === 0) {
      for (const b of BRR_BANKS) {
        await db.bank.create({ data: { ...b, mitraId: brrId } });
        console.log(`  [OK] [BRR] ${b.name}`);
      }
      console.log(`  [SUM] ${BRR_BANKS.length} bank BRR berhasil dibuat`);
    } else {
      console.log(`  [SKIP] Sudah ada ${existingBrr} bank BRR`);
    }
  }

  // CGV banks
  const cgvId = mitraMap["cimahi-green-valley"];
  if (cgvId) {
    const existingCgv = await db.bank.count({ where: { mitraId: cgvId } });
    if (existingCgv === 0) {
      for (const b of CGV_BANKS) {
        await db.bank.create({ data: { ...b, mitraId: cgvId } });
        console.log(`  [OK] [CGV] ${b.name}`);
      }
      console.log(`  [SUM] ${CGV_BANKS.length} bank CGV berhasil dibuat`);
    } else {
      console.log(`  [SKIP] Sudah ada ${existingCgv} bank CGV`);
    }
  }
}

async function seedSettings() {
  console.log("\n━━━ Seeding Settings ━━━");

  const mitraMap = await buildMitraMap();

  // BRR settings
  const brrId = mitraMap["bandung-raya-residence"];
  if (brrId) {
    const existingBrr = await db.setting.count({ where: { mitraId: brrId } });
    if (existingBrr === 0) {
      for (const s of BRR_SETTINGS) {
        await db.setting.create({ data: { ...s, mitraId: brrId } });
      }
      console.log(`  [SUM] ${BRR_SETTINGS.length} setting BRR berhasil dibuat`);
    } else {
      console.log(`  [SKIP] Sudah ada ${existingBrr} setting BRR`);
    }
  }

  // CGV settings
  const cgvId = mitraMap["cimahi-green-valley"];
  if (cgvId) {
    const existingCgv = await db.setting.count({ where: { mitraId: cgvId } });
    if (existingCgv === 0) {
      for (const s of CGV_SETTINGS) {
        await db.setting.create({ data: { ...s, mitraId: cgvId } });
      }
      console.log(`  [SUM] ${CGV_SETTINGS.length} setting CGV berhasil dibuat`);
    } else {
      console.log(`  [SKIP] Sudah ada ${existingCgv} setting CGV`);
    }
  }
}

// ════════════════════════════════════════════════════════════
//  MAIN
// ════════════════════════════════════════════════════════════

async function main() {
  console.log("╔═══════════════════════════════════════════════════╗");
  console.log("║  Multi-Tenant Property — Database Seeder          ║");
  console.log("║  Bandung Raya Residence · Cimahi Green Valley     ║");
  console.log("║  Sumedang Hills                                  ║");
  console.log("╚═══════════════════════════════════════════════════╝");

  await seedMitra();
  await seedAdmins();
  await seedProperties();
  await seedTestimonials();
  await seedBlogs();
  await seedGallery();
  await seedBanks();
  await seedSettings();

  console.log("\n╔═══════════════════════════════════════════════════╗");
  console.log("║         ✅ Seeding selesai!                     ║");
  console.log("╚═══════════════════════════════════════════════════╝");

  console.log("\n📋 Akun Superadmin (akses semua mitra):");
  console.log("   Email    : admin@brr.co.id");
  console.log("   Password : admin123");

  console.log("\n📋 Akun Admin — Bandung Raya Residence:");
  console.log("   Email    : marketing@brr.co.id");
  console.log("   Password : marketing123");

  console.log("\n📋 Akun Admin — Cimahi Green Valley:");
  console.log("   Email    : admin@cgv.co.id");
  console.log("   Password : admin123");

  console.log("\n🏢 Mitra terdaftar:");
  console.log("   • Bandung Raya Residence (subdomain: brr)");
  console.log("   • Cimahi Green Valley (subdomain: cgv)");
  console.log("   • Sumedang Hills (subdomain: sh)");

  console.log("\n🔗 Login di: /admin/login");
}

main()
  .catch((e) => {
    console.error("❌ Seeding error:", e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
