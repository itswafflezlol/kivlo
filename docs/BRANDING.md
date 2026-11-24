# Kivlo: Brand Identity

Version 3. Palette sampled from the brand reference (light lime, ink black, white). UI patterns from a dashboard reference. Last updated November 22, 2026.

> v3.1 (2026-11-22): contrast table re-computed. Lilac ratios corrected; Control border (dark) changed from `#6A6A6A` to `#7C7C7C` because `#6A6A6A` fails 3:1 on Graphite (2.8:1) and Carbon (2.4:1), where most inputs sit.

## 1. Positioning

- **Name:** Kivlo (KIV-loh). Run a trademark, domain, social-handle, and app-store check before investing in a logo. The name appears in unrelated products.
- **Category:** Clipping studio for clippers: import footage, edit with an AI assistant, and find live campaigns on other platforms.
- **Promise:** Turn long streams into clips that are ready to post, and see where the work is.
- **Personality:** Bold, quick, and a little cheeky, but never cluttered. The brand is loud in marketing and calm inside the editor.

### Taglines

- **Primary:** Frame the moment.
- **Short:** Clip smarter.
- **Campaign feed:** Every active campaign. One clean feed.
- **Hold until publishing ships (Phase 4):** Frame the moment. Queue the rest.

## 2. Reference and what to borrow

The reference image is a brand board for a different company (Kyvraz Agency). Borrow the **direction**, not the assets.

**Borrow:** the light lime plus ink black plus white palette, heavy expressive display type, sticker-style badges, starburst shapes, wavy and checkered patterns, and the circle-avatar social treatment.

**Do not copy:** their logo, wordmark letterforms, crescent mark, or any layout that is recognizably theirs. Kivlo needs its own mark.

## 3. Color

Colors were sampled from the reference image. Treat the hex values as the starting point and keep them exactly unless a contrast check says otherwise.

### Brand colors

| Token | Hex | Role |
|---|---|---|
| Lime | `#BDEF72` | Signature brand color. Fills, buttons, highlights, badges |
| Lime Hover | `#CBF590` | Hover state for lime fills |
| Lime Press | `#A6D95A` | Pressed state for lime fills |
| Lime Soft | `#EAF8CC` | Tinted backgrounds, selected rows (light mode) |
| Lime Deep | `#3D7A0A` | Green text and links on light backgrounds |
| Ink | `#181818` | Primary dark. Dark-mode canvas and text on lime |
| Graphite | `#272727` | Dark cards and panels |
| Carbon | `#313131` | Raised dark surfaces, inputs on dark |
| White | `#FFFFFF` | Light cards and text on dark |
| Paper | `#F7F8F3` | Light app canvas (slightly warm, pairs with lime) |
| Mist | `#E4E4E2` | Optional light canvas behind white cards (dashboard look, section 7) |
| Lilac | `#BAAEF0` | Second chart series only. Never for buttons or actions |
| Lilac Soft | `#E9E5FB` | Tint behind lilac data |
| Lilac Deep | `#5B47C9` | Lilac text or icons on light backgrounds |

### Neutral and functional

| Token | Hex | Role |
|---|---|---|
| Slate (light mode) | `#6B6F66` | Secondary text on white or Paper |
| Slate (dark mode) | `#A1A5A0` | Secondary text on Ink or Graphite |
| Hairline (light) | `#D9DBD3` | Decorative dividers and card borders only |
| Hairline (dark) | `#3A3A3A` | Decorative dividers and card borders only |
| Control border (light) | `#8C9086` | Input, checkbox, and toggle borders |
| Control border (dark) | `#7C7C7C` | Input, checkbox, and toggle borders (was `#6A6A6A`, see v3.1 note) |
| Heat | `#F5A524` | Stream spikes, highlight scores, trending campaigns. Fill only on light (2.0:1 on white) |
| Heat Text (light) | `#8A5300` | Amber text on light backgrounds |
| Error (light) | `#D92D20` | Errors on light backgrounds |
| Error (dark) | `#FF6B63` | Errors on dark backgrounds |

### Contrast rules (calculated, WCAG 2.x)

Re-verify in code before shipping.

