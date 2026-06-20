import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Keep the installer login route public to avoid redirect loops.
  if (pathname.startsWith("/installateur/login")) {
    return NextResponse.next();
  }

  const token = await getToken({ req: request });

  if (!token || token.role !== "installer") {
    return NextResponse.redirect(new URL("/installateur/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/installateur/:path*"],
};
