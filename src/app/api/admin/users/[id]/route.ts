import { NextResponse } from "next/server";
import { getAdminClient } from "@/lib/supabase-admin";
import { requireAdmin, auditLog } from "@/lib/admin-guard";
import { isSuperAdmin } from "@/lib/permissions";
import { adminUserUpdateSchema, validateBody, uuid } from "@/lib/validation";
import { checkRateLimit, rateLimitResponse } from "@/lib/rate-limit";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { user, error } = await requireAdmin();
  if (error) return error;

  if (!isSuperAdmin(user.permissions)) {
    return NextResponse.json({ error: "Only super admin can manage users" }, { status: 403 });
  }

  const rl = checkRateLimit(request, "ADMIN", "user:admin_update");
  if (!rl.success) return rateLimitResponse(rl.resetAt);

  const { id } = await params;
  const idResult = uuid.safeParse(id);
  if (!idResult.success) {
    return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
  }

  const body = await request.json();
  const parsed = validateBody(adminUserUpdateSchema, body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  if (Object.keys(parsed.data).length === 0) {
    return NextResponse.json({ error: "No fields to update" }, { status: 400 });
  }

  const supabase = getAdminClient();

  const { data, error: updateErr } = await supabase
    .from("users")
    .update(parsed.data)
    .eq("id", idResult.data)
    .select("id, name, email, chios_box_id, is_admin, permissions")
    .single();

  if (updateErr) {
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }

  await auditLog("user:update_permissions", user.id, idResult.data, parsed.data);

  return NextResponse.json(data);
}
