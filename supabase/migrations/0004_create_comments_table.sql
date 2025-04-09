-- 댓글 테이블 마이그레이션
-- 게시글 유형 ENUM 타입 생성
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'post_type') THEN
    CREATE TYPE post_type AS ENUM ('column', 'community');
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  content TEXT NOT NULL,
  author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  post_id UUID NOT NULL, -- 칼럼 또는 커뮤니티 게시글 ID
  post_type post_type NOT NULL, -- 'column' 또는 'community'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  -- 제약 조건: post_id는 post_type에 따라 columns 또는 community_posts의 ID를 참조
  CONSTRAINT valid_post_reference CHECK (
    (post_type = 'column' AND EXISTS(SELECT 1 FROM columns WHERE id = post_id))
    OR
    (post_type = 'community' AND EXISTS(SELECT 1 FROM community_posts WHERE id = post_id))
  )
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_comments_author ON comments(author_id);
CREATE INDEX IF NOT EXISTS idx_comments_post ON comments(post_id, post_type);
CREATE INDEX IF NOT EXISTS idx_comments_created_at ON comments(created_at DESC);

-- 업데이트 트리거 설정
DROP TRIGGER IF EXISTS update_comments_updated_at ON comments;
CREATE TRIGGER update_comments_updated_at
BEFORE UPDATE ON comments
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- RLS(Row Level Security) 설정
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- RLS 정책: 모든 인증된 사용자가 댓글을 조회할 수 있음
CREATE POLICY select_comments_policy ON comments
  FOR SELECT
  TO authenticated
  USING (true);

-- RLS 정책: 활성 상태의 인증된 사용자만 댓글 작성 가능
CREATE POLICY insert_comments_policy ON comments
  FOR INSERT
  TO authenticated
  WITH CHECK (
    current_user_id() IN (
      SELECT id FROM users 
      WHERE status = 'active'
    )
  );

-- RLS 정책: 자신이 작성한 댓글만 수정 가능
CREATE POLICY update_comments_policy ON comments
  FOR UPDATE
  TO authenticated
  USING (author_id = current_user_id())
  WITH CHECK (author_id = current_user_id());

-- RLS 정책: 자신이 작성한 댓글만 삭제 가능
CREATE POLICY delete_comments_policy ON comments
  FOR DELETE
  TO authenticated
  USING (author_id = current_user_id());

-- RLS 정책: 관리자는 모든 댓글 수정/삭제 가능
CREATE POLICY admin_comments_policy ON comments
  FOR ALL
  TO authenticated
  USING (current_user_id() IN (SELECT id FROM users WHERE role = 'admin'))
  WITH CHECK (current_user_id() IN (SELECT id FROM users WHERE role = 'admin'));

-- 댓글 카운트 트리거 함수
CREATE OR REPLACE FUNCTION update_comment_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.post_type = 'column' THEN
      UPDATE columns SET comment_count = comment_count + 1 WHERE id = NEW.post_id;
    ELSIF NEW.post_type = 'community' THEN
      UPDATE community_posts SET comment_count = comment_count + 1 WHERE id = NEW.post_id;
    END IF;
  ELSIF TG_OP = 'DELETE' THEN
    IF OLD.post_type = 'column' THEN
      UPDATE columns SET comment_count = comment_count - 1 WHERE id = OLD.post_id;
    ELSIF OLD.post_type = 'community' THEN
      UPDATE community_posts SET comment_count = comment_count - 1 WHERE id = OLD.post_id;
    END IF;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- 댓글 추가/삭제 시 댓글 카운트 업데이트 트리거
DROP TRIGGER IF EXISTS trigger_comment_count_update ON comments;
CREATE TRIGGER trigger_comment_count_update
AFTER INSERT OR DELETE ON comments
FOR EACH ROW
EXECUTE FUNCTION update_comment_count(); 