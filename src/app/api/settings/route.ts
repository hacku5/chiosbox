import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";

// Only these keys may be served to unauthenticated clients
const PUBLIC_SETTING_KEYS = new Set([
  "free_storage_days",
  "plan_price_temel",
  "plan_price_premium",
]);

export async function GET() {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("system_settings")
      .select("key, value");

    if (error) throw error;

    // Filter: only return public-safe keys
    const settings: Record<string, number | string> = {};
    for (const row of data ?? []) {
      if (!PUBLIC_SETTING_KEYS.has(row.key)) continue;
      const parsed =
        typeof row.value === "string" ? JSON.parse(row.value) : row.value;
      settings[row.key] = typeof parsed === "number" ? parsed : String(parsed);
    }

    return NextResponse.json({ settings });
  } catch {
    return NextResponse.json({ error: "Failed to load settings" }, { status: 500 });
  }
}
