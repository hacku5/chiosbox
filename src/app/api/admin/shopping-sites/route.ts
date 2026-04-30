import { NextResponse } from "next/server";
import { getAdminClient } from "@/lib/supabase-admin";
import { requireAdmin } from "@/lib/admin-guard";

export async function GET(request: Request) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { searchParams } = new URL(request.url);
  const country = searchParams.get("country");
  const category = searchParams.get("category");

  const supabase = getAdminClient();
  let query = supabase.from("shopping_sites").select("*").order("country").order("sort_order");
  if (country) query = query.eq("country", country);
  if (category) query = query.eq("category", category);

  const { data, error: queryError } = await query;
  if (queryError) return NextResponse.json({ error: "Failed to load shopping sites" }, { status: 500 });
  return NextResponse.json({ sites: data });
}

export async function POST(request: Request) {
  const { error } = await requireAdmin();
  if (error) return error;
  const body = await request.json();

  // Bulk import via CSV/JSON array
  if (Array.isArray(body)) {
    const supabase = getAdminClient();
    const rows = body.map((s: Record<string, unknown>) => ({
      name: s.name, url: s.url, country: s.country || "DE",
      category: s.category || "general", logo_url: s.logo_url || "",
      sort_order: s.sort_order || 0,
    }));
    const { error: insertError } = await supabase.from("shopping_sites").insert(rows);
    if (insertError) return NextResponse.json({ error: "Import failed" }, { status: 500 });
    return NextResponse.json({ imported: rows.length });
  }

  // Single create
  const { name, url, country, category, logo_url, sort_order } = body;
  if (!name || !url) return NextResponse.json({ error: "name and url required" }, { status: 400 });

  const supabase = getAdminClient();
  const { data, error: insertError } = await supabase.from("shopping_sites").insert({
    name, url, country: country || "DE", category: category || "general",
    logo_url: logo_url || "", sort_order: sort_order || 0,
  }).select().single();

  if (insertError) return NextResponse.json({ error: "Failed to create site" }, { status: 500 });
  return NextResponse.json({ site: data });
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

  const { data, error: updateError } = await supabase.from("shopping_sites").update(updates).eq("id", id).select().single();
  if (updateError) return NextResponse.json({ error: "Failed to update site" }, { status: 500 });
  return NextResponse.json({ site: data });
}

export async function DELETE(request: Request) {
  const { error } = await requireAdmin();
  if (error) return error;
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  const supabase = getAdminClient();
  const { error: deleteError } = await supabase.from("shopping_sites").delete().eq("id", id);
  if (deleteError) return NextResponse.json({ error: "Failed to delete site" }, { status: 500 });
  return NextResponse.json({ success: true });
}
