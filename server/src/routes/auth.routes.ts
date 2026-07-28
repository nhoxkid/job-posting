import { Router } from 'express'
import { authController } from '../controllers/auth.controller'
import { requireAuth } from '../middleware/requireAuth'
import { asyncHandler } from '../utils/asyncHandler'

export const authRoutes = Router()

// GET /api/auth/config — whether Google sign-in is available on this server
authRoutes.get('/config', asyncHandler(authController.config))

// POST /api/auth/register — create an account and start a session
authRoutes.post('/register', asyncHandler(authController.register))

// POST /api/auth/login — start a session from email + password
authRoutes.post('/login', asyncHandler(authController.login))

// POST /api/auth/google — start a session from a verified Google ID token
authRoutes.post('/google', asyncHandler(authController.google))

// POST /api/auth/logout — clear the session cookie
authRoutes.post('/logout', asyncHandler(authController.logout))

// GET /api/auth/me — the currently signed-in user
authRoutes.get('/me', requireAuth, asyncHandler(authController.me))
