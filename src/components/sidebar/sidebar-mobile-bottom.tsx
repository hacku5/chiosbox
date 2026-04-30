"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSidebarStore } from "@/stores/sidebar-store";
import type { NavItem } from "./types";

interface SidebarMobileBottomProps {
  items: NavItem[];
  hamburgerLabel?: string;
}

function ActiveLabel({ label }: { label: string }) {
  return (
    <motion.span
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 6 }}
      transition={{ duration: 0.18 }}
      className="absolute -top-7 left-1/2 -translate-x-1/2 bg-deep-sea-teal text-white text-[10px] font-semibold px-2.5 py-1 rounded-full whitespace-nowrap pointer-events-none shadow-sm"
    >
      {label}
    </motion.span>
  );
}

export function SidebarMobileBottom({
  items,
  hamburgerLabel = "Menu",
}: SidebarMobileBottomProps) {
  const pathname = usePathname();
  const setMobileDrawerOpen = useSidebarStore((s) => s.setMobileDrawerOpen);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const isActive = (href?: string) => {
    if (!pathname || !href) return false;
    return href === "/admin" || href === "/user"
      ? pathname === href
      : pathname.startsWith(href);
  };

  const activeItem = items.find((item) => isActive(item.href));

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 pointer-events-none safe-area-pb">
      <div className="flex justify-center pb-4 pt-2">
        <nav className="pointer-events-auto flex items-center gap-1 px-2 py-1.5 bg-white/85 backdrop-blur-2xl border border-deep-sea-teal/5 rounded-full shadow-[0_8px_32px_rgba(93,63,211,0.08),0_2px_8px_rgba(0,0,0,0.04)]">
          {items.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href ?? ""}
                  href={item.href ?? ""}
                  className="flex flex-col items-center justify-center gap-0.5 py-1.5 px-2 rounded-full transition-colors duration-200 cursor-pointer relative min-w-[44px]"
                >
                  {/* Active pill background */}
                  {active && (
                    <motion.div
                      layoutId={mounted ? "floating-pill" : undefined}
                      className="absolute inset-0 bg-chios-purple rounded-full"
                      transition={{ type: "spring", stiffness: 500, damping: 32 }}
                    />
                  )}

                  {/* Floating label above active item */}
                  <AnimatePresence>
                    {active && activeItem && (
                      <ActiveLabel label={activeItem.label} />
                    )}
                  </AnimatePresence>

                  {/* Icon */}
                  <span
                    className={`relative z-10 transition-colors duration-200 ${
                      active ? "text-white" : "text-deep-sea-teal/35 hover:text-deep-sea-teal/60"
                    }`}
                  >
                    {item.icon}
                  </span>

                  {/* Badge */}
                  {item.badge && item.badge > 0 && (
                    <span className="absolute -top-1 -right-0.5 bg-danger-red text-white text-[9px] font-bold rounded-full min-w-[16px] h-4 flex items-center justify-center z-20 px-1">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}

          {/* Divider */}
          <span className="w-px h-5 bg-deep-sea-teal/10 mx-0.5" />

          {/* Hamburger */}
          <button
            onClick={() => setMobileDrawerOpen(true)}
            className="flex items-center justify-center py-1.5 px-2.5 rounded-full text-deep-sea-teal/35 hover:text-deep-sea-teal/60 transition-colors cursor-pointer min-w-[44px]"
            aria-label={hamburgerLabel}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
        </nav>
      </div>
    </div>
  );
}
