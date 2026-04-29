import { NextResponse } from "next/server";
import { getAdminClient } from "@/lib/supabase-admin";

/** Public: read-only access to system settings for client components. */
export async function GET() {
  try {
    const supabase = getAdminClient();
    const { data, error } = await supabase
      .from("system_settings")
      .select("key, value, category, label, description, unit");

    if (error) throw error;

    // Parse JSONB values to plain numbers/strings
    const settings: Record<string, number | string> = {};
    for (const row of data ?? []) {
      const parsed =
        typeof row.value === "string" ? JSON.parse(row.value) : row.value;
      settings[row.key] = typeof parsed === "number" ? parsed : String(parsed);
    }

    return NextResponse.json({ settings });
  } catch {
    return NextResponse.json({ error: "Failed to load settings" }, { status: 500 });
  }
}
