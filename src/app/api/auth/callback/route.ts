import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { randomInt } from "crypto";

const VALID_PLANS = ["TEMEL", "PRO", "PREMIUM"];

// Generate a ChiosBox ID like "CBX-1234"
function generateChiosBoxId(): string {
  const num = randomInt(1000, 9999);
  return `CBX-${num}`;
}

export async function POST(request: Request) {
  const body = await request.json();
  const { supabaseUserId, name, email, plan } = body;

  if (!supabaseUserId || !name || !email) {
    return NextResponse.json({ error: "Eksik bilgi" }, { status: 400 });
  }

  // Validate plan against allowlist
  const selectedPlan = VALID_PLANS.includes(plan) ? plan : "TEMEL";

  // Direct Supabase client with anon key — bypasses cookie auth
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // Check if user already exists by supabase_user_id
  const { data: existing } = await supabase
    .from("users")
    .select("id")
    .eq("supabase_user_id", supabaseUserId)
    .single();

  if (existing) {
    return NextResponse.json({ error: "Bu hesap zaten kayıtlı" }, { status: 409 });
  }

  // Check if email already taken
  const { data: emailExists } = await supabase
    .from("users")
    .select("id")
    .eq("email", email)
    .single();

  if (emailExists) {
    return NextResponse.json({ error: "Bu e-posta adresi zaten kayıtlı" }, { status: 409 });
  }

  const chiosBoxId = generateChiosBoxId();

  // Create address for the user based on ChiosBox ID
  const address = `${name}\nChiosBox ${chiosBoxId}\nSakız Adası Limanı No: ${chiosBoxId.split("-")[1]}\n82100 Sakız (Chios), Yunanistan`;

  const now = new Date();
  const expiresAt = new Date(now);
  expiresAt.setMonth(expiresAt.getMonth() + 1);

  const { data, error } = await supabase
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

  if (error) {
    return NextResponse.json({ error: "Kayıt oluşturulamadı" }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}
