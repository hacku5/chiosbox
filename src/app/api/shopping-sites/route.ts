import { NextResponse } from "next/server";
import { getAdminClient } from "@/lib/supabase-admin";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const country = searchParams.get("country");
  const category = searchParams.get("category");

  const supabase = getAdminClient();
  let query = supabase.from("shopping_sites").select("*").order("country").order("sort_order");
  if (country) query = query.eq("country", country);
  if (category) query = query.eq("category", category);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: "Failed to load shopping sites" }, { status: 500 });
  return NextResponse.json({ sites: data });
}
