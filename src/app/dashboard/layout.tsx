import { Sidebar } from "@/components/dashboard/sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-mastic-white">
      <Sidebar />
      <main className="lg:ml-64 pb-20 lg:pb-0">
        {children}
      </main>
    </div>
  );
}
