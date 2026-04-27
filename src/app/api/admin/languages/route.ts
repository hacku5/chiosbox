import { NextResponse } from "next/server";
import { getAdminClient } from "@/lib/supabase-admin";
import { requireAdmin } from "@/lib/admin-guard";

// List all languages
export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;

  const supabase = getAdminClient();

  const { data, error: queryError } = await supabase
    .from("languages")
    .select("*")
    .order("is_default", { ascending: false });

  if (queryError) {
    return NextResponse.json({ error: "Failed to load languages" }, { status: 500 });
  }

  return NextResponse.json({ languages: data });
}

// Add a new language
export async function POST(request: Request) {
  const { error } = await requireAdmin();
  if (error) return error;

  const body = await request.json();
  const { code, name, flag } = body;

  if (!code || !name) {
    return NextResponse.json({ error: "Code and name are required" }, { status: 400 });
  }

  const supabase = getAdminClient();

  const { data, error: insertError } = await supabase
    .from("languages")
    .insert({ code: code.toLowerCase().trim(), name: name.trim(), flag: flag || "🌐" })
    .select()
    .single();

  if (insertError) {
    if (insertError.code === "23505") {
      return NextResponse.json({ error: "This language already exists" }, { status: 409 });
    }
    return NextResponse.json({ error: "Failed to add language" }, { status: 500 });
  }

  return NextResponse.json({ language: data }, { status: 201 });
}

// Update a language (toggle enabled/default, rename)
export async function PATCH(request: Request) {
  const { error } = await requireAdmin();
  if (error) return error;

  const body = await request.json();
  const { code, is_enabled, is_default, name, flag } = body;

  if (!code) {
    return NextResponse.json({ error: "Language code is required" }, { status: 400 });
  }

  const supabase = getAdminClient();

  // If setting as default, unset other defaults first
  if (is_default === true) {
    await supabase
      .from("languages")
      .update({ is_default: false })
      .neq("code", code);
  }

  const updates: Record<string, unknown> = {};
  if (typeof is_enabled === "boolean") updates.is_enabled = is_enabled;
  if (typeof is_default === "boolean") updates.is_default = is_default;
  if (name) updates.name = name.trim();
  if (flag) updates.flag = flag;

  const { data, error: updateError } = await supabase
    .from("languages")
    .update(updates)
    .eq("code", code)
    .select()
    .single();

  if (updateError) {
    return NextResponse.json({ error: "Failed to update language" }, { status: 500 });
  }

  return NextResponse.json({ language: data });
}

// Delete a language
export async function DELETE(request: Request) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");

  if (!code) {
    return NextResponse.json({ error: "Language code is required" }, { status: 400 });
  }

  const supabase = getAdminClient();

  // Check if it's the default language
  const { data: lang } = await supabase
    .from("languages")
    .select("is_default")
    .eq("code", code)
    .single();

  if (lang?.is_default) {
    return NextResponse.json({ error: "Default language cannot be deleted" }, { status: 400 });
  }

  const { error: deleteError } = await supabase.from("languages").delete().eq("code", code);

  if (deleteError) {
    return NextResponse.json({ error: "Failed to delete language" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
