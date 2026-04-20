import { NextResponse } from "next/server";
import { getAdminClient } from "@/lib/supabase-admin";
import { requireAdmin } from "@/lib/admin-guard";

export async function GET(request: Request) {
  const { error } = await requireAdmin("packages");
  if (error) return error;

  const supabase = getAdminClient();
  const { searchParams } = new URL(request.url);

  const tracking = searchParams.get("tracking");
  const status = searchParams.get("status");
  const demurrage = searchParams.get("demurrage");
  const chiosBoxId = searchParams.get("chios_box_id");
  const userId = searchParams.get("user_id");
  const uninvoiced = searchParams.get("uninvoiced");
  const page = Math.max(1, parseInt(searchParams.get("page") || "1") || 1);
  const limit = Math.min(Math.max(1, parseInt(searchParams.get("limit") || "50") || 50), 100);
  const offset = (page - 1) * limit;

  let query = supabase
    .from("packages")
    .select("*, users!inner(name, chios_box_id, email)", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (tracking) {
    query = query.ilike("tracking_no", `%${tracking}%`);
  }

  if (status) {
    query = query.eq("status", status);
  }

  if (chiosBoxId) {
    query = query.eq("users.chios_box_id", chiosBoxId);
  }

  if (demurrage === "true") {
    query = query.gt("storage_days_used", 0).order("storage_days_used", { ascending: false });
  }

  if (userId) {
    query = query.eq("user_id", userId);
  }

  // Exclude already invoiced packages
  if (uninvoiced === "true") {
    const { data: invoicedItems } = await supabase
      .from("invoice_items")
      .select("package_id");

    const invoicedIds = (invoicedItems || []).map((i) => i.package_id);
    if (invoicedIds.length > 0) {
      query = query.not("id", "in", `(${invoicedIds.join(",")})`);
    }
  }

  const { data, error: queryError, count } = await query;

  if (queryError) {
    return NextResponse.json({ error: queryError.message }, { status: 500 });
  }

  return NextResponse.json({
    data,
    total: count || 0,
    page,
    limit,
    totalPages: Math.ceil((count || 0) / limit),
  });
}
