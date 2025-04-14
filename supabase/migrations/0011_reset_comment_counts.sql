-- 칼럼 테이블의 댓글 수 재설정
UPDATE columns
SET comment_count = (
  SELECT COUNT(*)
  FROM comments
  WHERE post_id = columns.id AND post_type = 'column'
);

-- 커뮤니티 게시글 테이블의 댓글 수 재설정
UPDATE community_posts
SET comment_count = (
  SELECT COUNT(*)
  FROM comments
  WHERE post_id = community_posts.id AND post_type = 'community'
); 