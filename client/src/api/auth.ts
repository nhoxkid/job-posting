/**
 * Auth API resource. Maps to the backend routes under `/api/auth`.
 *
 * The session lives in an httpOnly cookie set by the server, so there is no
 * token to store or attach here — `apiClient` sends the cookie automatically.
 */

import { apiClient } from './client'

export type UserRole = 'applicant' | 'admin'

export interface AuthUser {
  userId: number
  email: string
  displayName: string | null
  avatarUrl: string | null
  role: UserRole
  createdAt: string
}

interface AuthResponse {
  user: AuthUser
}

export const authApi = {
  register: (email: string, password: string): Promise<AuthResponse> =>
    apiClient.post<AuthResponse>('/auth/register', { email, password }),

  login: (email: string, password: string): Promise<AuthResponse> =>
    apiClient.post<AuthResponse>('/auth/login', { email, password }),

  /** Exchange a Google ID token for a session. */
  google: (idToken: string): Promise<AuthResponse> =>
    apiClient.post<AuthResponse>('/auth/google', { idToken }),

  logout: (): Promise<void> => apiClient.post<void>('/auth/logout', {}),

  /** Current user, or null when not signed in. */
  me: async (): Promise<AuthUser | null> => {
    try {
      const res = await apiClient.get<AuthResponse>('/auth/me')
      return res.user
    } catch {
      // 401 is the normal anonymous case, not an error worth surfacing.
      return null
    }
  },

  /** Whether the server has Google sign-in configured. */
  config: (): Promise<{ googleEnabled: boolean }> =>
    apiClient.get<{ googleEnabled: boolean }>('/auth/config'),
}
