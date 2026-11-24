// Serializable edit document for a clip. Everything is stored in normalized
// 0–1 frame coordinates (x,y = center of the item) and timeline seconds, so a
// later FFmpeg export can consume it directly.
export type Rect = { x: number; y: number; scale: number; rotation: number };

export type Adjust = {
  brightness: number; contrast: number; saturation: number; exposure: number; sharpen: number;
  temperature: number; tint: number; highlights: number; shadows: number; vibrance: number; fade: number;
  vignette: number;
};

export type TextOverlay = {
  id: string; text: string;
  x: number; y: number; w: number; rotation: number;
  start: number; end: number;
  font: string; size: number; color: string; stroke: string; bg: string;
};

// A kept portion of the source clip. Segments are laid out back-to-back on the
// timeline (magnetic): deleting or trimming one ripples the rest.
export type Segment = { id: string; srcStart: number; srcEnd: number };

// One karaoke caption word block on the timeline (wordIdx → clip.words).
export type CaptionBlock = { id: string; wordIdx: number; start: number; end: number };

export type EditDoc = {
  adjust: Adjust;
  crop: Rect;                                            // video pan/zoom/rotate (auto + face layouts)
  caption: { x: number; y: number; w: number; scale: number };
  split: { face: Rect; game: Rect; divider: number };    // divider = split point 0–1
  overlays: TextOverlay[];
  segments: Segment[];
  captionBlocks: CaptionBlock[];
};

const ZERO_ADJUST: Adjust = {
  brightness: 0, contrast: 0, saturation: 0, exposure: 0, sharpen: 0,
  temperature: 0, tint: 0, highlights: 0, shadows: 0, vibrance: 0, fade: 0, vignette: 0,
};
export const ZERO_RECT: Rect = { x: 0, y: 0, scale: 1, rotation: 0 };

let uid = 0;
export const nid = () => `e${Date.now().toString(36)}${(uid++).toString(36)}`;

export function defaultDoc(clip: { duration: number; words: { start: number; end: number; cut?: boolean }[] }): EditDoc {
  return {
    adjust: { ...ZERO_ADJUST },
    crop: { ...ZERO_RECT },
    caption: { x: 0.5, y: 0.62, w: 0.94, scale: 1 },
    split: { face: { ...ZERO_RECT }, game: { ...ZERO_RECT }, divider: 0.4 },
    overlays: [],
    segments: [{ id: nid(), srcStart: 0, srcEnd: clip.duration }],
    captionBlocks: clip.words.map((w, i) => ({ id: `cb${i}`, wordIdx: i, start: w.start, end: w.end })),
  };
}

const num = (v: unknown, lo: number, hi: number, dflt: number) =>
  typeof v === "number" && Number.isFinite(v) ? Math.max(lo, Math.min(hi, v)) : dflt;
const rect = (r: unknown, dflt: Rect): Rect => {
  const o = (r ?? {}) as Partial<Rect>;
  return { x: num(o.x, -1, 1, dflt.x), y: num(o.y, -1, 1, dflt.y), scale: num(o.scale, 0.5, 4, dflt.scale), rotation: num(o.rotation, -360, 360, dflt.rotation) };
};

export function loadDoc(clipId: string, clip: { duration: number; words: { start: number; end: number; cut?: boolean }[] }): EditDoc {
  const base = defaultDoc(clip);
  try {
    const raw = localStorage.getItem(`kivlo.edit.${clipId}`);
    if (!raw) return base;
    const d = JSON.parse(raw) as Partial<EditDoc>;
    // Segments drive every timeline calculation — reject a doc whose segments
    // can't produce a positive duration instead of letting NaNs break the editor.
    const segs = Array.isArray(d.segments)
      ? d.segments
          .filter((s): s is Segment => !!s && num(s.srcStart, 0, clip.duration, -1) >= 0 && num(s.srcEnd, 0, Infinity, -1) > s.srcStart)
          .sort((a, b) => a.srcStart - b.srcStart)
      : [];
    if (!segs.length) return base;
    return {
      ...base, ...d,
      adjust: Object.fromEntries(Object.entries({ ...base.adjust, ...d.adjust }).map(([k, v]) => {
        const lim = k === "sharpen" || k === "vignette" ? [0, 100] : [-100, 100];
        return [k, num(v, lim[0], lim[1], 0)];
      })) as Adjust,
      crop: rect(d.crop, base.crop),
      caption: {
        x: num(d.caption?.x, 0, 1, base.caption.x), y: num(d.caption?.y, 0, 1, base.caption.y),
        w: num(d.caption?.w, 0.3, 1, base.caption.w), scale: num(d.caption?.scale, 0.5, 2, base.caption.scale),
      },
      split: { divider: num(d.split?.divider, 0.15, 0.85, base.split.divider), face: rect(d.split?.face, base.split.face), game: rect(d.split?.game, base.split.game) },
      overlays: (Array.isArray(d.overlays) ? d.overlays : [])
        .filter((o): o is TextOverlay => !!o && typeof o.id === "string" && num(o.end, 0, Infinity, -1) > num(o.start, 0, Infinity, 0))
        .map((o) => ({ ...o, x: num(o.x, 0, 1, 0.5), y: num(o.y, 0, 1, 0.5), w: num(o.w, 0.1, 1.4, 0.6), rotation: num(o.rotation, -360, 360, 0) })),
      segments: segs,
      captionBlocks: (Array.isArray(d.captionBlocks) ? d.captionBlocks : base.captionBlocks)
        .filter((b): b is CaptionBlock => !!b && b.wordIdx >= 0 && b.wordIdx < clip.words.length && num(b.end, 0, Infinity, -1) > num(b.start, 0, Infinity, 0)),
    };
  } catch {
    return base;
  }
}

export function saveDoc(clipId: string, doc: EditDoc) {
  try { localStorage.setItem(`kivlo.edit.${clipId}`, JSON.stringify(doc)); } catch { /* quota — fine for demo */ }
}

// --- timeline helpers (segments are contiguous, in order) ---
export const totalDur = (segs: Segment[]) => segs.reduce((a, s) => a + (s.srcEnd - s.srcStart), 0);
export const segOffsets = (segs: Segment[]) => {
  let off = 0;
  return segs.map((s) => { const o = { seg: s, off }; off += s.srcEnd - s.srcStart; return o; });
};
// timeline → source seconds (clamped inside the owning segment)
export function tlToSrc(segs: Segment[], tl: number): number {
  for (const { seg, off } of segOffsets(segs)) {
    const len = seg.srcEnd - seg.srcStart;
    if (tl <= off + len) return seg.srcStart + Math.max(0, tl - off);
  }
  const last = segs[segs.length - 1];
  return last ? last.srcEnd : 0;
}
// source → timeline seconds
export function srcToTl(segs: Segment[], src: number): number {
  for (const { seg, off } of segOffsets(segs)) {
    if (src <= seg.srcEnd) return off + Math.max(0, src - seg.srcStart);
  }
  return totalDur(segs);
}
export const inSegment = (s: Segment, src: number) => src >= s.srcStart && src < s.srcEnd;

// Assign each overlay to the first lane with no overlap.
export function overlayLanes(overlays: TextOverlay[]): TextOverlay[][] {
  const lanes: TextOverlay[][] = [];
  for (const o of [...overlays].sort((a, b) => a.start - b.start)) {
    let i = lanes.findIndex((l) => l.every((x) => x.end <= o.start || o.end <= x.start));
    if (i < 0) { lanes.push([]); i = lanes.length - 1; }
    lanes[i].push(o);
  }
  return lanes.length ? lanes : [[]];
}
