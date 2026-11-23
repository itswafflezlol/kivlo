# Design Preferences

What the founder likes and dislikes in page and site design. Read this before designing or building any page. Add to it every time the founder reacts to a design.

Tags: **[confirmed]** = founder said it. **[inferred]** = read from references, not yet confirmed. Turn inferred items into confirmed or remove them as answers come in.

## Rules [confirmed]

- **Colors:** use `docs/BRANDING.md` only (lime, ink, white). Reference colors (sky blue etc.) are for layout ideas, not color. (2026-11-22)
- **Assets (updated 2026-11-23):** use Kivlo's own branding materials (`branding materials/` logos) and founder-provided videos. **Never generate assets** (no AI images, no stock, no made-up illustrations). Replaces the earlier "no images" rule.
- **Product in the hero:** yes. Show a mock KivloWorkspace / clip UI rising out of the hero. (2026-11-22)
- **KivloWorkspace mock must not look bland (2026-11-23):** real video playing, interactive (clickable moments and tabs), some color and depth.
- **Logo (2026-11-23):** use the provided logo image file in the nav (`branding materials/KilvoBlackNoBG.png`, K mark + wordmark). Never retype the wordmark as text.
- **Follow the references closely (2026-11-23):** founder wants the site to look amazing, like the references. Use their layouts and effects for real, not loosely.
- **Main CTA:** "Start Free". (2026-11-22)
- **Sections:** agent's call, whatever looks best. (2026-11-22)
- **Pricing:** show both monthly and yearly, with a toggle. (2026-11-22)
- **Fonts (2026-11-23):** wants better fonts than the first build (Bricolage Grotesque + Inter). After v3: likes the hero, wants better fonts for the features section and other pages; pointed to https://www.figma.com/resource-library/best-fonts-for-websites/ (Inter, DM Sans, Manrope, Rubik, Work Sans, Poppins...).
- **Clip variety (2026-11-23):** don't reuse the same 3 clips everywhere. Use the raw clips in `CLIPPING/CLIPS_READY_TO_EDIT` (one or more per streamer). Videos can play as you scroll.
- **Founder reaction to v3:** "looks amazing".
- **Look and motion (updated 2026-11-23):** nicer, interactive, better looking to the eye, with animations. Still no clutter and nothing crazy: smooth, purposeful motion (reveals, hovers, video, toggles), never flashy or constant. Always respect reduced-motion settings. Replaces "very little animation".

## Likes

### From references (batch 1, 2026-11-22)

Files in `mockups/references/`.

| # | File | What stands out |
|---|---|---|
| 1 | `ref-01-agnce-illustrated-hero.png` | Centered hero. Two-line headline with the second line in the accent color. Avatar "trusted by" pill above it. One black CTA. Hand-drawn anime-style landscape fading up into a white page |
| 2 | `ref-02-workspace-painted-sky.png` | Painted sky and landscape filling a rounded hero frame. Serif headline. Email field + dark button in one pill. Real product UI overlapping the bottom of the hero, with tabs |
| 3 | `ref-03-fuji-mountain-dashboard.jpg` | Deep blue sky and mountain. Headline on the left, subcopy and two CTAs on the right. Dashboard mockup rising out of the hero, framed by clouds. Frosted outer frame |
| 4 | `ref-04-capsule-cloud-cards.png` | Full sky-blue cloud background. Floating frosted pill nav. Huge white headline. Tilted product cards floating over the headline. One white pill CTA |
| 5 | `ref-05-studioa-3d-keycaps.png` | White rounded card on black. Massive, tight, bold sans headline. Playful 3D objects (keycaps) floating in the middle. Small pill CTA and a scroll arrow |

### From references (batch 2, 2026-11-22)

| # | File | What stands out |
|---|---|---|
| 6 | `ref-06-aeline-sky-cards-lime.png` | Lime pill CTA next to a dark pill. Two-tone headline (second line lighter). Product cards arranged in a curved row. Stats bento below: big numbers in mixed cards, one lime card, one ink card. Small "• ABOUT US" eyebrow labels |
| 7 | `ref-07-baseclub-bold-blue-lime.png` | Huge heavy display type, lime hand-drawn arrows, round rotated "get started free" sticker. Three step cards with lime number pills. Loud, brand-moment style |
| 8 | `ref-08-melius-curved-gallery.png` | Calm serif headline over a curved gallery of media cards. Chat-style prompt pill as the CTA. Alternating light and dark sections. Use-case tabs (Agencies / Creators / Marketers) |
| - | https://www.ssemble.com/ (direct competitor) | Structure: rotating headline ("Reassemble streams/podcasts/... into Viral Shorts"), Get Clips Now + "Plans from $6/mo · Cancel anytime", Game Mode before/after, real view stats, How it works in 3 steps, sources list, pricing with monthly/yearly toggle, credit cost table, features grid, Schedule and Post. Borrow structure only, never copy text |

### From references (batch 3, 2026-11-23)

