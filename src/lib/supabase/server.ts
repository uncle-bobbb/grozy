import "server-only";

import { createClient } from "@supabase/supabase-js";
import { cache } from "react";
import { Database } from "@/types/index";

// 서버 컴포넌트에서 사용할 Supabase 클라이언트
export function createServerClient(
  customUrl?: string,
  customKey?: string,
  options?: any
) {
  const supabaseUrl = customUrl || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = customKey || process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Supabase URL과 서비스 롤 키가 설정되지 않았습니다.");
  }

  return createClient(
    supabaseUrl,
    supabaseKey,
    options || {
      auth: {
        persistSession: false,
      },
    }
  );
}

export async function createPureClient() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        persistSession: false,
      },
      cookies: {
        getAll() {
          return [];
        },
        setAll() {},
      },
    }
  );
}

// API 라우트에서 사용할 Supabase 클라이언트
export const createServiceClient = cache(() => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

  return createClient<Database>(supabaseUrl, supabaseServiceKey, {
    auth: { persistSession: false }
  });
});
