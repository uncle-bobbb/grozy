import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

export const authOptions: NextAuthOptions = {
  providers: [
    // 제공자를 여기에 추가할 수 있습니다.
  ],
  pages: {
    signIn: "/auth/signin",
    // signOut: '/auth/signout',
    // error: '/auth/error',
    // verifyRequest: '/auth/verify-request',
    // newUser: '/auth/new-user'
  },
  callbacks: {
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
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
};

// types/next-auth.d.ts에 타입을 정의했으므로 여기서는 제거
