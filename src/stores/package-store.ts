import { create } from "zustand";

export type PackageStatus = "bekleniyor" | "yolda" | "depoda" | "birlestirildi" | "teslim_edildi";

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
}

interface PackageState {
  packages: Package[];
  selectedIds: string[];
  loading: boolean;
  fetchPackages: () => Promise<void>;
  toggleSelect: (id: string) => void;
  clearSelection: () => void;
}

function mapStatus(dbStatus: string): PackageStatus {
  const map: Record<string, PackageStatus> = {
    BEKLENIYOR: "bekleniyor",
    YOLDA: "yolda",
    DEPODA: "depoda",
    BIRLESTIRILDI: "birlestirildi",
    TESLIM_EDILDI: "teslim_edildi",
  };
  return map[dbStatus] || "bekleniyor";
}

export const usePackageStore = create<PackageState>((set) => ({
  packages: [],
  selectedIds: [],
  loading: false,

  fetchPackages: async () => {
    set({ loading: true });
    try {
      const res = await fetch("/api/packages");
      const data = await res.json();
      const packages: Package[] = data.map((p: Record<string, unknown>) => ({
        ...p,
        status: mapStatus(p.status as string),
      }));
      set({ packages, loading: false });
    } catch {
      set({ loading: false });
    }
  },

  toggleSelect: (id) =>
    set((state) => ({
      selectedIds: state.selectedIds.includes(id)
        ? state.selectedIds.filter((sid) => sid !== id)
        : [...state.selectedIds, id],
    })),
  clearSelection: () => set({ selectedIds: [] }),
}));
