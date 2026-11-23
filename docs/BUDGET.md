# Kivlo Budget

Last updated 2026-11-22. All prices USD, checked on vendor pages or recent price trackers in November 2026. Rows marked **(est.)** are my estimates, not vendor prices. Re-check before paying.

Already covered: domain, logo, building/coding, marketing.

## 1. Building phase (now to launch, about 5 weeks)

| Item | Cost | Notes |
|---|---|---|
| Website hosting (Vercel Hobby) | $0 | Hobby is for non-commercial use. Fine while building, switch to Pro before charging |
| Database + login (Supabase Free) | $0 | 500 MB database. Pauses after 1 week of no activity |
| Video servers (Modal) | $0–10 | Pay per second; T4 GPU $0.59/hr, CPU core $0.047/hr. Starter plan includes free monthly credits (check amount) |
| File storage (Cloudflare R2) | $0 | First 10 GB free; no download fees |
| Transcription (Deepgram Nova-3) | $0 | $200 free credit on signup, about 775 hours of audio |
| AI for highlights, titles, hashtags (OpenAI) | $5–10 | Testing only. gpt-5.4-mini is $0.75 in / $4.50 out per 1M tokens |
| Proxies for YouTube downloads | $5–10 | Only if YouTube blocks the server. Pay-per-GB plans from about $1/GB |
| DMCA agent registration | $6 one-time | **Register before Jan 5, 2027.** The fee rises to $25 that day |
| **Total** | **about $15–35 for the whole build**, plus $6 once | |

## 2. Fixed monthly costs after launch

| Item | Monthly | Notes |
|---|---|---|
| Vercel Pro | $20 | Needed for a paid product. Includes $20 usage credit |
| Supabase Pro | $25 | No pausing, 8 GB database, daily backups |
| Email (Resend), errors (Sentry), analytics (PostHog) | $0 | Free plans are enough at the start (est.) |
| **Fixed total** | **$45/mo** | |

## 3. Per-user costs (these grow with usage)

1 credit = up to 20 minutes of source video.

| Step | Cost per credit | How |
|---|---|---|
| Transcription | $0.086 | 20 min x $0.0043/min (Deepgram, word timestamps included) |
| AI highlight picks + titles/hashtags | about $0.02 (est.) | About 8k tokens in, 2k out per 20 min |
| Face tracking + render | about $0.05 (est.) | Modal CPU, only on the clip parts |
| Storage | about $0.01 (est.) | Clips kept; full video deleted after 48 hours |
| **Total without proxies** | **about $0.17** | |
| Proxies, if YouTube blocks servers | $0.15–0.50 more (est.) | Depends on GB downloaded. Downloading audio first, then only clip sections, keeps this low |

Payment fees per charge: card 2.9% + $0.30, Stripe Billing 0.7%, Stripe Tax 0.5%. On a $15 charge that is about $0.91.

X auto-posting: $0.015 per post, $0.20 if the post has a link. Other platforms charge nothing to post.

## 4. Does each plan make money?

Profit per user per month after payment fees and usage, at about $0.17 per credit (no proxies) and $0.47 per credit (with proxies):

| Plan | Price | Uses half the credits | Uses all credits | All credits, with proxies |
|---|---|---|---|---|
| Pro monthly | $15 | +$11.60 | +$9.11 | +$0.11 |
| Creator monthly | $30 | +$22.66 | +$16.85 | -$4.15 |
| Agency monthly | $60 | +$44.79 | +$32.34 | -$12.66 |
| Pro yearly | $6/mo | +$3.24 | +$0.75 | -$8.25 |
| Creator yearly | $12/mo | +$5.67 | -$0.14 | -$21.14 |
| Agency yearly | $24/mo | +$10.54 | -$1.91 | -$46.91 |

Free users cost about $0.50 a month each if they use all 3 credits.

## 5. Example months after launch

Assumes paid users use half their credits, free users use all 3, monthly billing only.

| Users | Revenue | Costs (no proxies) | Profit (no proxies) | Profit (with proxies) |
|---|---|---|---|---|
| 50 free, 0 paid | $0 | $70 | -$70 | -$115 |
| 100 free, 10 Pro, 3 Creator, 1 Agency | $300 | $166 | +$134 | -$55 |
| 300 free, 40 Pro, 10 Creator, 3 Agency | $1,080 | $450 | +$630 | +$8 |

## 6. Key takeaways

1. **Building costs very little:** about $15–35 total, thanks to free plans and free credits.
2. **Launch costs about $45/mo fixed**, plus usage. Have about **$100–150/mo** ready for the first 2–3 months, until revenue covers it (est.).
3. **Proxies decide whether this works.** If YouTube blocks the servers and you pay for proxies on every download, most plans lose money on heavy users. Test this in week 1.
4. **Yearly prices ($6/$12/$24) lose money on heavy users even without proxies.** Suggest about 20% off instead: Pro $12, Creator $24, Agency $48 per month billed yearly.
5. **Don't use OpenAI Whisper for transcription.** `whisper-1` is the only OpenAI model with word timestamps, and it shuts down Feb 26, 2027. Use Deepgram Nova-3: it's cheaper, includes word timestamps, and the $200 free credit covers the whole build.
6. **One-time legal cost:** DMCA agent $6 (before Jan 5, 2027). Terms of service and privacy policy: $0 with a template, or a few hundred dollars for a lawyer review (est.).

## Sources

- Vercel pricing: https://vercel.com/pricing
- Supabase pricing: https://supabase.com/pricing
- Modal pricing: https://modal.com/pricing
- Cloudflare R2 pricing: https://developers.cloudflare.com/r2/pricing/
- Deepgram pricing: https://deepgram.com/pricing
- OpenAI pricing: https://developers.openai.com/api/docs/pricing
- OpenAI Whisper shutdown and timestamps: https://developers.openai.com/api/docs/guides/speech-to-text
- Stripe pricing: https://stripe.com/pricing, https://stripe.com/billing/pricing, https://stripe.com/tax/pricing
- X API pricing: https://docs.x.com (pay-per-use page)
- Proxy prices: https://scrapemeter.com/residential-proxy-pricing
- DMCA agent fee: https://copyright.gov/about/fees.html and Federal Register final rule, Nov 18, 2026
