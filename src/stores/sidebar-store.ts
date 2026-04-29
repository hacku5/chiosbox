import { create } from "zustand";
import { persist } from "zustand/middleware";

interface SidebarState {
  desktopCollapsed: boolean;
  mobileDrawerOpen: boolean;
  toggleDesktop: () => void;
  setMobileDrawerOpen: (open: boolean) => void;
}

export const useSidebarStore = create<SidebarState>()(
  persist(
    (set) => ({
      desktopCollapsed: true,
      mobileDrawerOpen: false,
      toggleDesktop: () => set((s) => ({ desktopCollapsed: !s.desktopCollapsed })),
      setMobileDrawerOpen: (open) => set({ mobileDrawerOpen: open }),
    }),
    { name: "chios-sidebar" }
  )
);
