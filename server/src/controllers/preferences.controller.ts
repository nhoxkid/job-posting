/**
 * Preferences controller: the HTTP boundary.
 *
 * Reads input from the request, calls `preferencesService`, and shapes the
 * response. Errors are thrown as `ApiError` and translated by the error
 * middleware (handlers are wrapped in `asyncHandler`).
 */

import type { Request, Response } from 'express'
import { preferencesService } from '../services/preferences.service'

export const preferencesController = {
  get: async (_req: Request, res: Response): Promise<void> => {
    const preferences = await preferencesService.get()
    res.json(preferences)
  },

  update: async (req: Request, res: Response): Promise<void> => {
    const preferences = await preferencesService.update(req.body)
    res.json(preferences)
  },
}
