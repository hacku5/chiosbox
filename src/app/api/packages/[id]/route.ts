import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import { requireAuth } from "@/lib/auth-guard";
import { uuid } from "@/lib/validation";
import { checkRateLimit, rateLimitResponse } from "@/lib/rate-limit";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { user, error } = await requireAuth();
  if (error) return error;

  const rl = checkRateLimit(request, "DEFAULT", "package:delete");
  if (!rl.success) return rateLimitResponse(rl.resetAt);

  const { id } = await params;
  const idResult = uuid.safeParse(id);
  if (!idResult.success) {
    return NextResponse.json({ error: "Invalid package ID" }, { status: 400 });
  }

  const supabase = await createClient();

  // Verify ownership and status
  const { data: pkg } = await supabase
    .from("packages")
    .select("id, status")
    .eq("id", idResult.data)
    .eq("user_id", user.id)
    .single();

  if (!pkg) {
    return NextResponse.json({ error: "Package not found" }, { status: 404 });
  }

  if (pkg.status !== "BEKLENIYOR") {
    return NextResponse.json(
      { error: "Only pending packages can be deleted" },
      { status: 400 }
    );
  }

  const { error: deleteErr } = await supabase
    .from("packages")
    .delete()
    .eq("id", idResult.data)
    .eq("user_id", user.id);

  if (deleteErr) {
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
