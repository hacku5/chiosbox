import { createClient } from "@supabase/supabase-js";
import { translationSeed } from "../src/lib/seed-translations";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !serviceKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceKey);

async function seed() {
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
        console.error(`Failed seeding ${lang} batch ${i}:`, error.message);
        process.exit(1);
      }
      total += batch.length;
    }

    console.log(`✓ ${lang}: ${rows.length} keys seeded`);
  }

  console.log(`\nDone! Total: ${total} translations seeded.`);
}

seed();
