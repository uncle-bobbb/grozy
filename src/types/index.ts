// Next-Auth 타입 확장
import "next-auth";
import { DefaultSession } from "next-auth";

// 사용자 역할 타입
export type UserRole = "user" | "expert" | "admin";

// 사용자 상태 타입
export type UserStatus = "active" | "banned";

// 로그인 제공자 타입
export type AuthProvider = "email" | "google" | "kakao";

// Next-Auth 타입 확장
declare module "next-auth" {
  /**
   * Session 객체의 사용자 타입을 확장
   */
  interface Session {
    user: DefaultSession["user"] & {
      id: string;
      nickname?: string | null;
      role?: UserRole | null;
      provider?: AuthProvider | null;
      createdAt?: string | null;
      updatedAt?: string | null;
      status?: UserStatus | null;
    };
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
    role?: UserRole | null;
    provider?: AuthProvider | null;
    createdAt?: string | null;
    updatedAt?: string | null;
    status?: UserStatus | null;
  }
}

// JWT 타입 확장
declare module "next-auth/jwt" {
  /**
   * JWT에 추가 정보 포함
   */
  interface JWT {
    id: string;
    email?: string | null;
    name?: string | null;
    nickname?: string | null;
    image?: string | null;
    role?: UserRole | null;
    provider?: AuthProvider | null;
    createdAt?: string | null;
    updatedAt?: string | null;
    status?: UserStatus | null;
  }
}

// DB 모델 관련 타입

// 사용자 모델 타입
export interface UserModel {
  id: string;
  email: string;
  password?: string; // API 응답에서는 제외됨
  nickname: string;
  provider: AuthProvider;
  role: UserRole;
  status: UserStatus;
  created_at: string;
  updated_at: string;
}

// 칼럼 모델 타입
export interface ColumnModel {
  id: string;
  title: string;
  content: string;
  image_url: string | null;
  author_id: string;
  view_count: number;
  like_count: number;
  comment_count: number;
  created_at: string;
  updated_at: string;
  users?: {
    id: string;
    name: string;
    image: string;
    role: string;
  };
}

// 커뮤니티 게시글 타입
export interface CommunityPostModel {
  id: string;
  title: string;
  content: string;
  image_url?: string | null;
  author_id: string;
  view_count: number;
  like_count: number;
  comment_count: number;
  created_at: string;
  updated_at: string;
}

// 댓글 타입
export interface CommentModel {
  id: string;
  content: string;
  author_id: string;
  post_id: string;
  post_type: "column" | "community";
  created_at: string;
  updated_at: string;
  author?: {
    id: string;
    name: string;
    image: string;
    role: string;
  };
}

// 좋아요 타입
export interface LikeModel {
  id: string;
  author_id: string;
  post_id: string; // 칼럼/커뮤니티 게시글 ID
  post_type: "column" | "community"; // 게시글 타입 구분
  created_at: string;
}

// 관리자 공지 게시글 타입
export interface NoticeModel {
  id: string;
  title: string;
  content: string;
  author_id: string;
  view_count: number;
  created_at: string;
  updated_at: string;
}

// Supabase 데이터베이스 타입 정의
export interface Database {
  public: {
    Tables: {
      columns: {
        Row: {
          id: string;
          title: string;
          content: string;
          image_url: string | null;
          author_id: string;
          view_count: number;
          like_count: number;
          comment_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          content: string;
          image_url?: string | null;
          author_id: string;
          view_count?: number;
          like_count?: number;
          comment_count?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          content?: string;
          image_url?: string | null;
          author_id?: string;
          view_count?: number;
          like_count?: number;
          comment_count?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      // 다른 테이블들...
    };
  };
}