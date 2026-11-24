"use client";

import { useMemo, useRef, useState } from "react";
import { overlayLanes, segOffsets } from "./editDoc";
import { IconButton } from "../ui";
import { ic, type Ws } from "./common";

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
const SNAP_S = 0.08;

// Draggable/trimable block on a timeline track (times in timeline seconds).
function Block({ ws, start, end, dur, className, label, selected, onSelect, onChange, snapTargets }: {
  ws: Ws; start: number; end: number; dur: number;
  className: string; label?: React.ReactNode; selected: boolean;
  onSelect: () => void;
  onChange: (start: number, end: number, commit: boolean) => void;
  snapTargets: number[];   // times this block can snap to when magnet on
}) {
  const [, setSnapLine] = useState<number | null>(null);

  const snapped = (v: number): number => {
    if (!ws.magnet) return v;
    for (const c of snapTargets) {
      if (Math.abs(v - c) < SNAP_S) { setSnapLine(c); return c; }
    }
    setSnapLine(null);
    return v;
  };

  const drag = (mode: "move" | "l" | "r") => (e: React.PointerEvent) => {
    e.stopPropagation();
    onSelect();
    const r = (e.currentTarget as HTMLElement).closest("[data-tracks]")!.getBoundingClientRect();
    const sx = e.clientX;
    const len = end - start;
    const s0 = start, e0 = end;
    ws.beginGesture();
    const move = (ev: PointerEvent) => {
      const dt = ((ev.clientX - sx) / r.width) * dur;
      if (mode === "move") {
        const ns = snapped(s0 + dt) === s0 + dt ? s0 + dt : snapped(s0 + dt);
        let ns2 = ns;
        // also snap the end edge
        if (ns === s0 + dt) {
          const ne = snapped(e0 + dt);
          if (ne !== e0 + dt) ns2 = ne - len;
        }
        const cs = clamp(ns2, 0, dur - len);
        onChange(cs, cs + len, false);
      } else if (mode === "l") {
        onChange(clamp(snapped(s0 + dt), 0, e0 - 0.2), e0, false);
      } else {
        onChange(s0, clamp(snapped(e0 + dt), s0 + 0.2, dur), false);
      }
    };
    const up = () => {
      window.removeEventListener("pointermove", move); window.removeEventListener("pointerup", up);
      setSnapLine(null);
      ws.endGesture();
    };
    window.addEventListener("pointermove", move); window.addEventListener("pointerup", up);
  };

  return (
    <div role="button" tabIndex={0} aria-pressed={selected} aria-label={typeof label === "string" ? label : "timeline block"}
      onPointerDown={drag("move")} onClick={onSelect}
      className={`absolute top-0.5 bottom-0.5 flex items-center overflow-hidden rounded-md ${className} ${selected ? "ring-2 ring-white" : ""}`}
      style={{ left: `${(start / dur) * 100}%`, width: `calc(${Math.max(0.8, ((end - start) / dur) * 100)}% - 2px)` }}>
      <span aria-hidden onPointerDown={drag("l")} className="absolute inset-y-0 left-0 z-10 w-2.5 cursor-ew-resize rounded-l-md bg-white/0 hover:bg-white/25" />
      <span className="truncate px-2 text-[11px] font-bold">{label}</span>
      <span aria-hidden onPointerDown={drag("r")} className="absolute inset-y-0 right-0 z-10 w-2.5 cursor-ew-resize rounded-r-md bg-white/0 hover:bg-white/25" />
    </div>
  );
}

