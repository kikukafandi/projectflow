import { getSessionCookie } from "better-auth/cookies";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Optimistic gate: redirect to /login when no session cookie is present.
 * The real session check happens in the (app) layout on the server.
 */
export function middleware(request: NextRequest) {
  const sessionCookie = getSessionCookie(request);
  if (!sessionCookie) {
    const url = new URL("/login", request.url);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/clients/:path*",
    "/projects/:path*",
    "/library/:path*",
    "/focus/:path*",
    "/invoices/:path*",
    "/payments/:path*",
    "/settings/:path*",
    "/print/:path*",
    "/activity/:path*",
    "/search/:path*",
    "/notifications/:path*",
  ],
};
