-- Schema for the job postings table (PostgreSQL).
-- Applied automatically on startup when DB_DRIVER=postgres.

CREATE TABLE IF NOT EXISTS jobs (
  id              TEXT PRIMARY KEY DEFAULT ('job_' || gen_random_uuid()),
  title           TEXT NOT NULL,
  company         TEXT NOT NULL,
  location        TEXT NOT NULL,
  remote          BOOLEAN NOT NULL DEFAULT FALSE,
  employment_type TEXT NOT NULL,
  description     TEXT NOT NULL,
  tags            TEXT[] NOT NULL DEFAULT '{}',
  salary_min      INTEGER,
  salary_max      INTEGER,
  currency        TEXT NOT NULL DEFAULT 'USD',
  status          TEXT NOT NULL DEFAULT 'open',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS jobs_status_idx ON jobs (status);
CREATE INDEX IF NOT EXISTS jobs_created_at_idx ON jobs (created_at DESC);
