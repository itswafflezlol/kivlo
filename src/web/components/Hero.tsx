"use client";

import { asset } from "@/lib/asset";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import InViewVideo from "./InViewVideo";
import PasteBar from "./PasteBar";
import { useReducedMotion } from "./hooks";

function HoverPlay({
  poster,
  video,
  className = "",
  label,
}: {
  poster: string;
  video: string;
  className?: string;
  label: string;
}) {
  const reduced = useReducedMotion();
  const [hover, setHover] = useState(false);
  return (
    <span
      className={className}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      role="img"
      aria-label={label}
    >
      {hover && !reduced ? (
        <video src={video} muted loop playsInline autoPlay />
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={poster} alt="" loading="lazy" />
      )}
    </span>
  );
}

// floating thumbs: >=1280 only, in the side gutters, never over text
const THUMBS = [
  { poster: asset("/videos/wall/kai-duke-slam-1.jpg"), video: asset("/videos/wall/kai-duke-slam-1.mp4"), cls: "left-[2.5%] top-[9%] w-20 -rotate-6", depth: 1.6, delay: 0 },
  { poster: asset("/videos/wall/emily-dance-1.jpg"), video: asset("/videos/wall/emily-dance-1.mp4"), cls: "left-[3%] top-[36%] w-16 rotate-3", depth: 1.0, delay: 1.1 },
  { poster: asset("/videos/wall/cinna-awards-1.jpg"), video: asset("/videos/wall/cinna-awards-1.mp4"), cls: "right-[2.5%] top-[6%] w-24 rotate-6", depth: 1.8, delay: 0.6 },
  { poster: asset("/videos/wall/emily-monster-1.jpg"), video: asset("/videos/wall/emily-monster-1.mp4"), cls: "right-[3%] top-[40%] w-16 -rotate-3", depth: 1.1, delay: 1.8 },
];

function FloatThumb({ t, mx, my }: { t: (typeof THUMBS)[0]; mx: number; my: number }) {
  return (
    <span
      aria-hidden="true"
      className={`float-thumb absolute z-10 hidden min-[1280px]:block ${t.cls}`}
      style={{
        transform: `translate(${mx * t.depth * 10}px, ${my * t.depth * 10}px)`,
        transition: "transform 300ms cubic-bezier(0.22,1,0.36,1)",
      }}
    >
      <span
        className="float-bob block"
        style={{ ["--bob-delay" as string]: `${t.delay}s` }}
      >
        <HoverPlay
          poster={t.poster}
          video={t.video}
          label=""
          className="block aspect-[9/16] w-full overflow-hidden rounded-2xl shadow-[0_12px_30px_-10px_rgba(0,0,0,0.25)] transition-transform duration-200 ease-out hover:scale-[1.06]"
        />
      </span>
    </span>
  );
}

const ARC = [
  { type: "img", src: asset("/videos/wall/emily-girlset-1.jpg"), w: 132 },
  { type: "score", w: 140 },
  { type: "video", src: asset("/videos/wall/kai-denzel-1.mp4"), poster: asset("/videos/wall/kai-denzel-1.jpg"), w: 150 },
  { type: "center", w: 190 },
  { type: "video", src: asset("/videos/wall/cinna-awards-1.mp4"), poster: asset("/videos/wall/cinna-awards-1.jpg"), w: 150 },
  { type: "time", w: 150 },
  { type: "tags", w: 160 },
];

