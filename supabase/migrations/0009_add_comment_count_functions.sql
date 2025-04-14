-- 댓글 수 증가 함수
CREATE OR REPLACE FUNCTION increment_comment_count(p_table_name TEXT, p_id UUID)
RETURNS VOID AS $$
BEGIN
  IF p_table_name = 'columns' THEN
    UPDATE columns SET comment_count = comment_count + 1 WHERE id = p_id;
  ELSIF p_table_name = 'community_posts' THEN
    UPDATE community_posts SET comment_count = comment_count + 1 WHERE id = p_id;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- 댓글 수 감소 함수
CREATE OR REPLACE FUNCTION decrement_comment_count(p_table_name TEXT, p_id UUID)
RETURNS VOID AS $$
BEGIN
  IF p_table_name = 'columns' THEN
    UPDATE columns SET comment_count = GREATEST(0, comment_count - 1) WHERE id = p_id;
  ELSIF p_table_name = 'community_posts' THEN
    UPDATE community_posts SET comment_count = GREATEST(0, comment_count - 1) WHERE id = p_id;
  END IF;
END;
$$ LANGUAGE plpgsql; 