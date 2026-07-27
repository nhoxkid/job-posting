# Dark / Light Mode — Design

**Date:** 2026-07-27
**Status:** Approved

## Problem

RoleVault ships a complete theme system that nothing uses.

`ThemeProvider`, `useTheme`, `usePalette`, `ThemeToggle`, the `.dark` CSS-variable
overrides in `styles/index.css`, and the `GET`/`PUT /api/preferences` backend
(controller → service → repository, with in-memory and PostgreSQL implementations)
all exist and all work. But `main.tsx` renders `App.tsx`, which renders
`features/rolevault/screens/*` — eight screens holding roughly 340 hardcoded hex
literals, with no `useTheme`, no `usePalette`, and no `ThemeToggle` mounted
anywhere. The theme-aware `pages/*` tree, along with `RvNav` and `Layout`, is not
routed at all.

The result: toggling the theme changes nothing visible in the running app.

Two persistence defects compound this:

1. `ThemeProvider` hydrates from the backend on mount and unconditionally
   overwrites the local choice. The default repository is in-memory and resets on
   server restart, so a returning dark-mode user is flipped back to light.
2. The `.dark` class is applied in a `useEffect`, so dark-mode users get a white
   flash on every reload.

## Goals

- A working light/dark switch across all eight live screens.
- A sun/moon sliding switch in the top-right nav cluster of each screen.
- The choice persists across visits, and survives a server restart.
- The backend stays genuinely wired — every change is written through to
  `/api/preferences`.

## Non-goals

- Removing the dead `pages/*` / `RvNav` / `Layout` tree. It is a second, unrouted
  UI; cleaning it up is a separate decision.
- Per-user preference identity. The backend keeps its single
  `DEFAULT_PREFERENCES_ID` profile until auth exists.

## Design

### 1. Palette as the single source of colour

`lib/palette.ts` already defines the flat-surface keys `pages/*` needed. The live
screens additionally use hero gradients, aurora blobs, white-on-dark nav text,
button gradients, and row-hover tints. `Palette` gains keys for those:
`heroGradient`, `heroInk`, `heroInkMuted`, `heroChipBg`, `heroBorder`, `auroraA`,
`auroraB`, `buttonGradient`, `rowHover`, `cardShadowHover`.

The Landing hero is already a dark green gradient in light mode. In dark mode it
must not lighten — it goes deeper and loses contrast against the page instead.
The hero keys are therefore "always dark, two intensities," not an inversion.

Each of the eight screens calls `usePalette()` once at the top; every hex literal
becomes a palette key. This is the pattern `pages/*` already uses, so the codebase
stays internally consistent.

### 2. Hover styles move to CSS variables

The `<style>` block in `App.tsx` hardcodes six hover rules with `!important` and
cannot see the palette. Those colours become `var(--rv-hover-*)` custom properties
defined under `:root` and `.dark` in `styles/index.css`, so they theme with no JS
involvement.

### 3. The switch

`ThemeToggle` is rebuilt as a sliding pill: a track with a sun on the left and a
moon on the right, and a knob that slides between them. Both icons stay visible.

```
   light mode              dark mode
  ╭───────────╮           ╭───────────╮
  │ (●) ☀︎  ☾ │    ⇄     │ ☀︎  ☾ (●) │
  ╰───────────╯           ╰───────────╯
```

Two colour variants, both driven by `usePalette`:

- `onDark` — translucent white-on-dark, matching the
  `rgba(255,255,255,0.08)` Log In button on the Landing hero nav.
- `onLight` — light chrome, for the other seven screens.

Transitions use the `0.2s` timing already present in the component. It keeps its
`aria-pressed`, `aria-label`, and `title` behaviour.

**Placement:** top-right of each screen's own nav bar, leading whatever action
cluster is already there — before Log In on Landing and Auth, before the
profile/account controls on the rest. The switch adapts to each screen's existing
nav rather than forcing one layout.

### 4. Persistence — local wins, backend mirrors

`ThemeProvider` changes:

- **Read order:** `localStorage` → if absent, `system` (respects the OS on a first
  visit) → `light` as the final fallback. `system` is already in the
  `ThemePreference` union and passes server validation, so the backend is
  unchanged.
- **Hydrate no longer clobbers.** The backend value is adopted only when
  `localStorage` held nothing. Otherwise the local choice stands and the provider
  writes it up to reconcile the server.
- **Writes unchanged.** Every `setTheme` writes `localStorage` and
  fire-and-forgets `PUT /api/preferences`.

### 5. Flash-of-light fix

An inline script in `index.html`'s `<head>`, before the module loads: it reads the
same `theme` key, resolves `system` through `matchMedia`, and sets the `.dark`
class and `color-scheme` on `<html>`. React's initial state reads the identical
key, so the first paint agrees with the pre-paint script.

## Testing

- **Client:** provider precedence — local beats backend, and the backend value is
  adopted only when local is empty. Plus a switch smoke test asserting the `.dark`
  class flips.
- **Server:** `preferences.test.ts` already covers the routes; extend it to cover
  the `system` value if it does not.
- **Whole-repo gates:** `npm run typecheck`, `npm run lint`, `npm run test`,
  `npm run build`.

## Risks

The retrofit touches roughly 340 hex literals across eight dense inline-styled
screens. The risk is a missed literal leaving a light-mode island in dark mode.
Mitigated by sweeping each screen for remaining `#` literals after conversion and
reviewing both themes.
