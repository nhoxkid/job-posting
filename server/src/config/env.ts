/**
 * Environment configuration.
 *
 * Loads variables from `.env` (via dotenv) and exposes them as a typed object.
 * Add new settings here as you wire up features (API keys, secrets, etc.).
 */

import { randomBytes } from 'node:crypto'
import dotenv from 'dotenv'

dotenv.config()

export const env = {
  nodeEnv: process.env.NODE_ENV ?? 'development',
  isProduction: process.env.NODE_ENV === 'production',

  // `::` binds dual-stack (IPv6 + IPv4-mapped). With `0.0.0.0` the server is
  // IPv4-only, and on Windows `localhost` resolves to ::1 first — so the
  // browser can fail to connect even though the port is open.
  host: process.env.HOST ?? '::',
  port: Number(process.env.PORT ?? 4000),

  // Comma-separated list of allowed origins, or `*`.
  corsOrigin: process.env.CORS_ORIGIN ?? '*',

  // Data source: 'memory' (default, no database required) or 'postgres'.
  dbDriver: (process.env.DB_DRIVER ?? 'memory') as 'memory' | 'postgres',

  // SQL database connection. See src/db/index.ts. Only used when dbDriver is 'postgres'.
  databaseUrl: process.env.DATABASE_URL ?? '',

  // Gemini settings for on-demand job summary generation.
  geminiApiKey: process.env.GEMINI_API_KEY ?? '',
  geminiModel: process.env.GEMINI_MODEL ?? 'gemini-3.6-flash',

  // Shared secret for GitHub Actions webhook ingest
  ingestSecret: process.env.INGEST_SECRET ?? '',

  /* ---------------------------------------------------------------------- */
  /* Auth                                                                    */
  /* ---------------------------------------------------------------------- */

  /**
   * Secret used to sign session JWTs. Production start-up fails without it
   * (see assertAuthConfig) — a default here would let a real deployment ship
   * with a publicly known signing key.
   */
  sessionSecret: process.env.SESSION_SECRET ?? '',

  /** Session lifetime, and the matching cookie max-age. */
  sessionTtlSeconds: Number(process.env.SESSION_TTL_SECONDS ?? 60 * 60 * 24 * 7),

  /** Name of the httpOnly session cookie. */
  sessionCookieName: process.env.SESSION_COOKIE_NAME ?? 'rv_session',

  /**
   * Google OAuth client id, from the Google Cloud console. When empty the
   * Google sign-in button degrades to a "not configured" state instead of
   * failing at request time.
   */
  googleClientId: process.env.GOOGLE_CLIENT_ID ?? '',
}

/** True when Google sign-in has been configured. */
export const isGoogleAuthEnabled = (): boolean => env.googleClientId !== ''

/**
 * Fails fast on an unusable auth configuration. Called from `server.ts` at
 * start-up so a misconfigured deployment never accepts a single request.
 */
export function assertAuthConfig(): void {
  if (env.sessionSecret) return

  if (env.isProduction) {
    throw new Error(
      'SESSION_SECRET must be set in production. Generate one with: node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'hex\'))"',
    )
  }

  // Development convenience: a random per-process secret. Sessions do not
  // survive a restart, which is an acceptable trade for not shipping a
  // hardcoded key.
  env.sessionSecret = randomBytes(32).toString('hex')
  console.warn(
    '[auth] SESSION_SECRET is not set — using a random development secret. ' +
      'Sessions will be invalidated on every restart. Set SESSION_SECRET in server/.env to persist them.',
  )
}
