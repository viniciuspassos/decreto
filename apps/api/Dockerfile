# syntax=docker/dockerfile:1

FROM node:22-slim AS base
WORKDIR /repo
RUN corepack enable

FROM base AS deps
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml* ./
COPY packages/shared-types/package.json packages/shared-types/package.json
COPY packages/game-content/package.json packages/game-content/package.json
COPY packages/game-engine/package.json packages/game-engine/package.json
COPY apps/api/package.json apps/api/package.json
RUN pnpm install --frozen-lockfile --filter "@decreto/api..."

FROM deps AS build
COPY tsconfig.base.json ./
COPY packages/shared-types packages/shared-types
COPY packages/game-content packages/game-content
COPY packages/game-engine packages/game-engine
COPY apps/api apps/api
RUN pnpm --filter "@decreto/api..." run build

FROM node:22-slim AS runtime
WORKDIR /repo
ENV NODE_ENV=production
COPY --from=build /repo/node_modules ./node_modules
COPY --from=build /repo/packages ./packages
COPY --from=build /repo/apps/api ./apps/api
WORKDIR /repo/apps/api
EXPOSE 3001
CMD ["node", "dist/index.js"]
