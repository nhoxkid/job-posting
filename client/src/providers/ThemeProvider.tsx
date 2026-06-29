import { useEffect, useState, type ReactNode } from 'react'
import { ThemeContext, type Theme } from './theme-context'

const STORAGE_KEY = 'theme'
const MEDIA = '(prefers-color-scheme: dark)'

export function ThemeProvider({ children }: { children: ReactNode }) {
  // RoleVault is a light-only design (no dark toggle in the UI); default to light.
  const [theme, setThemeState] = useState<Theme>(
    () => (localStorage.getItem(STORAGE_KEY) as Theme | null) ?? 'light',
  )
  const [systemDark, setSystemDark] = useState(() => window.matchMedia(MEDIA).matches)

  const resolvedTheme: 'light' | 'dark' =
    theme === 'system' ? (systemDark ? 'dark' : 'light') : theme

  // Sync the <html> class with the resolved theme (external system update).
  useEffect(() => {
    document.documentElement.classList.toggle('dark', resolvedTheme === 'dark')
  }, [resolvedTheme])

  // Subscribe to OS theme changes.
  useEffect(() => {
    const media = window.matchMedia(MEDIA)
    const onChange = (e: MediaQueryListEvent) => setSystemDark(e.matches)
    media.addEventListener('change', onChange)
    return () => media.removeEventListener('change', onChange)
  }, [])

  const setTheme = (next: Theme) => {
    localStorage.setItem(STORAGE_KEY, next)
    setThemeState(next)
  }

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}
