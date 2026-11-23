"use client";

import { asset } from "@/lib/asset";
import Link from "next/link";
import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Clip } from "@/lib/mock";
import { clips as allClips, presets } from "@/lib/mock";
import { ScoreBadge, Modal, fmtMin } from "./ui";
import { user } from "@/lib/mock";

const fmtTc = (v: number) => `${Math.floor(v / 60)}:${(v % 60).toFixed(1).padStart(4, "0")}`;

const COLORS = ["#BDEF72", "#F5A524", "#BAAEF0", "#FFFFFF", "#FF6B63"];
const FONTS = ["Manrope", "Clash Display", "JetBrains Mono"];
const IC = "h-4 w-4";
const ic = {
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
};

type Cfg = { layout: "auto" | "split" | "face"; cropX: number; font: string; size: number; weight: number; posY: number; color: string; textColor: string; style: string; upper: boolean; reveal: boolean; highlight: boolean; lines: number; lineWords: number; boxOp: number; anim: "none" | "pop" | "bounce" | "type" | "fade"; animSpeed: number; safeGuides: boolean; emphasis: boolean; emoji: boolean; };
type RailKey = "moments" | "transcript" | "captions" | "layout";

const RAIL: { k: RailKey; label: string; icon: React.ReactNode }[] = [
  { k: "moments", label: "Moments", icon: ic.moments },
  { k: "transcript", label: "Transcript", icon: ic.transcript },
  { k: "captions", label: "Captions", icon: ic.captions },
  { k: "layout", label: "Layout", icon: ic.layout },
];


