import { NextResponse } from "next/server";
import { getAdminClient } from "@/lib/supabase-admin";
import { requireAdmin } from "@/lib/admin-guard";
import { getFreeStorageDays, getDailyDemurrage } from "@/lib/fees";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireAdmin("packages");
  if (error) return error;

  const { id } = await params;
  const supabase = getAdminClient();

  const { data, error: queryError } = await supabase
    .from("packages")
    .select("*, users!inner(name, chios_box_id, email)")
    .eq("id", id)
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
  const { error } = await requireAdmin("packages");
  if (error) return error;

  const { id } = await params;
  const supabase = getAdminClient();
  const body = await request.json();

  // Apply demurrage fee
  if (body.apply_demurrage) {
    const { data: pkg, error: fetchErr } = await supabase
      .from("packages")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchErr || !pkg) {
      return NextResponse.json({ error: "Package not found" }, { status: 404 });
    }

    const [freeDays, dailyRate] = await Promise.all([getFreeStorageDays(), getDailyDemurrage()]);
    const overdueDays = Math.max(0, (pkg.storage_days_used || 0) - freeDays);
    if (overdueDays <= 0) {
      return NextResponse.json({ error: "No days for demurrage fee" }, { status: 400 });
    }

    const demurrageAmount = overdueDays * dailyRate;

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
      return NextResponse.json({ error: "A pending demurrage invoice already exists for this package" }, { status: 409 });
    }

    const { data, error: updateErr } = await supabase
      .from("packages")
      .update({ demurrage_fee: demurrageAmount })
      .eq("id", id)
      .select()
      .single();

    if (updateErr) {
      return NextResponse.json({ error: updateErr.message }, { status: 500 });
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

    return NextResponse.json(data);
  }

  const updateData: Record<string, unknown> = {};
  const allowedFields = ["status", "shelf_location", "warehouse_photo_url", "arrived_at"];
  for (const key of allowedFields) {
    if (body[key] !== undefined) updateData[key] = body[key];
  }

  // Validate status transitions
  if (updateData.status) {
    const allowedStatuses = ["BEKLENIYOR", "YOLDA", "DEPODA", "HAZIR", "BIRLESTIRILDI", "TESLIM_EDILDI", "IPTAL"];
    if (!allowedStatuses.includes(updateData.status as string)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const { data: currentPkg } = await supabase
      .from("packages")
      .select("status")
      .eq("id", id)
      .single();

    if (currentPkg) {
      const validTransitions: Record<string, string[]> = {
        BEKLENIYOR: ["YOLDA", "IPTAL"],
        YOLDA: ["DEPODA", "IPTAL"],
        DEPODA: ["HAZIR", "BIRLESTIRILDI", "IPTAL"],
        HAZIR: ["TESLIM_EDILDI", "DEPODA"],
        BIRLESTIRILDI: ["TESLIM_EDILDI", "DEPODA"],
        IPTAL: ["BEKLENIYOR"],
        TESLIM_EDILDI: [],
      };
      const allowed = validTransitions[currentPkg.status] || [];
      if (!allowed.includes(updateData.status as string)) {
        return NextResponse.json(
          { error: `Cannot transition from ${currentPkg.status} to ${updateData.status}` },
          { status: 400 }
        );
      }
    }
  }

  const { data, error: updateErr } = await supabase
    .from("packages")
    .update(updateData)
    .eq("id", id)
    .select()
    .single();

  if (updateErr) {
    return NextResponse.json({ error: updateErr.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireAdmin("packages");
  if (error) return error;

  const { id } = await params;
  const supabase = getAdminClient();

  const { error: deleteErr } = await supabase
    .from("packages")
    .delete()
    .eq("id", id);

  if (deleteErr) {
    return NextResponse.json({ error: deleteErr.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
