import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import { sanitizeText } from "@/lib/sanitize";
import { requireAuth } from "@/lib/auth-guard";
import { checkRateLimit, rateLimitResponse } from "@/lib/rate-limit";
import { createPackageSchema, validateBody } from "@/lib/validation";

export async function GET() {
  const { user, error } = await requireAuth();
  if (error) return error;

  const supabase = await createClient();
  const { data, error: fetchErr } = await supabase
    .from("packages")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (fetchErr) {
    return NextResponse.json({ error: "Operation failed" }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const rl = checkRateLimit(request, "DEFAULT", "packages:create");
  if (!rl.success) return rateLimitResponse(rl.resetAt);

  const { user, error } = await requireAuth();
  if (error) return error;

  const body = await request.json();
  const parsed = validateBody(createPackageSchema, body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  const { trackingNo, carrier, content, weightKg, dimensions, notes } = parsed.data;

  const supabase = await createClient();

  // Check for duplicate tracking number
  const { data: existing } = await supabase
    .from("packages")
    .select("id")
    .eq("user_id", user.id)
    .eq("tracking_no", trackingNo)
    .single();

  if (existing) {
    return NextResponse.json(
      { error: "You have already reported a package with this tracking number" },
      { status: 409 }
    );
  }

  const { data, error: insertErr } = await supabase
    .from("packages")
    .insert({
      user_id: user.id,
      tracking_no: trackingNo,
      carrier,
      content: content ? sanitizeText(content, 500) : null,
      weight_kg: weightKg ?? null,
      dimensions: dimensions ? sanitizeText(dimensions, 100) : null,
      notes: notes ? sanitizeText(notes, 1000) : null,
      status: "BEKLENIYOR",
    })
    .select()
    .single();

  if (insertErr) {
    return NextResponse.json({ error: "Operation failed" }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}
