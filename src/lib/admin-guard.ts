import { createClient } from "@/lib/supabase-server";
import { NextResponse } from "next/server";
import { hasPermission, type Permission } from "@/lib/permissions";
import { getAdminClient } from "@/lib/supabase-admin";

export interface AdminUser {
  id: string;
  is_admin: boolean;
  permissions: string[];
  name: string;
}

export async function requireAdmin(requiredPermission?: Permission): Promise<
  | { user: AdminUser; error: null }
  | { user: null; error: NextResponse }
> {
  const supabase = await createClient();

  const { data: { user: authUser } } = await supabase.auth.getUser();
  if (!authUser) {
    return { user: null, error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }

  const { data: appUser } = await supabase
    .from("users")
    .select("id, is_admin, permissions, name")
    .eq("supabase_user_id", authUser.id)
    .single();

  if (!appUser?.is_admin) {
    return { user: null, error: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  }

  if (requiredPermission && !hasPermission(appUser.permissions, requiredPermission)) {
    return { user: null, error: NextResponse.json({ error: "You don't have permission for this action" }, { status: 403 }) };
  }

  return { user: appUser as AdminUser, error: null };
}

export async function auditLog(
  action: string,
  userId: string,
  target: string,
  details?: Record<string, unknown>
) {
  try {
    const supabase = getAdminClient();
    await supabase.from("audit_logs").insert({
      action,
      user_id: userId,
      target,
      details: details || {},
    });
  } catch {
    // Audit failure should never break the main operation
    console.error("[audit] Failed to write audit log:", action, userId, target);
  }
}
