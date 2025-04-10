import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
  try {
    // URL에서 닉네임 쿼리 파라미터 추출
    const nickname = req.nextUrl.searchParams.get('nickname');
    
    if (!nickname) {
      return NextResponse.json({ 
        success: false, 
        message: '닉네임이 제공되지 않았습니다.' 
      }, { status: 400 });
    }
    
    // Supabase 클라이언트 생성
    const supabase = createServerClient();
    
    // 닉네임 중복 확인
    const { data: existingNickname, error: nicknameCheckError } = await supabase
      .from("users")
      .select("nickname")
      .eq("nickname", nickname)
      .maybeSingle();
      
    if (nicknameCheckError) {
      console.error("닉네임 중복 확인 오류:", nicknameCheckError);
      return NextResponse.json({ 
        success: false, 
        message: '닉네임 중복 확인 중 오류가 발생했습니다.' 
      }, { status: 500 });
    }
    
    // 응답 반환
    return NextResponse.json({ 
      success: true, 
      exists: !!existingNickname 
    });
    
  } catch (error) {
    console.error("닉네임 확인 중 예외 발생:", error);
    return NextResponse.json({ 
      success: false, 
      message: '서버 오류가 발생했습니다.' 
    }, { status: 500 });
  }
} 