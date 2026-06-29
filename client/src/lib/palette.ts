/**
 * Theme palette for the design screens.
 *
 * The RoleVault screens are styled with inline styles (for pixel-faithful
 * gradients/shadows), so they can't lean on the Tailwind `dark:` tokens the way
 * the `components/ui/*` primitives do. This hook gives those screens a single,
 * semantic colour set that swaps with the active theme — map every hard-coded
 * hex to a palette key and the screen themes itself.
 *
 * Mapping reference (light hex → key) used when porting a screen:
 *   #F6F8F5 page background      → pageBg
 *   #F6F8F5 / fill inside a card → surfaceMuted
 *   #FFFFFF card                 → surface
 *   #E6ECE7 / #CFD8D3 border     → border
 *   #EEF2EF / #F2F5F3 hairline   → borderSubtle
 *   #0A1410 strongest text       → ink
 *   #46554F secondary text       → body
 *   #7A8780 / #8B988F / #9AA8A2  → muted
 *   #12805A brand green          → accent
 *   #E7F3EC green chip bg        → accentSoftBg
 *   #CFE6D9 green button border   → accentBorder
 *   #F1F4F2 neutral chip bg      → chipBg
 *   box-shadow                   → shadow
 */

import { useTheme } from '../providers/theme-context'

export interface Palette {
  isDark: boolean
  pageBg: string
  surface: string
  surfaceMuted: string
  border: string
  borderSubtle: string
  ink: string
  body: string
  muted: string
  accent: string
  accentSoftBg: string
  accentBorder: string
  chipBg: string
  shadow: string
}

const light: Palette = {
  isDark: false,
  pageBg: '#F6F8F5',
  surface: '#FFFFFF',
  surfaceMuted: '#F6F8F5',
  border: '#E6ECE7',
  borderSubtle: '#EEF2EF',
  ink: '#0A1410',
  body: '#46554F',
  muted: '#7A8780',
  accent: '#12805A',
  accentSoftBg: '#E7F3EC',
  accentBorder: '#CFE6D9',
  chipBg: '#F1F4F2',
  shadow: '0 1px 2px rgba(10,20,16,0.04)',
}

const dark: Palette = {
  isDark: true,
  pageBg: '#08231A',
  surface: '#0C2C22',
  surfaceMuted: '#10342A',
  border: '#1C4334',
  borderSubtle: '#16382C',
  ink: '#F1F7F4',
  body: '#B8CEC4',
  muted: '#8AA399',
  accent: '#5FD6A0',
  accentSoftBg: 'rgba(95,214,160,0.13)',
  accentBorder: '#225141',
  chipBg: '#12352A',
  shadow: '0 1px 2px rgba(0,0,0,0.45)',
}

/** The colour set for the active theme. Re-renders when the theme changes. */
export function usePalette(): Palette {
  return useTheme().resolvedTheme === 'dark' ? dark : light
}
