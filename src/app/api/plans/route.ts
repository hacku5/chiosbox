import { NextResponse } from "next/server";
import { getAdminClient } from "@/lib/supabase-admin";

export async function GET() {
  const supabase = getAdminClient();
  const { data, error } = await supabase.from("plans")
    .select("id, name, price, features, sort_order")
    .eq("is_active", true).order("sort_order");

  if (error) return NextResponse.json({ error: "Failed to load plans" }, { status: 500 });
  return NextResponse.json({ plans: data });
}
