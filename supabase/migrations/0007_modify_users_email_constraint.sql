-- 기존 users 테이블의 email 컬럼 제약조건 수정
ALTER TABLE users ALTER COLUMN email DROP NOT NULL;

-- 대신 (email, provider) 쌍의 유니크 제약조건 추가 (둘 다 있을 경우에만 유니크)
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_email_key;
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email_provider ON users (email, provider) 
WHERE email IS NOT NULL;

-- 이메일 또는 닉네임으로 로그인할 수 있도록 유니크 제약조건 확인
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_nickname_key;
ALTER TABLE users ADD CONSTRAINT users_nickname_key UNIQUE (nickname); 