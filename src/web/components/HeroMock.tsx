"use client";

import Image from "next/image";
import { asset } from "@/lib/asset";
import { useEffect, useRef, useState } from "react";

interface Moment {
  score: number;
  title: string;
  len: string;
  video?: string;
  poster?: string;
  strip?: string;
  postTitle?: string;
  hashtags?: string[];
  playable: boolean;
}

const MOMENTS: Moment[] = [
  {
    score: 94,
    title: "Duke slams Kai on stream",
    len: "0:06",
    video: asset("/videos/wall/kai-duke-slam-1.mp4"),
    poster: asset("/videos/wall/kai-duke-slam-1.jpg"),
    strip: asset("/videos/strips/kai-duke-slam-1.jpg"),
    postTitle: "Duke slams Kai on stream",
    hashtags: ["#kaicenat", "#justchatting", "#streamclips"],
    playable: true,
  },
  {
    score: 88,
    title: "Kai x Denzel freestyle",
    len: "0:06",
    video: asset("/videos/wall/kai-denzel-1.mp4"),
    poster: asset("/videos/wall/kai-denzel-1.jpg"),
    strip: asset("/videos/strips/kai-denzel-1.jpg"),
    postTitle: "Kai x Denzel freestyle",
    hashtags: ["#kaicenat", "#justchatting"],
    playable: true,
  },
  {
    score: 90,
    title: "Emily & Nova’s dance break",
    len: "0:06",
    video: asset("/videos/wall/emily-dance-1.mp4"),
    poster: asset("/videos/wall/emily-dance-1.jpg"),
    strip: asset("/videos/strips/emily-dance-1.jpg"),
    postTitle: "Emily & Nova’s dance break",
    hashtags: ["#extraemily", "#irl", "#streamclips"],
    playable: true,
  },
  {
    score: 38,
    title: "Setting up the stream",
    len: "0:28",
    playable: false,
  },
];

const WORDS = [
  ["No", "way", "Duke"],
  ["Denzel", "is", "going"],
  ["They", "did", "the"],
] as const;

const PLATFORMS = ["TikTok", "Shorts", "Reels", "X"];
const TABS = ["Layout", "Captions", "Post"] as const;

const ICON = {
  moments: <rect x="2.5" y="3" width="11" height="10" rx="2" />,
  transcript: <path d="M3 4.5h10M3 7.5h10M3 10.5h6" />,
  captions: <path d="M3 4.5h10M3 7.5h7M3 10.5h9" />,
  layout: <path d="M2.5 3h11v10h-11zM8 3v10" />,
};

