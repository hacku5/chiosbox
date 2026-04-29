import { NextResponse } from "next/server";
import { getAdminClient } from "@/lib/supabase-admin";
import { requireAdmin } from "@/lib/admin-guard";
import { auditLog } from "@/lib/admin-guard";
import { checkRateLimit, rateLimitResponse } from "@/lib/rate-limit";
import { writeFileSync, mkdirSync } from "fs";
import { join } from "path";

export async function POST(request: Request) {
  const { user, error } = await requireAdmin();
  if (error) return error;

  const rl = checkRateLimit(request, "ADMIN", "translations:sync-file");
  if (!rl.success) return rateLimitResponse(rl.resetAt);

  const body = await request.json();
  if (!body.confirm) {
    return NextResponse.json(
      { error: "Pass { confirm: true } to sync translations to static files" },
      { status: 400 }
    );
  }

  const supabase = getAdminClient();
  const { data: rows, error: fetchErr } = await supabase
    .from("translations")
    .select("language_code, key, value", { count: "exact" })
    .order("key")
    .limit(5000);

  if (fetchErr || !rows) {
    return NextResponse.json({ error: "Failed to fetch translations" }, { status: 500 });
  }

  const byLang: Record<string, Record<string, string>> = {};
  for (const row of rows) {
    if (!byLang[row.language_code]) byLang[row.language_code] = {};
    byLang[row.language_code][row.key] = row.value;
  }

  try {
    const outDir = join(process.cwd(), "public", "locales");
    mkdirSync(outDir, { recursive: true });

    const results: string[] = [];
    for (const [lang, entries] of Object.entries(byLang)) {
      const filePath = join(outDir, `${lang}.json`);
      writeFileSync(filePath, JSON.stringify(entries), "utf-8");
      results.push(`${lang}: ${Object.keys(entries).length} keys`);
    }

    await auditLog("translations.sync_file", user.id, "translations", {
      languages: results,
    });

    return NextResponse.json({ success: true, files: results });
  } catch (writeErr) {
    return NextResponse.json(
      { error: "Failed to write locale files — check server filesystem permissions" },
      { status: 500 }
    );
  }
}
