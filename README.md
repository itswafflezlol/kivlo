# Kivlo

**Frame the moment.**

Kivlo is a monthly-subscription web app for clippers: people who cut short vertical clips from streamers' long-form content.

Paste a YouTube or Twitch link. Kivlo finds the best moments, crops them to vertical, and adds captions. Fix anything in KivloWorkspace, the built-in editor, then download the clips or schedule them with AI-written titles and hashtags.

## Status

Planning. No app code yet. Code starts after `docs/PRD.md` is approved. Target launch: before 2027.

## Repo layout

```
CLAUDE.md          Standing rules for the AI agent
docs/
  PLAN.md          Product scope, stack, architecture, build plan
  BRANDING.md      Name, colors, type, voice
  DESIGN_PREFERENCES.md  What the founder likes and dislikes in design
  BUDGET.md        Build and running costs, plan margins
  DECISIONS.md     Dated log of every decision and why
  PRD.md           Product requirements (coming next)
  SCREENS.md       Screen-by-screen descriptions (after the PRD)
  research/        Founder answers, specs, clipper survey
mockups/           Screen designs
prompts/           Prompts worth reusing
src/               The app (later)
```

## Ground rules

- Kivlo never hosts campaigns, holds funds, or pays anyone out. Campaign discovery (linking out to Whop, Clipping.net and others) comes later.
- Link import only accepts public videos. Users confirm they have the rights, and takedowns are handled within 24 hours.
- Every decision gets a dated line in `docs/DECISIONS.md`.

## Plans (draft)

| Plan | Monthly | Credits/mo |
|---|---|---|
| Free | $0 | 3 (watermarked) |
| Pro | $15 | 30 |
| Creator | $30 | 70 |
| Agency | $60 | 150 |

1 credit = up to 20 minutes of source video. Yearly pricing is still open, see `docs/BUDGET.md`.

## Next steps

1. Finish the PRD questions, then write `docs/PRD.md`.
2. List and describe every screen in `docs/SCREENS.md`.
3. Mock up the screens in `mockups/`.
4. Build.
