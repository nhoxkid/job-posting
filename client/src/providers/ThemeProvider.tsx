import { useEffect, useState, type ReactNode } from 'react'
import { preferencesApi } from '../api/preferences'
import { ThemeContext, type Theme } from './theme-context'

const STORAGE_KEY = 'theme'
const MEDIA = '(prefers-color-scheme: dark)'
const THEMES: readonly Theme[] = ['light', 'dark', 'system']

/**
 * The stored choice, or null when this browser has never made one.
 *
 * Kept strict: an unrecognised value is treated as "no choice" rather than being
 * trusted, so a stale or hand-edited key can't put the app in an unknown state.
 *
 * Both accessors swallow storage errors. Safari throws on `localStorage` access
 * in Private Browsing and when cross-site tracking prevention blocks storage —
 * unguarded, that would take down the whole app at render time on a Mac.
 */
function readStoredTheme(): Theme | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw !== null && THEMES.includes(raw as Theme) ? (raw as Theme) : null
  } catch {
    return null
  }
}

function writeStoredTheme(theme: Theme): void {
  try {
    localStorage.setItem(STORAGE_KEY, theme)
  } catch {
    /* Storage unavailable — the choice still applies for this session. */
  }
}

/**
 * Subscribe to OS light/dark changes.
 *
 * `MediaQueryList` only gained `addEventListener` in Safari 14; before that it
 * was an `EventTarget`-less object with `addListener`. macOS users on older
 * Safari are exactly the people most likely to switch themes at sunset, so the
 * deprecated path is kept as a fallback.
 */
function subscribeToSystemTheme(onChange: (dark: boolean) => void): () => void {
  const media = window.matchMedia(MEDIA)
  const handler = (event: MediaQueryListEvent) => onChange(event.matches)

  if (typeof media.addEventListener === 'function') {
    media.addEventListener('change', handler)
    return () => media.removeEventListener('change', handler)
  }

  media.addListener(handler)
  return () => media.removeListener(handler)
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  // localStorage is the source of truth for a returning visitor: it is what the
  // pre-paint script in index.html reads, and it survives a server restart (the
  // default repository is in-memory). The backend is a mirror — every change is
  // written through to /api/preferences, but it never overrides a local choice.
  //
  // With no stored choice, follow the OS rather than assuming light.
  const [theme, setThemeState] = useState<Theme>(() => readStoredTheme() ?? 'system')
  const [systemDark, setSystemDark] = useState(() => window.matchMedia(MEDIA).matches)

  const resolvedTheme: 'light' | 'dark' =
    theme === 'system' ? (systemDark ? 'dark' : 'light') : theme

  // Sync the <html> class with the resolved theme — drives all `dark:` tokens.
  useEffect(() => {
    document.documentElement.classList.toggle('dark', resolvedTheme === 'dark')
    document.documentElement.style.colorScheme = resolvedTheme
  }, [resolvedTheme])

  // Subscribe to OS theme changes (only affects the 'system' choice).
  useEffect(() => subscribeToSystemTheme(setSystemDark), [])

  // Reconcile with the backend once on mount.
  //
  // If this browser has no stored choice, adopt whatever the server holds. If it
  // does, the local choice wins and we push it up instead — otherwise a server
  // that has forgotten its state (in-memory driver, restarted) would silently
  // reset a returning user back to light.
  useEffect(() => {
    const stored = readStoredTheme()

    if (stored !== null) {
      preferencesApi.update(stored).catch(() => {
        /* Reconciling upward failed; the local choice still applies. */
      })
      return
    }

    let active = true
    preferencesApi
      .get()
      .then((prefs) => {
        if (!active) return
        setThemeState(prefs.theme)
        writeStoredTheme(prefs.theme)
      })
      .catch(() => {
        /* API unavailable — keep following the OS. */
      })
    return () => {
      active = false
    }
  }, [])

  const setTheme = (next: Theme) => {
    writeStoredTheme(next)
    setThemeState(next)
    // Mirror to the backend. Fire-and-forget: the local write already stuck.
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
