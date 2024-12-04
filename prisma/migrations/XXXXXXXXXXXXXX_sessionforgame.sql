-- 먼저 임시 값으로 컬럼 추가
ALTER TABLE "ImageMatchingAnswer" ADD COLUMN "session_id" TEXT;

-- 기존 레코드에 대해 임시 세션 ID 설정
UPDATE "ImageMatchingAnswer" SET "session_id" = 'legacy_session_' || answer_id::text;

-- 이제 NOT NULL 제약조건 추가
ALTER TABLE "ImageMatchingAnswer" ALTER COLUMN "session_id" SET NOT NULL;