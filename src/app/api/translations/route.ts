import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import { lang } from "@/lib/validation";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const langParam = searchParams.get("lang");

  // If no lang param, return languages list
  if (!langParam) {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("languages")
      .select("code, name, flag, is_default, is_enabled")
      .eq("is_enabled", true)
      .order("code");

    if (error) {
      return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
    }

    return NextResponse.json({ languages: data });
  }

  // Validate lang param
  const langResult = lang.safeParse(langParam);
  if (!langResult.success) {
    return NextResponse.json({ error: "Invalid language code" }, { status: 400 });
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("translations")
    .select("key, value")
    .eq("language_code", langResult.data);

  if (error) {
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }

  const entries: Record<string, string> = {};
  for (const row of data ?? []) {
    entries[row.key] = row.value;
  }

  const response = NextResponse.json({ entries });
  response.headers.set("Cache-Control", "public, max-age=300, stale-while-revalidate=600");
  return response;
}
