# Kivlo Screens (v1)

Every screen in the v1 app, based on `docs/PRD.md`. Each entry lists: purpose, what's on it, the main action, and the states to mock up.

Design rules for all screens: `docs/BRANDING.md` and `docs/DESIGN_PREFERENCES.md`. Simple, uncluttered, minimal animation. One lime action per view. Text on lime is always Ink.

**App shell** (screens 8–20): dark sidebar with Dashboard, Library, Calendar, Presets, Billing. Top bar with search pill, credit balance, notification bell and avatar. Light or dark follows the user's setting; the editor is always dark.

## Marketing (public)

### 1. Landing page `/`
- **Purpose:** explain Kivlo in 5 seconds and get a "Start Free" click.
- **Contents:** nav (wordmark, Features, How it works, Pricing, FAQ, Log in, Start Free). Hero in a big rounded Ink card: headline, one-line subline, Start Free + See pricing, "Free plan · No card needed". A KivloWorkspace mock built in HTML rises out of the bottom of the hero (moment list with scores, 9:16 preview, caption panel). Then: How it works (3 steps), features bento, pricing (same as screen 2), FAQ, final lime CTA band, footer.
- **Main action:** Start Free.
- **States:** desktop, mobile.

### 2. Pricing page `/pricing`
- **Purpose:** compare plans and pick one.
- **Contents:** monthly/yearly toggle ("save up to 36%"). Four plan cards: Free, Pro, Creator, Agency, with Creator marked "Most popular". Credit explainer: "1 credit = up to 20 minutes of video. A 1-hour stream = 3 credits." Full comparison table. Billing FAQ. Auto-posting footnote: it rolls out platform by platform.
- **Main action:** each card's button (Start Free / Choose Pro / ...).
- **States:** monthly, yearly, mobile (cards stack).

### 3. Legal pages `/terms`, `/privacy`, `/dmca`
- **Purpose:** terms of service (user responsible for rights), privacy policy, DMCA takedown instructions plus a contact form or email.
- **Contents:** plain text pages with a table of contents.

## Sign up and onboarding

### 4. Sign up `/signup`
- Google button, email + password, link to Log in. Terms and privacy note under the button. If the user came from a plan button, the chosen plan is remembered.

### 5. Log in `/login`
- Google button, email + password, "Forgot password?" link.

### 6. Verify email / reset password
- "Check your inbox" screen with a resend button. Reset form with a new password field.

### 7. Onboarding (3 short steps, skippable)
1. Where do you post? (TikTok, Shorts, Reels, X: multi-select.)
2. Pick a caption style (3–5 preview tiles). It becomes the default preset.
3. Paste your first link. Goes to screen 9.

## Core app

### 8. Dashboard `/app`
- **Purpose:** status at a glance, and start a new import.
- **Contents:** big "Paste a link" input at the top. Credit card (12/30 used, progress bar turns Heat above 80%). Metric cards: clips this week, source hours processed, average highlight score. Recent projects (thumbnail block, title, status, clip count). Upcoming scheduled posts (next 3).
- **States:** empty (new user: "No clips yet. Import a VOD to find your first highlight."), normal, low credits (upgrade card).

### 9. New import (modal or page)
- **Contents:** tabs: Link / Upload. Link field with platform detected (YouTube, Twitch). Video title, length and thumbnail block once checked. Credit cost ("This video uses 3 credits. You have 27."). "I have the rights to this content" checkbox. Layout pick (Auto, Facecam + gameplay, Face only). Preset pick.
- **Main action:** Find Highlights.
- **States:** checking link, not public / login needed ("That link didn't work. Check it's public and try again."), not enough credits (upgrade prompt), upload progress, link import turned off (kill switch: "Link import is paused. Upload a file instead.").

### 10. Processing `/app/projects/[id]` (processing state)
- Steps with progress: Downloading, Transcribing, Finding moments, Making clips. "Finding the best moments. This takes a few minutes." The user can leave; a notification arrives when it's done.
- **States:** in progress, failed (retry, credits refunded), done (goes to screen 11).

