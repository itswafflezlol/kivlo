"use client";

import { useEffect, useRef } from "react";
import { asset } from "@/lib/asset";
import Image from "next/image";
import { useReducedMotion } from "./hooks";

/**
 * Pinned scroll-driven "From stream to Short" demo.
 * --p is a 0..1 scroll-progress CSS var; globals.css .tf-* classes
 * interpolate the frame morph in calc().
 */
export default function TransformShowcase() {
  const wrap = useRef<HTMLElement>(null);
  const vid = useRef<HTMLVideoElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced) return;
    const el = wrap.current;
    if (!el) return;
    let raf = 0;
    const update = () => {
      raf = 0;
      const r = el.getBoundingClientRect();
      const total = r.height - window.innerHeight;
      const p = total > 0 ? Math.min(1, Math.max(0, -r.top / total)) : 1;
      el.style.setProperty("--p", p.toFixed(4));
      const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
      el.style.setProperty("--morph", clamp01((p - 0.6) / 0.25).toFixed(4));
      el.style.setProperty("--cropin", clamp01((p - 0.25) / 0.35).toFixed(4));
      el.style.setProperty("--capin", clamp01((p - 0.85) / 0.1).toFixed(4));
      for (let i = 0; i < 3; i++)
        el.style.setProperty(`--capin${i + 1}`, clamp01((p - 0.85 - i * 0.04) / 0.08).toFixed(4));
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [reduced]);

  useEffect(() => {
    if (reduced || !vid.current) return;
    const v = vid.current;
    const io = new IntersectionObserver(
      ([e]) => (e.isIntersecting ? v.play().catch(() => {}) : v.pause()),
      { threshold: 0.2 }
    );
    io.observe(v);
    return () => io.disconnect();
  }, [reduced]);

  if (reduced) {
    return (
      <section className="mx-auto max-w-[1200px] px-5 pb-24 pt-8">
        <p className="text-center font-mono text-xs uppercase tracking-[0.2em] text-slate">
          • How Kivlo sees it
        </p>
        <h2 className="mt-3 text-center font-heading text-3xl font-bold sm:text-4xl">
          From stream <span className="text-slate">to Short</span>
        </h2>
        <div className="mt-10 flex items-center justify-center gap-6">
          <div className="relative aspect-video w-52 overflow-hidden rounded-2xl border border-hairline sm:w-72">
            <Image src={asset("/videos/raw/jasontheween-1.jpg")} alt="" fill className="object-cover" sizes="300px" />
          </div>
          <span aria-hidden className="font-mono text-2xl text-slate">→</span>
          <div className="relative aspect-[9/16] w-36 overflow-hidden rounded-[28px] border border-ink sm:w-44">
            <Image src={asset("/videos/raw/jasontheween-1.jpg")} alt="Clip cropped to vertical" fill className="object-cover" sizes="180px" />
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-white px-3 py-1 font-heading text-xs font-bold uppercase">
              No way he <span className="bg-lime px-1 rounded">did that</span>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section ref={wrap} className="tf-wrap relative h-[180vh] md:h-[250vh]" style={{ ["--p" as string]: 0 }}>
      <div className="sticky top-[8vh] flex h-[84vh] flex-col items-center justify-center overflow-hidden px-5">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-slate">
          • How Kivlo sees it
        </p>
        <h2 className="mt-3 text-center font-heading text-3xl font-bold sm:text-4xl">
          From stream <span className="text-slate">to Short</span>
        </h2>

        <div className="relative mt-8 flex items-center justify-center gap-6">
          {/* the morphing frame */}
          <div className="tf-frame relative overflow-hidden border border-ink/80 bg-ink">
            <video
              ref={vid}
              src={asset("/videos/raw/jasontheween-1.mp4")}
              poster={asset("/videos/raw/jasontheween-1.jpg")}
              muted
              loop
              playsInline
              preload="none"
              aria-label="Twitch clip being cropped from 16:9 to vertical"
              className="absolute inset-0 h-full w-full scale-[1.14] object-cover"
            />
            <span className="tf-vodlabel absolute left-3 top-3 rounded-md bg-black/55 px-2 py-1 font-mono text-[11px] text-white">
              Twitch VOD · 1:42:10
            </span>
            {/* crop box + dimming shadow */}
            <div className="tf-cropbox absolute inset-y-0 left-1/2 aspect-[9/16] -translate-x-1/2 rounded-xl border-2 border-lime">
              <span className="absolute -top-9 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-lime px-3 py-1 font-mono text-[11px] font-medium text-ink">
                Moment found · 92
              </span>
            </div>
            {/* caption pill */}
            <div className="tf-caption absolute inset-x-0 bottom-[14%] flex justify-center px-4">
              <span className="text-center font-heading text-2xl font-extrabold uppercase leading-tight tracking-tight text-white [text-shadow:0_2px_0_#181818,0_0_10px_rgba(0,0,0,0.6)] sm:text-3xl">
                No way he<br /><span className="rounded bg-lime px-1.5 text-ink [text-shadow:none]">did that</span>
              </span>
            </div>
          </div>

          {/* side chips */}
          <div className="hidden w-48 flex-col gap-2.5 md:flex" aria-hidden>
            {["Captions added", "9:16 · 1080×1920", "Ready to post"].map((t, i) => (
              <span
                key={t}
                style={{ opacity: `var(--capin${i + 1}, 0)`, transform: `translateX(calc(28px * (1 - var(--capin${i + 1}, 0))))` }}
                className="flex items-center gap-2 rounded-full border border-hairline bg-white px-4 py-2 text-sm font-medium text-ink shadow-sm"
              >
                <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden>
                  <circle cx="7" cy="7" r="7" fill="#BDEF72" />
                  <path d="M4.5 7.2 6.3 9 9.5 5.5" stroke="#181818" strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                {t}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
