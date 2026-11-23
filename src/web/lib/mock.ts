import { asset } from "./asset";
export type Platform = "youtube" | "twitch";
export type PostPlatform = "tiktok" | "shorts" | "reels" | "x";
export type ProjectStatus = "processing" | "ready" | "failed";

export const user = {
  name: "Alex",
  email: "alex@example.com",
  plan: "pro" as const,
  creditsUsed: 12,
  creditsTotal: 30,
  renewsAt: "2026-12-15",
};

export type Word = { w: string; start: number; end: number; cut?: boolean };
export type Clip = {
  id: string; projectId: string; title: string; reason: string;
  score: number; startSec: number; endSec: number; duration: number;
  src: string; poster: string; strip: string;
  layout: "auto" | "split" | "face";
  captionPreset: string;
  words: Word[];
  hook: string; hashtags: Record<PostPlatform, string[]>;
};
export type Project = {
  id: string; title: string; platform: Platform; sourceLength: number;
  status: ProjectStatus; createdAt: string; clipIds: string[];
};
export type ScheduledPost = {
  id: string; clipId: string; platform: PostPlatform; time: string;
  status: "scheduled" | "reminder" | "posted" | "failed";
};

const w = (list: [string, number][]): Word[] =>
  list.map(([word, start], i) => ({ w: word, start, end: list[i + 1]?.[1] ?? start + 0.4 }));

const clip = (
  id: string, projectId: string, title: string, reason: string, score: number,
  startSec: number, file: string, words: [string, number][],
  layout: Clip["layout"] = "auto",
  tag = "#justchatting"
): Clip => ({
  id, projectId, title, reason, score, startSec,
  endSec: startSec + 6, duration: 6,
  src: asset(`/videos/wall/${file}.mp4`),
  poster: asset(`/videos/wall/${file}.jpg`),
  strip: asset(`/videos/strips/${file}.jpg`),
  layout, captionPreset: "Karaoke pop",
  words: w(words),
  hook: title,
  hashtags: {
    tiktok: ["#streamclips", "#twitch", tag],
    shorts: ["#streamclips", "#clips"],
    reels: ["#twitch", tag],
    x: ["#clips"],
  },
});

// The app's shared "today" — Monday 23 Nov 2026. Everything time-based derives from this.
export const TODAY_ISO = "2026-11-23";
export const WEEK_START_ISO = "2026-11-23"; // Monday of the current week