### 11. Project / Highlights `/app/projects/[id]`
- **Purpose:** review the clips Kivlo made from one video.
- **Contents:** source title and length. Energy dot-grid across the video timeline, with moments marked in lime. Grid of clip cards: 9:16 preview, score (lime/Heat/Slate with the number), one-line reason, length, AI title. Sort by score or time.
- **Actions per clip:** Edit (screen 12), Post prep (screen 14), Download, Delete.
- **States:** clips ready, a clip still rendering, no good moments found.

### 12. KivloWorkspace (editor) `/app/clips/[id]/edit`
- **Always dark.**
- **Contents:** center: 9:16 preview player with captions on top. Below: a simple trim bar (start/end handles, can extend into the source) with a playhead. Right inspector with tabs: Layout (auto face, facecam + gameplay, manual crop position), Captions (style, size, position, color, edit words), Preset (apply, save as new, set as default). Top bar: back, clip title, undo/redo, save status, Export.
- **Main action:** Export.
- **States:** loading proxy video, saving, rendering export (progress), export ready ("Your clip is ready.").

### 13. Presets `/app/presets`
- List of saved presets (name, caption style preview, layout, default badge). Create, rename, duplicate, delete, set default. Editing opens the inspector from screen 12 on a sample clip.
- **States:** empty ("Save your style once and use it on every clip.").

### 14. Post prep (side panel on a clip)
- **Contents:** platform tabs (TikTok, Shorts, Reels, X). Per platform: hook, title, description, hashtags. Each field is editable, with Regenerate and Copy buttons. Suggested posting times as chips. Buttons: Schedule, Download, Copy all.
- **States:** generating, ready, platform not connected (auto-post off, shows "We'll remind you").

### 15. Calendar `/app/calendar`
- Week and month view. Scheduled clips as cards (thumbnail block, platform icon, time). Drag to move. Suggested time slots shown lightly. Status per post: scheduled, reminder sent, posted, auto-posted, failed.
- Opening a scheduled post shows the clip, caption, platform, time, and "Mark as posted" or "Post now" (when auto-post is on for that platform).
- **States:** empty, normal, a reminder due now.

### 16. Library `/app/library`
- All projects and clips. Search pill, filters (source platform, date, score, posted or not). Grid or list view.
- **States:** empty, results, no results for a search.

### 17. Connected accounts `/app/settings/accounts`
- One row per platform: connect button, connected account name, auto-post status ("Live" or "Coming soon" while approval is pending). Plan limit shown ("1 of 1 used on Pro").

### 18. Billing `/app/billing`
- Current plan, renewal date, credit usage bar. Plan cards to upgrade or downgrade (opens Stripe Checkout). Billing history with invoice downloads. Cancel flow: "You'll keep access until [date]."
- **States:** Free, paid, payment failed (grace banner), canceled (until date).

### 19. Settings `/app/settings`
- Profile (name, email, avatar), password, theme (light / dark / system), notification preferences (email, browser), delete account.

### 20. Notifications panel (dropdown from the bell)
- Render finished, import failed, reminder to post, auto-post done or failed, credits low.

## Modals and system screens

### 21. Upgrade / out of credits (modal)
- Shown when credits run out, after a Free user's 2nd and 3rd credits, or when someone tries a paid feature. Plan cards in compact form, monthly/yearly toggle, one lime button.

### 22. Error pages
- 404 and 500 with a short message and a "Go to dashboard" button.

### 23. Reminder email (template)
- "Time to post: [clip title] on [platform]." Clip thumbnail block, caption ready to copy, Download button.

## Internal (founder only)

### 24. Admin `/admin`
- Takedown queue: requests, status, the 24-hour deadline, remove-content button, repeat-infringer flag.
- Kill switch: turn link import on or off.
- Basic numbers: signups, paying users, cost per credit this week.
