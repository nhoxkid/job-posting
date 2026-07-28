/**
 * Job repository: the data-access boundary.
 *
 * `JobRepository` defines the contract the service and the ingestion pipeline
 * depend on. Two implementations are provided:
 *
 *   - `InMemoryJobRepository` — seeded with sample data, requires no database.
 *     This is the default so the app runs out of the box (`DB_DRIVER=memory`).
 *   - `SqlJobRepository` — PostgreSQL-backed, used when `DB_DRIVER=postgres`.
 *
 * Both implement `upsertMany`, which is how ingested postings land without
 * creating duplicates. The two agree on behaviour so ingestion can be developed
 * and tested against memory and run for real against Postgres.
 */

import { randomUUID } from 'node:crypto'
import { env } from '../config/env'
import { query } from '../db'
import type { CreateJobInput, Job, JobQuery, UpdateJobInput } from '../models/job'
import { contentHashOf, fingerprintOf } from '../ingest/normalize'
import { seedJobs } from './job.seed-data'

export interface PaginatedResult<T> {
  items: T[]
  total: number
}

/** Outcome of an upsert batch, used for the ingestion report. */
export interface UpsertResult {
  inserted: number
  updated: number
  /** Matched an existing row whose content hash was identical. */
  unchanged: number
}

/** A job ready to be written: everything except the storage-assigned fields. */
export type UpsertJobInput = Omit<Job, 'id' | 'createdAt' | 'updatedAt'>

export interface JobRepository {
  list(query: JobQuery): Promise<PaginatedResult<Job>>
  findById(id: string): Promise<Job | null>
  create(input: CreateJobInput): Promise<Job>
  update(id: string, input: UpdateJobInput): Promise<Job | null>
  delete(id: string): Promise<boolean>
  /**
   * Insert or refresh a batch, keyed on `fingerprint`.
   *
   * Postings whose content is unchanged are left alone so `updated_at` keeps
   * meaning "the day this posting actually changed".
   */
  upsertMany(jobs: UpsertJobInput[]): Promise<UpsertResult>
}

const DEFAULT_PAGE = 1
const DEFAULT_PAGE_SIZE = 12

function normalisePaging(query: JobQuery): { page: number; pageSize: number } {
  const page = Math.max(1, Math.trunc(query.page ?? DEFAULT_PAGE))
  const rawSize = Math.trunc(query.pageSize ?? DEFAULT_PAGE_SIZE)
  // Browse pulls the whole filtered set and pages client-side, so the ceiling
  // is high enough to serve that in one request.
  const pageSize = Math.min(500, Math.max(1, rawSize))
  return { page, pageSize }
}

/** Shared filter predicate so memory and SQL can't drift on semantics. */
function matchesQuery(job: Job, q: JobQuery): boolean {
  if (q.types?.length && !q.types.includes(job.type)) return false
  if (q.regions?.length && !q.regions.includes(job.region)) return false
  if (q.sponsorship?.length && !q.sponsorship.includes(job.sponsorship)) return false

  const search = q.search?.trim().toLowerCase()
  if (search) {
    const haystack = [job.title, job.company, job.loc, job.type, ...job.skills]
      .join(' ')
      .toLowerCase()
    if (!haystack.includes(search)) return false
  }
  return true
}

/* -------------------------------------------------------------------------- */
/* In-memory implementation                                                   */
/* -------------------------------------------------------------------------- */

export class InMemoryJobRepository implements JobRepository {
  private jobs: Job[]

  constructor(seed: Job[] = seedJobs) {
    // Clone so callers can't mutate the seed array by reference.
    this.jobs = seed.map((job) => ({ ...job, skills: [...job.skills] }))
  }

  async list(q: JobQuery): Promise<PaginatedResult<Job>> {
    const { page, pageSize } = normalisePaging(q)

    const filtered = this.jobs
      .filter((job) => matchesQuery(job, q))
      .sort((a, b) => b.postedAt.localeCompare(a.postedAt))

    const total = filtered.length
    const start = (page - 1) * pageSize
    return { items: filtered.slice(start, start + pageSize), total }
  }

