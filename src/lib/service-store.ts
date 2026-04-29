import { create } from "zustand";

export interface ServiceItem {
  id: string;
  title: string;
  slug: string;
  description: string;
  category: string;
  price: number;
  priceUnit: string;
  image: string;
  images: string[];
  features: string[];
  duration: string;
  videoUrl: string;
  isPublished: boolean;
  isFeatured: boolean;
  sortOrder: number;
  createdAt: string;
}

interface ServiceStore {
  services: ServiceItem[];
  loading: boolean;
  initialized: boolean;
  fetchServices: () => Promise<void>;
  refetchServices: () => Promise<void>;
  fetchServiceBySlug: (slug: string) => Promise<ServiceItem | null>;
}

export const useServiceStore = create<ServiceStore>((set, get) => ({
  services: [],
  loading: false,
  initialized: false,
  fetchServices: async () => {
    if (get().initialized) return;
    set({ loading: true });
    try {
      const res = await fetch("/api/services?limit=50");
      const data = await res.json();
      set({ services: data.services || [], initialized: true, loading: false });
    } catch {
      set({ loading: false });
    }
  },
  refetchServices: async () => {
    set({ loading: true });
    try {
      const res = await fetch("/api/services?limit=50");
      const data = await res.json();
      set({ services: data.services || [], initialized: true, loading: false });
    } catch {
      set({ loading: false });
    }
  },
  fetchServiceBySlug: async (slug: string) => {
    const existing = get().services.find((s) => s.slug === slug);
    if (existing) return existing;

    try {
      const res = await fetch(`/api/services?slug=${encodeURIComponent(slug)}`);
      const data = await res.json();
      const service = data.services?.[0] || null;
      if (service) {
        const current = get().services;
        if (!current.find((s) => s.id === service.id)) {
          set({ services: [...current, service] });
        }
      }
      return service;
    } catch {
      return null;
    }
  },
}));
