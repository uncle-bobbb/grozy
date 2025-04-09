import { NextRequest, NextResponse } from "next/server";
import { signOut } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    await signOut({ redirect: false });
    
    return NextResponse.json({ 
      success: true, 
      message: "로그아웃 되었습니다." 
    });
  } catch (error) {
    console.error("로그아웃 처리 오류:", error);
    return NextResponse.json({ 
      success: false, 
      message: "로그아웃 처리 중 오류가 발생했습니다." 
    }, { status: 500 });
  }
} 