export default function Timeline({ ws }: { ws: Ws }) {
  const { doc, dur, t, sel, clip } = ws;
  const [zoom, setZoom] = useState(1);
  const tracks = useRef<HTMLDivElement>(null);
  const wave = useMemo(() => Array.from({ length: 140 }, (_, i) => Math.round((0.2 + 0.8 * Math.abs(Math.sin(i * 7.3) * Math.cos(i * 2.1))) * 1000) / 1000), []);

  const seek = (e: React.PointerEvent) => {
    const r = tracks.current!.getBoundingClientRect();
    const sl = tracks.current!.scrollLeft;
    const inner = tracks.current!.firstElementChild as HTMLElement;
    const w = inner.getBoundingClientRect().width;
    ws.setTime(((e.clientX - r.left + sl) / w) * dur);
  };

  const onWheel = (e: React.WheelEvent) => {
    if (!e.ctrlKey && !e.metaKey) return;
    e.preventDefault();
    setZoom((z) => clamp(z * (e.deltaY > 0 ? 0.8 : 1.25), 0.5, 8));
  };

  const blockTimes = [
    ...doc.captionBlocks.flatMap((b) => [b.start, b.end]),
    ...doc.overlays.flatMap((o) => [o.start, o.end]),
  ];

  const updateBlock = (id: string, kind: "caption" | "overlay", s: number, e: number) =>
    ws.update((st) => ({
      ...st,
      doc: kind === "caption"
        ? { ...st.doc, captionBlocks: st.doc.captionBlocks.map((b) => (b.id === id ? { ...b, start: s, end: e } : b)) }
        : { ...st.doc, overlays: st.doc.overlays.map((o) => (o.id === id ? { ...o, start: s, end: e } : o)) },
    }));

  const lanes = overlayLanes(doc.overlays);
  const offsets = segOffsets(doc.segments);
  const headers = ["Video 1", "Captions", ...lanes.map((_, i) => `Text ${i + 1}`), "Audio"];
  const ROW = 36, GAP = 8, STRIDE = ROW + GAP;
  const hrow = `h-9`;

  return (
    <div className="flex h-full gap-3">
      {/* track headers */}
      <div className="flex w-[110px] shrink-0 flex-col">
        <div className="flex h-8 items-center gap-0.5 rounded-full bg-carbon p-1">
          <IconButton dark onClick={ws.undo} disabled={!ws.canUndo} label="Undo">{ic.undo}</IconButton>
          <IconButton dark onClick={ws.redo} disabled={!ws.canRedo} label="Redo">{ic.redo}</IconButton>
          <IconButton dark onClick={ws.splitAtPlayhead} label="Split at playhead (S)">{ic.split}</IconButton>
          <IconButton dark onClick={ws.deleteSel} label="Delete selection">{ic.trash}</IconButton>
        </div>
        {headers.map((name, i) => (
          <div key={i} className={`mt-2 flex ${hrow} items-center gap-2 pr-1`}>
            <span className="text-[#A1A5A0]">{i === 0 ? ic.video : i === headers.length - 1 ? ic.audio : i === 1 ? ic.captions : ic.text}</span>
            <span className="flex-1 truncate text-xs font-semibold text-[#A1A5A0]">{name}</span>
          </div>
        ))}
      </div>

      {/* tracks area */}
      <div className="relative flex min-w-0 flex-1 flex-col">
        <div className="mb-1 flex items-center gap-2">
          <div className="relative h-8 flex-1">
            <div className="absolute inset-x-0 bottom-1 top-0 overflow-hidden" style={{ width: `${zoom * 100}%`, minWidth: "100%" }}>
              {Array.from({ length: Math.ceil(dur) + 1 }, (_, s) => (
                <span key={s} className="absolute bottom-0 border-l border-dotted border-[#5A5E56] pl-1 font-mono text-[10px] text-[#A1A5A0]" style={{ left: `${(s / dur) * 100}%`, height: 12 }}>{s}s</span>
              ))}
            </div>
          </div>
          <IconButton dark onClick={ws.toggleMagnet} label="Toggle snapping (N)" pressed={ws.magnet}
            className="shrink-0" >{ic.magnet}</IconButton>
          <input type="range" min={0.5} max={8} step={0.1} value={zoom} aria-label="Timeline zoom"
            onChange={(e) => setZoom(+e.target.value)}
            className="w-20 accent-lime" />
        </div>
        <div ref={tracks} data-tracks onPointerDown={seek} onWheel={onWheel}
          className="relative flex-1 cursor-crosshair overflow-x-auto overflow-y-hidden rounded-xl bg-[#1f1f1f]">
          <div className="relative h-full" style={{ width: `${zoom * 100}%`, minWidth: "100%" }}>
            {/* video track — magnetic segments */}
            <div className={`absolute inset-x-0 top-1 ${hrow}`} data-row="video">
              {offsets.map(({ seg, off }) => (
                <div key={seg.id} role="group" aria-roledescription="segment"
                  aria-label={`Segment ${seg.srcStart.toFixed(1)}–${seg.srcEnd.toFixed(1)}`}
                  onPointerDown={(e) => { e.stopPropagation(); ws.setSel({ kind: "segment", id: seg.id }); }}
                  className={`absolute top-0.5 bottom-0.5 overflow-hidden rounded-lg bg-lilac-deep ${sel?.kind === "segment" && sel.id === seg.id ? "ring-2 ring-white" : ""}`}
                  style={{ left: `${(off / dur) * 100}%`, width: `${((seg.srcEnd - seg.srcStart) / dur) * 100}%` }}>
                  <div className="absolute inset-y-0 left-0 w-16 bg-cover bg-center" style={{ backgroundImage: `url(${clip.poster})` }} />
                  <span className="absolute left-[72px] top-1/2 -translate-y-1/2 truncate font-mono text-[10px] font-medium text-white">{clip.id}.mp4</span>
                  {/* ripple trim handles */}
                  {(["l", "r"] as const).map((k) => (
                    <span key={k} role="slider" aria-label={k === "l" ? "Trim segment start" : "Trim segment end"}
                      aria-valuenow={k === "l" ? seg.srcStart : seg.srcEnd} tabIndex={0}
                      onPointerDown={(e) => {
                        e.stopPropagation();
                        const inner = tracks.current!.firstElementChild as HTMLElement;
                        const w = inner.getBoundingClientRect().width;
                        const sx = e.clientX;
                        const s0 = seg.srcStart, e0 = seg.srcEnd;
                        ws.beginGesture();
                        const move = (ev: PointerEvent) => {
                          const dt = ((ev.clientX - sx) / w) * dur;
                          ws.update((st) => ({
                            ...st, doc: {
                              ...st.doc,
                              segments: st.doc.segments.map((x) => x.id === seg.id
                                ? k === "l" ? { ...x, srcStart: clamp(s0 + dt, Math.max(0, s0 - 60), e0 - 0.2) } : { ...x, srcEnd: clamp(e0 + dt, s0 + 0.2, e0 + 60) }
                                : x),
                            },
                          }));
                        };
                        const up = () => { window.removeEventListener("pointermove", move); window.removeEventListener("pointerup", up); ws.endGesture(); };
                        window.addEventListener("pointermove", move); window.addEventListener("pointerup", up);
                      }}
                      className={`absolute inset-y-0 ${k === "l" ? "left-0" : "right-0"} z-10 w-3 cursor-ew-resize bg-white/0 hover:bg-white/30`} />
                  ))}
                </div>
              ))}
            </div>
            {/* captions track */}
            <div className={`absolute inset-x-0 ${hrow}`} style={{ top: 4 + STRIDE }}>
              {doc.captionBlocks.filter((b) => !clip.words[b.wordIdx]?.cut).map((b) => (
                <Block key={b.id} ws={ws} start={b.start} end={b.end} dur={dur}
                  className="bg-lime text-ink" label={clip.words[b.wordIdx]?.w ?? ""}
                  selected={sel?.kind === "block" && sel.id === b.id}
                  onSelect={() => { ws.setSel({ kind: "block", id: b.id }); }}
                  onChange={(s, e) => updateBlock(b.id, "caption", s, e)}
                  snapTargets={[t, ...blockTimes.filter((x) => x !== b.start && x !== b.end)]} />
              ))}
            </div>
            {/* overlay lanes */}
            {lanes.map((lane, li) => (
              <div key={li} className={`absolute inset-x-0 ${hrow}`} style={{ top: 4 + (li + 2) * STRIDE }}>
                {lane.map((o) => (
                  <Block key={o.id} ws={ws} start={o.start} end={o.end} dur={dur}
                    className="bg-lilac text-ink" label={o.text}
                    selected={sel?.kind === "overlay" && sel.id === o.id}
                    onSelect={() => ws.setSel({ kind: "overlay", id: o.id })}
                    onChange={(s, e) => updateBlock(o.id, "overlay", s, e)}
                    snapTargets={[t, ...blockTimes.filter((x) => x !== o.start && x !== o.end)]} />
                ))}
              </div>
            ))}
            {/* audio track */}
            <div className={`absolute inset-x-0 flex items-center gap-px px-1 ${hrow}`} style={{ top: 4 + (lanes.length + 2) * STRIDE }}>
              <span className="mr-1 shrink-0 text-[#A1A5A0]">{ic.audio}</span>
              {wave.map((h, i) => <span key={i} className="flex-1 rounded-sm bg-white/60" style={{ height: `${h * 90}%` }} />)}
            </div>
            {/* playhead */}
            <div className="pointer-events-none absolute inset-y-0 z-20 w-px bg-lime" style={{ left: `${(t / dur) * 100}%` }}>
              <span className="absolute -top-0 left-1/2 h-3.5 w-3.5 -translate-x-1/2 rounded-full border-2 border-ink bg-lime shadow" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
