"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AppSidebar } from "@/components/sidebar/app-sidebar";
import { useSidebarStore } from "@/stores/sidebar-store";
import { useAuthStore } from "@/stores/auth-store";
import { useTourStore } from "@/stores/tour-store";
import { LanguageSwitcher } from "@/components/language-switcher";
import { TourDriver } from "@/components/tour/tour-driver";
import { useTranslation } from "@/hooks/use-translation";
import type { NavItem } from "@/components/sidebar/types";

const userNavConfigs = [
  {
    key: "sidebar.home", href: "/user",
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>,
  },
  {
    key: "sidebar.packages", href: "/user/packages",
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" /><polyline points="3.27 6.96 12 12.01 20.73 6.96" /><line x1="12" y1="22.08" x2="12" y2="12" /></svg>,
  },
  {
    key: "sidebar.consolidate", href: "/user/consolidate",
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><polyline points="16 3 21 3 21 8" /><line x1="4" y1="20" x2="21" y2="3" /><polyline points="21 16 21 21 16 21" /><line x1="15" y1="15" x2="21" y2="21" /><line x1="4" y1="4" x2="9" y2="9" /></svg>,
  },
  {
    key: "sidebar.actions", href: "/user/actions",
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg>,
  },
  {
    key: "sidebar.payment", href: "/user/checkout", badgeKey: "payment",
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="1" y="4" width="22" height="16" rx="2" ry="2" /><line x1="1" y1="10" x2="23" y2="10" /></svg>,
  },
  {
    key: "sidebar.profile", href: "/user/profile",
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>,
  },
];

const BOTTOM_BAR_KEYS = ["sidebar.home", "sidebar.packages", "sidebar.consolidate", "sidebar.actions", "sidebar.payment"];

export function UserLayoutClient({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { t } = useTranslation();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const collapsed = useSidebarStore((s) => s.desktopCollapsed);
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    fetch("/api/invoices")
      .then((r) => (r.ok ? r.json() : []))
      .then((invoices: { status: string }[]) => {
        setPendingCount(invoices.filter((i) => i.status === "PENDING").length);
      })
      .catch(() => {});
  }, []);

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  const navItems: NavItem[] = userNavConfigs.map((cfg) => ({
    label: t(cfg.key),
    href: cfg.href,
    icon: cfg.icon,
    badge: cfg.badgeKey === "payment" && pendingCount > 0 ? pendingCount : undefined,
  }));

  const bottomBarItems = navItems.filter((item) =>
    BOTTOM_BAR_KEYS.some((key) => item.label === t(key))
  );

  const desktopBottom = (
    <div className="flex flex-col items-center gap-2 py-2 w-full">
      {user && (
        <div className="w-full px-2 mb-1">
          <div className="w-9 h-9 rounded-full bg-chios-purple/10 flex items-center justify-center mx-auto">
            <span className="text-sm font-semibold text-chios-purple">
              {(user.name || "?")[0]}
            </span>
          </div>
        </div>
      )}
      <button
        onClick={handleLogout}
        className="flex flex-col items-center gap-1 p-2 text-deep-sea-teal/30 hover:text-danger-red/80 transition-colors cursor-pointer"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
          <polyline points="16 17 21 12 16 7" />
          <line x1="21" y1="12" x2="9" y2="12" />
        </svg>
        <span className="text-[9px]">{t("sidebar.logout")}</span>
      </button>
      <button
        onClick={() => useTourStore.getState().startTour()}
        className="flex flex-col items-center gap-1 p-2 text-deep-sea-teal/30 hover:text-chios-purple transition-colors cursor-pointer"
        title={t("tour.helpTooltip")}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <circle cx="12" cy="12" r="10" />
          <path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
        <span className="text-[9px]">{t("tour.helpTooltip")}</span>
      </button>
      <LanguageSwitcher />
    </div>
  );

  const drawerProfile = user ? (
    <div className="flex items-center gap-3 min-w-0 px-2">
      <div className="w-9 h-9 rounded-full bg-chios-purple/10 flex items-center justify-center shrink-0">
        <span className="text-sm font-semibold text-chios-purple">
          {(user.name || "?")[0]}
        </span>
      </div>
      <div className="min-w-0">
        <div className="text-sm font-semibold text-deep-sea-teal truncate">{user.name}</div>
        <div className="text-xs text-deep-sea-teal/40 font-mono">{user.chios_box_id}</div>
      </div>
    </div>
  ) : null;

  const drawerBottom = (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-3 py-2 text-deep-sea-teal/50 hover:text-danger-red/80 hover:bg-danger-red/5 rounded-xl transition-all cursor-pointer text-sm"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          {t("sidebar.logout")}
        </button>
        <LanguageSwitcher />
      </div>
      <button
        onClick={() => {
          useTourStore.getState().startTour();
          useSidebarStore.getState().setMobileDrawerOpen(false);
        }}
        className="w-full flex items-center gap-2 px-3 py-2.5 text-deep-sea-teal/50 hover:text-chios-purple hover:bg-chios-purple/5 rounded-xl transition-all cursor-pointer text-sm"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
        {t("tour.helpTooltip")}
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-mastic-white">
      <AppSidebar
        navItems={navItems}
        bottomBarItems={bottomBarItems}
        desktopBottomContent={desktopBottom}
        drawerProfileContent={drawerProfile}
        drawerBottomContent={drawerBottom}
      />
      <main
        className={`pb-20 lg:pb-0 transition-[margin] duration-300 ${
          collapsed ? "lg:ml-[72px]" : "lg:ml-[240px]"
        }`}
      >
        {children}
        <TourDriver />
      </main>
    </div>
  );
}
