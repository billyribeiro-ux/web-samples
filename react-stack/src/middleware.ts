import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest) {
  const token = await getToken({
    req,
    secret: process.env.AUTH_SECRET,
  });
  const pathname = req.nextUrl.pathname;
  const isLoggedIn = !!token;

  const memberPrefixes = ["/account", "/members", "/library"];
  const needsAuth =
    pathname.startsWith("/admin") ||
    memberPrefixes.some((p) => pathname === p || pathname.startsWith(`${p}/`));

  if (needsAuth && !isLoggedIn) {
    const login = new URL("/login", req.url);
    login.searchParams.set("callbackUrl", pathname + req.nextUrl.search);
    return NextResponse.redirect(login);
  }

  if (
    (pathname === "/login" || pathname === "/register") &&
    isLoggedIn
  ) {
    return NextResponse.redirect(new URL("/account", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/account/:path*",
    "/members/:path*",
    "/library/:path*",
    "/login",
    "/register",
  ],
};
