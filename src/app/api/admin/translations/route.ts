import { NextResponse } from "next/server";
import { getAdminClient } from "@/lib/supabase-admin";
import { requireAdmin } from "@/lib/admin-guard";

// Get translations for a language (with optional search)
export async function GET(request: Request) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { searchParams } = new URL(request.url);
  const lang = searchParams.get("lang");
  const search = searchParams.get("search");
  const page = Math.max(1, parseInt(searchParams.get("page") || "1") || 1);
  const limit = Math.min(Math.max(1, parseInt(searchParams.get("limit") || "200") || 200), 500);
  const offset = (page - 1) * limit;

  if (!lang) {
    return NextResponse.json({ error: "Language code is required" }, { status: 400 });
  }

  const supabase = getAdminClient();

  let query = supabase
    .from("translations")
    .select("id, key, value, updated_at", { count: "exact" })
    .eq("language_code", lang)
    .order("key")
    .range(offset, offset + limit - 1);

  if (search) {
    query = query.ilike("key", `%${search}%`);
  }

  const { data, error: queryError, count } = await query;

  if (queryError) {
    return NextResponse.json({ error: "Failed to load translations" }, { status: 500 });
  }

  return NextResponse.json({
    translations: data,
    total: count,
    page,
    limit,
  });
}

// Bulk upsert translations
export async function POST(request: Request) {
  const { error } = await requireAdmin();
  if (error) return error;

  const body = await request.json();
  const { lang, entries } = body;

  if (!lang || !Array.isArray(entries) || entries.length === 0) {
    return NextResponse.json({ error: "Language and translation list required" }, { status: 400 });
  }

  const supabase = getAdminClient();

  const rows = entries.map((e: { key: string; value: string }) => ({
    language_code: lang,
    key: e.key,
    value: e.value,
    updated_at: new Date().toISOString(),
  }));

  const { data, error: upsertError } = await supabase
    .from("translations")
    .upsert(rows, { onConflict: "language_code,key" })
    .select();

  if (upsertError) {
    return NextResponse.json({ error: "Failed to save translations" }, { status: 500 });
  }

  return NextResponse.json({ saved: data?.length || 0 });
}

// Delete a translation key
export async function DELETE(request: Request) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { searchParams } = new URL(request.url);
  const lang = searchParams.get("lang");
  const key = searchParams.get("key");

  if (!lang || !key) {
    return NextResponse.json({ error: "Language code and key are required" }, { status: 400 });
  }

  const supabase = getAdminClient();

  const { error: deleteError } = await supabase
    .from("translations")
    .delete()
    .eq("language_code", lang)
    .eq("key", key);

  if (deleteError) {
    return NextResponse.json({ error: "Failed to delete translation" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
