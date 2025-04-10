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
    async signIn({ user, account, credentials }) {
      try {
        const supabase = createServerClient();
        let existingUser = null;
        
        // 이메일/비밀번호 로그인인 경우
        if (account?.provider === "credentials") {
          // 이미 authorize 함수에서 확인했으므로 추가 확인 불필요
          return true;
        }
        // 소셜 로그인의 경우
        else if (account?.provider === "google" || account?.provider === "kakao") {
          console.log(`소셜 로그인 처리: ${account.provider}, 이메일: ${user.email}`);
          
          // 카카오 로그인 시 이메일이 없는 경우 처리
          let userEmail = user.email;
          let providerQuery = supabase
            .from("users")
            .select("*")
            .eq("provider", account.provider);
            
          // 이메일 기반 조회
          if (userEmail) {
            providerQuery = providerQuery.eq("email", userEmail);
          } 
          // 이메일이 없는 경우 provider_id로 조회 시도
          else if (account.providerAccountId) {
            providerQuery = providerQuery.eq("provider_id", account.providerAccountId);
          }
          
          const { data: dbUser, error: checkError } = await providerQuery.maybeSingle();
            
          if (checkError && checkError.code !== 'PGRST116') { // PGRST116는 레코드 없음 에러
            console.error(`사용자 확인 중 오류 발생: ${checkError.message}`);
            return false;
          }
          
          existingUser = dbUser;
          
          // 정지된 계정 확인
          if (existingUser?.status === "banned") {
            console.log(`정지된 계정: ${userEmail || account.providerAccountId}`);
            return false;
          }
          
          // 사용자가 존재하지 않으면 새로 생성
          if (!existingUser) {
            // 닉네임 생성 - user.name이 없으면 랜덤 닉네임 생성
            let generatedNickname = user.name || `user-${Math.floor(Math.random() * 10000)}`;
            
            // 닉네임 중복 확인 및 처리
            let isUnique = false;
            let attemptCount = 0;
            const maxAttempts = 5;

            while (!isUnique && attemptCount < maxAttempts) {
              // 닉네임 중복 확인
              const { data: existingNickname, error: nicknameCheckError } = await supabase
                .from("users")
                .select("nickname")
                .eq("nickname", generatedNickname)
                .maybeSingle();
              
              if (nicknameCheckError) {
                console.error(`닉네임 확인 오류: ${nicknameCheckError.message}`);
                return false;
              }
              
              // 닉네임이 중복되지 않으면 루프 종료
              if (!existingNickname) {
                isUnique = true;
              } else {
                // 중복된 경우 랜덤 문자열 추가
                const randomSuffix = Math.floor(Math.random() * 100000);
                generatedNickname = `${user.name || 'user'}-${randomSuffix}`;
                attemptCount++;
              }
            }
            
            if (!isUnique) {
              console.error('고유한 닉네임을 생성할 수 없습니다.');
              return false;
            }
            
            console.log(`새 소셜 사용자 등록: ${userEmail || `카카오ID:${account.providerAccountId}`}`);
            
            const { data: newUser, error: insertError } = await supabase
              .from("users")
              .insert({
                email: userEmail, // 이메일이 없어도 진행 (null 허용됨)
                nickname: generatedNickname,
                name: user.name || generatedNickname,
                provider: account.provider,
                provider_id: account.providerAccountId, // 카카오 ID 저장
                role: "user",
                status: "active",
              })
              .select();
              
            if (insertError) {
              console.error(`소셜 사용자 등록 실패: ${insertError.message}`);
              return false;
            }
            console.log(`소셜 사용자 등록 성공: ${newUser[0]?.id}`);
            
            // 사용자 정보를 NextAuth에 반영
            user.id = newUser[0]?.id;
            if (!user.name) user.name = generatedNickname;
          } else {
            console.log(`기존 소셜 사용자 로그인: ${existingUser.id}`);
            // 기존 사용자 정보를 NextAuth에 반영
            user.id = existingUser.id;
            user.email = existingUser.email || user.email;
            user.name = existingUser.name || user.name;
          }
        }
        
        return true;
      } catch (error) {
        console.error("로그인 처리 오류:", error);
        return false;
      }
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
