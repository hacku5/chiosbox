import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import { getAdminClient } from "@/lib/supabase-admin";
import { FEES } from "@/lib/fees";

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user: authUser } } = await supabase.auth.getUser();

  if (!authUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: appUser } = await supabase
    .from("users")
    .select("id")
    .eq("supabase_user_id", authUser.id)
    .single();

  if (!appUser) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const body = await request.json();
  const { package_ids } = body;

  if (!Array.isArray(package_ids) || package_ids.length < 2) {
    return NextResponse.json({ error: "At least 2 packages must be selected" }, { status: 400 });
  }

  const admin = getAdminClient();

  // Verify all packages belong to this user and are DEPODA
  const { data: packages, error: fetchErr } = await admin
    .from("packages")
    .select("*")
    .in("id", package_ids)
    .eq("user_id", appUser.id)
    .eq("status", "DEPODA");

  if (fetchErr || !packages || packages.length !== package_ids.length) {
    return NextResponse.json({ error: "All selected packages must be in warehouse" }, { status: 400 });
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
    return NextResponse.json({ error: "All selected packages are already invoiced" }, { status: 400 });
  }

  // Calculate fees
  const acceptTotal = uninvoicedPackages.length * FEES.ACCEPT;
  const consolidationFee = FEES.CONSOLIDATION;
  const total = acceptTotal + consolidationFee;

  // Generate a master box ID
  const masterBoxId = `MBX-${Date.now().toString(36).toUpperCase()}`;

  // Step 1: Create invoice FIRST (before modifying packages)
  const { data: invoice, error: invErr } = await admin
    .from("invoices")
    .insert({
      user_id: appUser.id,
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

  // Step 2: Create invoice items
  const invoiceItems = uninvoicedPackages.map((pkg) => ({
    invoice_id: invoice.id,
    package_id: pkg.id,
    fee_type: "accept",
    amount: FEES.ACCEPT,
  }));
  invoiceItems.push({
    invoice_id: invoice.id,
    package_id: uninvoicedPackages[0].id,
    fee_type: "consolidation",
    amount: FEES.CONSOLIDATION,
  });

  const { error: itemsErr } = await admin.from("invoice_items").insert(invoiceItems);

  if (itemsErr) {
    // Rollback: delete the invoice we just created
    await admin.from("invoices").delete().eq("id", invoice.id);
    return NextResponse.json({ error: "Invoice items could not be created" }, { status: 500 });
  }

  // Step 3: Update packages LAST (only after invoice + items are safe)
  const { error: updateErr } = await admin
    .from("packages")
    .update({
      master_box_id: masterBoxId,
      status: "BIRLESTIRILDI",
    })
    .in("id", package_ids);

  if (updateErr) {
    // Rollback: delete invoice items and invoice
    await admin.from("invoice_items").delete().eq("invoice_id", invoice.id);
    await admin.from("invoices").delete().eq("id", invoice.id);
    return NextResponse.json({ error: "Packages could not be updated" }, { status: 500 });
  }

  return NextResponse.json({
    success: true,
    master_box_id: masterBoxId,
    invoice_id: invoice.id,
    total,
  }, { status: 201 });
}
