/**
 * Job service: business logic layer (HTTP- and storage-agnostic).
 *
 * Depends on the `JobRepository` interface. Implement each method by
 * delegating to the repository and adding any business rules.
 */

import type { CreateJobInput, Job, JobQuery, UpdateJobInput } from '../models/job'
import { jobRepository, type JobRepository } from '../repositories/job.repository'

export interface Paginated<T> {
  data: T[]
  page: number
  pageSize: number
  total: number
  totalPages: number
}

export class JobService {
  constructor(private readonly repo: JobRepository = jobRepository) {}

  async list(_query: JobQuery): Promise<Paginated<Job>> {
    // TODO: call this.repo.list(...) and build the paginated envelope.
    void this.repo // remove once `this.repo` is used in the implementations below.
    throw new Error('Not implemented')
  }

  async getById(_id: string): Promise<Job> {
    // TODO: call this.repo.findById(...) and throw 404 if missing.
    throw new Error('Not implemented')
  }

  async create(_input: CreateJobInput): Promise<Job> {
    // TODO: call this.repo.create(...).
    throw new Error('Not implemented')
  }

  async update(_id: string, _input: UpdateJobInput): Promise<Job> {
    // TODO: call this.repo.update(...) and throw 404 if missing.
    throw new Error('Not implemented')
  }

  async remove(_id: string): Promise<void> {
    // TODO: call this.repo.delete(...) and throw 404 if missing.
    throw new Error('Not implemented')
  }
}

/** Default service instance. */
export const jobService = new JobService()
