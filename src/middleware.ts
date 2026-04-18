import { NextResponse, type NextRequest } from "next/server";

const PROTECTED = ["/dashboard", "/workout", "/outdoor", "/progression", "/nutrition", "/subscription", "/settings", "/admin", "/safety"];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const needsAuth = PROTECTED.some((p) => pathname === p || pathname.startsWith(`${p}/`));
  if (!needsAuth) return NextResponse.next();

  const token = req.cookies.get("authjs.session-token") ?? req.cookies.get("__Secure-authjs.session-token");
  if (!token) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next|favicon.ico|manifest.webmanifest|.*\\..*).*)"],
};
