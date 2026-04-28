import { create } from "zustand";

export interface MitraItem {
  id: string;
  name: string;
  slug: string;
  logo: string;
  description: string;
  address: string;
  phone: string;
  email: string;
  createdAt: string;
  propertyCount: number;
}

interface MitraStore {
  mitraList: MitraItem[];
  loading: boolean;
  initialized: boolean;
  fetchMitraList: () => Promise<void>;
}

export const useMitraStore = create<MitraStore>((set, get) => ({
  mitraList: [],
  loading: false,
  initialized: false,
  fetchMitraList: async () => {
    if (get().initialized) return;
    set({ loading: true });
    try {
      const res = await fetch("/api/mitra");
      const data = await res.json();
      set({ mitraList: Array.isArray(data) ? data : [], initialized: true, loading: false });
    } catch {
      set({ loading: false });
    }
  },
}));