function fmtTc(sec: number) {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${String(s).padStart(2, "0")}.${Math.floor((sec % 1) * 10)}`;
}

function useReducedMotion() {
  // founder decision: animations always run, OS reduced-motion setting is ignored
  return false;
}

function StatusChip() {
  return (
    <span className="rounded-full bg-lime px-3.5 py-1.5 text-[11px] font-semibold text-ink">
      Export
    </span>
  );
}

function Chip({ label, selected, onClick }: { label: string; selected: boolean; onClick?: () => void }) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={`rounded-full border px-3 py-1 text-[11px] font-medium transition-colors duration-150 ease-out ${
        selected ? "border-lime text-white" : "border-hairline-dark text-slate-dark hover:border-control-border-dark"
      }`}
    >
      {label}
    </button>
  );
}

export default function HeroMock() {
  const reduced = useReducedMotion();
  const [sel, setSel] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [tab, setTab] = useState<(typeof TABS)[number]>("Captions");
  const [progress, setProgress] = useState(0);
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState(6);
  const videoRef = useRef<HTMLVideoElement>(null);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const [layoutChip, setLayoutChip] = useState("Auto");
  const [captionChip, setCaptionChip] = useState("Karaoke pop");
  const previewRef = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  const moment = MOMENTS[sel];
  const activeWord = Math.min(2, Math.floor(progress * 3));

  useEffect(() => {
    const el = previewRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { threshold: 0.2 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    if (inView && !reduced) {
      v.preload = "auto";
      v.play().catch(() => {});
    } else {
      v.pause();
    }
  }, [sel, reduced, inView]);

  const select = (i: number) => {
    if (!MOMENTS[i].playable) return;
    setSel(i);
    setProgress(0);
    setCurrent(0);
  };

  const onTime = () => {
    const v = videoRef.current;
    if (!v || !v.duration) return;
    setCurrent(v.currentTime);
    setDuration(v.duration);
    setProgress(v.currentTime / v.duration);
  };

  const onTabKey = (e: React.KeyboardEvent, i: number) => {
    let n = -1;
    if (e.key === "ArrowRight" || e.key === "ArrowDown") n = (i + 1) % TABS.length;
    if (e.key === "ArrowLeft" || e.key === "ArrowUp") n = (i - 1 + TABS.length) % TABS.length;
    if (n >= 0) {
      e.preventDefault();
      setTab(TABS[n]);
      tabRefs.current[n]?.focus();
    }
  };

  const rail = (
    <div aria-hidden className="hidden w-11 shrink-0 flex-col items-center gap-1.5 border-r border-hairline-dark py-3 sm:flex">
      {(["moments", "transcript", "captions", "layout"] as const).map((k, i) => (
        <span key={k} className={`flex h-9 w-9 items-center justify-center rounded-full ${i === 0 ? "bg-lime text-ink" : "text-slate-dark"}`}>
          <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.4">{ICON[k]}</svg>
        </span>
      ))}
    </div>
  );

  const momentsList = (mobile: boolean) => (
    <div className={mobile ? "flex snap-x snap-mandatory gap-2 overflow-x-auto pb-1" : "flex w-[180px] shrink-0 flex-col gap-1 overflow-y-auto border-r border-hairline-dark p-2"} role={mobile ? undefined : "group"} aria-label="Moments">
      {!mobile && <p className="px-1.5 pb-1 text-sm font-medium text-slate-dark">Moments</p>}
      {MOMENTS.map((m, i) => {
        const selected = i === sel;
        return (
          <button
            key={m.title}
            type="button"
            aria-pressed={selected}
            aria-disabled={!m.playable}
            title={m.playable ? m.title : "Low score, skipped"}
            onClick={() => select(i)}
            className={`relative shrink-0 overflow-hidden rounded-lg text-left transition-colors duration-150 ease-out ${mobile ? "w-40 snap-start p-2" : "p-1.5"} ${
              selected ? "bg-carbon ring-1 ring-lime/60" : `${m.playable ? "hover:bg-carbon/60" : "opacity-60"}`
            } ${mobile && !m.playable ? "opacity-60" : ""}`}
          >
            <span className="flex items-center gap-2">
              {m.poster && (
                <span className="relative h-[42px] w-[24px] shrink-0 overflow-hidden rounded">
                  <Image src={m.poster} alt="" fill sizes="24px" className="object-cover" />
                </span>
              )}
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[11px] font-medium text-white">{m.title}</span>
                <span className="mt-0.5 flex items-center gap-1.5">
                  <span className="flex items-center gap-1 rounded-full bg-black/55 px-1.5 py-px font-mono text-[10px] text-white" aria-label={`Highlight score ${m.score} out of 100`}>
                    <svg viewBox="0 0 12 12" className={`h-2.5 w-2.5 ${m.score >= 85 ? "text-lime" : "text-heat"}`} fill="currentColor" aria-hidden>
                      <path d="M6 1l1.5 3.1 3.4.5-2.5 2.4.6 3.4L6 8.7 3 10.4l.6-3.4L1.1 4.6l3.4-.5L6 1z" />
                    </svg>
                    {m.score}/100
                  </span>
                  <span className="font-[family-name:var(--font-jetbrains)] text-[10px] text-slate-dark">{m.len}</span>
                </span>
              </span>
            </span>
          </button>
        );
      })}
    </div>
  );

  const stage = (
    <div ref={previewRef} className="relative flex min-w-0 flex-1 items-center justify-center bg-ink/40 p-4">
      <div className="relative aspect-[9/16] h-[280px] max-w-full overflow-hidden rounded-2xl bg-ink md:h-[300px]">
        {moment.video ? (
          <video
            key={moment.video}
            ref={videoRef}
            src={moment.video}
            poster={moment.poster}
            preload="none"
            muted
            loop
            playsInline
            onTimeUpdate={onTime}
            onLoadedMetadata={onTime}
            onPlay={() => setPlaying(true)}
            onPause={() => setPlaying(false)}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="h-full bg-gradient-to-b from-ink to-carbon" />
        )}
        {/* caption overlay */}
        <div className="pointer-events-none absolute inset-x-2 top-[62%] flex justify-center text-center">
          <p className="flex flex-wrap justify-center gap-x-[0.3em] text-lg font-extrabold uppercase leading-tight">
            {WORDS[sel]?.map((w, i) => (
              <span key={w} className="inline-block" style={{ color: i === activeWord ? "#BDEF72" : "#fff", textShadow: "0 2px 12px rgba(0,0,0,.6)" }}>{w}</span>
            ))}
          </p>
        </div>
        {!playing && (
          <button type="button" aria-label="Play clip" onClick={() => videoRef.current?.play()} className="absolute inset-0 flex items-center justify-center bg-ink/30">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white">
              <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true"><path d="M5 3.5v9l7.5-4.5z" fill="#181818" /></svg>
            </span>
          </button>
        )}
        {/* floating glass transport pill */}
        <div className="absolute inset-x-2 bottom-2.5 flex items-center justify-center">
          <div className="flex items-center gap-1.5 rounded-full border border-white/10 bg-black/40 py-1 pl-1 pr-2 backdrop-blur">
            <button type="button" aria-label={playing ? "Pause" : "Play"} onClick={() => { const v = videoRef.current; if (!v) return; if (v.paused) v.play().catch(() => {}); else v.pause(); }}
              className="flex h-6 w-6 items-center justify-center rounded-full bg-white text-ink">
              {playing ? (
                <svg viewBox="0 0 10 10" className="h-2.5 w-2.5" fill="currentColor"><path d="M1.5 1h2.5v8H1.5zM6 1h2.5v8H6z" /></svg>
              ) : (
                <svg viewBox="0 0 10 10" className="ml-0.5 h-2.5 w-2.5" fill="currentColor"><path d="M2 1l7 4-7 4V1z" /></svg>
              )}
            </button>
            <span className="whitespace-nowrap font-[family-name:var(--font-jetbrains)] text-[10px] tabular-nums text-white">
              {fmtTc(current)} <span className="text-white/50">/ {fmtTc(duration)}</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  const inspector = (
    <div className="hidden w-[220px] shrink-0 flex-col border-l border-hairline-dark p-3 lg:flex">
      <div role="tablist" aria-label="Clip settings" className="flex rounded-full bg-carbon p-0.5">
        {TABS.map((t, i) => (
          <button
            key={t}
            ref={(el) => { tabRefs.current[i] = el; }}
            role="tab"
            aria-selected={tab === t}
            tabIndex={tab === t ? 0 : -1}
            onClick={() => setTab(t)}
            onKeyDown={(e) => onTabKey(e, i)}
            className={`flex-1 rounded-full px-1.5 py-1 text-[10px] font-semibold transition-colors duration-150 ease-out ${
              tab === t ? "bg-graphite text-white shadow ring-1 ring-[#3A3A3A]" : "text-slate-dark hover:text-white"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="mt-3 min-h-0 flex-1 text-xs">
        {tab === "Layout" && (
          <div>
            <div className="flex flex-wrap gap-1.5">
              {["Auto", "Split", "Face"].map((c) => (
                <Chip key={c} label={c === "Split" ? "Facecam + gameplay" : c} selected={layoutChip === c} onClick={() => setLayoutChip(c)} />
              ))}
            </div>
            <div className="mt-3 w-16 space-y-1">
              <div className="aspect-[9/16] rounded-md bg-lime/25 ring-1 ring-lime/50" />
            </div>
          </div>
        )}

        {tab === "Captions" && (
          <div>
            <div className="grid grid-cols-3 gap-1.5">
              {["Karaoke pop", "Clean white", "Bold box"].map((c, i) => (
                <button key={c} type="button" aria-pressed={captionChip === c} onClick={() => setCaptionChip(c)}
                  className={`rounded-lg border p-1 ${captionChip === c ? "border-lime bg-lime/10" : "border-hairline-dark"}`}>
                  <span className="relative block aspect-[9/16] overflow-hidden rounded bg-ink">
                    <Image src={MOMENTS[i].poster!} alt="" fill sizes="60px" className="object-cover opacity-70" />
                    <span className="absolute inset-x-0 bottom-0.5 text-center text-[7px] font-extrabold uppercase text-lime" style={{ textShadow: "0 1px 3px rgba(0,0,0,.9)" }}>Did that</span>
                  </span>
                </button>
              ))}
            </div>
            <div className="mt-3 flex items-center gap-2">
              <span className="text-[10px] text-slate-dark">Size</span>
              <span className="relative h-1 flex-1 rounded-full bg-hairline-dark">
                <span className="absolute left-0 top-0 h-full w-[65%] rounded-full bg-lime" />
                <span className="absolute left-[65%] top-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-lime" />
              </span>
            </div>
            <div className="mt-2.5 flex items-center justify-between text-[10px]">
              <span className="text-slate-dark">Position</span>
              <span className="rounded-md bg-carbon px-2 py-0.5 text-white">Middle</span>
            </div>
          </div>
        )}

        {tab === "Post" && (
          <div>
            <p className="rounded-md bg-carbon px-2 py-1.5 text-[11px] text-white">{moment.postTitle ?? moment.title}</p>
            <div className="mt-2 flex flex-wrap gap-1">
              {(moment.hashtags ?? []).map((h) => (
                <span key={h} className="rounded-full bg-carbon px-1.5 py-0.5 text-[10px] text-slate-dark">{h}</span>
              ))}
            </div>
            <p className="mt-2.5 flex items-center gap-1.5 text-[10px] text-slate-dark">
              <span className="h-1.5 w-1.5 rounded-full bg-lime" />
              Best time <span className="font-[family-name:var(--font-jetbrains)] text-white">7:30 PM</span>
            </p>
            <div className="mt-2 flex flex-wrap gap-1">
              {PLATFORMS.map((p) => (
                <span key={p} className="rounded-md border border-hairline-dark px-1.5 py-0.5 text-[10px] text-slate-dark">{p}</span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const timeline = (
    <div aria-hidden className="border-t border-hairline-dark bg-graphite px-3 py-2.5">
      <div className="flex gap-2.5">
        <div className="hidden w-16 shrink-0 flex-col gap-1.5 text-[9px] font-semibold text-slate-dark sm:flex">
          <span className="flex h-7 items-center">Video 1</span>
          <span className="flex h-5 items-center">Captions</span>
          <span className="flex h-4 items-center">Audio</span>
        </div>
        <div className="relative min-w-0 flex-1">
          {/* video bar w/ filmstrip */}
          <div className="relative h-7 overflow-hidden rounded-lg bg-lilac/25">
            {moment.strip && <Image src={moment.strip} alt="" fill sizes="600px" className="object-cover opacity-80" />}
            <span className="absolute inset-y-1 left-1 rounded bg-lilac/60 px-1.5 text-[9px] font-semibold leading-5 text-ink">{moment.title}</span>
          </div>
          {/* caption blocks */}
          <div className="mt-1.5 flex gap-1">
            {[12, 30, 55, 80].map((l, i) => (
              <span key={i} className="h-5 rounded-md bg-lime/80" style={{ marginLeft: `${i === 0 ? l : [18, 8, 7][i - 1]}%`, width: `${[16, 17, 18, 14][i]}%` }} />
            ))}
          </div>
          {/* waveform */}
          <div className="mt-1 flex h-4 items-end gap-[3px]">
            {Array.from({ length: 72 }, (_, i) => (
              <span key={i} className="w-[3px] rounded-sm bg-white/15" style={{ height: `${20 + Math.round(Math.abs(Math.sin(i * 1.7)) * 80)}%` }} />
            ))}
          </div>
          {/* playhead */}
          <span className="absolute -top-1 bottom-0 w-px bg-lime" style={{ left: `${progress * 100}%` }}>
            <span className="absolute -left-1.5 top-0 h-3 w-3 rounded-full bg-lime" />
          </span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="relative mx-auto w-full max-w-[1060px]">
      <div
        aria-hidden="true"
        className="absolute -inset-8 rounded-[40px] opacity-20 blur-3xl"
        style={{ background: "radial-gradient(closest-side, #BDEF72 0%, transparent 100%)" }}
      />
      <div className="dark-focus relative overflow-hidden rounded-2xl border border-hairline-dark bg-graphite text-left shadow-[0_24px_60px_-24px_rgba(0,0,0,0.45)]">
        {/* top bar: centered breadcrumb + saved + export */}
        <div className="relative flex items-center justify-between border-b border-hairline-dark bg-carbon px-4 py-2.5">
          <span className="flex items-center gap-1.5 text-xs font-semibold text-white">
            <Image src={asset("/kivlo-mark-white.png")} alt="" width={94} height={96} className="h-3.5 w-auto" />
            KivloWorkspace
          </span>
          <span className="absolute left-1/2 -translate-x-1/2 text-[11px] text-slate-dark">
            Projects <span className="mx-1 text-[#555]">/</span> <span className="text-white">{moment.title}</span>
          </span>
          <span className="flex items-center gap-2">
            <span className="hidden items-center gap-1 text-[10px] text-slate-dark sm:flex">
              <svg viewBox="0 0 10 10" className="h-2.5 w-2.5 text-lime" fill="currentColor"><path d="M1 5.5l2.5 2.5L9 2.5" stroke="currentColor" strokeWidth="1.6" fill="none" /></svg>
              Saved
            </span>
            <StatusChip />
          </span>
        </div>

        {/* desktop */}
        <div className="hidden md:flex">
          {rail}
          {momentsList(false)}
          <div className="flex min-w-0 flex-1 flex-col">
            <div className="flex min-h-0 flex-1">
              {stage}
              {inspector}
            </div>
            {timeline}
          </div>
        </div>

        {/* mobile */}
        <div className="flex flex-col md:hidden">
          {stage}
          <div className="border-t border-hairline-dark p-3">{momentsList(true)}</div>
        </div>
      </div>
    </div>
  );
}
