import { NextResponse } from "next/server";
import { getAdminClient } from "@/lib/supabase-admin";
import { requireAdmin } from "@/lib/admin-guard";

export async function GET(request: Request) {
  const { error } = await requireAdmin("customers");
  if (error) return error;

  const supabase = getAdminClient();
  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search");
  const page = Math.max(1, parseInt(searchParams.get("page") || "1") || 1);
  const limit = Math.min(Math.max(1, parseInt(searchParams.get("limit") || "20") || 20), 100);
  const offset = (page - 1) * limit;

  let query = supabase
    .from("users")
    .select("id, name, email, chios_box_id, phone, plan, created_at, is_admin", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (search) {
    query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%,chios_box_id.ilike.%${search}%`);
  }

  const { data: users, error: queryError, count } = await query;

  if (queryError) {
    return NextResponse.json({ error: queryError.message }, { status: 500 });
  }

  // Get package counts and pending invoice totals for each user
  const userIds = (users || []).map((u) => u.id);

  const { data: packageCounts } = await supabase
    .from("packages")
    .select("user_id, status")
    .in("user_id", userIds);

  const { data: invoices } = await supabase
    .from("invoices")
    .select("user_id, total, status")
    .in("user_id", userIds);

  const customerData = (users || []).map((user) => {
    const userPackages = (packageCounts || []).filter((p) => p.user_id === user.id);
    const userInvoices = (invoices || []).filter((i) => i.user_id === user.id);
    const pendingTotal = userInvoices
      .filter((i) => i.status === "PENDING")
      .reduce((sum, i) => sum + Number(i.total), 0);

    return {
      ...user,
      packageCount: userPackages.length,
      pendingInvoiceTotal: pendingTotal,
    };
  });

  return NextResponse.json({
    data: customerData,
    total: count || 0,
    page,
    limit,
    totalPages: Math.ceil((count || 0) / limit),
  });
}
