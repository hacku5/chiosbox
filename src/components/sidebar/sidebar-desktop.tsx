"use client";

import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSidebarStore } from "@/stores/sidebar-store";
import type { NavItem } from "./types";

interface SidebarDesktopProps {
  navItems: NavItem[];
  bottomContent?: React.ReactNode;
}

export function SidebarDesktop({ navItems, bottomContent }: SidebarDesktopProps) {
  const pathname = usePathname();
  const collapsed = useSidebarStore((s) => s.desktopCollapsed);
  const toggleDesktop = useSidebarStore((s) => s.toggleDesktop);

  const isActive = (href: string) => {
    if (!pathname) return false;
    return href === "/admin" || href === "/user"
      ? pathname === href
      : pathname.startsWith(href);
  };

  return (
    <motion.aside
      animate={{ width: collapsed ? 72 : 240 }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
      className="hidden lg:flex flex-col bg-white border-r border-deep-sea-teal/5 h-screen fixed left-0 top-0 z-40 overflow-hidden"
    >
      {/* Logo + collapse toggle */}
      <div className="flex items-center justify-between p-4 border-b border-deep-sea-teal/5 min-h-[60px]">
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none" className="text-chios-purple shrink-0">
            <rect width="32" height="32" rx="8" fill="currentColor" />
            <path d="M8 12L16 8L24 12V20L16 24L8 20V12Z" stroke="white" strokeWidth="2" strokeLinejoin="round" />
          </svg>
          <AnimatePresence>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                className="font-display text-lg font-semibold text-deep-sea-teal whitespace-nowrap overflow-hidden"
              >
                ChiosBox
              </motion.span>
            )}
          </AnimatePresence>
        </Link>
        <button
          onClick={toggleDesktop}
          className="w-8 h-8 rounded-lg flex items-center justify-center text-deep-sea-teal/30 hover:text-deep-sea-teal hover:bg-deep-sea-teal/[0.03] transition-all cursor-pointer shrink-0"
        >
          <motion.svg
            animate={{ rotate: collapsed ? 0 : 180 }}
            width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
          >
            <polyline points="9 18 15 12 9 6" />
          </motion.svg>
        </button>
      </div>

      {/* Nav items */}
      <nav className="flex-1 px-2 py-4 flex flex-col gap-1 overflow-y-auto">
        {navItems.map((item, i) => {
          if (item.type === "separator") {
            if (collapsed) return null;
            return (
              <div key={`sep-${i}`} className="text-[10px] font-bold uppercase tracking-wider text-deep-sea-teal/30 px-4 pt-4 pb-1 first:pt-0">
                {item.label}
              </div>
            );
          }
          const active = isActive(item.href!);
          return (
            <Link
              key={item.href}
              href={item.href!}
              className={`flex items-center gap-3 rounded-xl transition-all duration-200 cursor-pointer relative ${
                collapsed ? "flex-col gap-1 px-0 py-3 justify-center" : "px-4 py-3"
              } ${
                active
                  ? "bg-chios-purple/10 text-chios-purple"
                  : "text-deep-sea-teal/60 hover:bg-deep-sea-teal/[0.03] hover:text-deep-sea-teal"
              }`}
            >
              <span className={active ? "text-chios-purple" : ""}>{item.icon}</span>
              <AnimatePresence>
                {!collapsed && (
                  <motion.span
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: "auto" }}
                    exit={{ opacity: 0, width: 0 }}
                    className={`text-sm whitespace-nowrap overflow-hidden ${active ? "font-semibold" : "font-medium"}`}
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>
              {item.badge && item.badge > 0 && (
                <span className={`absolute bg-danger-red text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center ${
                  collapsed ? "top-0.5 right-1" : "ml-auto static"
                }`}>
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom section */}
      <div className="p-2 border-t border-deep-sea-teal/5">
        {bottomContent}
      </div>
    </motion.aside>
  );
}
