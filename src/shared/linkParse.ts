export type ParsedLink =
  | {
      ok: true;
      platform: "youtube" | "twitch";
      kind: "video" | "short" | "live" | "vod" | "clip";
      id: string;
      channel?: string;
      startSec?: number;
      /** canonical URL used for oEmbed / display */
      url: string;
    }
  | {
      ok: false;
      reason: "empty" | "channel" | "playlist" | "unsupported" | "invalid";
      message: string;
    };

const YT_ID = /^[A-Za-z0-9_-]{11}$/;

function parseStart(t: string | null): number | undefined {
  if (!t) return undefined;
  const m = t.match(/^(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s?)?$/);
  if (!m) return /^\d+$/.test(t) ? parseInt(t, 10) : undefined;
  const sec = (parseInt(m[1] || "0") * 3600) + (parseInt(m[2] || "0") * 60) + parseInt(m[3] || "0");
  return sec > 0 ? sec : undefined;
}

function toUrl(raw: string): URL | null {
  const s = raw.trim();
  if (!s) return null;
  try {
    return new URL(/^https?:\/\//i.test(s) ? s : `https://${s}`);
  } catch {
    return null;
  }
}

const CHANNEL_MSG = "That's a channel link. Paste a link to one video.";
const UNSUPPORTED_MSG = "Kivlo supports YouTube and Twitch links for now.";

export function parseVideoLink(input: string): ParsedLink {
  const raw = input.trim();
  if (!raw) return { ok: false, reason: "empty", message: "Paste a link first." };
  const u = toUrl(raw);
  if (!u) return { ok: false, reason: "invalid", message: "That doesn't look like a link." };

  const host = u.hostname.toLowerCase().replace(/^(www\.|m\.|music\.)/, "");

  // ---- YouTube ----
  if (host === "youtu.be") {
    const id = u.pathname.slice(1).split("/")[0];
    if (YT_ID.test(id)) {
      const startSec = parseStart(u.searchParams.get("t"));
      return { ok: true, platform: "youtube", kind: "video", id, startSec, url: `https://www.youtube.com/watch?v=${id}` };
    }
    return { ok: false, reason: "invalid", message: "That doesn't look like a YouTube video link." };
  }
  if (host === "youtube.com" || host === "youtube-nocookie.com") {
    const parts = u.pathname.split("/").filter(Boolean);
    const first = parts[0] || "";
    if (first.startsWith("@") || ["channel", "c", "user"].includes(first))
      return { ok: false, reason: "channel", message: CHANNEL_MSG };
    if (first === "playlist" || (u.searchParams.has("list") && !u.searchParams.get("v")))
      return { ok: false, reason: "playlist", message: "That's a playlist. Paste a link to one video." };
    const v = u.searchParams.get("v");
    if (v) {
      if (!YT_ID.test(v)) return { ok: false, reason: "invalid", message: "That YouTube link looks broken." };
      const startSec = parseStart(u.searchParams.get("t"));
      return { ok: true, platform: "youtube", kind: "video", id: v, startSec, url: `https://www.youtube.com/watch?v=${v}` };
    }
    const kindMap: Record<string, "short" | "live" | "video"> = { shorts: "short", live: "live", embed: "video" };
    if (first in kindMap && parts[1] && YT_ID.test(parts[1])) {
      const startSec = parseStart(u.searchParams.get("t"));
      return { ok: true, platform: "youtube", kind: kindMap[first], id: parts[1], startSec, url: `https://www.youtube.com/watch?v=${parts[1]}` };
    }
    return { ok: false, reason: "invalid", message: "That doesn't look like a YouTube video link." };
  }

  // ---- Twitch ----
  if (host === "twitch.tv" || host === "clips.twitch.tv") {
    const parts = u.pathname.split("/").filter(Boolean);
    if (host === "clips.twitch.tv") {
      if (parts[0]) return { ok: true, platform: "twitch", kind: "clip", id: parts[0], url: raw.startsWith("http") ? raw : `https://${raw}` };
      return { ok: false, reason: "invalid", message: "That Twitch clip link looks broken." };
    }
    if (parts[0] === "videos" && /^\d+$/.test(parts[1] || "")) {
      const startSec = parseStart(u.searchParams.get("t"));
      return { ok: true, platform: "twitch", kind: "vod", id: parts[1], startSec, url: `https://www.twitch.tv/videos/${parts[1]}` };
    }
    if (parts[1] === "clip" && parts[0] && parts[2]) {
      return { ok: true, platform: "twitch", kind: "clip", id: parts[2], channel: parts[0], url: `https://clips.twitch.tv/${parts[2]}` };
    }
    if (parts[0] && !["videos", "directory", "settings", "p"].includes(parts[0]))
      return { ok: false, reason: "channel", message: "That's a channel. Paste a VOD link like twitch.tv/videos/…" };
    return { ok: false, reason: "invalid", message: "That doesn't look like a Twitch VOD or clip link." };
  }

  return { ok: false, reason: "unsupported", message: UNSUPPORTED_MSG };
}
