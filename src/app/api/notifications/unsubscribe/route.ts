import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import { requireAuth } from "@/lib/auth-guard";

export async function POST(request: Request) {
  const { user, error } = await requireAuth();
  if (error) return error;

  const body = await request.json();
  const { endpoint } = body;

  if (!endpoint || typeof endpoint !== "string") {
    return NextResponse.json({ error: "Endpoint is required" }, { status: 400 });
  }

  const supabase = await createClient();
  const { error: deleteErr } = await supabase
    .from("push_subscriptions")
    .delete()
    .eq("user_id", user.id)
    .eq("endpoint", endpoint);

  if (deleteErr) {
    return NextResponse.json({ error: "Unsubscribe failed" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
