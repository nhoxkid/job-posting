/**
 * Session state for the app.
 *
 * On mount it asks the server who the current session belongs to, so a page
 * refresh keeps you signed in — the cookie is httpOnly and cannot be read from
 * script, which makes the server the only source of truth.
 */

import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { authApi, type AuthUser } from '../api/auth'
import { AuthContext, type AuthContextValue } from './auth-context'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [googleEnabled, setGoogleEnabled] = useState(false)

  useEffect(() => {
    let cancelled = false

    void (async () => {
      const [currentUser, config] = await Promise.all([
        authApi.me(),
        authApi.config().catch(() => ({ googleEnabled: false })),
      ])
      if (cancelled) return
      setUser(currentUser)
      setGoogleEnabled(config.googleEnabled)
      setLoading(false)
    })()

    return () => {
      cancelled = true
    }
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    const { user: next } = await authApi.login(email, password)
    setUser(next)
    return next
  }, [])

  const register = useCallback(async (email: string, password: string) => {
    const { user: next } = await authApi.register(email, password)
    setUser(next)
    return next
  }, [])

  const loginWithGoogle = useCallback(async (idToken: string) => {
    const { user: next } = await authApi.google(idToken)
    setUser(next)
    return next
  }, [])

  const logout = useCallback(async () => {
    try {
      await authApi.logout()
    } finally {
      // Drop local state even if the request failed — the user asked to leave.
      setUser(null)
    }
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({ user, loading, googleEnabled, login, register, loginWithGoogle, logout }),
    [user, loading, googleEnabled, login, register, loginWithGoogle, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
