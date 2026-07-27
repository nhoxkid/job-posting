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
CREATE TABLE job_postings (
    job_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    employer_name VARCHAR(75) NOT NULL,
    position VARCHAR(50) NOT NULL,
    job_type VARCHAR(20) NOT NULL,
    job_location VARCHAR(75) NOT NULL,
    job_summary TEXT,
    company_summary TEXT,
    posting_date DATE NOT NULL,
    work_model VARCHAR(20) NOT NULL,
    sponsorship_available BOOLEAN NOT NULL DEFAULT FALSE,
    application_deadline TIMESTAMP,
    application_link VARCHAR(150) NOT NULL,
    number_of_applicants BIGINT NOT NULL DEFAULT 0,

    CONSTRAINT chk_job_type
        CHECK (job_type IN ('internship', 'new grad')),

    CONSTRAINT chk_work_model
        CHECK (work_model IN ('In-person', 'remote', 'hybrid')),

    CONSTRAINT chk_number_of_applicants
        CHECK (number_of_applicants >= 0)
);

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

-- FAQ table
CREATE TABLE faq (
    faq_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    question VARCHAR(255) NOT NULL,
    answer TEXT NOT NULL,
    subject VARCHAR(100),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);