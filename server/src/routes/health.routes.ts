import { Router, type Request, type Response } from 'express'

export const healthRoutes = Router()

// GET /api/health — basic liveness check
healthRoutes.get('/', (_req: Request, res: Response) => {
  res.status(200).json({ status: 'ok' })
})
