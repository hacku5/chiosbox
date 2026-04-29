import { NextResponse } from "next/server";
import { getAdminClient } from "@/lib/supabase-admin";
import { requireAdmin } from "@/lib/admin-guard";
import { uuid as uuidSchema } from "@/lib/validation";
import { z } from "zod";

const PACKAGE_STATUSES = [
  "BEKLENIYOR", "YOLDA", "DEPODA", "HAZIR",
  "BIRLESTIRILDI", "TESLIM_EDILDI", "IPTAL",
] as const;

const querySchema = z.object({
  tracking: z.string().max(100).optional(),
  status: z.enum(PACKAGE_STATUSES).optional(),
  demurrage: z.enum(["true", "false"]).optional(),
  chios_box_id: z.string().max(50).optional(),
  user_id: uuidSchema.optional(),
  uninvoiced: z.enum(["true", "false"]).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(50),
});

export async function GET(request: Request) {
  const { error } = await requireAdmin("packages");
  if (error) return error;

  const supabase = getAdminClient();
  const { searchParams } = new URL(request.url);

  // Validate and coerce query params
  const parsed = querySchema.safeParse({
    tracking: searchParams.get("tracking") || undefined,
    status: searchParams.get("status") || undefined,
    demurrage: searchParams.get("demurrage") || undefined,
    chios_box_id: searchParams.get("chios_box_id") || undefined,
    user_id: searchParams.get("user_id") || undefined,
    uninvoiced: searchParams.get("uninvoiced") || undefined,
    page: searchParams.get("page") || undefined,
    limit: searchParams.get("limit") || undefined,
  });

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid query parameters" },
      { status: 400 }
    );
  }

  const { tracking, status, demurrage, chios_box_id, user_id, uninvoiced, page, limit } = parsed.data;
  const offset = (page - 1) * limit;

  let query = supabase
    .from("packages")
    .select("*, users!inner(name, chios_box_id, email)", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (tracking) {
    // Strip SQL wildcards from user input
    const safeTracking = tracking.replace(/[%_]/g, "").slice(0, 100);
    if (safeTracking) {
      query = query.ilike("tracking_no", `%${safeTracking}%`);
    }
  }

  if (status) {
    query = query.eq("status", status);
  }

  if (chios_box_id) {
    query = query.eq("users.chios_box_id", chios_box_id);
  }

  if (demurrage === "true") {
    query = query.gt("storage_days_used", 0).order("storage_days_used", { ascending: false });
  }

  if (user_id) {
    query = query.eq("user_id", user_id);
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
    return NextResponse.json({ error: "Failed to load packages" }, { status: 500 });
  }

  return NextResponse.json({
    data,
    total: count || 0,
    page,
    limit,
    totalPages: Math.ceil((count || 0) / limit),
  });
}
