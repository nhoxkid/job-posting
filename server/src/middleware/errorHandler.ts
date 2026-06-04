/**
 * Central error-handling middleware.
 *
 * Translates thrown errors into a consistent JSON envelope:
 *   { "error": { "message": string, "details"?: unknown } }
 */

import type { NextFunction, Request, Response } from 'express'
import { env } from '../config/env'
import { ApiError } from '../utils/ApiError'

// Express identifies error handlers by their 4-arg arity; `_next` must stay.
export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (err instanceof ApiError) {
    res.status(err.statusCode).json({
      error: { message: err.message, ...(err.details ? { details: err.details } : {}) },
    })
    return
  }

  const message = err instanceof Error ? err.message : 'Unknown error'
  res.status(500).json({
    error: { message: env.isProduction ? 'Internal server error' : message },
  })
}
