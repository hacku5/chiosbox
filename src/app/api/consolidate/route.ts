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
    return NextResponse.json({ error: "Kullanıcı bulunamadı" }, { status: 404 });
  }

  const body = await request.json();
  const { package_ids } = body;

  if (!Array.isArray(package_ids) || package_ids.length < 2) {
    return NextResponse.json({ error: "En az 2 paket seçilmeli" }, { status: 400 });
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
    return NextResponse.json({ error: "Seçilen paketlerin tamamı depoda olmalı" }, { status: 400 });
  }

  // Check if any are already invoiced
  const { data: existingItems } = await admin
    .from("invoice_items")
    .select("package_id")
    .in("package_id", package_ids)
    .in("fee_type", ["accept", "consolidation"]);

  const alreadyInvoiced = new Set((existingItems || []).map((i) => i.package_id));
  const uninvoicedPackages = packages.filter((p) => !alreadyInvoiced.has(p.id));

  // Calculate fees
  const acceptTotal = uninvoicedPackages.length * FEES.ACCEPT;
  const consolidationFee = FEES.CONSOLIDATION;
  const total = acceptTotal + consolidationFee;

  // Generate a master box ID
  const masterBoxId = `MBX-${Date.now().toString(36).toUpperCase()}`;

  // Update packages: set master_box_id and status to BIRLESTIRILDI
  const { error: updateErr } = await admin
    .from("packages")
    .update({
      master_box_id: masterBoxId,
      status: "BIRLESTIRILDI",
    })
    .in("id", package_ids);

  if (updateErr) {
    return NextResponse.json({ error: updateErr.message }, { status: 500 });
  }

  // Create invoice
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
    return NextResponse.json({ error: invErr.message }, { status: 500 });
  }

  // Create invoice items for each package
  const invoiceItems = [];
  for (const pkg of uninvoicedPackages) {
    invoiceItems.push({
      invoice_id: invoice.id,
      package_id: pkg.id,
      fee_type: "accept",
      amount: FEES.ACCEPT,
    });
  }
  // Add consolidation fee item linked to first package
  invoiceItems.push({
    invoice_id: invoice.id,
    package_id: uninvoicedPackages[0].id,
    fee_type: "consolidation",
    amount: FEES.CONSOLIDATION,
  });

  await admin.from("invoice_items").insert(invoiceItems);

  return NextResponse.json({
    success: true,
    master_box_id: masterBoxId,
    invoice_id: invoice.id,
    total,
  }, { status: 201 });
}
