import { NextResponse } from "next/server";
import { getAdminClient } from "@/lib/supabase-admin";
import { requireAdmin } from "@/lib/admin-guard";
import { invalidateSettings } from "@/lib/system-settings";

/** GET: list all settings with metadata */
export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;

  const supabase = getAdminClient();
  const { data, error: dbError } = await supabase
    .from("system_settings")
    .select("*")
    .order("category, key");

  if (dbError) {
    return NextResponse.json({ error: dbError.message }, { status: 500 });
  }

  return NextResponse.json({ settings: data ?? [] });
}

/** PATCH: update a single setting */
export async function PATCH(request: Request) {
  const { error } = await requireAdmin();
  if (error) return error;

  const body = await request.json();
  const { key, value } = body;

  if (!key || value === undefined) {
    return NextResponse.json({ error: "key and value required" }, { status: 400 });
  }

  const supabase = getAdminClient();
  const { error: dbError } = await supabase
    .from("system_settings")
    .update({ value: JSON.stringify(value), updated_at: new Date().toISOString() })
    .eq("key", key);

  if (dbError) {
    return NextResponse.json({ error: dbError.message }, { status: 500 });
  }

  // Invalidate cache so next read picks up new value
  invalidateSettings(key);

  return NextResponse.json({ success: true, key, value });
}

/** POST: bulk update multiple settings */
export async function POST(request: Request) {
  const { error } = await requireAdmin();
  if (error) return error;

  const body = await request.json();
  const { updates } = body as { updates: Array<{ key: string; value: string | number }> };

  if (!updates?.length) {
    return NextResponse.json({ error: "updates array required" }, { status: 400 });
  }

  const supabase = getAdminClient();
  const now = new Date().toISOString();

  const results = await Promise.all(
    updates.map(async ({ key, value }) => {
      const { error: dbError } = await supabase
        .from("system_settings")
        .update({ value: JSON.stringify(value), updated_at: now })
        .eq("key", key);

      invalidateSettings(key);
      return { key, success: !dbError, error: dbError?.message };
    })
  );

  const failed = results.filter((r) => !r.success);
  if (failed.length) {
    return NextResponse.json({ error: "Some updates failed", results }, { status: 500 });
  }

  return NextResponse.json({ success: true, updated: results.length });
}
