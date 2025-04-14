export const runtime = 'nodejs';

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { Database } from "@/types/index";
import { createServiceClient } from "@/lib/supabase/server";

// 칼럼 목록 조회 API
export async function GET(request: NextRequest) {
  try {
    // 페이지네이션 및 정렬 파라미터 처리
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const sort = searchParams.get("sort") || "created_at";
    const order = searchParams.get("order") || "desc";
    
    // 오프셋 계산
    const offset = (page - 1) * limit;
    
    // 캐싱된 Supabase 클라이언트 사용
    const supabase = createServiceClient();
    
    try {
      // 칼럼 목록 조회 (expertise 필드 제거 또는 수정)
      const { data: columns, error, count } = await supabase
        .from("columns")
        .select(`
          *,
          users:author_id (
            id,
            name,
            image,
            role
          )
        `, { count: 'exact' })
        .order(sort as any, { ascending: order === "asc" })
        .range(offset, offset + limit - 1);
      
      if (error) {
        console.error("칼럼 목록 조회 오류:", error);
        return NextResponse.json(
          { error: "칼럼 목록을 불러오는 중 오류가 발생했습니다." },
          { status: 500 }
        );
      }
      
      // 페이지네이션 정보 계산
      const totalPages = Math.ceil((count || 0) / limit);
      
      // 데이터가 null이나 undefined인 경우에도 빈 배열로 처리
      const safeColumns = columns || [];
      
      return NextResponse.json({
        columns: safeColumns,
        pagination: {
          page,
          limit,
          totalItems: count || 0,
          totalPages,
        }
      });
    } catch (supabaseError) {
      console.error("Supabase 쿼리 오류:", supabaseError);
      return NextResponse.json(
        { error: "데이터베이스 쿼리 중 오류가 발생했습니다." },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("칼럼 목록 조회 처리 오류:", error);
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

// 새 칼럼 작성 API
export async function POST(request: NextRequest) {
  try {
    // 세션 가져오기
    const session = await getServerSession(authOptions);
    
    // 로그인 확인
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "로그인이 필요한 기능입니다." }, 
        { status: 401 }
      );
    }
    
    // 권한 확인 (전문가/관리자만 작성 가능)
    if (session.user.role !== "expert" && session.user.role !== "admin") {
      return NextResponse.json(
        { error: "칼럼 작성은 전문가 또는 관리자만 가능합니다." },
        { status: 403 }
      );
    }
    
    // 요청 데이터 파싱
    const data = await request.json();
    
    // 필수 필드 검증
    if (!data.title || !data.content) {
      return NextResponse.json(
        { error: "제목과 내용은 필수 입력 항목입니다." },
        { status: 400 }
      );
    }
    
    const newColumn: Database["public"]["Tables"]["columns"]["Insert"] = {
      title: data.title,
      content: data.content,
      image_url: data.image_url || null,
      author_id: session.user.id,
      view_count: 0,
      like_count: 0,
      comment_count: 0,
    };
    
    // 캐싱된 Supabase 클라이언트 사용
    const supabase = createServiceClient();
    
    // 칼럼 저장
    const { data: column, error } = await supabase
      .from("columns")
      .insert(newColumn)
      .select("*")
      .single();
      
    if (error) {
      console.error("칼럼 작성 오류:", error);
      return NextResponse.json(
        { error: "칼럼 작성 중 오류가 발생했습니다." },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { message: "칼럼이 성공적으로 등록되었습니다.", column },
      { status: 201 }
    );
  } catch (error) {
    console.error("칼럼 작성 처리 오류:", error);
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
} 