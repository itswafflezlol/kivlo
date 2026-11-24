"use client";

import { asset } from "@/lib/asset";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import type { Clip } from "@/lib/mock";
import { user } from "@/lib/mock";
import { IconButton, Modal, fmtMin } from "./ui";
import { defaultDoc, loadDoc, nid, saveDoc, segOffsets, tlToSrc, totalDur, type EditDoc } from "./workspace/editDoc";
import { ic, type Cfg, type InsTab, type Sel, type Snap, type Ws } from "./workspace/common";
import Stage from "./workspace/Stage";
import Timeline from "./workspace/Timeline";
import Inspector from "./workspace/Inspector";
import { RAIL, RailPanel, type RailKey } from "./workspace/panels";

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

// Resizable divider between panels. Pointer drag + arrow keys; dblclick resets.
function PanelDivider({ vertical, value, min, max, onChange, onReset, label, sign = 1 }: {
  vertical: boolean; value: number; min: number; max: number;
  onChange: (v: number) => void; onReset: () => void; label: string; sign?: 1 | -1;
}) {
  return (
    <div role="separator" aria-orientation={vertical ? "vertical" : "horizontal"} aria-label={label}
      aria-valuenow={Math.round(value)} aria-valuemin={min} aria-valuemax={max} tabIndex={0}
      onDoubleClick={onReset}
      onPointerDown={(e) => {
        e.preventDefault();
        const start = vertical ? e.clientX : e.clientY;
        const s0 = value;
        const move = (ev: PointerEvent) => onChange(clamp(s0 + sign * ((vertical ? ev.clientX : ev.clientY) - start), min, max));
        const up = () => { window.removeEventListener("pointermove", move); window.removeEventListener("pointerup", up); };
        window.addEventListener("pointermove", move); window.addEventListener("pointerup", up);
      }}
      onKeyDown={(e) => {
        const d = (e.key === "ArrowRight" || e.key === "ArrowDown") ? 12 : (e.key === "ArrowLeft" || e.key === "ArrowUp") ? -12 : 0;
        if (d) { e.preventDefault(); onChange(clamp(value + d, min, max)); }
      }}
      className={`group hidden shrink-0 items-center justify-center lg:flex ${vertical ? "w-2.5 cursor-col-resize" : "h-2.5 cursor-row-resize"}`}>
      <span className={`rounded-full bg-[#3A3A3A] transition-colors group-hover:bg-lime group-focus-visible:bg-lime ${vertical ? "h-10 w-1" : "h-1 w-10"}`} />
    </div>
  );
}

type LayoutSizes = { left: number; right: number; timeline: number };
const DEFAULT_SIZES: LayoutSizes = { left: 260, right: 290, timeline: 224 };

function loadSizes(): LayoutSizes {
  try {
    const raw = localStorage.getItem("kivlo.workspace.layout");
    return raw ? { ...DEFAULT_SIZES, ...JSON.parse(raw) } : DEFAULT_SIZES;
  } catch { return DEFAULT_SIZES; }
}

// Panel sizes live in localStorage — synced via an external store so the
// hydrated DOM starts at defaults then adopts stored values without flash hacks.
let sizesCache: LayoutSizes | null = null;
const sizeSubs = new Set<() => void>();
const getSizes = (): LayoutSizes => (sizesCache ??= loadSizes());
const subSizes = (cb: () => void) => { sizeSubs.add(cb); return () => { sizeSubs.delete(cb); }; };
function useSizes(): [LayoutSizes, (p: Partial<LayoutSizes>) => void] {
  const sizes = useSyncExternalStore(subSizes, getSizes, () => DEFAULT_SIZES);
  return [sizes, (p) => {
    sizesCache = { ...getSizes(), ...p };
    try { localStorage.setItem("kivlo.workspace.layout", JSON.stringify(sizesCache)); } catch { /* noop */ }
    sizeSubs.forEach((l) => l());
  }];
}

