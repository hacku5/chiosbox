import { NextResponse } from "next/server";
import { getAdminClient } from "@/lib/supabase-admin";
import { requireAdmin, auditLog } from "@/lib/admin-guard";
import { adminIntakeSchema, validateBody } from "@/lib/validation";
import { getAcceptFee } from "@/lib/fees";
import { sendPushToUser } from "@/lib/send-notification";
import { checkRateLimit, rateLimitResponse } from "@/lib/rate-limit";

export async function POST(request: Request) {
  const { user, error } = await requireAdmin("intake");
  if (error) return error;

  const rl = checkRateLimit(request, "ADMIN", "intake:create");
  if (!rl.success) return rateLimitResponse(rl.resetAt);

  const body = await request.json();
  const parsed = validateBody(adminIntakeSchema, body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  const { trackingNo, shelfLocation } = parsed.data;
  const acceptFee = await getAcceptFee();
  const supabase = getAdminClient();

  // Find the package by tracking number
  const { data: pkg, error: findError } = await supabase
    .from("packages")
    .select("*")
    .eq("tracking_no", trackingNo)
    .single();

  if (findError || !pkg) {
    return NextResponse.json({ error: "Package not found" }, { status: 404 });
  }

  // Prevent intake of already-processed packages
  const nonIntakeStatuses = ["DEPODA", "BIRLESTIRILDI", "TESLIM_EDILDI", "HAZIR", "IPTAL"];
  if (nonIntakeStatuses.includes(pkg.status)) {
    return NextResponse.json({ error: "This package has already been processed" }, { status: 409 });
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
    return NextResponse.json({ error: "Intake failed" }, { status: 500 });
  }

  // Auto-create invoice for this package
  const { data: invoice, error: invoiceError } = await supabase
    .from("invoices")
    .insert({
      user_id: pkg.user_id,
      accept_fee: acceptFee,
      consolidation_fee: 0,
      demurrage_fee: 0,
      total: acceptFee,
      status: "PENDING",
    })
    .select()
    .single();

  if (invoiceError) {
    console.error(`[INTAKE] Invoice creation failed for package ${pkg.id}:`, invoiceError.message);
    await auditLog("intake:create", user.id, pkg.id, { trackingNo });
    return NextResponse.json({
      ...data,
      _warning: "Invoice could not be created. Please create it manually.",
    }, { status: 200 });
  }

  // Link invoice to package
  if (invoice) {
    await supabase.from("invoice_items").insert({
      invoice_id: invoice.id,
      package_id: pkg.id,
      fee_type: "accept",
      amount: acceptFee,
    });
  }

  // Push notification
  sendPushToUser(pkg.user_id, {
    title: "Paketiniz Geldi!",
    body: `${pkg.content} depoda kabul edildi`,
    url: "/dashboard/packages",
  }).catch(() => {});

  await auditLog("intake:create", user.id, pkg.id, { trackingNo });

  return NextResponse.json(data, { status: 200 });
}
