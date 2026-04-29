import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import { isTourRequest, tourMockResponse } from "@/lib/tour-guard";

export async function GET() {
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

  const { data, error } = await supabase
    .from("invoices")
    .select("*")
    .eq("user_id", appUser.id)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: "Operation failed" }, { status: 500 });
  }

  // Fetch invoice items with package info
  const invoiceIds = (data || []).map((inv) => inv.id);
  let itemsMap: Record<string, Array<{ fee_type: string; amount: number; packages: { tracking_no: string; content: string } | null }>> = {};

  if (invoiceIds.length > 0) {
    const { data: items } = await supabase
      .from("invoice_items")
      .select("invoice_id, fee_type, amount, packages(tracking_no, content)")
      .in("invoice_id", invoiceIds);

    if (items) {
      for (const item of items) {
        if (!itemsMap[item.invoice_id]) itemsMap[item.invoice_id] = [];
        const pkg = Array.isArray(item.packages) ? item.packages[0] : item.packages;
        itemsMap[item.invoice_id].push({
          fee_type: item.fee_type,
          amount: Number(item.amount),
          packages: pkg ? { tracking_no: pkg.tracking_no, content: pkg.content } : null,
        });
      }
    }
  }

  const enriched = (data || []).map((inv) => ({
    ...inv,
    items: itemsMap[inv.id] || [],
  }));

  return NextResponse.json(enriched);
}

export async function PATCH(request: Request) {
  if (isTourRequest(request)) {
    return tourMockResponse({ qr_code: "QR-CBX-TOUR-001" });
  }

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

  // Only allow paying PENDING invoices
  const { data: existing, error: fetchErr } = await supabase
    .from("invoices")
    .select("id, status")
    .eq("id", body.id)
    .eq("user_id", appUser.id)
    .single();

  if (fetchErr || !existing) {
    return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
  }

  if (existing.status !== "PENDING") {
    return NextResponse.json(
      { error: "This invoice is already paid or cancelled" },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from("invoices")
    .update({
      status: "PAID",
      paid_at: new Date().toISOString(),
      qr_code: `QR-CBX-${Date.now()}`,
    })
    .eq("id", body.id)
    .eq("user_id", appUser.id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: "Operation failed" }, { status: 500 });
  }

  return NextResponse.json(data);
}
