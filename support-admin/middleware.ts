import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const protectedPaths = ["/dashboard"];
const authPaths = ["/auth"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isAuthenticated = request.cookies.get("auth_token")?.value === "authenticated";

  // Разрешаем Google OAuth callback
  if (pathname.startsWith("/api/auth/google")) {
    return NextResponse.next();
  }

  // Защищённые роуты — редирект на логин если не аутентифицирован
  if (protectedPaths.some((p) => pathname.startsWith(p))) {
    if (!isAuthenticated) {
      return NextResponse.redirect(new URL("/auth/sign-in", request.url));
    }
  }

  // Роуты аутентификации — редирект на дашборд если уже аутентифицирован
  // (кроме страниц сброса пароля)
  const resetPaths = ["/auth/forgot-password", "/auth/reset-password"];
  if (authPaths.some((p) => pathname.startsWith(p)) && !resetPaths.includes(pathname)) {
    if (isAuthenticated) {
      return NextResponse.redirect(new URL("/dashboard/messages", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/auth/:path*"],
};
