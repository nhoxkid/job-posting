/**
 * Preferences API resource. Maps to the backend routes under `/api/preferences`.
 *
 * Currently just the UI theme; the shape mirrors the server's `Preferences`.
 */

import type { Theme } from '../providers/theme-context'
import { apiClient } from './client'

export interface Preferences {
  id: string
  theme: Theme
  updatedAt: string
}

export const preferencesApi = {
  get: (): Promise<Preferences> => apiClient.get<Preferences>('/preferences'),

  update: (theme: Theme): Promise<Preferences> =>
    apiClient.put<Preferences>('/preferences', { theme }),
}
