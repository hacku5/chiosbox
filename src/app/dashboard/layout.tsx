import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase-server";
import { Sidebar } from "@/components/dashboard/sidebar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  const { data: { user: authUser } } = await supabase.auth.getUser();
  if (!authUser) {
    redirect("/login");
  }

  const { data: appUser } = await supabase
    .from("users")
    .select("is_admin")
    .eq("supabase_user_id", authUser.id)
    .single();

  // Admin kullanıcıları müşteri dashboard'una giremez
  if (appUser?.is_admin) {
    redirect("/admin");
  }

  return (
    <div className="min-h-screen bg-mastic-white">
      <Sidebar />
      <main className="lg:ml-64 pb-20 lg:pb-0">
        {children}
      </main>
    </div>
  );
}