| Pairing | Ratio | Rule |
|---|---|---|
| Ink on Lime | 13.3:1 | Use for all text and icons on lime |
| Lime on Ink | 13.3:1 | Lime text and icons are fine on dark |
| Lime on Graphite | 11.2:1 | Fine |
| Lime on white | 1.3:1 | **Never** use lime as text or a thin icon on white |
| Lime Deep on white | 5.3:1 | Use for green text and links on light |
| Lime Deep on Paper | 4.9:1 | Passes AA |
| White on Ink | 17.8:1 | Fine |
| Slate (light) on white | 5.1:1 | Passes AA for body text |
| Slate (light) on Paper | 4.8:1 | Passes AA |
| Slate (dark) on Graphite | 6.0:1 | Passes AA |
| Slate (dark) on Carbon | 5.2:1 | Passes AA |
| Control border (light) on white | 3.3:1 | Meets the 3:1 minimum for UI controls |
| Control border (dark) on Ink / Graphite / Carbon | 4.3 / 3.6 / 3.1:1 | Meets the 3:1 minimum on every dark surface |
| Hairline (light) on white | 1.4:1 | Decoration only. Never for controls |
| Ink on Lilac | 8.8:1 | Use for text on lilac fills |
| Lilac on Graphite | 7.4:1 | Fine on dark |
| Lilac on white | 2.0:1 | **Never** use lilac as text on white. Use Lilac Deep (6.6:1) |
| Slate `#6B6F66` on Mist | 4.0:1 | Fails. On Mist use `#5A5E56` (5.2:1) for secondary text |
| Heat Text on white | 6.3:1 | Passes AA |
| Ink on Heat | 8.7:1 | Use for text on Heat fills |
| Error (light) on white | 4.8:1 | Passes AA |
| Error (dark) on Ink / Graphite | 6.4 / 5.4:1 | Passes AA |
| Lime next to Lilac | 1.5:1 | Too close to tell apart. Separate chart series with an Ink outline, a label, or a pattern |

Rules:

- Text on a lime surface is always Ink, never white.
- Lime is a fill or an accent on dark. On light backgrounds, green text uses Lime Deep.
- Never rely on color alone. Pair status colors with an icon or a label.
- Success and payout states use lime (dark mode) or Lime Deep (light mode) plus a check icon. Because the brand is green, do not use a second green for success.

## 4. Dark and light modes

- **Editor and app: dark by default.** Ink canvas, Graphite cards, Lime for the primary action, playhead, and active tab.
- **Light mode:** Paper canvas, white cards, Ink text, lime buttons with Ink labels, Lime Deep for links.
- **Marketing site:** can go full lime. Large lime sections with Ink type are on-brand there, but keep the product UI calmer.

### Design tokens (starting point)

```css
:root {
  --lime: #BDEF72;
  --lime-hover: #CBF590;
  --lime-press: #A6D95A;
  --lime-soft: #EAF8CC;
  --lime-deep: #3D7A0A;
  --ink: #181818;
  --graphite: #272727;
  --carbon: #313131;
  --white: #FFFFFF;
  --paper: #F7F8F3;
  --heat: #F5A524;
  --mist: #E4E4E2;
  --lilac: #BAAEF0;
  --lilac-soft: #E9E5FB;
  --lilac-deep: #5B47C9;

  --bg: var(--paper);
  --surface: var(--white);
  --text: var(--ink);
  --text-muted: #6B6F66;
  --border: #D9DBD3;
  --control-border: #8C9086;
  --link: var(--lime-deep);
  --error: #D92D20;
  --accent: var(--lime);
  --on-accent: var(--ink);
}

:root[data-theme="dark"] {
  --bg: var(--ink);
  --surface: var(--graphite);
  --text: var(--white);
  --text-muted: #A1A5A0;
  --border: #3A3A3A;
  --control-border: #7C7C7C;
  --link: var(--lime);
  --error: #FF6B63;
}
```

## 5. Typography

| Use | Font | Notes |
|---|---|---|
| Hero headline | Clash Display (Fontshare, ITF Free Font License) | 600 to 700. Landing hero h1 and the final CTA line only (v3.3, 2026-11-23) |
| Section headings, card titles, UI, body | Manrope (Google Fonts, OFL) | Headings 700 to 800, tracking -0.02em; body 400 to 500, 15 to 16px, line height 1.55. Replaces Satoshi (v3.3). Picked from Figma's "best fonts for websites" list at founder's request |
| Numbers and timecodes | JetBrains Mono, or `font-variant-numeric: tabular-nums` | Payout rates (`$1.25 / 1K`), clip durations (`00:42`), post times |

