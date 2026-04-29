import { NextResponse } from "next/server";
import { getAdminClient } from "@/lib/supabase-admin";
import { requireAdmin, auditLog } from "@/lib/admin-guard";
import { adminInvoiceSchema, validateBody } from "@/lib/validation";
import { FEES } from "@/lib/fees";
import { sendPushToUser } from "@/lib/send-notification";
import { checkRateLimit, rateLimitResponse } from "@/lib/rate-limit";

export async function GET(request: Request) {
  const { error } = await requireAdmin("invoices");
  if (error) return error;

  const supabase = getAdminClient();
  const { searchParams } = new URL(request.url);

  const status = searchParams.get("status");
  const search = searchParams.get("search");
  const page = Math.max(1, Number(searchParams.get("page")) || 1);
  const limit = Math.min(100, Math.max(1, Number(searchParams.get("limit")) || 20));
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = supabase
    .from("invoices")
    .select("*, users!inner(name, chios_box_id, email)", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, to);

  if (status) {
    query = query.eq("status", status);
  }

  if (search) {
    query = query.ilike("users.name", `%${search}%`);
  }

  const { data, error: queryError, count } = await query;

  if (queryError) {
    return NextResponse.json({ error: "Failed to fetch invoices" }, { status: 500 });
  }

  // Fetch invoice items with package info for all invoices
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

  return NextResponse.json({
    data: enriched,
    total: count || 0,
    page,
    limit,
    totalPages: Math.ceil((count || 0) / limit),
  });
}

export async function POST(request: Request) {
  const { user, error } = await requireAdmin("invoices");
  if (error) return error;

  const rl = checkRateLimit(request, "ADMIN", "invoice:create");
  if (!rl.success) return rateLimitResponse(rl.resetAt);

  const supabase = getAdminClient();
  const body = await request.json();

  // Validate common fields with zod
  const parsed = validateBody(adminInvoiceSchema, body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  // Verify user exists
  const { data: targetUser } = await supabase
    .from("users")
    .select("id")
    .eq("id", parsed.data.user_id)
    .single();

  if (!targetUser) {
    return NextResponse.json({ error: "Customer not found" }, { status: 404 });
  }

  // Mode 1: Package-based invoice (new flow)
  if (Array.isArray(body.package_ids) && body.package_ids.length > 0) {
    // Fetch the selected packages
    const { data: packages, error: fetchErr } = await supabase
      .from("packages")
      .select("*")
      .in("id", body.package_ids)
      .eq("user_id", parsed.data.user_id);

    if (fetchErr || !packages || packages.length === 0) {
      return NextResponse.json({ error: "Selected packages not found" }, { status: 400 });
    }

    // Check which packages are already invoiced
    const { data: existingItems } = await supabase
      .from("invoice_items")
      .select("package_id")
      .in("package_id", body.package_ids);

    const alreadyInvoiced = new Set((existingItems || []).map((i) => i.package_id));
    const uninvoicedPackages = packages.filter((p) => !alreadyInvoiced.has(p.id));

    if (uninvoicedPackages.length === 0) {
      return NextResponse.json({ error: "Selected packages already invoiced" }, { status: 400 });
    }

    // Calculate fees per package
    let totalAccept = 0;
    let totalDemurrage = 0;
    const invoiceItemsData: Array<{ package_id: string; fee_type: string; amount: number }> = [];

    for (const pkg of uninvoicedPackages) {
      // Accept fee
      totalAccept += FEES.ACCEPT;
      invoiceItemsData.push({
        package_id: pkg.id,
        fee_type: "accept",
        amount: FEES.ACCEPT,
      });

      // Demurrage fee if applicable
      const overdueDays = Math.max(0, (pkg.storage_days_used || 0) - FEES.FREE_STORAGE_DAYS);
      if (overdueDays > 0) {
        const demurrageAmount = overdueDays * FEES.DAILY_DEMURRAGE;
        totalDemurrage += demurrageAmount;
        invoiceItemsData.push({
          package_id: pkg.id,
          fee_type: "demurrage",
          amount: demurrageAmount,
        });
      }
    }

    // Consolidation fee (optional, one-time per invoice)
    const consolidationFee = body.consolidation_fee ? FEES.CONSOLIDATION : 0;
    const total = totalAccept + totalDemurrage + consolidationFee;

    // Create invoice
    const { data: invoice, error: invErr } = await supabase
      .from("invoices")
      .insert({
        user_id: parsed.data.user_id,
        accept_fee: totalAccept,
        consolidation_fee: consolidationFee,
        demurrage_fee: totalDemurrage,
        total,
        status: "PENDING",
      })
      .select()
      .single();

    if (invErr) {
      return NextResponse.json({ error: "Invoice creation failed" }, { status: 500 });
    }

    // Insert invoice items
    const itemsToInsert = invoiceItemsData.map((item) => ({
      ...item,
      invoice_id: invoice.id,
    }));

    await supabase.from("invoice_items").insert(itemsToInsert);

    // Push notification
    sendPushToUser(parsed.data.user_id, {
      title: "New Invoice",
      body: `€${total.toFixed(2)} you have an invoice`,
      url: "/dashboard/checkout",
    }).catch(() => {});

    await auditLog("invoice:create", user.id, invoice.id, {
      target_user: parsed.data.user_id,
      package_ids: body.package_ids,
      total,
    });

    return NextResponse.json({ ...invoice, items: itemsToInsert }, { status: 201 });
  }

  // Mode 2: Manual invoice (legacy flow)
  const acceptFee = Number(body.accept_fee) || 0;
  const consolidationFee = Number(body.consolidation_fee) || 0;
  const demurrageFee = Number(body.demurrage_fee) || 0;
  const total = acceptFee + consolidationFee + demurrageFee;

  if (total <= 0) {
    return NextResponse.json({ error: "Total amount must be greater than zero" }, { status: 400 });
  }

  // Reasonable upper bound: EUR5000 per invoice
  if (total > 5000) {
    return NextResponse.json({ error: "Total amount too high" }, { status: 400 });
  }

  const { data, error: insertError } = await supabase
    .from("invoices")
    .insert({
      user_id: parsed.data.user_id,
      accept_fee: acceptFee,
      consolidation_fee: consolidationFee,
      demurrage_fee: demurrageFee,
      total,
      status: "PENDING",
    })
    .select()
    .single();

  if (insertError) {
    return NextResponse.json({ error: "Invoice creation failed" }, { status: 500 });
  }

  // Push notification
  sendPushToUser(parsed.data.user_id, {
    title: "New Invoice",
    body: `€${total.toFixed(2)} you have an invoice`,
    url: "/dashboard/checkout",
  }).catch(() => {});

  await auditLog("invoice:create", user.id, data.id, {
    target_user: parsed.data.user_id,
    total,
  });

  return NextResponse.json(data, { status: 201 });
}
