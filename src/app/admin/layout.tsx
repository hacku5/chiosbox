import { AdminSidebar } from "@/components/admin/admin-sidebar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-100">
      <AdminSidebar />
      <main className="lg:ml-20 pb-24 lg:pb-0">
        {children}
      </main>
    </div>
  );
}
