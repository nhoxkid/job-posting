# syntax=docker/dockerfile:1
#
# Built from the REPO ROOT so the workspace lockfile is in the build context:
#   docker build -f client/Dockerfile .
# docker-compose.yml sets `context: .` + `dockerfile: client/Dockerfile`.
#
# `npm ci` honors the committed package-lock.json (the single source of truth
# for this npm workspace), so the bundle is built from exactly the locked,
# audited dependency versions rather than re-resolved ranges.

# ---- Build stage ----
FROM node:20-alpine AS build
WORKDIR /app
# Manifests + lockfile first so this layer caches until dependencies change.
# Both workspace manifests are required for npm to resolve the workspace tree.
COPY package.json package-lock.json ./
COPY client/package.json ./client/package.json
COPY server/package.json ./server/package.json
RUN npm ci
# Only the client workspace's source is needed to build it.
COPY client ./client
# API base URL is baked in at build time; override with --build-arg if needed.
ARG VITE_API_BASE_URL
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
RUN npm run build -w @job-posting/client

# ---- Runtime stage (static files via nginx) ----
FROM nginx:alpine AS runtime
COPY client/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/client/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
