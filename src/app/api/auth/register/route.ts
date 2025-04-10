import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createServerClient } from "@/lib/supabase/server";
import bcrypt from "bcryptjs";

// 회원가입 요청 스키마 유효성 검사
const registerSchema = z.object({
  email: z.string().email("유효한 이메일 주소를 입력해주세요."),
  password: z.string().min(6, "비밀번호는 6자 이상이어야 합니다."),
  nickname: z.string().min(2, "닉네임은 2자 이상이어야 합니다.").max(20, "닉네임은 20자 이하여야 합니다."),
});

export async function POST(req: NextRequest) {
  try {
    // 요청 본문을 정상적으로 파싱하기 위한 처리
    const body = await req.json().catch(() => ({}));
    
    console.log("받은 요청 본문:", { ...body, password: "[REDACTED]" }); // 로그에서 비밀번호 가리기
    
    // 입력 데이터 유효성 검사
    const validation = registerSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ 
        success: false, 
        message: "입력 값이 유효하지 않습니다.",
        errors: validation.error.flatten().fieldErrors 
      }, { status: 400 });
    }

    const { email, password, nickname } = validation.data;
    
    // Supabase 클라이언트 생성
    const supabase = createServerClient();
    
    // 이메일 중복 확인
    const { data: existingUser, error: emailCheckError } = await supabase
      .from("users")
      .select("email")
      .eq("email", email)
      .maybeSingle();
      
    if (emailCheckError) {
      console.error("이메일 중복 확인 오류:", emailCheckError);
      return NextResponse.json({ 
        success: false, 
        message: "회원가입 처리 중 오류가 발생했습니다." 
      }, { status: 500 });
    }
    
    if (existingUser) {
      return NextResponse.json({ 
        success: false, 
        message: "이미 사용 중인 이메일입니다." 
      }, { status: 409 });
    }
    
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
        message: "회원가입 처리 중 오류가 발생했습니다." 
      }, { status: 500 });
    }
    
    if (existingNickname) {
      return NextResponse.json({ 
        success: false, 
        message: "이미 사용 중인 닉네임입니다." 
      }, { status: 409 });
    }

    // 비밀번호 해싱 (salt 라운드 10으로 설정)
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // 새 사용자 저장
    const { data, error } = await supabase
      .from("users")
      .insert({
        email,
        password: hashedPassword, // 해싱된 비밀번호 저장
        nickname,
        name: nickname, // 이름이 필요한 경우 닉네임을 기본값으로 사용
        provider: "email",
        role: "user", // 기본 역할
        status: "active", // 기본 상태
      })
      .select()
      .single();
      
    if (error) {
      console.error("사용자 저장 오류:", error);
      return NextResponse.json({ 
        success: false, 
        message: "회원가입 처리 중 오류가 발생했습니다." 
      }, { status: 500 });
    }

    // 성공적인 사용자 생성 로그
    console.log("사용자가 성공적으로 생성되었습니다. ID:", data.id);

    // 민감한 정보 제거
    const { password: _, ...safeUserData } = data;
    
    return NextResponse.json({ 
      success: true, 
      message: "회원가입에 성공했습니다.",
      user: safeUserData
    });
    
  } catch (error) {
    console.error("회원가입 처리 오류:", error);
    return NextResponse.json({ 
      success: false, 
      message: "회원가입 처리 중 오류가 발생했습니다." 
    }, { status: 500 });
  }
} 