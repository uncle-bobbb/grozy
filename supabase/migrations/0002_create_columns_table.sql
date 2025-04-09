-- 전문가 칼럼 테이블 마이그레이션
CREATE TABLE IF NOT EXISTS columns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  image_url VARCHAR(1000), -- 썸네일 이미지
  author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  view_count INTEGER NOT NULL DEFAULT 0,
  like_count INTEGER NOT NULL DEFAULT 0,
  comment_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_columns_author ON columns(author_id);
CREATE INDEX IF NOT EXISTS idx_columns_created_at ON columns(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_columns_like_count ON columns(like_count DESC);

-- 업데이트 트리거 설정
DROP TRIGGER IF EXISTS update_columns_updated_at ON columns;
CREATE TRIGGER update_columns_updated_at
BEFORE UPDATE ON columns
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- RLS(Row Level Security) 설정
ALTER TABLE columns ENABLE ROW LEVEL SECURITY;

-- RLS 정책: 모든 사용자가 칼럼을 조회할 수 있음
CREATE POLICY select_columns_policy ON columns
  FOR SELECT
  TO authenticated
  USING (true);

-- RLS 정책: 전문가와 관리자만 칼럼 작성 가능
CREATE POLICY insert_columns_policy ON columns
  FOR INSERT
  TO authenticated
  WITH CHECK (
    current_user_id() IN (
      SELECT id FROM users 
      WHERE role IN ('expert', 'admin') AND status = 'active'
    )
  );

-- RLS 정책: 자신이 작성한 칼럼만 수정 가능
CREATE POLICY update_columns_policy ON columns
  FOR UPDATE
  TO authenticated
  USING (author_id = current_user_id())
  WITH CHECK (author_id = current_user_id());

-- RLS 정책: 관리자는 모든 칼럼 수정/삭제 가능
CREATE POLICY admin_columns_policy ON columns
  FOR ALL
  TO authenticated
  USING (current_user_id() IN (SELECT id FROM users WHERE role = 'admin'))
  WITH CHECK (current_user_id() IN (SELECT id FROM users WHERE role = 'admin')); 