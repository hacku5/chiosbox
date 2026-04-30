import { NextResponse } from "next/server";
import { getAdminClient } from "@/lib/supabase-admin";
import { requireAdmin } from "@/lib/admin-guard";

export async function GET(request: Request) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { searchParams } = new URL(request.url);
  const language = searchParams.get("language");
  const supabase = getAdminClient();
  let query = supabase.from("sliders").select("*").order("sort_order").order("created_at");
  if (language) query = query.eq("language", language);

  const { data, error: queryError } = await query;
  if (queryError) return NextResponse.json({ error: "Failed to load sliders" }, { status: 500 });
  return NextResponse.json({ sliders: data });
}

export async function POST(request: Request) {
  const { error } = await requireAdmin();
  if (error) return error;

  const body = await request.json();
  const { title, subtitle, image_url, link_url, language, sort_order } = body;
  if (!title) return NextResponse.json({ error: "title required" }, { status: 400 });

  const supabase = getAdminClient();
  const { data, error: insertError } = await supabase.from("sliders").insert({
    title, subtitle: subtitle || "", image_url: image_url || "",
    link_url: link_url || "", language: language || "tr", sort_order: sort_order || 0,
  }).select().single();

  if (insertError) return NextResponse.json({ error: "Failed to create slider" }, { status: 500 });
  return NextResponse.json({ slider: data });
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

  const { data, error: updateError } = await supabase.from("sliders").update(updates).eq("id", id).select().single();
  if (updateError) return NextResponse.json({ error: "Failed to update slider" }, { status: 500 });
  return NextResponse.json({ slider: data });
}

export async function DELETE(request: Request) {
  const { error } = await requireAdmin();
  if (error) return error;
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  const supabase = getAdminClient();
  const { error: deleteError } = await supabase.from("sliders").delete().eq("id", id);
  if (deleteError) return NextResponse.json({ error: "Failed to delete slider" }, { status: 500 });
  return NextResponse.json({ success: true });
}
