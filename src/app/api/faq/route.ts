import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-browser";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category");
  const language = searchParams.get("language") || "tr";

  // Server-side: use admin client to bypass RLS for public reads
  const { getAdminClient } = await import("@/lib/supabase-admin");
  const supabase = getAdminClient();

  let query = supabase.from("faq").select("id, question, answer, category, sort_order")
    .eq("is_published", true).eq("language", language).order("sort_order").order("created_at");
  if (category) query = query.eq("category", category);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: "Failed to load FAQ" }, { status: 500 });
  return NextResponse.json({ faqs: data });
}
