"use client";

import { useEffect, useRef, useState } from "react";
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

export function IconButton({ onClick, label, pressed, disabled, dark, className = "", children }: {
  onClick?: () => void; label: string; pressed?: boolean; disabled?: boolean; dark?: boolean; className?: string; children: React.ReactNode;
}) {
  return (
    <button onClick={onClick} aria-label={label} aria-pressed={pressed} disabled={disabled}
      className={`grid h-8 w-8 place-items-center rounded-full transition-colors disabled:opacity-30 [&>svg]:h-4 [&>svg]:w-4 ${
        dark ? (pressed ? "bg-lime text-ink" : "text-[#A1A5A0] hover:bg-carbon hover:text-white") : (pressed ? "bg-fg text-canvas" : "text-slate hover:bg-surface-2 hover:text-fg")} ${className}`}>
      {children}
    </button>
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

export function Select({ value, onChange, label, options, className = "", dark }: {
  value?: string; onChange?: (v: string) => void; label?: string; options: { value: string; label: string }[]; className?: string; dark?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const root = useRef<HTMLSpanElement>(null);
  const idx = Math.max(0, options.findIndex((o) => o.value === value));
  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => { if (!root.current?.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);
  const pick = (i: number) => { onChange?.(options[i].value); setOpen(false); };
  const expand = () => { setActive(idx); setOpen(true); };
  const onKey = (e: React.KeyboardEvent) => {
    if (!open && (e.key === "ArrowDown" || e.key === "ArrowUp" || e.key === "Enter" || e.key === " ")) { expand(); e.preventDefault(); return; }
    if (!open) return;
    if (e.key === "ArrowDown") { setActive((a) => Math.min(options.length - 1, a + 1)); e.preventDefault(); }
    else if (e.key === "ArrowUp") { setActive((a) => Math.max(0, a - 1)); e.preventDefault(); }
    else if (e.key === "Enter" || e.key === " ") { pick(active); e.preventDefault(); }
    else if (e.key === "Escape") { setOpen(false); e.preventDefault(); }
    else if (e.key === "Home") { setActive(0); e.preventDefault(); }
    else if (e.key === "End") { setActive(options.length - 1); e.preventDefault(); }
  };
  return (
    <span ref={root} className={`relative inline-block ${className}`}>
      <button type="button" aria-label={label} aria-haspopup="listbox" aria-expanded={open}
        onClick={() => (open ? setOpen(false) : expand())} onKeyDown={onKey}
        className={`flex w-full items-center justify-between rounded-xl border px-3 py-2 text-left text-sm focus:outline-none focus:ring-2 focus:ring-lime ${dark ? "border-[#3A3A3A] bg-carbon text-[#F2F2F0]" : "border-line-2 bg-surface text-fg"}`}>
        <span>{options[idx]?.label}</span>
        <svg aria-hidden viewBox="0 0 12 12" className={`ml-2 h-3 w-3 shrink-0 text-slate transition-transform ${open ? "rotate-180" : ""}`} fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M3 4.5l3 3 3-3"/></svg>
      </button>
      {open && (
        <ul role="listbox" aria-label={label} aria-activedescendant={`opt-${active}`}
          className={`kv-scroll absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-xl p-1 shadow-lg ring-1 ${dark ? "bg-graphite ring-[#3A3A3A]" : "bg-surface ring-line"}`}>
          {options.map((o, i) => (
            <li key={o.value} id={`opt-${i}`} role="option" aria-selected={o.value === value}
              onMouseEnter={() => setActive(i)} onClick={() => pick(i)}
              className={`flex cursor-pointer items-center justify-between rounded-lg px-3 py-2 text-sm ${i === active ? (dark ? "bg-carbon" : "bg-surface-2") : ""} ${o.value === value ? (dark ? "font-medium text-white" : "font-medium text-fg") : (dark ? "text-[#F2F2F0]" : "text-fg")}`}>
              {o.label}
              {o.value === value && (
                <svg viewBox="0 0 12 12" className="h-3 w-3 text-lime-deep" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M2.5 6.2l2.3 2.3L9.5 3.6" /></svg>
              )}
            </li>
          ))}
        </ul>
      )}
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
            <IconButton onClick={onClose} label="Close" dark={dark}>
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M4 4l8 8M12 4l-8 8" /></svg>
            </IconButton>
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
