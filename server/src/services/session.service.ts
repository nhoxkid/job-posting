/**
 * Session tokens and the cookie that carries them.
 *
 * The session is a signed JWT delivered in an httpOnly cookie, so page scripts
 * cannot read it. Nothing outside this module should know the cookie's name or
 * options — handlers call `setSessionCookie` / `clearSessionCookie`.
 */

import type { CookieOptions, Response } from 'express'
import jwt from 'jsonwebtoken'
import { env } from '../config/env'
import type { SessionPayload, User, UserRole } from '../models/user'

function cookieOptions(): CookieOptions {
  return {
    httpOnly: true,
    // `lax` still sends the cookie on top-level navigation back from Google.
    sameSite: 'lax',
    // Requires HTTPS in production; must stay off for http://localhost.
    secure: env.isProduction,
    path: '/',
    maxAge: env.sessionTtlSeconds * 1000,
  }
}

/** Sign a session token for a user. */
export function createSessionToken(user: User): string {
  const payload: SessionPayload = { sub: user.userId, email: user.email, role: user.role }
  return jwt.sign(payload, env.sessionSecret, { expiresIn: env.sessionTtlSeconds })
}

/** Verify a session token, returning null when absent, invalid, or expired. */
export function verifySessionToken(token: string | undefined): SessionPayload | null {
  if (!token) return null
  try {
    const decoded = jwt.verify(token, env.sessionSecret)
    if (typeof decoded === 'string' || decoded === null) return null
    const { sub, email, role } = decoded as Record<string, unknown>
    if (typeof sub !== 'number' || typeof email !== 'string' || typeof role !== 'string') {
      return null
    }
    return { sub, email, role: role as UserRole }
  } catch {
    // Bad signature, malformed token, or expired — all mean "not signed in".
    return null
  }
}

/** Issue the session cookie for a freshly authenticated user. */
export function setSessionCookie(res: Response, user: User): void {
  res.cookie(env.sessionCookieName, createSessionToken(user), cookieOptions())
}

/** Remove the session cookie. Options must match those used to set it. */
export function clearSessionCookie(res: Response): void {
  const { maxAge: _maxAge, ...options } = cookieOptions()
  res.clearCookie(env.sessionCookieName, options)
}
