import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";

export async function GET() {
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

  const { data, error } = await supabase
    .from("invoices")
    .select("*")
    .eq("user_id", appUser.id)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function PATCH(request: Request) {
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

  const { data, error } = await supabase
    .from("invoices")
    .update({
      status: "PAID",
      paid_at: new Date().toISOString(),
      qr_code: `QR-CBX-${Date.now()}`,
    })
    .eq("id", body.id)
    .eq("user_id", appUser.id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
