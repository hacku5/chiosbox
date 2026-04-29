"use client";

import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSidebarStore } from "@/stores/sidebar-store";
import type { NavItem } from "./types";

interface SidebarMobileDrawerProps {
  navItems: NavItem[];
  profileContent?: React.ReactNode;
  bottomContent?: React.ReactNode;
}

export function SidebarMobileDrawer({
  navItems,
  profileContent,
  bottomContent,
}: SidebarMobileDrawerProps) {
  const pathname = usePathname();
  const open = useSidebarStore((s) => s.mobileDrawerOpen);
  const setOpen = useSidebarStore((s) => s.setMobileDrawerOpen);

  const isActive = (href: string) => {
    if (!pathname) return false;
    return href === "/admin" || href === "/user"
      ? pathname === href
      : pathname.startsWith(href);
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="lg:hidden fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />

          <motion.aside
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="lg:hidden fixed left-0 top-0 bottom-0 z-50 w-72 bg-white flex flex-col shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-deep-sea-teal/5">
              <Link href="/" onClick={() => setOpen(false)} className="flex items-center gap-2">
                <svg width="28" height="28" viewBox="0 0 32 32" fill="none" className="text-chios-purple">
                  <rect width="32" height="32" rx="8" fill="currentColor" />
                  <path d="M8 12L16 8L24 12V20L16 24L8 20V12Z" stroke="white" strokeWidth="2" strokeLinejoin="round" />
                </svg>
                <span className="font-display text-lg font-semibold text-deep-sea-teal">ChiosBox</span>
              </Link>
              <button
                onClick={() => setOpen(false)}
                className="w-9 h-9 rounded-xl flex items-center justify-center text-deep-sea-teal/30 hover:text-deep-sea-teal hover:bg-deep-sea-teal/[0.03] transition-all cursor-pointer"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            {/* Nav items */}
            <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
              {navItems.map((item) => {
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-200 cursor-pointer ${
                      active
                        ? "bg-chios-purple/10 text-chios-purple"
                        : "text-deep-sea-teal/60 hover:bg-deep-sea-teal/[0.03] hover:text-deep-sea-teal"
                    }`}
                  >
                    <span className={active ? "text-chios-purple" : ""}>{item.icon}</span>
                    <span className={`text-sm ${active ? "font-semibold" : "font-medium"}`}>
                      {item.label}
                    </span>
                    {item.badge && item.badge > 0 && (
                      <span className="ml-auto bg-danger-red text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* Bottom section */}
            <div className="p-4 border-t border-deep-sea-teal/5 space-y-3">
              {profileContent}
              {bottomContent}
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
