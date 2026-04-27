import { NextResponse } from "next/server";
import { getAdminClient } from "@/lib/supabase-admin";
import { requireAdmin } from "@/lib/admin-guard";

const VALID_STATUSES = ["PAID", "CANCELLED", "PENDING"];

const VALID_TRANSITIONS: Record<string, string[]> = {
  PENDING: ["PAID", "CANCELLED"],
  PAID: ["PENDING"],
  CANCELLED: ["PENDING"],
};

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireAdmin("invoices");
  if (error) return error;

  const { id } = await params;
  const supabase = getAdminClient();
  const body = await request.json();

  if (!body.status || !VALID_STATUSES.includes(body.status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  // Fetch current status to validate transition
  const { data: current, error: fetchErr } = await supabase
    .from("invoices")
    .select("status")
    .eq("id", id)
    .single();

  if (fetchErr || !current) {
    return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
  }

  const allowed = VALID_TRANSITIONS[current.status] || [];
  if (!allowed.includes(body.status)) {
    return NextResponse.json(
      { error: `Cannot transition from ${current.status} to ${body.status}` },
      { status: 400 }
    );
  }

  const updateData: Record<string, unknown> = { status: body.status };
  if (body.status === "PAID") {
    updateData.paid_at = new Date().toISOString();
    updateData.qr_code = `QR-CBX-${Date.now()}`;
  } else if (body.status === "PENDING") {
    updateData.paid_at = null;
    updateData.qr_code = null;
  }

  const { data, error: updateErr } = await supabase
    .from("invoices")
    .update(updateData)
    .eq("id", id)
    .select()
    .single();

  if (updateErr) {
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }

  return NextResponse.json(data);
}
