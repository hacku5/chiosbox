import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import { requireAuth } from "@/lib/auth-guard";
import { invoiceStatusSchema, validateBody } from "@/lib/validation";

const VALID_TRANSITIONS: Record<string, string[]> = {
  PENDING: ["PAID", "CANCELLED"],
  PAID: [],
  CANCELLED: [],
};

export async function GET() {
  const { user, error } = await requireAuth();
  if (error) return error;

  const supabase = await createClient();
  const { data, error: fetchErr } = await supabase
    .from("invoices")
    .select("id, total, status, created_at, updated_at, accept_fee, consolidation_fee, demurrage_fee, master_box_id")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (fetchErr) {
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function PATCH(request: Request) {
  const { user, error } = await requireAuth();
  if (error) return error;

  const body = await request.json();
  const parsed = validateBody(invoiceStatusSchema, body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  const { invoice_id, status } = parsed.data;

  const supabase = await createClient();

  // Verify ownership
  const { data: invoice } = await supabase
    .from("invoices")
    .select("id, status")
    .eq("id", invoice_id)
    .eq("user_id", user.id)
    .single();

  if (!invoice) {
    return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
  }

  // Validate status transition
  const allowed = VALID_TRANSITIONS[invoice.status] || [];
  if (!allowed.includes(status)) {
    return NextResponse.json(
      { error: `Cannot transition from ${invoice.status} to ${status}` },
      { status: 400 }
    );
  }

  const { data, error: updateErr } = await supabase
    .from("invoices")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", invoice_id)
    .select()
    .single();

  if (updateErr) {
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }

  return NextResponse.json(data);
}
