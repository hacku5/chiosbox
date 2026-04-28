import { NextResponse } from "next/server";
import { getAdminClient } from "@/lib/supabase-admin";
import { requireAdmin } from "@/lib/admin-guard";
import { isSuperAdmin } from "@/lib/permissions";

export async function GET(request: Request) {
  const { user, error } = await requireAdmin();
  if (error) return error;

  // Only super admin can access user management
  if (!isSuperAdmin(user.permissions)) {
    return NextResponse.json({ error: "Only super admin can manage users" }, { status: 403 });
  }

  const supabase = getAdminClient();
  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search") || "";
  const page = Math.max(1, Number(searchParams.get("page")) || 1);
  const limit = Math.min(100, Math.max(1, Number(searchParams.get("limit")) || 20));
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = supabase
    .from("users")
    .select("id, name, email, chios_box_id, is_admin, permissions, plan, created_at", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, to);

  if (search) {
    query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%,chios_box_id.ilike.%${search}%`);
  }

  const { data, error: queryError, count } = await query;

  if (queryError) {
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
  }

  return NextResponse.json({ data: data || [], total: count ?? 0, page, limit });
}
