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

  // --- Language prefix handling ---
  // Match /en/*, /de/*, /tr/* etc. — set cookie and redirect to root path
  const langPrefixMatch = pathname.match(/^\/([a-z]{2})\/(.*)$/);
  if (langPrefixMatch) {
    const [, prefixLang, rest] = langPrefixMatch;
    // Verify this language exists and is enabled
    try {
      const { data: lang } = await supabase
        .from("languages")
        .select("code, is_enabled")
        .eq("code", prefixLang)
        .eq("is_enabled", true)
        .single();

      if (lang) {
        const redirectUrl = new URL(`/${rest}`, request.url);
        const response = NextResponse.redirect(redirectUrl);
        response.cookies.set("lang", prefixLang, {
          path: "/",
          maxAge: 365 * 24 * 60 * 60,
          sameSite: "lax",
        });
        return response;
      }
    } catch { /* language not found, fall through */ }
  }

  // Pass current language as header
  const currentLang = request.cookies.get("lang")?.value || "en";
  supabaseResponse.headers.set("x-lang", currentLang);

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

  // Note: API route auth is handled by each route handler individually
  // (via requireAdmin(), getUser() etc.) — proxy layer cannot return
  // response bodies in Next.js 16.

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/admin/:path*",
    "/login",
    "/register",
    "/:lang(tr|en|de)/:path*",
  ],
};
