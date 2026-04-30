import { NextResponse } from "next/server";
import { getAdminClient } from "@/lib/supabase-admin";
import { requireAdmin } from "@/lib/admin-guard";

export async function GET(request: Request) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category");
  const language = searchParams.get("language");

  const supabase = getAdminClient();
  let query = supabase.from("faq").select("*").order("sort_order").order("created_at");

  if (category) query = query.eq("category", category);
  if (language) query = query.eq("language", language);

  const { data, error: queryError } = await query;
  if (queryError) return NextResponse.json({ error: "Failed to load FAQ" }, { status: 500 });
  return NextResponse.json({ faqs: data });
}

export async function POST(request: Request) {
  const { error } = await requireAdmin();
  if (error) return error;

  const body = await request.json();
  const { question, answer, category, language, sort_order } = body;
  if (!question || !answer) return NextResponse.json({ error: "question and answer required" }, { status: 400 });

  const supabase = getAdminClient();
  const { data, error: insertError } = await supabase.from("faq").insert({
    question, answer,
    category: category || "general",
    language: language || "tr",
    sort_order: sort_order || 0,
  }).select().single();

  if (insertError) return NextResponse.json({ error: "Failed to create FAQ" }, { status: 500 });
  return NextResponse.json({ faq: data });
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

  const { data, error: updateError } = await supabase.from("faq").update(updates).eq("id", id).select().single();
  if (updateError) return NextResponse.json({ error: "Failed to update FAQ" }, { status: 500 });
  return NextResponse.json({ faq: data });
}

export async function DELETE(request: Request) {
  const { error } = await requireAdmin();
  if (error) return error;
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  const supabase = getAdminClient();
  const { error: deleteError } = await supabase.from("faq").delete().eq("id", id);
  if (deleteError) return NextResponse.json({ error: "Failed to delete FAQ" }, { status: 500 });
  return NextResponse.json({ success: true });
}
