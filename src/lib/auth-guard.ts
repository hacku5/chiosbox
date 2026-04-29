import { createClient } from "@/lib/supabase-server";
import { NextResponse } from "next/server";

export interface AuthUser {
  id: string;
  supabase_user_id: string;
}

export async function requireAuth(): Promise<
  | { user: AuthUser; error: null }
  | { user: null; error: NextResponse }
> {
  const supabase = await createClient();
  const { data: { user: authUser } } = await supabase.auth.getUser();

  if (!authUser) {
    return { user: null, error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }

  const { data: appUser } = await supabase
    .from("users")
    .select("id, supabase_user_id")
    .eq("supabase_user_id", authUser.id)
    .single();

  if (!appUser) {
    return { user: null, error: NextResponse.json({ error: "User not found" }, { status: 404 }) };
  }

  return { user: { id: appUser.id, supabase_user_id: appUser.supabase_user_id }, error: null };
}
