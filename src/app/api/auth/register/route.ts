import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createHash, randomInt } from "crypto";

const VALID_PLANS = ["TEMEL", "PRO", "PREMIUM"];

function generateChiosBoxId(): string {
  const num = randomInt(1000, 9999);
  return `CBX-${num}`;
}

// Server-side Supabase admin client (uses service_role key)
function getAdminClient() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY");
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, key);
}

export async function POST(request: Request) {
  const body = await request.json();
  const { name, email, password, plan } = body;

  if (!name || !email || !password) {
    return NextResponse.json({ error: "Eksik bilgi" }, { status: 400 });
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
      return NextResponse.json({ error: "Bu e-posta adresi zaten kayıtlı" }, { status: 409 });
    }
    return NextResponse.json({ error: "Kayıt başarısız" }, { status: 400 });
  }

  const supabaseUserId = signUpData.user.id;

  // 2. Check if user row already exists
  const { data: existingUser } = await supabase
    .from("users")
    .select("id")
    .eq("supabase_user_id", supabaseUserId)
    .single();

  if (existingUser) {
    return NextResponse.json({ error: "Bu hesap zaten kayıtlı" }, { status: 409 });
  }

  // 3. Generate ChiosBox ID and address
  const chiosBoxId = generateChiosBoxId();
  const address = `${name}\nChiosBox ${chiosBoxId}\nSakız Adası Limanı No: ${chiosBoxId.split("-")[1]}\n82100 Sakız (Chios), Yunanistan`;

  const now = new Date();
  const expiresAt = new Date(now);
  expiresAt.setMonth(expiresAt.getMonth() + 1);

  // 4. Insert user row — only safe fields
  const { data: userRow, error: insertError } = await supabase
    .from("users")
    .insert({
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
    return NextResponse.json({ error: "Kayıt oluşturulamadı" }, { status: 500 });
  }

  return NextResponse.json({ user: userRow }, { status: 201 });
}
