"use client";

import { useEffect, useRef } from "react";
import InViewVideo from "./InViewVideo";
import Reveal from "./Reveal";
import { useReducedMotion } from "./hooks";

const COLS: { src: string; poster: string; score: number }[][] = [
  [
    { src: "/videos/wall/adapt-1.mp4", poster: "/videos/wall/adapt-1.jpg", score: 91 },
    { src: "/videos/wall/cinna-1.mp4", poster: "/videos/wall/cinna-1.jpg", score: 84 },
    { src: "/videos/wall/agent00-1.mp4", poster: "/videos/wall/agent00-1.jpg", score: 78 },
  ],
  [
    { src: "/videos/raw/ray-1.mp4", poster: "/videos/raw/ray-1.jpg", score: 88 },
    { src: "/videos/wall/deansocool-1.mp4", poster: "/videos/wall/deansocool-1.jpg", score: 96 },
    { src: "/videos/wall/extraemily-1.mp4", poster: "/videos/wall/extraemily-1.jpg", score: 82 },
  ],
  [
    { src: "/videos/wall/gta16stage-1.mp4", poster: "/videos/wall/gta16stage-1.jpg", score: 74 },
    { src: "/videos/raw/tylil-1.mp4", poster: "/videos/raw/tylil-1.jpg", score: 90 },
    { src: "/videos/wall/clix-2.mp4", poster: "/videos/wall/clix-2.jpg", score: 70 },
  ],
  [
    { src: "/videos/wall/deansocool-2.mp4", poster: "/videos/wall/deansocool-2.jpg", score: 87 },
    { src: "/videos/wall/marlon-1.mp4", poster: "/videos/wall/marlon-1.jpg", score: 80 },
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
                <div key={t.src} className="relative aspect-[9/16] overflow-hidden rounded-[18px] bg-mist">
                  <InViewVideo
                    src={t.src}
                    poster={t.poster}
                    className="h-full w-full object-cover"
                    label="Streamer clip in the clip wall"
                  />
                  <span
                    aria-hidden
                    className="absolute bottom-2 left-2 flex items-center gap-1.5 rounded-full bg-black/55 px-2 py-0.5 font-mono text-[11px] text-white"
                  >
                    <span className={`h-1.5 w-1.5 rounded-full ${t.score >= 85 ? "bg-lime" : "bg-heat"}`} />
                    {t.score}
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
