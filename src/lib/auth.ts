import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import KakaoProvider from "next-auth/providers/kakao";
import { createServerClient } from "./supabase/server";
import NextAuth from "next-auth";
import bcrypt from "bcryptjs";

// 비밀번호 검증 함수 (bcrypt 사용)
async function validatePassword(plainPassword: string, hashedPassword: string) {
  // bcrypt.compare 메서드로 비밀번호 검증
  return await bcrypt.compare(plainPassword, hashedPassword);
}

export const authOptions: NextAuthOptions = {
  providers: [
    // 이메일/비밀번호 로그인
    CredentialsProvider({
      name: "이메일",
      credentials: {
        email: { label: "이메일", type: "email" },
        password: { label: "비밀번호", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          // Supabase 서버 클라이언트 생성
          const supabase = createServerClient();
          
          // 이메일/비밀번호로 사용자 조회
          const { data, error } = await supabase
            .from("users")
            .select("*")
            .eq("email", credentials.email)
            .eq("provider", "email")
            .single();

          if (error || !data) {
            return null;
          }

          // 비밀번호 검증 - 실제 구현에서는 bcrypt 등을 사용해 해시된 비밀번호 비교
          const isValidPassword = await validatePassword(
            credentials.password,
            data.password
          );

          if (!isValidPassword) {
            return null;
          }

          // 정지된 계정인지 확인
          if (data.status === "banned") {
            throw new Error("정지된 계정입니다.");
          }

          return {
            id: data.id,
            email: data.email,
            nickname: data.nickname,
            role: data.role,
            provider: data.provider,
            createdAt: data.created_at,
            updatedAt: data.updated_at,
            status: data.status,
          };
        } catch (error) {
          console.error("인증 오류:", error);
          return null;
        }
      },
    }),
    
    // 구글 OAuth 로그인
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    
    // 카카오 OAuth 로그인
    KakaoProvider({
      clientId: process.env.KAKAO_CLIENT_ID!,
      clientSecret: process.env.KAKAO_CLIENT_SECRET!,
    })
  ],
  pages: {
    signIn: "/login",
    // signOut: '/auth/signout',
    error: "/login", // 에러 발생 시 리다이렉트할 페이지
    // verifyRequest: '/auth/verify-request',
    // newUser: '/auth/new-user'
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        // DB에서 가져온 user 객체의 데이터를 token에 복사
        token.id = user.id;
        token.role = user.role;
        token.nickname = user.nickname;
        token.provider = user.provider;
        token.createdAt = user.createdAt;
        token.updatedAt = user.updatedAt;
        token.status = user.status;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        // 기본 ID 필드 설정
        session.user.id = token.id as string || token.sub as string;
        
        // 추가 사용자 정보 세션에 복사
        session.user.role = token.role as "user" | "expert" | "admin" | null;
        session.user.nickname = token.nickname as string | null;
        session.user.provider = token.provider as "google" | "kakao" | "email" | null;
        session.user.createdAt = token.createdAt as string | null;
        session.user.updatedAt = token.updatedAt as string | null;
        session.user.status = token.status as "active" | "banned" | null;
      }
      return session;
    },
    async signIn({ user, account }) {
      // 소셜 로그인의 경우, DB에 사용자 정보 저장 또는 업데이트
      if (account?.provider === "google" || account?.provider === "kakao") {
        try {
          const supabase = createServerClient();

          // 사용자가 이미 존재하는지 확인
          const { data: existingUser } = await supabase
            .from("users")
            .select("*")
            .eq("email", user.email)
            .eq("provider", account.provider)
            .single();

          if (!existingUser) {
            // 새 사용자 등록
            await supabase.from("users").insert({
              email: user.email,
              nickname: user.name || `user-${Math.floor(Math.random() * 10000)}`,
              provider: account.provider,
              role: "user", // 기본 역할
              status: "active", // 기본 상태
            });
          } else if (existingUser.status === "banned") {
            // 정지된 계정 확인
            return false;
          }
        } catch (error) {
          console.error("소셜 로그인 DB 저장 오류:", error);
          return false;
        }
      }
      return true;
    },
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30일 (초 단위)
  },
  secret: process.env.NEXTAUTH_SECRET,
};

// Next.js 14의 App Router와 호환되는 NextAuth 핸들러
const handler = NextAuth(authOptions);

// 직접 함수를 내보냄
export const { auth, signIn, signOut } = handler;
export { handler as GET, handler as POST };
