# ---- deps ----
FROM node:22-slim AS deps
WORKDIR /app
COPY src/api/package.json src/api/package-lock.json* ./api/
RUN cd api && (npm ci --ignore-scripts || npm install --ignore-scripts)

# ---- runtime ----
FROM node:22-slim
ENV NODE_ENV=production
WORKDIR /app
RUN useradd -m -u 10001 kivlo
COPY --from=deps /app/api/node_modules ./api/node_modules
COPY src/shared ./shared
COPY src/api ./api
COPY supabase ./supabase
USER kivlo
EXPOSE 8787
# tsx runs the TS source directly; `npm run build` (tsc --noEmit) type-checks in CI
CMD ["npx", "--prefix", "api", "tsx", "api/src/server.ts"]
