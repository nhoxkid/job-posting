-- USERS table
CREATE TABLE users (
    user_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    email VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'applicant',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT chk_user_role
        CHECK (role IN ('applicant', 'admin'))
);

-- JOB_POSTINGS table
--
-- Rows arrive from the ingestion pipeline (src/ingest) as well as by hand, so
-- the columns match the canonical Job shape in src/models/job.ts, which in turn
-- matches what the Browse and Detail screens render.
--
-- De-duplication is enforced here rather than in application code, because the
-- database is the only place that can hold the invariant under concurrent
-- ingestion runs:
--
--   * `fingerprint` is UNIQUE and is the conflict target for every upsert. It
--     hashes the normalised company + title + location, so the same opening
--     listed by two different providers collapses onto one row instead of
--     appearing twice.
--   * `(source, external_id)` is UNIQUE so a single provider can never insert
--     the same posting twice, even if its feed repeats an entry.
--   * `content_hash` covers the mutable fields. Ingestion compares it and skips
--     the write when nothing changed, which keeps `updated_at` meaningful.
CREATE TABLE job_postings (
    job_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    -- TEXT, not VARCHAR(n). These come from third-party feeds whose lengths we
    -- don't control: aggregators join several offices into one location string
    -- and routinely blow past any limit we'd pick. Postgres stores TEXT and
    -- VARCHAR identically, so a cap here buys nothing and costs failed inserts.
    title TEXT NOT NULL,
    company TEXT NOT NULL,
    loc TEXT NOT NULL,
    job_type VARCHAR(20) NOT NULL,
    region VARCHAR(30) NOT NULL,
    work_model VARCHAR(20) NOT NULL,
    sponsorship VARCHAR(10) NOT NULL DEFAULT 'unknown',
    skills TEXT[] NOT NULL DEFAULT '{}',
    description TEXT NOT NULL DEFAULT '',
    apply_url TEXT NOT NULL,
    posted_at TIMESTAMPTZ NOT NULL,
    number_of_applicants BIGINT NOT NULL DEFAULT 0,

    source VARCHAR(40) NOT NULL,
    external_id VARCHAR(200) NOT NULL,
    fingerprint CHAR(40) NOT NULL,
    content_hash CHAR(40) NOT NULL,

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT chk_job_type
        CHECK (job_type IN ('Internship', 'New Grad', 'Co-op')),

    CONSTRAINT chk_region
        CHECK (region IN ('United States', 'Canada', 'United Kingdom', 'Remote')),

    CONSTRAINT chk_work_model
        CHECK (work_model IN ('On-site', 'Hybrid', 'Remote')),

    -- Tri-state on purpose: most sources never state sponsorship, and storing
    -- that silence as FALSE would assert something the employer never said.
    CONSTRAINT chk_sponsorship
        CHECK (sponsorship IN ('yes', 'no', 'unknown')),

    CONSTRAINT chk_number_of_applicants
        CHECK (number_of_applicants >= 0),

    CONSTRAINT uq_job_postings_fingerprint
        UNIQUE (fingerprint),

    CONSTRAINT uq_job_postings_source_external
        UNIQUE (source, external_id)
);

-- Browse filters on type/region/sponsorship and sorts by recency.
CREATE INDEX idx_job_postings_posted_at ON job_postings (posted_at DESC);
CREATE INDEX idx_job_postings_filters ON job_postings (job_type, region, sponsorship);

-- SAVED_JOBS table
CREATE TABLE saved_jobs (
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
CREATE TABLE application_tracker (
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

-- USER_PREFERENCES table
--
-- Backs SqlPreferencesRepository. One row per profile; while there is no auth
-- the app writes a single well-known id (`DEFAULT_PREFERENCES_ID`), so this is
-- deliberately keyed by a free-form id rather than a FK to users.
CREATE TABLE user_preferences (
    id VARCHAR(64) PRIMARY KEY,
    theme VARCHAR(10) NOT NULL DEFAULT 'light',
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT chk_theme
        CHECK (theme IN ('light', 'dark', 'system'))
);

-- FAQ table
CREATE TABLE faq (
    faq_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    question VARCHAR(255) NOT NULL,
    answer TEXT NOT NULL,
    subject VARCHAR(100),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);