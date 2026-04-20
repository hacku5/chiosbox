import { NextResponse } from "next/server";
import { getAdminClient } from "@/lib/supabase-admin";
import { requireAdmin } from "@/lib/admin-guard";
import { createHash } from "crypto";

export async function POST(request: Request) {
  const { user, error } = await requireAdmin("pickup");
  if (error) return error;

  const supabase = getAdminClient();
  const body = await request.json();
  const { packageId, code } = body;

  if (!packageId) {
    return NextResponse.json({ error: "Paket ID gerekli" }, { status: 400 });
  }

  if (!code) {
    return NextResponse.json({ error: "Doğrulama kodu gerekli" }, { status: 400 });
  }

  // Fetch package with delivery code
  const { data: pkg, error: fetchErr } = await supabase
    .from("packages")
    .select("id, delivery_code, delivery_code_expires_at")
    .eq("id", packageId)
    .single();

  if (fetchErr || !pkg) {
    return NextResponse.json({ error: "Paket bulunamadı" }, { status: 404 });
  }

  if (!pkg.delivery_code) {
    return NextResponse.json({ error: "Bu paket için henüz kod üretilmedi" }, { status: 400 });
  }

  // Check expiry
  if (pkg.delivery_code_expires_at && new Date(pkg.delivery_code_expires_at) < new Date()) {
    return NextResponse.json({ error: "Kodun süresi dolmuş, yeni kod gönderin" }, { status: 400 });
  }

  // Hash entered code and compare with stored hash
  const codeHash = createHash("sha256").update(code).digest("hex");
  if (pkg.delivery_code !== codeHash) {
    return NextResponse.json({ error: "Kod hatalı" }, { status: 400 });
  }

  // Deliver package
  const { data, error: updateError } = await supabase
    .from("packages")
    .update({
      status: "TESLIM_EDILDI",
      delivery_code: null,
      delivery_code_expires_at: null,
    })
    .eq("id", packageId)
    .select()
    .single();

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
