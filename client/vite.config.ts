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
  server: process.env.VITE_USE_POLLING
    ? { watch: { usePolling: true, interval: 100 } }
    : undefined,
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test/setup.ts',
    css: true,
  },
})
