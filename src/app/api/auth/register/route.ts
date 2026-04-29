import { NextResponse } from "next/server";
import { getAdminClient } from "@/lib/supabase-admin";
import { checkRateLimit, rateLimitResponse } from "@/lib/rate-limit";
import { generateChiosBoxId } from "@/lib/constants";
import { registerSchema, validateBody } from "@/lib/validation";

export async function POST(request: Request) {
  // Rate limit: 5 registrations per IP per hour
  const rl = checkRateLimit(request, "STRICT", "register");
  if (!rl.success) return rateLimitResponse(rl.resetAt);

  const body = await request.json();
  const parsed = validateBody(registerSchema, body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  const { name, email, password, plan } = parsed.data;

  const supabase = getAdminClient();

  // Check if email already exists before calling admin API
  const { data: existingAuth } = await supabase.auth.admin.listUsers();
  const alreadyExists = existingAuth?.users?.some(
    (u) => u.email?.toLowerCase() === email.toLowerCase()
  );
  if (alreadyExists) {
    return NextResponse.json({ error: "This email is already registered" }, { status: 409 });
  }

  // Create auth user
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

  // Check if user row already exists
  const { data: existingUser } = await supabase
    .from("users")
    .select("id")
    .eq("supabase_user_id", supabaseUserId)
    .single();

  if (existingUser) {
    return NextResponse.json({ error: "This account is already registered" }, { status: 409 });
  }

  // Generate ChiosBox ID and address
  const chiosBoxId = generateChiosBoxId();
  const address = `${name}\nChiosBox ${chiosBoxId}\nSakız Adası Limanı No: ${chiosBoxId.split("-")[1]}\n82100 Sakız (Chios), Yunanistan`;

  const now = new Date();
  const expiresAt = new Date(now);
  expiresAt.setMonth(expiresAt.getMonth() + 1);

  // Insert user row — NEVER return supabase_user_id to client
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
      plan,
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
