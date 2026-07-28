-- Schema for the job posting platform.
--
-- `ensureSchemaAndSeed()` (see repositories/seed.ts) runs this file on EVERY
-- startup when DB_DRIVER=postgres, so every statement here MUST be safe to
-- re-apply. Use `CREATE TABLE IF NOT EXISTS` / `CREATE INDEX IF NOT EXISTS`,
-- and add new columns to existing installs with `ALTER TABLE ... ADD COLUMN
-- IF NOT EXISTS` rather than editing a CREATE TABLE body (which has no effect
-- once the table exists).

-- USERS table
CREATE TABLE IF NOT EXISTS users (
    user_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    email VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'applicant',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT chk_user_role
        CHECK (role IN ('applicant', 'admin'))
);

-- USERS: auth columns.
-- These are ALTERs rather than part of the CREATE TABLE above because that
-- body is inert once the table exists, and existing installs already have one.
ALTER TABLE users ADD COLUMN IF NOT EXISTS google_id VARCHAR(64);
ALTER TABLE users ADD COLUMN IF NOT EXISTS display_name VARCHAR(100);
ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url VARCHAR(500);

-- Google-only accounts have no password, so the hash must be optional.
ALTER TABLE users ALTER COLUMN password_hash DROP NOT NULL;

-- 50 chars is too short for real addresses.
ALTER TABLE users ALTER COLUMN email TYPE VARCHAR(255);

CREATE UNIQUE INDEX IF NOT EXISTS uq_users_google_id ON users (google_id);

-- Every account must retain at least one way to sign in. Added conditionally:
-- ADD CONSTRAINT has no IF NOT EXISTS.
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_user_credentials') THEN
        ALTER TABLE users ADD CONSTRAINT chk_user_credentials
            CHECK (password_hash IS NOT NULL OR google_id IS NOT NULL);
    END IF;
END $$;

-- JOB_POSTINGS table
CREATE TABLE IF NOT EXISTS job_postings (
    job_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    employer_name VARCHAR(100) NOT NULL,
    position VARCHAR(200) NOT NULL,
    job_type VARCHAR(20) NOT NULL DEFAULT 'internship',
    -- TEXT, not VARCHAR: a posting can list many cities, and the joined value
    -- runs past 200 characters in real listings.json data.
    job_location TEXT NOT NULL,
    job_summary TEXT,
    company_summary TEXT,
    posting_date DATE NOT NULL DEFAULT CURRENT_DATE,
    work_model VARCHAR(20) DEFAULT 'In-person',
    sponsorship_available BOOLEAN NOT NULL DEFAULT FALSE,
    application_deadline TIMESTAMP,
    application_link VARCHAR(500) NOT NULL,
    number_of_applicants BIGINT NOT NULL DEFAULT 0,

    -- Aggregation fields (populated by GitHub Actions ingest)
    source_id VARCHAR(100) UNIQUE,
    source_repo VARCHAR(100),
    description_raw TEXT,
    season VARCHAR(20),
    active BOOLEAN NOT NULL DEFAULT TRUE,

    CONSTRAINT chk_job_type
        CHECK (job_type IN ('internship', 'new grad')),

    CONSTRAINT chk_work_model
        CHECK (work_model IS NULL OR work_model IN ('In-person', 'remote', 'hybrid')),

    CONSTRAINT chk_number_of_applicants
        CHECK (number_of_applicants >= 0)
);

-- JOB_POSTINGS: widen job_location on installs created before it became TEXT.
ALTER TABLE job_postings ALTER COLUMN job_location TYPE TEXT;

-- SAVED_JOBS table
CREATE TABLE IF NOT EXISTS saved_jobs (
    saved_job_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    job_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    saved_at DATE NOT NULL DEFAULT CURRENT_DATE,

    CONSTRAINT fk_saved_jobs_job
        FOREIGN KEY (job_id)
        REFERENCES job_postings(job_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,

    CONSTRAINT fk_saved_jobs_user
        FOREIGN KEY (user_id)
        REFERENCES users(user_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,

    CONSTRAINT uq_saved_jobs_user_job
        UNIQUE (user_id, job_id)
);

-- APPLICATION_TRACKER table
CREATE TABLE IF NOT EXISTS application_tracker (
    tracker_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id BIGINT NOT NULL,
    job_id BIGINT NOT NULL,
    date_applied TIMESTAMP,

    CONSTRAINT fk_application_tracker_user
        FOREIGN KEY (user_id)
        REFERENCES users(user_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,

    CONSTRAINT fk_application_tracker_job
        FOREIGN KEY (job_id)
        REFERENCES job_postings(job_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,

    CONSTRAINT uq_application_tracker_user_job
        UNIQUE (user_id, job_id)
);

-- FAQ table
CREATE TABLE IF NOT EXISTS faq (
    faq_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    question VARCHAR(255) NOT NULL,
    answer TEXT NOT NULL,
    subject VARCHAR(100),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- USER_PREFERENCES table
-- Keyed by a free-form profile id (currently the single shared 'default'
-- profile; becomes the user id once accounts are wired up).
CREATE TABLE IF NOT EXISTS user_preferences (
    id VARCHAR(64) PRIMARY KEY,
    theme VARCHAR(20) NOT NULL DEFAULT 'light',
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT chk_user_preferences_theme
        CHECK (theme IN ('light', 'dark', 'system'))
);
