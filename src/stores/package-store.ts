import { create } from "zustand";

export type PackageStatus = "bekleniyor" | "yolda" | "depoda" | "hazir" | "birlestirildi" | "teslim_edildi" | "iptal";

export interface Package {
  id: string;
  tracking_no: string;
  carrier: string;
  content: string;
  status: PackageStatus;
  warehouse_photo_url?: string | null;
  arrived_at?: string | null;
  storage_days_used: number;
  free_days_left: number;
  shelf_location?: string | null;
  demurrage_fee: number;
  master_box_id?: string | null;
  weight_kg?: number | null;
  dimensions?: string | null;
  notes?: string | null;
  created_at?: string;
  updated_at?: string;
}

interface PackageState {
  packages: Package[];
  selectedIds: string[];
  loading: boolean;
  error: string | null;
  fetchPackages: () => Promise<void>;
  toggleSelect: (id: string) => void;
  clearSelection: () => void;
  deletePackage: (id: string) => Promise<{ error?: string }>;
}

function mapStatus(dbStatus: string): PackageStatus {
  const map: Record<string, PackageStatus> = {
    BEKLENIYOR: "bekleniyor",
    YOLDA: "yolda",
    DEPODA: "depoda",
    HAZIR: "hazir",
    BIRLESTIRILDI: "birlestirildi",
    TESLIM_EDILDI: "teslim_edildi",
    IPTAL: "iptal",
  };
  return map[dbStatus] || "bekleniyor";
}

export const usePackageStore = create<PackageState>((set, get) => ({
  packages: [],
  selectedIds: [],
  loading: false,
  error: null,

  fetchPackages: async () => {
    set({ loading: true, error: null });
    try {
      const res = await fetch("/api/packages");
      if (!res.ok) throw new Error("Failed to load packages");
      const data = await res.json();
      const packages: Package[] = data.map((p: Record<string, unknown>) => ({
        ...p,
        status: mapStatus(p.status as string),
      }));
      set({ packages, loading: false });
    } catch (err) {
      set({ loading: false, error: err instanceof Error ? err.message : "An error occurred" });
    }
  },

  toggleSelect: (id) =>
    set((state) => ({
      selectedIds: state.selectedIds.includes(id)
        ? state.selectedIds.filter((sid) => sid !== id)
        : [...state.selectedIds, id],
    })),
  clearSelection: () => set({ selectedIds: [] }),

  deletePackage: async (id) => {
    try {
      const res = await fetch(`/api/packages/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        return { error: data.error || "Delete failed" };
      }
      // Refresh from server to ensure consistency
      await get().fetchPackages();
      return {};
    } catch {
      return { error: "An error occurred" };
    }
  },
}));
