import { NextResponse } from "next/server";
import { getAdminClient } from "@/lib/supabase-admin";
import { requireAdmin } from "@/lib/admin-guard";

export async function GET(request: Request) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { searchParams } = new URL(request.url);
  const slug = searchParams.get("slug");
  const language = searchParams.get("lang");

  const supabase = getAdminClient();

  let query = supabase
    .from("policies")
    .select("id, slug, language, title, content, is_published, updated_at")
    .order("slug")
    .order("language");

  if (slug) query = query.eq("slug", slug);
  if (language) query = query.eq("language", language);

  const { data, error: queryError } = await query;

  if (queryError) {
    return NextResponse.json({ error: "Failed to load policies" }, { status: 500 });
  }

  return NextResponse.json({ policies: data });
}

export async function POST(request: Request) {
  const { error } = await requireAdmin();
  if (error) return error;

  const body = await request.json();
  const { slug, language, title, content } = body;

  if (!slug || !language || !title) {
    return NextResponse.json({ error: "slug, language, and title are required" }, { status: 400 });
  }

  const supabase = getAdminClient();

  const { data, error: upsertError } = await supabase
    .from("policies")
    .upsert(
      {
        slug,
        language,
        title,
        content: content || "",
        updated_at: new Date().toISOString(),
      },
      { onConflict: "slug,language" }
    )
    .select()
    .single();

  if (upsertError) {
    return NextResponse.json({ error: "Failed to save policy" }, { status: 500 });
  }

  return NextResponse.json({ policy: data });
}

export async function PATCH(request: Request) {
  const { error } = await requireAdmin();
  if (error) return error;

  const body = await request.json();
  const { id, is_published, title, content } = body;

  if (!id) {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }

  const supabase = getAdminClient();

  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (is_published !== undefined) updates.is_published = is_published;
  if (title !== undefined) updates.title = title;
  if (content !== undefined) updates.content = content;

  const { data, error: updateError } = await supabase
    .from("policies")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (updateError) {
    return NextResponse.json({ error: "Failed to update policy" }, { status: 500 });
  }

  return NextResponse.json({ policy: data });
}

export async function DELETE(request: Request) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }

  const supabase = getAdminClient();

  const { error: deleteError } = await supabase
    .from("policies")
    .delete()
    .eq("id", id);

  if (deleteError) {
    return NextResponse.json({ error: "Failed to delete policy" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
