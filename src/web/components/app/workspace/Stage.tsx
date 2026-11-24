"use client";

import React, { useRef, useState } from "react";
const ViewTransition = (React as unknown as { ViewTransition?: React.ComponentType<{ name: string; children?: React.ReactNode }> }).ViewTransition ?? (({ children }: { children?: React.ReactNode }) => <>{children}</>);
import type { EditDoc, TextOverlay } from "./editDoc";
import { fmtTc, ic, InlineEdit, type Ws } from "./common";

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
const SNAP = 0.02;
const SNAPS = [0, 0.5, 1];

// Build the filter chain for a video element from the adjust sliders.
export function videoFilters(adj: EditDoc["adjust"], filterId: string, compare: boolean): string | undefined {
  if (compare) return undefined;
  const css: string[] = [];
  const bright = 1 + (adj.brightness + adj.exposure) / 100;
  if (adj.brightness || adj.exposure) css.push(`brightness(${Math.max(0, bright)})`);
  if (adj.contrast) css.push(`contrast(${Math.max(0, 1 + adj.contrast / 100)})`);
  if (adj.saturation) css.push(`saturate(${Math.max(0, 1 + adj.saturation / 100)})`);
  if (adj.temperature || adj.tint || adj.vibrance || adj.highlights || adj.shadows || adj.fade || adj.sharpen) css.push(`url(#${filterId})`);
  return css.length ? css.join(" ") : undefined;
}

// One inline SVG filter per clip: colormatrix (temperature/tint),
// componentTransfer (highlights/shadows/fade), convolve (sharpen).
function AdjustFilter({ id, adj }: { id: string; adj: EditDoc["adjust"] }) {
  const t = adj.temperature / 100, g = adj.tint / 100;
  const m = [
    1, 0, 0, 0, 0.25 * t - 0.125 * g,
    0, 1, 0, 0, 0.25 * g,
    0, 0, 1, 0, -0.25 * t - 0.125 * g,
    0, 0, 0, 1, 0,
  ].join(" ");
  const h = adj.highlights / 100, s = adj.shadows / 100, f = adj.fade / 100;
  const slope = Math.max(0.2, (1 - 0.3 * Math.max(0, h)) * (1 - 0.15 * Math.max(0, f)));
  const intercept = 0.2 * Math.max(0, s) + 0.12 * Math.max(0, f) - 0.08 * Math.max(0, -h);
  const k = (adj.sharpen / 100) * 0.6;
  const kernel = `0 ${-k} 0 ${-k} ${1 + 4 * k} ${-k} 0 ${-k} 0`;
  return (
    <svg aria-hidden width="0" height="0" className="absolute">
      <filter id={id} colorInterpolationFilters="sRGB">
        {(adj.temperature || adj.tint) ? <feColorMatrix type="matrix" values={m} /> : null}
        {adj.vibrance ? <feColorMatrix type="saturate" values={`${1 + adj.vibrance / 100}`} /> : null}
        {(adj.highlights || adj.shadows || adj.fade) ? (
          <feComponentTransfer>
            <feFuncR type="linear" slope={slope} intercept={intercept} />
            <feFuncG type="linear" slope={slope} intercept={intercept} />
            <feFuncB type="linear" slope={slope} intercept={intercept} />
          </feComponentTransfer>
        ) : null}
        {adj.sharpen > 0 ? <feConvolveMatrix order="3" kernelMatrix={kernel} preserveAlpha="true" /> : null}
      </filter>
    </svg>
  );
}

