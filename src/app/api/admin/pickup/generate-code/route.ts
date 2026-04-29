import { NextResponse } from "next/server";
import { getAdminClient } from "@/lib/supabase-admin";
import { requireAdmin } from "@/lib/admin-guard";
import { sendPushToUser } from "@/lib/send-notification";
import { randomInt, createHash } from "crypto";
import { rateLimit, getClientIp, rateLimitResponse } from "@/lib/rate-limit";

export async function POST(request: Request) {
  // Rate limit: 30 code generations per admin per minute
  const ip = getClientIp(request);
  const rl = rateLimit(`pickup-code:${ip}`, 30, 60 * 1000);
  if (!rl.success) return rateLimitResponse(rl.resetAt);

  const { user, error } = await requireAdmin("pickup");
  if (error) return error;

  const supabase = getAdminClient();
  const body = await request.json();
  const { packageId } = body;

  if (!packageId) {
    return NextResponse.json({ error: "Package ID is required" }, { status: 400 });
  }

  // Verify package exists and belongs to a user
  const { data: pkg, error: fetchErr } = await supabase
    .from("packages")
    .select("id, user_id, users(phone)")
    .eq("id", packageId)
    .single();

  if (fetchErr || !pkg) {
    return NextResponse.json({ error: "Package not found" }, { status: 404 });
  }

  // Generate 6-digit code using crypto.randomInt
  const code = String(randomInt(100000, 999999));
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();

  // Hash the code before storing
  const codeHash = createHash("sha256").update(code).digest("hex");

  // Save hashed code to DB
  const { error: updateErr } = await supabase
    .from("packages")
    .update({
      delivery_code: codeHash,
      delivery_code_expires_at: expiresAt,
    })
    .eq("id", packageId);

  if (updateErr) {
    return NextResponse.json({ error: updateErr.message }, { status: 500 });
  }

  // Push notification — don't leak the code in notification
  sendPushToUser(pkg.user_id, {
    title: "Your Delivery Code is Ready",
    body: "Open the app to get your code",
    url: "/user",
  }).catch(() => {});

  // Return the plain code only to the admin who generated it (for display on screen)
  return NextResponse.json({ success: true, code, expiresAt });
}
