import { NextResponse } from "next/server";
import { getAdminClient } from "@/lib/supabase-admin";
import { requireAdmin } from "@/lib/admin-guard";
import { isSuperAdmin } from "@/lib/permissions";

export async function GET(request: Request) {
  const { user, error } = await requireAdmin();
  if (error) return error;

  // Only super admin can access user management
  if (!isSuperAdmin(user.permissions)) {
    return NextResponse.json({ error: "Sadece super admin kullanıcı yönetimi yapabilir" }, { status: 403 });
  }

  const supabase = getAdminClient();
  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search");

  let query = supabase
    .from("users")
    .select("id, name, email, chios_box_id, is_admin, permissions, plan, created_at")
    .order("created_at", { ascending: false });

  if (search) {
    query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%,chios_box_id.ilike.%${search}%`);
  }

  const { data, error: queryError } = await query;

  if (queryError) {
    return NextResponse.json({ error: queryError.message }, { status: 500 });
  }

  return NextResponse.json({ data: data || [] });
}
