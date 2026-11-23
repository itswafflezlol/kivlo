"use client";

import { useEffect, useRef } from "react";
import type { PostPlatform } from "@/lib/mock";
import PlatformIcon, { platformLabel } from "./PlatformIcon";

export function PlatformGlyph({ p, size = 22 }: { p: PostPlatform | "youtube" | "twitch"; size?: number }) {
  return (
    <span
      title={platformLabel(p)}
      className="inline-flex shrink-0 items-center justify-center rounded-md bg-white ring-1 ring-line"
      style={{ width: size, height: size }}
    >
      <PlatformIcon p={p} size={Math.round(size * 0.62)} />
    </span>
  );
}

export function Star({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 12 12" className={className} fill="currentColor" aria-hidden>
      <path d="M6 1l1.5 3.1 3.4.5-2.5 2.4.6 3.4L6 8.7 3 10.4l.6-3.4L1.1 4.6l3.4-.5L6 1z" />
    </svg>
  );
}

export function ScoreBadge({ score, glass }: { score: number; glass?: boolean }) {
  const star = score >= 85 ? "text-lime" : score >= 70 ? "text-heat" : "text-[#A1A5A0]";
  return (
    <span role="img" aria-label={`Highlight score ${score} out of 100`}
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-mono text-[11px] font-medium tabular-nums ${glass ? "bg-line5 text-white" : "bg-carbon text-[#F2F2F0]"}`}>
      <Star className={`h-3 w-3 ${star}`} />{score}/100
    </span>
  );
}

export function Toggle({ checked, onChange, label }: { checked: boolean; onChange?: (v: boolean) => void; label?: string }) {
  return (
    <label className="inline-flex cursor-pointer items-center">
      <input type="checkbox" className="peer sr-only" checked={checked} onChange={(e) => onChange?.(e.target.checked)} aria-label={label} />
      <span aria-hidden className="relative h-6 w-11 rounded-full bg-line-2 transition-colors peer-checked:bg-lime-deep peer-focus-visible:ring-2 peer-focus-visible:ring-lime-deep after:absolute after:left-0.5 after:top-0.5 after:h-5 after:w-5 after:rounded-full after:bg-white after:shadow after:transition-transform peer-checked:after:translate-x-5" />
    </label>
  );
}

export function Select({ value, onChange, label, children, className = "" }: {
  value?: string; onChange?: (v: string) => void; label?: string; children: React.ReactNode; className?: string;
}) {
  return (
    <span className={`relative inline-block ${className}`}>
      <select value={value} onChange={(e) => onChange?.(e.target.value)} aria-label={label}
        className="w-full appearance-none rounded-xl border border-line-2 bg-surface px-3 py-2 pr-9 text-sm text-fg focus:outline-none focus:ring-2 focus:ring-lime">
        {children}
      </select>
      <svg aria-hidden viewBox="0 0 12 12" className="pointer-events-none absolute right-3 top-1/2 h-3 w-3 -translate-y-1/2 text-slate" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M3 4.5l3 3 3-3"/></svg>
    </span>
  );
}

export function Modal({
  open, onClose, label, children, wide, dark, title,
}: { open: boolean; onClose: () => void; label: string; children: React.ReactNode; wide?: boolean; dark?: boolean; title?: React.ReactNode }) {
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label={label} onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div
        ref={ref}
        className={`dialog-in max-h-[90vh] w-full overflow-y-auto rounded-[24px] p-6 shadow-xl ring-1 ${
          dark
            ? "bg-[#272727] text-[#F2F2F0] ring-[#3A3A3A]"
            : "bg-surface text-fg ring-line"
        } ${wide ? "max-w-2xl" : "max-w-md"}`}
      >
        {title !== undefined && (
          <div className="flex items-center justify-between gap-4">
            <h2 className={`font-heading text-[17px] font-bold ${dark ? "text-[#F2F2F0]" : "text-fg"}`}>{title}</h2>
            <button
              onClick={onClose}
              aria-label="Close"
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-colors ${
                dark ? "text-[#A1A5A0] hover:bg-surface/10 hover:text-white" : "text-slate hover:bg-surface-2 hover:text-fg"
              }`}
            >
              <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M4 4l8 8M12 4l-8 8" /></svg>
            </button>
          </div>
        )}
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
  reminder: "bg-[#F5A524]/15 text-heat-text",
  posted: "bg-surface-2 text-slate",
  failed: "bg-[#FF6B63]/15 text-error",
  processing: "bg-lilac-soft text-lilac-deep",
  ready: "bg-lime-soft text-ink",
};
