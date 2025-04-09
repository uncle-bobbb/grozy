import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

// 미들웨어에서 처리할 경로 패턴
export const config = {
  matcher: [
    "/column/:id*",     // 칼럼 상세 페이지
    "/column/write",    // 칼럼 작성 페이지
    "/community/:id*",  // 커뮤니티 상세 페이지
    "/community/write", // 커뮤니티 작성 페이지
    "/mypage/:path*",   // 마이페이지
    "/admin/:path*",    // 관리자 페이지 (전체)
  ],
};

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  
  // 현재 세션 가져오기
  const session = await auth();
  
  // 로그인 여부 확인
  const isAuthenticated = !!session?.user;
  
  // 권한 확인
  const userRole = session?.user?.role || null;
  const isExpert = userRole === "expert" || userRole === "admin";
  const isAdmin = userRole === "admin";

  // 계정 상태 확인
  const userStatus = session?.user?.status || null;
  const isActive = userStatus === "active";

  // 로그인 페이지 URL (리디렉션용)
  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set("callbackUrl", pathname);
  
  // 권한 없음 페이지 URL
  const unauthorizedUrl = new URL("/unauthorized", request.url);

  // 1. 정지된 계정 확인 - 모든 보호된 경로에 대해
  if (isAuthenticated && !isActive) {
    return NextResponse.redirect(unauthorizedUrl);
  }

  // 2. 기본 인증 확인 - 모든 보호된 경로에 대해
  if (!isAuthenticated) {
    return NextResponse.redirect(loginUrl);
  }

  // 3. 전문가 권한 확인 - 칼럼 작성 페이지
  if (pathname === "/column/write" && !isExpert) {
    return NextResponse.redirect(unauthorizedUrl);
  }

  // 4. 관리자 권한 확인 - 관리자 페이지
  if (pathname.startsWith("/admin") && !isAdmin) {
    return NextResponse.redirect(unauthorizedUrl);
  }

  // 모든 검사를 통과하면 요청 계속 진행
  return NextResponse.next();
} 