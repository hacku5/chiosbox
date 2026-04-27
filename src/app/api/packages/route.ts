import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import { sanitizeRequired, sanitizeText } from "@/lib/sanitize";

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
    return NextResponse.json({ error: "Operation failed" }, { status: 500 });
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

  const trackingNo = sanitizeRequired(body.trackingNo, 100);
  if (!trackingNo) {
    return NextResponse.json({ error: "Tracking number is required" }, { status: 400 });
  }

  const carrier = sanitizeRequired(body.carrier, 50);
  if (!carrier) {
    return NextResponse.json({ error: "Carrier is required" }, { status: 400 });
  }

  // Check for duplicate tracking number for this user
  const { data: existing } = await supabase
    .from("packages")
    .select("id")
    .eq("user_id", appUser.id)
    .eq("tracking_no", trackingNo)
    .single();

  if (existing) {
    return NextResponse.json({ error: "You have already reported a package with this tracking number" }, { status: 409 });
  }

  // Validate weight if provided
  let weightKg: number | null = null;
  if (body.weightKg !== undefined && body.weightKg !== null) {
    const parsed = Number(body.weightKg);
    if (!isNaN(parsed) && parsed > 0 && parsed <= 1000) {
      weightKg = parsed;
    }
  }

  const { data, error } = await supabase
    .from("packages")
    .insert({
      user_id: appUser.id,
      tracking_no: trackingNo,
      carrier,
      content: sanitizeText(body.content, 500),
      weight_kg: weightKg,
      dimensions: sanitizeText(body.dimensions, 100),
      notes: sanitizeText(body.notes, 1000),
      status: "BEKLENIYOR",
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: "Operation failed" }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}