- Fonts are self-hosted (woff2 in the app). Fallback stack for UI: `Manrope, -apple-system, system-ui, "Segoe UI", sans-serif`. Do not self-host SF Pro.
- Keep display type out of dense UI. Buttons, tables, and the editor use Manrope.
- Confirm the fonts are available and licensed for your use before launch.

## 6. Visual language

- **Shapes:** rounded containers (16 to 24px radius), pill buttons, circle avatars.
- **Layout:** bento-style cards with 1px borders and generous spacing. Avoid heavy shadows.
- **Brand moments (marketing, empty states, onboarding):** sticker-style badges (slightly rotated, bold outline), starburst "new" or "hot" markers, wavy line patterns, and a checkerboard strip as an accent. Use sparingly.
- **Inside the product:** keep it calm. One lime action per view, Ink and Graphite surfaces, and Heat only for spikes and trending items.
- **Campaign cards:** show creator or brand, payout rate, remaining budget, platform tag, and a single action. Use a lime dot for active and Heat for trending.
- **Highlight scores:** high scores in lime, medium in Heat, low in Slate. Always show the number.
- **Focus ring:** 2px, Lime on dark and Ink on light, with a 2px offset.
- **Motion:** see section 7b (Motion). Functional motion only inside the editor.
- **Frosted glass:** optional for top bars and floating trimmers on dark (`backdrop-filter: blur(20px)`), as long as text contrast holds.

## 7. UI patterns

The UI reference is a third-party health dashboard (a dark sidebar, soft cards, and big friendly numbers). Borrow the patterns below, not its assets, icons, or illustrations.

### What to borrow

- **App shell:** a dark sidebar on a light canvas. The active nav item is a white pill with a small lime count badge.
- **Cards:** large rounded cards (20 to 24px radius) on a soft gray canvas, with one dark card in the grid for contrast.
- **Card header:** an icon in a circle, a title, and an overflow menu.
- **Big numbers:** a large value with a small unit label and a lime "+%" change chip.
- **Progress bars:** rounded ends, a big percentage, and a label on the right.
- **Charts on dark cards:** hatched bars for inactive periods and one solid lime bar for the highlighted period. Dot-grid and bubble visuals for density.
- **Pill controls:** search, date, and dropdown filters as rounded pills.
- **Header:** a large page title, a one-line subtitle, and a notification bell with a count.
- **Upgrade card:** a lime card at the bottom of the sidebar with an Ink button.

### How it maps to Kivlo

| Reference pattern | Kivlo use |
|---|---|
| Sidebar nav | Dashboard, Library, Editor, Campaigns, Exports, Billing |
| Metric card with change chip | Clips this week, source hours processed, average highlight score |
| Progress bar | Credits used this month. Turns Heat above 80% |
| Dot-grid card | Stream energy across a VOD timeline, with the strongest moments marked in lime |
| Dark chart card, one solid bar | Clips per week (or views, once view tracking exists) with the current week in lime |
| Notification bell | Render finished, import failed, new campaign matches a saved filter |
| Search pill | Search the library and campaigns |
| Upgrade card | Plan upgrade, shown when credits run low |

### Adaptations for Kivlo

- **Lilac is a data color only.** It is the second series in charts and tints. Buttons and actions stay lime.
- **Lime and lilac look alike in grayscale and at small sizes (1.5:1).** Separate them with an Ink outline, a direct label, or a pattern. Never rely on the color difference alone.
- **Canvas:** use Paper (`#F7F8F3`) by default. Mist (`#E4E4E2`) works behind white cards, but secondary text on Mist must be `#5A5E56`.
- **Text size:** the reference uses very small, light captions. In Kivlo, body text is 14px or larger, captions are at least 12px, and secondary text always meets 4.5:1.
- **Hatched bars:** pair them with a label or tooltip, since a pattern alone does not carry meaning for everyone.
- **The editor is dark, always.** The dashboard and library can follow the user's light or dark setting.
- **Illustration:** use original illustrations or none. Do not reuse the reference's 3D rocket.

### Hard rules (founder)

