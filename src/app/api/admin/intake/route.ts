import { NextResponse } from "next/server";
import { getAdminClient } from "@/lib/supabase-admin";
import { requireAdmin } from "@/lib/admin-guard";
import { FEES } from "@/lib/fees";
import { sendPushToUser } from "@/lib/send-notification";

export async function POST(request: Request) {
  const { user, error } = await requireAdmin("intake");
  if (error) return error;

  const supabase = getAdminClient();
  const body = await request.json();
  const { trackingNo, shelfLocation } = body;

  if (!trackingNo || !shelfLocation) {
    return NextResponse.json({ error: "Eksik bilgi" }, { status: 400 });
  }

  // Find the package by tracking number
  const { data: pkg, error: findError } = await supabase
    .from("packages")
    .select("*")
    .eq("tracking_no", trackingNo)
    .single();

  if (findError || !pkg) {
    return NextResponse.json({ error: "Paket bulunamadı" }, { status: 404 });
  }

  // Prevent duplicate intake
  if (pkg.status === "DEPODA") {
    return NextResponse.json({ error: "Bu paket zaten depoda kabul edilmiş" }, { status: 409 });
  }

  // Update package: set shelf, status, arrived_at
  const now = new Date().toISOString();
  const { data, error: updateError } = await supabase
    .from("packages")
    .update({
      status: "DEPODA",
      shelf_location: shelfLocation,
      arrived_at: now,
    })
    .eq("id", pkg.id)
    .select()
    .single();

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  // Auto-create invoice for this package
  const { data: invoice, error: invoiceError } = await supabase
    .from("invoices")
    .insert({
      user_id: pkg.user_id,
      accept_fee: FEES.ACCEPT,
      consolidation_fee: 0,
      demurrage_fee: 0,
      total: FEES.ACCEPT,
      status: "PENDING",
    })
    .select()
    .single();

  if (invoiceError) {
    console.error(`[INTAKE] Invoice creation failed for package ${pkg.id}:`, invoiceError.message);
    return NextResponse.json({
      ...data,
      _warning: "Fatura oluşturulamadı. Lütfen manuel olarak oluşturun.",
    }, { status: 200 });
  }

  // Link invoice to package
  if (invoice) {
    await supabase.from("invoice_items").insert({
      invoice_id: invoice.id,
      package_id: pkg.id,
      fee_type: "accept",
      amount: FEES.ACCEPT,
    });
  }

  // Push notification
  sendPushToUser(pkg.user_id, {
    title: "Paketiniz Geldi!",
    body: `${pkg.content} depoda kabul edildi`,
    url: "/dashboard/packages",
  }).catch(() => {});

  return NextResponse.json(data, { status: 200 });
}
