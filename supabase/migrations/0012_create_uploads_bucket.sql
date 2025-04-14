-- uploads 버킷이 없는 경우에만 생성
DO $$
BEGIN
    -- 버킷이 존재하는지 확인
    IF NOT EXISTS (
        SELECT 1 FROM storage.buckets WHERE name = 'uploads'
    ) THEN
        -- 없다면 버킷 생성
        INSERT INTO storage.buckets (id, name, public, avif_autodetection, file_size_limit, allowed_mime_types)
        VALUES ('uploads', 'uploads', TRUE, FALSE, 5242880, ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']::text[]);
        
        -- RLS 활성화 (Row Level Security)
        ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;
        
        -- 정책 생성 (storage.objects 테이블에 대한 정책으로 변경)
        -- 인증된 사용자만 업로드 가능
        CREATE POLICY "Upload access for authenticated users only"
        ON storage.objects FOR INSERT
        TO authenticated
        WITH CHECK (bucket_id = 'uploads' AND auth.role() = 'authenticated');
        
        -- 모든 사용자가 읽기 접근 가능
        CREATE POLICY "Read access for all users"
        ON storage.objects FOR SELECT
        TO public
        USING (bucket_id = 'uploads');
        
        -- 인증된 사용자만 업데이트 가능 (자신이 업로드한 파일만)
        CREATE POLICY "Update access for authenticated users"
        ON storage.objects FOR UPDATE
        TO authenticated
        USING (bucket_id = 'uploads' AND auth.uid() = owner)
        WITH CHECK (bucket_id = 'uploads' AND auth.uid() = owner);
        
        -- 인증된 사용자만 삭제 가능 (자신이 업로드한 파일만)
        CREATE POLICY "Delete access for authenticated users"
        ON storage.objects FOR DELETE
        TO authenticated
        USING (bucket_id = 'uploads' AND auth.uid() = owner);
    END IF;
END $$; 