- **NO GENERIC/DEFAULT SCROLL.** Never show the browser's default scrollbars (gray track, arrow buttons) anywhere. Every scroll area uses the Kivlo thin scrollbar: no arrows, no track, a rounded thumb that matches the theme and only appears on hover or scroll. Panels must not scroll sideways at all.
- **Optical alignment everywhere.** Icons, glyphs and labels inside buttons are centered the way the eye sees them, not just by the math. Icons in a toolbar share one size and one baseline.
- **Motion:** smooth and short (150–350 ms), never chaotic. Animations are not turned off for reduced motion (founder decision).

## 7b. UI spec: how to get every screen right

This is the checklist for building any Kivlo UI. If a screen breaks one of these rules, it isn't done.

### Spacing and sizing
- **Spacing:** 4px grid. Use 4, 8, 12, 16, 20, 24, 32, 48. No odd values like 13px or 18px gaps.
- **Control heights:** 28 (compact, editor and timeline), 36 (default app), 44 (primary or marketing CTA, and the minimum touch target on mobile).
- **Radius:** pills and icon buttons are fully round. Inputs, selects and small tiles use 12px. Cards use 20–24px. Modals and big containers use 28px. Never use square corners.
- **Card padding:** 20px (compact) or 24px (default). Gaps between grid cards are 16px, or 12px in the editor.

### Buttons
- **Primary:** lime fill, Ink label, weight 600, a pill shape. One per view. Hover `--lime-hover`, press `--lime-press` plus scale 0.97.
- **Secondary:** a `--surface` fill with a 1px `--line-2` ring, `--fg` label. **Ghost:** no fill, `--muted` label, `--fg` on hover.
- **Destructive:** text or ring in `--error`, never a lime fill.
- **Label and icon:** the icon is 16px with an 8px gap. Icons sit to the left of the label, except "next" arrows, which go on the right.
- **Disabled:** 40% opacity and `cursor: not-allowed`. Never gray out a lime button into olive. Fade the whole button instead.

### Icon buttons (optical alignment)
- **One shared `IconButton`:** a square box (28/32/36px), `display: inline-grid; place-items: center`, and an icon box of 16px (28/32) or 18px (36).
- **Same family:** every icon uses the same stroke family and width (1.75px at 18px). Don't mix filled and outlined icons in one toolbar.
- **Optical nudges:** play triangles move +1px right, single chevrons ±0.5px toward their tip, and the bell sits 0.5px higher. Fix any icon that looks off with a translate. Never change the button's padding to fix it.
- **Text "buttons" in toolbars** (like `1×`) use the same square box, tabular numbers, and 12px semibold so they line up with the icons.
- **Toolbars:** buttons are spaced 4px apart. Separate groups with a 1px × 16px `--line-2` divider, centered vertically.

### Text in controls
- **Vertical centering:** pills and chips center their text with `leading-none` and equal top and bottom padding. Clash Display needs `translate-y-[0.06em]` to look centered.
- **Numbers, timecodes and slider values:** use `tabular-nums` so values don't shift width. Timecodes never wrap.
- **Truncate:** long names cut off with an ellipsis and show the full name on hover (`title`). Text never pushes a layout wider.

### Inputs, selects and sliders
- **Inputs:** 36px tall, 12px radius, a `--surface` fill with a 1px `--line-2` ring. Focus shows a 2px lime ring with a 2px offset. Errors show an `--error` ring and a 12px message underneath.
- **Selects:** always use the branded `Select` (a custom listbox with keyboard support). **Never use a native `<select>`.** Its dropdown can't be styled and breaks in dark mode.
- **Sliders:** a 4px track, with lime fill up to the thumb. The thumb is a 14px white circle with a soft shadow. The value sits in a fixed-width box (40px, right-aligned) on the same row. Double-click resets to the default. A slider plus its value must fit the narrowest panel, with no sideways overflow.
- **Segmented controls** (AA/Aa, 1/2/3, Link/Upload): a pill track; the active item is a raised `--surface` pill. Every segment is the same width.

### Cards, tiles and previews
- **Previews:** clip previews are always 9:16, use `object-cover`, and keep their radius. Nothing gets cut off, and there are no white strips.
- **Selected:** a 2px lime ring with a small check badge in the top-right corner. Hover: lift 2px and brighten the ring.
- **Pickers** (layouts, caption presets): small tiles in a grid where every option is visible without scrolling. Each tile shows a real preview, not an empty box.

