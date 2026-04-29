import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase-server";
import { UserLayoutClient } from "./user-layout-client";

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

  if (appUser?.is_admin) {
    redirect("/admin");
  }

  return <UserLayoutClient>{children}</UserLayoutClient>;
}
