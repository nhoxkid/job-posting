/**
 * Job controller: the HTTP boundary.
 *
 * Each handler reads input from the request, calls `jobService`, and shapes the
 * response. Errors are thrown as `ApiError` and translated by the error
 * middleware (handlers are wrapped in `asyncHandler`).
 */

import type { Request, Response } from 'express'
import type { JobQuery, JobType, WorkModel } from '../models/job'
import { jobService } from '../services/job.service'

/** Parse and coerce list query params from their string representations. */
function parseListQuery(q: Request['query']): JobQuery {
  const query: JobQuery = {}

  if (typeof q.search === 'string' && q.search.trim()) query.search = q.search.trim()
  if (typeof q.jobType === 'string') query.jobType = q.jobType as JobType
  if (typeof q.workModel === 'string') query.workModel = q.workModel as WorkModel
  if (typeof q.sponsorship === 'string') query.sponsorship = q.sponsorship === 'true'
  if (typeof q.active === 'string') query.active = q.active === 'true'

  const page = Number(q.page)
  if (Number.isFinite(page) && page > 0) query.page = page
  const pageSize = Number(q.pageSize)
  if (Number.isFinite(pageSize) && pageSize > 0) query.pageSize = pageSize

  return query
}

export const jobController = {
  list: async (req: Request, res: Response): Promise<void> => {
    const result = await jobService.list(parseListQuery(req.query))
    res.json(result)
  },

  getById: async (req: Request, res: Response): Promise<void> => {
    const id = Number(req.params.id)
    if (!Number.isFinite(id)) {
      res.status(400).json({ error: 'Invalid job ID' })
      return
    }
    const job = await jobService.getById(id)
    res.json(job)
  },

  create: async (req: Request, res: Response): Promise<void> => {
    const job = await jobService.create(req.body)
    res.status(201).json(job)
  },

  update: async (req: Request, res: Response): Promise<void> => {
    const id = Number(req.params.id)
    if (!Number.isFinite(id)) {
      res.status(400).json({ error: 'Invalid job ID' })
      return
    }
    const job = await jobService.update(id, req.body)
    res.json(job)
  },

  remove: async (req: Request, res: Response): Promise<void> => {
    const id = Number(req.params.id)
    if (!Number.isFinite(id)) {
      res.status(400).json({ error: 'Invalid job ID' })
      return
    }
    await jobService.remove(id)
    res.status(204).end()
  },
}
