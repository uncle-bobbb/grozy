import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { signIn } from "@/lib/auth";

// 로그인 요청 스키마 유효성 검사
const loginSchema = z.object({
  email: z.string().email("유효한 이메일 주소를 입력해주세요."),
  password: z.string().min(6, "비밀번호는 6자 이상이어야 합니다."),
  callbackUrl: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // 입력 데이터 유효성 검사
    const validation = loginSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ 
        success: false, 
        message: "입력 값이 유효하지 않습니다.",
        errors: validation.error.flatten().fieldErrors 
      }, { status: 400 });
    }

    const { email, password, callbackUrl } = validation.data;
    
    // Next-Auth signIn 함수 호출
    const result = await signIn("credentials", {
      redirect: false,
      email,
      password,
    });

    if (!result?.ok) {
      return NextResponse.json({ 
        success: false, 
        message: "이메일 또는 비밀번호가 올바르지 않습니다." 
      }, { status: 401 });
    }

    // 로그인 성공
    return NextResponse.json({ 
      success: true, 
      message: "로그인에 성공했습니다.",
      callbackUrl: callbackUrl || "/" 
    });
    
  } catch (error) {
    console.error("로그인 처리 오류:", error);
    return NextResponse.json({ 
      success: false, 
      message: "로그인 처리 중 오류가 발생했습니다." 
    }, { status: 500 });
  }
} 