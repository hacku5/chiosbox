import { NextResponse } from "next/server";
import { getAdminClient } from "@/lib/supabase-admin";
import { requireAdmin, auditLog } from "@/lib/admin-guard";
import { sendPushToUser } from "@/lib/send-notification";
import { randomInt, createHash } from "crypto";
import { rateLimit, getClientIp, rateLimitResponse } from "@/lib/rate-limit";
import { validateBody } from "@/lib/validation";
import { z } from "zod";

const generateCodeSchema = z.object({
  packageId: z.string().uuid(),
});

export async function POST(request: Request) {
  // Rate limit: 30 code generations per admin per minute
  const ip = getClientIp(request);
  const rl = rateLimit(`pickup-code:${ip}`, 30, 60 * 1000);
  if (!rl.success) return rateLimitResponse(rl.resetAt);

  const { user, error } = await requireAdmin("pickup");
  if (error) return error;

  const body = await request.json();
  const parsed = validateBody(generateCodeSchema, body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  const { packageId } = parsed.data;
  const supabase = getAdminClient();

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
    return NextResponse.json({ error: "Failed to generate code" }, { status: 500 });
  }

  // Push notification — don't leak the code in notification
  sendPushToUser(pkg.user_id, {
    title: "Your Delivery Code is Ready",
    body: "Open the app to get your code",
    url: "/dashboard",
  }).catch(() => {});

  auditLog("pickup.code_generated", user.id, `package:${packageId}`);

  // Return the plain code only to the admin who generated it (for display on screen)
  return NextResponse.json({ success: true, code, expiresAt });
}
