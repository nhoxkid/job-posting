/**
 * Job controller: the HTTP boundary.
 *
 * Each handler reads input from the request, calls `jobService`, and shapes the
 * response. Errors are thrown as `ApiError` and translated by the error
 * middleware (handlers are wrapped in `asyncHandler`).
 */

import type { Request, Response } from 'express'
import { jobService, parseJobQuery } from '../services/job.service'

export const jobController = {
  list: async (req: Request, res: Response): Promise<void> => {
    // Query parsing lives in the service so it is covered by the same tests as
    // the filtering it feeds, and so the controller stays a thin boundary.
    const result = await jobService.list(parseJobQuery(req.query as Record<string, unknown>))
    res.json(result)
  },

  getById: async (req: Request, res: Response): Promise<void> => {
    const job = await jobService.getById(req.params.id)
    res.json(job)
  },

  create: async (req: Request, res: Response): Promise<void> => {
    const job = await jobService.create(req.body)
    res.status(201).json(job)
  },

  update: async (req: Request, res: Response): Promise<void> => {
    const job = await jobService.update(req.params.id, req.body)
    res.json(job)
  },

  remove: async (req: Request, res: Response): Promise<void> => {
    await jobService.remove(req.params.id)
    res.status(204).end()
  },
}
