import { createClient } from "@supabase/supabase-js";

// 클라이언트 컴포넌트에서 사용할 Supabase 클라이언트
export function createBrowserClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Supabase URL과 익명 키가 설정되지 않았습니다.");
  }

  return createClient(supabaseUrl, supabaseKey);
}
