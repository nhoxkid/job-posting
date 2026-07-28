/**
 * Session authentication middleware.
 *
 * Reads the httpOnly session cookie, verifies it, and attaches the identity to
 * `req.user`. Use `requireAuth` to protect a route; use `attachUser` when a
 * route serves both signed-in and anonymous callers.
 */

import type { NextFunction, Request, Response } from 'express'
import { env } from '../config/env'
import type { SessionPayload } from '../models/user'
import { verifySessionToken } from '../services/session.service'
import { ApiError } from '../utils/ApiError'

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      /** Set when a valid session cookie is present. */
      user?: SessionPayload
    }
  }
}

function readSession(req: Request): SessionPayload | null {
  const cookies = (req as Request & { cookies?: Record<string, string> }).cookies
  return verifySessionToken(cookies?.[env.sessionCookieName])
}

/** Populate `req.user` when signed in; never rejects. */
export function attachUser(req: Request, _res: Response, next: NextFunction): void {
  const session = readSession(req)
  if (session) req.user = session
  next()
}

/** Reject anonymous requests with 401. */
export function requireAuth(req: Request, _res: Response, next: NextFunction): void {
  const session = readSession(req)
  if (!session) {
    next(new ApiError(401, 'You must be signed in to do that'))
    return
  }
  req.user = session
  next()
}