function CapSec({ title, children, open = false }: { title: string; children: React.ReactNode; open?: boolean }) {
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

function Slider({ label, min, max, step = 1, value, onChange, unit = "" }: { label: string; min: number; max: number; step?: number; value: number; onChange: (v: number) => void; unit?: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="w-20 shrink-0 text-xs text-[#A1A5A0]">{label}</span>
      <input type="range" min={min} max={max} step={step} value={value} aria-label={label} onChange={(e) => onChange(+e.target.value)}
        className="h-1 flex-1 cursor-pointer appearance-none rounded-full bg-[#3A3A3A] accent-white [&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow" />
      <span className="w-12 shrink-0 rounded-lg bg-carbon px-2 py-1 text-center font-mono text-[11px] text-[#F2F2F0]">{value}{unit}</span>
    </div>
  );
}

export default function Workspace({ clip: initial, siblings }: { clip: Clip; siblings: Clip[] }) {
  const [clip, setClip] = useState(initial);
  const [title, setTitle] = useState(initial.title);
  const [playing, setPlaying] = useState(false);
  const [t, setT] = useState(0);
  const [dur, setDur] = useState(6);
  const [trim, setTrim] = useState<[number, number]>([0, 6]);
  const [rail, setRail] = useState<RailKey | null>("transcript");
  const [ins, setIns] = useState<"layout" | "captions" | "preset" | "post">("captions");
  const [cfg, setCfg] = useState<Cfg>({ layout: clip.layout, cropX: 50, font: "Manrope", size: 26, weight: 800, posY: 62, color: "#BDEF72", textColor: "#FFFFFF", style: "pop", upper: true, reveal: true, highlight: true, lines: 2, lineWords: 3, boxOp: 75, anim: "pop", animSpeed: 150, safeGuides: false, emphasis: false, emoji: false });
  const [hist, setHist] = useState<Cfg[]>([]);
  const [future, setFuture] = useState<Cfg[]>([]);
  const [saved, setSaved] = useState<"saved" | "saving">("saved");
  const [exportOpen, setExportOpen] = useState(false);
  const [quality, setQuality] = useState("1080p");
  const [expPct, setExpPct] = useState(-1);
  const [keysOpen, setKeysOpen] = useState(false);
  const [speed, setSpeed] = useState(1);
  const vid = useRef<HTMLVideoElement>(null);
  const vid2 = useRef<HTMLVideoElement>(null);
  const raf = useRef(0);
  const tracks = useRef<HTMLDivElement>(null);

  const apply = useCallback((c: Cfg) => {
    setHist((h) => [...h.slice(-30), cfg]); setFuture([]); setCfg(c);
    setSaved("saving"); setTimeout(() => setSaved("saved"), 700);
  }, [cfg]);
  const undo = () => { if (!hist.length) return; setFuture((f) => [cfg, ...f]); const p = hist[hist.length - 1]; setHist(hist.slice(0, -1)); setCfg(p); };
  const redo = () => { if (!future.length) return; setHist((h) => [...h, cfg]); const [n, ...r] = future; setFuture(r); setCfg(n); };

  const setTime = useCallback((v: number) => { const c = Math.max(trim[0], Math.min(trim[1], v)); [vid.current, vid2.current].forEach((x) => x && (x.currentTime = c)); setT(c); }, [trim]);
  const toggle = () => { const v = vid.current; if (!v) return; if (v.paused) { v.play().catch(() => {}); vid2.current?.play().catch(() => {}); } else { v.pause(); vid2.current?.pause(); } };

  useEffect(() => {
    if (!playing) return;
    const step = () => { const v = vid.current; if (v) { setT(v.currentTime); if (v.currentTime >= trim[1]) setTime(trim[0]); } raf.current = requestAnimationFrame(step); };
    raf.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf.current);
  }, [playing, trim, setTime]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).closest("input,textarea,select,[contenteditable]")) return;
      if (e.code === "Space") { e.preventDefault(); toggle(); }
      else if (e.key === "ArrowLeft") setTime(t - 0.04);
      else if (e.key === "ArrowRight") setTime(t + 0.04);
      else if (e.key.toLowerCase() === "j") setTime(t - 1);
      else if (e.key.toLowerCase() === "l") setTime(t + 1);
      else if (e.key === "?") setKeysOpen(true);
      else if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "z") { e.preventDefault(); if (e.shiftKey) redo(); else undo(); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const seekFromPointer = (e: React.PointerEvent) => {
    const r = tracks.current!.getBoundingClientRect();
    setTime(((e.clientX - r.left) / r.width) * dur);
  };

  const wave = useMemo(() => Array.from({ length: 140 }, (_, i) => Math.round((0.2 + 0.8 * Math.abs(Math.sin(i * 7.3) * Math.cos(i * 2.1))) * 1000) / 1000), []);
  const active = clip.words.findIndex((w) => t >= w.start && t < w.end);
  const editWord = (idx: number, val: string) => setClip({ ...clip, words: clip.words.map((w, j) => (j === idx ? { ...w, w: val } : w)) });
  const toggleCut = (idx: number) => { setClip((c) => ({ ...c, words: c.words.map((w, j) => (j === idx ? { ...w, cut: !w.cut } : w)) })); setSaved("saving"); setTimeout(() => setSaved("saved"), 700); };
  const visWords = clip.words.filter((w) => !w.cut);
  const ai = visWords.findIndex((w) => t >= w.start && t < w.end);
  const line = ai >= 0 ? visWords.slice(Math.max(0, ai - (ai % cfg.lineWords)), Math.max(0, ai - (ai % cfg.lineWords)) + cfg.lineWords) : [];
  const fontFam = cfg.font === "Clash Display" ? "var(--font-clash)" : cfg.font === "JetBrains Mono" ? "var(--font-jetbrains)" : "var(--font-body)";
  const L = trim[0], R = trim[1];

  const capt = (
    <div className="pointer-events-none absolute inset-x-2 z-10 flex justify-center text-center" style={{ top: `${cfg.posY}%` }}>
      <p className={`flex flex-wrap justify-center gap-x-[0.3em] leading-tight ${cfg.upper ? "uppercase" : ""}`} style={{ fontFamily: fontFam, fontSize: cfg.size, fontWeight: cfg.weight, textShadow: "0 2px 12px rgba(0,0,0,.6)" }}>
        {line.slice(0, cfg.lines * cfg.lineWords).map((w) => {
          const on = t >= w.start && t < w.end;
          const pop = cfg.anim !== "none" && cfg.reveal && on;
          return (
            <span key={w.start} className={`inline-block transition-all ${pop ? "scale-110" : ""} ${cfg.anim === "fade" && on ? "opacity-100" : cfg.anim === "fade" ? "opacity-70" : ""}`}
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
    </div>
  );

  const transport = (
    <div className="absolute inset-x-2 bottom-3 z-20 flex items-center justify-center gap-1.5">
      <div className="flex items-center gap-1.5 rounded-full border border-white/10 bg-black/40 py-1.5 pl-1.5 pr-2.5 backdrop-blur">
        <button onClick={toggle} aria-label={playing ? "Pause" : "Play"} className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-ink">{playing ? ic.pause : ic.play}</button>
        <span className="whitespace-nowrap font-mono text-[11px] tabular-nums text-white">{fmtTc(t)} <span className="text-white/50">/ {fmtTc(dur)}</span></span>
        <button aria-label="Mute" className="text-white/70 hover:text-white">{ic.vol}</button>
      </div>
      <div className="hidden items-center gap-1 rounded-full border border-white/10 bg-black/40 px-2 py-1.5 backdrop-blur sm:flex">
        <button aria-label="Loop" className="rounded-full p-1.5 text-lime">{ic.loop}</button>
        <button onClick={() => setTime(t - 1)} aria-label="Back 1 second" className="rounded-full p-1.5 text-white/70 hover:text-white">{ic.back}</button>
        <button onClick={() => setTime(t + 1)} aria-label="Forward 1 second" className="rounded-full p-1.5 text-white/70 hover:text-white">{ic.fwd}</button>
      </div>
      <div className="hidden items-center gap-1 rounded-full border border-white/10 bg-black/40 px-2 py-1.5 backdrop-blur min-[1600px]:flex">
        <button aria-label="Fullscreen" className="rounded-full p-1.5 text-white/70 hover:text-white">{ic.expand}</button>
        <button onClick={() => setKeysOpen(true)} aria-label="Settings and shortcuts" className="rounded-full p-1.5 text-white/70 hover:text-white">{ic.gear}</button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen flex-col gap-2.5 bg-ink p-2.5 text-[#F2F2F0]">
      {/* top bar */}
      <header className="relative flex h-12 shrink-0 items-center rounded-2xl bg-graphite px-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
        <Link href={`/app/projects/${clip.projectId}`} aria-label="Back to project — KivloWorkspace" className="flex items-center gap-2">
          <h1 className="sr-only">KivloWorkspace</h1>
          <Image src={asset("/kivlo-mark-white.png")} alt="" width={94} height={96} className="h-[22px] w-auto" />
          <span className="hidden font-heading text-sm font-bold sm:block">KivloWorkspace</span>
        </Link>
        <div className="absolute left-1/2 -translate-x-1/2">
          <div className="group flex max-w-[46vw] items-center gap-1.5 rounded-full px-3 py-1.5 text-sm hover:bg-carbon">
            <Link href="/app" className="shrink-0 text-[#A1A5A0] hover:text-white">Projects /</Link>
            <input value={title} onChange={(e) => setTitle(e.target.value)} aria-label="Clip title"
              className="w-40 truncate bg-transparent font-medium text-[#F2F2F0] focus:outline-none" onClick={(e) => e.stopPropagation()} />
            <svg className="h-3 w-3 shrink-0 text-[#A1A5A0]" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M3 4.5 6 7.5 9 4.5"/></svg>
          </div>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <button onClick={undo} disabled={!hist.length} aria-label="Undo" className="flex h-8 w-8 items-center justify-center rounded-full bg-carbon text-[#A1A5A0] hover:text-white disabled:opacity-30">{ic.undo}</button>
          <button onClick={redo} disabled={!future.length} aria-label="Redo" className="flex h-8 w-8 items-center justify-center rounded-full bg-carbon text-[#A1A5A0] hover:text-white disabled:opacity-30">{ic.redo}</button>
          <span className={`hidden font-mono text-[11px] sm:block ${saved === "saved" ? "text-[#A1A5A0]" : "text-heat"}`}>{saved === "saved" ? "Saved" : "Saving…"}</span>
          <button onClick={() => { setExportOpen(true); setExpPct(-1); }} aria-label="Export" className="ml-1 flex items-center gap-1.5 rounded-full bg-lime px-4 py-2 text-sm font-semibold text-ink hover:bg-lime-hover">{ic.export}<span className="hidden sm:inline">Export</span></button>
        </div>
      </header>

      <main className="flex min-h-0 flex-1 flex-col gap-2.5">
      <div className="flex min-h-0 flex-1 gap-2.5">
        {/* icon rail */}
        <nav aria-label="Tools" className="hidden w-[72px] shrink-0 flex-col items-center gap-1 rounded-2xl bg-graphite py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] md:flex">
          {RAIL.map((r) => (
            <button key={r.k} onClick={() => setRail(rail === r.k ? null : r.k)} aria-label={r.label} aria-pressed={rail === r.k}
              className="flex w-14 flex-col items-center gap-1 py-1.5">
              <span className={`flex h-10 w-10 items-center justify-center rounded-full transition-colors ${rail === r.k ? "bg-lime text-ink" : "bg-carbon text-[#A1A5A0] hover:text-white"}`}>{r.icon}</span>
              <span className={`text-[10px] ${rail === r.k ? "font-semibold text-lime" : "text-[#A1A5A0]"}`}>{r.label}</span>
            </button>
          ))}
        </nav>

        {/* flyout panel */}
        {rail && (
          <aside className="hidden w-[260px] shrink-0 flex-col overflow-y-auto rounded-2xl bg-graphite p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] md:flex" aria-label={rail}>
            {rail === "moments" && siblings.map((s) => (
              <Link key={s.id} href={`/app/clips/${s.id}/edit`} className={`mb-1.5 flex items-center gap-2.5 rounded-xl p-2 ${s.id === clip.id ? "bg-carbon ring-1 ring-lime" : "hover:bg-carbon"}`}>
                <Image src={s.poster} alt="" width={404} height={720} className="h-auto w-[30px] rounded-md object-cover" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-xs font-medium">{s.title}</span>
                  <span className="font-mono text-[10px] text-[#A1A5A0]">{s.duration.toFixed(1)}s</span>
                </span>
                <ScoreBadge score={s.score} />
              </Link>
            ))}
            {rail === "transcript" && (
              <p className="px-1 py-1 text-sm leading-relaxed">
                {clip.words.map((w, j) => (
                  <button key={j} onClick={() => setTime(w.start)} onDoubleClick={() => { const v = prompt("Edit word", w.w); if (v) editWord(j, v); }}
                    className={`rounded px-0.5 text-left transition-colors ${w.cut ? "text-[#5A5E56] line-through" : j === active ? "bg-lime/20 text-lime" : "text-[#D9DBD3] hover:bg-carbon"}`}>
                    {w.w}{" "}
                  </button>
                ))}
                <button onClick={() => active >= 0 && toggleCut(active)} className="mt-3 block rounded-full bg-carbon px-3 py-1.5 text-xs text-[#A1A5A0] hover:text-white">Cut current word</button>
              </p>
            )}
            {rail === "captions" && (
              <div className="space-y-3 text-xs text-[#A1A5A0]">
                <div className="grid grid-cols-3 gap-2">
                  {(["pop", "clean", "box"] as const).map((s) => (
                    <button key={s} aria-pressed={cfg.style === s} onClick={() => apply({ ...cfg, style: s })}
                      className={`rounded-xl border p-2 ${cfg.style === s ? "border-lime" : "border-[#3A3A3A]"}`}>
                      <span className={`block rounded bg-ink px-1 py-2 text-center font-bold uppercase text-white ${s === "box" ? "ring-1 ring-lilac" : ""}`} style={{ fontSize: 9 }}>
                        <span style={{ color: s === "pop" ? "#BDEF72" : "#fff" }}>No</span> way
                      </span><span className="mt-1 block capitalize">{s}</span>
                    </button>
                  ))}
                </div>
                <div className="flex gap-2">{COLORS.map((c) => (
                  <button key={c} onClick={() => apply({ ...cfg, color: c })} aria-label={`Color ${c}`} aria-pressed={cfg.color === c}
                    className={`h-6 w-6 rounded-full ring-2 ring-offset-2 ring-offset-graphite ${cfg.color === c ? "ring-lime" : "ring-transparent"}`} style={{ background: c }} />
                ))}</div>
              </div>
            )}
            {rail === "layout" && (
              <div className="grid grid-cols-3 gap-2">
                {([["auto", "Auto"], ["split", "Split"], ["face", "Face"]] as const).map(([k, l]) => (
                  <button key={k} aria-pressed={cfg.layout === k} onClick={() => apply({ ...cfg, layout: k })}
                    className={`rounded-xl border p-2 text-[11px] font-medium ${cfg.layout === k ? "border-lime bg-lime/10 text-white" : "border-[#3A3A3A] text-[#A1A5A0]"}`}>
                    <span className="mx-auto mb-1.5 block aspect-[9/16] w-6 rounded bg-carbon ring-1 ring-[#3A3A3A]">
                      {k === "split" && <span className="block h-1/2 rounded-t bg-lilac/40" />}
                      {k === "face" && <span className="m-auto mt-1 block h-3 w-3 rounded-full bg-lilac/40" />}
                      {k === "auto" && <span className="m-auto mt-1 block h-3 w-3 rounded bg-lime/40" />}
                    </span>{l}
                  </button>
                ))}
              </div>
            )}
          </aside>
        )}

        {/* stage */}
        <section className="relative flex min-w-0 flex-1 items-center justify-center rounded-2xl bg-[#1f1f1f] bg-[radial-gradient(#3A3A3A_1px,transparent_1px)] [background-size:22px_22px] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
          <div className="pointer-events-none absolute left-1/2 top-1/2 h-2/3 w-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-lime/[0.05] blur-3xl" aria-hidden="true" />
          <div className="relative aspect-[9/16] h-full max-h-full overflow-hidden rounded-[20px] bg-black shadow-2xl" style={{ maxWidth: "calc((100vh - 320px) * 0.5625)" }}>
            {cfg.layout === "split" ? (
              <>
                <video ref={vid} src={clip.src} poster={clip.poster} muted loop playsInline preload="metadata" aria-label="Clip preview" onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)} onLoadedMetadata={(e) => { setDur(e.currentTarget.duration); e.currentTarget.playbackRate = speed; }}
                  className="absolute inset-x-0 top-0 h-[40%] w-full object-cover" style={{ objectPosition: `${cfg.cropX}% 18%` }} />
                <video ref={vid2} src={clip.src} poster={clip.poster} muted loop playsInline preload="metadata" aria-hidden className="absolute inset-x-0 bottom-0 h-[60%] w-full object-cover" style={{ objectPosition: `${cfg.cropX}% 78%` }} />
                <div className="absolute inset-x-0 top-[40%] z-10 h-0.5 bg-ink" aria-hidden="true" />
              </>
            ) : (
              <video ref={vid} src={clip.src} poster={clip.poster} muted loop playsInline preload="metadata" aria-label="Clip preview" onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)} onLoadedMetadata={(e) => setDur(e.currentTarget.duration)}
                className="h-full w-full object-cover" style={{ objectPosition: `${cfg.cropX}% ${cfg.layout === "face" ? "15%" : "50%"}` }} />
            )}
            {capt}
            {cfg.safeGuides && (
              <div aria-hidden className="pointer-events-none absolute inset-0 z-[5]">
                <span className="absolute inset-x-0 top-0 h-[14%] border-b border-dashed border-heat/60" />
                <span className="absolute inset-x-0 bottom-0 h-[18%] border-t border-dashed border-heat/60" />
                <span className="absolute right-0 top-[14%] bottom-[18%] w-[16%] border-l border-dashed border-heat/60" />
                <span className="absolute left-2 top-[15%] rounded bg-black/40 px-1.5 py-0.5 font-mono text-[8px] text-heat/80">TikTok safe zones</span>
              </div>
            )}
            {transport}
          </div>
        </section>

        {/* inspector */}
        <aside className="hidden w-[290px] shrink-0 flex-col overflow-y-auto rounded-2xl bg-graphite p-3.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] lg:flex">
          <div role="tablist" aria-label="Inspector" className="mb-4 flex rounded-full bg-carbon p-1">
            {(["layout", "captions", "post"] as const).map((x) => (
              <button key={x} role="tab" aria-selected={ins === x} onClick={() => setIns(x)}
                className={`flex-1 rounded-full px-2 py-1.5 text-[11px] font-semibold capitalize transition-colors ${ins === x ? "bg-graphite text-white shadow ring-1 ring-[#3A3A3A]" : "text-[#A1A5A0] hover:text-white"}`}>{x}</button>
            ))}
          </div>
          {ins === "layout" && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-2">
                {([["auto", "Auto"], ["split", "Split"], ["face", "Face"]] as const).map(([k, l]) => (
                  <button key={k} aria-pressed={cfg.layout === k} onClick={() => apply({ ...cfg, layout: k })}
                    className={`rounded-xl border p-2 text-[11px] font-medium ${cfg.layout === k ? "border-lime bg-lime/10 text-white" : "border-[#3A3A3A] text-[#A1A5A0] hover:border-[#7C7C7C]"}`}>
                    <span className="mx-auto mb-1.5 block aspect-[9/16] w-6 rounded bg-carbon ring-1 ring-[#3A3A3A]">
                      {k === "split" && <span className="block h-1/2 rounded-t bg-lilac/40" />}
                      {k === "face" && <span className="m-auto mt-1 block h-3 w-3 rounded-full bg-lilac/40" />}
                      {k === "auto" && <span className="m-auto mt-1 block h-3 w-3 rounded bg-lime/40" />}
                    </span>{l}
                  </button>
                ))}
              </div>
              <Slider label="Crop X" min={0} max={100} value={cfg.cropX} onChange={(v) => apply({ ...cfg, cropX: v })} unit="%" />
              <div className="mt-4 border-t border-[#3A3A3A] pt-4">
                <p className="mb-2 text-xs font-semibold text-[#A1A5A0]">Presets</p>
                {presets.map((p) => (
                  <div key={p.id} className="mb-1.5 flex items-center gap-2 rounded-xl bg-carbon p-2.5">
                    <span className="h-4 w-4 rounded-full" style={{ background: p.color }} />
                    <span className="flex-1 text-xs font-medium">{p.name}</span>
                    {p.isDefault && <span className="rounded-full bg-lime px-2 py-0.5 text-[10px] font-semibold text-ink">Default</span>}
                    <button onClick={() => apply({ ...cfg, color: p.color, style: p.style })} className="text-[11px] text-lime hover:underline">Apply</button>
                  </div>
                ))}
                <button className="mt-2 w-full rounded-full border border-[#3A3A3A] py-2 text-xs text-[#A1A5A0] hover:text-white">Reset</button>
              </div>
            </div>
          )}
          {ins === "captions" && (
            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-2">
                {presets.filter((p) => p.kind === "captions").map((p, i) => (
                  <button key={p.id} aria-pressed={cfg.style === p.style} onClick={() => apply({ ...cfg, style: p.style, color: p.color })}
                    className={`rounded-xl border p-1.5 ${cfg.style === p.style ? "border-lime bg-lime/10" : "border-[#3A3A3A] hover:border-[#7C7C7C]"}`}>
                    <span className="relative block aspect-[9/16] w-full overflow-hidden rounded-lg bg-ink">
                      <Image src={allClips[(i * 3 + 1) % allClips.length].poster} alt="" fill sizes="80px" className="object-cover opacity-70" />
                      <span className="absolute inset-x-0 bottom-1 flex justify-center">
                        <span className="px-0.5 text-[8px] font-extrabold uppercase leading-none" style={{ color: p.color, textShadow: "0 1px 4px rgba(0,0,0,.9)" }}>Did that</span>
                      </span>
                    </span>
                    <span className="mt-1 block truncate text-[9px] text-[#A1A5A0]">{p.name}</span>
                  </button>
                ))}
              </div>

              <CapSec title="Text" open>
                <div className="flex gap-2">
                  <select value={cfg.font} onChange={(e) => apply({ ...cfg, font: e.target.value })} aria-label="Caption font"
                    className="min-w-0 flex-1 rounded-lg border border-[#3A3A3A] bg-carbon px-2 py-1.5 text-xs text-white">
                    {FONTS.map((f) => <option key={f}>{f}</option>)}
                  </select>
                  <select value={cfg.weight} onChange={(e) => apply({ ...cfg, weight: Number(e.target.value) })} aria-label="Weight"
                    className="w-16 rounded-lg border border-[#3A3A3A] bg-carbon px-2 py-1.5 text-xs text-white">
                    {[800, 700, 600].map((w) => <option key={w}>{w}</option>)}
                  </select>
                </div>
                <Slider label="Size" min={16} max={40} value={cfg.size} onChange={(v) => apply({ ...cfg, size: v })} />
                <div className="flex items-center justify-between text-xs text-[#A1A5A0]">
                  <span>Letter case</span>
                  <div className="flex rounded-full bg-carbon p-0.5">
                    {([["upper", "AA"], ["mixed", "Aa"]] as const).map(([k, l]) => (
                      <button key={k} onClick={() => apply({ ...cfg, upper: k === "upper" })}
                        className={`rounded-full px-2.5 py-1 font-mono text-[10px] ${(k === "upper") === cfg.upper ? "bg-graphite text-white" : "text-[#A1A5A0]"}`}>{l}</button>
                    ))}
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs text-[#A1A5A0]">
                  <span>Lines</span>
                  <div className="flex rounded-full bg-carbon p-0.5">
                    {[1, 2, 3].map((n) => (
                      <button key={n} onClick={() => apply({ ...cfg, lines: n })}
                        className={`h-6 w-7 rounded-full font-mono text-[10px] ${cfg.lines === n ? "bg-graphite text-white" : "text-[#A1A5A0]"}`}>{n}</button>
                    ))}
                  </div>
                </div>
                <Slider label="Words per line" min={2} max={5} value={cfg.lineWords} onChange={(v) => apply({ ...cfg, lineWords: v })} />
              </CapSec>

              <CapSec title="Colors">
                <div className="space-y-2.5">
                  {([["textColor", "Text"], ["color", "Active word"]] as const).map(([k, l]) => (
                    <div key={k} className="flex items-center gap-3">
                      <span className="w-20 text-xs text-[#A1A5A0]">{l}</span>
                      <div className="flex flex-1 gap-1.5">{COLORS.map((c) => (
                        <button key={c} onClick={() => apply({ ...cfg, [k]: c })} aria-label={`${l} ${c}`} aria-pressed={cfg[k] === c}
                          className={`h-6 w-6 rounded-full ring-2 ring-offset-2 ring-offset-graphite ${cfg[k] === c ? "ring-lime" : "ring-transparent"}`} style={{ background: c }} />
                      ))}</div>
                    </div>
                  ))}
                  <Slider label="Shadow box" min={0} max={100} value={cfg.boxOp} onChange={(v) => apply({ ...cfg, boxOp: v })} unit="%" />
                </div>
              </CapSec>

              <CapSec title="Animation">
                <div className="flex flex-wrap gap-1.5">
                  {(["none", "pop", "bounce", "type", "fade"] as const).map((a) => (
                    <button key={a} aria-pressed={cfg.anim === a} onClick={() => apply({ ...cfg, anim: a, reveal: a !== "none" })}
                      className={`rounded-full px-3 py-1.5 text-[11px] font-medium capitalize ${cfg.anim === a ? "bg-lime text-ink" : "bg-carbon text-[#A1A5A0] hover:text-white"}`}>{a}</button>
                  ))}
                </div>
                <Slider label="Speed" min={80} max={400} value={cfg.animSpeed} onChange={(v) => apply({ ...cfg, animSpeed: v })} unit="ms" />
              </CapSec>

              <CapSec title="Position">
                <div className="flex gap-1.5">
                  {([["top", 18], ["middle", 45], ["bottom", 68]] as const).map(([l, v]) => (
                    <button key={l} onClick={() => apply({ ...cfg, posY: v })}
                      className={`flex-1 rounded-full py-1.5 text-[11px] font-medium capitalize ${Math.abs(cfg.posY - v) < 6 ? "bg-lime text-ink" : "bg-carbon text-[#A1A5A0] hover:text-white"}`}>{l}</button>
                  ))}
                </div>
                <Slider label="Fine tune" min={10} max={85} value={cfg.posY} onChange={(v) => apply({ ...cfg, posY: v })} unit="%" />
                <label className="flex items-center justify-between text-xs text-[#A1A5A0]">Safe-area guides
                  <input type="checkbox" checked={cfg.safeGuides} onChange={(e) => apply({ ...cfg, safeGuides: e.target.checked })} className="h-4 w-4 accent-lime" />
                </label>
              </CapSec>

              <CapSec title="Emphasis">
                <div className="space-y-2.5">
                  {([["highlight", "Highlight active word"], ["emphasis", "Auto-highlight keywords"], ["emoji", "Emoji"], ["reveal", "Word-by-word reveal"]] as const).map(([k, l]) => (
                    <label key={k} className="flex items-center justify-between text-xs text-[#A1A5A0]">{l}
                      <input type="checkbox" checked={cfg[k]} onChange={(e) => apply({ ...cfg, [k]: e.target.checked })} className="h-4 w-4 accent-lime" />
                    </label>
                  ))}
                </div>
              </CapSec>

              <button onClick={() => setCfg((c) => ({ ...c, color: "#BDEF72", textColor: "#FFFFFF", style: "pop", upper: true, reveal: true, highlight: true, lines: 2, lineWords: 3, boxOp: 75, anim: "pop", animSpeed: 150, posY: 62, size: 26, font: "Manrope", weight: 800, emphasis: false, emoji: false, safeGuides: false }))}
                className="w-full rounded-full border border-[#3A3A3A] py-2 text-xs text-[#A1A5A0] hover:text-white">Reset</button>
            </div>
          )}
          {ins === "post" && (
            <div className="space-y-3 text-xs">
              <label className="block text-[#A1A5A0]">Hook <textarea rows={2} defaultValue={clip.hook} className="mt-1 w-full rounded-lg border border-[#3A3A3A] bg-carbon px-2 py-1.5 text-white" /></label>
              <div className="flex flex-wrap gap-1.5">{clip.hashtags.tiktok.map((h) => <span key={h} className="rounded-full bg-carbon px-2 py-1 font-mono text-[10px] text-[#A1A5A0]">{h}</span>)}</div>
              <div className="flex gap-1.5">{["7:30 PM", "9:00 PM"].map((x) => <button key={x} className="rounded-full bg-carbon px-2.5 py-1 font-mono text-[10px] hover:bg-lime hover:text-ink">{x}</button>)}</div>
            </div>
          )}
        </aside>
      </div>

      {/* timeline */}
      <div className="h-[168px] shrink-0 rounded-2xl bg-graphite p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
        <div className="flex h-full gap-3">
          {/* track headers */}
          <div className="flex w-[120px] shrink-0 flex-col">
            <div className="flex h-8 items-center gap-1 rounded-full bg-carbon p-1">
              <button onClick={undo} disabled={!hist.length} aria-label="Undo" className="rounded-full p-1.5 text-[#A1A5A0] hover:text-white disabled:opacity-30">{ic.undo}</button>
              <button onClick={redo} disabled={!future.length} aria-label="Redo" className="rounded-full p-1.5 text-[#A1A5A0] hover:text-white disabled:opacity-30">{ic.redo}</button>
              <button aria-label="Split at playhead" className="rounded-full p-1.5 text-[#A1A5A0] hover:text-white">{ic.split}</button>
              <button aria-label="Delete selection" className="rounded-full p-1.5 text-[#A1A5A0] hover:text-white">{ic.trash}</button>
              <button onClick={() => { const s = speed === 1 ? 2 : 1; setSpeed(s); [vid.current, vid2.current].forEach((v) => v && (v.playbackRate = s)); }} aria-label={`Playback speed ${speed}×`}
                className="ml-auto rounded-full bg-graphite px-2 py-0.5 font-mono text-[10px] text-[#F2F2F0]">{speed}×</button>
            </div>
            {[[ic.video, "Video 1"], [ic.captions, "Captions"], [ic.audio, "Audio"]].map(([icon, name], i) => (
              <div key={i} className="flex flex-1 items-center gap-1.5 pr-1">
                <span className="text-[#A1A5A0]">{icon}</span>
                <span className="flex-1 truncate text-[11px] font-semibold text-[#A1A5A0]">{name as string}</span>
                <button aria-label={`Toggle ${name} visibility`} className="text-[#7C7C7C] hover:text-white">{ic.eye}</button>
                <button aria-label={`Lock ${name}`} className="text-[#7C7C7C] hover:text-white">{ic.lock}</button>
              </div>
            ))}
          </div>
          {/* tracks area */}
          <div className="relative min-w-0 flex-1">
            {/* ruler */}
            <div className="flex h-8 items-end pb-1">
              {Array.from({ length: Math.ceil(dur) + 1 }, (_, s) => (
                <span key={s} className="absolute bottom-1 border-l border-dotted border-[#5A5E56] pl-1 font-mono text-[9px] text-[#7C7C7C]" style={{ left: `${(s / dur) * 100}%`, height: 10 }}>{s}s</span>
              ))}
            </div>
            <div ref={tracks} onPointerDown={seekFromPointer} className="relative h-[calc(100%-32px)] cursor-crosshair overflow-hidden rounded-xl bg-[#1f1f1f]">
              {/* video track */}
              <div className="absolute inset-x-0 top-1 h-[38%]">
                <div className="absolute top-1 bottom-1 overflow-hidden rounded-xl bg-lilac-deep" style={{ left: `${(L / dur) * 100}%`, width: `${((R - L) / dur) * 100}%` }}>
                  <div className="absolute inset-y-0 left-0 w-20 bg-cover bg-center" style={{ backgroundImage: `url(${clip.poster})` }} />
                  <span className="absolute left-24 top-1/2 -translate-y-1/2 truncate font-mono text-[10px] font-medium text-white/90">{clip.id}.mp4</span>
                </div>
                {([0, 1] as const).map((k) => (
                  <div key={k} role="slider" aria-label={k ? "Trim end" : "Trim start"} aria-valuenow={trim[k]} tabIndex={0}
                    onPointerDown={(e) => { e.stopPropagation(); e.currentTarget.setPointerCapture(e.pointerId); }}
                    onPointerMove={(e) => { if (!e.currentTarget.hasPointerCapture(e.pointerId)) return; const r = tracks.current!.getBoundingClientRect(); const v = Math.max(0, Math.min(dur, ((e.clientX - r.left) / r.width) * dur)); setTrim((tr) => k ? [tr[0], Math.max(v, tr[0] + 0.5)] : [Math.min(v, tr[1] - 0.5), tr[1]]); }}
                    onKeyDown={(e) => setTrim((tr) => k ? [tr[0], Math.min(dur, tr[1] + (e.key === "ArrowRight" ? 0.1 : e.key === "ArrowLeft" ? -0.1 : 0))] : [Math.max(0, tr[0] + (e.key === "ArrowRight" ? 0.1 : e.key === "ArrowLeft" ? -0.1 : 0)), tr[1]])}
                    className="absolute top-0 bottom-0 z-10 w-3.5 cursor-ew-resize rounded-md bg-lime shadow-[0_0_0_2px_rgba(0,0,0,.4)]"
                    style={{ [k ? "right" : "left"]: `calc(${((k ? dur - trim[1] : trim[0]) / dur) * 100}% - ${k ? 0 : 6}px)` }} />
                ))}
              </div>
              {/* captions track */}
              <div className="absolute inset-x-0 top-[41%] h-[24%]">
                {clip.words.filter((w) => !w.cut).map((w, j) => (
                  <span key={j} className="absolute top-0.5 bottom-0.5 flex items-center overflow-hidden rounded-md bg-lime px-1.5"
                    style={{ left: `${(w.start / dur) * 100}%`, width: `calc(${Math.max(2, ((w.end - w.start) / dur) * 100)}% - 2px)` }}>
                    <span className="truncate text-[9px] font-bold text-ink">{w.w}</span>
                    {j % 4 === 3 && <span className="absolute right-0.5 rounded bg-ink/80 px-0.5 text-[8px] font-bold text-lime">T</span>}
                  </span>
                ))}
              </div>
              {/* audio track */}
              <div className="absolute inset-x-0 top-[69%] flex h-[26%] items-center gap-px px-1">
                <span className="mr-1 shrink-0 text-[#7C7C7C]">{ic.audio}</span>
                {wave.map((h, i) => <span key={i} className="flex-1 rounded-sm bg-white/60" style={{ height: `${h * 90}%` }} />)}
              </div>
              {/* playhead */}
              <div className="pointer-events-none absolute inset-y-0 z-20 w-px bg-lime" style={{ left: `${(t / dur) * 100}%` }}>
                <span className="absolute -top-4 left-1/2 h-3.5 w-3.5 -translate-x-1/2 rounded-full border-2 border-ink bg-lime shadow" />
              </div>
            </div>
          </div>
        </div>
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
            {/* clip preview */}
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
        <dl className="mt-4 grid grid-cols-2 gap-y-2 text-sm">
          {[["Space", "Play / pause"], ["J / L", "−1s / +1s"], ["← / →", "Step a frame"], ["Ctrl+Z", "Undo"], ["Ctrl+Shift+Z", "Redo"]].map(([k, d]) => (
            <div key={k} className="contents"><dt className="font-mono text-xs text-[#A1A5A0]">{k}</dt><dd className="text-sm">{d}</dd></div>
          ))}
        </dl>
      </Modal>
    </div>
  );
}
