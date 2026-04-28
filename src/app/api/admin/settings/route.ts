import { NextResponse } from "next/server";
import { getAdminClient } from "@/lib/supabase-admin";
import { requireAdmin, auditLog } from "@/lib/admin-guard";
import { adminSettingsSchema, validateBody } from "@/lib/validation";

export async function GET() {
  const { error: authErr } = await requireAdmin();
  if (authErr) return authErr;

  const supabase = getAdminClient();
  const { data, error } = await supabase
    .from("system_settings")
    .select("*")
    .order("key");

  if (error) {
    return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function PATCH(request: Request) {
  const { user, error } = await requireAdmin();
  if (error) return error;

  const body = await request.json();
  const parsed = validateBody(adminSettingsSchema, body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  const { key, value } = parsed.data;
  const supabase = getAdminClient();

  const { data, error: updateErr } = await supabase
    .from("system_settings")
    .update({ value: JSON.stringify(value) })
    .eq("key", key)
    .select()
    .single();

  if (updateErr) {
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }

  await auditLog("setting:update", user.id, key, { newValue: String(value) });

  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const { user, error } = await requireAdmin();
  if (error) return error;

  const body = await request.json();
  const { updates } = body;

  if (!Array.isArray(updates) || updates.length === 0) {
    return NextResponse.json({ error: "updates array is required" }, { status: 400 });
  }

  const supabase = getAdminClient();

  const updatePromises = updates.map((u: { key: string; value: string | number }) => {
    const parsed = adminSettingsSchema.safeParse(u);
    if (!parsed.success) return null;
    return supabase
      .from("system_settings")
      .update({ value: JSON.stringify(parsed.data.value) })
      .eq("key", parsed.data.key);
  });

  await Promise.all(updatePromises.filter(Boolean));

  await auditLog("setting:bulk_update", user.id, "bulk", { count: updates.length });

  return NextResponse.json({ success: true });
}
