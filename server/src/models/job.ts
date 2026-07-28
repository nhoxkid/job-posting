/**
 * Job posting domain types.
 *
 * Aligned with the `job_postings` table in schema.sql and the listings.json
 * data from the GitHub internship board repos.
 */

export const JOB_TYPES = ['internship', 'new grad'] as const

export type JobType = (typeof JOB_TYPES)[number]

export const WORK_MODELS = ['In-person', 'remote', 'hybrid'] as const

export type WorkModel = (typeof WORK_MODELS)[number]

/** A persisted job posting. */
export interface Job {
  jobId: number
  employerName: string
  position: string
  jobType: JobType
  jobLocation: string
  jobSummary: string | null
  companySummary: string | null
  postingDate: string
  workModel: WorkModel | null
  sponsorshipAvailable: boolean
  applicationDeadline: string | null
  applicationLink: string
  numberOfApplicants: number
  // Aggregation fields (from GitHub ingest)
  sourceId: string | null
  sourceRepo: string | null
  descriptionRaw: string | null
  season: string | null
  active: boolean
}

/** Payload for creating a job (manual creation). */
export type CreateJobInput = Pick<
  Job,
  | 'employerName'
  | 'position'
  | 'jobType'
  | 'jobLocation'
  | 'workModel'
  | 'sponsorshipAvailable'
  | 'applicationLink'
> &
  Partial<
    Pick<
      Job,
      | 'jobSummary'
      | 'companySummary'
      | 'postingDate'
      | 'applicationDeadline'
      | 'sourceId'
      | 'sourceRepo'
      | 'descriptionRaw'
      | 'season'
      | 'active'
    >
  >

/** Payload for updating a job. */
export type UpdateJobInput = Partial<CreateJobInput>

/** Filters accepted by the list endpoint. */
export interface JobQuery {
  search?: string
  jobType?: JobType
  workModel?: WorkModel
  sponsorship?: boolean
  active?: boolean
  page?: number
  pageSize?: number
}