export const clips: Clip[] = [
  clip("c1", "p1", "Duke slams Kai on stream", "Chat spikes 3x on the slam", 94, 812, "kai-duke-slam-1",
    [["No", 0], ["way", 0.4], ["Duke", 0.8], ["just", 1.2], ["slammed", 1.6], ["him", 2.2]]),
  clip("c2", "p1", "Kai x Denzel freestyle", "Crowd reaction peaks on the verse", 88, 1043, "kai-denzel-1",
    [["Denzel", 0.3], ["is", 0.6], ["actually", 0.9], ["going", 1.3], ["off", 1.7]]),
  clip("c3", "p1", "The Dr Pepper phone save", "Slow build then payoff", 81, 1580, "kai-duke-pepper-1",
    [["He", 0.2], ["hit", 0.5], ["the", 0.8], ["phone", 1.1], ["mid", 1.5], ["air", 1.9]]),
  clip("c4", "p1", "Kai finds Emily at the museum", "Surprise meetup, chat goes wild", 79, 2015, "kai-museum-1",
    [["Wait", 0.1], ["is", 0.4], ["that", 0.7], ["Emily", 1.0], ["over", 1.4], ["there", 1.7]]),
  clip("c5", "p2", "Dean takes Vice City back", "First big chase, big reaction", 92, 300, "deansocool-1",
    [["He", 0.1], ["actually", 0.4], ["did", 0.7], ["that", 1.0], ["on", 1.4], ["stream", 1.7]], "split", "#gta6"),
  clip("c6", "p2", "Clix robs the first store", "First robbery, instant reaction", 87, 640, "clix-1",
    [["First", 0.1], ["store", 0.4], ["down", 0.7], ["already", 1.0], ["bro", 1.5]], "auto", "#gta6"),
  clip("c7", "p3", "Emily & Nova’s dance break", "IRL moment, instant reaction", 90, 120, "emily-dance-1",
    [["They", 0.2], ["really", 0.5], ["did", 0.8], ["the", 1.1], ["whole", 1.4], ["dance", 1.8]], "auto", "#irl"),
  clip("c8", "p3", "Girlset knew who Emily was", "Fan moment, wholesome reaction", 84, 522, "emily-girlset-1",
    [["She", 0.1], ["knew", 0.4], ["exactly", 0.8], ["who", 1.2], ["Emily", 1.5], ["was", 1.8]], "auto", "#irl"),
  clip("c9", "p4", "Roblox kids troll Speed", "First day lobby chaos", 86, 240, "speed-roblox-1",
    [["The", 0.2], ["kids", 0.5], ["found", 0.8], ["him", 1.1], ["instantly", 1.5]], "auto", "#roblox"),
  clip("c10", "new-demo", "Marlon pulls up to the Heat game", "Arena IRL, crowd noise spike", 85, 700, "marlon-heat-1",
    [["Marlon", 0.2], ["really", 0.6], ["pulled", 0.9], ["up", 1.2], ["courtside", 1.6]], "auto", "#irl"),
  clip("c11", "p1", "Druski & Tylil dunk on Kai", "Panel chaos, chat spam W", 89, 410, "kai-druski-1",
    [["They", 0.2], ["came", 0.5], ["for", 0.8], ["his", 1.1], ["neck", 1.4]], "auto", "#kaicenat"),
  clip("c12", "p3", "Cinna's Streamer Awards fit", "Red carpet reaction", 83, 260, "cinna-awards-1",
    [["The", 0.1], ["fit", 0.4], ["check", 0.7], ["hit", 1.0]], "auto", "#irl"),
  clip("c13", "p2", "Agent00's first heist", "Heist goes sideways fast", 91, 355, "agent00-1",
    [["The", 0.2], ["plan", 0.5], ["fell", 0.8], ["apart", 1.1]], "auto", "#gta6"),
  clip("c14", "p2", "Adapt hits the stunt jump", "Clean landing, big pop-off", 80, 190, "adapt-1",
    [["No", 0.1], ["way", 0.4], ["he", 0.7], ["landed", 1.0], ["it", 1.3]], "auto", "#gta6"),
  clip("c15", "p4", "Emily meets the monster at TwitchCon", "Costume jumpscare, chat spams LUL", 88, 640, "emily-monster-1",
    [["That's", 0.2], ["not", 0.5], ["a", 0.7], ["monster", 1.0]], "auto", "#irl"),
];

export const projects: Project[] = [
  { id: "p1", title: "Kai & the squad — Just Chatting", platform: "youtube", sourceLength: 22800, status: "ready", createdAt: "2026-11-16", clipIds: ["c1", "c2", "c3", "c4", "c11"] },
  { id: "p2", title: "Dean & Clix GTA 6 marathon", platform: "twitch", sourceLength: 14400, status: "ready", createdAt: "2026-11-17", clipIds: ["c5", "c6", "c13", "c14"] },
  { id: "p3", title: "Emily IRL week", platform: "twitch", sourceLength: 9600, status: "processing", createdAt: "2026-11-19", clipIds: ["c7", "c8", "c12"] },
  { id: "p4", title: "Speed’s Roblox stream", platform: "youtube", sourceLength: 7200, status: "failed", createdAt: "2026-11-12", clipIds: ["c9", "c15"] },
  { id: "new-demo", title: "Marlon Heat game IRL", platform: "twitch", sourceLength: 18000, status: "processing", createdAt: "2026-11-22", clipIds: ["c10"] },
];

