import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import { rateLimit, getClientIp, rateLimitResponse } from "@/lib/rate-limit";
import { sanitizeRequired } from "@/lib/sanitize";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: { user: authUser } } = await supabase.auth.getUser();
  if (!authUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: appUser } = await supabase
    .from("users")
    .select("id, is_admin")
    .eq("supabase_user_id", authUser.id)
    .single();

  if (!appUser) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  // Verify the package belongs to this user (or user is admin)
  if (!appUser.is_admin) {
    const { data: pkg } = await supabase
      .from("packages")
      .select("id")
      .eq("id", id)
      .eq("user_id", appUser.id)
      .single();

    if (!pkg) {
      return NextResponse.json({ error: "Package not found" }, { status: 404 });
    }
  }

  const { data, error } = await supabase
    .from("package_messages")
    .select("*, users(name)")
    .eq("package_id", id)
    .order("created_at", { ascending: true });

  if (error) {
    return NextResponse.json({ error: "Operation failed" }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  // Rate limit: 20 messages per IP per minute
  const ip = getClientIp(request);
  const rl = rateLimit(`msg:${ip}`, 20, 60 * 1000);
  if (!rl.success) return rateLimitResponse(rl.resetAt);

  const { id } = await params;
  const supabase = await createClient();

  const { data: { user: authUser } } = await supabase.auth.getUser();
  if (!authUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: appUser } = await supabase
    .from("users")
    .select("id, is_admin")
    .eq("supabase_user_id", authUser.id)
    .single();

  if (!appUser) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const body = await request.json();
  const message = sanitizeRequired(body.message, 2000);
  if (!message) {
    return NextResponse.json({ error: "Message cannot be empty" }, { status: 400 });
  }

  // Verify the package belongs to this user (or user is admin)
  if (!appUser.is_admin) {
    const { data: pkg } = await supabase
      .from("packages")
      .select("id")
      .eq("id", id)
      .eq("user_id", appUser.id)
      .single();

    if (!pkg) {
      return NextResponse.json({ error: "Package not found" }, { status: 404 });
    }
  }

  const { data, error } = await supabase
    .from("package_messages")
    .insert({
      package_id: id,
      user_id: appUser.id,
      message,
      is_admin: appUser.is_admin,
    })
    .select("*, users(name)")
    .single();

  if (error) {
    return NextResponse.json({ error: "Operation failed" }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}
