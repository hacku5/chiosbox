import { writeFileSync, mkdirSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

const URL = "https://bebowqxvbjyeekptweue.supabase.co";
const KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJlYm93cXh2Ymp5ZWVrcHR3ZXVlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY0MjU5NTYsImV4cCI6MjA5MjAwMTk1Nn0.ma2Hlp-jqCRfd7pvhJf61ea2JwfD8PEcAUjxcsb4Tdc";

async function fetchAll(path) {
  const rows = [];
  let offset = 0;
  const limit = 1000;
  while (true) {
    const url = `${URL}/rest/v1/${path}&limit=${limit}&offset=${offset}`;
    const resp = await fetch(url, {
      headers: { apikey: KEY, Authorization: `Bearer ${KEY}`, Accept: "application/json" }
    });
    if (!resp.ok) throw new Error(`Fetch failed: ${resp.status} at offset ${offset}`);
    const batch = await resp.json();
    if (!batch.length) break;
    rows.push(...batch);
    if (batch.length < limit) break;
    offset += limit;
  }
  return rows;
}

const rows = await fetchAll("translations?select=language_code,key,value&order=key");

const byLang = {};
for (const r of rows) {
  if (!byLang[r.language_code]) byLang[r.language_code] = {};
  byLang[r.language_code][r.key] = r.value;
}

const outDir = resolve(__dirname, "..", "public", "locales");
mkdirSync(outDir, { recursive: true });

for (const [lang, entries] of Object.entries(byLang)) {
  const fp = resolve(outDir, `${lang}.json`);
  writeFileSync(fp, JSON.stringify(entries));
  console.log(`${lang}: ${Object.keys(entries).length} keys`);
}

console.log("Done.");