export const scheduledPosts: ScheduledPost[] = [
  { id: "s1", clipId: "c1", platform: "tiktok", time: "2026-11-23T09:30:00", status: "scheduled" },
  { id: "s2", clipId: "c2", platform: "shorts", time: "2026-11-23T12:00:00", status: "reminder" },
  { id: "s3", clipId: "c5", platform: "reels", time: "2026-11-23T18:00:00", status: "scheduled" },
  { id: "s4", clipId: "c3", platform: "x", time: "2026-11-23T20:30:00", status: "scheduled" },
  { id: "s5", clipId: "c4", platform: "tiktok", time: "2026-11-24T11:30:00", status: "scheduled" },
  { id: "s6", clipId: "c12", platform: "shorts", time: "2026-11-24T15:00:00", status: "reminder" },
  { id: "s7", clipId: "c1", platform: "reels", time: "2026-11-24T19:30:00", status: "scheduled" },
  { id: "s8", clipId: "c5", platform: "tiktok", time: "2026-11-25T10:00:00", status: "scheduled" },
  { id: "s9", clipId: "c4", platform: "x", time: "2026-11-25T13:00:00", status: "scheduled" },
  { id: "s10", clipId: "c2", platform: "shorts", time: "2026-11-25T17:30:00", status: "scheduled" },
  { id: "s11", clipId: "c2", platform: "tiktok", time: "2026-11-26T09:00:00", status: "scheduled" },
  { id: "s12", clipId: "c10", platform: "reels", time: "2026-11-26T16:00:00", status: "scheduled" },
  { id: "s13", clipId: "c3", platform: "shorts", time: "2026-11-27T12:30:00", status: "scheduled" },
  { id: "s14", clipId: "c5", platform: "x", time: "2026-11-27T19:00:00", status: "scheduled" },
  { id: "s15", clipId: "c11", platform: "tiktok", time: "2026-11-28T10:30:00", status: "scheduled" },
  { id: "s16", clipId: "c3", platform: "reels", time: "2026-11-28T14:30:00", status: "scheduled" },
  { id: "s17", clipId: "c4", platform: "tiktok", time: "2026-11-29T11:00:00", status: "scheduled" },
  { id: "s18", clipId: "c6", platform: "shorts", time: "2026-11-29T18:30:00", status: "scheduled" },
  { id: "s19", clipId: "c8", platform: "shorts", time: "2026-11-21T19:00:00", status: "posted" },
  { id: "s20", clipId: "c1", platform: "tiktok", time: "2026-11-14T17:00:00", status: "failed" },
  { id: "s21", clipId: "c11", platform: "tiktok", time: "2026-12-02T18:00:00", status: "scheduled" },
  { id: "s22", clipId: "c12", platform: "reels", time: "2026-12-03T19:30:00", status: "scheduled" },
  { id: "s23", clipId: "c13", platform: "shorts", time: "2026-12-05T17:00:00", status: "scheduled" },
  { id: "s24", clipId: "c2", platform: "x", time: "2026-12-08T20:00:00", status: "scheduled" },
];

export type PresetKind = "captions" | "layouts" | "looks" | "hooks" | "export" | "posting";
export type Preset = {
  id: string; name: string; style: string; color: string; isDefault: boolean;
  kind: PresetKind; mine: boolean; desc: string;
};
const P = (id: string, name: string, kind: PresetKind, style: string, color: string, desc: string, def = false, mine = false): Preset =>
  ({ id, name, kind, style, color, desc, isDefault: def, mine });
export const presets: Preset[] = [
  P("pr1", "Karaoke pop", "captions", "pop", "#BDEF72", "Word-by-word lime highlight", true),
  P("pr2", "Clean white", "captions", "clean", "#FFFFFF", "Simple white line, subtle shadow"),
  P("pr3", "Bold box", "captions", "box", "#BAAEF0", "Ink box behind every phrase"),
  P("pr4", "Neon outline", "captions", "neon", "#7DF9FF", "White fill, neon glow edge"),
  P("pr5", "Highlighter", "captions", "high", "#F5A524", "Marker swipe behind the active word"),
  P("pr6", "Typewriter", "captions", "type", "#FFFFFF", "Letter-by-letter reveal"),
  P("pr7", "Bounce", "captions", "bounce", "#BDEF72", "Words pop in with spring"),
  P("pr8", "Minimal lowercase", "captions", "min", "#FFFFFF", "Small lowercase line, bottom third"),
  P("pr9", "Big headline", "captions", "big", "#FFFFFF", "Huge two-word rows, no emoji"),
  P("pr10", "Two-tone stack", "captions", "twotone", "#BAAEF0", "White + lilac alternating lines"),
  P("pl1", "Auto", "layouts", "auto", "#BDEF72", "Kivlo picks per moment"),
  P("pl2", "Facecam + gameplay", "layouts", "split", "#BAAEF0", "40/60 split with dark divider"),
  P("pl3", "Face only", "layouts", "face", "#FFFFFF", "Full-bleed face crop"),
  P("lk1", "Streamer pack", "looks", "pop", "#BDEF72", "Karaoke pop + auto layout + hook banner"),
  P("lk2", "Podcast clean", "looks", "clean", "#FFFFFF", "Clean white + face only + soft corners"),
  P("lk3", "Hype", "looks", "bounce", "#F5A524", "Bounce captions + bold hook banner"),
  P("h1", "Wait for it…", "hooks", "hook", "#FFFFFF", "Tension opener for slow builds"),
  P("h2", "{streamer} actually did that", "hooks", "hook", "#BDEF72", "Disbelief hook, fills creator name"),
  P("h3", "POV: {moment}", "hooks", "hook", "#FFFFFF", "POV framing for relatable clips"),
  P("h4", "He didn't see it coming", "hooks", "hook", "#FFFFFF", "Fail/scare lead-in"),
  P("e1", "TikTok 1080p60", "export", "export", "#BDEF72", "1080×1920 · 60fps · MP4"),
  P("e2", "Shorts 1080p", "export", "export", "#FF6B63", "1080×1920 · 30fps · MP4"),
  P("e3", "Reels", "export", "export", "#BAAEF0", "1080×1920 · 30fps · MP4"),
  P("e4", "X 720p", "export", "export", "#FFFFFF", "720×1280 · 30fps · small file"),
  P("e5", "Fast draft", "export", "export", "#A1A5A0", "720p preview, renders in seconds"),
  P("po1", "TikTok evening", "posting", "post", "#BDEF72", "#fyp tags · 6–9pm window"),
  P("po2", "Shorts lunch", "posting", "post", "#FF6B63", "#shorts tags · 11am–1pm"),
];
export type AppNotification = {
  id: string; text: string; time: string; read: boolean;
  kind: "render" | "post" | "billing" | "system";
};
export const notifications: AppNotification[] = [
  { id: "n1", text: "Clips ready: Kai & the squad — Just Chatting", time: "2h ago", read: false, kind: "render" },
  { id: "n2", text: "Reminder: post “Duke slams Kai on stream” on TikTok", time: "5h ago", read: false, kind: "post" },
  { id: "n3", text: "Import failed: Speed’s Roblox stream (credits refunded)", time: "1d ago", read: false, kind: "render" },
  { id: "n4", text: "Posted: “Emily & Nova’s dance break” on Shorts", time: "1d ago", read: true, kind: "post" },
  { id: "n5", text: "Pro plan renewed — 30 credits added", time: "8d ago", read: true, kind: "billing" },
  { id: "n6", text: "New: caption preset “Neon outline” added to Kivlo presets", time: "9d ago", read: true, kind: "system" },
];