// Selection chrome: lime outline, 4 corner handles, optional rotate handle.
function Selection({ ws, onCorner, onRotate, rotate = true }: {
  ws: Ws;
  onCorner?: (corner: number, dx: number, dy: number) => void;
  onRotate?: (cx: number, cy: number) => void;
  rotate?: boolean;
}) {
  const drag = (corner: number) => (e: React.PointerEvent) => {
    e.stopPropagation(); e.preventDefault();
    const el = (e.currentTarget as HTMLElement).closest("[data-frame]") as HTMLElement;
    const r = el.getBoundingClientRect();
    const sx = e.clientX, sy = e.clientY;
    ws.beginGesture();
    const move = (ev: PointerEvent) => onCorner?.(corner, (ev.clientX - sx) / r.width, (ev.clientY - sy) / r.height);
    const up = () => { window.removeEventListener("pointermove", move); window.removeEventListener("pointerup", up); ws.endGesture(); };
    window.addEventListener("pointermove", move); window.addEventListener("pointerup", up);
  };
  const startRotate = (e: React.PointerEvent) => {
    e.stopPropagation(); e.preventDefault();
    const el = (e.currentTarget as HTMLElement).closest("[data-frame]") as HTMLElement;
    const r = el.getBoundingClientRect();
    ws.beginGesture();
    const move = (ev: PointerEvent) => onRotate?.((ev.clientX - r.left) / r.width, (ev.clientY - r.top) / r.height);
    const up = () => { window.removeEventListener("pointermove", move); window.removeEventListener("pointerup", up); ws.endGesture(); };
    window.addEventListener("pointermove", move); window.addEventListener("pointerup", up);
  };
  // handles sit fully inside the selection so they stay hittable on frame-edge items
  const corners = [
    "left-0 top-0 translate-x-[2px] translate-y-[2px] cursor-nwse-resize",
    "right-0 top-0 -translate-x-[2px] translate-y-[2px] cursor-nesw-resize",
    "left-0 bottom-0 translate-x-[2px] -translate-y-[2px] cursor-nesw-resize",
    "right-0 bottom-0 -translate-x-[2px] -translate-y-[2px] cursor-nwse-resize",
  ];
  return (
    <>
      <span aria-hidden className="pointer-events-none absolute inset-0 z-30 rounded-sm ring-2 ring-lime" />
      {corners.map((pos, i) => (
        <span key={i} data-handle={i} aria-hidden onPointerDown={drag(i)}
          className={`absolute z-40 h-3 w-3 rounded-[3px] border-2 border-ink bg-lime shadow ${pos}`} />
      ))}
      {rotate && (
        <span aria-hidden data-rotate onPointerDown={startRotate}
          className="absolute -top-6 left-1/2 z-40 h-3.5 w-3.5 -translate-x-1/2 cursor-grab rounded-full border-2 border-ink bg-lime shadow" />
      )}
    </>
  );
}

