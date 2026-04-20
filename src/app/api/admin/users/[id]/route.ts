import { NextResponse } from "next/server";
import { getAdminClient } from "@/lib/supabase-admin";
import { requireAdmin } from "@/lib/admin-guard";
import { isSuperAdmin } from "@/lib/permissions";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { user, error } = await requireAdmin();
  if (error) return error;

  if (!isSuperAdmin(user.permissions)) {
    return NextResponse.json({ error: "Sadece super admin kullanıcı yönetimi yapabilir" }, { status: 403 });
  }

  const { id } = await params;
  const supabase = getAdminClient();
  const body = await request.json();

  const updateData: Record<string, unknown> = {};

  if (typeof body.is_admin === "boolean") {
    updateData.is_admin = body.is_admin;
  }

  if (Array.isArray(body.permissions)) {
    updateData.permissions = body.permissions;
  }

  if (Object.keys(updateData).length === 0) {
    return NextResponse.json({ error: "Güncellenecek alan yok" }, { status: 400 });
  }

  const { data, error: updateErr } = await supabase
    .from("users")
    .update(updateData)
    .eq("id", id)
    .select("id, name, email, chios_box_id, is_admin, permissions")
    .single();

  if (updateErr) {
    return NextResponse.json({ error: updateErr.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
