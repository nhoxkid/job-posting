/**
 * User domain types.
 *
 * Plain TypeScript declarations only — no runtime logic.
 *
 * A user authenticates by password, by Google, or by both (a Google sign-in
 * whose email matches an existing password account links onto that row rather
 * than creating a duplicate). At least one credential must be present.
 */

export const USER_ROLES = ['applicant', 'admin'] as const

export type UserRole = (typeof USER_ROLES)[number]

/** A user as stored. `passwordHash` must never leave the server. */
export interface User {
  userId: number
  email: string
  passwordHash: string | null
  googleId: string | null
  displayName: string | null
  avatarUrl: string | null
  role: UserRole
  createdAt: string
}

/** The safe projection sent over the wire. */
export interface PublicUser {
  userId: number
  email: string
  displayName: string | null
  avatarUrl: string | null
  role: UserRole
  createdAt: string
}

/** Strips credentials from a `User` before it crosses the HTTP boundary. */
export function toPublicUser(user: User): PublicUser {
  return {
    userId: user.userId,
    email: user.email,
    displayName: user.displayName,
    avatarUrl: user.avatarUrl,
    role: user.role,
    createdAt: user.createdAt,
  }
}

/** Fields needed to create a password-backed account. */
export interface CreateUserInput {
  email: string
  passwordHash: string
  displayName?: string | null
}

/** Fields needed to create an account from a verified Google identity. */
export interface CreateGoogleUserInput {
  email: string
  googleId: string
  displayName?: string | null
  avatarUrl?: string | null
}

/** The identity carried inside a session token. */
export interface SessionPayload {
  sub: number
  email: string
  role: UserRole
}
