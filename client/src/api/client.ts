/**
 * HTTP client.
 *
 * Thin wrapper around `fetch` that prefixes the API base URL, serialises JSON
 * bodies and query params, and normalises errors into thrown `Error`s carrying
 * the server's message (from the `{ error: { message } }` envelope).
 */

import { env } from '../lib/env'

const BASE_URL = env.apiBaseUrl.replace(/\/$/, '')

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
    })
  } catch {
    throw new Error('Network error — is the API server running?')
  }

  if (res.status === 204) return undefined as T

  const isJson = res.headers.get('content-type')?.includes('application/json')
  const payload = isJson ? await res.json() : await res.text()

  if (!res.ok) {
    const message =
      isJson && payload?.error?.message
        ? payload.error.message
        : `Request failed with status ${res.status}`
    throw new Error(message)
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
