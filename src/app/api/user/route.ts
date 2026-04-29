import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import { sanitizeRequired, sanitizeText } from "@/lib/sanitize";

export async function GET() {
  const supabase = await createClient();

  const { data: { user: authUser } } = await supabase.auth.getUser();

  if (!authUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("users")
    .select("id, name, email, phone, chios_box_id, address, plan, plan_status, preferred_language, created_at")
    .eq("supabase_user_id", authUser.id)
    .single();

  if (error) {
    return NextResponse.json({ error: "Failed to fetch user" }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function PATCH(request: Request) {
  const supabase = await createClient();

  const { data: { user: authUser } } = await supabase.auth.getUser();

  if (!authUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: appUser } = await supabase
    .from("users")
    .select("id")
    .eq("supabase_user_id", authUser.id)
    .single();

  if (!appUser) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const body = await request.json();

  // Handle password change separately via Supabase Auth
  if (body.password) {
    if (typeof body.password !== "string" || body.password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 });
    }
    const { error: pwError } = await supabase.auth.updateUser({ password: body.password });
    if (pwError) {
      return NextResponse.json({ error: pwError.message || "Password change failed" }, { status: 500 });
    }
    return NextResponse.json({ success: true });
  }

  const updateData: Record<string, unknown> = {};
  const name = sanitizeRequired(body.name, 100);
  if (name) updateData.name = name;
  if (body.phone !== undefined) updateData.phone = sanitizeText(body.phone, 20) || null;
  if (body.address !== undefined) updateData.address = sanitizeText(body.address, 500) || null;
  if (body.preferred_language !== undefined && ["tr", "en", "de"].includes(body.preferred_language)) {
    updateData.preferred_language = body.preferred_language;
  }

  if (Object.keys(updateData).length === 0) {
    return NextResponse.json({ error: "No fields to update" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("users")
    .update(updateData)
    .eq("id", appUser.id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: "Profile update failed" }, { status: 500 });
  }

  return NextResponse.json(data);
}
