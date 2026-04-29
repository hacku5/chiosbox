import { NextResponse } from "next/server";
import { getAdminClient } from "@/lib/supabase-admin";
import { rateLimit, getClientIp, rateLimitResponse } from "@/lib/rate-limit";
import { VALID_PLANS, generateChiosBoxId } from "@/lib/constants";

export async function POST(request: Request) {
  // Rate limit: 5 registrations per IP per hour
  const ip = getClientIp(request);
  const rl = rateLimit(`register:${ip}`, 5, 60 * 60 * 1000);
  if (!rl.success) return rateLimitResponse(rl.resetAt);

  const body = await request.json();
  const { name, email, password, plan } = body;

  if (!name || !email || !password) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  // Validate plan against allowlist
  const selectedPlan = VALID_PLANS.includes(plan) ? plan : "TEMEL";

  const supabase = getAdminClient();

  // 1. Create auth user (server-side, bypasses email confirmation)
  const { data: signUpData, error: signUpError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { name },
  });

  if (signUpError) {
    if (signUpError.message.includes("already registered") || signUpError.message.includes("already exists")) {
      return NextResponse.json({ error: "This email is already registered" }, { status: 409 });
    }
    return NextResponse.json({ error: "Registration failed" }, { status: 400 });
  }

  const supabaseUserId = signUpData.user.id;

  // 2. Check if user row already exists
  const { data: existingUser } = await supabase
    .from("users")
    .select("id")
    .eq("supabase_user_id", supabaseUserId)
    .single();

  if (existingUser) {
    return NextResponse.json({ error: "This account is already registered" }, { status: 409 });
  }

  // 3. Generate ChiosBox ID and address
  const chiosBoxId = generateChiosBoxId();
  const address = `${name}\nChiosBox ${chiosBoxId}\nSakız Adası Limanı No: ${chiosBoxId.split("-")[1]}\n82100 Sakız (Chios), Yunanistan`;

  const now = new Date();
  const expiresAt = new Date(now);
  expiresAt.setMonth(expiresAt.getMonth() + 1);

  // 4. Insert user row — use Supabase Auth UUID as primary key
  const { data: userRow, error: insertError } = await supabase
    .from("users")
    .insert({
      id: supabaseUserId,
      supabase_user_id: supabaseUserId,
      email,
      name,
      chios_box_id: chiosBoxId,
      address,
      tos_accepted: true,
      plan: selectedPlan,
      plan_status: "active",
      plan_started_at: now.toISOString(),
      plan_expires_at: expiresAt.toISOString(),
    })
    .select("id, name, email, chios_box_id, address, plan, plan_status")
    .single();

  if (insertError) {
    return NextResponse.json({ error: "Registration could not be created" }, { status: 500 });
  }

  return NextResponse.json({ user: userRow }, { status: 201 });
}
