import { create } from "zustand";

export interface AdminPackage {
  id: string;
  tracking_no: string;
  carrier: string;
  content: string;
  status: string;
  warehouse_photo_url?: string | null;
  arrived_at?: string | null;
  storage_days_used: number;
  free_days_left: number;
  shelf_location?: string | null;
  demurrage_fee: number;
  weight_kg?: number | null;
  dimensions?: string | null;
  notes?: string | null;
  user_id: string;
  users?: {
    name: string;
    chios_box_id: string;
    email: string;
  };
}

interface AdminState {
  packages: AdminPackage[];
  loading: boolean;
  error: string | null;
  fetchPackages: (filter?: { tracking?: string; status?: string; demurrage?: boolean }) => Promise<void>;
  intakePackage: (trackingNo: string, shelf: string) => Promise<{ error?: string }>;
  pickupPackage: (packageId: string) => Promise<{ error?: string }>;
  discardPackage: (id: string) => Promise<{ error?: string }>;
}

export const useAdminStore = create<AdminState>((set, get) => ({
  packages: [],
  loading: false,
  error: null,

  fetchPackages: async (filter) => {
    set({ loading: true, error: null });
    try {
      const params = new URLSearchParams();
      if (filter?.tracking) params.set("tracking", filter.tracking);
      if (filter?.status) params.set("status", filter.status);
      if (filter?.demurrage) params.set("demurrage", "true");

      const url = `/api/admin/packages${params.toString() ? `?${params}` : ""}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("Paketler yüklenemedi");
      const json = await res.json();
      set({ packages: Array.isArray(json) ? json : json.data ?? [], loading: false });
    } catch (err) {
      set({ loading: false, error: err instanceof Error ? err.message : "Bir hata oluştu" });
    }
  },

  intakePackage: async (trackingNo, shelf) => {
    try {
      const res = await fetch("/api/admin/intake", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ trackingNo, shelfLocation: shelf }),
      });
      const data = await res.json();
      if (!res.ok) return { error: data.error || "Kabul başarısız" };
      // Refresh packages list
      get().fetchPackages();
      return {};
    } catch {
      return { error: "Bir hata oluştu" };
    }
  },

  pickupPackage: async (packageId) => {
    try {
      const res = await fetch("/api/admin/pickup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ packageId }),
      });
      const data = await res.json();
      if (!res.ok) return { error: data.error || "Teslimat başarısız" };
      get().fetchPackages();
      return {};
    } catch {
      return { error: "Bir hata oluştu" };
    }
  },

  discardPackage: async (id) => {
    try {
      const res = await fetch(`/api/admin/packages/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const data = await res.json();
        return { error: data.error || "Tasfiye başarısız" };
      }
      set((state) => ({
        packages: state.packages.filter((p) => p.id !== id),
      }));
      return {};
    } catch {
      return { error: "Bir hata oluştu" };
    }
  },
}));
