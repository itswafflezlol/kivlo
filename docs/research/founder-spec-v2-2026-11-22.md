# Founder spec v2 (pasted 2026-11-22, "the whole thing in one shot")

Condensed but complete record. Numbers are exactly as given.

## Pipeline
- Ingest YouTube or Twitch URL via API with yt-dlp.
- Guardrails: public, non-membership, non-age-restricted only; reject login/payment/special access; ToS says user is solely responsible for rights; never market as "download any YouTube video"; honor takedowns within 24h.
- Transcribe with Whisper / whisper.cpp (word-level timestamps).
- LLM (GPT-4 class) picks the single most engaging 30s segment -> {start, end, title, reason}.
- FFmpeg: cut 30s, 9:16 crop with MediaPipe face tracking, burned-in karaoke captions, 1080x1920 MP4.
- Output: MP4 URL + title, start/end, transcript snippet.
- Queue, one video at a time. Delete full video right after render; store only the 30s clip. Log which video was processed and by whom.

## Pricing
| Plan | Monthly | Yearly (per mo) | Credits/mo | Watermark | Social accounts | API | Seats |
|---|---|---|---|---|---|---|---|
| Free | $0 | - | 3 | Yes | 0 (download only) | No | 1 |
| Pro | $15 | $6 ($72/yr) | 30 | No | 1 + auto-post | Yes | 1 |
| Creator | $30 | $12 ($144/yr) | 70 | No | 3 + auto-post | Yes | 1 |
| Agency | $60 | $24 ($288/yr) | 150 | No | Unlimited + auto-post | Yes | 3 |

## Credits
- 1 credit = 1 source video up to 20 min; credits = ceil(minutes / 20). 60 min = 3 credits.
- Reset each billing cycle, no rollover. Counter on dashboard and in the queue.

## Free tier
- 3 credits/mo, resets on the 1st. "Kivlo" watermark bottom-right, 20% opacity.
- No auto-posting, no social connections, no API, standard queue. Download and post manually.
- Upgrade prompt after 2nd and 3rd credit used.

## Billing
- Stripe subscriptions, monthly and yearly. Yearly = 12 x discounted monthly rate.
- Prorated upgrades; downgrades at end of cycle.
- Failed payment: 3-day grace -> downgrade to Free -> 7 more days -> suspended.
- Card, Apple Pay, Google Pay. Stripe Tax.
- No free trial: the free tier is the trial. Yearly plans headline the effective monthly price ("$6/mo billed yearly").

## Dashboard
- Credit balance at top, usage bar ("12/30 credits used this cycle"), upgrade CTA under 5 credits left.
- Billing history + invoice downloads. Soft cancel/downgrade ("You'll keep access until [date]").

## API (Pro and above)
- One REST key per account. POST /videos, GET /videos/{id}, GET /videos/{id}/clip.
- Rate limits: Pro 10/min, Creator 30/min, Agency 100/min. 402 when out of credits.

## Campaign aggregation
- No Kivlo creator authorization program.
- Sources: Whop, Clipping.net, future partners with a public API or feed. Pulled via API, or manual curation if none.
- Card: creator name, platform (YouTube/Twitch), payout rate, rules, "Join on [Platform]" deep link (new tab).
- Kivlo does not handle payouts, view tracking, or creator relationships. No partner OAuth in v1.
- "Browse Campaigns" tab. Filters: platform, payout rate, video length, niche.
- Collect referral/affiliate fees where offered (UTM/affiliate links); otherwise a free retention feature.
- ToS: "Kivlo displays third-party campaigns for convenience. Kivlo is not responsible for campaign terms, payouts, or disputes between creators and clippers."

## Stack
Python, FastAPI, yt-dlp, FFmpeg, Whisper, MediaPipe, OpenAI API, Stripe, Playwright (social auto-posting).
