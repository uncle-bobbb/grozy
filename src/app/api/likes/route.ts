export const runtime = 'nodejs';

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { createServiceClient } from "@/lib/supabase/server";

// 좋아요 추가/취소 토글 API
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
    if (!data.postId || !data.postType) {
      return NextResponse.json(
        { error: "필수 정보가 누락되었습니다." },
        { status: 400 }
      );
    }
    
    const { postId, postType } = data;
    if (postType !== "column" && postType !== "community") {
      return NextResponse.json(
        { error: "유효하지 않은 게시글 타입입니다." },
        { status: 400 }
      );
    }
    
    const authorId = session.user.id;
    
    // Supabase 클라이언트 생성 방식 변경
    const supabase = createServiceClient();
    
    // 기존 좋아요 확인
    const { data: existingLike } = await supabase
      .from("likes")
      .select("id")
      .eq("author_id", authorId)
      .eq("post_id", postId)
      .eq("post_type", postType)
      .single();
    
    let action: "added" | "removed";
    
    if (existingLike) {
      // 좋아요 취소
      const { error } = await supabase
        .from("likes")
        .delete()
        .eq("id", existingLike.id);
        
      if (error) {
        console.error("좋아요 취소 오류:", error);
        return NextResponse.json(
          { error: "좋아요 취소 중 오류가 발생했습니다." },
          { status: 500 }
        );
      }
      
      action = "removed";
    } else {
      // 좋아요 추가
      const { error } = await supabase
        .from("likes")
        .insert({
          author_id: authorId,
          post_id: postId,
          post_type: postType
        });
        
      if (error) {
        console.error("좋아요 추가 오류:", error);
        return NextResponse.json(
          { error: "좋아요 추가 중 오류가 발생했습니다." },
          { status: 500 }
        );
      }
      
      action = "added";
    }
    
    // 게시글의 최신 좋아요 수 조회
    const tableName = postType === "column" ? "columns" : "community_posts";
    const { data: post } = await supabase
      .from(tableName)
      .select("like_count")
      .eq("id", postId)
      .single();
    
    return NextResponse.json({
      success: true,
      action,
      likeCount: post?.like_count || 0
    });
  } catch (error) {
    console.error("좋아요 처리 오류:", error);
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

// 특정 게시글의 좋아요 상태 확인 API
export async function GET(request: NextRequest) {
  try {
    // 세션 확인
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "로그인이 필요한 기능입니다." },
        { status: 401 }
      );
    }
    
    // URL 파라미터 파싱
    const url = new URL(request.url);
    const postId = url.searchParams.get("postId");
    const postType = url.searchParams.get("postType");
    
    if (!postId || !postType) {
      return NextResponse.json(
        { error: "필수 정보가 누락되었습니다." },
        { status: 400 }
      );
    }
    
    if (postType !== "column" && postType !== "community") {
      return NextResponse.json(
        { error: "유효하지 않은 게시글 타입입니다." },
        { status: 400 }
      );
    }
    
    const authorId = session.user.id;
    
    // Supabase 클라이언트 생성 방식 변경
    const supabase = createServiceClient();
    
    // 좋아요 상태 확인
    const { data: like } = await supabase
      .from("likes")
      .select("id")
      .eq("author_id", authorId)
      .eq("post_id", postId)
      .eq("post_type", postType)
      .single();
    
    return NextResponse.json({
      liked: !!like
    });
  } catch (error) {
    console.error("좋아요 상태 확인 오류:", error);
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
} 