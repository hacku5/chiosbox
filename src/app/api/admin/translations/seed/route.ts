import { NextResponse } from "next/server";
import { getAdminClient } from "@/lib/supabase-admin";
import { requireAdmin, auditLog } from "@/lib/admin-guard";
import { translationSeed } from "@/lib/seed-translations";
import { z } from "zod";

const seedConfirmSchema = z.object({
  confirm: z.literal(true),
});

export async function POST(request: Request) {
  const { user, error } = await requireAdmin();
  if (error) return error;

  // Require explicit confirmation to prevent accidental seeding
  const body = await request.json().catch(() => ({}));
  const parsed = seedConfirmSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Confirmation required. Send { confirm: true } to proceed." },
      { status: 400 }
    );
  }

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
      const { error: batchError } = await supabase
        .from("translations")
        .upsert(batch, { onConflict: "language_code,key" });

      if (batchError) {
        return NextResponse.json(
          { error: "Failed to seed translations" },
          { status: 500 }
        );
      }
      total += batch.length;
    }
  }

  const langCount = Object.keys(translationSeed).length;
  auditLog("translations.seed", user.id, `langs:${langCount}`, { total });
  return NextResponse.json({ success: true, total });
}
