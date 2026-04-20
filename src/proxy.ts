import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  let user = null;
  try {
    const result = await supabase.auth.getUser();
    user = result.data.user;
  } catch {
    user = null;
  }

  const { pathname } = request.nextUrl;

  // Pass pathname as header so server components can read it
  supabaseResponse.headers.set("x-pathname", pathname);

  // Redirect authenticated users away from login/register
  if (user && (pathname === "/login" || pathname === "/register")) {
    // Check if user is admin to redirect to correct dashboard
    try {
      const { data: appUser } = await supabase
        .from("users")
        .select("is_admin")
        .eq("supabase_user_id", user.id)
        .single();

      if (appUser?.is_admin) {
        return NextResponse.redirect(new URL("/admin", request.url));
      }
    } catch { /* fall through to default */ }
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Redirect authenticated admins away from admin login
  if (user && pathname === "/admin/login") {
    try {
      const { data: appUser } = await supabase
        .from("users")
        .select("is_admin")
        .eq("supabase_user_id", user.id)
        .single();

      if (appUser?.is_admin) {
        return NextResponse.redirect(new URL("/admin", request.url));
      }
    } catch { /* fall through */ }
  }

  // Protect dashboard routes
  if (pathname.startsWith("/dashboard") && !user) {
    const redirectUrl = new URL("/login", request.url);
    redirectUrl.searchParams.set("redirectedFrom", pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // Protect admin routes (except login)
  if (pathname.startsWith("/admin") && pathname !== "/admin/login" && !user) {
    const redirectUrl = new URL("/admin/login", request.url);
    return NextResponse.redirect(redirectUrl);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/admin/:path*",
    "/api/:path*",
    "/login",
    "/register",
  ],
};
