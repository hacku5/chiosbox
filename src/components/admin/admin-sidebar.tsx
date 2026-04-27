"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname, useRouter } from "next/navigation";
import { useAdminUser } from "@/app/admin/admin-layout-client";
import { hasPermission, isSuperAdmin } from "@/lib/permissions";
import { createClient } from "@/lib/supabase-browser";
import { useTranslation } from "@/hooks/use-translation";
import { AdminLanguageSwitcher } from "@/components/admin/admin-language-switcher";

interface NavItemConfig {
  labelKey: string;
  href: string;
  permission: string | null;
  icon: React.ReactNode;
}

const navItemConfigs: NavItemConfig[] = [
  {
    labelKey: "admin.panel",
    href: "/admin",
    permission: null,
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </svg>
    ),
  },
  {
    labelKey: "action.kabul",
    href: "/admin/intake",
    permission: "intake",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" />
        <circle cx="12" cy="13" r="4" />
      </svg>
    ),
  },
  {
    labelKey: "action.teslimat",
    href: "/admin/pickup",
    permission: "pickup",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <rect x="7" y="7" width="3" height="3" />
        <rect x="14" y="7" width="3" height="3" />
        <rect x="7" y="14" width="3" height="3" />
        <rect x="14" y="14" width="3" height="3" />
      </svg>
    ),
  },
  {
    labelKey: "action.gecikme",
    href: "/admin/demurrage",
    permission: "demurrage",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    ),
  },
  {
    labelKey: "action.paketler",
    href: "/admin/packages",
    permission: "packages",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
        <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
        <line x1="12" y1="22.08" x2="12" y2="12" />
      </svg>
    ),
  },
  {
    labelKey: "action.faturalar",
    href: "/admin/invoices",
    permission: "invoices",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
        <polyline points="10 9 9 9 8 9" />
      </svg>
    ),
  },
  {
    labelKey: "action.musteriler",
    href: "/admin/customers",
    permission: "customers",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 00-3-3.87" />
        <path d="M16 3.13a4 4 0 010 7.75" />
      </svg>
    ),
  },
  {
    labelKey: "admin.users",
    href: "/admin/users",
    permission: "users",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06A1.65 1.65 0 0019.32 9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" />
      </svg>
    ),
  },
  {
    labelKey: "admin.languages",
    href: "/admin/languages",
    permission: null,
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="12" cy="12" r="10" />
        <line x1="2" y1="12" x2="22" y2="12" />
        <path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
      </svg>
    ),
  },
  {
    labelKey: "admin.translations",
    href: "/admin/translations",
    permission: null,
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M5 8l6 6" />
        <path d="M4 14l6-6 2-3" />
        <path d="M2 5h12" />
        <path d="M7 2v3" />
        <path d="M11 21l5-10 5 10" />
        <path d="M14.5 18h7" />
      </svg>
    ),
  },
];

interface NavItem {
  label: string;
  href: string;
  permission: string | null;
  icon: React.ReactNode;
}

