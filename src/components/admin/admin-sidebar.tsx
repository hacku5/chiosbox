"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  {
    label: "Kabul",
    href: "/admin/intake",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" />
        <circle cx="12" cy="13" r="4" />
      </svg>
    ),
  },
  {
    label: "Teslimat",
    href: "/admin/pickup",
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
    label: "Gecikme",
    href: "/admin/demurrage",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    ),
  },
];

export function AdminSidebar() {
  const pathname = usePathname();

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
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
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
          })}
        </nav>

        <div className="p-3 mb-2 flex justify-center">
          <Link
            href="/dashboard"
            className="flex flex-col items-center gap-1 p-2 text-white/30 hover:text-white/60 transition-colors cursor-pointer"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
            </svg>
            <span className="text-[9px]">Panel</span>
          </Link>
        </div>
      </aside>

      {/* Mobile Bottom Nav */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-deep-sea-teal border-t border-white/10 safe-area-pb">
        <div className="flex items-center justify-around h-20 px-2">
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center gap-1.5 py-2 px-4 rounded-2xl transition-all duration-200 cursor-pointer min-w-[64px] min-h-[56px] ${
                  isActive ? "text-white" : "text-white/40"
                }`}
              >
                {item.icon}
                <span className="text-[10px] font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
