-- 좋아요 테이블 마이그레이션
-- 참조 무결성 검증을 위한 트리거 함수 생성
CREATE OR REPLACE FUNCTION check_likes_post_reference() 
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.post_type = 'column' THEN
    PERFORM 1 FROM columns WHERE id = NEW.post_id;
    IF NOT FOUND THEN
      RAISE EXCEPTION 'post_id는 존재하는 칼럼 ID여야 합니다';
    END IF;
  ELSIF NEW.post_type = 'community' THEN
    PERFORM 1 FROM community_posts WHERE id = NEW.post_id;
    IF NOT FOUND THEN
      RAISE EXCEPTION 'post_id는 존재하는 커뮤니티 게시글 ID여야 합니다';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TABLE IF NOT EXISTS likes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  post_id UUID NOT NULL,
  post_type post_type NOT NULL, -- 'column' 또는 'community'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  -- 제약 조건: 동일한 사용자가 동일한 게시글에 중복 좋아요 방지
  UNIQUE(author_id, post_id, post_type)
  -- 체크 제약조건 제거 (트리거로 대체)
);

-- 트리거 생성: 입력/수정 시 post_id 참조 확인
CREATE TRIGGER check_likes_post_reference_trigger
BEFORE INSERT OR UPDATE ON likes
FOR EACH ROW
EXECUTE FUNCTION check_likes_post_reference();

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_likes_author ON likes(author_id);
CREATE INDEX IF NOT EXISTS idx_likes_post ON likes(post_id, post_type);

-- RLS(Row Level Security) 설정
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;

-- RLS 정책: 모든 인증된 사용자가 좋아요 정보를 조회할 수 있음
CREATE POLICY select_likes_policy ON likes
  FOR SELECT
  TO authenticated
  USING (true);

-- RLS 정책: 활성 상태의 인증된 사용자만 좋아요 가능
CREATE POLICY insert_likes_policy ON likes
  FOR INSERT
  TO authenticated
  WITH CHECK (
    current_user_id() IN (
      SELECT id FROM users 
      WHERE status = 'active'
    )
  );

-- RLS 정책: 자신이 누른 좋아요만 취소 가능
CREATE POLICY delete_likes_policy ON likes
  FOR DELETE
  TO authenticated
  USING (author_id = current_user_id());

-- 좋아요 카운트 트리거 함수
CREATE OR REPLACE FUNCTION update_like_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.post_type = 'column' THEN
      UPDATE columns SET like_count = like_count + 1 WHERE id = NEW.post_id;
    ELSIF NEW.post_type = 'community' THEN
      UPDATE community_posts SET like_count = like_count + 1 WHERE id = NEW.post_id;
    END IF;
  ELSIF TG_OP = 'DELETE' THEN
    IF OLD.post_type = 'column' THEN
      UPDATE columns SET like_count = like_count - 1 WHERE id = OLD.post_id;
    ELSIF OLD.post_type = 'community' THEN
      UPDATE community_posts SET like_count = like_count - 1 WHERE id = OLD.post_id;
    END IF;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- 좋아요 추가/삭제 시 좋아요 카운트 업데이트 트리거
DROP TRIGGER IF EXISTS trigger_like_count_update ON likes;
CREATE TRIGGER trigger_like_count_update
AFTER INSERT OR DELETE ON likes
FOR EACH ROW
EXECUTE FUNCTION update_like_count(); 