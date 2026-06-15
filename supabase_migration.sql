-- character 테이블 생성
-- 주의: character는 PostgreSQL 예약어이므로 큰따옴표로 감쌈
CREATE TABLE IF NOT EXISTS "character" (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  nickname   TEXT        NOT NULL,
  email      TEXT        UNIQUE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Row Level Security 활성화
ALTER TABLE "character" ENABLE ROW LEVEL SECURITY;

-- 누구든 읽기 허용 (앱에서 닉네임 조회에 필요)
CREATE POLICY "public_read" ON "character"
  FOR SELECT USING (true);

-- 누구든 삽입 허용 (회원가입 시 레코드 생성)
CREATE POLICY "public_insert" ON "character"
  FOR INSERT WITH CHECK (true);
