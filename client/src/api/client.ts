/**
 * HTTP client.
 *
 * Thin wrapper around `fetch` that prefixes the API base URL, serialises JSON
 * bodies and query params, and normalises errors into thrown `Error`s carrying
 * the server's message (from the `{ error: { message } }` envelope).
 */

import { env } from '../lib/env'

const BASE_URL = env.apiBaseUrl.replace(/\/$/, '')

/** Carries the HTTP status, so callers can tell "not signed in" from "server broke". */
export class ApiError extends Error {
  // Declared and assigned separately: `erasableSyntaxOnly` rules out
  // constructor parameter properties.
  readonly status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

let onUnauthorized: (() => void) | null = null

/**
 * Registered by `AuthProvider` so an expired or revoked session is noticed the
 * moment any request comes back 401, instead of leaving a signed-out user with
 * a signed-in looking UI until the next full page load.
 */
export function setUnauthorizedHandler(handler: (() => void) | null) {
  onUnauthorized = handler
}

type QueryValue = string | number | boolean | undefined | null
export type QueryParams = Record<string, QueryValue>

function buildUrl(path: string, params?: QueryParams): string {
  const url = `${BASE_URL}${path.startsWith('/') ? path : `/${path}`}`
  if (!params) return url
  const search = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== '') {
      search.append(key, String(value))
    }
  }
  const qs = search.toString()
  return qs ? `${url}?${qs}` : url
}

async function request<T>(
  method: string,
  path: string,
  body?: unknown,
  params?: QueryParams,
): Promise<T> {
  let res: Response
  try {
    res = await fetch(buildUrl(path, params), {
      method,
      headers: body === undefined ? undefined : { 'Content-Type': 'application/json' },
      body: body === undefined ? undefined : JSON.stringify(body),
      // Send the httpOnly session cookie. The API runs on a different origin
      // in development (:5173 → :4000), so without this it is omitted and
      // every request looks anonymous.
      credentials: 'include',
    })
  } catch {
    throw new Error('Network error — is the API server running?')
  }

  if (res.status === 204) return undefined as T

  const isJson = res.headers.get('content-type')?.includes('application/json')
  const payload = isJson ? await res.json() : await res.text()

  if (!res.ok) {
    // The /auth/* endpoints are excluded: a 401 there is the normal answer for
    // an anonymous `me()` or a wrong password, not a session that just died.
    if (res.status === 401 && !path.startsWith('/auth/')) onUnauthorized?.()

    const message =
      isJson && payload?.error?.message
        ? payload.error.message
        : `Request failed with status ${res.status}`
    throw new ApiError(message, res.status)
  }

  return payload as T
}

export const apiClient = {
  baseUrl: BASE_URL,
  get: <T>(path: string, params?: QueryParams): Promise<T> =>
    request<T>('GET', path, undefined, params),
  post: <T>(path: string, body: unknown): Promise<T> => request<T>('POST', path, body),
  put: <T>(path: string, body: unknown): Promise<T> => request<T>('PUT', path, body),
  patch: <T>(path: string, body: unknown): Promise<T> => request<T>('PATCH', path, body),
  delete: <T>(path: string): Promise<T> => request<T>('DELETE', path),
}
