"use client";

import { useEffect, useRef, useState } from "react";
import type { Clip } from "@/lib/mock";
import type { EditDoc } from "./editDoc";

export const fmtTc = (v: number) => `${Math.floor(v / 60)}:${(v % 60).toFixed(1).padStart(4, "0")}`;
export const COLORS = ["#BDEF72", "#F5A524", "#BAAEF0", "#FFFFFF", "#FF6B63"];
export const FONTS = ["Manrope", "Clash Display", "JetBrains Mono"];

const IC = "h-4 w-4";
export const ic = {
  play: <svg className={IC} viewBox="0 0 16 16" fill="currentColor"><path d="M4 2.5v11l9-5.5-9-5.5Z"/></svg>,
  pause: <svg className={IC} viewBox="0 0 16 16" fill="currentColor"><path d="M4 2h3v12H4zM9 2h3v12H9z"/></svg>,
  undo: <svg className={IC} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 6h7a3.5 3.5 0 1 1 0 7H6"/><path d="M5.5 3.5 3 6l2.5 2.5"/></svg>,
  redo: <svg className={IC} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M13 6H6a3.5 3.5 0 1 0 0 7h4"/><path d="M10.5 3.5 13 6l-2.5 2.5"/></svg>,
  loop: <svg className={IC} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M2.5 8a5.5 5.5 0 0 1 9.4-3.9L13.5 5.7M13.5 2v3.7H9.8M13.5 8a5.5 5.5 0 0 1-9.4 3.9L2.5 10.3M2.5 14v-3.7h3.7"/></svg>,
  back: <svg className={IC} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M10 3 5 8l5 5"/></svg>,
  fwd: <svg className={IC} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M6 3l5 5-5 5"/></svg>,
  vol: <svg className={IC} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M2.5 6h3l4-3v10l-4-3h-3V6Z"/><path d="M11.5 5.5a4 4 0 0 1 0 5"/></svg>,
  split: <svg className={IC} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M8 2v12M8 8h5M2 8h4"/><circle cx="4" cy="5" r="1.5"/><circle cx="12" cy="11" r="1.5"/></svg>,
  trash: <svg className={IC} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M2.5 4h11M6 4V2.5h4V4M3.5 4l.7 9.5h7.6l.7-9.5"/></svg>,
  video: <svg className={IC} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="1.5" y="4" width="9" height="8" rx="1.5"/><path d="m10.5 7 4-2.5v7L10.5 9"/></svg>,
  audio: <svg className={IC} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M5.5 12.5v-8l7-1.5v8"/><circle cx="3.5" cy="12.5" r="2"/><circle cx="10.5" cy="11" r="2"/></svg>,
  eye: <svg className="h-3 w-3" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M1.5 8S4 3.5 8 3.5 14.5 8 14.5 8 12 12.5 8 12.5 1.5 8 1.5 8Z"/><circle cx="8" cy="8" r="2"/></svg>,
  lock: <svg className="h-3 w-3" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3.5" y="7" width="9" height="6" rx="1.5"/><path d="M5.5 7V5a2.5 2.5 0 0 1 5 0v2"/></svg>,
  moments: <svg className={IC} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="1.5" y="1.5" width="5.5" height="5.5" rx="1.2"/><rect x="9" y="1.5" width="5.5" height="5.5" rx="1.2"/><rect x="1.5" y="9" width="5.5" height="5.5" rx="1.2"/><rect x="9" y="9" width="5.5" height="5.5" rx="1.2"/></svg>,
  transcript: <svg className={IC} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 3.5h10M3 7h10M3 10.5h6"/></svg>,
  captions: <svg className={IC} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="1.5" y="3" width="13" height="10" rx="2"/><path d="M4 10.5h4M9 10.5h3"/></svg>,
  layout: <svg className={IC} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="1.5" y="2" width="13" height="12" rx="2"/><path d="M1.5 7h13"/></svg>,
  expand: <svg className={IC} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M9.5 2.5h4v4M6.5 13.5h-4v-4M13.5 2.5 9.5 6.5M2.5 13.5l4-4"/></svg>,
  gear: <svg className={IC} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="8" cy="8" r="2.2"/><path d="M8 1.5v1.8M8 12.7v1.8M1.5 8h1.8M12.7 8h1.8M3.4 3.4l1.3 1.3M11.3 11.3l1.3 1.3M12.6 3.4l-1.3 1.3M4.7 11.3l-1.3 1.3"/></svg>,
  export: <svg className={IC} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M8 10V2.5M5 5l3-3 3 3"/><path d="M2.5 10v2.5a1 1 0 0 0 1 1h9a1 1 0 0 0 1-1V10"/></svg>,
  text: <svg className={IC} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M3 4V2.5h10V4M8 2.5v11M5.5 13.5h5"/></svg>,
  adjust: <svg className={IC} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M2.5 5h11M2.5 11h11"/><circle cx="6" cy="5" r="2"/><circle cx="10" cy="11" r="2"/></svg>,
  magnet: <svg className={IC} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M4 2.5v5a4 4 0 0 0 8 0v-5"/><path d="M4 2.5h3v3H4zM9 2.5h3v3H9z" fill="currentColor" stroke="none"/></svg>,
};

