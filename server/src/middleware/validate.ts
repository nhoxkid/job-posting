import type { NextFunction, Request, Response } from 'express'

/**
 * Request validation middleware (scaffold).
 *
 * Wire this up to a schema library (zod, joi, yup, ...) of your choice. The
 * factory currently passes requests through untouched.
 *
 * Example target usage:
 *   jobRoutes.post('/', validate({ body: createJobSchema }), handler)
 */
export function validate(_schemas: { body?: unknown; query?: unknown; params?: unknown }) {
  return (_req: Request, _res: Response, next: NextFunction): void => {
    // TODO: validate _req against the provided schemas and call
    // next(ApiError.badRequest(...)) on failure.
    next()
  }
}
