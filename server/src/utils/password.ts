/**
 * Password hashing.
 *
 * bcrypt with a per-password salt. The cost factor is deliberately a constant
 * here rather than a setting — lowering it is never something you want done by
 * environment variable.
 */

import bcrypt from 'bcryptjs'

const COST_FACTOR = 12

/** Minimum accepted password length, enforced by the auth service. */
export const MIN_PASSWORD_LENGTH = 8

export function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, COST_FACTOR)
}

/**
 * Verify a password against a stored hash.
 *
 * `hash` is nullable because Google-only accounts have no password. Those must
 * never authenticate by password, so a null hash always fails — but only after
 * a dummy comparison, so the response time does not reveal which accounts have
 * passwords.
 */
export async function verifyPassword(plain: string, hash: string | null): Promise<boolean> {
  if (hash === null) {
    await bcrypt.compare(plain, DUMMY_HASH)
    return false
  }
  return bcrypt.compare(plain, hash)
}

/**
 * A valid bcrypt hash of a value no user can produce, compared against when no
 * account (or no password) exists so that login timing stays uniform.
 */
const DUMMY_HASH = '$2b$12$C6UzMDM.H6dfI/f/IKcEe.qkl0/9wRJEMEK4wSKAKPHTIu.qhLbDe'

/** Burn a comparison so a missing account costs the same as a wrong password. */
export async function fakeVerify(plain: string): Promise<void> {
  await bcrypt.compare(plain, DUMMY_HASH)
}
