import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import { sanitizeText } from "@/lib/sanitize";
import { requireAuth } from "@/lib/auth-guard";
import { updateUserSchema, validateBody } from "@/lib/validation";
import { checkRateLimit, rateLimitResponse } from "@/lib/rate-limit";

// Fields that are safe to return to the owning user
const SAFE_USER_FIELDS = [
  "id", "name", "email", "phone", "chios_box_id", "address",
  "plan", "plan_status", "preferred_language", "created_at"
].join(", ");

export async function GET() {
  const { user, error } = await requireAuth();
  if (error) return error;

  const supabase = await createClient();
  const { data, error: fetchErr } = await supabase
    .from("users")
    .select(SAFE_USER_FIELDS)
    .eq("id", user.id)
    .single();

  if (fetchErr) {
    return NextResponse.json({ error: "Failed to fetch user" }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function PATCH(request: Request) {
  const { user, error } = await requireAuth();
  if (error) return error;

  const rl = checkRateLimit(request, "DEFAULT", "user:update");
  if (!rl.success) return rateLimitResponse(rl.resetAt);

  const supabase = await createClient();

  const body = await request.json();

  // Handle password change separately via Supabase Auth
  if (body.password) {
    const parsed = updateUserSchema.pick({ password: true }).safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters" },
        { status: 400 }
      );
    }
    const { error: pwError } = await supabase.auth.updateUser({
      password: parsed.data.password,
    });
    if (pwError) {
      return NextResponse.json(
        { error: pwError.message || "Password change failed" },
        { status: 500 }
      );
    }
    return NextResponse.json({ success: true });
  }

  const parsed = validateBody(updateUserSchema.omit({ password: true }), body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  const updateData: Record<string, unknown> = {};
  if (parsed.data.name) updateData.name = sanitizeText(parsed.data.name, 100);
  if (parsed.data.phone !== undefined) updateData.phone = sanitizeText(parsed.data.phone, 20) || null;
  if (parsed.data.address !== undefined) updateData.address = sanitizeText(parsed.data.address, 500) || null;
  if (parsed.data.preferred_language) updateData.preferred_language = parsed.data.preferred_language;

  if (Object.keys(updateData).length === 0) {
    return NextResponse.json({ error: "No fields to update" }, { status: 400 });
  }

  const { data, error: updateErr } = await supabase
    .from("users")
    .update(updateData)
    .eq("id", user.id)
    .select(SAFE_USER_FIELDS)
    .single();

  if (updateErr) {
    return NextResponse.json({ error: "Profile update failed" }, { status: 500 });
  }

  return NextResponse.json(data);
}
