/**
 * Build-time script: fetch translations from Supabase DB and write to public/locales/*.json.
 * Run before `next build` via prebuild hook: `node scripts/build-locales.cjs`
 */
const { createClient } = require("@supabase/supabase-js");
const { writeFileSync, mkdirSync } = require("fs");
const { resolve } = require("path");
require("dotenv").config({ path: resolve(process.cwd(), ".env") });
require("dotenv").config({ path: resolve(process.cwd(), ".env.local"), override: true });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(url, key);
const LANGS = ["tr", "en", "de"];
const OUT_DIR = resolve(process.cwd(), "public/locales");

async function main() {
  mkdirSync(OUT_DIR, { recursive: true });

  for (const lang of LANGS) {
    let allRows = [];
    const PAGE_SIZE = 1000;
    let from = 0;

    while (true) {
      const { data, error } = await supabase
        .from("translations")
        .select("key, value")
        .eq("language_code", lang)
        .range(from, from + PAGE_SIZE - 1)
        .order("key", { ascending: true });

      if (error) {
        console.error(`Failed to fetch ${lang}:`, error.message);
        process.exit(1);
      }

      if (!data || data.length === 0) break;
      allRows = allRows.concat(data);
      if (data.length < PAGE_SIZE) break;
      from += PAGE_SIZE;
    }

    const entries = {};
    for (const row of allRows) {
      entries[row.key] = row.value;
    }

    const outPath = resolve(OUT_DIR, `${lang}.json`);
    writeFileSync(outPath, JSON.stringify(entries, null, 2));
    console.log(`Wrote ${Object.keys(entries).length} keys to ${outPath}`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
