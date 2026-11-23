"use client";

import Image from "next/image";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";

interface Moment {
  score: number;
  title: string;
  len: string;
  video?: string;
  poster?: string;
  postTitle?: string;
  hashtags?: string[];
  playable: boolean;
}

const MOMENTS: Moment[] = [
  {
    score: 94,
    title: "Kai gets launched in GTA 6",
    len: "0:17",
    video: "/videos/kai-launched.mp4",
    poster: "/videos/kai-launched.jpg",
    postTitle: "Kai got launched in GTA 6",
    hashtags: ["#kaicenat", "#gta6", "#streamclips"],
    playable: true,
  },
  {
    score: 88,
    title: "The car explodes mid-chase",
    len: "0:17",
    video: "/videos/kai-car-explodes.mp4",
    poster: "/videos/kai-car-explodes.jpg",
    postTitle: "Kai's car explodes mid-chase",
    hashtags: ["#kaicenat", "#gta6", "#streamclips"],
    playable: true,
  },
  {
    score: 81,
    title: "Wait til he does it",
    len: "0:21",
    video: "/videos/fanum-wait.mp4",
    poster: "/videos/fanum-wait.jpg",
    postTitle: "Wait til he does it",
    hashtags: ["#fanum", "#streamclips", "#gaming"],
    playable: true,
  },
  {
    score: 38,
    title: "Setting up the stream",
    len: "0:28",
    playable: false,
  },
];

const PLATFORMS = ["TikTok", "Shorts", "Reels", "X"];
const TABS = ["Layout", "Captions", "Post"] as const;

function badgeClass(score: number) {
  if (score >= 85) return "bg-lime text-ink";
  if (score >= 60) return "bg-heat text-ink";
  return "bg-hairline-dark text-slate-dark";
}

function fmt(sec: number) {
  const s = Math.max(0, Math.floor(sec));
  return `00:${String(s).padStart(2, "0")}`;
}

function useReducedMotion() {
  return useSyncExternalStore(
    (cb) => {
      const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
      mq.addEventListener("change", cb);
      return () => mq.removeEventListener("change", cb);
    },
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    () => false
  );
}

function ScoreRing({ score, animate }: { score: number; animate: boolean }) {
  const r = 15.5;
  const c = 2 * Math.PI * r;
  const [on, setOn] = useState(!animate);
  useEffect(() => {
    if (!animate) return;
    const t = requestAnimationFrame(() => setOn(true));
    return () => cancelAnimationFrame(t);
  }, [score, animate]);
  return (
    <span className="relative inline-flex h-11 w-11 items-center justify-center">
      <svg viewBox="0 0 36 36" className="absolute inset-0 -rotate-90">
        <circle
          cx="18"
          cy="18"
          r={r}
          fill="rgba(24,24,24,0.55)"
          stroke="#3A3A3A"
          strokeWidth="2.5"
        />
        <circle
          cx="18"
          cy="18"
          r={r}
          fill="none"
          stroke="#BDEF72"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={on ? c * (1 - score / 100) : c}
          style={{ transition: "stroke-dashoffset 800ms ease-out" }}
        />
      </svg>
      <span className="font-[family-name:var(--font-jetbrains)] text-[11px] font-medium text-white">
        {score}
      </span>
    </span>
  );
}

function StatusChip() {
  const reduced = useReducedMotion();
  const [pct, setPct] = useState(reduced ? 100 : 0);
  useEffect(() => {
    if (reduced) return;
    const start = performance.now();
    let raf = 0;
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / 1500);
      setPct(Math.round(p * 100));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [reduced]);
  if (pct >= 100)
    return (
      <span
        aria-hidden="true"
        className="rounded-full bg-lime px-3 py-1 text-[11px] font-semibold text-ink"
      >
        Export
      </span>
    );
  return (
    <span className="rounded-full bg-hairline-dark px-3 py-1 font-[family-name:var(--font-jetbrains)] text-[11px] text-slate-dark">
      Rendering {pct}%
    </span>
  );
}

