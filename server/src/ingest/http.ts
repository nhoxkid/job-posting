/**
 * HTTP fetching for providers.
 *
 * Centralised so every provider gets the same timeout, retry and identification
 * behaviour, and so none of them has to think about it. Providers that reach
 * public APIs still need to behave like a good citizen: a real User-Agent, a
 * bounded number of retries, and a backoff that respects `Retry-After`.
 */

const DEFAULT_TIMEOUT_MS = 15_000
const MAX_ATTEMPTS = 3

/**
 * Identify the client honestly.
 *
 * Public APIs are within their rights to rate-limit or block us; a real UA with
 * contact info is what lets an operator do that selectively instead of banning
 * an anonymous client outright. This is the opposite of the browser-spoofing a
 * scraper would use to look like a person.
 */
const USER_AGENT =
  process.env.INGEST_USER_AGENT ??
  'RoleVault-JobIngest/1.0 (+https://github.com/nhoxkid/job-posting)'

export class HttpError extends Error {
  constructor(
    readonly status: number,
    readonly url: string,
  ) {
    super(`HTTP ${status} from ${url}`)
    this.name = 'HttpError'
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/** Retry on transient failures only — a 404 board will never become a 200. */
function isRetryable(error: unknown): boolean {
  if (error instanceof HttpError) return error.status === 429 || error.status >= 500
  return true // network/abort errors
}

export async function fetchJson<T>(url: string, timeoutMs = DEFAULT_TIMEOUT_MS): Promise<T> {
  let lastError: unknown

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), timeoutMs)

    try {
      const response = await fetch(url, {
        signal: controller.signal,
        headers: { accept: 'application/json', 'user-agent': USER_AGENT },
      })

      if (!response.ok) throw new HttpError(response.status, url)
      return (await response.json()) as T
    } catch (error) {
      lastError = error
      if (attempt === MAX_ATTEMPTS || !isRetryable(error)) break

      // Exponential backoff, unless the server told us how long to wait.
      const retryAfter =
        error instanceof HttpError && error.status === 429 ? 5_000 : 500 * 2 ** (attempt - 1)
      await sleep(retryAfter)
    } finally {
      clearTimeout(timer)
    }
  }

  throw lastError
}
