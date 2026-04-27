import { NextResponse } from "next/server";
import { getAdminClient } from "@/lib/supabase-admin";
import { requireAdmin } from "@/lib/admin-guard";
import { translationSeed } from "@/lib/seed-translations";

export async function POST() {
  const { error } = await requireAdmin();
  if (error) return error;

  const supabase = getAdminClient();
  let total = 0;

  for (const [lang, entries] of Object.entries(translationSeed)) {
    const rows = Object.entries(entries).map(([key, value]) => ({
      language_code: lang,
      key,
      value,
      updated_at: new Date().toISOString(),
    }));

    // Upsert in batches of 100
    for (let i = 0; i < rows.length; i += 100) {
      const batch = rows.slice(i, i + 100);
      const { error } = await supabase
        .from("translations")
        .upsert(batch, { onConflict: "language_code,key" });

      if (error) {
        return NextResponse.json(
          { error: `Failed seeding ${lang} batch ${i}: ${error.message}` },
          { status: 500 }
        );
      }
      total += batch.length;
    }
  }

  return NextResponse.json({ success: true, total });
}
