import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { createServiceClient } from "@/lib/supabase/server";
import EditColumnClient from "./client";

export default async function EditColumnPage({ params }: { params: { id: string } }) {
  // 세션 확인
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    redirect('/login?callbackUrl=/column/edit/' + params.id);
  }

  // Supabase 클라이언트 생성
  const supabase = createServiceClient();
  
  // 칼럼 데이터 가져오기
  const { data: column, error } = await supabase
    .from("columns")
    .select("*")
    .eq("id", params.id)
    .single();
  
  // 칼럼이 없거나 에러가 발생한 경우
  if (error || !column) {
    redirect('/column');
  }
  
  // 권한 확인 (작성자나 관리자만 수정 가능)
  if (column.author_id !== session.user.id && session.user.role !== "admin") {
    redirect('/column/' + params.id);
  }
  
  // 클라이언트 컴포넌트로 데이터 전달
  return <EditColumnClient initialColumn={column} />;
} 