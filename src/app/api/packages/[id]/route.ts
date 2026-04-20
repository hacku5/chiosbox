import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient();
  const { id } = await params;

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

  // Verify ownership before deleting
  const { data: pkg } = await supabase
    .from("packages")
    .select("id, user_id, status")
    .eq("id", id)
    .single();

  if (!pkg) {
    return NextResponse.json({ error: "Paket bulunamadı" }, { status: 404 });
  }

  if (pkg.user_id !== appUser.id) {
    return NextResponse.json({ error: "Bu paketi silme yetkiniz yok" }, { status: 403 });
  }

  // Only allow deletion of packages that haven't been processed yet
  if (pkg.status !== "BEKLENIYOR") {
    return NextResponse.json(
      { error: "Sadece beklemede olan paketler silinebilir. Depodaki paketler için destek ile iletişime geçin." },
      { status: 400 }
    );
  }

  const { error } = await supabase
    .from("packages")
    .delete()
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