export default function Stage({ ws, vid, vid2, onVideoEvent }: {
  ws: Ws;
  vid: React.RefObject<HTMLVideoElement | null>;
  vid2: React.RefObject<HTMLVideoElement | null>;
  onVideoEvent: { onPlay: () => void; onPause: () => void; onLoaded: (d: number) => void };
}) {
  const { clip, cfg, doc, sel, t, compare } = ws;
  const frame = useRef<HTMLDivElement>(null);
  const [guides, setGuides] = useState<{ v?: number; h?: number }>({});
  const fid = `adj-${clip.id}`;

  const pct = (e: { clientX: number; clientY: number }) => {
    const r = frame.current!.getBoundingClientRect();
    return { x: (e.clientX - r.left) / r.width, y: (e.clientY - r.top) / r.height };
  };

  const snapVal = (v: number): { v: number; hit?: number } => {
    for (const s of SNAPS) if (Math.abs(v - s) < SNAP) return { v: s, hit: s };
    return { v };
  };

  // Generic drag: select + beginGesture on down, update deltas on move, commit on up.
  const dragItem = (e: React.PointerEvent, apply: (dx: number, dy: number, p: { x: number; y: number }) => void) => {
    e.stopPropagation();
    ws.beginGesture();
    const s = pct(e);
    const move = (ev: PointerEvent) => { const p = pct(ev); apply(p.x - s.x, p.y - s.y, p); };
    const up = () => { window.removeEventListener("pointermove", move); window.removeEventListener("pointerup", up); setGuides({}); ws.endGesture(); };
    window.addEventListener("pointermove", move); window.addEventListener("pointerup", up);
  };

  const withSnapX = (x: number) => { const r = snapVal(x); setGuides((g) => ({ ...g, v: r.hit })); return r.v; };
  const withSnapY = (y: number) => { const r = snapVal(y); setGuides((g) => ({ ...g, h: r.hit })); return r.v; };

  const filt = videoFilters(doc.adjust, fid, compare);

  const videoEl = (rect: { x: number; y: number; scale: number; rotation: number }, objPos: string, ref?: React.RefObject<HTMLVideoElement | null>, label?: string) => (
    <video ref={ref} src={clip.src} poster={clip.poster} muted loop playsInline preload="metadata"
      aria-label={label} aria-hidden={label ? undefined : true}
      onPlay={ref ? onVideoEvent.onPlay : undefined}
      onPause={ref ? onVideoEvent.onPause : undefined}
      onLoadedMetadata={ref ? (e) => onVideoEvent.onLoaded(e.currentTarget.duration) : undefined}
      className="absolute inset-0 h-full w-full object-cover will-change-transform"
      style={{
        objectPosition: objPos,
        transform: `translate(${rect.x * 100}%, ${rect.y * 100}%) scale(${rect.scale}) rotate(${rect.rotation}deg)`,
        filter: filt,
      }} />
  );

  // caption words visible at t (timeline space)
  const visBlocks = doc.captionBlocks.filter((b) => !clip.words[b.wordIdx]?.cut);
  const ai = visBlocks.findIndex((b) => t >= b.start && t < b.end);
  const line = ai >= 0 ? visBlocks.slice(Math.max(0, ai - (ai % cfg.lineWords)), Math.max(0, ai - (ai % cfg.lineWords)) + cfg.lineWords) : [];
  const fontFam = cfg.font === "Clash Display" ? "var(--font-clash)" : cfg.font === "JetBrains Mono" ? "var(--font-jetbrains)" : "var(--font-body)";

  const captionBox = (
    <div data-caption-box className="absolute z-10 cursor-move"
      style={{
        left: `${doc.caption.x * 100}%`, top: `${doc.caption.y * 100}%`, width: `${doc.caption.w * 100}%`,
        transform: `translateX(-50%) scale(${doc.caption.scale})`, transformOrigin: "top center",
      }}
      onPointerDown={(e) => {
        ws.setSel({ kind: "caption" });
        const start = doc.caption;
        dragItem(e, (dx, dy) => ws.update((s) => ({
          ...s, doc: { ...s.doc, caption: { ...start, x: clamp(withSnapX(start.x + dx), 0.05, 0.95), y: clamp(withSnapY(start.y + dy), 0.02, 0.98) } },
        })));
      }}
      onDoubleClick={() => { const b = visBlocks[ai]; if (b) ws.setEditingWord(b.wordIdx); }}>
      <div className="relative flex justify-center text-center">
        <p className={`flex w-full flex-wrap justify-center gap-x-[0.3em] leading-tight ${cfg.upper ? "uppercase" : ""}`} style={{ fontFamily: fontFam, fontSize: cfg.size, fontWeight: cfg.weight, textShadow: "0 2px 12px rgba(0,0,0,.6)" }}>
          {line.slice(0, cfg.lines * cfg.lineWords).map((b) => {
            const w = clip.words[b.wordIdx];
            if (!w) return null;
            const on = t >= b.start && t < b.end;
            const pop = cfg.anim !== "none" && cfg.reveal && on;
            if (ws.editingWord === b.wordIdx) {
              return (
                <InlineEdit key={b.id} value={w.w}
                  onCommit={(v) => { ws.setEditingWord(null); if (v && v !== w.w) ws.setClipWords((c) => ({ ...c, words: c.words.map((x, j) => (j === b.wordIdx ? { ...x, w: v } : x)) })); }}
                  className="inline-block rounded px-0.5" style={{ color: on ? cfg.color : cfg.textColor }} />
              );
            }
            return (
              <span key={b.id} className={`inline-block transition-all ${pop ? "scale-110" : ""} ${cfg.anim === "fade" && on ? "opacity-100" : cfg.anim === "fade" ? "opacity-70" : ""}`}
                style={{
                  transitionDuration: `${cfg.animSpeed}ms`,
                  color: (cfg.highlight || (cfg.emphasis && on)) && on ? cfg.color : cfg.textColor,
                  background: cfg.style === "box" ? `rgba(24,24,24,${cfg.boxOp / 100})` : "none",
                  padding: cfg.style === "box" ? "0 6px" : 0, borderRadius: 6,
                }}>
                {w.w}
              </span>
            );
          })}
          {cfg.emoji && line.length > 0 && <span className="inline-block">⚡️</span>}
        </p>
        {sel?.kind === "caption" && (
          <Selection ws={ws} rotate={false} onCorner={(_c, dx) => {
            const start = doc.caption;
            ws.update((s) => ({ ...s, doc: { ...s.doc, caption: { ...s.doc.caption, w: clamp(start.w + dx * 2, 0.3, 1) } } }));
          }} />
        )}
      </div>
    </div>
  );

  const overlayEl = (o: TextOverlay) => {
    const selected = sel?.kind === "overlay" && sel.id === o.id;
    const editing = ws.editingOverlay === o.id;
    return (
      <div key={o.id} className="absolute z-20"
        style={{ left: `${o.x * 100}%`, top: `${o.y * 100}%`, width: `${o.w * 100}%`, transform: `translate(-50%,-50%) rotate(${o.rotation}deg)` }}
        onPointerDown={(e) => {
          if (editing) return;
          ws.setSel({ kind: "overlay", id: o.id });
          const start = o;
          dragItem(e, (dx, dy) => ws.update((s) => ({
            ...s, doc: { ...s.doc, overlays: s.doc.overlays.map((x) => x.id === o.id ? { ...x, x: clamp(withSnapX(start.x + dx), 0, 1), y: clamp(withSnapY(start.y + dy), 0, 1) } : x) },
          })));
        }}
        onDoubleClick={() => ws.setEditingOverlay(o.id)}>
        <div className="relative text-center">
          {editing ? (
            <InlineEdit value={o.text}
              onCommit={(v) => {
                ws.setEditingOverlay(null);
                if (v === null) return;
                if (!v.trim()) ws.setDoc((d) => ({ ...d, overlays: d.overlays.filter((x) => x.id !== o.id) }));
                else if (v !== o.text) ws.setDoc((d) => ({ ...d, overlays: d.overlays.map((x) => x.id === o.id ? { ...x, text: v } : x) }));
              }}
              className="block w-full rounded px-1"
              style={{ fontFamily: o.font, fontSize: o.size, fontWeight: 800, color: o.color, WebkitTextStroke: o.stroke ? `1px ${o.stroke}` : undefined, background: o.bg || undefined, textShadow: "0 2px 8px rgba(0,0,0,.6)" }} />
          ) : (
            <p className="leading-tight" style={{ fontFamily: o.font, fontSize: o.size, fontWeight: 800, color: o.color, WebkitTextStroke: o.stroke ? `1px ${o.stroke}` : undefined, background: o.bg || undefined, textShadow: "0 2px 8px rgba(0,0,0,.6)" }}>{o.text}</p>
          )}
          {selected && !editing && (
            <Selection ws={ws}
              onCorner={(_c, dx) => {
                const start = o;
                ws.update((s) => ({ ...s, doc: { ...s.doc, overlays: s.doc.overlays.map((x) => x.id === o.id ? { ...x, w: clamp(start.w + dx * 2, 0.1, 1.4) } : x) } }));
              }}
              onRotate={(px, py) => {
                const deg = Math.atan2(py - o.y, px - o.x) * (180 / Math.PI) + 90;
                ws.update((s) => ({ ...s, doc: { ...s.doc, overlays: s.doc.overlays.map((x) => x.id === o.id ? { ...x, rotation: Math.round(deg) } : x) } }));
              }} />
          )}
        </div>
      </div>
    );
  };

  const pane = (kind: "face" | "game", style: React.CSSProperties, rect: EditDoc["split"]["face"], objPos: string, ref?: React.RefObject<HTMLVideoElement | null>, label?: string) => {
    const selected = sel?.kind === kind;
    return (
      <div className="absolute inset-x-0 cursor-move overflow-hidden" style={style}
        onPointerDown={(e) => {
          ws.setSel({ kind });
          const start = rect;
          dragItem(e, (dx, dy) => ws.update((s) => ({
            ...s, doc: { ...s.doc, split: { ...s.doc.split, [kind]: { ...s.doc.split[kind], x: clamp(start.x + dx, -1, 1), y: clamp(start.y + dy, -1, 1) } } },
          })));
        }}>
        {videoEl(rect, objPos, ref, label)}
        {selected && (
          <Selection ws={ws} rotate={false} onCorner={(_c, dx, dy) => {
            const start = rect;
            ws.update((s) => ({ ...s, doc: { ...s.doc, split: { ...s.doc.split, [kind]: { ...s.doc.split[kind], scale: clamp(start.scale + dx + dy, 0.5, 4) } } } }));
          }} />
        )}
      </div>
    );
  };

  const transport = (
    <div className="absolute inset-x-2 bottom-3 z-20 flex items-center justify-center gap-1.5">
      <div className="flex items-center gap-1.5 rounded-full border border-white/10 bg-black/40 py-1.5 pl-1.5 pr-2.5 backdrop-blur">
        <button onClick={ws.toggle} aria-label={ws.playing ? "Pause" : "Play"} className="grid h-7 w-7 place-items-center rounded-full bg-white text-ink [&>svg]:h-4 [&>svg]:w-4">{ws.playing ? ic.pause : ic.play}</button>
        <span className="whitespace-nowrap font-mono text-[11px] tabular-nums text-white">{fmtTc(t)} <span className="text-white/50">/ {fmtTc(ws.dur)}</span></span>
        <button aria-label="Mute" className="text-white/70 hover:text-white">{ic.vol}</button>
      </div>
      <div className="hidden items-center gap-1 rounded-full border border-white/10 bg-black/40 px-2 py-1.5 backdrop-blur sm:flex">
        <button aria-label="Loop" className="rounded-full p-1.5 text-lime">{ic.loop}</button>
        <button onClick={() => ws.setTime(t - 1)} aria-label="Back 1 second" className="rounded-full p-1.5 text-white/70 hover:text-white">{ic.back}</button>
        <button onClick={() => ws.setTime(t + 1)} aria-label="Forward 1 second" className="rounded-full p-1.5 text-white/70 hover:text-white">{ic.fwd}</button>
      </div>
    </div>
  );

  return (
    <section className="relative flex min-w-0 flex-1 items-center justify-center rounded-2xl bg-[#1f1f1f] bg-[radial-gradient(#3A3A3A_1px,transparent_1px)] [background-size:22px_22px] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]"
      onPointerDown={() => ws.setSel(null)}>
      <AdjustFilter id={fid} adj={doc.adjust} />
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-2/3 w-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-lime/[0.05] blur-3xl" aria-hidden="true" />
      <button onClick={(e) => { e.stopPropagation(); ws.setCfg((c) => ({ ...c, safeGuides: !c.safeGuides })); }}
        onPointerDown={(e) => e.stopPropagation()}
        aria-pressed={cfg.safeGuides} aria-label="Toggle safe-area guides"
        className="absolute right-5 top-5 z-40 rounded-full border border-white/10 bg-black/40 px-2.5 py-1 font-mono text-[10px] text-white/70 backdrop-blur hover:text-white">
        safe
      </button>
      <ViewTransition name={`clip-thumb-${clip.id}`}>
      <div ref={frame} data-frame className="relative aspect-[9/16] h-full max-h-full overflow-hidden rounded-[20px] bg-black shadow-2xl" style={{ maxWidth: "calc((100vh - 320px) * 0.5625)" }}>
        {cfg.layout === "split" ? (
          <>
            {pane("face", { top: 0, height: `${doc.split.divider * 100}%` }, doc.split.face, `${cfg.cropX}% 18%`, vid, "Clip preview")}
            {pane("game", { top: `${doc.split.divider * 100}%`, bottom: 0 }, doc.split.game, `${cfg.cropX}% 78%`, vid2)}
            <div role="separator" aria-orientation="horizontal" aria-label="Split divider" aria-valuenow={Math.round(doc.split.divider * 100)} tabIndex={0}
              className="absolute inset-x-0 z-10 h-1.5 -translate-y-1/2 cursor-row-resize bg-ink hover:bg-lime/60"
              style={{ top: `${doc.split.divider * 100}%` }}
              onPointerDown={(e) => {
                e.stopPropagation(); ws.beginGesture();
                const move = (ev: PointerEvent) => { const p = pct(ev); ws.update((s) => ({ ...s, doc: { ...s.doc, split: { ...s.doc.split, divider: clamp(p.y, 0.15, 0.85) } } })); };
                const up = () => { window.removeEventListener("pointermove", move); window.removeEventListener("pointerup", up); ws.endGesture(); };
                window.addEventListener("pointermove", move); window.addEventListener("pointerup", up);
              }}
              onKeyDown={(e) => { const d = e.key === "ArrowDown" ? 0.02 : e.key === "ArrowUp" ? -0.02 : 0; if (d) { e.preventDefault(); ws.setDoc((x) => ({ ...x, split: { ...x.split, divider: clamp(x.split.divider + d, 0.15, 0.85) } })); } }} />
          </>
        ) : (
          <div className="absolute inset-0 cursor-move"
            onPointerDown={(e) => {
              ws.setSel({ kind: "crop" });
              const start = doc.crop;
              dragItem(e, (dx, dy) => ws.update((s) => ({ ...s, doc: { ...s.doc, crop: { ...s.doc.crop, x: clamp(withSnapX(0.5 + start.x + dx) - 0.5, -1, 1), y: clamp(withSnapY(0.5 + start.y + dy) - 0.5, -1, 1) } } })));
            }}>
            {videoEl(doc.crop, `${cfg.cropX}% ${cfg.layout === "face" ? "15%" : "50%"}`, vid, "Clip preview")}
            {sel?.kind === "crop" && (
              <Selection ws={ws}
                onCorner={(_c, dx, dy) => {
                  const start = doc.crop;
                  ws.update((s) => ({ ...s, doc: { ...s.doc, crop: { ...s.doc.crop, scale: clamp(start.scale + dx + dy, 0.5, 4) } } }));
                }}
                onRotate={(px, py) => {
                  const deg = Math.atan2(py - 0.5, px - 0.5) * (180 / Math.PI) + 90;
                  ws.update((s) => ({ ...s, doc: { ...s.doc, crop: { ...s.doc.crop, rotation: Math.round(deg) } } }));
                }} />
            )}
          </div>
        )}
        {doc.adjust.vignette > 0 && !compare && (
          <div aria-hidden data-vignette className="pointer-events-none absolute inset-0 z-[6]"
            style={{ background: `radial-gradient(ellipse at center, transparent ${55 - doc.adjust.vignette * 0.3}%, rgba(0,0,0,${doc.adjust.vignette / 130}) 100%)` }} />
        )}
        {captionBox}
        {doc.overlays.filter((o) => t >= o.start && t < o.end).map(overlayEl)}
        {cfg.safeGuides && (
          <div aria-hidden className="pointer-events-none absolute inset-0 z-[5]">
            <span className="absolute inset-x-0 top-0 h-[14%] border-b border-dashed border-heat/60" />
            <span className="absolute inset-x-0 bottom-0 h-[18%] border-t border-dashed border-heat/60" />
            <span className="absolute right-0 top-[14%] bottom-[18%] w-[16%] border-l border-dashed border-heat/60" />
            <span className="absolute left-2 top-[15%] rounded bg-black/40 px-1.5 py-0.5 font-mono text-[8px] text-heat/80">TikTok safe zones</span>
          </div>
        )}
        {guides.v !== undefined && <span aria-hidden className="absolute inset-y-0 z-[35] w-px bg-lime" style={{ left: `${guides.v * 100}%` }} />}
        {guides.h !== undefined && <span aria-hidden className="absolute inset-x-0 z-[35] h-px bg-lime" style={{ top: `${guides.h * 100}%` }} />}
        {transport}
      </div>
      </ViewTransition>
    </section>
  );
}
