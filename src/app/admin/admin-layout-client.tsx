"use client";

import { createContext, useContext } from "react";
import { AdminSidebar } from "@/components/admin/admin-sidebar";

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

export function AdminLayoutClient({
  adminUser,
  children,
}: {
  adminUser: AdminUserData;
  children: React.ReactNode;
}) {
  return (
    <AdminUserContext.Provider value={adminUser}>
      <div className="min-h-screen bg-gray-100">
        <AdminSidebar />
        <main className="lg:ml-20 pt-14 lg:pt-0">
          {children}
        </main>
      </div>
    </AdminUserContext.Provider>
  );
}
