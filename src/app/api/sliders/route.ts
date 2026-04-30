import { NextResponse } from "next/server";
import { getAdminClient } from "@/lib/supabase-admin";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const language = searchParams.get("language") || "tr";

  const supabase = getAdminClient();
  const { data, error } = await supabase.from("sliders")
    .select("id, title, subtitle, image_url, link_url, sort_order")
    .eq("is_published", true).eq("language", language).order("sort_order");

  if (error) return NextResponse.json({ error: "Failed to load sliders" }, { status: 500 });
  return NextResponse.json({ sliders: data });
}
