import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";

// Keys excluded from public API (internal/infrastructure only)
const EXCLUDED_KEYS = new Set([
  "rate_limit_register",
  "rate_limit_pickup_code",
  "rate_limit_message",
]);

export async function GET() {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("system_settings")
      .select("key, value");

    if (error) throw error;

    const settings: Record<string, number | string> = {};
    for (const row of data ?? []) {
      if (EXCLUDED_KEYS.has(row.key)) continue;
      const parsed =
        typeof row.value === "string" ? JSON.parse(row.value) : row.value;
      settings[row.key] = typeof parsed === "number" ? parsed : String(parsed);
    }

    return NextResponse.json({ settings });
  } catch {
    return NextResponse.json({ error: "Failed to load settings" }, { status: 500 });
  }
}
