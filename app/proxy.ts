import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function proxy(request: NextRequest) {
  const token = await getToken({ req: request });
  const { pathname } = request.nextUrl;

  // Login, register, NextAuth en redirect altijd doorlaten
  if (
    pathname.startsWith("/login") ||
    pathname.startsWith("/installateur/login") ||
    pathname.startsWith("/register") ||
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/redirect")
  ) {
    return NextResponse.next();
  }

  // Geen token → terug naar login
  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const role = token.role;

  if (pathname.startsWith("/admin") && role !== "admin") {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (pathname.startsWith("/installer") && role !== "installer") {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (pathname.startsWith("/installateur") && role !== "installer") {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (pathname.startsWith("/importer") && role !== "importer") {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (pathname.startsWith("/manufacturer") && role !== "manufacturer") {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/installer/:path*",
    "/installateur/:path*",
    "/importer/:path*",
    "/manufacturer/:path*",
  ],
};
