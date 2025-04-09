-- 커뮤니티 게시글 테이블 마이그레이션
CREATE TABLE IF NOT EXISTS community_posts (
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
CREATE INDEX IF NOT EXISTS idx_community_posts_author ON community_posts(author_id);
CREATE INDEX IF NOT EXISTS idx_community_posts_created_at ON community_posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_community_posts_like_count ON community_posts(like_count DESC);

-- 업데이트 트리거 설정
DROP TRIGGER IF EXISTS update_community_posts_updated_at ON community_posts;
CREATE TRIGGER update_community_posts_updated_at
BEFORE UPDATE ON community_posts
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- RLS(Row Level Security) 설정
ALTER TABLE community_posts ENABLE ROW LEVEL SECURITY;

-- RLS 정책: 모든 인증된 사용자가 게시글을 조회할 수 있음
CREATE POLICY select_community_posts_policy ON community_posts
  FOR SELECT
  TO authenticated
  USING (true);

-- RLS 정책: 활성 상태의 인증된 사용자만 게시글 작성 가능
CREATE POLICY insert_community_posts_policy ON community_posts
  FOR INSERT
  TO authenticated
  WITH CHECK (
    current_user_id() IN (
      SELECT id FROM users 
      WHERE status = 'active'
    )
  );

-- RLS 정책: 자신이 작성한 게시글만 수정 가능
CREATE POLICY update_community_posts_policy ON community_posts
  FOR UPDATE
  TO authenticated
  USING (author_id = current_user_id())
  WITH CHECK (author_id = current_user_id());

-- RLS 정책: 자신이 작성한 게시글만 삭제 가능
CREATE POLICY delete_community_posts_policy ON community_posts
  FOR DELETE
  TO authenticated
  USING (author_id = current_user_id());

-- RLS 정책: 관리자는 모든 게시글 수정/삭제 가능
CREATE POLICY admin_community_posts_policy ON community_posts
  FOR ALL
  TO authenticated
  USING (current_user_id() IN (SELECT id FROM users WHERE role = 'admin'))
  WITH CHECK (current_user_id() IN (SELECT id FROM users WHERE role = 'admin')); 