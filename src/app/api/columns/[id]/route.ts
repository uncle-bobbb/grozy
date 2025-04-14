export const runtime = 'nodejs';

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { createServiceClient } from "@/lib/supabase/server";

// 특정 칼럼 조회 API
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;
    
    // Supabase 클라이언트 생성 방식 변경
    const supabase = createServiceClient();
    
    // 칼럼 정보 조회 (expertise 필드 제거 또는 수정)
    const { data: column, error } = await supabase
      .from("columns")
      .select(`
        *,
        users:author_id (
          id,
          name,
          image,
          role
        )
      `)
      .eq("id", id)
      .single();
      
    if (error) {
      console.error("칼럼 조회 오류:", error);
      return NextResponse.json(
        { error: "칼럼을 불러오는 중 오류가 발생했습니다." },
        { status: 500 }
      );
    }
    
    if (!column) {
      return NextResponse.json(
        { error: "해당 칼럼을 찾을 수 없습니다." },
        { status: 404 }
      );
    }
    
    // 조회수 증가 (본인 글 제외)
    if (userId && userId !== column.author_id) {
      await supabase
        .from("columns")
        .update({ view_count: column.view_count + 1 })
        .eq("id", id);
    }
    
    // 좋아요 상태 확인
    let liked = false;
    if (userId) {
      const { data: likeData } = await supabase
        .from("likes")
        .select("id")
        .eq("author_id", userId)
        .eq("post_id", id)
        .eq("post_type", "column")
        .single();
      
      liked = !!likeData;
    }
    
    // 응답 데이터 구성
    const responseData = {
      ...column,
      liked,
    };
    
    return NextResponse.json(responseData);
  } catch (error) {
    console.error("칼럼 조회 처리 오류:", error);
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

// 칼럼 수정 API
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
    // 세션 가져오기
    const session = await getServerSession(authOptions);
    
    // 로그인 확인
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "로그인이 필요한 기능입니다." }, 
        { status: 401 }
      );
    }
    
    // Supabase 클라이언트 생성 방식 변경
    const supabase = createServiceClient();
    
    // 기존 칼럼 조회
    const { data: existingColumn, error: fetchError } = await supabase
      .from("columns")
      .select("author_id")
      .eq("id", id)
      .single();
      
    if (fetchError) {
      return NextResponse.json(
        { error: "칼럼을 찾을 수 없습니다." },
        { status: 404 }
      );
    }
    
    // 권한 확인 (작성자 또는 관리자만 수정 가능)
    if (
      existingColumn.author_id !== session.user.id && 
      session.user.role !== "admin"
    ) {
      return NextResponse.json(
        { error: "이 칼럼을 수정할 권한이 없습니다." },
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
    
    const updateData = {
      title: data.title,
      content: data.content,
      image_url: data.image_url,
    };
    
    // 칼럼 업데이트
    const { data: updatedColumn, error: updateError } = await supabase
      .from("columns")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();
      
    if (updateError) {
      console.error("칼럼 수정 오류:", updateError);
      return NextResponse.json(
        { error: "칼럼 수정 중 오류가 발생했습니다." },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      message: "칼럼이 성공적으로 수정되었습니다.",
      column: updatedColumn
    });
  } catch (error) {
    console.error("칼럼 수정 처리 오류:", error);
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

// 칼럼 삭제 API
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
    // 세션 가져오기
    const session = await getServerSession(authOptions);
    
    // 로그인 확인
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "로그인이 필요한 기능입니다." }, 
        { status: 401 }
      );
    }
    
    // Supabase 클라이언트 생성 방식 변경
    const supabase = createServiceClient();
    
    // 기존 칼럼 조회
    const { data: existingColumn, error: fetchError } = await supabase
      .from("columns")
      .select("author_id")
      .eq("id", id)
      .single();
      
    if (fetchError) {
      return NextResponse.json(
        { error: "칼럼을 찾을 수 없습니다." },
        { status: 404 }
      );
    }
    
    // 권한 확인 (작성자 또는 관리자만 삭제 가능)
    if (
      existingColumn.author_id !== session.user.id && 
      session.user.role !== "admin"
    ) {
      return NextResponse.json(
        { error: "이 칼럼을 삭제할 권한이 없습니다." },
        { status: 403 }
      );
    }
    
    // 칼럼 삭제
    const { error: deleteError } = await supabase
      .from("columns")
      .delete()
      .eq("id", id);
      
    if (deleteError) {
      console.error("칼럼 삭제 오류:", deleteError);
      return NextResponse.json(
        { error: "칼럼 삭제 중 오류가 발생했습니다." },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      message: "칼럼이 성공적으로 삭제되었습니다.",
    });
  } catch (error) {
    console.error("칼럼 삭제 처리 오류:", error);
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
} 