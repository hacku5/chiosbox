import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const lang = searchParams.get("lang");

  const supabase = await createClient();

  if (lang) {
    // Return all translations for a specific language
    const { data, error } = await supabase
      .from("translations")
      .select("key, value")
      .eq("language_code", lang);

    if (error) {
      return NextResponse.json({ error: "Failed to load translations" }, { status: 500 });
    }

    const entries: Record<string, string> = {};
    for (const row of data || []) {
      entries[row.key] = row.value;
    }

    return NextResponse.json(
      { lang, entries },
      {
        headers: {
          "Cache-Control": "public, max-age=300, stale-while-revalidate=600",
        },
      }
    );
  }

  // No lang param — return available languages
  const { data, error } = await supabase
    .from("languages")
    .select("code, name, flag, is_default, is_enabled")
    .eq("is_enabled", true)
    .order("is_default", { ascending: false });

  if (error) {
    return NextResponse.json({ error: "Failed to load languages" }, { status: 500 });
  }

  return NextResponse.json(
    { languages: data },
    {
      headers: {
        "Cache-Control": "public, max-age=300, stale-while-revalidate=600",
      },
    }
  );
}