function ArcCard({
  item,
  rel,
  arcOn,
  scale,
}: {
  item: (typeof ARC)[0];
  rel: number;
  arcOn: boolean;
  scale: number;
}) {
  const transform = `rotateY(${rel * -13}deg) translateZ(${-Math.abs(rel) * 55}px) translateY(${Math.abs(rel) * 14}px)`;
  let body: React.ReactNode = null;
  if (item.type === "img")
    body = (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={item.src} alt="" className="absolute inset-0 h-full w-full object-cover" />
    );
  if (item.type === "score")
    body = (
      <div className="absolute inset-0 flex w-full flex-col justify-center gap-1 bg-white p-4">
        <p className="text-xs text-slate">Highlight score</p>
        <p className="font-[family-name:var(--font-jetbrains)] text-4xl font-medium">
          94
        </p>
        <p className="text-xs text-slate">Duke slams Kai</p>
      </div>
    );
  if (item.type === "video")
    body = (
      <InViewVideo src={item.src!} poster={item.poster!} className="absolute inset-0 h-full w-full object-cover" label="Example clip" />
    );
  if (item.type === "center")
    body = (
      <div className="dark-focus absolute inset-0 flex w-full flex-col gap-2 bg-ink p-4">
        <div className="flex items-center gap-1.5 text-white">
          <Image src={asset("/kivlo-mark-white.png")} alt="" width={94} height={96} className="h-3.5 w-auto" />
          <span className="text-xs font-semibold">KivloWorkspace</span>
        </div>
        {[
          ["94", "Duke slams Kai", "bg-lime text-ink"],
          ["88", "Emily & Nova dance", "bg-lime text-ink"],
          ["81", "Speed vs Roblox kids", "bg-heat text-ink"],
        ].map(([s, t, c]) => (
          <div key={s} className="flex items-center gap-2 rounded-md bg-carbon px-2 py-1.5">
            <span className={`rounded px-1 py-0.5 font-[family-name:var(--font-jetbrains)] text-[10px] ${c}`}>
              {s}
            </span>
            <span className="truncate text-[10px] text-white">{t}</span>
          </div>
        ))}
      </div>
    );
  if (item.type === "time")
    body = (
      <div className="absolute inset-0 flex w-full flex-col justify-center gap-2 bg-white p-4">
        <p className="text-xs text-slate">Best time to post</p>
        <p className="flex items-center gap-1.5 font-[family-name:var(--font-jetbrains)] text-2xl font-medium">
          <span className="h-2 w-2 rounded-full bg-lime" />
          7:30 PM
        </p>
        <p className="text-xs text-slate">TikTok · Shorts</p>
      </div>
    );
  if (item.type === "tags")
    body = (
      <div className="absolute inset-0 flex w-full flex-wrap content-center gap-1.5 bg-lime p-4">
        {["#kaicenat", "#justchatting", "#streamclips"].map((h) => (
          <span key={h} className="rounded-full bg-ink px-2 py-1 text-[10px] text-white">
            {h}
          </span>
        ))}
      </div>
    );
  return (
    <div
      className="relative aspect-[9/16] shrink-0 snap-center overflow-hidden rounded-2xl border border-border shadow-[0_18px_40px_-14px_rgba(0,0,0,0.25)] transition-transform duration-300 ease-out hover:-translate-y-2"
      style={{ width: item.w * scale, transform: arcOn ? transform : undefined }}
    >
      {body}
    </div>
  );
}

