import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import { lang, safeSlug } from "@/lib/validation";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const slugRaw = searchParams.get("slug");
  const langRaw = searchParams.get("lang") || "tr";

  const slugResult = safeSlug.safeParse(slugRaw);
  if (slugRaw && !slugResult.success) {
    return NextResponse.json({ error: "Invalid slug" }, { status: 400 });
  }

  const langResult = lang.safeParse(langRaw);
  const selectedLang = langResult.success ? langResult.data : "tr";

  const supabase = await createClient();

  let query = supabase
    .from("policies")
    .select("id, slug, title, content, language, updated_at")
    .eq("language", selectedLang)
    .eq("published", true);

  if (slugResult.success && slugResult.data) {
    query = query.eq("slug", slugResult.data);
  }

  const { data, error } = await query.order("slug", { ascending: true });

  if (error) {
    return NextResponse.json({ error: "Failed to fetch policies" }, { status: 500 });
  }

  const response = NextResponse.json(data);
  response.headers.set("Content-Type", "application/json; charset=utf-8");
  return response;
}
