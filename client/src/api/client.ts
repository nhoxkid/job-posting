/**
 * HTTP client (scaffold).
 *
 * TODO: implement request helpers (fetch or axios) with base URL, JSON
 * handling, and error normalisation. Feature API modules import from here.
 */

import { env } from '../lib/env'

export const apiClient = {
  baseUrl: env.apiBaseUrl,

  // TODO: implement, e.g.
  // get<T>(path: string): Promise<T> { ... }
  // post<T>(path: string, body: unknown): Promise<T> { ... }
  // patch<T>(path: string, body: unknown): Promise<T> { ... }
  // delete<T>(path: string): Promise<T> { ... }
}
