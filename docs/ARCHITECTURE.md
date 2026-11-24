# Architecture

How Kivlo's code is laid out and how the parts talk. Follows the full-stack practices guide (feature-first, three layers, validated config, typed errors, structured logs).

## Decisions

| Area | Choice | Why |
|---|---|---|
| Hosting | Everything on the Sylant VPS (Docker Compose) behind Cloudflare. GitHub Pages keeps serving the demo until the domain points at the VPS. | One box we already pay for; Cloudflare handles DNS, TLS and caching. |
| Frontend | Next.js site (`src/web`), static build. Talks to the API through one typed fetch client. With no API URL set it falls back to mock data, so the Pages demo keeps working. | No server needed for pages; same build works on Pages and the VPS. |
| API | TypeScript, Hono on Node 22 (`src/api`). Feature-first folders, controller → service → repository. | Shares types and the link parser with the site. |
| Worker | Python (`src/worker`). Separate process. Runs the video jobs (yt-dlp, Whisper, FFmpeg, face tracking). | The video tools are Python/CLI. |
| Shared types | `src/shared`: Zod schemas, TypeScript types, the link parser. Used by web and API. | One source of truth across the boundary. |
| Database | Supabase Postgres. Schema changes only through SQL migrations in `supabase/migrations/`. Row-level security on user tables. | Already in the budget; migrations keep prod safe. |
| Auth | Supabase Auth (Google, Apple, email). The API verifies the Supabase JWT on every request (JWKS). | Handles OAuth providers for us; the API stays stateless. |
| Job queue | A `jobs` table in Postgres, claimed with `FOR UPDATE SKIP LOCKED`. Jobs are idempotent, retried up to 3 times, then marked `dead`. | Fast enough for our volume, no extra service or bill. |
| Live progress | Server-Sent Events from the API (`GET /v1/events`). The worker writes progress and calls `pg_notify`; the API forwards it to the user's open stream. | One-way server → browser is exactly what SSE is for. |
| Video files | Cloudflare R2. Uploads go straight from the browser to R2 with a presigned URL. | Big files never pass through the API. |
| Errors | Typed error classes, one global handler, problem+json responses with a request ID. The site maps codes to plain messages. | Consistent, debuggable, no stack traces to users. |
| Logs | Structured JSON (pino) with a request ID on every line. No secrets or tokens in logs. | Searchable on the VPS. |

## Layout

```
src/
  shared/            Zod schemas, types, linkParse (web + api)
  api/
    src/
      config.ts      env vars, validated at startup (fails fast)
      app.ts         middleware order + routes
      server.ts      start + graceful shutdown
      shared/        errors, logger, db, auth, middleware
      projects/      controller, service, repository, schema, tests
      clips/
      presets/
      schedule/
      credits/
      uploads/
      events/        SSE
      health/
  worker/
    kivlo_worker/    job loop, stages, db, config
  web/               Next.js site (existing)
supabase/migrations/ SQL migrations
deploy/              docker-compose.yml, Caddy/Cloudflare notes
```

Middleware order: request ID → logging → CORS (explicit origins) → secure headers → rate limit → body parse → auth → validation → handler → error handler.

## Data (first migration)

- `profiles` (one per auth user: name, plan, billing cycle, credits used, cycle reset date)
- `credit_ledger` (every credit spent or refunded, with the project it was for)
- `projects` (source URL, platform, source ID, title, length, status, who submitted it, rights confirmed at)
- `clips` (project, start/end, score, reason, title, words JSON, edit settings JSON, render status, file keys)
- `presets` (owner or built-in, kind, settings JSON, default flag)
- `scheduled_posts` (clip, platform, time, status)
- `jobs` (type, payload, status, attempts, run after, locked by, last error)
- `notifications`
- `takedowns` (requester, target, status, received at, 24h deadline, actions taken)

Every import records who submitted which video (PRD requirement).

## What runs where

| Process | Where | Talks to |
|---|---|---|
| Site | Pages now, VPS later (static files) | API |
| API | VPS container | Postgres, R2, Supabase Auth JWKS |
| Worker | VPS container | Postgres, R2, yt-dlp, Whisper, FFmpeg, AI API |
| Postgres + Auth | Supabase (hosted) | — |

Local dev: `docker compose -f deploy/docker-compose.yml up` starts Postgres, the API and the worker.

## Editor adjustments → FFmpeg mapping

The workspace preview renders adjustments with CSS `filter` + an inline SVG filter; export must produce the same look. Mapping (values are the editor's -100..100 unless noted):

| Slider | Preview | FFmpeg equivalent |
|---|---|---|
| Brightness | `brightness()` | `eq=brightness=(v/100)*0.5` |
| Contrast | `contrast()` | `eq=contrast=1+v/100` |
| Saturation | `saturate()` | `eq=saturation=1+v/100` |
| Exposure | extra `brightness()` | `eq=brightness=+(v/100)*0.5` |
| Sharpen (0..100) | `feConvolveMatrix` | `unsharp=5:5:(v/100)` |
| Temperature | `feColorMatrix` (warm/cool shift) | `colortemperature=temperature=6500+v*30` |
| Tint | `feColorMatrix` (green/magenta) | `colorbalance=gm=v/100` |
| Highlights | `feComponentTransfer` (compress top) | `curves=lighter='0/0 0.5/(0.5-v*0.001) 1/1'` |
| Shadows | `feComponentTransfer` (lift/compress bottom) | `curves='0/(v*0.002) 0.5/0.5 1/1'` |
| Vibrance | `feColorMatrix` (sat of low-sat pixels) | `eq=saturation` + `vibrance=intensity=v/100` |
| Fade | `feComponentTransfer` (lift blacks, drop whites) | `curves='0/(v*0.002) 1/(1-v*0.002)'` |
| Vignette (0..100) | `radial-gradient` overlay | `vignette=angle=PI/5*(1-v/100)` |

Exact coefficient tuning happens when the render pipeline is built; the preview is the visual reference.
