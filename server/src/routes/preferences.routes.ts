import { Router } from 'express'
import { preferencesController } from '../controllers/preferences.controller'
import { asyncHandler } from '../utils/asyncHandler'

export const preferencesRoutes = Router()

// GET /api/preferences — read the current UI preferences (e.g. theme)
preferencesRoutes.get('/', asyncHandler(preferencesController.get))

// PUT /api/preferences — persist the UI preferences
preferencesRoutes.put('/', asyncHandler(preferencesController.update))
