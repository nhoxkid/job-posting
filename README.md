# Job Posting Platform


**Stack:** React 19 · Vite · TypeScript · Tailwind CSS v4 · TanStack Query ·
React Hook Form · React Router · Express · PostgreSQL · Vitest.

```
job-posting/
├── client/                 # Frontend (React + Vite + TypeScript)
│   ├── Dockerfile          # Builds static site, served by nginx
│   ├── nginx.conf          # SPA fallback routing
│   └── src/
│       ├── api/            # HTTP client + per-resource calls (stubs)
│       ├── components/     # ui/ design system, layout/, ErrorBoundary, ThemeToggle
│       ├── features/       # Feature modules (jobs/: components, hooks)
│       ├── lib/            # Helpers (cn, env, formatting)
│       ├── pages/          # Route-level pages
│       ├── providers/      # ThemeProvider, QueryProvider
│       ├── styles/         # Tailwind entry + design tokens
│       ├── test/           # Vitest setup
│       └── types/          # Domain types
│
├── server/                 # Backend (Express + TypeScript REST API)
│   ├── Dockerfile
│   └── src/
│       ├── config/         # env.ts — typed env loader
│       ├── db/             # PostgreSQL connection component
│       ├── middleware/     # validate (stub), errorHandler, notFound
│       ├── utils/          # ApiError, asyncHandler
│       ├── models/         # Domain types
│       ├── repositories/   # Data access (JobRepository interface + SQL stub)
│       ├── services/       # Business logic
│       ├── controllers/    # HTTP boundary
│       ├── routes/         # Route definitions (wired)
│       ├── app.ts          # Express app factory
│       └── server.ts       # Entrypoint
│
├── docker-compose.yml      # postgres + server + client
├── .env.example            # Compose configuration template
├── package.json            # Workspace root + orchestration scripts
└── .prettierrc.json        # Shared Prettier config
```



