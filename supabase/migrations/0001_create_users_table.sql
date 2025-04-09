-- 사용자 테이블 마이그레이션
-- uuid-ossp 확장 활성화 (UUID 생성 함수를 위해)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 사용자 역할 ENUM 타입 생성
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
    CREATE TYPE user_role AS ENUM ('user', 'expert', 'admin');
  END IF;
END $$;

-- 사용자 상태 ENUM 타입 생성
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_status') THEN
    CREATE TYPE user_status AS ENUM ('active', 'banned');
  END IF;
END $$;

-- 인증 제공자 ENUM 타입 생성
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'auth_provider') THEN
    CREATE TYPE auth_provider AS ENUM ('email', 'google', 'kakao');
  END IF;
END $$;

-- 현재 인증된 사용자의 ID를 반환하는 함수 생성
CREATE OR REPLACE FUNCTION current_user_id() 
RETURNS UUID
LANGUAGE SQL
STABLE
AS $$
  SELECT auth.uid();
$$;

-- 사용자 테이블 생성
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255), -- 이메일 로그인 사용자만 비밀번호 저장
  nickname VARCHAR(255) NOT NULL UNIQUE,
  name VARCHAR(255),
  image VARCHAR(1000), -- 프로필 이미지 URL
  provider auth_provider NOT NULL, -- 'email', 'google', 'kakao'
  role user_role NOT NULL DEFAULT 'user', -- 'user', 'expert', 'admin'
  status user_status NOT NULL DEFAULT 'active', -- 'active', 'banned'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_provider ON users(provider);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);

-- 업데이트 트리거 함수
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 업데이트 트리거 설정
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- RLS(Row Level Security) 설정
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- RLS 정책: 관리자는 모든 사용자 정보 조회 가능
CREATE POLICY admin_users_policy ON users
  FOR ALL
  TO authenticated
  USING (current_user_id() IN (SELECT id FROM users WHERE role = 'admin'))
  WITH CHECK (current_user_id() IN (SELECT id FROM users WHERE role = 'admin'));

-- RLS 정책: 자신의 정보만 조회/수정 가능
CREATE POLICY self_users_policy ON users
  FOR ALL
  TO authenticated
  USING (id = current_user_id())
  WITH CHECK (id = current_user_id()); 