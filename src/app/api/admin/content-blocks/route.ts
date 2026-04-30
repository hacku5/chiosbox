import { NextResponse } from "next/server";
import { getAdminClient } from "@/lib/supabase-admin";
import { requireAdmin } from "@/lib/admin-guard";

export async function GET(request: Request) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { searchParams } = new URL(request.url);
  const section_key = searchParams.get("section_key");

  const supabase = getAdminClient();
  let query = supabase.from("content_blocks").select("*").order("section_key");
  if (section_key) query = query.eq("section_key", section_key);

  const { data, error: queryError } = await query;
  if (queryError) return NextResponse.json({ error: "Failed to load content blocks" }, { status: 500 });
  return NextResponse.json({ blocks: data });
}

export async function PATCH(request: Request) {
  const { error } = await requireAdmin();
  if (error) return error;

  const body = await request.json();
  const { section_key, title, subtitle, body: bodyText, image_url, link_url, is_published } = body;
  if (!section_key) return NextResponse.json({ error: "section_key required" }, { status: 400 });

  const supabase = getAdminClient();
  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (title !== undefined) updates.title = title;
  if (subtitle !== undefined) updates.subtitle = subtitle;
  if (bodyText !== undefined) updates.body = bodyText;
  if (image_url !== undefined) updates.image_url = image_url;
  if (link_url !== undefined) updates.link_url = link_url;
  if (is_published !== undefined) updates.is_published = is_published;

  const { data, error: upsertError } = await supabase.from("content_blocks")
    .upsert({ section_key, ...updates }, { onConflict: "section_key" }).select().single();

  if (upsertError) return NextResponse.json({ error: "Failed to save content block" }, { status: 500 });
  return NextResponse.json({ block: data });
}