export const invoices = [
  { id: "KV-2026-0011", date: "Nov 15, 2026", desc: "Pro plan · monthly", amount: 12, status: "Paid" },
  { id: "KV-2026-0010", date: "Oct 15, 2026", desc: "Pro plan · monthly", amount: 12, status: "Paid" },
  { id: "KV-2026-0009", date: "Sep 15, 2026", desc: "Pro plan · monthly", amount: 12, status: "Paid" },
  { id: "KV-2026-0008", date: "Aug 15, 2026", desc: "Pro plan · monthly", amount: 12, status: "Paid" },
  { id: "KV-2026-0007", date: "Jul 15, 2026", desc: "Pro plan · monthly", amount: 12, status: "Paid" },
  { id: "KV-2026-0006", date: "Jun 15, 2026", desc: "Pro plan · monthly", amount: 12, status: "Paid" },
  { id: "KV-2026-0005", date: "May 20, 2026", desc: "Credit refund · failed import", amount: -3, status: "Refunded" },
];
export const billing = {
  card: { brand: "Visa", last4: "4242", exp: "08/28", holder: "Alex" },
  email: "alex@example.com",
  address: "1200 King St W, Toronto, ON",
  creditHistory: [14, 22, 9, 18, 26, 12],
};

export const connectedAccounts = [
  { id: "tiktok", name: "TikTok", role: "Posts to", handle: "@alex", connected: true },
  { id: "shorts", name: "YouTube Shorts", role: "Posts to", handle: "", connected: false },
  { id: "reels", name: "Instagram Reels", role: "Posts to", handle: "", connected: false },
  { id: "x", name: "X", role: "Posts to", handle: "", connected: false },
  { id: "twitch", name: "Twitch", role: "Imports from", handle: "", connected: false },
  { id: "youtube", name: "YouTube", role: "Imports from", handle: "", connected: false },
];

export const clipById = (id: string) => clips.find((c) => c.id === id);
export const projectById = (id: string) => projects.find((p) => p.id === id);
export const clipsOf = (projectId: string) => clips.filter((c) => c.projectId === projectId);
export const postOf = (id: string) => scheduledPosts.find((s) => s.id === id);

/** 1 credit per 20 minutes of source, rounded up. */
export function creditsFor(minutes: number) {
  return Math.ceil(minutes / 20);
}
// self-check: 20→1, 21→2, 0→0, 380min→19
console.assert(creditsFor(20) === 1 && creditsFor(21) === 2 && creditsFor(0) === 0 && creditsFor(380) === 19, "creditsFor broke");
