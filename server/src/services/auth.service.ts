/**
 * Auth service: registration, login, and Google sign-in.
 *
 * HTTP- and storage-agnostic — it validates input, applies the account rules,
 * and delegates persistence to the `UserRepository`. The controller owns
 * cookies; this layer only ever returns a `User`.
 */

import type { User } from '../models/user'
import { userRepository, type UserRepository } from '../repositories/user.repository'
import { ApiError } from '../utils/ApiError'
import { fakeVerify, hashPassword, MIN_PASSWORD_LENGTH, verifyPassword } from '../utils/password'
import { verifyGoogleIdToken } from './google.service'

/**
 * Deliberately vague: distinguishing "no such account" from "wrong password"
 * turns the login form into a test for whether an address is registered.
 */
const INVALID_CREDENTIALS = 'Invalid email or password'

/** Pragmatic shape check — real validity is proven by delivering mail. */
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/** Matches the column width in schema.sql. */
const MAX_EMAIL_LENGTH = 255

interface Credentials {
  email: string
  password: string
}

function parseCredentials(body: unknown, { checkStrength }: { checkStrength: boolean }): Credentials {
  if (typeof body !== 'object' || body === null) {
    throw ApiError.badRequest('Request body must be a JSON object')
  }
  const { email, password } = body as Record<string, unknown>

  if (typeof email !== 'string' || !EMAIL_PATTERN.test(email.trim())) {
    throw ApiError.badRequest('Enter a valid email address')
  }
  if (email.trim().length > MAX_EMAIL_LENGTH) {
    throw ApiError.badRequest(`Email must be at most ${MAX_EMAIL_LENGTH} characters`)
  }
  if (typeof password !== 'string' || password === '') {
    throw ApiError.badRequest('Password is required')
  }
  if (checkStrength && password.length < MIN_PASSWORD_LENGTH) {
    throw ApiError.badRequest(`Password must be at least ${MIN_PASSWORD_LENGTH} characters`)
  }

  return { email: email.trim(), password }
}

export class AuthService {
  constructor(private readonly repo: UserRepository = userRepository) {}

  /** Create a password-backed account. */
  async register(body: unknown): Promise<User> {
    const { email, password } = parseCredentials(body, { checkStrength: true })

    const existing = await this.repo.findByEmail(email)
    if (existing) {
      throw new ApiError(409, 'An account with that email already exists')
    }

    const displayName =
      typeof (body as Record<string, unknown>).displayName === 'string'
        ? ((body as Record<string, unknown>).displayName as string).trim() || null
        : null

    return this.repo.create({ email, passwordHash: await hashPassword(password), displayName })
  }

  /** Authenticate against a stored password hash. */
  async login(body: unknown): Promise<User> {
    const { email, password } = parseCredentials(body, { checkStrength: false })

    const user = await this.repo.findByEmail(email)
    if (!user) {
      // Spend the same time as a real comparison would.
      await fakeVerify(password)
      throw new ApiError(401, INVALID_CREDENTIALS)
    }

    if (!(await verifyPassword(password, user.passwordHash))) {
      throw new ApiError(401, INVALID_CREDENTIALS)
    }

    return user
  }

  /**
   * Sign in with a Google ID token, creating or linking an account.
   *
   * An existing password account with the same email gets the Google identity
   * attached rather than a second account created — the alternative is a user
   * who can never reach their own data because they picked the other button.
   */
  async loginWithGoogle(body: unknown): Promise<User> {
    const idToken =
      typeof body === 'object' && body !== null
        ? (body as Record<string, unknown>).idToken
        : undefined

    if (typeof idToken !== 'string' || idToken === '') {
      throw ApiError.badRequest('"idToken" is required')
    }

    const identity = await verifyGoogleIdToken(idToken)

    const byGoogleId = await this.repo.findByGoogleId(identity.googleId)
    if (byGoogleId) return byGoogleId

    const byEmail = await this.repo.findByEmail(identity.email)
    if (byEmail) {
      return this.repo.linkGoogle(byEmail.userId, {
        googleId: identity.googleId,
        displayName: identity.displayName,
        avatarUrl: identity.avatarUrl,
      })
    }

    return this.repo.createFromGoogle({
      email: identity.email,
      googleId: identity.googleId,
      displayName: identity.displayName,
      avatarUrl: identity.avatarUrl,
    })
  }

  /** Look up the account behind a session. */
  async findById(userId: number): Promise<User | null> {
    return this.repo.findById(userId)
  }
}

/** Default service instance. */
export const authService = new AuthService()
