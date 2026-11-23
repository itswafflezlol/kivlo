"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { user, notifications } from "@/lib/mock";
import ImportModal from "./ImportModal";
import UpgradeModal from "./UpgradeModal";

const ICONS: Record<string, React.ReactNode> = {
  Dashboard: <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.6"><rect x="2" y="2" width="6" height="6" rx="1.5"/><rect x="10" y="2" width="6" height="6" rx="1.5"/><rect x="2" y="10" width="6" height="6" rx="1.5"/><rect x="10" y="10" width="6" height="6" rx="1.5"/></svg>,
  Library: <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.6"><rect x="2" y="3" width="14" height="12" rx="2"/><path d="M6 7.5 9 9.5l3-2V3"/></svg>,
  Calendar: <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.6"><rect x="2" y="3" width="14" height="13" rx="2"/><path d="M2 7h14M6 1v4M12 1v4"/></svg>,
  Presets: <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M3 5h12M3 9h12M3 13h12"/><circle cx="7" cy="5" r="1.6" fill="currentColor"/><circle cx="12" cy="9" r="1.6" fill="currentColor"/><circle cx="5" cy="13" r="1.6" fill="currentColor"/></svg>,
  Billing: <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.6"><rect x="2" y="4" width="14" height="11" rx="2"/><path d="M2 8h14"/></svg>,
  Settings: <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.6"><circle cx="9" cy="9" r="2.5"/><path d="M9 1.5v2M9 14.5v2M1.5 9h2M14.5 9h2M3.7 3.7l1.4 1.4M12.9 12.9l1.4 1.4M14.3 3.7l-1.4 1.4M5.1 12.9l-1.4 1.4"/></svg>,
};

const NAV = [
  { href: "/app", label: "Dashboard" },
  { href: "/app/library", label: "Library" },
  { href: "/app/calendar", label: "Calendar" },
  { href: "/app/presets", label: "Presets" },
];
const LOWER = [
  { href: "/app/billing", label: "Billing" },
  { href: "/app/settings", label: "Settings" },
];

