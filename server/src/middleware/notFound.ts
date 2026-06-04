import type { NextFunction, Request, Response } from 'express'
import { ApiError } from '../utils/ApiError'

/** Forwards a 404 for any unmatched route. */
export function notFound(req: Request, _res: Response, next: NextFunction): void {
  next(ApiError.notFound(`Route not found: ${req.method} ${req.originalUrl}`))
}
