import NextAuth from "next-auth";

declare module "next-auth" {
  /**
   * Session 객체의 사용자 타입을 확장
   */
  interface Session {
    user: {
      id: string;
      email?: string | null;
      name?: string | null;
      nickname?: string | null;
      image?: string | null;
      role?: "user" | "expert" | "admin" | null;
      provider?: "google" | "kakao" | "email" | null;
      createdAt?: string | null;
      updatedAt?: string | null;
      status?: "active" | "banned" | null;
    };
  }

  /**
   * JWT에 추가 정보 포함
   */
  interface JWT {
    id: string;
    email?: string | null;
    name?: string | null;
    nickname?: string | null;
    image?: string | null;
    role?: "user" | "expert" | "admin" | null;
    provider?: "google" | "kakao" | "email" | null;
    createdAt?: string | null;
    updatedAt?: string | null;
    status?: "active" | "banned" | null;
  }

  /**
   * User 객체 확장
   */
  interface User {
    id: string;
    email?: string | null;
    name?: string | null;
    nickname?: string | null;
    image?: string | null;
    role?: "user" | "expert" | "admin" | null;
    provider?: "google" | "kakao" | "email" | null;
    createdAt?: string | null;
    updatedAt?: string | null;
    status?: "active" | "banned" | null;
  }
} 