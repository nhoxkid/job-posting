/**
 * Job posting domain types.
 *
 * Plain TypeScript declarations only — no runtime logic.
 *
 * This is the single canonical job shape for the whole stack. It deliberately
 * mirrors what the Browse and Detail screens render, so ingested rows reach the
 * UI without a translation layer in between. The client re-declares the same
 * fields in `client/src/types/job.ts`; keep the two in step.
 */

export const JOB_TYPES = ['Internship', 'New Grad', 'Co-op'] as const

export type JobType = (typeof JOB_TYPES)[number]

export const REGIONS = ['United States', 'Canada', 'United Kingdom', 'Remote'] as const

export type Region = (typeof REGIONS)[number]

export const WORK_MODELS = ['On-site', 'Hybrid', 'Remote'] as const

export type WorkModel = (typeof WORK_MODELS)[number]

/**
 * Whether a posting sponsors visas.
 *
 * Three states, not a boolean. Most sources simply don't say, and collapsing
 * "didn't say" into "no" prints a claim the posting never made — the exact
 * thing RoleVault exists to get right. `unknown` is by far the most common
 * value in practice, so the UI has to render it honestly rather than hide it.
 */
export const SPONSORSHIPS = ['yes', 'no', 'unknown'] as const

export type Sponsorship = (typeof SPONSORSHIPS)[number]

/** A persisted job posting. */
export interface Job {
  id: string
  title: string
  company: string
  /** Human-readable location, e.g. "Seattle, US". */
  loc: string
  type: JobType
  region: Region
  workModel: WorkModel
  /** Visa sponsorship as stated by the source; 'unknown' when it is silent. */
  sponsorship: Sponsorship
  skills: string[]
  /** Full posting body, shown on the detail screen. Plain text. */
  description: string
  applyUrl: string
  /** ISO timestamp of when the source published the posting. */
  postedAt: string
  applied: number

  /* ---- Provenance & de-duplication ---- */

  /** Provider slug that supplied this row, e.g. "greenhouse". */
  source: string
  /** The provider's own id for the posting. Unique within a source. */
  externalId: string
  /**
   * Stable identity across providers: a hash of the normalised
   * company + title + location. Two providers listing the same opening produce
   * the same fingerprint, which is what collapses them into a single row.
   */
  fingerprint: string
  /**
   * Hash of the mutable content. Lets ingestion skip writes for postings that
   * came back unchanged, so re-runs don't churn `updated_at`.
   */
  contentHash: string

  createdAt: string
  updatedAt: string
}

/** Payload for creating a job by hand (not via ingestion). */
export type CreateJobInput = Omit<
  Job,
  'id' | 'createdAt' | 'updatedAt' | 'fingerprint' | 'contentHash'
>

/** Payload for updating a job. */
export type UpdateJobInput = Partial<CreateJobInput>

/** Filters accepted by the list endpoint. */
export interface JobQuery {
  search?: string
  /** Repeatable: `?type=Internship&type=Co-op`. Empty or absent means "any". */
  types?: JobType[]
  regions?: Region[]
  /** Empty or absent means "any". */
  sponsorship?: Sponsorship[]
  page?: number
  pageSize?: number
}