function Chip({
  label,
  selected,
  onClick,
}: {
  label: string;
  selected: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={`rounded-full border px-3 py-1 text-[11px] font-medium transition-colors duration-150 ease-out ${
        selected
          ? "border-lime text-white"
          : "border-hairline-dark text-slate-dark hover:border-control-border-dark"
      }`}
    >
      {label}
    </button>
  );
}

export default function HeroMock() {
  const reduced = useReducedMotion();
  const [sel, setSel] = useState(0);
  const [muted, setMuted] = useState(true);
  const [playing, setPlaying] = useState(false);
  const [tab, setTab] = useState<(typeof TABS)[number]>("Captions");
  const [progress, setProgress] = useState(0);
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState(17);
  const videoRef = useRef<HTMLVideoElement>(null);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const [layoutChip, setLayoutChip] = useState("Facecam + gameplay");
  const [captionChip, setCaptionChip] = useState("Bold Pop");
  const [ringSeen, setRingSeen] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);

  const moment = MOMENTS[sel];

  useEffect(() => {
    const el = previewRef.current;
    if (!el || reduced) {
      setRingSeen(true);
      return;
    }
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setRingSeen(true);
          io.disconnect();
        }
      },
      { threshold: 0.4 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [reduced]);

  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = previewRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => setInView(e.isIntersecting),
      { threshold: 0.2 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    if (
      inView &&
      !reduced &&
      !window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
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
    setPlaying(!reduced);
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
    if (e.key === "ArrowLeft" || e.key === "ArrowUp")
      n = (i - 1 + TABS.length) % TABS.length;
    if (n >= 0) {
      e.preventDefault();
      setTab(TABS[n]);
      tabRefs.current[n]?.focus();
    }
  };

  const momentsList = (mobile: boolean) => (
    <div
      className={
        mobile
          ? "flex snap-x snap-mandatory gap-2 overflow-x-auto pb-1"
          : "flex flex-col gap-1.5"
      }
      role={mobile ? undefined : "group"}
      aria-label="Moments"
    >
      {!mobile && (
        <p className="px-2 pb-1 text-[11px] font-semibold uppercase tracking-wider text-slate-dark">
          Moments
        </p>
      )}
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
            className={`relative shrink-0 overflow-hidden rounded-lg text-left transition-colors duration-150 ease-out ${
              mobile ? "w-40 snap-start p-2" : "px-2 py-2"
            } ${
              selected
                ? "border-l-2 border-lime bg-carbon"
                : `border-l-2 border-transparent ${
                    m.playable ? "hover:bg-carbon/60" : "opacity-60"
                  }`
            } ${mobile && !m.playable ? "opacity-60" : ""}`}
          >
            <span className="flex items-center gap-2.5">
              {m.poster && (
                <span className="relative h-[50px] w-[28px] shrink-0 overflow-hidden rounded">
                  <Image
                    src={m.poster}
                    alt=""
                    fill
                    sizes="28px"
                    className="object-cover"
                  />
                </span>
              )}
              <span
                className={`rounded-md px-1.5 py-0.5 font-[family-name:var(--font-jetbrains)] text-[11px] font-medium ${badgeClass(
                  m.score
                )}`}
              >
                {m.score}
              </span>
              <span className="flex-1 truncate text-xs text-white">
                {m.title}
              </span>
              <span className="font-[family-name:var(--font-jetbrains)] text-[11px] text-slate-dark">
                {m.len}
              </span>
            </span>
            {selected && !mobile && (
              <span
                className="absolute bottom-0 left-0 h-0.5 bg-lime"
                style={{ width: `${progress * 100}%` }}
              />
            )}
          </button>
        );
      })}
    </div>
  );

  const preview = (
    <div ref={previewRef} className="flex flex-col items-center gap-3">
      <div className="relative aspect-[9/16] w-[220px] max-w-full overflow-hidden rounded-[20px] border-2 border-ink bg-ink">
        {moment.video ? (
          <div
            key={moment.video}
            className={reduced ? "h-full" : "h-full animate-[fade-in_200ms_ease-out]"}
            style={
              reduced
                ? undefined
                : { animation: "mock-fade 200ms ease-out" }
            }
          >
            <video
              ref={videoRef}
              src={moment.video}
              poster={moment.poster}
              preload="none"
              muted={muted}
              loop
              playsInline
              onTimeUpdate={onTime}
              onLoadedMetadata={onTime}
              onPlay={() => setPlaying(true)}
              onPause={() => setPlaying(false)}
              className="h-full w-full object-cover"
            />
          </div>
        ) : (
          <div className="h-full bg-gradient-to-b from-ink to-carbon" />
        )}
        {!playing && (
          <button
            type="button"
            aria-label="Play clip"
            onClick={() => videoRef.current?.play()}
            className="absolute inset-0 flex items-center justify-center bg-ink/30"
          >
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-lime">
              <svg width="18" height="18" viewBox="0 0 16 16" aria-hidden="true">
                <path d="M5 3.5v9l7.5-4.5z" fill="#181818" />
              </svg>
            </span>
          </button>
        )}
        <span className="absolute left-2 top-2">
          <ScoreRing key={moment.score} score={moment.score} animate={!reduced && ringSeen} />
        </span>
        <button
          type="button"
          aria-label={muted ? "Unmute" : "Mute"}
          onClick={() => {
            const v = videoRef.current;
            const next = !muted;
            setMuted(next);
            if (v) v.muted = next;
          }}
          className="absolute bottom-2 right-2 flex h-8 w-8 items-center justify-center rounded-full bg-ink/70 text-white transition-colors duration-150 ease-out hover:bg-ink"
        >
          {muted ? (
            <svg width="14" height="14" viewBox="0 0 16 16" aria-hidden="true">
              <path
                d="M2 6v4h3l4 3V3L5 6H2zm10.5-1.5L8 9m4.5 4.5L8 9m0 0L4 13m4-4L4 3"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                fill="none"
              />
            </svg>
          ) : (
            <svg width="14" height="14" viewBox="0 0 16 16" aria-hidden="true">
              <path
                d="M2 6v4h3l4 3V3L5 6H2zm9.5 2a3.5 3.5 0 00-2-3.2m2 6a6.5 6.5 0 000-6.5"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                fill="none"
              />
            </svg>
          )}
        </button>
      </div>
      <div className="w-[220px] max-w-full">
        <div className="relative h-1.5 rounded-full bg-hairline-dark">
          <div className="absolute left-[10%] right-[12%] h-full rounded-full bg-lime/60" />
          <div
            className="absolute top-1/2 h-3 w-0.5 -translate-y-1/2 bg-lime"
            style={{ left: `${10 + progress * 78}%` }}
          />
        </div>
        <div className="mt-1.5 flex justify-between font-[family-name:var(--font-jetbrains)] text-[11px] text-slate-dark">
          <span>{fmt(current)}</span>
          <span>{fmt(duration)}</span>
        </div>
      </div>
    </div>
  );

  const inspector = (
    <div className="hidden md:block">
      <div role="tablist" aria-label="Clip settings" className="flex gap-4 border-b border-hairline-dark text-xs">
        {TABS.map((t, i) => (
          <button
            key={t}
            ref={(el) => {
              tabRefs.current[i] = el;
            }}
            role="tab"
            aria-selected={tab === t}
            tabIndex={tab === t ? 0 : -1}
            onClick={() => setTab(t)}
            onKeyDown={(e) => onTabKey(e, i)}
            className={`-mb-px border-b-2 pb-2 transition-colors duration-150 ease-out ${
              tab === t
                ? "border-lime font-semibold text-white"
                : "border-transparent text-slate-dark hover:text-white"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "Layout" && (
        <div className="mt-4">
          <div className="flex flex-wrap gap-2">
            {["Facecam + gameplay", "Face only", "Auto"].map((c) => (
              <Chip
                key={c}
                label={c}
                selected={layoutChip === c}
                onClick={() => setLayoutChip(c)}
              />
            ))}
          </div>
          <div className="mt-4 flex w-24 flex-col gap-1">
            <div className="h-12 rounded-md bg-lime/25" />
            <div className="h-16 rounded-md bg-carbon" />
          </div>
        </div>
      )}

      {tab === "Captions" && (
        <div className="mt-4">
          <div className="flex flex-wrap gap-2">
            {["Bold Pop", "Clean", "Karaoke"].map((c) => (
              <Chip
                key={c}
                label={c}
                selected={captionChip === c}
                onClick={() => setCaptionChip(c)}
              />
            ))}
          </div>
          <dl className="mt-4 flex flex-col gap-3 text-xs">
            <div>
              <dt className="mb-1.5 text-slate-dark">Size</dt>
              <dd className="flex items-center gap-2">
                <span className="relative h-1 flex-1 rounded-full bg-hairline-dark">
                  <span className="absolute left-0 top-0 h-full w-[70%] rounded-full bg-lime" />
                  <span className="absolute left-[70%] top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-lime" />
                </span>
                <span className="w-10 text-white">Large</span>
              </dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-slate-dark">Position</dt>
              <dd className="rounded-md bg-carbon px-2 py-1 text-white">
                Middle
              </dd>
            </div>
          </dl>
        </div>
      )}

      {tab === "Post" && (
        <div className="mt-4 text-xs">
          <p className="rounded-md bg-carbon px-2.5 py-2 text-white">
            {moment.postTitle ?? moment.title}
          </p>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {(moment.hashtags ?? []).map((h) => (
              <span
                key={h}
                className="rounded-full bg-carbon px-2 py-1 text-slate-dark"
              >
                {h}
              </span>
            ))}
          </div>
          <p className="mt-3 flex items-center gap-1.5 text-slate-dark">
            <span className="h-1.5 w-1.5 rounded-full bg-lime" />
            Best time{" "}
            <span className="font-[family-name:var(--font-jetbrains)] text-white">
              7:30 PM
            </span>
          </p>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {PLATFORMS.map((p) => (
              <span
                key={p}
                className="rounded-md border border-hairline-dark px-2 py-1 text-slate-dark"
              >
                {p}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="mt-4">
        <span className="rounded-full border border-hairline-dark px-2.5 py-1 text-[11px] text-slate-dark">
          Preset: My style (default)
        </span>
      </div>
    </div>
  );

  return (
    <div className="relative mx-auto w-full max-w-[1000px]">
      <div
        aria-hidden="true"
        className="absolute -inset-8 rounded-[40px] opacity-20 blur-3xl"
        style={{
          background:
            "radial-gradient(closest-side, #BDEF72 0%, transparent 100%)",
        }}
      />
      <div className="dark-focus relative overflow-hidden rounded-2xl border border-hairline-dark bg-graphite text-left shadow-[0_24px_60px_-24px_rgba(0,0,0,0.45)]">
        {/* top bar */}
        <div className="flex items-center justify-between border-b border-hairline-dark bg-carbon px-4 py-2.5">
          <div className="flex items-center gap-1.5" aria-hidden="true">
            <span className="h-2.5 w-2.5 rounded-full bg-hairline-dark" />
            <span className="h-2.5 w-2.5 rounded-full bg-hairline-dark" />
            <span className="h-2.5 w-2.5 rounded-full bg-hairline-dark" />
          </div>
          <span className="flex items-center gap-1.5 text-xs font-medium text-slate-dark">
            <Image
              src="/kivlo-mark-white.png"
              alt=""
              width={14}
              height={14}
            />
            KivloWorkspace
          </span>
          <StatusChip />
        </div>

        {/* desktop */}
        <div className="hidden gap-5 p-5 md:grid md:grid-cols-[1.2fr_auto_1fr]">
          {momentsList(false)}
          {preview}
          {inspector}
        </div>

        {/* mobile */}
        <div className="flex flex-col items-center gap-4 p-4 md:hidden">
          {preview}
          <div className="w-full">{momentsList(true)}</div>
        </div>
      </div>
      <style jsx>{`
        @keyframes mock-fade {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}
