import { parseVideoLink } from "./linkParse.ts";

const cases = [
  // [input, expected subset]
  ["https://www.youtube.com/watch?v=dQw4w9WgXcQ", { ok: true, platform: "youtube", kind: "video", id: "dQw4w9WgXcQ" }],
  ["https://youtu.be/dQw4w9WgXcQ?t=42", { ok: true, platform: "youtube", id: "dQw4w9WgXcQ", startSec: 42 }],
  ["https://youtu.be/dQw4w9WgXcQ?t=1m30s", { ok: true, startSec: 90 }],
  ["youtube.com/watch?v=dQw4w9WgXcQ&list=PLx&index=2", { ok: true, id: "dQw4w9WgXcQ" }],
  ["https://www.youtube.com/watch?list=PLx&v=dQw4w9WgXcQ", { ok: true, id: "dQw4w9WgXcQ" }],
  ["https://www.youtube.com/shorts/abcDEF123_-?feature=share", { ok: true, kind: "short", id: "abcDEF123_-" }],
  ["https://www.youtube.com/live/dQw4w9WgXcQ", { ok: true, kind: "live", id: "dQw4w9WgXcQ" }],
  ["https://www.youtube.com/embed/dQw4w9WgXcQ", { ok: true, kind: "video", id: "dQw4w9WgXcQ" }],
  ["https://m.youtube.com/watch?v=dQw4w9WgXcQ", { ok: true, id: "dQw4w9WgXcQ" }],
  ["https://music.youtube.com/watch?v=dQw4w9WgXcQ", { ok: true, id: "dQw4w9WgXcQ" }],
  ["https://www.youtube.com/playlist?list=PLabcdef", { ok: false, reason: "playlist" }],
  ["https://www.youtube.com/watch?list=PLx", { ok: false, reason: "playlist" }],
  ["https://www.youtube.com/@MrBeast", { ok: false, reason: "channel" }],
  ["https://www.youtube.com/channel/UCX6OQ3DkcsbYNE6H8uQQuVA", { ok: false, reason: "channel" }],
  ["https://www.youtube.com/c/SomeCreator", { ok: false, reason: "channel" }],
  ["https://www.youtube.com/watch?v=short", { ok: false, reason: "invalid" }],
  ["https://www.twitch.tv/videos/2000000000", { ok: true, platform: "twitch", kind: "vod", id: "2000000000" }],
  ["https://m.twitch.tv/videos/2000000000", { ok: true, kind: "vod", id: "2000000000" }],
  ["https://clips.twitch.tv/SomeClipSlug-abc", { ok: true, platform: "twitch", kind: "clip", id: "SomeClipSlug-abc" }],
  ["https://www.twitch.tv/kaicenat/clip/CleanSlug-xyz", { ok: true, kind: "clip", id: "CleanSlug-xyz", channel: "kaicenat" }],
  ["https://www.twitch.tv/kaicenat", { ok: false, reason: "channel" }],
  ["https://kick.com/x", { ok: false, reason: "unsupported" }],
  ["https://www.tiktok.com/@user/video/123", { ok: false, reason: "unsupported" }],
  ["", { ok: false, reason: "empty" }],
  ["not a url at all", { ok: false }],
];

let pass = 0;
for (const [input, want] of cases) {
  const got = parseVideoLink(input);
  const ok = Object.entries(want).every(([k, v]) => got[k] === v);
  if (ok) { pass++; continue; }
  console.log("FAIL", JSON.stringify(input), "→", JSON.stringify(got));
}
console.log(`${pass}/${cases.length} passed`);
process.exit(pass === cases.length ? 0 : 1);
