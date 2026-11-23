export type Platform = "youtube" | "twitch";
export type PostPlatform = "tiktok" | "shorts" | "reels" | "x";
export type ProjectStatus = "processing" | "ready" | "failed";

export const user = {
  name: "Shabo",
  email: "shabo@kivlo.app",
  plan: "pro" as const,
  creditsUsed: 12,
  creditsTotal: 30,
  renewsAt: "2026-01-15",
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
export type Preset = { id: string; name: string; style: string; color: string; isDefault: boolean };

const w = (list: [string, number][]): Word[] =>
  list.map(([word, start], i) => ({ w: word, start, end: list[i + 1]?.[1] ?? start + 0.4 }));

const clip = (
  id: string, projectId: string, title: string, reason: string, score: number,
  startSec: number, file: string, words: [string, number][],
  layout: Clip["layout"] = "auto"
): Clip => ({
  id, projectId, title, reason, score, startSec,
  endSec: startSec + 6, duration: 6,
  src: `/videos/wall/${file}.mp4`,
  poster: `/videos/wall/${file}.jpg`,
  strip: `/videos/strips/${file}.jpg`,
  layout, captionPreset: "Karaoke pop",
  words: w(words),
  hook: title,
  hashtags: {
    tiktok: ["#gaming", "#streamclips", "#gta6"],
    shorts: ["#gaming", "#clips"],
    reels: ["#gaming", "#twitch"],
    x: ["#clips"],
  },
});

export const clips: Clip[] = [
  clip("c1", "p1", "He actually did that", "Chat spikes 3x on the reveal", 94, 812, "deansocool-1",
    [["No", 0], ["way", 0.4], ["he", 0.8], ["did", 1.2], ["that", 1.6], ["on", 2.2], ["stream", 2.6]]),
  clip("c2", "p1", "The car explodes mid-chase", "Reaction peak with loud beat", 88, 1043, "cinna-1",
    [["Wait", 0.3], ["the", 0.6], ["car", 0.9], ["just", 1.3], ["blew", 1.7], ["up", 2.1]]),
  clip("c3", "p1", "Wait til he does it", "Slow build then payoff", 81, 1580, "agent00-1",
    [["Wait", 0.2], ["til", 0.5], ["he", 0.8], ["does", 1.1], ["it", 1.5]]),
  clip("c4", "p1", "Marlon almost crashes", "Near miss, chat goes wild", 79, 2015, "marlon-1",
    [["Almost", 0.1], ["crashed", 0.5], ["the", 1.0], ["whole", 1.4], ["run", 1.7]]),
  clip("c5", "p2", "Clix robs the first store", "First robbery, big reaction", 92, 300, "clix-1",
    [["First", 0.1], ["store", 0.5], ["down", 0.9], ["already", 1.4]], "split"),
  clip("c6", "p2", "Ruthless streak continues", "Third store in a row", 87, 640, "clix-2",
    [["Third", 0.2], ["one", 0.6], ["in", 0.9], ["a", 1.1], ["row", 1.4]]),
  clip("c7", "p3", "Emily gets caught", "IRL clip, instant reaction", 90, 120, "extraemily-1",
    [["Caught", 0.2], ["in", 0.6], ["4k", 0.9], ["lol", 1.3]]),
  clip("c8", "p3", "Rakai vs the monster", "Scare moment, avatar pops", 84, 522, "rakai-1",
    [["That's", 0.1], ["not", 0.4], ["a", 0.6], ["monster", 0.9], ["that's", 1.4], ["mum", 1.7]]),
  clip("c9", "p4", "Stage playthrough moment", "Crowd reaction audio spike", 77, 240, "gta16stage-1",
    [["Live", 0.3], ["on", 0.7], ["stage", 1.0], ["rn", 1.4]]),
  clip("c10", "new-demo", "Adapt hunts alligators", "Chaotic duo moment", 85, 700, "adapt-1",
    [["Hunting", 0.2], ["gators", 0.7], ["in", 1.1], ["gta", 1.4]]),
];

export const projects: Project[] = [
  { id: "p1", title: "Dean's Vice City marathon — day 3", platform: "twitch", sourceLength: 22800, status: "ready", createdAt: "2025-12-28", clipIds: ["c1", "c2", "c3", "c4"] },
  { id: "p2", title: "CLIX GTA 6 marathon", platform: "youtube", sourceLength: 14400, status: "ready", createdAt: "2025-12-30", clipIds: ["c5", "c6"] },
  { id: "p3", title: "Emily IRL week", platform: "twitch", sourceLength: 9600, status: "processing", createdAt: "2026-01-02", clipIds: ["c7", "c8"] },
  { id: "p4", title: "Stage event VOD", platform: "youtube", sourceLength: 7200, status: "failed", createdAt: "2025-12-26", clipIds: ["c9"] },
  { id: "new-demo", title: "Adapt & Marlon collab stream", platform: "twitch", sourceLength: 18000, status: "processing", createdAt: "2026-01-04", clipIds: ["c10"] },
];

export const scheduledPosts: ScheduledPost[] = [
  { id: "s1", clipId: "c1", platform: "tiktok", time: "2026-01-05T19:30:00", status: "scheduled" },
  { id: "s2", clipId: "c2", platform: "shorts", time: "2026-01-05T21:00:00", status: "reminder" },
  { id: "s3", clipId: "c5", platform: "reels", time: "2026-01-06T18:00:00", status: "scheduled" },
  { id: "s4", clipId: "c3", platform: "x", time: "2026-01-07T20:00:00", status: "scheduled" },
  { id: "s5", clipId: "c7", platform: "tiktok", time: "2026-01-08T19:30:00", status: "scheduled" },
  { id: "s6", clipId: "c8", platform: "shorts", time: "2025-12-31T19:00:00", status: "posted" },
];

export const presets: Preset[] = [
  { id: "pr1", name: "Karaoke pop", style: "pop", color: "#BDEF72", isDefault: true },
  { id: "pr2", name: "Clean white", style: "clean", color: "#FFFFFF", isDefault: false },
  { id: "pr3", name: "Bold box", style: "box", color: "#BAAEF0", isDefault: false },
];

export const notifications = [
  { id: "n1", text: "Clips ready: Dean's Vice City marathon", time: "2h ago" },
  { id: "n2", text: "Reminder: post “He actually did that” on TikTok", time: "5h ago" },
  { id: "n3", text: "Import failed: Stage event VOD (credits refunded)", time: "1d ago" },
];

export const invoices = [
  { id: "in_1", date: "2025-12-15", amount: 12, status: "Paid" },
  { id: "in_2", date: "2025-11-15", amount: 12, status: "Paid" },
  { id: "in_3", date: "2025-10-15", amount: 12, status: "Paid" },
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