const TITLES: [RegExp, string][] = [
  [/^\/app$/, "Dashboard"],
  [/^\/app\/projects\//, "Project"],
  [/^\/app\/library/, "Library"],
  [/^\/app\/calendar/, "Calendar"],
  [/^\/app\/presets/, "Presets"],
  [/^\/app\/billing/, "Billing"],
  [/^\/app\/settings/, "Settings"],
];

export default function Shell({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const title = TITLES.find(([re]) => re.test(path))?.[1] ?? "Kivlo";
  const [importOpen, setImportOpen] = useState(false);
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const [bellOpen, setBellOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const railItem = (href: string, label: string) => (
    <Link key={href} href={href} aria-label={label} title={label}
      className={`flex h-12 w-12 items-center justify-center rounded-full transition-colors ${path === href ? "bg-lime text-ink" : "text-[#A1A5A0] hover:text-white"}`}>
      {ICONS[label]}
    </Link>
  );

  return (
    <div className="min-h-screen bg-paper text-ink">
      {/* floating ink pill rail */}
      <aside aria-label="App" className="fixed inset-y-4 left-3 z-40 hidden w-[72px] flex-col items-center rounded-[32px] bg-ink py-5 shadow-xl md:flex">
        <Link href="/app" aria-label="Kivlo dashboard" className="mb-6 flex h-11 w-11 items-center justify-center">
          <Image src="/kivlo-mark-white.png" alt="Kivlo" width={94} height={96} className="h-[26px] w-auto" />
        </Link>
        <button onClick={() => setImportOpen(true)} aria-label="New import" title="New import"
          className="mb-5 flex h-11 w-11 items-center justify-center rounded-full bg-lime text-ink transition-transform hover:scale-105">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 3v12M3 9h12"/></svg>
        </button>
        <nav aria-label="Primary" className="flex flex-col items-center gap-1.5">{NAV.map((n) => railItem(n.href, n.label))}</nav>
        <nav aria-label="Account" className="mt-auto flex flex-col items-center gap-1.5">{LOWER.map((n) => railItem(n.href, n.label))}</nav>
      </aside>

      <div className="md:pl-[88px]">
        <header className="sticky top-0 z-30 flex items-center gap-3 px-4 py-4 md:px-7">
          <h1 className="sr-only">{title}</h1>
          <div className="relative">
            <button onClick={() => setMenuOpen(!menuOpen)} aria-expanded={menuOpen}
              className="flex items-center gap-2 rounded-full bg-white p-1.5 pr-1.5 shadow-sm ring-1 ring-black/5 hover:shadow">
              <span aria-hidden="true" className="flex h-8 w-8 items-center justify-center rounded-full bg-ink font-heading text-xs font-bold text-lime">S</span>
              <span className="hidden pr-1 text-sm font-medium sm:block">{user.name}</span><span className="sr-only">{user.name} profile menu</span>
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-lime text-ink">
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M3 4.5 6 7.5 9 4.5"/></svg>
              </span>
            </button>
            {menuOpen && (
              <div className="absolute left-0 mt-2 w-56 rounded-2xl bg-white p-3 shadow-lg ring-1 ring-black/5">
                <p className="px-2 text-sm font-medium">{user.name} · <span className="capitalize text-slate">{user.plan}</span></p>
                <p className="px-2 font-mono text-xs text-slate">{user.creditsTotal - user.creditsUsed} credits left</p>
                <button onClick={() => { setMenuOpen(false); setUpgradeOpen(true); }} className="mt-2 w-full rounded-full bg-lime py-2 text-sm font-semibold text-ink">Upgrade</button>
              </div>
            )}
          </div>
          <div className="ml-auto flex items-center gap-2">
            <button aria-label="Search" className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-black/5 hover:shadow">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6"><circle cx="7" cy="7" r="4.5"/><path d="m10.5 10.5 3 3"/></svg>
            </button>
            <div className="relative">
              <button aria-label="Notifications" aria-expanded={bellOpen} onClick={() => setBellOpen(!bellOpen)}
                className="relative flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-black/5 hover:shadow">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M8 2a4 4 0 0 0-4 4v2.5L2.8 11h10.4L12 8.5V6a4 4 0 0 0-4-4Z"/><path d="M6.5 13a1.5 1.5 0 0 0 3 0"/></svg>
                <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-lime ring-2 ring-white" />
              </button>
              {bellOpen && (
                <div className="absolute right-0 mt-2 w-80 rounded-2xl bg-white p-2 shadow-lg ring-1 ring-black/5">
                  {notifications.map((n) => (
                    <div key={n.id} className="rounded-xl px-3 py-2 text-sm hover:bg-paper">
                      <p className="text-ink">{n.text}</p>
                      <p className="mt-0.5 text-xs text-slate">{n.time}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </header>
        <main className="px-4 pb-28 pt-2 md:px-7 md:pb-8">{children}</main>
      </div>

      {/* mobile bottom tab bar with raised center + */}
      <nav aria-label="Primary" className="fixed inset-x-3 bottom-3 z-40 flex items-center justify-around rounded-[28px] bg-ink py-2.5 shadow-xl md:hidden">
        {NAV.map((n, i) => (
          <span key={n.href} className="contents">
            {i === 2 && (
              <button onClick={() => setImportOpen(true)} aria-label="New import"
                className="-mt-7 flex h-14 w-14 items-center justify-center rounded-full bg-lime text-ink shadow-lg ring-4 ring-paper">
                <svg width="20" height="20" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 3v12M3 9h12"/></svg>
              </button>
            )}
            <Link href={n.href} aria-label={n.label} className={`flex h-10 w-10 items-center justify-center rounded-full ${path === n.href ? "bg-lime text-ink" : "text-[#A1A5A0]"}`}>{ICONS[n.label]}</Link>
          </span>
        ))}
        <Link href="/app/settings" aria-label="Settings" className={`flex h-10 w-10 items-center justify-center rounded-full ${path === "/app/settings" ? "bg-lime text-ink" : "text-[#A1A5A0]"}`}>{ICONS.Settings}</Link>
      </nav>

      <ImportModal open={importOpen} onClose={() => setImportOpen(false)} />
      <UpgradeModal open={upgradeOpen} onClose={() => setUpgradeOpen(false)} />
    </div>
  );
}
