"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth-store";

const staticNavItems = [
  {
    label: "Ana Sayfa",
    href: "/dashboard",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
  },
  {
    label: "Paketlerim",
    href: "/dashboard/packages",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
        <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
        <line x1="12" y1="22.08" x2="12" y2="12" />
      </svg>
    ),
  },
  {
    label: "Birleştir",
    href: "/dashboard/consolidate",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <polyline points="16 3 21 3 21 8" />
        <line x1="4" y1="20" x2="21" y2="3" />
        <polyline points="21 16 21 21 16 21" />
        <line x1="15" y1="15" x2="21" y2="21" />
        <line x1="4" y1="4" x2="9" y2="9" />
      </svg>
    ),
  },
  {
    label: "İşlemler",
    href: "/dashboard/actions",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
      </svg>
    ),
  },
  {
    label: "Ödeme",
    href: "/dashboard/checkout",
    badge: true,
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
        <line x1="1" y1="10" x2="23" y2="10" />
      </svg>
    ),
  },
  {
    label: "Profil",
    href: "/dashboard/profile",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    fetch("/api/invoices")
      .then((r) => r.ok ? r.json() : [])
      .then((invoices: { status: string }[]) => {
        setPendingCount(invoices.filter((i) => i.status === "PENDING").length);
      })
      .catch(() => {});
  }, []);

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-deep-sea-teal/5 h-screen fixed left-0 top-0">
        <div className="p-6 border-b border-deep-sea-teal/5">
          <Link href="/" className="flex items-center gap-2">
            <svg
              width="28"
              height="28"
              viewBox="0 0 32 32"
              fill="none"
              className="text-chios-purple"
            >
              <rect width="32" height="32" rx="8" fill="currentColor" />
              <path
                d="M8 12L16 8L24 12V20L16 24L8 20V12Z"
                stroke="white"
                strokeWidth="2"
                strokeLinejoin="round"
              />
            </svg>
            <span className="font-display text-lg font-semibold text-deep-sea-teal">
              ChiosBox
            </span>
          </Link>
        </div>

        <nav className="flex-1 px-3 py-6 space-y-1">
          {staticNavItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer relative ${
                  isActive
                    ? "bg-chios-purple/10 text-chios-purple"
                    : "text-deep-sea-teal/60 hover:bg-deep-sea-teal/[0.03] hover:text-deep-sea-teal"
                }`}
              >
                <span className={isActive ? "text-chios-purple" : ""}>
                  {item.icon}
                </span>
                {item.label}
                {item.badge && pendingCount > 0 && (
                  <span className="ml-auto bg-danger-red text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {pendingCount}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {user && (
          <div className="p-4 mx-3 mb-4">
            <div className="bg-deep-sea-teal/[0.03] rounded-xl p-3 mb-2">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-chios-purple/10 flex items-center justify-center">
                  <span className="text-sm font-semibold text-chios-purple">
                    {(user?.name || "?")[0]}
                  </span>
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-deep-sea-teal truncate">
                    {user.name}
                  </div>
                  <div className="text-xs text-deep-sea-teal/40 font-mono">
                    {user.chios_box_id}
                  </div>
                </div>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-deep-sea-teal/50 hover:text-danger-red hover:bg-danger-red/5 rounded-xl transition-all duration-200 cursor-pointer"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
              Çıkış Yap
            </button>
          </div>
        )}
      </aside>

      {/* Mobile Bottom Nav */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-deep-sea-teal/5 safe-area-pb">
        <div className="flex items-center justify-around h-16 px-2">
          {staticNavItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center gap-1 py-2 px-3 rounded-xl transition-all duration-200 cursor-pointer relative ${
                  isActive
                    ? "text-chios-purple"
                    : "text-deep-sea-teal/40"
                }`}
              >
                <span
                  className={`transition-transform duration-200 ${
                    isActive ? "scale-110" : ""
                  }`}
                >
                  {item.icon}
                </span>
                <span className="text-[10px] font-medium">{item.label}</span>
                {item.badge && pendingCount > 0 && (
                  <span className="absolute -top-0.5 right-1 bg-danger-red text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                    {pendingCount}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
