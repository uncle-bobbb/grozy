-- 공지사항 테이블 마이그레이션
CREATE TABLE IF NOT EXISTS notices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  view_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_pinned BOOLEAN DEFAULT FALSE -- 상단 고정 여부
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_notices_author ON notices(author_id);
CREATE INDEX IF NOT EXISTS idx_notices_created_at ON notices(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notices_is_pinned ON notices(is_pinned);

-- 업데이트 트리거 설정
DROP TRIGGER IF EXISTS update_notices_updated_at ON notices;
CREATE TRIGGER update_notices_updated_at
BEFORE UPDATE ON notices
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- RLS(Row Level Security) 설정
ALTER TABLE notices ENABLE ROW LEVEL SECURITY;

-- RLS 정책: 모든 사용자가 공지사항을 조회할 수 있음
CREATE POLICY select_notices_policy ON notices
  FOR SELECT
  USING (true);

-- RLS 정책: 관리자만 공지사항 작성/수정/삭제 가능
CREATE POLICY admin_notices_policy ON notices
  FOR ALL
  TO authenticated
  USING (current_user_id() IN (SELECT id FROM users WHERE role = 'admin'))
  WITH CHECK (current_user_id() IN (SELECT id FROM users WHERE role = 'admin')); 