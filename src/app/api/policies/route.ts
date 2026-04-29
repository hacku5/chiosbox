import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get("slug");
  const lang = searchParams.get("lang") || "tr";

  if (!slug) {
    return NextResponse.json({ error: "slug is required" }, { status: 400 });
  }

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("policies")
    .select("title, content, language, updated_at")
    .eq("slug", slug)
    .eq("language", lang)
    .eq("is_published", true)
    .single();

  if (error || !data) {
    // Fallback to English
    if (lang !== "en") {
      const { data: fallback } = await supabase
        .from("policies")
        .select("title, content, language, updated_at")
        .eq("slug", slug)
        .eq("language", "en")
        .eq("is_published", true)
        .single();

      if (fallback) {
        return NextResponse.json({ policy: fallback, fallback: true });
      }
    }
    return NextResponse.json({ error: "Policy not found" }, { status: 404 });
  }

  return NextResponse.json({
    policy: data,
    headers: {
      "Cache-Control": "public, max-age=300, stale-while-revalidate=600",
    },
  });
}
