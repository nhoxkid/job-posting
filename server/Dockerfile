# syntax=docker/dockerfile:1

# ---- Build stage ----
FROM node:20-alpine AS build
WORKDIR /app
COPY package.json ./
RUN npm install
COPY tsconfig.json ./
COPY src ./src
RUN npm run build

# ---- Runtime stage ----
FROM node:20-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
COPY package.json ./
RUN npm install --omit=dev
COPY --from=build /app/dist ./dist
# tsc does not emit non-TS assets; the Postgres seed routine reads this at runtime.
COPY --from=build /app/src/db/schema.sql ./dist/db/schema.sql
EXPOSE 4000
CMD ["node", "dist/server.js"]
