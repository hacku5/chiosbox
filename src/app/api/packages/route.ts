import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";

export async function GET() {
  const supabase = await createClient();

  const { data: { user: authUser } } = await supabase.auth.getUser();
  if (!authUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Get the app user row
  const { data: appUser } = await supabase
    .from("users")
    .select("id")
    .eq("supabase_user_id", authUser.id)
    .single();

  if (!appUser) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const { data, error } = await supabase
    .from("packages")
    .select("*")
    .eq("user_id", appUser.id)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const supabase = await createClient();

  const { data: { user: authUser } } = await supabase.auth.getUser();
  if (!authUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: appUser } = await supabase
    .from("users")
    .select("id")
    .eq("supabase_user_id", authUser.id)
    .single();

  if (!appUser) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const body = await request.json();

  if (!body.trackingNo || typeof body.trackingNo !== "string" || body.trackingNo.trim().length === 0) {
    return NextResponse.json({ error: "Takip numarası gerekli" }, { status: 400 });
  }

  if (!body.carrier || typeof body.carrier !== "string" || body.carrier.trim().length === 0) {
    return NextResponse.json({ error: "Kargo şirketi gerekli" }, { status: 400 });
  }

  if (body.trackingNo.length > 100) {
    return NextResponse.json({ error: "Takip numarası çok uzun" }, { status: 400 });
  }

  // Check for duplicate tracking number for this user
  const { data: existing } = await supabase
    .from("packages")
    .select("id")
    .eq("user_id", appUser.id)
    .eq("tracking_no", body.trackingNo)
    .single();

  if (existing) {
    return NextResponse.json({ error: "Bu takip numarası ile daha önce paket bildirdiniz" }, { status: 409 });
  }

  const { data, error } = await supabase
    .from("packages")
    .insert({
      user_id: appUser.id,
      tracking_no: body.trackingNo,
      carrier: body.carrier,
      content: body.content,
      weight_kg: body.weightKg || null,
      dimensions: body.dimensions || null,
      notes: body.notes || null,
      status: "BEKLENIYOR",
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}
