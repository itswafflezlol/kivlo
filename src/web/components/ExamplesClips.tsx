"use client";

import { asset } from "@/lib/asset";
import { useRef, useState } from "react";

const CLIPS = [
  {
    src: asset("/videos/wall/kai-duke-slam-1.mp4"),
    poster: asset("/videos/wall/kai-duke-slam-1.jpg"),
    label: "Just Chatting · 0:06",
    title: "Duke slams Kai on stream",
  },
  {
    src: asset("/videos/wall/kai-duke-pepper-1.mp4"),
    poster: asset("/videos/wall/kai-duke-pepper-1.jpg"),
    label: "Just Chatting · 0:06",
    title: "The Dr Pepper phone save",
  },
  {
    src: asset("/videos/wall/emily-dance-1.mp4"),
    poster: asset("/videos/wall/emily-dance-1.jpg"),
    label: "IRL · 0:06",
    title: "Emily & Nova’s dance break",
  },
];

export default function ExamplesClips() {
  const [playingIdx, setPlayingIdx] = useState<number | null>(null);
  const refs = useRef<(HTMLVideoElement | null)[]>([]);

  const toggle = (i: number) => {
    const v = refs.current[i];
    if (!v) return;
    if (playingIdx === i && !v.paused) {
      v.pause();
      setPlayingIdx(null);
      return;
    }
    refs.current.forEach((other, j) => {
      if (other && j !== i) {
        other.pause();
        other.muted = true;
      }
    });
    v.muted = false;
    v.play().catch(() => {});
    setPlayingIdx(i);
  };

  return (
    <div
      tabIndex={0}
      role="region"
      aria-label="Example clips"
      className="mt-12 flex snap-x snap-mandatory gap-5 overflow-x-auto px-5 pb-4 md:justify-center"
    >
      {CLIPS.map((c, i) => {
        const playing = playingIdx === i;
        return (
          <div
            key={c.src}
            className="group relative w-[220px] shrink-0 snap-center overflow-hidden rounded-[20px] border-2 border-ink bg-ink shadow-[0_16px_40px_-16px_rgba(0,0,0,0.35)] transition-transform duration-250 ease-out hover:-translate-y-1.5 sm:w-[240px]"
          >
            <video
              ref={(el) => {
                refs.current[i] = el;
              }}
              src={c.src}
              poster={c.poster}
              loop
              playsInline
              preload="none"
              aria-label={c.title}
              onPause={() => setPlayingIdx((p) => (p === i ? null : p))}
              className="aspect-[9/16] w-full object-cover transition-transform duration-300 ease-out group-hover:scale-[1.03]"
            />
            <button
              type="button"
              aria-label={playing ? `Pause ${c.title}` : `Play ${c.title}`}
              onClick={() => toggle(i)}
              className={`absolute inset-0 flex items-center justify-center transition-colors duration-200 ${
                playing ? "bg-transparent" : "bg-ink/20"
              }`}
            >
              <span
                className={`flex h-14 w-14 items-center justify-center rounded-full bg-white shadow-lg transition-transform duration-200 ease-out ${
                  playing ? "scale-0" : "scale-100"
                }`}
              >
                <svg width="18" height="18" viewBox="0 0 16 16" aria-hidden="true">
                  <path d="M5 3.5v9l7.5-4.5z" fill="#181818" />
                </svg>
              </span>
            </button>
            <span className="absolute bottom-3 left-3 flex items-center gap-2 rounded-full bg-white py-1.5 pl-4 pr-1.5 text-xs font-semibold text-ink">
              {c.label}
              <span
                aria-hidden="true"
                className="flex h-5 w-5 items-center justify-center rounded-full bg-lime"
              >
                <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                  <path
                    d="M2.5 9.5L9.5 2.5M9.5 2.5H4M9.5 2.5V8"
                    stroke="#181818"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
            </span>
          </div>
        );
      })}
    </div>
  );
}