  async findById(id: string): Promise<Job | null> {
    return this.jobs.find((job) => job.id === id) ?? null
  }

  async create(input: CreateJobInput): Promise<Job> {
    const now = new Date().toISOString()
    const fingerprint = fingerprintOf(input.company, input.title, input.region)
    const base = { ...input, skills: [...(input.skills ?? [])], fingerprint }
    const job: Job = {
      ...base,
      contentHash: contentHashOf(base),
      id: `job_${randomUUID()}`,
      createdAt: now,
      updatedAt: now,
    }
    this.jobs.unshift(job)
    return job
  }

  async update(id: string, input: UpdateJobInput): Promise<Job | null> {
    const index = this.jobs.findIndex((job) => job.id === id)
    if (index === -1) return null
    const existing = this.jobs[index]
    const updated: Job = {
      ...existing,
      ...input,
      skills: input.skills ? [...input.skills] : existing.skills,
      updatedAt: new Date().toISOString(),
    }
    this.jobs[index] = updated
    return updated
  }

  async delete(id: string): Promise<boolean> {
    const index = this.jobs.findIndex((job) => job.id === id)
    if (index === -1) return false
    this.jobs.splice(index, 1)
    return true
  }

  async upsertMany(incoming: UpsertJobInput[]): Promise<UpsertResult> {
    const result: UpsertResult = { inserted: 0, updated: 0, unchanged: 0 }
    const now = new Date().toISOString()

    for (const job of incoming) {
      const index = this.jobs.findIndex((existing) => existing.fingerprint === job.fingerprint)

      if (index === -1) {
        this.jobs.unshift({
          ...job,
          skills: [...job.skills],
          id: `job_${randomUUID()}`,
          createdAt: now,
          updatedAt: now,
        })
        result.inserted++
        continue
      }

      const existing = this.jobs[index]
      if (existing.contentHash === job.contentHash) {
        result.unchanged++
        continue
      }

      this.jobs[index] = {
        ...existing,
        ...job,
        skills: [...job.skills],
        // Identity and first-seen date belong to the row, not the new payload.
        id: existing.id,
        createdAt: existing.createdAt,
        updatedAt: now,
      }
      result.updated++
    }

    return result
  }
}

/* -------------------------------------------------------------------------- */
/* PostgreSQL implementation                                                  */
/* -------------------------------------------------------------------------- */

/** Row shape returned by `SELECT * FROM job_postings` (snake_case columns). */
interface JobRow {
  job_id: string | number
  title: string
  company: string
  loc: string
  job_type: Job['type']
  region: Job['region']
  work_model: Job['workModel']
  sponsorship: Job['sponsorship']
  skills: string[] | null
  description: string
  apply_url: string
  posted_at: Date | string
  number_of_applicants: string | number
  source: string
  external_id: string
  fingerprint: string
  content_hash: string
  created_at: Date | string
  updated_at: Date | string
}

function rowToJob(row: JobRow): Job {
  return {
    id: String(row.job_id),
    title: row.title,
    company: row.company,
    loc: row.loc,
    type: row.job_type,
    region: row.region,
    workModel: row.work_model,
    sponsorship: row.sponsorship,
    skills: row.skills ?? [],
    description: row.description,
    applyUrl: row.apply_url,
    postedAt: new Date(row.posted_at).toISOString(),
    applied: Number(row.number_of_applicants),
    source: row.source,
    externalId: row.external_id,
    fingerprint: row.fingerprint,
    contentHash: row.content_hash,
    createdAt: new Date(row.created_at).toISOString(),
    updatedAt: new Date(row.updated_at).toISOString(),
  }
}