export default function Hero() {
  const panelRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const [m, setM] = useState({ x: 0, y: 0 });
  // 'scroll' (<1024) | 'arc5' (1024-1279) | 'arc7' (>=1280)
  const [mode, setMode] = useState<"scroll" | "arc5" | "arc7">("scroll");

  useEffect(() => {
    const q5 = window.matchMedia("(min-width: 1024px)");
    const q7 = window.matchMedia("(min-width: 1280px)");
    const update = () =>
      setMode(q7.matches ? "arc7" : q5.matches ? "arc5" : "scroll");
    update();
    q5.addEventListener("change", update);
    q7.addEventListener("change", update);
    return () => {
      q5.removeEventListener("change", update);
      q7.removeEventListener("change", update);
    };
  }, []);

  const onMove = (e: React.MouseEvent) => {
    if (reduced) return;
    const r = panelRef.current?.getBoundingClientRect();
    if (!r) return;
    setM({
      x: ((e.clientX - r.left) / r.width - 0.5) * 2,
      y: ((e.clientY - r.top) / r.height - 0.5) * 2,
    });
  };

  const arc = mode === "arc7" ? ARC : mode === "arc5" ? ARC.slice(1, 6) : ARC;
  const arcScale = mode === "arc5" ? 0.8 : 1;
  const arcOn = mode !== "scroll";
  const center = (arc.length - 1) / 2;

  return (
    <section className="px-3 pt-4 sm:px-5">
      <div
        ref={panelRef}
        onMouseMove={onMove}
        className="relative mx-auto min-h-[640px] max-w-[1400px] overflow-hidden rounded-[32px] border border-border bg-white px-5 pb-24 pt-16 text-center sm:pt-20"
      >
        {/* wavy ribbons, kept low behind the arc area */}
        <svg
          aria-hidden="true"
          className="ribbon-drift pointer-events-none absolute inset-0 h-full w-full"
          viewBox="0 0 1400 700"
          preserveAspectRatio="none"
        >
          <path
            className="ribbon-path"
            d="M-80 520 C 200 420, 340 640, 560 540 S 900 360, 1120 480 S 1380 640, 1500 560"
            fill="none"
            stroke="#EAF8CC"
            strokeWidth="84"
            strokeLinecap="round"
          />
          <path
            className="ribbon-path delayed opacity-60"
            d="M-80 570 C 220 470, 380 680, 620 560 S 940 420, 1140 530 S 1380 670, 1500 600"
            fill="none"
            stroke="#E9E5FB"
            strokeWidth="40"
            strokeLinecap="round"
          />
        </svg>

        {/* floating thumbs (>=1280 only) */}
        {THUMBS.map((t) => (
          <FloatThumb key={t.poster + t.cls} t={t} mx={m.x} my={m.y} />
        ))}

        <div className="relative z-20">
          <h1 className="hero-in mx-auto w-fit max-w-full text-balance font-display text-[40px] font-semibold leading-[1.08] text-ink sm:text-6xl lg:text-[56px] xl:text-[64px]">
            Turn long{" "}
            <HoverPlay
              poster={asset("/videos/thumbs/kai-museum-face.jpg")}
              video={asset("/videos/wall/kai-museum-1.mp4")}
              label="Kai Cenat clip"
              className="h-chip -rotate-2 shadow-md"
            />{" "}
            streams
            <br />
            into clips{" "}
            <HoverPlay
              poster={asset("/videos/thumbs/emily-dance-face.jpg")}
              video={asset("/videos/wall/emily-dance-1.mp4")}
              label="ExtraEmily clip"
              className="h-chip rotate-2 shadow-md"
            />{" "}
            <span className="text-slate">worth posting.</span>
          </h1>
          <p
            className="hero-in mx-auto mt-6 max-w-xl text-balance text-lg leading-relaxed text-slate"
            style={{ "--hero-delay": "120ms" } as React.CSSProperties}
          >
            Paste a YouTube or Twitch link. Kivlo finds the best moments, crops
            them to vertical, and adds captions.
          </p>
          <div
            className="hero-in mt-8"
            style={{ "--hero-delay": "200ms" } as React.CSSProperties}
          >
            <PasteBar />
            <p className="mx-auto mt-4 w-fit text-sm text-slate">
              Free plan · No card needed · 3 credits a month
            </p>
          </div>
        </div>

        {/* arc */}
        <div className="relative z-10 mt-14 md:mt-10">
          <div
            className="flex snap-x snap-mandatory items-start gap-4 overflow-x-auto px-2 pb-4 md:snap-none md:items-start md:justify-center md:overflow-visible md:px-0"
            style={{ perspective: "1200px" }}
            tabIndex={0}
            role="region"
            aria-label="Product preview cards"
          >
            {arc.map((item, i) => (
              <ArcCard
                key={i}
                item={item}
                rel={i - center}
                arcOn={arcOn}
                scale={arcScale}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