function NavItemLink({
  item,
  isActive,
  onClick,
  variant,
}: {
  item: NavItem;
  isActive: boolean;
  onClick?: () => void;
  variant: "desktop" | "mobile";
}) {
  if (variant === "desktop") {
    return (
      <Link
        href={item.href}
        className={`flex flex-col items-center gap-1.5 p-3 rounded-2xl transition-all duration-200 cursor-pointer ${
          isActive
            ? "bg-white/15 text-white"
            : "text-white/40 hover:bg-white/10 hover:text-white/70"
        }`}
      >
        {item.icon}
        <span className="text-[10px] font-medium">{item.label}</span>
      </Link>
    );
  }

  return (
    <Link
      href={item.href}
      onClick={onClick}
      className={`flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-200 cursor-pointer ${
        isActive
          ? "bg-white/15 text-white"
          : "text-white/50 hover:bg-white/10 hover:text-white/80"
      }`}
    >
      <span className={isActive ? "text-white" : "text-white/40"}>{item.icon}</span>
      <span className={`text-sm ${isActive ? "font-semibold" : "font-medium"}`}>
        {item.label}
      </span>
    </Link>
  );
}

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const adminUser = useAdminUser();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { t } = useTranslation();

  const navItems: NavItem[] = navItemConfigs
    .filter((item) => {
      if (item.permission === null) return true;
      if (item.permission === "users") return isSuperAdmin(adminUser.permissions);
      return hasPermission(adminUser.permissions, item.permission as never);
    })
    .map((item) => ({
      label: t(item.labelKey),
      href: item.href,
      permission: item.permission,
      icon: item.icon,
    }));

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  };

  const isActive = (href: string) =>
    href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);

  const currentLabel = navItems.find((i) => isActive(i.href))?.label || t("admin.panel");

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-20 bg-deep-sea-teal h-screen fixed left-0 top-0">
        <div className="p-4 flex justify-center border-b border-white/10">
          <Link href="/">
            <svg width="36" height="36" viewBox="0 0 32 32" fill="none" className="text-white">
              <rect width="32" height="32" rx="8" fill="currentColor" opacity="0.2" />
              <path d="M8 12L16 8L24 12V20L16 24L8 20V12Z" stroke="white" strokeWidth="2" strokeLinejoin="round" />
            </svg>
          </Link>
        </div>

        <nav className="flex-1 px-2 py-6 flex flex-col gap-2">
          {navItems.map((item) => (
            <NavItemLink
              key={item.href}
              item={item}
              isActive={isActive(item.href)}
              variant="desktop"
            />
          ))}
        </nav>

        <div className="p-3 mb-2 flex flex-col items-center gap-3">
          <AdminLanguageSwitcher />
          <button
            onClick={handleLogout}
            className="flex flex-col items-center gap-1 p-2 text-white/30 hover:text-danger-red/80 transition-colors cursor-pointer"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            <span className="text-[9px]">{t("admin.logout")}</span>
          </button>
        </div>
      </aside>

      {/* Mobile Header Bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-deep-sea-teal/95 backdrop-blur-xl border-b border-white/10 safe-area-pt">
        <div className="flex items-center justify-between h-14 px-4">
          <button
            onClick={() => setMobileOpen(true)}
            className="w-10 h-10 rounded-xl flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>

          <span className="text-sm font-semibold text-white">{currentLabel}</span>

          <button
            onClick={handleLogout}
            className="w-10 h-10 rounded-xl flex items-center justify-center text-white/40 hover:text-danger-red/80 hover:bg-white/10 transition-all cursor-pointer"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Slide-In Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="lg:hidden fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
              onClick={() => setMobileOpen(false)}
            />

            {/* Panel */}
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="lg:hidden fixed left-0 top-0 bottom-0 z-50 w-72 bg-deep-sea-teal flex flex-col shadow-2xl"
            >
              {/* Menu header */}
              <div className="flex items-center justify-between p-5 border-b border-white/10">
                <Link href="/" onClick={() => setMobileOpen(false)} className="flex items-center gap-2">
                  <svg width="28" height="28" viewBox="0 0 32 32" fill="none" className="text-white">
                    <rect width="32" height="32" rx="8" fill="currentColor" opacity="0.2" />
                    <path d="M8 12L16 8L24 12V20L16 24L8 20V12Z" stroke="white" strokeWidth="2" strokeLinejoin="round" />
                  </svg>
                  <span className="font-display text-lg font-semibold text-white">ChiosBox</span>
                </Link>
                <button
                  onClick={() => setMobileOpen(false)}
                  className="w-9 h-9 rounded-xl flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>

              {/* Nav items */}
              <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
                {navItems.map((item) => (
                  <NavItemLink
                    key={item.href}
                    item={item}
                    isActive={isActive(item.href)}
                    onClick={() => setMobileOpen(false)}
                    variant="mobile"
                  />
                ))}
              </nav>

              {/* User info & language at bottom */}
              <div className="p-4 border-t border-white/10 space-y-3">
                <div className="flex items-center justify-between px-2">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-full bg-white/15 flex items-center justify-center shrink-0">
                      <span className="text-sm font-semibold text-white">
                        {(adminUser.name || "?")[0]}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-medium text-white truncate">
                        {adminUser.name}
                      </div>
                      <div className="text-xs text-white/40">Admin</div>
                    </div>
                  </div>
                  <AdminLanguageSwitcher />
                </div>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
