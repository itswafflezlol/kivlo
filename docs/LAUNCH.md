# Kivlo production launch plan

The ordered path from demo to live. Each step lists what I do vs what you do.

## Phase 0 — accounts (you, ~30 min, cheap/free)
1. Buy the domain (kivlo.com or similar) — point DNS at Cloudflare later.
2. Create a Supabase project (Pro if you want no pauses; free tier is fine to start).
3. Cloudflare account + add the domain. R2 bucket `kivlo-media`.
4. Stripe account → get test + live keys later. Resend account for emails.
5. VPS from Sylant: 2 vCPU / 4–8 GB RAM is enough to start (worker is CPU-heavy; GPU is a "later" upgrade for Whisper speed).

## Phase 1 — VPS base (me, once you hand me access)
6. Install Docker on the VPS, clone the repo, fill `.env` from `src/api/.env.example` (real values, never committed).
7. `deploy/docker-compose.yml` already runs: API + worker. Add Caddy/Cloudflare Tunnel for HTTPS, or put the VPS behind Cloudflare directly.
8. Run `supabase/migrations/0001_init.sql` + `seed.sql` against the Supabase DB; point `DATABASE_URL` at it.

## Phase 2 — auth for real
9. Supabase Auth → enable Google + Apple providers:
   - Google: same OAuth client; add Supabase's callback URL to its redirect URIs; paste client ID + secret into Supabase (never into code).
   - Apple: needs an Apple Developer account ($99/yr) — do this when you decide Apple sign-in matters for launch.
10. Frontend: replace the demo session with Supabase JS sessions (httpOnly cookie flow via our API; no JWTs in localStorage).
11. Remove `DEV_AUTH` from prod env; test sign-in end to end.

## Phase 3 — move the frontend off GitHub Pages
12. Serve `out/` (static export) from the VPS or Cloudflare Pages; point the domain at it.
13. Add the new domain to Google OAuth JavaScript origins; remove the github.io origin after cutover.
14. `NEXT_PUBLIC_API_URL` → `https://api.yourdomain.com` via Pages env / build secret.

## Phase 4 — first real pipeline milestone
15. Worker milestone 1 (link validation) is built; extend stages: yt-dlp download → Whisper transcribe → highlight score → reframe → captions → FFmpeg export, storing renders in R2.
16. Wire SSE progress into the processing screen (API events endpoint exists).
17. Uploads: presigned R2 PUT (API route exists); test a real 4 GB VOD upload.

## Phase 5 — money
18. Stripe: products/prices for the plans in `docs/PRD.md`, checkout + webhook → credits ledger.
19. Test mode end-to-end purchase; flip to live keys only after everything else works.

## Phase 6 — launch hardening
20. Legal: lawyer review of Terms/Privacy/DMCA; real contact emails.
21. Replace prototype streamer footage or get written permission before public marketing use.
22. Google: YouTube Data API key (video length/credit cost pre-check). Auto-posting to Shorts/TikTok/Reels is a separate app review — plan weeks.
23. Publish the Google OAuth consent screen so non-test-users can sign in.
24. Monitoring: uptime check on /health, Sentry or similar, log drain.
25. Load sanity: one full import → clip → export cycle under a couple of parallel users.

## Order of operations summary
domain → accounts → VPS + Docker + DB → real auth → frontend on domain → pipeline → Stripe → legal + footage → public launch.

Nothing above requires new architecture — it's all in `docs/ARCHITECTURE.md` and the code is scaffolded. The unknowns are external: your VPS specs, Apple Developer decision, and platform review times.
