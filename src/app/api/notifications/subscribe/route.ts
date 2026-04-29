import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import { requireAuth } from "@/lib/auth-guard";
import { pushSubscriptionSchema, validateBody } from "@/lib/validation";
import { checkRateLimit, rateLimitResponse } from "@/lib/rate-limit";

export async function POST(request: Request) {
  const { user, error } = await requireAuth();
  if (error) return error;

  const rl = checkRateLimit(request, "DEFAULT", "notifications:subscribe");
  if (!rl.success) return rateLimitResponse(rl.resetAt);

  const body = await request.json();
  const parsed = validateBody(pushSubscriptionSchema, body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  const supabase = await createClient();
  const { data, error: upsertErr } = await supabase
    .from("push_subscriptions")
    .upsert({
      user_id: user.id,
      endpoint: parsed.data.endpoint,
      p256dh: parsed.data.keys.p256dh,
      auth: parsed.data.keys.auth,
    }, { onConflict: "user_id, endpoint" })
    .select()
    .single();

  if (upsertErr) {
    return NextResponse.json({ error: "Subscription failed" }, { status: 500 });
  }

  return NextResponse.json({ success: true }, { status: 201 });
}