const SELECT_COLUMNS = `job_id, title, company, loc, job_type, region, work_model,
  sponsorship, skills, description, apply_url, posted_at,
  number_of_applicants, source, external_id, fingerprint, content_hash,
  created_at, updated_at`

export class SqlJobRepository implements JobRepository {
  async list(q: JobQuery): Promise<PaginatedResult<Job>> {
    const { page, pageSize } = normalisePaging(q)
    const where: string[] = []
    const params: unknown[] = []

    if (q.types?.length) {
      params.push(q.types)
      where.push(`job_type = ANY($${params.length})`)
    }
    if (q.regions?.length) {
      params.push(q.regions)
      where.push(`region = ANY($${params.length})`)
    }
    if (q.sponsorship?.length) {
      params.push(q.sponsorship)
      where.push(`sponsorship = ANY($${params.length})`)
    }
    if (q.search?.trim()) {
      params.push(`%${q.search.trim()}%`)
      const i = params.length
      where.push(
        `(title ILIKE $${i} OR company ILIKE $${i} OR loc ILIKE $${i} OR array_to_string(skills, ' ') ILIKE $${i})`,
      )
    }

    const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : ''

    const countResult = await query<{ count: number }>(
      `SELECT COUNT(*)::int AS count FROM job_postings ${whereSql}`,
      params,
    )

    const rows = await query<JobRow>(
      `SELECT ${SELECT_COLUMNS} FROM job_postings ${whereSql}
       ORDER BY posted_at DESC
       LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
      [...params, pageSize, (page - 1) * pageSize],
    )

    return { items: rows.rows.map(rowToJob), total: Number(countResult.rows[0]?.count ?? 0) }
  }

  async findById(id: string): Promise<Job | null> {
    // Ids are bigints; a non-numeric path segment is a miss, not a 500.
    if (!/^\d+$/.test(id)) return null
    const result = await query<JobRow>(
      `SELECT ${SELECT_COLUMNS} FROM job_postings WHERE job_id = $1`,
      [id],
    )
    const row = result.rows[0]
    return row ? rowToJob(row) : null
  }

  async create(input: CreateJobInput): Promise<Job> {
    const fingerprint = fingerprintOf(input.company, input.title, input.region)
    const base = { ...input, fingerprint }
    const result = await query<JobRow>(
      `INSERT INTO job_postings (
         title, company, loc, job_type, region, work_model, sponsorship,
         skills, description, apply_url, posted_at, number_of_applicants,
         source, external_id, fingerprint, content_hash
       ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16)
       RETURNING ${SELECT_COLUMNS}`,
      [
        input.title,
        input.company,
        input.loc,
        input.type,
        input.region,
        input.workModel,
        input.sponsorship,
        input.skills ?? [],
        input.description,
        input.applyUrl,
        input.postedAt,
        input.applied ?? 0,
        input.source,
        input.externalId,
        fingerprint,
        contentHashOf(base),
      ],
    )
    return rowToJob(result.rows[0])
  }

  async update(id: string, input: UpdateJobInput): Promise<Job | null> {
    if (!/^\d+$/.test(id)) return null

    const columns: Record<string, unknown> = {
      title: input.title,
      company: input.company,
      loc: input.loc,
      job_type: input.type,
      region: input.region,
      work_model: input.workModel,
      sponsorship: input.sponsorship,
      skills: input.skills,
      description: input.description,
      apply_url: input.applyUrl,
      posted_at: input.postedAt,
      number_of_applicants: input.applied,
    }

    const sets: string[] = []
    const params: unknown[] = []
    for (const [column, value] of Object.entries(columns)) {
      if (value === undefined) continue
      params.push(value)
      sets.push(`${column} = $${params.length}`)
    }
    if (sets.length === 0) return this.findById(id)

    sets.push('updated_at = now()')
    params.push(id)

    const result = await query<JobRow>(
      `UPDATE job_postings SET ${sets.join(', ')} WHERE job_id = $${params.length}
       RETURNING ${SELECT_COLUMNS}`,
      params,
    )
    const row = result.rows[0]
    return row ? rowToJob(row) : null
  }

  async delete(id: string): Promise<boolean> {
    if (!/^\d+$/.test(id)) return false
    const result = await query(`DELETE FROM job_postings WHERE job_id = $1`, [id])
    return (result.rowCount ?? 0) > 0
  }

  /**
   * Batch upsert keyed on the unique `fingerprint`.
   *
   * `ON CONFLICT (fingerprint) DO UPDATE ... WHERE content_hash IS DISTINCT
   * FROM excluded.content_hash` is doing the real work: the database resolves
   * the duplicate, and the WHERE clause suppresses the write entirely when
   * nothing changed. Because the constraint lives in Postgres rather than in a
   * read-then-write in application code, two ingestion runs racing each other
   * still cannot produce two rows for one posting.
   *
   * `xmax = 0` is the standard way to tell an insert from an update in a
   * RETURNING clause: it is zero only for a freshly inserted tuple.
   */
  async upsertMany(incoming: UpsertJobInput[]): Promise<UpsertResult> {
    const result: UpsertResult = { inserted: 0, updated: 0, unchanged: 0 }
    if (incoming.length === 0) return result

    // Chunked so a large crawl doesn't exceed Postgres' bind-parameter limit
    // (65535); 16 columns per row leaves plenty of headroom at 250 rows.
    const CHUNK = 250

    for (let offset = 0; offset < incoming.length; offset += CHUNK) {
      const chunk = incoming.slice(offset, offset + CHUNK)
      const params: unknown[] = []
      const tuples = chunk.map((job) => {
        const values = [
          job.title,
          job.company,
          job.loc,
          job.type,
          job.region,
          job.workModel,
          job.sponsorship,
          job.skills,
          job.description,
          job.applyUrl,
          job.postedAt,
          job.applied,
          job.source,
          job.externalId,
          job.fingerprint,
          job.contentHash,
        ]
        const placeholders = values.map((_, i) => `$${params.length + i + 1}`)
        params.push(...values)
        return `(${placeholders.join(',')})`
      })

      const rows = await query<{ inserted: boolean }>(
        `INSERT INTO job_postings (
           title, company, loc, job_type, region, work_model, sponsorship,
           skills, description, apply_url, posted_at, number_of_applicants,
           source, external_id, fingerprint, content_hash
         ) VALUES ${tuples.join(',')}
         ON CONFLICT (fingerprint) DO UPDATE SET
           title = EXCLUDED.title,
           company = EXCLUDED.company,
           loc = EXCLUDED.loc,
           job_type = EXCLUDED.job_type,
           region = EXCLUDED.region,
           work_model = EXCLUDED.work_model,
           sponsorship = EXCLUDED.sponsorship,
           skills = EXCLUDED.skills,
           description = EXCLUDED.description,
           apply_url = EXCLUDED.apply_url,
           posted_at = EXCLUDED.posted_at,
           source = EXCLUDED.source,
           external_id = EXCLUDED.external_id,
           content_hash = EXCLUDED.content_hash,
           updated_at = now()
         WHERE job_postings.content_hash IS DISTINCT FROM EXCLUDED.content_hash
         RETURNING (xmax = 0) AS inserted`,
        params,
      )

      for (const row of rows.rows) {
        if (row.inserted) result.inserted++
        else result.updated++
      }
      // Rows filtered out by the WHERE clause return nothing at all.
      result.unchanged += chunk.length - rows.rows.length
    }

    return result
  }
}

/* -------------------------------------------------------------------------- */
/* Default instance — chosen by DB_DRIVER (defaults to in-memory).            */
/* -------------------------------------------------------------------------- */

export const jobRepository: JobRepository =
  env.dbDriver === 'postgres' ? new SqlJobRepository() : new InMemoryJobRepository()
