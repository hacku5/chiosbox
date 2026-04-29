import { NextResponse } from "next/server";
import { getAdminClient } from "@/lib/supabase-admin";
import { getAcceptFee, getConsolidationFee } from "@/lib/fees";
import { requireAuth } from "@/lib/auth-guard";
import { checkRateLimit, rateLimitResponse } from "@/lib/rate-limit";
import { consolidateSchema, validateBody } from "@/lib/validation";

export async function POST(request: Request) {
  const rl = checkRateLimit(request, "DEFAULT", "consolidate");
  if (!rl.success) return rateLimitResponse(rl.resetAt);

  const { user, error } = await requireAuth();
  if (error) return error;

  const body = await request.json();
  const parsed = validateBody(consolidateSchema, body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  const { package_ids } = parsed.data;

  const admin = getAdminClient();

  // Verify all packages belong to this user and are DEPODA
  const { data: packages, error: fetchErr } = await admin
    .from("packages")
    .select("*")
    .in("id", package_ids)
    .eq("user_id", user.id)
    .eq("status", "DEPODA");

  if (fetchErr || !packages || packages.length !== package_ids.length) {
    return NextResponse.json(
      { error: "All selected packages must be in warehouse" },
      { status: 400 }
    );
  }

  // Check if any are already invoiced
  const { data: existingItems } = await admin
    .from("invoice_items")
    .select("package_id")
    .in("package_id", package_ids)
    .in("fee_type", ["accept", "consolidation"]);

  const alreadyInvoiced = new Set((existingItems || []).map((i) => i.package_id));
  const uninvoicedPackages = packages.filter((p) => !alreadyInvoiced.has(p.id));

  if (uninvoicedPackages.length === 0) {
    return NextResponse.json(
      { error: "All selected packages are already invoiced" },
      { status: 400 }
    );
  }

  const acceptRate = await getAcceptFee();
  const consolidationFee = await getConsolidationFee();
  const acceptTotal = uninvoicedPackages.length * acceptRate;
  const total = acceptTotal + consolidationFee;

  const masterBoxId = `MBX-${Date.now().toString(36).toUpperCase()}`;

  // Create invoice
  const { data: invoice, error: invErr } = await admin
    .from("invoices")
    .insert({
      user_id: user.id,
      accept_fee: acceptTotal,
      consolidation_fee: consolidationFee,
      demurrage_fee: 0,
      total,
      status: "PENDING",
    })
    .select()
    .single();

  if (invErr) {
    return NextResponse.json({ error: "Invoice could not be created" }, { status: 500 });
  }

  // Create invoice items
  const invoiceItems = uninvoicedPackages.map((pkg) => ({
    invoice_id: invoice.id,
    package_id: pkg.id,
    fee_type: "accept",
    amount: acceptRate,
  }));
  invoiceItems.push({
    invoice_id: invoice.id,
    package_id: uninvoicedPackages[0].id,
    fee_type: "consolidation",
    amount: consolidationFee,
  });

  const { error: itemsErr } = await admin.from("invoice_items").insert(invoiceItems);
  if (itemsErr) {
    await admin.from("invoices").delete().eq("id", invoice.id);
    return NextResponse.json({ error: "Invoice items could not be created" }, { status: 500 });
  }

  // Update packages
  const { error: updateErr } = await admin
    .from("packages")
    .update({ master_box_id: masterBoxId, status: "BIRLESTIRILDI" })
    .in("id", package_ids);

  if (updateErr) {
    await admin.from("invoice_items").delete().eq("invoice_id", invoice.id);
    await admin.from("invoices").delete().eq("id", invoice.id);
    return NextResponse.json({ error: "Packages could not be updated" }, { status: 500 });
  }

  return NextResponse.json(
    { success: true, master_box_id: masterBoxId, invoice_id: invoice.id, total },
    { status: 201 }
  );
}