export type Cfg = {
  layout: "auto" | "split" | "face"; cropX: number; font: string; size: number; weight: number;
  color: string; textColor: string; style: string; upper: boolean; reveal: boolean; highlight: boolean;
  lines: number; lineWords: number; boxOp: number; anim: "none" | "pop" | "bounce" | "type" | "fade";
  animSpeed: number; safeGuides: boolean; emphasis: boolean; emoji: boolean;
};

export type Sel =
  | { kind: "crop" } | { kind: "caption" }
  | { kind: "face" } | { kind: "game" }
  | { kind: "overlay"; id: string }
  | { kind: "segment"; id: string }
  | { kind: "block"; id: string }
  | null;

export type Snap = { doc: EditDoc; cfg: Cfg; clip: Clip };
export type InsTab = "layout" | "captions" | "adjust" | "post";

export interface Ws {
  clip: Clip;
  cfg: Cfg;
  doc: EditDoc;
  sel: Sel;
  t: number;                 // timeline seconds
  dur: number;               // timeline duration (sum of segments)
  playing: boolean;
  magnet: boolean;
  compare: boolean;
  editingWord: number | null;
  editingOverlay: string | null;
  setSel: (s: Sel) => void;
  setEditingWord: (i: number | null) => void;
  setEditingOverlay: (id: string | null) => void;
  mutate: (fn: (s: Snap) => Snap) => void;          // commit = one undo step
  update: (fn: (s: Snap) => Snap) => void;          // live change, no history
  beginGesture: () => void;
  endGesture: () => void;
  setDoc: (fn: (d: EditDoc) => EditDoc) => void;    // committed doc change
  setCfg: (fn: (c: Cfg) => Cfg) => void;            // committed cfg change
  setClipWords: (fn: (c: Clip) => Clip) => void;    // committed clip change
  setTime: (tl: number) => void;
  toggle: () => void;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  splitAtPlayhead: () => void;
  deleteSel: () => void;
  toggleMagnet: () => void;
  setCompare: (v: boolean) => void;
  ins: InsTab;
  setIns: (t: InsTab) => void;
}

export function CapSec({ title, children, open = false }: { title: string; children: React.ReactNode; open?: boolean }) {
  const [on, setOn] = useState(open);
  return (
    <div className="rounded-xl bg-carbon">
      <button onClick={() => setOn(!on)} aria-expanded={on} className="flex w-full items-center justify-between px-3 py-2.5 text-xs font-semibold text-[#A1A5A0] hover:text-white">
        {title}
        <svg viewBox="0 0 12 12" className={`h-3 w-3 transition-transform ${on ? "rotate-180" : ""}`} fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M3 4.5l3 3 3-3"/></svg>
      </button>
      {on && <div className="space-y-3 px-3 pb-3">{children}</div>}
    </div>
  );
}

export function Slider({ label, min, max, step = 1, value, onChange, unit = "", reset }: {
  label: string; min: number; max: number; step?: number; value: number;
  onChange: (v: number) => void; unit?: string; reset?: number;
}) {
  return (
    <div className="flex items-center gap-3" onDoubleClick={reset !== undefined ? () => onChange(reset) : undefined}>
      <span className="w-20 shrink-0 text-xs text-[#A1A5A0]">{label}</span>
      <input type="range" min={min} max={max} step={step} value={value} aria-label={label} onChange={(e) => onChange(+e.target.value)}
        className="h-1 min-w-0 flex-1 cursor-pointer appearance-none rounded-full bg-[#3A3A3A] accent-white [&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow" />
      <span className="w-10 shrink-0 rounded-lg bg-carbon px-1 py-1 text-center font-mono text-[11px] tabular-nums text-[#F2F2F0]">{value}{unit}</span>
    </div>
  );
}

// Small numeric field used in the inspector's selection readout.
export function NumField({ label, value, onChange, step = 1 }: { label: string; value: number; onChange: (v: number) => void; step?: number }) {
  return (
    <label className="block">
      <span className="mb-0.5 block text-[10px] text-[#A1A5A0]">{label}</span>
      <input type="number" value={Math.round(value * 100) / 100} step={step} onChange={(e) => { const v = +e.target.value; if (!Number.isNaN(v)) onChange(v); }}
        className="w-full rounded-lg border border-[#3A3A3A] bg-carbon px-2 py-1.5 font-mono text-xs text-[#F2F2F0] focus:border-lime focus:outline-none" />
    </label>
  );
}

// ContentEditable inline text edit. Enter commits, Esc cancels, blur commits.
export function InlineEdit({ value, onCommit, className = "", style }: {
  value: string; onCommit: (v: string | null) => void; className?: string; style?: React.CSSProperties;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.focus();
    const r = document.createRange();
    r.selectNodeContents(el);
    const s = getSelection();
    s?.removeAllRanges();
    s?.addRange(r);
  }, []);
  return (
    <span ref={ref} contentEditable suppressContentEditableWarning role="textbox" aria-label="Edit text"
      className={`cursor-text outline-none ring-1 ring-lime ${className}`} style={style}
      onKeyDown={(e) => {
        e.stopPropagation();
        if (e.key === "Enter") { e.preventDefault(); onCommit(ref.current?.textContent ?? ""); }
        else if (e.key === "Escape") { e.preventDefault(); onCommit(null); }
      }}
      onBlur={() => onCommit(ref.current?.textContent ?? "")}>
      {value}
    </span>
  );
}
