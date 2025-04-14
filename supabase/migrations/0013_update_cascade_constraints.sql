-- likes 테이블의 CASCADE 제약 조건 추가
ALTER TABLE likes 
DROP CONSTRAINT IF EXISTS likes_post_id_fkey;

-- comments 테이블의 CASCADE 제약 조건 추가 
ALTER TABLE comments
DROP CONSTRAINT IF EXISTS comments_post_id_fkey;

-- 새로운 제약 조건 추가 (이름은 환경에 맞게 조정 필요)
-- 참고: 이 부분은 기존 DB 구조를 정확히 확인한 후 구현해야 합니다