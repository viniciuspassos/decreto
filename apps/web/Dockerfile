# syntax=docker/dockerfile:1

FROM node:22-slim AS base
WORKDIR /repo
RUN corepack enable

FROM base AS deps
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml* ./
COPY packages/shared-types/package.json packages/shared-types/package.json
COPY packages/game-content/package.json packages/game-content/package.json
COPY packages/game-engine/package.json packages/game-engine/package.json
COPY apps/web/package.json apps/web/package.json
RUN pnpm install --frozen-lockfile --filter "@decreto/web..."

FROM deps AS build
COPY tsconfig.base.json ./
COPY packages/shared-types packages/shared-types
COPY packages/game-content packages/game-content
COPY apps/web apps/web
RUN pnpm --filter "@decreto/web..." run build

FROM nginxinc/nginx-unprivileged:1.27-alpine AS runtime
COPY apps/web/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /repo/apps/web/dist /usr/share/nginx/html
EXPOSE 8080
