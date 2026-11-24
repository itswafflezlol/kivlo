# Kivlo deploy

Everything runs on one VPS with Docker Compose behind Cloudflare.

## Local dev

```bash
cp src/api/.env.example src/api/.env        # dummy values are fine locally
docker compose -f deploy/docker-compose.yml --profile local up -d --build
cd src/api && npm run db:migrate && npm run db:seed
curl http://localhost:8787/health           # {"status":"ok"}
```

`--profile local` adds the Docker Postgres container. The API + worker images
don't depend on it — in production they point at Supabase `DATABASE_URL`.

Dev token: `Authorization: Bearer dev` (requires `DEV_AUTH=1`, never in prod).

## VPS

```bash
# real env values on the server (never committed)
scp src/api/.env vps:kivlo/src/api/.env
docker compose -f deploy/docker-compose.yml up -d --build api worker
# run migrations once against Supabase (SKIP_LOCAL_STUB: auth schema exists there)
SKIP_LOCAL_STUB=1 DATABASE_URL=postgres://... npm run db:migrate --prefix src/api
```

### Default exposure: Cloudflare Tunnel (no open ports)

```bash
cloudflared tunnel create kivlo
cloudflared tunnel route dns kivlo api.kivlo.app
cloudflared tunnel run --url http://localhost:8787 kivlo
```

Point `NEXT_PUBLIC_API_URL=https://api.kivlo.app` at the site build and add that
origin to `CORS_ORIGINS` in the API env. Caddy is an alternative if ports 80/443
are open; Cloudflare Tunnel is the default so the VPS needs none.
