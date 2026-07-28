/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), babel({ presets: [reactCompilerPreset()] }), tailwindcss()],
  // Inside Docker on Windows/WSL, bind mounts don't emit native FS events, so
  // HMR needs polling. Enabled only when VITE_USE_POLLING is set (the dev
  // compose stack sets it); local `npm run dev` is unaffected.
  server: {
    // Fail loudly instead of drifting. Vite's default is to walk to the next
    // free port (5174, 5175, ...) when 5173 is taken, but the API's CORS
    // allowlist and the Google OAuth authorised origin both name a specific
    // port — so a silent move breaks sign-in with an opaque "Network error".
    port: 5173,
    strictPort: true,
    ...(process.env.VITE_USE_POLLING ? { watch: { usePolling: true, interval: 100 } } : {}),
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test/setup.ts',
    css: true,
  },
})
