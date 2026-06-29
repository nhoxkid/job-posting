import { useEffect, useState, type ReactNode } from 'react'
import { preferencesApi } from '../api/preferences'
import { ThemeContext, type Theme } from './theme-context'

const STORAGE_KEY = 'theme'
const MEDIA = '(prefers-color-scheme: dark)'

export function ThemeProvider({ children }: { children: ReactNode }) {
  // localStorage is the instant-paint cache (no flash on reload); the backend
  // is the canonical store, hydrated once on mount below. Default to light.
  const [theme, setThemeState] = useState<Theme>(
    () => (localStorage.getItem(STORAGE_KEY) as Theme | null) ?? 'light',
  )
  const [systemDark, setSystemDark] = useState(() => window.matchMedia(MEDIA).matches)

  const resolvedTheme: 'light' | 'dark' =
    theme === 'system' ? (systemDark ? 'dark' : 'light') : theme

  // Sync the <html> class with the resolved theme — drives all `dark:` tokens.
  useEffect(() => {
    document.documentElement.classList.toggle('dark', resolvedTheme === 'dark')
  }, [resolvedTheme])

  // Subscribe to OS theme changes (only affects the 'system' choice).
  useEffect(() => {
    const media = window.matchMedia(MEDIA)
    const onChange = (e: MediaQueryListEvent) => setSystemDark(e.matches)
    media.addEventListener('change', onChange)
    return () => media.removeEventListener('change', onChange)
  }, [])

  // Hydrate from the backend once. Adopts the stored preference and refreshes
  // the local cache. Silently ignored if the API is unreachable (offline-safe).
  useEffect(() => {
    let active = true
    preferencesApi
      .get()
      .then((prefs) => {
        if (!active) return
        setThemeState(prefs.theme)
        localStorage.setItem(STORAGE_KEY, prefs.theme)
      })
      .catch(() => {
        /* API unavailable — keep the local/default theme. */
      })
    return () => {
      active = false
    }
  }, [])

  const setTheme = (next: Theme) => {
    localStorage.setItem(STORAGE_KEY, next)
    setThemeState(next)
    // Persist for later use (cross-device / future per-user sync). Fire-and-forget.
    preferencesApi.update(next).catch(() => {
      /* Persisting the preference failed; the local choice still applies. */
    })
  }

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}
