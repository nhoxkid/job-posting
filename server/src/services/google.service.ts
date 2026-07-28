/**
 * Google identity verification.
 *
 * The client performs the sign-in and sends us the resulting ID token. We never
 * trust its contents until `google-auth-library` has checked the signature
 * against Google's published keys and confirmed the token was issued for *our*
 * client id — otherwise a token minted for any other site would be accepted.
 *
 * `verifier` is exported as a mutable seam so tests can substitute a stub
 * without reaching the network.
 */

import { OAuth2Client } from 'google-auth-library'
import { env, isGoogleAuthEnabled } from '../config/env'
import { ApiError } from '../utils/ApiError'

/** The subset of Google's verified claims this app uses. */
export interface GoogleIdentity {
  googleId: string
  email: string
  emailVerified: boolean
  displayName: string | null
  avatarUrl: string | null
}

export interface GoogleVerifier {
  verify(idToken: string): Promise<GoogleIdentity>
}

class LiveGoogleVerifier implements GoogleVerifier {
  private client = new OAuth2Client(env.googleClientId)

  async verify(idToken: string): Promise<GoogleIdentity> {
    const ticket = await this.client.verifyIdToken({
      idToken,
      audience: env.googleClientId,
    })
    const payload = ticket.getPayload()
    if (!payload?.sub || !payload.email) {
      throw ApiError.badRequest('Google token is missing required profile fields')
    }
    return {
      googleId: payload.sub,
      email: payload.email,
      emailVerified: payload.email_verified === true,
      displayName: payload.name ?? null,
      avatarUrl: payload.picture ?? null,
    }
  }
}

/** Swappable verifier. Replace in tests; leave alone in production code. */
export let verifier: GoogleVerifier = new LiveGoogleVerifier()

/** Test seam. */
export function setGoogleVerifier(next: GoogleVerifier): void {
  verifier = next
}

/**
 * Verify a Google ID token and return the identity it proves.
 *
 * Throws 503 when Google sign-in has not been configured, and 401 when the
 * token does not check out.
 */
export async function verifyGoogleIdToken(idToken: string): Promise<GoogleIdentity> {
  if (!isGoogleAuthEnabled()) {
    throw new ApiError(
      503,
      'Google sign-in is not configured on this server. Set GOOGLE_CLIENT_ID to enable it.',
    )
  }

  let identity: GoogleIdentity
  try {
    identity = await verifier.verify(idToken)
  } catch (err) {
    if (err instanceof ApiError) throw err
    throw new ApiError(401, 'Could not verify Google sign-in. Please try again.')
  }

  // An unverified Google address could belong to someone else; accepting it
  // would let an attacker claim another person's account by email.
  if (!identity.emailVerified) {
    throw new ApiError(401, 'Your Google account email is not verified.')
  }

  return identity
}
