"use client";

import { SidebarDesktop } from "./sidebar-desktop";
import { SidebarMobileBottom } from "./sidebar-mobile-bottom";
import { SidebarMobileDrawer } from "./sidebar-mobile-drawer";
import type { NavItem } from "./types";

interface AppSidebarProps {
  navItems: NavItem[];
  bottomBarItems: NavItem[];
  desktopBottomContent?: React.ReactNode;
  drawerProfileContent?: React.ReactNode;
  drawerBottomContent?: React.ReactNode;
}

export function AppSidebar({
  navItems,
  bottomBarItems,
  desktopBottomContent,
  drawerProfileContent,
  drawerBottomContent,
}: AppSidebarProps) {
  return (
    <>
      {/* Desktop */}
      <SidebarDesktop navItems={navItems} bottomContent={desktopBottomContent} />

      {/* Mobile */}
      <SidebarMobileBottom items={bottomBarItems} />
      <SidebarMobileDrawer
        navItems={navItems}
        profileContent={drawerProfileContent}
        bottomContent={drawerBottomContent}
      />
    </>
  );
}
