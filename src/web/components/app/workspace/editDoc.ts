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

export function loadDoc(clipId: string, clip: { duration: number; words: { start: number; end: number; cut?: boolean }[] }): EditDoc {
  const base = defaultDoc(clip);
  try {
    const raw = localStorage.getItem(`kivlo.edit.${clipId}`);
    if (!raw) return base;
    const d = JSON.parse(raw) as Partial<EditDoc>;
    return {
      ...base, ...d,
      adjust: { ...base.adjust, ...d.adjust },
      crop: { ...base.crop, ...d.crop },
      caption: { ...base.caption, ...d.caption },
      split: { ...base.split, ...(d.split ?? {}), face: { ...base.split.face, ...d.split?.face }, game: { ...base.split.game, ...d.split?.game } },
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
