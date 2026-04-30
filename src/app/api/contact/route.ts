import { NextResponse } from "next/server";
import { getAdminClient } from "@/lib/supabase-admin";

export async function POST(request: Request) {
  const body = await request.json();
  const { name, email, subject, message } = body;

  if (!name || !email || !message) {
    return NextResponse.json({ error: "name, email, and message are required" }, { status: 400 });
  }

  const supabase = getAdminClient();
  const { error } = await supabase.from("contact_messages").insert({
    name, email, subject: subject || "", message,
  });

  if (error) return NextResponse.json({ error: "Failed to send message" }, { status: 500 });
  return NextResponse.json({ success: true });
}
