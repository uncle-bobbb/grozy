-- 필요 없는 RPC 함수 제거
DROP FUNCTION IF EXISTS increment_comment_count(TEXT, UUID);
DROP FUNCTION IF EXISTS decrement_comment_count(TEXT, UUID); 