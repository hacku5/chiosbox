import { NextResponse } from "next/server";
import { getAdminClient } from "@/lib/supabase-admin";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const section_key = searchParams.get("section_key");

  const supabase = getAdminClient();
  let query = supabase.from("content_blocks").select("*").eq("is_published", true).order("section_key");
  if (section_key) {
    const keys = section_key.split(",").map((k) => k.trim()).filter(Boolean);
    if (keys.length === 1) query = query.eq("section_key", keys[0]);
    else if (keys.length > 1) query = query.in("section_key", keys);
  }

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: "Failed to load content blocks" }, { status: 500 });
  return NextResponse.json({ blocks: data });
}
