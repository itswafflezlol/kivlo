# Clipper Tool: Product and Engineering Plan

Planning doc for a monthly-subscription clipping tool built for clippers. Last updated November 22, 2026.

## 1. Summary

A web app where clippers pay monthly to turn long-form stream content into short vertical clips. It has a browser editor, an AI assistant that edits through tool calls, and AI-suggested highlights.

**The target user is the clipper**, not the streamer. The tool will help clippers find campaigns on other apps such as Whop and Clipping.net, but it will not host campaigns, hold funds, or pay anyone out.

Build approach (from the guides at nuhushaik.com/resources, based on their titles and descriptions): start from real problems, write a PRD, mock up every screen first, build and connect the real app, then launch with content.

## 2. MVP Scope

- Import a video by file upload or pasted URL (YouTube, Twitch VOD, Drive or similar share links), then get a word-level transcript.
- AI suggests the top highlights, each with a score and a one-line reason.
- Editor: trim, 9:16 reframe, animated captions, and a few templates (facecam on top with gameplay below, for example).
- AI assistant that edits through tool calls, for example "remove silences", "make the captions bolder", "give me 3 variants".
- Export in vertical HD, with a watermark on the free tier.
- Monthly subscription with a credit allowance plus metered overage.
- An "I have the rights to this content" confirmation at upload, and a DMCA takedown process.

**Out of scope for now:** hosting campaigns, holding or paying out funds, payout-linked view tracking, and direct publishing (later phase). Campaign discovery (section 11) comes after the core editor ships.

## 3. Tech Stack

| Layer | Choice | Why |
|---|---|---|
| Web app | Next.js (App Router), TypeScript, Tailwind, shadcn/ui | Fast to build; AI coding tools know it best |
| Auth | Clerk or Supabase Auth | OAuth for Google and Twitch out of the box |
| Database | Postgres (Supabase or Neon) with Drizzle ORM | Relational fits users, projects, jobs, and a usage ledger |
| Object storage | Cloudflare R2 | S3-compatible with no egress fees, which matters for video |
| Queue and orchestration | Inngest or Temporal (BullMQ and Redis if keeping it simple) | Video pipelines are long, multi-step, and need retries |
| Video workers | Docker containers with FFmpeg on Modal, Fly, or AWS Batch | Autoscale to zero; GPUs only where needed |
| Transcription | WhisperX (self-hosted) or Deepgram / AssemblyAI | Word-level timestamps drive captions and the assistant |
| LLM | Claude API with tool use | Highlight scoring and the editing assistant |
| Realtime | SSE or WebSockets (Ably, Pusher, or Supabase Realtime) | Job progress and assistant streaming |
| Payments | Stripe Billing with usage meters | Subscription plus metered overage |
| Observability | Sentry, PostHog, Langfuse, OpenTelemetry | Debug pipelines; track AI cost per user |
| Hosting | Vercel for the web app; workers on Modal or Fly | Keeps heavy video work off the web tier |

## 4. Architecture

```
Browser (Next.js + Editor)
   |  REST/tRPC + SSE
   v
API layer --> Postgres (users, projects, jobs, usage ledger)
   |
   +--> Queue (Inngest/Temporal)
   |       - ingest worker      (fetch or upload -> R2)
   |       - transcribe worker  (Whisper -> word timestamps)
   |       - analysis worker    (audio energy, chat spikes, LLM scoring)
   |       - reframe worker     (face/speaker tracking -> 9:16 crop path)
   |       - render worker      (FFmpeg/Remotion -> MP4 -> R2 -> CDN)
   |
   +--> Claude API (assistant + highlight scoring)
   +--> Stripe (subscriptions, meters, webhooks)
   +--> Platform APIs (Twitch, YouTube; publishing later)
```

## 5. The Editor

**Key decision:** a project is a **JSON document** (tracks, clips, captions, effects, crop keyframes). The UI and the AI both change it through the same set of operations (`trimClip`, `addCaption`, `setCrop`, `deleteRange`, and so on). That makes the assistant reliable and gives you undo/redo, autosave, and later collaboration.

