import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const roleCookie = request.cookies.get("proofstack_role")?.value;

  // Public paths that do not require authentication
  const isPublicPath =
    pathname === "/login" ||
    pathname === "/home" ||
    pathname === "/" ||
    pathname.startsWith("/api/") ||
    pathname.startsWith("/_next/") ||
    pathname.includes(".") || // static files like favicon.ico, images
    pathname === "/favicon.ico";

  // 1. Unauthenticated user trying to access a protected route -> redirect to /login
  if (!roleCookie && !isPublicPath) {
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  // 2. Authenticated user visiting /login -> redirect to clean workspace dashboard /
  if (roleCookie && pathname === "/login") {
    const homeUrl = new URL("/", request.url);
    return NextResponse.redirect(homeUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
