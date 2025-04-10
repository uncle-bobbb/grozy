import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

// 미들웨어에서 처리할 경로 패턴 수정
export const config = {
  matcher: [
    "/column/:path*",    // 칼럼 경로 (write와 ID 기반 상세 페이지만)
    "/community/:path*", // 커뮤니티 경로
    "/mypage/:path*",    // 마이페이지
    "/admin/:path*",     // 관리자 페이지
  ],
};

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  
  // 메인 칼럼/커뮤니티 목록 페이지는 미들웨어 적용하지 않음
  if (pathname === "/column" || pathname === "/community") {
    return NextResponse.next();
  }
  
  // JWT 토큰으로 인증 확인 (auth() 대신 getToken() 사용)
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
  
  // 로그인 여부 확인
  const isAuthenticated = !!token;
  
  // 권한 확인
  const userRole = token?.role as string || null;
  const isExpert = userRole === "expert" || userRole === "admin";
  const isAdmin = userRole === "admin";

  // 계정 상태 확인
  const userStatus = token?.status as string || null;
  const isActive = userStatus === "active";

  // 로그인 페이지 URL (리디렉션용)
  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set("callbackUrl", pathname);
  
  // 권한 없음 페이지 URL
  const unauthorizedUrl = new URL("/unauthorized", request.url);

  // 칼럼 경로 처리 (상세 페이지 또는 작성 페이지)
  if (pathname.startsWith("/column/")) {
    // 칼럼 작성 페이지는 전문가/관리자만 접근 가능
    if (pathname === "/column/write") {
      if (!isAuthenticated) return NextResponse.redirect(loginUrl);
      if (!isExpert) return NextResponse.redirect(unauthorizedUrl);
    } 
    // 칼럼 상세 페이지는 로그인 사용자만 접근 가능
    else if (/^\/column\/[^\/]+$/.test(pathname)) {
      if (!isAuthenticated) return NextResponse.redirect(loginUrl);
    }
  }

  // 커뮤니티 경로 처리
  if (pathname.startsWith("/community/")) {
    if (!isAuthenticated) return NextResponse.redirect(loginUrl);
  }

  // 마이페이지 접근 제한
  if (pathname.startsWith("/mypage")) {
    if (!isAuthenticated) return NextResponse.redirect(loginUrl);
  }

  // 관리자 페이지 접근 제한
  if (pathname.startsWith("/admin")) {
    if (!isAuthenticated) return NextResponse.redirect(loginUrl);
    if (!isAdmin) return NextResponse.redirect(unauthorizedUrl);
  }

  // 정지된 계정 확인 - 모든 보호된 경로에 대해
  if (isAuthenticated && !isActive) {
    return NextResponse.redirect(unauthorizedUrl);
  }

  // 모든 검사를 통과하면 요청 계속 진행
  return NextResponse.next();
} 