/**
 * Domain types for job postings.
 *
 * These mirror `server/src/models/job.ts` exactly. The server shape was chosen
 * to match what these screens render, so nothing is translated in between —
 * which also means the two files have to change together.
 */

export const JOB_TYPES = ['Internship', 'New Grad', 'Co-op'] as const

export type JobType = (typeof JOB_TYPES)[number]

export const REGIONS = ['United States', 'Canada', 'United Kingdom', 'Remote'] as const

export type Region = (typeof REGIONS)[number]

export const WORK_MODELS = ['On-site', 'Hybrid', 'Remote'] as const

export type WorkModel = (typeof WORK_MODELS)[number]

/**
 * Visa sponsorship, as three states rather than a boolean.
 *
 * Most postings never mention sponsorship. Rendering that silence as "No"
 * asserts a rejection the employer never made, so 'unknown' is carried all the
 * way to the badge instead of being flattened on the way.
 */
export const SPONSORSHIPS = ['yes', 'no', 'unknown'] as const

export type Sponsorship = (typeof SPONSORSHIPS)[number]

export interface Job {
  id: string
  title: string
  company: string
  loc: string
  type: JobType
  region: Region
  workModel: WorkModel
  sponsorship: Sponsorship
  skills: string[]
  description: string
  applyUrl: string
  /** ISO timestamp; format for display with `formatPostedAt`. */
  postedAt: string
  applied: number
  source: string
  externalId: string
  fingerprint: string
  contentHash: string
  createdAt: string
  updatedAt: string
}

/** Payload for creating a job posting. */
export interface CreateJobInput {
  title: string
  company: string
  loc: string
  type: JobType
  region: Region
  workModel?: WorkModel
  sponsorship?: Sponsorship
  skills?: string[]
  description?: string
  applyUrl: string
  postedAt?: string
  applied?: number
}

/** Payload for updating a job posting (all fields optional). */
export type UpdateJobInput = Partial<CreateJobInput>

/** Query parameters accepted by the list endpoint. */
export interface JobQuery {
  search?: string
  types?: JobType[]
  regions?: Region[]
  sponsorship?: Sponsorship[]
  page?: number
  pageSize?: number
}

/** Standard paginated response envelope. */
export interface Paginated<T> {
  data: T[]
  page: number
  pageSize: number
  total: number
  totalPages: number
}
