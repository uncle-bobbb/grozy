export const runtime = 'nodejs';

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { createServiceClient } from "@/lib/supabase/server";

// 댓글 목록 조회 API
export async function GET(request: NextRequest) {
  try {
    // URL 파라미터 파싱
    const url = new URL(request.url);
    const postId = url.searchParams.get("postId");
    const postType = url.searchParams.get("postType");
    
    if (!postId || !postType) {
      return NextResponse.json(
        { error: "게시글 ID와 타입은 필수 입력 항목입니다." },
        { status: 400 }
      );
    }
    
    if (postType !== "column" && postType !== "community") {
      return NextResponse.json(
        { error: "유효하지 않은 게시글 타입입니다." },
        { status: 400 }
      );
    }
    
    // Supabase 클라이언트 생성 방식 변경
    const supabase = createServiceClient();
    
    const { data: comments, error } = await supabase
      .from("comments")
      .select(`
        *,
        users:author_id (
          id,
          name,
          image,
          role
        )
      `)
      .eq("post_id", postId)
      .eq("post_type", postType)
      .order("created_at", { ascending: true });
      
    if (error) {
      console.error("댓글 목록 조회 오류:", error);
      return NextResponse.json(
        { error: "댓글을 불러오는 중 오류가 발생했습니다." },
        { status: 500 }
      );
    }
    
    return NextResponse.json(comments || []);
  } catch (error) {
    console.error("댓글 목록 조회 처리 오류:", error);
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

// 댓글 작성 API
export async function POST(request: NextRequest) {
  try {
    // 세션 확인
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "로그인이 필요한 기능입니다." },
        { status: 401 }
      );
    }
    
    // 요청 데이터 파싱
    const data = await request.json();
    
    // 필수 필드 검증
    if (!data.content || !data.postId || !data.postType) {
      return NextResponse.json(
        { error: "필수 정보가 누락되었습니다." },
        { status: 400 }
      );
    }
    
    if (data.postType !== "column" && data.postType !== "community") {
      return NextResponse.json(
        { error: "유효하지 않은 게시글 타입입니다." },
        { status: 400 }
      );
    }
    
    const authorId = session.user.id;
    
    // Supabase 클라이언트 생성 방식 변경
    const supabase = createServiceClient();
    
    // 댓글 추가
    const { data: newComment, error: commentError } = await supabase
      .from("comments")
      .insert({
        content: data.content,
        author_id: authorId,
        post_id: data.postId,
        post_type: data.postType
      })
      .select(`
        *,
        users:author_id (
          id,
          name,
          image,
          role
        )
      `)
      .single();
      
    if (commentError) {
      console.error("댓글 추가 오류:", commentError);
      return NextResponse.json(
        { error: "댓글 작성 중 오류가 발생했습니다." },
        { status: 500 }
      );
    }
    
    // 최신 댓글 수 가져오기
    const tableName = data.postType === "column" ? "columns" : "community_posts";
    const { data: post } = await supabase
      .from(tableName)
      .select("comment_count")
      .eq("id", data.postId)
      .single();
    
    return NextResponse.json({
      success: true,
      comment: newComment,
      commentCount: post?.comment_count || 0
    });
    
  } catch (error) {
    console.error("댓글 작성 처리 오류:", error);
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
} 