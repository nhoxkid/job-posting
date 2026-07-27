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
 *
 * The `hero*` keys cover the dark-on-dark chrome (the Landing hero band and the
 * nav that sits on it). That band is already dark in light mode, so it does NOT
 * invert in dark mode — it goes deeper, staying darker than `pageBg` so the two
 * never flatten into each other.
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

  /* Dark chrome (hero band + the nav rendered on top of it). */
  heroGradient: string
  heroInk: string
  heroInkMuted: string
  heroChipBg: string
  heroBorder: string
  heroAccent: string
  heroGlow: string
  heroInkFaint: string
  heroTitleGradient: string
  auroraA: string
  auroraB: string
  heroDot: string
  footerGradient: string
  heroPanelGradient: string

  /* Content surfaces that float on the hero band. */
  floatCardBg: string
  matchBarFill: string
  featureGlow: string

  /* Brand call-to-action — constant across themes. */
  buttonGradient: string
  buttonInk: string
  buttonShadow: string
  logoGradient: string

  /* Sticky app nav on the inner screens (translucent over scrolling content). */
  navBg: string

  /* Solid accent button (filled, not the brand gradient). */
  accentButtonBg: string
  accentButtonInk: string

  /* Destructive / error affordances. */
  danger: string
  dangerBorder: string
  dangerSoftBg: string

  /* Interaction states. */
  rowHover: string
  borderHover: string
  shadowHover: string
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

  heroGradient: 'linear-gradient(168deg,#0C4030 0%,#072A1E 52%,#08231A 100%)',
  heroInk: '#FFFFFF',
  heroInkMuted: 'rgba(255,255,255,0.82)',
  heroChipBg: 'rgba(255,255,255,0.08)',
  heroBorder: 'rgba(255,255,255,0.18)',
  heroAccent: '#BFF3D8',
  heroGlow: '#5FD6A0',
  heroInkFaint: 'rgba(255,255,255,0.52)',
  heroTitleGradient: 'linear-gradient(100deg,#7CE7B0,#5FD6A0,#9BE8FF)',
  auroraA: 'radial-gradient(circle,rgba(95,214,160,0.42),rgba(95,214,160,0) 62%)',
  auroraB: 'radial-gradient(circle,rgba(46,160,180,0.34),rgba(46,160,180,0) 60%)',
  heroDot: 'rgba(255,255,255,0.07)',
  footerGradient: 'linear-gradient(168deg,#0C4030,#08231A)',
  heroPanelGradient: 'linear-gradient(150deg,#0C4030,#08231A)',

  floatCardBg: 'rgba(255,255,255,0.97)',
  matchBarFill: 'linear-gradient(90deg,#46C98A,#12805A)',
  featureGlow: 'radial-gradient(circle,rgba(95,214,160,0.18),transparent 70%)',

  buttonGradient: 'linear-gradient(180deg,#7CE7B0,#46C98A)',
  buttonInk: '#06281D',
  buttonShadow: '0 8px 20px -6px rgba(70,201,138,0.6)',
  logoGradient: 'linear-gradient(140deg,#33C386,#0E4D37)',

  navBg: 'rgba(255,255,255,0.9)',
  danger: '#B23B32',
  dangerBorder: '#F0D2CF',
  dangerSoftBg: '#FBECEC',
  accentButtonBg: '#1A7A52',
  accentButtonInk: '#FFFFFF',

  rowHover: '#F7FBF8',
  borderHover: '#CDE3D6',
  shadowHover: '0 10px 26px rgba(16,33,27,0.08)',
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

  // Deeper than `pageBg` so the hero band still reads as a distinct surface.
  heroGradient: 'linear-gradient(168deg,#062B1F 0%,#031A12 52%,#02120C 100%)',
  heroInk: '#F1F7F4',
  heroInkMuted: 'rgba(241,247,244,0.74)',
  heroChipBg: 'rgba(255,255,255,0.06)',
  heroBorder: 'rgba(255,255,255,0.13)',
  heroAccent: '#9FE9C4',
  heroGlow: '#5FD6A0',
  heroInkFaint: 'rgba(241,247,244,0.44)',
  heroTitleGradient: 'linear-gradient(100deg,#7CE7B0,#5FD6A0,#9BE8FF)',
  auroraA: 'radial-gradient(circle,rgba(95,214,160,0.26),rgba(95,214,160,0) 62%)',
  auroraB: 'radial-gradient(circle,rgba(46,160,180,0.20),rgba(46,160,180,0) 60%)',
  heroDot: 'rgba(255,255,255,0.05)',
  footerGradient: 'linear-gradient(168deg,#062B1F,#02120C)',
  heroPanelGradient: 'linear-gradient(150deg,#062B1F,#02120C)',

  floatCardBg: '#0C2C22',
  matchBarFill: 'linear-gradient(90deg,#7CE7B0,#46C98A)',
  featureGlow: 'radial-gradient(circle,rgba(95,214,160,0.10),transparent 70%)',

  buttonGradient: 'linear-gradient(180deg,#7CE7B0,#46C98A)',
  buttonInk: '#06281D',
  buttonShadow: '0 8px 20px -6px rgba(70,201,138,0.45)',
  logoGradient: 'linear-gradient(140deg,#33C386,#0E4D37)',

  navBg: 'rgba(12,44,34,0.9)',
  danger: '#EF6A60',
  dangerBorder: '#5C2723',
  dangerSoftBg: 'rgba(239,106,96,0.14)',
  accentButtonBg: '#46C98A',
  accentButtonInk: '#06281D',

  rowHover: '#10342A',
  borderHover: '#2A6350',
  shadowHover: '0 10px 26px rgba(0,0,0,0.5)',
}

/** The colour set for the active theme. Re-renders when the theme changes. */
export function usePalette(): Palette {
  return useTheme().resolvedTheme === 'dark' ? dark : light
}
