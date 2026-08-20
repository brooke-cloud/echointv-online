// middleware.ts

// middleware.ts 顶部：
import { NextResponse, type NextRequest } from "next/server"; // 👈 改为从 next/server 引入

export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // 🛡️ 1. 注入生产级安全 HTTP 响应头
  response.headers.set("X-Frame-Options", "DENY"); // 防点击劫持
  response.headers.set("X-Content-Type-Options", "nosniff"); // 防 MIME 嗅探
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  response.headers.set("X-XSS-Protection", "1; mode=block"); // 防基础 XSS

  // 🛡️ 2. 全局保护 /admin 路由
  const { pathname } = request.nextUrl;
  if (pathname.startsWith("/admin")) {
    const sessionCookie = request.cookies.get("echointv_session")?.value;
    if (!sessionCookie) {
      // 未登录直接重定向到登录页
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return response;
}

// 只拦截页面与 API 请求，排除静态资源
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};