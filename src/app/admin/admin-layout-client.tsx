"use client";

import { createContext, useContext } from "react";
import { useRouter } from "next/navigation";
import { AppSidebar } from "@/components/sidebar/app-sidebar";
import { useSidebarStore } from "@/stores/sidebar-store";
import { hasPermission, isSuperAdmin } from "@/lib/permissions";
import { createClient } from "@/lib/supabase-browser";
import { useTranslation } from "@/hooks/use-translation";
import { AdminLanguageSwitcher } from "@/components/admin/admin-language-switcher";
import type { NavItem } from "@/components/sidebar/types";

export interface AdminUserData {
  id: string;
  name: string;
  is_admin: boolean;
  permissions: string[];
}

const AdminUserContext = createContext<AdminUserData | null>(null);

export function useAdminUser() {
  const ctx = useContext(AdminUserContext);
  if (!ctx) {
    return { id: "", name: "", is_admin: false, permissions: [] as string[] };
  }
  return ctx;
}

type NavConfigItem = {
  type?: "link" | "separator";
  labelKey: string;
  href?: string;
  permission?: string | null;
  icon?: React.ReactNode;
};

const adminNavConfigs: NavConfigItem[] = [
  { labelKey: "admin.panel", href: "/admin", permission: null, icon: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></svg>
  )},

  { type: "separator", labelKey: "admin.group.operations" },

  { labelKey: "action.intake", href: "/admin/intake", permission: "intake", icon: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" /><circle cx="12" cy="13" r="4" /></svg>
  )},
  { labelKey: "actions.delivery", href: "/admin/pickup", permission: "pickup", icon: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2" /><rect x="7" y="7" width="3" height="3" /><rect x="14" y="7" width="3" height="3" /><rect x="7" y="14" width="3" height="3" /><rect x="14" y="14" width="3" height="3" /></svg>
  )},
  { labelKey: "action.delay", href: "/admin/demurrage", permission: "demurrage", icon: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
  )},
  { labelKey: "action.packages", href: "/admin/packages", permission: "packages", icon: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" /><polyline points="3.27 6.96 12 12.01 20.73 6.96" /><line x1="12" y1="22.08" x2="12" y2="12" /></svg>
  )},
  { labelKey: "action.invoices", href: "/admin/invoices", permission: "invoices", icon: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" /></svg>
  )},

  { type: "separator", labelKey: "admin.group.users" },

  { labelKey: "action.customers", href: "/admin/customers", permission: "customers", icon: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 00-3-3.87" /><path d="M16 3.13a4 4 0 010 7.75" /></svg>
  )},
  { labelKey: "admin.users", href: "/admin/users", permission: "users", icon: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06A1.65 1.65 0 0019.32 9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" /></svg>
  )},

  { type: "separator", labelKey: "admin.group.content" },

  { labelKey: "admin.faq", href: "/admin/faq", permission: null, icon: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>
  )},
  { labelKey: "admin.sliders", href: "/admin/sliders", permission: null, icon: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" /></svg>
  )},
  { labelKey: "admin.shoppingSites", href: "/admin/shopping-sites", permission: null, icon: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" /><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" /></svg>
  )},
  { labelKey: "admin.plans", href: "/admin/plans", permission: null, icon: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z" /><line x1="7" y1="7" x2="7.01" y2="7" /></svg>
  )},
  { labelKey: "admin.contentBlocks", href: "/admin/content-blocks", permission: null, icon: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /></svg>
  )},
  { labelKey: "admin.policies", href: "/admin/policies", permission: null, icon: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
  )},

  { type: "separator", labelKey: "admin.group.system" },

  { labelKey: "admin.languages", href: "/admin/languages", permission: null, icon: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" /><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" /></svg>
  )},
  { labelKey: "admin.translations", href: "/admin/translations", permission: null, icon: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M5 8l6 6" /><path d="M4 14l6-6 2-3" /><path d="M2 5h12" /><path d="M7 2v3" /><path d="M11 21l5-10 5 10" /><path d="M14.5 18h7" /></svg>
  )},
  { labelKey: "admin.settings", href: "/admin/settings", permission: "settings", icon: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06A1.65 1.65 0 0019.32 9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" /></svg>
  )},
];

const BOTTOM_BAR_KEYS = ["admin.panel", "action.packages", "action.intake", "action.invoices", "action.customers"];

export function AdminLayoutClient({
  adminUser,
  children,
}: {
  adminUser: AdminUserData;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { t } = useTranslation();
  const collapsed = useSidebarStore((s) => s.desktopCollapsed);

  const navItems: NavItem[] = adminNavConfigs
    .filter((item) => {
      if (item.type === "separator") return true;
      if (item.permission === null) return true;
      if (item.permission === "users" || item.permission === "settings")
        return isSuperAdmin(adminUser.permissions);
      return hasPermission(adminUser.permissions, item.permission as never);
    })
    .map((item) => ({
      type: item.type || "link",
      label: t(item.labelKey),
      href: item.href,
      icon: item.icon,
    }));

  const bottomBarItems = navItems.filter((item) =>
    item.type !== "separator" && BOTTOM_BAR_KEYS.some((key) => item.label === t(key))
  );

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
  };

  const desktopBottom = (
    <div className="flex flex-col items-center gap-3 py-2">
      <AdminLanguageSwitcher />
      <button
        onClick={handleLogout}
        className="flex flex-col items-center gap-1 p-2 text-deep-sea-teal/30 hover:text-danger-red/80 transition-colors cursor-pointer"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
          <polyline points="16 17 21 12 16 7" />
          <line x1="21" y1="12" x2="9" y2="12" />
        </svg>
        <span className="text-[9px]">{t("admin.logout")}</span>
      </button>
    </div>
  );

  const drawerProfile = (
    <div className="flex items-center gap-3 min-w-0 px-2">
      <div className="w-9 h-9 rounded-full bg-chios-purple/10 flex items-center justify-center shrink-0">
        <span className="text-sm font-semibold text-chios-purple">
          {(adminUser.name || "?")[0]}
        </span>
      </div>
      <div className="min-w-0">
        <div className="text-sm font-semibold text-deep-sea-teal truncate">{adminUser.name}</div>
        <div className="text-xs text-deep-sea-teal/40">Admin</div>
      </div>
    </div>
  );

  const drawerBottom = (
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
        {t("admin.logout")}
      </button>
      <AdminLanguageSwitcher />
    </div>
  );

  return (
    <AdminUserContext.Provider value={adminUser}>
      <div className="min-h-screen bg-mastic-white">
        <AppSidebar
          navItems={navItems}
          bottomBarItems={bottomBarItems}
          desktopBottomContent={desktopBottom}
          drawerProfileContent={drawerProfile}
          drawerBottomContent={drawerBottom}
        />
        <main
          className={`pt-0 pb-20 lg:pb-0 transition-[margin] duration-300 ${
            collapsed ? "lg:ml-[72px]" : "lg:ml-[240px]"
          }`}
        >
          {children}
        </main>
      </div>
    </AdminUserContext.Provider>
  );
}
