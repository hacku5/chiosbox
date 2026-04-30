import type { ReactNode } from "react";

export interface NavItem {
  type?: "link" | "separator";
  label: string;
  href?: string;
  icon?: ReactNode;
  badge?: number;
  isActive?: boolean;
}
