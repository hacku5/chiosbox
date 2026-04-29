import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import { requireAuth } from "@/lib/auth-guard";
import { checkRateLimit, rateLimitResponse } from "@/lib/rate-limit";
import { sanitizeRequired } from "@/lib/sanitize";
import { uuid, messageSchema, validateBody } from "@/lib/validation";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { user, error } = await requireAuth();
  if (error) return error;

  const { id } = await params;
  const idResult = uuid.safeParse(id);
  if (!idResult.success) {
    return NextResponse.json({ error: "Invalid package ID" }, { status: 400 });
  }

  const supabase = await createClient();

  // Verify ownership (admins bypass via admin check)
  const { data: pkg } = await supabase
    .from("packages")
    .select("id, user_id")
    .eq("id", idResult.data)
    .single();

  if (!pkg) {
    return NextResponse.json({ error: "Package not found" }, { status: 404 });
  }

  // Allow admin access
  if (pkg.user_id !== user.id) {
    const { data: adminCheck } = await supabase
      .from("users")
      .select("is_admin")
      .eq("id", user.id)
      .single();

    if (!adminCheck?.is_admin) {
      return NextResponse.json({ error: "Not authorized" }, { status: 403 });
    }
  }

  const { data: messages, error: fetchErr } = await supabase
    .from("package_messages")
    .select("*")
    .eq("package_id", idResult.data)
    .order("created_at", { ascending: true });

  if (fetchErr) {
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }

  return NextResponse.json(messages);
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const rl = checkRateLimit(request, "STRICT", "messages:send");
  if (!rl.success) return rateLimitResponse(rl.resetAt);

  const { user, error } = await requireAuth();
  if (error) return error;

  const { id } = await params;
  const idResult = uuid.safeParse(id);
  if (!idResult.success) {
    return NextResponse.json({ error: "Invalid package ID" }, { status: 400 });
  }

  const body = await request.json();
  const parsed = validateBody(messageSchema, body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  const cleanMessage = sanitizeRequired(parsed.data.message, 2000);
  if (!cleanMessage) {
    return NextResponse.json({ error: "Message cannot be empty" }, { status: 400 });
  }

  const supabase = await createClient();

  const { data, error: insertErr } = await supabase
    .from("package_messages")
    .insert({
      package_id: idResult.data,
      sender_id: user.id,
      message: cleanMessage,
    })
    .select()
    .single();

  if (insertErr) {
    return NextResponse.json({ error: "Failed to send" }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}