### Scroll
- **NO GENERIC/DEFAULT SCROLL.** Every scroll area gets `.kv-scroll`: a thin rounded thumb, no track, no arrow buttons, and it fades in on hover or scroll.
- **No sideways scrolling,** except for the timeline and deliberate carousels.

### Overlays
- **Modals:** 28px radius and a `--surface` fill. The backdrop is ink at 50% with a 4px blur. They enter at scale 0.96 + fade over 200ms, and Esc or ✕ closes them. ✕ is an `IconButton` in the top-right, 16px from both edges.
- **Never use `alert`, `confirm` or `prompt`.** Edit inline. Confirm with an in-app dialog or with undo.
- **Toasts:** bottom-center, an ink pill, gone after 4s, with an Undo action where it helps.
- **Menus and popovers:** 16px radius with a `--line-2` ring and a soft shadow. They open with a 150ms fade + 4px rise.

### Motion
- **Duration and easing:** 150–350ms with ease-out (`cubic-bezier(0.22, 1, 0.36, 1)`). No bounce, no loops (except loading spinners), and nothing over 450ms.
- **Page change:** a 200ms cross-fade with an 8px rise. The active rail indicator slides between items.
- **Entering the editor:** the clip thumbnail grows into the preview, and the panels fade in 40ms apart. Exiting plays the same thing in reverse.
- **Press and hover:** buttons scale to 0.97 when pressed. Cards lift 2px on hover.
- **Reduced motion:** animations are not turned off for reduced motion (founder decision).

### Editor specifics
- **Always dark:** tiles are 12px apart with 20px radius. Graphite tiles sit on an Ink background.
- **Selection:** the selected item gets a lime outline and lime handles, and the inspector shows that item's controls.
- **No effects:** adjustments only. No filter presets, transitions, stickers or effects.
- **Exit:** there is always a visible Exit button in the top-left.

### Done checklist (every screen)
1. The screen works in light and dark mode (the editor is always dark), at 1440 and at 390.
2. No native selects, no default scrollbars, no sideways overflow, no browser dialogs.
3. Icons look centered to the eye, toolbars share one baseline, and numbers use `tabular-nums`.
4. Every state is covered: loading, empty and error (no blank screens).
5. axe finds 0 violations, the console is clean, and the keyboard focus ring is visible.

## 8. Logo and app icon

No logo files exist yet. This is the brief.

- **Wordmark:** "kivlo" in lowercase, a heavy geometric or grotesque sans with slightly tight spacing. Make it distinctive, but do not imitate the reference board's letterforms.
- **App icon:** a rounded square in Lime with an Ink "K". The K's diagonal arm doubles as a forward or play chevron, which fits clipping and moving a moment forward.
- **Accent mark:** a small four-point spark can mark a highlight, used sparingly and never paired with a crescent shape.
- **Variants needed:** Ink on Lime, Lime on Ink, Ink on white, white on Ink, and a one-color mark.
- **Minimum sizes:** icon 16px, wordmark 80px wide. Keep clear space equal to the K's stem width.
- **Deliverables:** SVG for all variants, a 1024px PNG app icon, and a circular social avatar.

## 9. Voice and microcopy

- **Tone:** direct, confident, a little playful. No hype, and no exclamation-point spam.
- **Actions:** one to three words, such as Import VOD, Auto-Frame, Find Highlights, Browse Campaigns, Export.
- **Framing:** focus on speed and clarity, not on friction.

Example strings:

- Empty library: "No clips yet. Import a VOD to find your first highlight."
- Processing: "Finding the best moments. This takes a few minutes."
- Export done: "Your clip is ready."
- Campaign card: "Joining happens on Whop. We'll take you there."
- Error: "That link didn't work. Check it's public and try again."

## 10. Open items

1. Name, trademark, and domain check for Kivlo.
2. Create the logo files (SVG) from the brief in section 8.
3. Verify every text and background pairing in code and fix any failures.
4. Choose and license fonts.
5. Decide when to introduce the "Queue the rest" tagline (after publishing ships).
6. Mock up the dashboard, library, and campaign feed using the section 7 patterns.
