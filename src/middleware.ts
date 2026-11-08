import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const PUBLIC_ROUTES = ["/", "/pricing", "/login", "/signup", "/auth/callback", "/reset-password", "/privacy", "/terms", "/contact", "/api/contact", "/marketplace"];
const AUTH_ROUTES = ["/login", "/signup"];

// Pre-launch gate: production shows /coming-soon to everyone except ADMIN_EMAILS
// until SITE_LIVE=true is set in Vercel. Local dev and preview deploys are unaffected.
const PRELAUNCH_GATE = process.env.VERCEL_ENV === "production" && process.env.SITE_LIVE !== "true";
const GATE_OPEN_ROUTES = ["/coming-soon", "/login", "/auth/callback", "/reset-password", "/privacy", "/terms"];
const ADMIN_EMAILS = (process.env.ADMIN_EMAILS ?? "").split(",").map((e) => e.trim().toLowerCase()).filter(Boolean);

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Cron and webhook endpoints handle their own auth — skip session check
  if (pathname.startsWith("/api/cron/") || pathname.startsWith("/api/stripe/webhook")) {
    return NextResponse.next();
  }

  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: Array<{ name: string; value: string; options: CookieOptions }>) {
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

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (PRELAUNCH_GATE) {
    const isAdmin = !!user?.email && ADMIN_EMAILS.includes(user.email.toLowerCase());
    const gateOpen = GATE_OPEN_ROUTES.some((r) => pathname === r || pathname.startsWith(r + "/"));
    if (!isAdmin && !gateOpen) {
      if (pathname.startsWith("/api/")) {
        return NextResponse.json({ error: "Softlivi is not live yet" }, { status: 503 });
      }
      return NextResponse.rewrite(new URL("/coming-soon", request.url));
    }
  }

  const isPublicRoute = PUBLIC_ROUTES.some(
    (r) => pathname === r || pathname.startsWith(r + "/")
  );
  const isAuthRoute = AUTH_ROUTES.includes(pathname);

  // Redirect authenticated users away from auth pages
  if (user && isAuthRoute) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Redirect unauthenticated users to login for protected routes
  if (!user && !isPublicRoute) {
    const redirectUrl = new URL("/login", request.url);
    redirectUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(redirectUrl);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|api/cron|api/stripe/webhook|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|json|txt|xml)$).*)",
  ],
};
