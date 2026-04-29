import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { createClient } from "@/lib/supabase-server";
import { AdminLayoutClient } from "./admin-layout-client";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const headersList = await headers();
  const pathname = headersList.get("x-pathname") || "";

  // Login sayfası auth check gerektirmez
  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  const supabase = await createClient();

  const { data: { user: authUser } } = await supabase.auth.getUser();
  if (!authUser) {
    redirect("/admin/login");
  }

  const { data: appUser } = await supabase
    .from("users")
    .select("id, name, is_admin, permissions")
    .eq("supabase_user_id", authUser.id)
    .single();

  if (!appUser?.is_admin) {
    redirect("/user");
  }

  return (
    <AdminLayoutClient
      adminUser={{
        id: appUser.id,
        name: appUser.name,
        is_admin: appUser.is_admin,
        permissions: Array.isArray(appUser.permissions) ? appUser.permissions as string[] : [],
      }}
    >
      {children}
    </AdminLayoutClient>
  );
}
