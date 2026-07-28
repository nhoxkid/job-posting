import { createContext, useContext } from 'react'
import type { AuthUser } from '../api/auth'

export interface AuthContextValue {
  /** The signed-in user, or null when anonymous. */
  user: AuthUser | null
  /** True until the initial session check completes. */
  loading: boolean
  /** True when the server has Google sign-in configured. */
  googleEnabled: boolean
  login: (email: string, password: string) => Promise<AuthUser>
  register: (email: string, password: string) => Promise<AuthUser>
  loginWithGoogle: (idToken: string) => Promise<AuthUser>
  logout: () => Promise<void>
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider')
  return ctx
}