export default function Workspace({ clip: initial, siblings }: { clip: Clip; siblings: Clip[] }) {
  const [snap, setSnap] = useState<Snap>(() => ({
    doc: typeof window === "undefined" ? defaultDoc(initial) : loadDoc(initial.id, initial),
    cfg: { layout: initial.layout, cropX: 50, font: "Manrope", size: 26, weight: 800, color: "#BDEF72", textColor: "#FFFFFF", style: "pop", upper: true, reveal: true, highlight: true, lines: 2, lineWords: 3, boxOp: 75, anim: "pop", animSpeed: 150, safeGuides: false, emphasis: false, emoji: false },
    clip: initial,
  }));
  const { doc, cfg, clip } = snap;
  const [hist, setHist] = useState<Snap[]>([]);
  const [future, setFuture] = useState<Snap[]>([]);
  const gestureSnap = useRef<Snap | null>(null);
  const [title, setTitle] = useState(initial.title);
  const [t, setT] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [rail, setRail] = useState<RailKey | null>("transcript");
  const [ins, setIns] = useState<InsTab>("captions");
  const [sel, setSel] = useState<Sel>(null);
  const [magnet, setMagnet] = useState(true);
  const [compare, setCompare] = useState(false);
  const [editingWord, setEditingWord] = useState<number | null>(null);
  const [editingOverlay, setEditingOverlay] = useState<string | null>(null);
  const [saved, setSaved] = useState<"saved" | "saving">("saved");
  const [exportOpen, setExportOpen] = useState(false);
  const router = useRouter();
  const [quality, setQuality] = useState("1080p");
  const [expPct, setExpPct] = useState(-1);
  const [keysOpen, setKeysOpen] = useState(false);
  const [sizes, patchSizes] = useSizes();
  const vid = useRef<HTMLVideoElement>(null);
  const vid2 = useRef<HTMLVideoElement>(null);
  const raf = useRef(0);

  useEffect(() => { saveDoc(clip.id, doc); }, [doc, clip.id]);

  const dur = totalDur(doc.segments);
  const markSaving = () => { setSaved("saving"); setTimeout(() => setSaved("saved"), 700); };

  const mutate = useCallback((fn: (s: Snap) => Snap) => {
    setHist((h) => [...h.slice(-40), snap]); setFuture([]); setSnap(fn(snap)); markSaving();
  }, [snap]);
  const update = useCallback((fn: (s: Snap) => Snap) => setSnap((s) => fn(s)), []);
  const beginGesture = useCallback(() => { gestureSnap.current = snap; }, [snap]);
  const endGesture = useCallback(() => {
    setSnap((s) => {
      if (gestureSnap.current && gestureSnap.current !== s) {
        setHist((h) => [...h.slice(-40), gestureSnap.current!]); setFuture([]);
      }
      gestureSnap.current = null;
      return s;
    });
    markSaving();
  }, []);
  const undo = useCallback(() => {
    if (!hist.length) return;
    setFuture((f) => [snap, ...f]);
    setSnap(hist[hist.length - 1]);
    setHist(hist.slice(0, -1));
  }, [hist, snap]);
  const redo = useCallback(() => {
    if (!future.length) return;
    setHist((h) => [...h, snap]);
    setSnap(future[0]);
    setFuture(future.slice(1));
  }, [future, snap]);

  const setDoc = useCallback((fn: (d: EditDoc) => EditDoc) => mutate((s) => ({ ...s, doc: fn(s.doc) })), [mutate]);
  const setCfg = useCallback((fn: (c: Cfg) => Cfg) => mutate((s) => ({ ...s, cfg: fn(s.cfg) })), [mutate]);
  const setClipWords = useCallback((fn: (c: Clip) => Clip) => mutate((s) => ({ ...s, clip: fn(s.clip) })), [mutate]);

  const setTime = useCallback((tl: number) => {
    const c = clamp(tl, 0, dur);
    const src = tlToSrc(snap.doc.segments, c);
    [vid.current, vid2.current].forEach((x) => { if (x) x.currentTime = src; });
    setT(c);
  }, [dur, snap.doc.segments]);
  const toggle = () => { const v = vid.current; if (!v) return; if (v.paused) { v.play().catch(() => {}); vid2.current?.play().catch(() => {}); } else { v.pause(); vid2.current?.pause(); } };

  // Playback: track source time, skip over cut (removed) regions.
  useEffect(() => {
    if (!playing) return;
    const segs = snap.doc.segments;
    const step = () => {
      const v = vid.current;
      if (v) {
        const src = v.currentTime;
        const cur = segOffsets(segs).find(({ seg }) => src >= seg.srcStart && src < seg.srcEnd);
        if (cur) {
          setT(cur.off + (src - cur.seg.srcStart));
        } else {
          // source time fell outside all segments — jump to the next segment start
          const next = segOffsets(segs).find(({ seg }) => seg.srcStart > src) ?? segOffsets(segs)[0];
          if (next) {
            [vid.current, vid2.current].forEach((x) => { if (x) x.currentTime = next.seg.srcStart; });
            setT(next.off);
          }
        }
        if (src >= (segs[segs.length - 1]?.srcEnd ?? 0)) setTime(0);
      }
      raf.current = requestAnimationFrame(step);
    };
    raf.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf.current);
  }, [playing, snap.doc.segments, setTime]);

  const splitAtPlayhead = useCallback(() => {
    const src = tlToSrc(snap.doc.segments, t);
    setDoc((d) => {
      const i = d.segments.findIndex((s) => src > s.srcStart + 0.05 && src < s.srcEnd - 0.05);
      if (i < 0) return d;
      const s = d.segments[i];
      const out = [...d.segments];
      out.splice(i, 1, { id: s.id, srcStart: s.srcStart, srcEnd: src }, { id: nid(), srcStart: src, srcEnd: s.srcEnd });
      return { ...d, segments: out };
    });
  }, [snap.doc.segments, t, setDoc]);

  const deleteSel = useCallback(() => {
    if (!sel) return;
    if (sel.kind === "overlay") {
      setDoc((d) => ({ ...d, overlays: d.overlays.filter((o) => o.id !== sel.id) }));
      setSel(null);
    } else if (sel.kind === "segment") {
      setDoc((d) => {
        if (d.segments.length <= 1) return d;
        const i = d.segments.findIndex((s) => s.id === sel.id);
        if (i < 0) return d;
        const removed = d.segments[i].srcEnd - d.segments[i].srcStart;
        const off = segOffsets(d.segments)[i].off;
        const shift = (v: number) => (v >= off + removed ? v - removed : v >= off ? off : v);
        return {
          ...d,
          segments: d.segments.filter((s) => s.id !== sel.id),
          captionBlocks: d.captionBlocks.map((b) => ({ ...b, start: shift(b.start), end: shift(b.end) })),
          overlays: d.overlays.map((o) => ({ ...o, start: shift(o.start), end: shift(o.end) })),
        };
      });
      setSel(null);
    }
  }, [sel, setDoc]);

  const addOverlay = useCallback(() => {
    const o = { id: nid(), text: "New text", x: 0.5, y: 0.3, w: 0.6, rotation: 0, start: t, end: Math.min(dur, t + 3), font: "var(--font-clash)", size: 28, color: "#FFFFFF", stroke: "", bg: "" };
    setDoc((d) => ({ ...d, overlays: [...d.overlays, o] }));
    setSel({ kind: "overlay", id: o.id });
    setEditingOverlay(o.id);
  }, [t, dur, setDoc]);

  const nudge = useCallback((dx: number, dy: number) => {
    if (!sel) return;
    update((s) => {
      const d = s.doc;
      if (sel.kind === "crop") return { ...s, doc: { ...d, crop: { ...d.crop, x: clamp(d.crop.x + dx, -1, 1), y: clamp(d.crop.y + dy, -1, 1) } } };
      if (sel.kind === "caption") return { ...s, doc: { ...d, caption: { ...d.caption, x: clamp(d.caption.x + dx, 0, 1), y: clamp(d.caption.y + dy, 0, 1) } } };
      if (sel.kind === "face" || sel.kind === "game") return { ...s, doc: { ...d, split: { ...d.split, [sel.kind]: { ...d.split[sel.kind], x: clamp(d.split[sel.kind].x + dx, -1, 1), y: clamp(d.split[sel.kind].y + dy, -1, 1) } } } };
      if (sel.kind === "overlay") return { ...s, doc: { ...d, overlays: d.overlays.map((o) => (o.id === sel.id ? { ...o, x: clamp(o.x + dx, 0, 1), y: clamp(o.y + dy, 0, 1) } : o)) } };
      return s;
    });
  }, [sel, update]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement;
      if (el.closest("input,textarea,select,[contenteditable]")) return;
      const step = e.shiftKey ? 0.05 : 0.005;
      if (e.code === "Space") { e.preventDefault(); toggle(); }
      else if (e.key === "Escape") { if (sel) setSel(null); else if (keysOpen) setKeysOpen(false); else router.back(); }
      else if (e.key === "ArrowLeft") { if (sel) { e.preventDefault(); nudge(-step, 0); } else setTime(t - 0.04); }
      else if (e.key === "ArrowRight") { if (sel) { e.preventDefault(); nudge(step, 0); } else setTime(t + 0.04); }
      else if (e.key === "ArrowUp" && sel) { e.preventDefault(); nudge(0, -step); }
      else if (e.key === "ArrowDown" && sel) { e.preventDefault(); nudge(0, step); }
      else if (e.key.toLowerCase() === "j") setTime(t - 1);
      else if (e.key.toLowerCase() === "l" && !e.ctrlKey && !e.metaKey) setTime(t + 1);
      else if (e.key.toLowerCase() === "s" && !e.ctrlKey && !e.metaKey) { e.preventDefault(); splitAtPlayhead(); }
      else if (e.key.toLowerCase() === "n") setMagnet((m) => !m);
      else if (e.key === "Delete" || e.key === "Backspace") { if (sel) { e.preventDefault(); deleteSel(); } }
      else if (e.key === "\\") { e.preventDefault(); setCompare(true); }
      else if (e.key === "?") setKeysOpen(true);
      else if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "z") { e.preventDefault(); if (e.shiftKey) redo(); else undo(); }
      else if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "y") { e.preventDefault(); redo(); }
    };
    const onUp = (e: KeyboardEvent) => { if (e.key === "\\") setCompare(false); };
    window.addEventListener("keydown", onKey);
    window.addEventListener("keyup", onUp);
    return () => { window.removeEventListener("keydown", onKey); window.removeEventListener("keyup", onUp); };
  });

  const ws: Ws = {
    clip, cfg, doc, sel, t, dur, playing, magnet, compare, editingWord, editingOverlay, ins,
    setSel, setEditingWord, setEditingOverlay, setIns,
    mutate, update, beginGesture, endGesture, setDoc, setCfg, setClipWords,
    setTime, toggle, undo, redo, canUndo: hist.length > 0, canRedo: future.length > 0,
    splitAtPlayhead, deleteSel, toggleMagnet: () => setMagnet((m) => !m), setCompare,
  };

  return (
    <div className="flex h-screen flex-col gap-2.5 bg-ink p-2.5 text-[#F2F2F0]">
      {/* top bar */}
      <header className="relative flex h-12 shrink-0 items-center rounded-2xl bg-graphite px-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
        <button onClick={() => router.back()} aria-label="Exit editor" className="mr-1 flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-sm text-[#A1A5A0] hover:bg-carbon hover:text-white">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M10 3 5 8l5 5"/></svg>
          Exit
        </button>
        <Link href={`/app/projects/${clip.projectId}`} aria-label="Back to project — KivloWorkspace" className="flex items-center gap-2">
          <h1 className="sr-only">KivloWorkspace</h1>
          <Image src={asset("/kivlo-mark-white.png")} alt="" width={94} height={96} className="h-[22px] w-auto" />
          <span className="hidden font-heading text-sm font-bold sm:block">KivloWorkspace</span>
        </Link>
        <div className="absolute left-1/2 -translate-x-1/2">
          <div className="group flex max-w-[46vw] items-center gap-1.5 overflow-hidden rounded-full px-3 py-1.5 text-sm hover:bg-carbon">
            <Link href="/app" className="shrink-0 text-[#A1A5A0] hover:text-white">Projects /</Link>
            <input value={title} onChange={(e) => setTitle(e.target.value)} aria-label="Clip title"
              className="w-40 truncate bg-transparent font-medium text-[#F2F2F0] focus:outline-none" onClick={(e) => e.stopPropagation()} />
            <svg className="h-3 w-3 shrink-0 text-[#A1A5A0]" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M3 4.5 6 7.5 9 4.5"/></svg>
          </div>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <IconButton dark onClick={undo} disabled={!hist.length} label="Undo" className="bg-carbon">{ic.undo}</IconButton>
          <IconButton dark onClick={redo} disabled={!future.length} label="Redo" className="bg-carbon">{ic.redo}</IconButton>
          <span className={`hidden font-mono text-[11px] sm:block ${saved === "saved" ? "text-[#A1A5A0]" : "text-heat"}`}>{saved === "saved" ? "Saved" : "Saving…"}</span>
          <button onClick={() => { setExportOpen(true); setExpPct(-1); }} aria-label="Export" className="ml-1 flex items-center gap-1.5 rounded-full bg-lime px-4 py-2 text-sm font-semibold text-ink hover:bg-lime-hover">{ic.export}<span className="hidden sm:inline">Export</span></button>
        </div>
      </header>

      <main className="flex min-h-0 flex-1 flex-col">
        <div className="flex min-h-0 flex-1">
          {/* icon rail */}
          <nav aria-label="Tools" className="kv-panel-in hidden w-[72px] shrink-0 flex-col items-center gap-1 rounded-2xl bg-graphite py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] md:flex">
            {RAIL.map((r) => (
              <button key={r.k} onClick={() => (r.action ? addOverlay() : setRail(rail === r.k ? null : r.k))} aria-label={r.label} aria-pressed={!r.action && rail === r.k}
                className="flex w-14 flex-col items-center gap-1 py-1.5">
                <span className={`flex h-10 w-10 items-center justify-center rounded-full transition-colors ${!r.action && rail === r.k ? "bg-lime text-ink" : "bg-carbon text-[#A1A5A0] hover:text-white"}`}>{r.icon}</span>
                <span className={`text-[10px] ${!r.action && rail === r.k ? "font-semibold text-lime" : "text-[#A1A5A0]"}`}>{r.label}</span>
              </button>
            ))}
          </nav>

          {/* flyout panel */}
          {rail && (
            <>
              <aside className="kv-panel-in hidden shrink-0 flex-col overflow-y-auto overflow-x-hidden rounded-2xl bg-graphite p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] md:flex" aria-label={rail}
                style={{ width: sizes.left, minWidth: 200, maxWidth: 380 }}>
                <RailPanel ws={ws} rail={rail} siblings={siblings} />
              </aside>
              <PanelDivider vertical value={sizes.left} min={200} max={380} label="Left panel width"
                onChange={(v) => patchSizes({ left: v })} onReset={() => patchSizes({ left: DEFAULT_SIZES.left })} />
            </>
          )}

          <Stage ws={ws} vid={vid} vid2={vid2}
            onVideoEvent={{ onPlay: () => setPlaying(true), onPause: () => setPlaying(false), onLoaded: () => {} }} />

          <PanelDivider vertical sign={-1} value={sizes.right} min={230} max={420} label="Inspector width"
            onChange={(v) => patchSizes({ right: v })} onReset={() => patchSizes({ right: DEFAULT_SIZES.right })} />

          {/* inspector */}
          <aside className="kv-panel-in hidden shrink-0 flex-col overflow-y-auto overflow-x-hidden rounded-2xl bg-graphite p-3.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] lg:flex"
            style={{ width: sizes.right, minWidth: 230, maxWidth: 420 }}>
            <Inspector ws={ws} />
          </aside>
        </div>

        <PanelDivider vertical={false} sign={-1} value={sizes.timeline} min={170} max={420} label="Timeline height"
          onChange={(v) => patchSizes({ timeline: v })} onReset={() => patchSizes({ timeline: DEFAULT_SIZES.timeline })} />

        {/* timeline */}
        <div className="kv-panel-in shrink-0 rounded-2xl bg-graphite p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]" style={{ height: sizes.timeline, animationDelay: "120ms" }}>
          <Timeline ws={ws} />
        </div>
      </main>

      {/* small-screen notice */}
      <div role="dialog" aria-modal="true" aria-label="KivloWorkspace" className="fixed inset-0 z-50 flex items-center justify-center bg-ink p-8 text-center md:hidden">
        <div>
          <p className="font-heading text-lg font-bold">KivloWorkspace works best on a larger screen</p>
          <Link href={`/app/projects/${clip.projectId}`} className="mt-4 inline-block rounded-full bg-lime px-5 py-2.5 text-sm font-semibold text-ink">Back to project</Link>
        </div>
      </div>

      <Modal open={exportOpen} onClose={() => setExportOpen(false)} label="Export clip" dark title="Export">
        {expPct < 0 ? (
          <div className="mt-4 flex gap-4">
            <div className="relative w-24 shrink-0 self-start overflow-hidden rounded-xl ring-1 ring-[#3A3A3A]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={clip.poster} alt="" className="block aspect-[9/16] w-full object-cover" />
              <span className="absolute inset-x-2 bottom-3 text-center text-[13px] font-extrabold uppercase leading-tight text-white [text-shadow:0_1px_6px_rgba(0,0,0,0.8)]">
                {clip.words.slice(0, 3).map((wd) => wd.w).join(" ")}
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-[#F2F2F0]">{clip.title}</p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {["1080×1920", "MP4", `${fmtMin(clip.duration)}`, "~3 MB"].map((s) => (
                  <span key={s} className="rounded-md bg-[#1f1f1f] px-1.5 py-0.5 font-mono text-[10px] text-[#A1A5A0] ring-1 ring-[#3A3A3A]">{s}</span>
                ))}
              </div>
              <label className="mt-4 block text-xs font-medium text-[#A1A5A0]">
                Quality
                <select value={quality} onChange={(e) => setQuality(e.target.value)} className="mt-1 w-full appearance-none rounded-lg border border-[#3A3A3A] bg-[#1f1f1f] px-3 py-2 text-sm text-[#F2F2F0] focus:outline-none focus:ring-2 focus:ring-lime">
                  <option>1080p</option>
                  <option>720p</option>
                </select>
              </label>
              {user.plan !== "pro" && <p className="mt-3 text-xs text-[#A1A5A0]">Free plan exports include a Kivlo watermark.</p>}
              <div className="mt-5 flex justify-end">
                <button onClick={() => { setExpPct(0); const t = setInterval(() => setExpPct((p) => p >= 100 ? (clearInterval(t), 100) : p + 4), 100); }} className="rounded-full bg-lime px-6 py-2.5 text-sm font-semibold text-ink hover:bg-lime-hover">Export</button>
              </div>
            </div>
          </div>
        ) : expPct < 100 ? (
          <div className="mt-6 text-center">
            <div className="mx-auto h-2 w-full overflow-hidden rounded-full bg-[#3A3A3A]"><div className="h-full bg-lime transition-all" style={{ width: `${expPct}%` }} /></div>
            <p className="mt-3 font-mono text-sm text-[#A1A5A0]">Rendering… {expPct}%</p>
            <button onClick={() => setExpPct(-1)} className="mt-2 text-xs text-[#A1A5A0] underline underline-offset-2 hover:text-[#F2F2F0]">Cancel</button>
          </div>
        ) : (
          <div className="mt-4 text-center">
            <span className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-lime text-ink">
              <svg viewBox="0 0 16 16" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 8.5l3.2 3L13 5" /></svg>
            </span>
            <p className="mt-3 font-heading text-base font-bold text-[#F2F2F0]">Your clip is ready.</p>
            <div className="mt-4 space-y-2">
              <a href={clip.src} download className="block rounded-full bg-lime py-2.5 text-sm font-semibold text-ink hover:bg-lime-hover">Download</a>
              <Link href="/app/calendar" className="block rounded-full border border-[#3A3A3A] py-2.5 text-sm font-medium text-[#F2F2F0] hover:bg-white/5">Schedule post</Link>
              <button onClick={() => navigator.clipboard?.writeText(`${clip.hook} ${clip.hashtags.tiktok.join(" ")}`).catch(() => {})} className="w-full text-xs text-[#A1A5A0] underline underline-offset-2 hover:text-[#F2F2F0]">Copy caption</button>
            </div>
          </div>
        )}
      </Modal>
      <Modal open={keysOpen} onClose={() => setKeysOpen(false)} label="Keyboard shortcuts" dark title="Shortcuts">
        <dl className="mt-4 grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
          {[["Space", "Play / pause"], ["J / L", "−1s / +1s"], ["← / →", "Step frame / nudge"], ["↑ / ↓", "Nudge selection"], ["S", "Split at playhead"], ["N", "Toggle snapping"], ["Delete", "Remove selection"], ["\\", "Hold: compare original"], ["Esc", "Deselect"], ["Ctrl+Z / Ctrl+Y", "Undo / redo"]].map(([k, d]) => (
            <div key={k} className="contents"><dt className="font-mono text-xs text-[#A1A5A0]">{k}</dt><dd className="text-sm">{d}</dd></div>
          ))}
        </dl>
      </Modal>
    </div>
  );
}
