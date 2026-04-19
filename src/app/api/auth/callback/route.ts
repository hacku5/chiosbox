import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

// Generate a ChiosBox ID like "CBX-1234"
function generateChiosBoxId(): string {
  const num = Math.floor(1000 + Math.random() * 9000);
  return `CBX-${num}`;
}

export async function POST(request: Request) {
  const body = await request.json();
  const { supabaseUserId, name, email, plan } = body;

  if (!supabaseUserId || !name || !email) {
    return NextResponse.json(
      { error: "Eksik bilgi" },
      { status: 400 }
    );
  }

  // Check if user already exists by supabase_user_id
  const { data: existing } = await supabase
    .from("users")
    .select("*")
    .eq("supabase_user_id", supabaseUserId)
    .single();

  if (existing) {
    return NextResponse.json(existing);
  }

  // Check if email already taken
  const { data: emailExists } = await supabase
    .from("users")
    .select("id")
    .eq("email", email)
    .single();

  if (emailExists) {
    return NextResponse.json(
      { error: "Bu e-posta adresi zaten kayıtlı" },
      { status: 409 }
    );
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
      plan: plan || "TEMEL",
      plan_status: "active",
      plan_started_at: now.toISOString(),
      plan_expires_at: expiresAt.toISOString(),
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json(data, { status: 201 });
}
