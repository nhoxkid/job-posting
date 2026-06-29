import { useTheme } from '../../providers/theme-context'

/**
 * Theme switcher used in the app chrome. A single button that toggles between
 * light and dark: it shows a sun in light mode and a moon in dark mode, and
 * each click flips to the other. Styled with inline styles (rather than Tailwind
 * tokens) so it reads correctly on both the light nav bar and dark chrome via
 * `resolvedTheme`.
 */
export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme()
  const dark = resolvedTheme === 'dark'

  return (
    <button
      type="button"
      onClick={() => setTheme(dark ? 'light' : 'dark')}
      title={dark ? 'Switch to light mode' : 'Switch to dark mode'}
      aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
      aria-pressed={dark}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: 38,
        height: 38,
        borderRadius: 11,
        cursor: 'pointer',
        color: dark ? '#5FD6A0' : '#12805A',
        background: dark ? 'rgba(95,214,160,0.10)' : '#fff',
        border: `1.5px solid ${dark ? '#1C4334' : '#CFE6D9'}`,
        transition: 'color 0.2s, background 0.2s, border-color 0.2s',
      }}
    >
      {dark ? <MoonIcon /> : <SunIcon />}
    </button>
  )
}

const iconProps = {
  width: 18,
  height: 18,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true,
}

function SunIcon() {
  return (
    <svg {...iconProps}>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
    </svg>
  )
}

function MoonIcon() {
  return (
    <svg {...iconProps}>
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  )
}