- **Preview:** low-resolution proxy video in the browser (WebCodecs or `<video>`) with a Canvas or PixiJS overlay for captions and effects.
- **Timeline UI:** build on a library (Diffusion Studio, Remotion's player) or write a custom React timeline. Prototype this first; it is the riskiest UI piece.
- **Final render:** server-side with Remotion (check its commercial license terms) or an FFmpeg filter graph generated from the project JSON.
- **Captions:** word-level timestamps with animated templates. This is the feature clippers care about most.
- **Reframing:** detect the face or speaker, compute a smooth 9:16 crop path, and offer split-layout templates for facecam plus gameplay.

## 6. AI Assistant

- **Tool use, not free-form text.** Claude receives the project JSON summary, the transcript, and the editing tools, and proposes operations. The user sees them as a diff and can accept or reject.
- **Typical requests:** remove silences, punch up a hook, find the funniest 30 seconds, restyle captions, make 5 variants.
- **Highlight detection** combines chat message velocity (when available), audio loudness spikes, laughter and shouting detection, LLM scoring of the transcript, and optionally a vision pass on keyframes. Rank by the combined score.
- **Cost controls:** cache transcripts and embeddings, use a cheaper model for scoring and a stronger one for editing, and log every call to a per-user usage ledger.
- **Evals:** keep a small set of clips with human-picked best moments and measure detection quality on every change.

## 7. Integrations

- **Twitch (Helix API and OAuth):** VOD metadata and clips. Chat for past VODs is not cleanly exposed, so recording chat live for connected streamers may be needed.
- **YouTube Data API:** import, and later publishing Shorts.
- **Kick:** check what its public API currently supports.
- **TikTok Content Posting API, Instagram Graph API, X API (later):** publishing. TikTok requires an app audit before public posting, so apply early.
- **Stripe:** subscriptions, customer portal, usage meters.
- **Resend and PostHog:** transactional email and product analytics.

Campaign sources (Whop, Clipping.net, Vyro, and others) are covered in section 11.

## 8. Subscription Plans and Usage Billing

Specific prices are not set yet. They should come from a unit-cost model first, because video is where margins disappear.

**Plan structure (to be priced):**

| Plan | Intended user | Includes |
|---|---|---|
| Free | Trying the tool | Small monthly credit allowance, watermarked exports, lower resolution, limited AI assistant use |
| Pro | Individual working clipper | Larger credit allowance, no watermark, full HD export, highlight detection, full AI assistant |
| Studio | Heavy clippers and small teams | Highest allowance, priority rendering, batch export, multiple seats, early access to publishing |

**What to meter:** source hours ingested, render minutes, AI assistant tokens, and storage.

**Design rules:**

- Keep your own **usage ledger in Postgres** as the source of truth, then report to Stripe meters.
- Enforce limits in the API before enqueueing any job.
- Overage is billed through metered usage once the included credits run out.

**Unit-cost model to build before pricing:** cost per source-hour covering GPU transcription, storage, renders, and LLM tokens. Set each tier's price so the included credits leave a healthy margin even for heavy users.

## 9. Build Plan

| Phase | Weeks | Deliverable |
|---|---|---|
| 0 | 1 | Talk to 5 to 10 working clippers, write the PRD, mock up every screen, model unit costs |
| 1 | 2 to 4 | Auth, Stripe, upload to transcribe to render pipeline, basic editor with captions and 9:16 |
| 2 | 5 to 7 | Highlight detection, URL import, templates, usage metering |
| 3 | 8 to 10 | AI assistant with tool use, autosave and undo |
| 4 | 11+ | Campaign discovery feed, campaign-aware editor presets, direct publishing, batch export |

Phase 0 matters more than usual. Talking to people who clip daily will show which part of their workflow hurts most, and that is probably what the product should be best at.

## 10. How Clipping Campaigns Work

- A streamer, creator, or brand posts a **campaign** on a platform such as Whop's Content Rewards.
- The campaign provides **source content**, **rules** (required tags, banned content), and a **payout rate**, typically a set amount per 1,000 views.
- Clippers cut clips, post them on their **own** TikTok, Shorts, or Reels accounts, and **submit the links**.
- The platform tracks views and pays based on approved, legitimate views, often with caps and minimum thresholds. Rule-breaking submissions can be rejected.

Campaigns are a marketplace beside your tool: clippers find work there, and your tool is where they make clips faster. Terms vary by platform, so check each one's current terms.

## 11. Campaign Discovery: Finding Campaigns on Other Platforms

Campaign discovery means showing clippers live campaigns from other platforms in one place, then sending them to that platform to join and submit. Your product never hosts campaigns, holds money, or pays clippers, so escrow, chargebacks, and money-transmission rules do not apply. Revenue stays with the clipper subscription.

**What clippers see**

- One feed of campaigns from Whop Content Rewards, Clipping.net, Vyro, Clipster, and others, in a common format.
- Filters for platform, streamer or brand, payout per 1,000 views, remaining budget, minimum views to qualify, allowed social platforms, and deadline.
- Saved campaigns, plus alerts when a new campaign matches a filter.
- A "join on [platform]" button that links out. Joining, submitting, and payouts stay on the source platform.

**Campaign record (one per campaign):** platform, title, streamer or brand, payout per 1,000 views, total and remaining budget, minimum views to qualify, per-clip cap, allowed social platforms, rules (required hashtags, length limits, banned content), link to source content, link to the campaign page, status, and last-checked time.

**How to get the data**

| Method | What it is | Main risk |
|---|---|---|
| Official API or partnership | Ask each platform for listing data or a partner feed | Needs the platform to agree. Whop publishes developer docs, so check whether campaign listings are exposed (not confirmed) |
| Curated by hand | Your team adds and updates campaigns | Accurate but slow and labor-heavy |
| User-submitted | Clippers paste a campaign link and details; a moderator approves | Spam and stale entries |
| Browser extension | Reads campaign pages in the user's own logged-in session and sends the fields to your app | Check each platform's terms; breaks when pages change |
| Server-side scraping | Your servers fetch public listings on a schedule | Highest terms-of-service and legal risk. Third-party scrapers for Whop campaigns exist, which does not mean it is permitted |

**Recommendation:** start with curated and user-submitted campaigns while you ask platforms about official access. Consider the extension after legal review. Do not build the product on scraping.

**Campaign-aware editor (the differentiator).** When a clipper picks a campaign, the editor loads its rules as a preset: aspect ratio, maximum length, required hashtags and on-screen text. An export check flags rule breaks, and the campaign's source-footage link goes straight into import. Pure marketplaces cannot do this. Cut.Pro describes itself as both the clip tool and the campaign platform, so expect competition here.

**Earnings estimator.** Show expected payout as rate times expected views, with a note that fees and caps differ by platform. Reported rates vary widely, which is the reason a live feed is useful:

| Platform | Reported rate per 1,000 views | Notes |
|---|---|---|
| Vyro | about $3 | Known for celebrity content; one comparison site reports hourly payouts and a $1,000 cap |
| Whop Content Rewards | about $0.20 to $6, often near $1 | Set per campaign; sellers pay a platform fee reported at about 10% |
| Clipping.net | about $0.50 to $3 | Reports conflict; some campaigns need 10,000 to 100,000 views before paying |
| Clipster | Per campaign | Reported $50 minimum withdrawal and a 5% withdrawal fee |

These figures come from third-party comparison articles in search results, several published by competing platforms. They were not checked against each platform's own pages, so treat them as approximate as of November 22, 2026.

**Risks specific to discovery**

- **Stale data:** budgets run out. Show the last-checked time and hide campaigns not seen recently.
- **Terms and permissions:** get each platform's agreement before ingesting its data, and do not imply you are affiliated with it.
- **Fake or scam campaigns:** label where each listing came from and whether it is verified.
- **Dependence:** these platforms can block you or launch their own editing tools.

**Next step:** contact Whop, Clipping.net, Vyro, and Clipster about data access or a partnership, and ask clippers how they find campaigns today.

Sources:
[Whop fees, Sirency](https://www.sirency.com/blog/whop-content-rewards-clipping) ·
[Platform fees, Content Rewards](https://contentrewards.com/articles/how-to-choose-a-clipping-platform) ·
[Clipster, Content Rewards](https://contentrewards.com/article/whop-clipping-alternatives) ·
[Platform table, FindClout](https://findclout.com/blog/clipping-platforms-compared) ·
[Whop vs Vyro, OpenClip](https://openclip.app/compare/whop-vs-vyro.md) ·
[Rates, Ssemble](https://www.ssemble.com/blog/best-clipping-platforms-2026) ·
[Platform comparison, Cut.Pro](https://cut.pro/en/blog/clipping-campaign-platforms-comparison-2026)

## 12. Legal and Platform Risks

- **Content rights.** Streamers own their streams, and clipping rules vary by streamer and platform. Build around authorized sources: campaign-provided footage, connected streamer accounts, and the user's own uploads. Downloading arbitrary VODs is a terms-of-service and DMCA risk.
- **DMCA process:** takedown workflow, repeat-infringer policy, and a registered agent.
- **Copyrighted music and game audio** inside streams can trigger claims on posted clips.
- **Platform terms:** each publishing API has its own rules, rate limits, and review process.
- **Privacy:** request only the OAuth scopes you need and encrypt stored tokens.

Have a lawyer review the content-rights approach and the campaign data approach before launch. This document is not legal or financial advice.

## 13. Biggest Risks

1. Legal and platform access to stream content.
2. Browser editor complexity (timeline, performance, sync).
3. Video infrastructure cost eating margins.
4. Highlight quality. If suggestions miss, users go back to clipping by hand.
5. Campaign data access: no confirmed public APIs, and scraping carries terms-of-service risk.

## 14. Next Steps

1. Interview 5 to 10 working clippers about their current workflow and costs.
2. Write the PRD.
3. Mock up every screen before building.
4. Build the unit-cost model, then set plan prices.
5. Prototype the timeline editor, the riskiest piece.
