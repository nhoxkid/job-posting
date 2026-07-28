import { usePalette } from '../../lib/palette'
import { useTheme } from '../../providers/theme-context'

/**
 * Theme switcher used in the app chrome.
 *
 * A sliding pill: the track shows a sun on the left and a moon on the right, and
 * a knob slides between them. Both icons stay visible so the control reads as a
 * switch rather than an icon button.
 *
 * Two variants, because the switch sits on two very different backgrounds:
 *   - `onDark`  — translucent white-on-dark, for the nav over the hero band.
 *   - `onLight` — light chrome, for the inner screens.
 *
 * Styled with inline styles (rather than Tailwind tokens) to match the screens
 * it is mounted in, which are inline-styled for pixel-faithful gradients.
 */

const TRACK_W = 62
const TRACK_H = 32
const KNOB = 26
const PAD = 3

export function ThemeToggle({ variant = 'onLight' }: { variant?: 'onDark' | 'onLight' }) {
  const { resolvedTheme, setTheme } = useTheme()
  const p = usePalette()
  const dark = resolvedTheme === 'dark'
  const onDark = variant === 'onDark'

  const trackBg = onDark ? p.heroChipBg : dark ? p.surfaceMuted : p.surface
  const trackBorder = onDark ? p.heroBorder : dark ? p.border : p.accentBorder
  // The knob sits on the icon it has slid onto, so it carries the accent colour.
  const knobBg = onDark ? 'rgba(255,255,255,0.92)' : dark ? p.accent : p.accent
  const knobInk = onDark ? '#06281D' : dark ? '#06281D' : '#FFFFFF'
  const iconIdle = onDark ? 'rgba(255,255,255,0.55)' : dark ? p.muted : p.accentBorder

  return (
    <button
      type="button"
      role="switch"
      onClick={() => setTheme(dark ? 'light' : 'dark')}
      title={dark ? 'Switch to light mode' : 'Switch to dark mode'}
      aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
      aria-checked={dark}
      style={{
        position: 'relative',
        display: 'inline-flex',
        alignItems: 'center',
        flexShrink: 0,
        width: TRACK_W,
        height: TRACK_H,
        padding: PAD,
        borderRadius: 999,
        cursor: 'pointer',
        background: trackBg,
        border: `1.5px solid ${trackBorder}`,
        // Safari only honours the -webkit- prefixed property.
        WebkitBackdropFilter: onDark ? 'blur(8px)' : undefined,
        backdropFilter: onDark ? 'blur(8px)' : undefined,
        transition: 'background 0.2s, border-color 0.2s',
      }}
    >
      {/* Sliding knob, behind the icons so the active one reads on top of it. */}
      <span
        aria-hidden="true"
        style={{
          position: 'absolute',
          top: PAD,
          left: PAD,
          width: KNOB,
          height: KNOB,
          borderRadius: '50%',
          background: knobBg,
          boxShadow: '0 2px 6px rgba(0,0,0,0.22)',
          transform: `translateX(${dark ? TRACK_W - KNOB - PAD * 2 - 3 : 0}px)`,
          transition: 'transform 0.2s ease, background 0.2s',
        }}
      />
      <span
        aria-hidden="true"
        style={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: '100%',
          padding: '0 5px',
        }}
      >
        <SunIcon color={dark ? iconIdle : knobInk} />
        <MoonIcon color={dark ? knobInk : iconIdle} />
      </span>
    </button>
  )
}

const iconProps = {
  width: 15,
  height: 15,
  viewBox: '0 0 24 24',
  fill: 'none',
  strokeWidth: 2,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true,
  style: { transition: 'stroke 0.2s', display: 'block' },
}

function SunIcon({ color }: { color: string }) {
  return (
    <svg {...iconProps} stroke={color}>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
    </svg>
  )
}

function MoonIcon({ color }: { color: string }) {
  return (
    <svg {...iconProps} stroke={color}>
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  )
}
