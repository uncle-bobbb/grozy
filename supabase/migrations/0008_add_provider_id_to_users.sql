-- 테이블에 provider_id 컬럼 추가
ALTER TABLE users ADD COLUMN IF NOT EXISTS provider_id VARCHAR(255);

-- provider와 provider_id의 조합이 유니크하도록 인덱스 생성
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_provider_provider_id ON users (provider, provider_id) 
WHERE provider_id IS NOT NULL;

-- provider_id 조회용 인덱스 추가
CREATE INDEX IF NOT EXISTS idx_users_provider_id ON users(provider_id); 