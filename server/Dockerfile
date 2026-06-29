# syntax=docker/dockerfile:1
#
# Built from the REPO ROOT so the workspace lockfile is in the build context:
#   docker build -f server/Dockerfile .
# docker-compose.yml sets `context: .` + `dockerfile: server/Dockerfile`.
#
# Installs are reproducible: `npm ci` honors the committed package-lock.json
# (the single source of truth for this npm workspace) instead of re-resolving
# version ranges. That guarantees the image gets exactly the locked, audited
# dependency versions.

# ---- Build stage ----
FROM node:20-alpine AS build
WORKDIR /app
# Manifests + lockfile first so this layer caches until dependencies change.
# Both workspace manifests are required for npm to resolve the workspace tree.
COPY package.json package-lock.json ./
COPY client/package.json ./client/package.json
COPY server/package.json ./server/package.json
RUN npm ci
# Only the server workspace's source is needed to build it.
COPY server ./server
RUN npm run build -w @job-posting/server

# ---- Runtime stage ----
FROM node:20-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
# Reproducible, production-only install scoped to the server workspace, so the
# client's deps are not dragged into this image.
COPY package.json package-lock.json ./
COPY client/package.json ./client/package.json
COPY server/package.json ./server/package.json
RUN npm ci --omit=dev -w @job-posting/server
COPY --from=build /app/server/dist ./dist
# tsc does not emit non-TS assets; the Postgres seed routine reads this at runtime.
COPY --from=build /app/server/src/db/schema.sql ./dist/db/schema.sql
EXPOSE 4000
CMD ["node", "dist/server.js"]
