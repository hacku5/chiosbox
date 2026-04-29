import { NextResponse } from "next/server";
import { getAdminClient } from "@/lib/supabase-admin";
import { requireAdmin, auditLog } from "@/lib/admin-guard";
import { lang as langSchema } from "@/lib/validation";
import { z } from "zod";
import { checkRateLimit, rateLimitResponse } from "@/lib/rate-limit";

const translationEntrySchema = z.object({
  key: z.string().min(1).max(200).trim(),
  value: z.string().max(10000),
});

const translationsPostSchema = z.object({
  lang: langSchema,
  entries: z.array(translationEntrySchema).min(1).max(1000),
});

// Get translations for a language (with optional search)
export async function GET(request: Request) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { searchParams } = new URL(request.url);
  const langRaw = searchParams.get("lang");
  const search = searchParams.get("search");
  const page = Math.max(1, parseInt(searchParams.get("page") || "1") || 1);
  const limit = Math.min(Math.max(1, parseInt(searchParams.get("limit") || "200") || 200), 500);
  const offset = (page - 1) * limit;

  if (!langRaw) {
    return NextResponse.json({ error: "Language code is required" }, { status: 400 });
  }

  const langParsed = langSchema.safeParse(langRaw);
  if (!langParsed.success) {
    return NextResponse.json({ error: "Invalid language code" }, { status: 400 });
  }

  const supabase = getAdminClient();

  // Sanitize search input
  const safeSearch = search ? search.replace(/[%_]/g, "").slice(0, 100) : null;

  let query = supabase
    .from("translations")
    .select("id, key, value, updated_at", { count: "exact" })
    .eq("language_code", langParsed.data)
    .order("key")
    .range(offset, offset + limit - 1);

  if (safeSearch) {
    query = query.ilike("key", `%${safeSearch}%`);
  }

  const { data, error: queryError, count } = await query;

  if (queryError) {
    return NextResponse.json({ error: "Failed to load translations" }, { status: 500 });
  }

  return NextResponse.json({
    translations: data,
    total: count,
    page,
    limit,
  });
}

// Bulk upsert translations
export async function POST(request: Request) {
  const { user, error } = await requireAdmin();
  if (error) return error;

  const rl = checkRateLimit(request, "ADMIN", "translation:upsert");
  if (!rl.success) return rateLimitResponse(rl.resetAt);

  const body = await request.json();
  const parsed = translationsPostSchema.safeParse(body);
  if (!parsed.success) {
    const msg = parsed.error.issues.map(i => `${i.path.join(".")}: ${i.message}`).join("; ");
    return NextResponse.json({ error: msg }, { status: 400 });
  }

  const { lang, entries } = parsed.data;
  const supabase = getAdminClient();

  const rows = entries.map((e) => ({
    language_code: lang,
    key: e.key,
    value: e.value,
    updated_at: new Date().toISOString(),
  }));

  const { data, error: upsertError } = await supabase
    .from("translations")
    .upsert(rows, { onConflict: "language_code,key" })
    .select();

  if (upsertError) {
    return NextResponse.json({ error: "Failed to save translations" }, { status: 500 });
  }

  auditLog("translations.upsert", user.id, `lang:${lang}`, { count: entries.length });
  return NextResponse.json({ saved: data?.length || 0 });
}

// Delete a translation key
export async function DELETE(request: Request) {
  const { user, error } = await requireAdmin();
  if (error) return error;

  const rl = checkRateLimit(request, "ADMIN", "translation:delete");
  if (!rl.success) return rateLimitResponse(rl.resetAt);

  const { searchParams } = new URL(request.url);
  const langRaw = searchParams.get("lang");
  const key = searchParams.get("key");

  if (!langRaw || !key) {
    return NextResponse.json({ error: "Language code and key are required" }, { status: 400 });
  }

  const langParsed = langSchema.safeParse(langRaw);
  if (!langParsed.success) {
    return NextResponse.json({ error: "Invalid language code" }, { status: 400 });
  }

  const supabase = getAdminClient();

  const { error: deleteError } = await supabase
    .from("translations")
    .delete()
    .eq("language_code", langParsed.data)
    .eq("key", key);

  if (deleteError) {
    return NextResponse.json({ error: "Failed to delete translation" }, { status: 500 });
  }

  auditLog("translations.delete", user.id, `lang:${langParsed.data}`, { key });
  return NextResponse.json({ success: true });
}
