/**
 * Centralised, typed access to build-time environment variables.
 *
 * Vite exposes variables prefixed with `VITE_` on `import.meta.env`.
 */

export const env = {
  /** Base URL of the backend API. Falls back to the local dev server. */
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:4000/api',
  /**
   * Google OAuth client id. Must match the server's GOOGLE_CLIENT_ID; when
   * empty the Google button renders in a disabled "not configured" state.
   */
  googleClientId: (import.meta.env.VITE_GOOGLE_CLIENT_ID ?? '') as string,
  /** Current mode (`development` | `production` | `test`). */
  mode: import.meta.env.MODE,
  isDev: import.meta.env.DEV,
  isProd: import.meta.env.PROD,
} as const
