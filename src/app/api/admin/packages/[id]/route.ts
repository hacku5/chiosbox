import { NextResponse } from "next/server";
import { getAdminClient } from "@/lib/supabase-admin";
import { requireAdmin, auditLog } from "@/lib/admin-guard";
import { getFreeStorageDays, getDailyDemurrage } from "@/lib/fees";
import { uuid as uuidSchema } from "@/lib/validation";
import { checkRateLimit, rateLimitResponse } from "@/lib/rate-limit";

const PACKAGE_STATUSES = [
  "BEKLENIYOR", "YOLDA", "DEPODA", "HAZIR",
  "BIRLESTIRILDI", "TESLIM_EDILDI", "IPTAL",
];

const VALID_TRANSITIONS: Record<string, string[]> = {
  BEKLENIYOR: ["YOLDA", "IPTAL"],
  YOLDA: ["DEPODA", "IPTAL"],
  DEPODA: ["HAZIR", "BIRLESTIRILDI", "IPTAL"],
  HAZIR: ["TESLIM_EDILDI", "DEPODA"],
  BIRLESTIRILDI: ["TESLIM_EDILDI", "DEPODA"],
  IPTAL: ["BEKLENIYOR"],
  TESLIM_EDILDI: [],
};

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireAdmin("packages");
  if (error) return error;

  const { id } = await params;

  // Validate UUID
  const idParsed = uuidSchema.safeParse(id);
  if (!idParsed.success) {
    return NextResponse.json({ error: "Invalid package ID" }, { status: 400 });
  }

  const supabase = getAdminClient();

  const { data, error: queryError } = await supabase
    .from("packages")
    .select("*, users!inner(name, chios_box_id, email)")
    .eq("id", idParsed.data)
    .single();

  if (queryError || !data) {
    return NextResponse.json({ error: "Package not found" }, { status: 404 });
  }

  return NextResponse.json(data);
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { user, error } = await requireAdmin("packages");
  if (error) return error;

  const rl = checkRateLimit(request, "ADMIN", "package:admin_update");
  if (!rl.success) return rateLimitResponse(rl.resetAt);

  const { id } = await params;

  // Validate UUID
  const idParsed = uuidSchema.safeParse(id);
  if (!idParsed.success) {
    return NextResponse.json({ error: "Invalid package ID" }, { status: 400 });
  }

  const supabase = getAdminClient();
  const body = await request.json();

  // Apply demurrage fee
  if (body.apply_demurrage) {
    const { data: pkg, error: fetchErr } = await supabase
      .from("packages")
      .select("*")
      .eq("id", idParsed.data)
      .single();

    if (fetchErr || !pkg) {
      return NextResponse.json({ error: "Package not found" }, { status: 404 });
    }

    const freeStorageDays = await getFreeStorageDays();
    const overdueDays = Math.max(0, (pkg.storage_days_used || 0) - freeStorageDays);
    if (overdueDays <= 0) {
      return NextResponse.json({ error: "No days for demurrage fee" }, { status: 400 });
    }

    const demurrageAmount = overdueDays * (await getDailyDemurrage());

    // Check if a demurrage invoice already exists for this package
    const { data: existingDemurrage } = await supabase
      .from("invoice_items")
      .select("id, invoices!inner(status)")
      .eq("package_id", pkg.id)
      .eq("fee_type", "demurrage");

    const hasActiveDemurrage = (existingDemurrage || []).some(
      (item) => (item.invoices as unknown as { status: string })?.status === "PENDING"
    );

    if (hasActiveDemurrage) {
      return NextResponse.json(
        { error: "A pending demurrage invoice already exists for this package" },
        { status: 409 }
      );
    }

    const { data, error: updateErr } = await supabase
      .from("packages")
      .update({ demurrage_fee: demurrageAmount })
      .eq("id", idParsed.data)
      .select()
      .single();

    if (updateErr) {
      return NextResponse.json({ error: "Failed to update package" }, { status: 500 });
    }

    // Create a demurrage invoice
    const { data: demurrageInvoice } = await supabase
      .from("invoices")
      .insert({
        user_id: pkg.user_id,
        accept_fee: 0,
        consolidation_fee: 0,
        demurrage_fee: demurrageAmount,
        total: demurrageAmount,
        status: "PENDING",
      })
      .select()
      .single();

    // Link invoice to package
    if (demurrageInvoice) {
      await supabase.from("invoice_items").insert({
        invoice_id: demurrageInvoice.id,
        package_id: pkg.id,
        fee_type: "demurrage",
        amount: demurrageAmount,
      });
    }

    auditLog("package.demurrage", user.id, `package:${idParsed.data}`, {
      overdueDays,
      demurrageAmount,
    });
    return NextResponse.json(data);
  }

  const updateData: Record<string, unknown> = {};
  const allowedFields = ["status", "shelf_location", "warehouse_photo_url", "arrived_at"];
  for (const key of allowedFields) {
    if (body[key] !== undefined) updateData[key] = body[key];
  }

  // Validate status transitions
  if (updateData.status) {
    if (!PACKAGE_STATUSES.includes(updateData.status as string)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const { data: currentPkg } = await supabase
      .from("packages")
      .select("status")
      .eq("id", idParsed.data)
      .single();

    if (currentPkg) {
      const allowed = VALID_TRANSITIONS[currentPkg.status] || [];
      if (!allowed.includes(updateData.status as string)) {
        return NextResponse.json(
          { error: "Invalid status transition" },
          { status: 400 }
        );
      }
    }
  }

  const { data, error: updateErr } = await supabase
    .from("packages")
    .update(updateData)
    .eq("id", idParsed.data)
    .select()
    .single();

  if (updateErr) {
    return NextResponse.json({ error: "Failed to update package" }, { status: 500 });
  }

  auditLog("package.update", user.id, `package:${idParsed.data}`, { updateData });
  return NextResponse.json(data);
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { user, error } = await requireAdmin("packages");
  if (error) return error;

  const rl = checkRateLimit(request, "ADMIN", "package:admin_delete");
  if (!rl.success) return rateLimitResponse(rl.resetAt);

  const { id } = await params;

  // Validate UUID
  const idParsed = uuidSchema.safeParse(id);
  if (!idParsed.success) {
    return NextResponse.json({ error: "Invalid package ID" }, { status: 400 });
  }

  const supabase = getAdminClient();

  const { error: deleteErr } = await supabase
    .from("packages")
    .delete()
    .eq("id", idParsed.data);

  if (deleteErr) {
    return NextResponse.json({ error: "Failed to delete package" }, { status: 500 });
  }

  auditLog("package.delete", user.id, `package:${idParsed.data}`);
  return NextResponse.json({ success: true });
}
