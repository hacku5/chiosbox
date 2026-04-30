import { NextResponse } from "next/server";
import { getAdminClient } from "@/lib/supabase-admin";
import { requireAdmin } from "@/lib/admin-guard";

export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;

  const supabase = getAdminClient();
  const { data, error: queryError } = await supabase.from("plans").select("*").order("sort_order");
  if (queryError) return NextResponse.json({ error: "Failed to load plans" }, { status: 500 });
  return NextResponse.json({ plans: data });
}

export async function POST(request: Request) {
  const { error } = await requireAdmin();
  if (error) return error;

  const body = await request.json();
  const { name, price, features, sort_order } = body;
  if (!name) return NextResponse.json({ error: "name required" }, { status: 400 });

  const supabase = getAdminClient();
  const { data, error: insertError } = await supabase.from("plans").insert({
    name, price: price || 0, features: features || [], sort_order: sort_order || 0,
  }).select().single();

  if (insertError) return NextResponse.json({ error: "Failed to create plan" }, { status: 500 });
  return NextResponse.json({ plan: data });
}

export async function PATCH(request: Request) {
  const { error } = await requireAdmin();
  if (error) return error;
  const body = await request.json();
  const { id, ...fields } = body;
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  const supabase = getAdminClient();
  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
  for (const [k, v] of Object.entries(fields)) {
    if (v !== undefined) updates[k] = v;
  }

  const { data, error: updateError } = await supabase.from("plans").update(updates).eq("id", id).select().single();
  if (updateError) return NextResponse.json({ error: "Failed to update plan" }, { status: 500 });
  return NextResponse.json({ plan: data });
}

export async function DELETE(request: Request) {
  const { error } = await requireAdmin();
  if (error) return error;
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  const supabase = getAdminClient();
  const { error: deleteError } = await supabase.from("plans").delete().eq("id", id);
  if (deleteError) return NextResponse.json({ error: "Failed to delete plan" }, { status: 500 });
  return NextResponse.json({ success: true });
}
