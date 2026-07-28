import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    include: ['src/**/*.test.ts'],
    // Pin the data source so the suite never depends on a developer's local
    // `.env`. With DB_DRIVER=postgres the repositories resolve to their SQL
    // implementations at module load, and every route 500s with "Database not
    // initialised" because tests build the app without connecting.
    env: {
      DB_DRIVER: 'memory',
    },
  },
})
