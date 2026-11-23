"use client";

import { useEffect, useRef } from "react";
import type { PostPlatform } from "@/lib/mock";

export const GLYPHS: Record<PostPlatform | "youtube" | "twitch", { label: string; color: string; ch: string }> = {
  tiktok: { label: "TikTok", color: "#181818", ch: "tt" },
  shorts: { label: "Shorts", color: "#FF6B63", ch: "▶" },
  reels: { label: "Reels", color: "#BAAEF0", ch: "◎" },
  x: { label: "X", color: "#181818", ch: "𝕏" },
  youtube: { label: "YouTube", color: "#FF6B63", ch: "▶" },
  twitch: { label: "Twitch", color: "#5B47C9", ch: "tv" },
};

export function PlatformGlyph({ p, size = 22 }: { p: PostPlatform | "youtube" | "twitch"; size?: number }) {
  const g = GLYPHS[p];
  return (
    <span
      title={g.label}
      className="inline-flex shrink-0 items-center justify-center rounded-md bg-white font-mono text-[10px] font-semibold text-ink ring-1 ring-black/5"
      style={{ width: size, height: size, color: g.color }}
    >
      {g.ch}
    </span>
  );
}

export function ScoreBadge({ score }: { score: number }) {
  const cls = score >= 85 ? "bg-lime text-ink" : score >= 70 ? "bg-heat text-ink" : "bg-[#3A3A3A] text-[#A1A5A0]";
  return <span className={`rounded-md px-1.5 py-0.5 font-mono text-[11px] font-medium ${cls}`}>{score}</span>;
}

export function Modal({
  open, onClose, label, children, wide,
}: { open: boolean; onClose: () => void; label: string; children: React.ReactNode; wide?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const prev = document.activeElement as HTMLElement | null;
    const el = ref.current;
    el?.querySelector<HTMLElement>("input,button,[tabindex]")?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "Tab" && el) {
        const f = [...el.querySelectorAll<HTMLElement>('a[href],button:not([disabled]),input,select,textarea,[tabindex]:not([tabindex="-1"])')];
        if (!f.length) return;
        const first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { last.focus(); e.preventDefault(); }
        else if (!e.shiftKey && document.activeElement === last) { first.focus(); e.preventDefault(); }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => { window.removeEventListener("keydown", onKey); prev?.focus(); };
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/50 p-4" role="dialog" aria-modal="true" aria-label={label} onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div ref={ref} className={`max-h-[90vh] w-full overflow-y-auto rounded-2xl bg-white p-6 shadow-xl ${wide ? "max-w-2xl" : "max-w-md"}`}>
        {children}
      </div>
    </div>
  );
}

export function fmtMin(sec: number) {
  const m = Math.floor(sec / 60), s = Math.round(sec % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}
export function fmtLen(sec: number) {
  const h = Math.floor(sec / 3600), m = Math.round((sec % 3600) / 60);
  return h ? `${h}h ${m}m` : `${m}m`;
}
const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
export function fmtTime(iso: string) {
  const d = new Date(iso);
  const h = d.getHours();
  return `${DAYS[d.getDay()]} ${h % 12 || 12}:${String(d.getMinutes()).padStart(2, "0")} ${h < 12 ? "AM" : "PM"}`;
}
export const statusChip: Record<string, string> = {
  scheduled: "bg-lime-soft text-ink",
  reminder: "bg-[#F5A524]/15 text-[#8A5300]",
  posted: "bg-mist text-slate",
  failed: "bg-[#FF6B63]/15 text-[#B3261E]",
  processing: "bg-lilac-soft text-lilac-deep",
  ready: "bg-lime-soft text-ink",
};
