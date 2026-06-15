-- character 테이블 생성
-- 주의: character는 PostgreSQL 예약어이므로 큰따옴표로 감쌈
CREATE TABLE IF NOT EXISTS "character" (
  id         BIGINT      PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
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

-- personal 테이블 생성 (퍼스널컬러 분석 결과)
CREATE TABLE IF NOT EXISTS personal (
  id           BIGINT      PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  user_id      BIGINT      NOT NULL REFERENCES "character"(id) ON DELETE CASCADE,
  personaltype TEXT        NOT NULL,
  "subType"    TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE personal ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public_read_personal" ON personal
  FOR SELECT USING (true);

CREATE POLICY "public_insert_personal" ON personal
  FOR INSERT WITH CHECK (true);

-- skin 테이블 생성 (피부 분석 결과)
CREATE TABLE IF NOT EXISTS skin (
  id           BIGINT      PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  user_id      BIGINT      NOT NULL REFERENCES "character"(id) ON DELETE CASCADE,
  skintype     TEXT        NOT NULL,
  age          INTEGER,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE skin ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public_read_skin" ON skin
  FOR SELECT USING (true);

CREATE POLICY "public_insert_skin" ON skin
  FOR INSERT WITH CHECK (true);
