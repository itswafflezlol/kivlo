"use client";

import { useEffect, useRef, useState } from "react";

const CLIPS = [
  {
    src: "/videos/kai-launched.mp4",
    poster: "/videos/kai-launched.jpg",
    label: "Gaming · 0:17",
  },
  {
    src: "/videos/kai-car-explodes.mp4",
    poster: "/videos/kai-car-explodes.jpg",
    label: "Gaming · 0:17",
  },
  {
    src: "/videos/fanum-wait.mp4",
    poster: "/videos/fanum-wait.jpg",
    label: "Gaming · 0:21",
  },
];

const TILTS = ["-6deg", "0deg", "6deg"];

function Phone({
  clip,
  tilt,
  dimmed,
  inView,
}: {
  clip: (typeof CLIPS)[number];
  tilt: string;
  dimmed: boolean;
  inView: boolean;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    if (inView) v.play().catch(() => {});
    else v.pause();
  }, [inView]);

  return (
    <div className="group w-[200px] shrink-0 snap-center transition-transform duration-250 ease-out md:w-[240px]">
      <div
        className="overflow-hidden rounded-[20px] border-2 border-ink bg-ink shadow-[0_16px_40px_-16px_rgba(0,0,0,0.35)] transition-all duration-250 ease-out md:rotate-[var(--tilt)] md:group-hover:-translate-y-1.5 md:group-hover:rotate-0"
        style={
          {
            "--tilt": tilt,
            opacity: dimmed ? 0.55 : 1,
          } as React.CSSProperties
        }
      >
        <video
          ref={videoRef}
          src={clip.src}
          poster={clip.poster}
          muted
          loop
          playsInline
          preload="metadata"
          className="aspect-[9/16] w-full object-cover"
        />
      </div>
      <p className="mt-3 text-center text-sm text-slate">{clip.label}</p>
    </div>
  );
}

export default function ExamplesClips() {
  const [inView, setInView] = useState(false);
  const [hover, setHover] = useState<number | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const io = new IntersectionObserver(
      ([e]) => setInView(e.isIntersecting),
      { threshold: 0.3 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      tabIndex={0}
      role="region"
      aria-label="Example clips"
      className="mt-14 flex snap-x snap-mandatory gap-6 overflow-x-auto px-5 pb-4 md:snap-none md:justify-center md:overflow-visible md:px-0 md:pb-10"
      onMouseLeave={() => setHover(null)}
    >
      {CLIPS.map((c, i) => (
        <div
          key={c.src}
          onMouseEnter={() => setHover(i)}
          className={i === 1 ? "md:-translate-y-4" : ""}
        >
          <Phone
            clip={c}
            tilt={TILTS[i]}
            dimmed={hover !== null && hover !== i}
            inView={inView}
          />
        </div>
      ))}
    </div>
  );
}
