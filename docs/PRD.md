# Kivlo PRD (v1)

Status: **Approved by founder 2026-11-22.** Last updated 2026-11-22.
Sources: `docs/PLAN.md`, `docs/BRANDING.md`, `docs/BUDGET.md`, `docs/DECISIONS.md`, `docs/research/`.

Items marked **(default)** are calls I made where the founder hasn't answered yet. Change any of them before approving.

## 1. What Kivlo is

A monthly-subscription web app for clippers. Paste a YouTube or Twitch link, and Kivlo finds the best moments, crops them to vertical, and adds captions. Fix anything in **KivloWorkspace**, the built-in editor, then download the clips or schedule them with AI-written hooks, titles and hashtags.

Kivlo never hosts campaigns, holds funds, or pays anyone out.

## 2. Users

**Primary: the solo clipper.** Cuts short vertical clips from streamers' long-form content and posts them on their own TikTok, YouTube Shorts, Instagram Reels and X accounts. Posts on all four platforms. Often new to clipping (the founder has been clipping for about a month). Tests AI clipping tools.

**Secondary: small clipping teams and agencies.** Same work at higher volume, several social accounts.

**Where the first users come from:** the founder's Discord, TikTok and Instagram followers.

**Not the user:** streamers, brands, or campaign operators.

## 3. Problems

From the founder's answers (1 clipper so far; the Discord survey in `docs/research/discord-survey.md` will add more):

1. **Burnout from repeating the same edits** on every clip.
2. **Low-quality output:** blurry exports, bad crops, bad captions.
3. **Posting stress:** not knowing when to post, and having to write hooks, titles and hashtags for every clip.
4. **Finding moments takes too long** in hours of stream footage.

## 4. Why Kivlo over Ssemble and others

Ssemble (3.4M users) sells the same core loop at the same price points the founder first proposed. Kivlo needs its own reasons to switch:

1. **Free plan, no card.** Ssemble shows no free plan. Kivlo gives 3 credits a month to start.
2. **Cheaper monthly plans:** $12 / $25 / $50 against Ssemble's $15 / $30 / $60.
3. **KivloWorkspace:** a real editor to fix any clip, not just regenerate it.
4. **Presets:** save your caption style, crop layout and edits once, and apply them to every clip. Targets problem 1 directly.
5. **Calm, simple design.** No clutter.

## 5. MVP features (launch before 2027)

### 5.1 Import
- Paste a **YouTube** or **Twitch VOD** link, or **upload a file** (MP4, MOV, WEBM).
- Link import only accepts **public, non-membership, non-age-restricted** videos. Anything that needs a login, payment or special access is rejected with a clear message.
- "I have the rights to this content" checkbox on every import.
- **Kick:** supported only if downloads prove reliable in testing **(default)**.
- Credits are checked before the job starts: ceil(minutes / 20). If the user doesn't have enough, the import is blocked and an upgrade prompt shows.

### 5.2 Find highlights
- Word-level transcript (Deepgram Nova-3).
- AI suggests the **top moments**. Each one has a score (0–100), a one-line reason, and a start/end snapped to word boundaries. Clip lengths vary (about 15–90 seconds).
- Score colors follow BRANDING.md: high in lime, medium in Heat, low in Slate, and the number is always shown.

### 5.3 Auto-edit
Every suggested moment becomes a ready clip:
- **9:16 crop** with face tracking that keeps the speaker centered.
- **Facecam + gameplay** split layout for gaming streams.
- **Animated word-by-word captions** (3–5 styles at launch).
- 1080x1920 MP4.

### 5.4 KivloWorkspace (editor)
- Trim the start and end, and extend into the source video.
- Switch the crop layout (face tracking, split, manual position).
- Edit caption words, style, size and position.
- **Presets:** save caption style + layout + settings, and set one as the default for new clips.
- The editor is always dark (BRANDING.md).

### 5.5 Post prep and scheduling
- AI writes a hook, title, description and hashtags for each clip, per platform. One click regenerates them, and every field can be edited.
- **Suggested posting times** per platform. Generic best times at launch; personalized times later.
- **Calendar:** schedule clips per platform. At the scheduled time the user gets an email or browser reminder, then downloads the clip and copies the caption in one tap.
- **Auto-posting** through **official platform APIs only**, turned on one platform at a time as each approval arrives. Apply to all four in week 1. Expected order: YouTube first, then X, Instagram, TikTok **(default)**.

### 5.6 Library and export
- All projects and clips in one place, searchable.
- Download MP4. Free plan exports carry a "Kivlo" watermark (bottom-right, 20% opacity).
- The full source video is deleted **48 hours** after import; clips and transcripts are kept **(default)**.

### 5.7 Accounts and billing
- Sign up with Google or email.
- Plans (see section 6), monthly and yearly, through Stripe: card, Apple Pay, Google Pay. Stripe Tax on.
- Credit balance and usage bar at the top of the dashboard. Upgrade prompt when fewer than 5 credits are left, and after a Free user's 2nd and 3rd credits.
- Prorated upgrades. Downgrades take effect at the end of the billing cycle.
- Failed payment: 3-day grace, then downgrade to Free, then suspended 7 days later.
- Billing history and invoices. Soft cancel ("You'll keep access until [date]").
- The Stripe account is owned by the founder's mom (legal guardian).