| Site | What stands out |
|---|---|
| https://www.choppity.com/tools/free-ai-clip-maker/ | Paste-a-link box right in the hero ("Paste a video URL" or upload). Wall of real clips with view counts. 4 numbered steps. Long FAQ |
| https://vizard.ai/ | "Try it free. No sign up needed" + Get clips for free in the hero. Scrolling gallery of vertical clips by category. Feature tabs. Editor section showing real controls |
| https://clipping.net/ | Couldn't load (rate-limited, HTTP 429). Revisit |

### From references (batch 4, 2026-11-23): "really use them"

| # | File | What stands out |
|---|---|---|
| 6 | `ref-06-aeline-sky-cards-lime.png` (sent again) | Curved 3D arc of floating cards in the hero (perspective). Two-tone headline (2nd line lighter). Lime pill CTA with an Ink circle arrow icon. Small uppercase mono nav. Logo marquee strip. "• ABOUT US" eyebrow. Statement headline with inline round icon bubbles. Stats bento: media card with white stat overlay, gray quote card, lime stat card, ink stat card |
| 9 | `ref-09-sense-wavy-ribbon-video-cards.png` | Big rounded hero panel, thick wavy ribbon behind a giant word, rounded media thumbnails scattered around it. Lime pill buttons. Highlighted pill behind a phrase in the section headline. Row of video cards: center play button, bottom label pill with a lime arrow button |
| 10 | `ref-10-muse-inline-media-stacked-cards.png` | Media thumbnails inline inside the headline between words. Paint-stroke shapes. Carousel of media cards with a play icon and label chip. Services as stacked, offset, overlapping numbered cards (01/02/03), each a different color with a media thumbnail peeking out |

### From references (batch 5, 2026-11-23)

| # | File | What stands out |
|---|---|---|
| 11 | `ref-11-aeline-sky-fanned-cards.png` (Aeline again) | Fanned card row in slight 3D perspective floating over sky, "Rated 4.9/5" star strip under it. Stats bento: photo card with white stat chip, quote card with avatar cluster, lime stat card, ink stat card |
| 12 | `ref-12-sense-scattered-video-thumbs.png` (SENSE again) | Small rounded video thumbs scattered at different rotations around the hero word. Bottom row of tall video cards each with a big circular play button and a label pill + lime arrow chip |
| 13 | `ref-13-muse-inline-images-services.png` (Muse again) | Small rounded media thumbs inline *inside* the headline words. Numbered services cards (01/02/03) stacked and overlapping, each card a different color with a tilted media element |

Batch 5 confirms batch 4 patterns: fanned/arc cards over the hero, scattered thumbs, inline media in headlines, stacked offset cards, stats bento.

### App references (batch 6, 2026-11-23): dashboard + workspace

| # | File | What stands out |
|---|---|---|
| 14 | `ref-14-torenno-video-editor.png` | Editor inside one rounded dark frame, panels as rounded tiles with gaps. Centered breadcrumb "Projects / file ▾", white Export pill. Floating pill controls over the preview. Timeline: track headers with eye/lock, fully filled saturated clip bars (purple media with thumbnail, teal text blocks), waveform audio, accent playhead with knob |
| 15 | `ref-15-clideo-video-editor.png` | Left icon+label tool rail, active = filled accent circle. Glassy pill control clusters floating over the video. Inspector with segmented pill tabs, slider rows with numeric value boxes, Reset pill. Timeline toolbar pill (undo/redo/cut/delete), dotted second ruler, accent playhead knob, clips with thick accent end handles |
| 16 | `ref-16-fitness-dashboard-ink-rail.png` | Floating ink pill sidebar, icon-only, active = lime filled circle. Avatar + name pill with lime chevron circle; round white icon buttons. Ink hero stat card with big number and ring gauges. 2×2 white metric tiles with colored icon. Big lime/white/ink feature cards with imagery bleeding off. Right column plan panel with thumbnail stacks + "+" circles |
| 17 | `ref-17-mobile-health-app.png` | Mobile: greeting + avatar, soft lime hero card with ring, 2-col stat tiles, week date strip with lime pill for today, list rows with thumb stack + plus, bottom tab bar with raised center lime button. Bar chart with hatched capacity bars and a solid lime highlight bar |

Confirmed direction for the app: big radii, borderless white tiles on light bg, lime as the active/primary signal; workspace = dark rounded tiles, saturated filled timeline clips, floating transport pills.

Patterns shared by most references **[inferred]**:

- The hero sits inside a big rounded card or frame, not edge to edge.
- Sky, clouds and landscapes, often illustrated or painted (anime/Ghibli feel).
- The real product UI is shown in or overlapping the hero.
- Centered, very large, tightly spaced headline. Short subline.
- One main CTA, as a pill. Minimal nav: 3 to 5 links plus one button.
- Floating elements with soft depth: cards, 3D objects, frosted glass.
- Lots of empty space. Calm, premium, not busy.

## Dislikes

- **[confirmed]** Too much stuff on the page.
- **[confirmed]** Too many animations / crazy motion. (Wants nice animations, just not overdone.)
- **[confirmed, 2026-11-23]** Bland, flat UI mocks (first KivloWorkspace mock was "a little too bland").

## Open conflicts

- (Resolved 2026-11-22) Sky-blue references vs lime brand: brand wins.
- Ref 7's loud stickers and arrows vs "keep it simple": use at most one brand-moment sticker on the whole page, if any.
