/**
 * Job repository: the data-access boundary.
 *
 * `JobRepository` defines the contract the service depends on. Implement the
 * methods below using the SQL helpers in `src/db` (e.g. `query(...)`).
 */

import type { CreateJobInput, Job, JobQuery, UpdateJobInput } from '../models/job'

export interface PaginatedResult<T> {
  items: T[]
  total: number
}

export interface JobRepository {
  list(query: JobQuery): Promise<PaginatedResult<Job>>
  findById(id: string): Promise<Job | null>
  create(input: CreateJobInput): Promise<Job>
  update(id: string, input: UpdateJobInput): Promise<Job | null>
  delete(id: string): Promise<boolean>
}

/**
 * PostgreSQL-backed implementation. All methods are stubs — fill them in with
 * real SQL queries using the `query()` helper from `src/db`.
 */
export class SqlJobRepository implements JobRepository {
  async list(_query: JobQuery): Promise<PaginatedResult<Job>> {
    // TODO: SELECT with filters + pagination, plus a COUNT for `total`.
    throw new Error('Not implemented')
  }

  async findById(_id: string): Promise<Job | null> {
    // TODO: SELECT * FROM jobs WHERE id = $1
    throw new Error('Not implemented')
  }

  async create(_input: CreateJobInput): Promise<Job> {
    // TODO: INSERT ... RETURNING *
    throw new Error('Not implemented')
  }

  async update(_id: string, _input: UpdateJobInput): Promise<Job | null> {
    // TODO: UPDATE ... WHERE id = $1 RETURNING *
    throw new Error('Not implemented')
  }

  async delete(_id: string): Promise<boolean> {
    // TODO: DELETE FROM jobs WHERE id = $1
    throw new Error('Not implemented')
  }
}

/** Default repository instance used by the app. */
export const jobRepository: JobRepository = new SqlJobRepository()
