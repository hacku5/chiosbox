import { NextResponse } from "next/server";
import { getAdminClient } from "@/lib/supabase-admin";
import { requireAdmin } from "@/lib/admin-guard";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { user: adminUser, error } = await requireAdmin("customers");
  if (error) return error;

  const { id } = await params;
  const supabase = getAdminClient();

  // Get customer info — only expose permissions to super admins
  const selectFields = adminUser.permissions?.includes("*")
    ? "id, name, email, chios_box_id, phone, address, plan, plan_status, created_at, is_admin, permissions"
    : "id, name, email, chios_box_id, phone, address, plan, plan_status, created_at";

  const { data: user, error: userError } = await supabase
    .from("users")
    .select(selectFields)
    .eq("id", id)
    .single();

  if (userError || !user) {
    return NextResponse.json({ error: "Müşteri bulunamadı" }, { status: 404 });
  }

  // Get packages
  const { data: packages } = await supabase
    .from("packages")
    .select("*")
    .eq("user_id", id)
    .order("created_at", { ascending: false });

  // Get invoices
  const { data: invoices } = await supabase
    .from("invoices")
    .select("*")
    .eq("user_id", id)
    .order("created_at", { ascending: false });

  const totalSpent = (invoices || [])
    .filter((i) => i.status === "PAID")
    .reduce((sum, i) => sum + Number(i.total), 0);

  const pendingTotal = (invoices || [])
    .filter((i) => i.status === "PENDING")
    .reduce((sum, i) => sum + Number(i.total), 0);

  return NextResponse.json({
    user,
    packages: packages || [],
    invoices: invoices || [],
    totalSpent,
    pendingTotal,
  });
}