### 5.8 Landing page and pricing page
- Colors from BRANDING.md, no images, a product UI mock in the hero, "Start Free" CTA, minimal animation (`docs/DESIGN_PREFERENCES.md`).
- Pricing with a monthly/yearly toggle.

### 5.9 Legal and safety
- Terms of service: users are solely responsible for rights to the content they submit.
- DMCA agent registered **before Jan 5, 2027** ($6, rising to $25). Takedown requests handled within 24 hours. Repeat-infringer policy.
- Never marketed as a downloader.
- **Kill switch:** one setting turns off link import and falls back to file uploads only.
- Privacy policy. OAuth tokens stored encrypted, with only the scopes we need.

## 6. Pricing

1 credit = up to 20 minutes of source video. Credits reset each billing cycle and don't roll over.

| Plan | Monthly | Yearly (per month) | Credits/mo | Watermark | Social accounts | Seats |
|---|---|---|---|---|---|---|
| Free | $0 | - | 3 | Yes | 0 (download only) | 1 |
| Pro | **$12** | **$8** ($96/yr) | 30 | No | 1 | 1 |
| Creator | **$25** | **$16** ($192/yr) | 70 | No | 3 | 1 |
| Agency | **$50** | **$32** ($384/yr) | 150 | No | Unlimited | 3 |

Why these prices, and not the spec's $15/$30/$60 with $6/$12/$24 yearly:

| | Spec (same as Ssemble) | Kivlo v1 |
|---|---|---|
| Monthly vs Ssemble | Same | **$3–10 cheaper** |
| Free plan | Yes (Ssemble shows none) | Yes, no card |
| Yearly discount | 60% | about 33–36% |
| Profit, heavy user (all credits), no proxies | Creator yearly -$0.14, Agency yearly -$1.91 | Every plan positive (+$2.67 to +$22.75) |

Kivlo is cheaper than Ssemble on monthly plans, which is how most new users start. Ssemble's yearly plans stay cheaper, but matching them would lose money on heavy users. Full math in `docs/BUDGET.md`.

**Agency seats:** the 3 seats ship after launch; at launch Agency is more credits plus unlimited social accounts **(default)**.

## 7. Non-goals for v1

- Hosting campaigns, holding funds, payouts, or view tracking (never).
- Campaign discovery feed and campaign-aware presets (Phase 4).
- Public API (after launch).
- Browser automation (Playwright) for posting. Official APIs only.
- A full multi-track timeline. KivloWorkspace edits one clip at a time.
- AI chat assistant that edits by talking to it (after launch; ranked last by the founder).
- Creator authorization program.
- Caption translation, sports mode, YouTube channel automation.
- Mobile app.

## 8. Success metrics

Targets for the end of January 2027 **(default)**:

| Metric | Target |
|---|---|
| Signups | 200 |
| Activation: exports at least 1 clip within 24 hours of signup | 40% |
| Paying users | 15 |
| Highlight quality: share of suggested clips that get exported | 30% |
| Average time from paste to first finished clip | Under 10 minutes for a 1-hour video |
| Cost per credit | At or below $0.20 |
| Takedown requests answered within 24 hours | 100% |

## 9. Build order (about 5 weeks)

| Week | Deliverable |
|---|---|
| 1 | Landing + pricing pages. Accounts. Test YouTube downloads from the server (the proxy question). Apply for TikTok, YouTube, Meta and X API access. Register DMCA agent |
| 2 | Import → transcript → highlights → auto-edited clips (crop + captions) |
| 3 | KivloWorkspace: trim, layout switch, captions, presets |
| 4 | Stripe plans + credits + watermark. Library, export. AI titles/hashtags, posting times, calendar with reminders |
| 5 | Polish, legal pages, kill switch, error states. Beta with Discord users, then public launch |

## 10. Risks

1. **YouTube blocking server downloads.** Paying for proxies on every download makes most plans lose money on heavy users. Mitigation: download audio first, then only the clip sections; test in week 1.
2. **Legal:** YouTube's terms forbid downloading. Mitigation: guardrails in 5.9 and the kill switch.
3. **Platform approvals** (TikTok especially) may not arrive before launch. Mitigation: reminders and one-tap manual posting.
4. **Highlight quality.** If suggestions miss, users go back to clipping by hand.
5. **Timeline:** 5 weeks, solo with AI agents. Mitigation: the non-goals list above; cut Kick and personalized posting times first if late.
6. **Competition:** Ssemble, Opus Clip and others already sell this loop.

## 11. Open questions

1. Is Kick in v1, or after launch?
2. Free plan abuse: is email verification enough, or should a card be required?
3. How many caption styles at launch, and which ones?
4. Do the survey replies change the problem ranking?
5. Should the yearly plans include bonus credits like Ssemble's?
