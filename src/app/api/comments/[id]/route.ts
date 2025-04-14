export const runtime = 'nodejs';

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { createServiceClient } from "@/lib/supabase/server";

// 댓글 삭제 API
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
    // 세션 확인
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "로그인이 필요한 기능입니다." },
        { status: 401 }
      );
    }
    
    // Supabase 클라이언트 생성 방식 더 간소화
    const supabase = createServiceClient();
    
    // 댓글 정보 조회
    const { data: comment, error: getError } = await supabase
      .from("comments")
      .select("author_id, post_id, post_type")
      .eq("id", id)
      .single();
      
    if (getError) {
      console.error("댓글 조회 오류:", getError);
      return NextResponse.json(
        { error: "댓글을 찾을 수 없습니다." },
        { status: 404 }
      );
    }
    
    // 권한 확인 (작성자 또는 관리자만 삭제 가능)
    if (
      comment.author_id !== session.user.id && 
      session.user.role !== "admin"
    ) {
      return NextResponse.json(
        { error: "이 댓글을 삭제할 권한이 없습니다." },
        { status: 403 }
      );
    }
    
    // 댓글 삭제
    const { error: deleteError } = await supabase
      .from("comments")
      .delete()
      .eq("id", id);
      
    if (deleteError) {
      console.error("댓글 삭제 오류:", deleteError);
      return NextResponse.json(
        { error: "댓글 삭제 중 오류가 발생했습니다." },
        { status: 500 }
      );
    }
    
    // 최신 댓글 수 가져오기
    const tableName = comment.post_type === "column" ? "columns" : "community_posts";
    const { data: post } = await supabase
      .from(tableName)
      .select("comment_count")
      .eq("id", comment.post_id)
      .single();
    
    return NextResponse.json({
      success: true,
      message: "댓글이 성공적으로 삭제되었습니다.",
      commentCount: post?.comment_count || 0
    });
    
  } catch (error) {
    console.error("댓글 삭제 처리 오류:", error);
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
} 