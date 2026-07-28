/**
 * Job service: business logic layer (HTTP- and storage-agnostic).
 *
 * Depends on the `JobRepository` interface. Validates input, applies defaults,
 * and shapes the paginated envelope returned to the controller.
 */

import { JOB_TYPES, REGIONS, SPONSORSHIPS, WORK_MODELS } from '../models/job'
import type {
  CreateJobInput,
  Job,
  JobQuery,
  JobType,
  Region,
  Sponsorship,
  UpdateJobInput,
  WorkModel,
} from '../models/job'
import { jobRepository, type JobRepository } from '../repositories/job.repository'
import { ApiError } from '../utils/ApiError'

export interface Paginated<T> {
  data: T[]
  page: number
  pageSize: number
  total: number
  totalPages: number
}

function requireString(value: unknown, field: string): string {
  if (typeof value !== 'string' || value.trim() === '') {
    throw ApiError.badRequest(`"${field}" is required`)
  }
  return value.trim()
}

function requireOneOf<T extends string>(
  value: unknown,
  allowed: readonly T[],
  field: string,
): T {
  const raw = requireString(value, field)
  if (!allowed.includes(raw as T)) {
    throw ApiError.badRequest(`"${field}" must be one of: ${allowed.join(', ')}`)
  }
  return raw as T
}

/**
 * Read a repeatable query parameter.
 *
 * Express gives `?type=a` as a string and `?type=a&type=b` as an array, so both
 * shapes have to be handled. Unknown values are dropped rather than rejected:
 * a stale bookmark with a removed filter should still return results.
 */
function parseList<T extends string>(value: unknown, allowed: readonly T[]): T[] | undefined {
  if (value === undefined) return undefined
  const raw = Array.isArray(value) ? value : String(value).split(',')
  const parsed = raw
    .map((item) => String(item).trim())
    .filter((item): item is T => allowed.includes(item as T))
  return parsed.length > 0 ? parsed : undefined
}

function parseNumber(value: unknown): number | undefined {
  if (value === undefined || value === '') return undefined
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : undefined
}

/** Build a `JobQuery` from raw `req.query`. */
export function parseJobQuery(raw: Record<string, unknown>): JobQuery {
  return {
    search: typeof raw.search === 'string' ? raw.search : undefined,
    types: parseList<JobType>(raw.type ?? raw.types, JOB_TYPES),
    regions: parseList<Region>(raw.region ?? raw.regions, REGIONS),
    sponsorship: parseList<Sponsorship>(raw.sponsorship ?? raw.spons, SPONSORSHIPS),
    page: parseNumber(raw.page),
    pageSize: parseNumber(raw.pageSize),
  }
}

/** Validate and normalise a create payload coming off the wire. */
function parseCreateInput(body: unknown): CreateJobInput {
  if (typeof body !== 'object' || body === null) {
    throw ApiError.badRequest('Request body must be a JSON object')
  }
  const b = body as Record<string, unknown>

  const skills = Array.isArray(b.skills)
    ? b.skills.filter((skill): skill is string => typeof skill === 'string')
    : []

  return {
    title: requireString(b.title, 'title'),
    company: requireString(b.company, 'company'),
    loc: requireString(b.loc, 'loc'),
    type: requireOneOf<JobType>(b.type, JOB_TYPES, 'type'),
    region: requireOneOf<Region>(b.region, REGIONS, 'region'),
    workModel: b.workModel === undefined
      ? ('On-site' as WorkModel)
      : requireOneOf<WorkModel>(b.workModel, WORK_MODELS, 'workModel'),
    sponsorship: b.sponsorship === undefined
      ? 'unknown'
      : requireOneOf<Sponsorship>(b.sponsorship, SPONSORSHIPS, 'sponsorship'),
    skills,
    description: typeof b.description === 'string' ? b.description : '',
    applyUrl: requireString(b.applyUrl, 'applyUrl'),
    postedAt: typeof b.postedAt === 'string' ? b.postedAt : new Date().toISOString(),
    applied: typeof b.applied === 'number' ? b.applied : 0,
    // Hand-created postings are still tagged with a provenance so every row in
    // the table can be traced back to where it came from.
    source: 'manual',
    externalId: typeof b.externalId === 'string' ? b.externalId : `manual-${Date.now()}`,
  }
}

export class JobService {
  constructor(private readonly repo: JobRepository = jobRepository) {}

  async list(query: JobQuery): Promise<Paginated<Job>> {
    const { items, total } = await this.repo.list(query)
    const page = Math.max(1, Math.trunc(query.page ?? 1))
    const pageSize = Math.min(500, Math.max(1, Math.trunc(query.pageSize ?? 12)))
    return {
      data: items,
      page,
      pageSize,
      total,
      totalPages: Math.max(1, Math.ceil(total / pageSize)),
    }
  }

  async getById(id: string): Promise<Job> {
    const job = await this.repo.findById(id)
    if (!job) throw ApiError.notFound(`Job "${id}" not found`)
    return job
  }

  async create(input: unknown): Promise<Job> {
    return this.repo.create(parseCreateInput(input))
  }

  async update(id: string, input: UpdateJobInput): Promise<Job> {
    const updated = await this.repo.update(id, input)
    if (!updated) throw ApiError.notFound(`Job "${id}" not found`)
    return updated
  }

  async remove(id: string): Promise<void> {
    const deleted = await this.repo.delete(id)
    if (!deleted) throw ApiError.notFound(`Job "${id}" not found`)
  }
}

/** Default service instance. */
export const jobService = new JobService()
