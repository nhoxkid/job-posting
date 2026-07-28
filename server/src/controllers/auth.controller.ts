/**
 * Auth controller: the HTTP boundary for accounts.
 *
 * Calls `authService`, then issues or clears the session cookie. Responses
 * always carry the safe `PublicUser` projection — never a password hash.
 */

import type { Request, Response } from 'express'
import { isGoogleAuthEnabled } from '../config/env'
import { toPublicUser } from '../models/user'
import { authService } from '../services/auth.service'
import { clearSessionCookie, setSessionCookie } from '../services/session.service'
import { ApiError } from '../utils/ApiError'

export const authController = {
  register: async (req: Request, res: Response): Promise<void> => {
    const user = await authService.register(req.body)
    setSessionCookie(res, user)
    res.status(201).json({ user: toPublicUser(user) })
  },

  login: async (req: Request, res: Response): Promise<void> => {
    const user = await authService.login(req.body)
    setSessionCookie(res, user)
    res.json({ user: toPublicUser(user) })
  },

  google: async (req: Request, res: Response): Promise<void> => {
    const user = await authService.loginWithGoogle(req.body)
    setSessionCookie(res, user)
    res.json({ user: toPublicUser(user) })
  },

  logout: async (_req: Request, res: Response): Promise<void> => {
    clearSessionCookie(res)
    res.status(204).end()
  },

  /** The signed-in user behind the current session cookie. */
  me: async (req: Request, res: Response): Promise<void> => {
    if (!req.user) throw new ApiError(401, 'Not signed in')

    const user = await authService.findById(req.user.sub)
    if (!user) {
      // Session is validly signed but the account is gone (deleted, or an
      // in-memory store that restarted). Treat it as signed out.
      clearSessionCookie(res)
      throw new ApiError(401, 'Not signed in')
    }

    res.json({ user: toPublicUser(user) })
  },

  /** Lets the client decide whether to render the Google button. */
  config: async (_req: Request, res: Response): Promise<void> => {
    res.json({ googleEnabled: isGoogleAuthEnabled() })
  },
}
