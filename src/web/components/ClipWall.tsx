"use client";

import { asset } from "@/lib/asset";
import { useEffect, useRef } from "react";
import InViewVideo from "./InViewVideo";
import Reveal from "./Reveal";
import { useReducedMotion } from "./hooks";

const COLS: { src: string; poster: string; score: number }[][] = [
  [
    { src: asset("/videos/wall/kai-denzel-1.mp4"), poster: asset("/videos/wall/kai-denzel-1.jpg"), score: 91 },
    { src: asset("/videos/wall/emily-dance-1.mp4"), poster: asset("/videos/wall/emily-dance-1.jpg"), score: 84 },
    { src: asset("/videos/wall/adapt-1.mp4"), poster: asset("/videos/wall/adapt-1.jpg"), score: 78 },
    { src: asset("/videos/wall/kai-museum-1.mp4"), poster: asset("/videos/wall/kai-museum-1.jpg"), score: 86 },
  ],
  [
    { src: asset("/videos/wall/cinna-awards-1.mp4"), poster: asset("/videos/wall/cinna-awards-1.jpg"), score: 88 },
    { src: asset("/videos/wall/kai-duke-slam-1.mp4"), poster: asset("/videos/wall/kai-duke-slam-1.jpg"), score: 96 },
    { src: asset("/videos/raw/tylil-1.mp4"), poster: asset("/videos/raw/tylil-1.jpg"), score: 82 },
    { src: asset("/videos/wall/emily-girlset-1.mp4"), poster: asset("/videos/wall/emily-girlset-1.jpg"), score: 79 },
  ],
  [
    { src: asset("/videos/wall/speed-roblox-1.mp4"), poster: asset("/videos/wall/speed-roblox-1.jpg"), score: 90 },
    { src: asset("/videos/wall/kai-druski-1.mp4"), poster: asset("/videos/wall/kai-druski-1.jpg"), score: 74 },
    { src: asset("/videos/wall/deansocool-1.mp4"), poster: asset("/videos/wall/deansocool-1.jpg"), score: 87 },
    { src: asset("/videos/wall/marlon-heat-1.mp4"), poster: asset("/videos/wall/marlon-heat-1.jpg"), score: 81 },
  ],
  [
    { src: asset("/videos/wall/kai-duke-pepper-1.mp4"), poster: asset("/videos/wall/kai-duke-pepper-1.jpg"), score: 93 },
    { src: asset("/videos/wall/emily-monster-1.mp4"), poster: asset("/videos/wall/emily-monster-1.jpg"), score: 80 },
    { src: asset("/videos/wall/clix-1.mp4"), poster: asset("/videos/wall/clix-1.jpg"), score: 77 },
    { src: asset("/videos/wall/agent00-1.mp4"), poster: asset("/videos/wall/agent00-1.jpg"), score: 85 },
  ],
];

export default function ClipWall() {
  const sec = useRef<HTMLElement>(null);
  const cols = useRef<(HTMLDivElement | null)[]>([]);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced) return;
    const el = sec.current;
    if (!el) return;
    let raf = 0;
    const update = () => {
      raf = 0;
      const r = el.getBoundingClientRect();
      const total = r.height + window.innerHeight;
      const p = Math.min(1, Math.max(0, (window.innerHeight - r.top) / total));
      cols.current.forEach((c, i) => {
        if (!c) return;
        const dir = i % 2 === 0 ? -1 : 1; // cols 1,3 up; 2,4 down
        c.style.transform = `translateY(${((p - 0.5) * 160 * dir).toFixed(1)}px)`;
      });
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [reduced]);

  return (
    <section ref={sec} className="relative overflow-hidden px-5 pb-20 pt-4">
      <Reveal className="mx-auto max-w-2xl">
        <h2 className="text-center font-heading text-3xl font-bold sm:text-4xl">
          Every stream has a moment
        </h2>
        <p className="mt-4 text-center text-lg text-slate">
          Kivlo finds them so you don&apos;t have to scrub for hours.
        </p>
      </Reveal>

      <div className="relative mx-auto mt-12 h-[560px] max-w-6xl overflow-hidden sm:h-[640px]">
        <div className="grid h-[130%] grid-cols-2 gap-4 md:grid-cols-4">
          {COLS.map((col, i) => (
            <div
              key={i}
              ref={(n) => {
                cols.current[i] = n;
              }}
              className="flex flex-col gap-4 will-change-transform"
              style={{ marginTop: i % 2 === 1 ? "-40px" : "0" }}
            >
              {col.map((t) => (
                <div key={t.src} className="group relative aspect-[9/16] overflow-hidden rounded-[18px] bg-mist">
                  <InViewVideo
                    src={t.src}
                    poster={t.poster}
                    className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                    label="Streamer clip in the clip wall"
                  />
                  <span
                    role="img"
                    aria-label={`Highlight score ${t.score} out of 100`}
                    className="absolute bottom-2 left-2 flex items-center gap-1.5 rounded-full bg-black/55 px-2 py-0.5 font-mono text-[11px] text-white"
                  >
                    <svg viewBox="0 0 12 12" className={`h-3 w-3 ${t.score >= 85 ? "text-lime" : "text-heat"}`} fill="currentColor" aria-hidden>
                      <path d="M6 1l1.5 3.1 3.4.5-2.5 2.4.6 3.4L6 8.7 3 10.4l.6-3.4L1.1 4.6l3.4-.5L6 1z" />
                    </svg>
                    {t.score}/100
                  </span>
                </div>
              ))}
            </div>
          ))}
        </div>
        {/* paper fades */}
        <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-paper to-transparent" />
        <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-paper to-transparent" />
      </div>
    </section>
  );
}
