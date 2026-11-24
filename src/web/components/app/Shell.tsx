"use client";

import { asset } from "@/lib/asset";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useRef, useState, useSyncExternalStore } from "react";
import { user, notifications, clips } from "@/lib/mock";
import { IconButton } from "@/components/app/ui";
import { useSession, clearSession } from "@/lib/session";
import { useTheme, type Theme } from "@/lib/theme";
import { useRouter } from "next/navigation";
import ImportModal from "./ImportModal";
import UpgradeModal from "./UpgradeModal";

const ICONS: Record<string, React.ReactNode> = {
  Dashboard: <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.6"><rect x="2" y="2" width="6" height="6" rx="1.5"/><rect x="10" y="2" width="6" height="6" rx="1.5"/><rect x="2" y="10" width="6" height="6" rx="1.5"/><rect x="10" y="10" width="6" height="6" rx="1.5"/></svg>,
  Projects: <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.6"><rect x="2" y="2.5" width="14" height="12.5" rx="2"/><path d="M2 6.5h14M6 2.5v4"/></svg>,
  Library: <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.6"><rect x="2" y="3" width="14" height="12" rx="2"/><path d="M6 7.5 9 9.5l3-2V3"/></svg>,
  Editor: <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.6"><rect x="2" y="3" width="14" height="12" rx="2"/><path d="M7 6.5v5l4.5-2.5L7 6.5Z" fill="currentColor" stroke="none"/></svg>,
  Calendar: <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.6"><rect x="2" y="3" width="14" height="13" rx="2"/><path d="M2 7h14M6 1v4M12 1v4"/></svg>,
  Presets: <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M3 5h12M3 9h12M3 13h12"/><circle cx="7" cy="5" r="1.6" fill="currentColor"/><circle cx="12" cy="9" r="1.6" fill="currentColor"/><circle cx="5" cy="13" r="1.6" fill="currentColor"/></svg>,
  Notifications: <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M9 2a4.5 4.5 0 0 0-4.5 4.5V9L3 12h12l-1.5-3V6.5A4.5 4.5 0 0 0 9 2Z"/><path d="M7 14.5a2 2 0 0 0 4 0"/></svg>,
  Billing: <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.6"><rect x="2" y="4" width="14" height="11" rx="2"/><path d="M2 8h14"/></svg>,
  Settings: <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.6"><circle cx="9" cy="9" r="2.5"/><path d="M9 1.5v2M9 14.5v2M1.5 9h2M14.5 9h2M3.7 3.7l1.4 1.4M12.9 12.9l1.4 1.4M14.3 3.7l-1.4 1.4M5.1 12.9l-1.4 1.4"/></svg>,
};

const THEME_OPTS: { v: Theme; l: string; ic: React.ReactNode }[] = [
  { v: "light", l: "Light", ic: <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.4"><circle cx="6" cy="6" r="2.4"/><path d="M6 .8v1.4M6 9.8v1.4M.8 6h1.4M9.8 6h1.4M2.3 2.3l1 1M8.7 8.7l1 1M9.7 2.3l-1 1M3.3 8.7l-1 1"/></svg> },
  { v: "dark", l: "Dark", ic: <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.4"><path d="M10.2 7.4A4.6 4.6 0 0 1 4.6 1.8a4.6 4.6 0 1 0 5.6 5.6Z"/></svg> },
  { v: "system", l: "Auto", ic: <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.4"><rect x="1.6" y="2.2" width="8.8" height="6" rx="1"/><path d="M4.4 10h3.2"/></svg> },
];

const latestEdit = `/app/clips/${clips[0].id}/edit`;
const NAV = [
  { href: "/app", label: "Dashboard", exact: true },
  { href: "/app/projects", label: "Projects" },
  { href: "/app/library", label: "Library" },
  { href: latestEdit, label: "Editor", match: "/app/clips" },
  { href: "/app/calendar", label: "Calendar" },
  { href: "/app/presets", label: "Presets" },
];
const LOWER = [
  { href: "/app/notifications", label: "Notifications" },
  { href: "/app/billing", label: "Billing" },
  { href: "/app/settings", label: "Settings" },
];

const TITLES: [RegExp, string][] = [
  [/^\/app\/?$/, "Dashboard"],
  [/^\/app\/projects/, "Projects"],
  [/^\/app\/clips/, "Editor"],
  [/^\/app\/library/, "Library"],
  [/^\/app\/calendar/, "Calendar"],
  [/^\/app\/presets/, "Presets"],
  [/^\/app\/notifications/, "Notifications"],
  [/^\/app\/billing/, "Billing"],
  [/^\/app\/settings/, "Settings"],
  [/^\/app\/onboarding/, "Onboarding"],
];

const ITEM_H = 48;
const ITEM_GAP = 6;
const STRIDE = ITEM_H + ITEM_GAP;

export default function Shell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const path = pathname.replace(/\/+$/, "") || "/";
  const router = useRouter();
  const session = useSession();
  const displayName = session?.name ?? user.name;
  const initial = (displayName[0] ?? "A").toUpperCase();
  const title = TITLES.find(([re]) => re.test(path))?.[1] ?? "Kivlo";
  const [importOpen, setImportOpen] = useState(false);
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const [bellOpen, setBellOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [theme, setTheme] = useTheme();
  const [hover, setHover] = useState(false);
  const storedPinned = useSyncExternalStore(
    () => () => {},
    () => { try { return localStorage.getItem("kivlo.rail") === "1"; } catch { return false; } },
    () => false,
  );
  const [pinnedOverride, setPinnedOverride] = useState<boolean | null>(null);
  const pinned = pinnedOverride ?? storedPinned;
  const setPinned = (v: boolean) => { setPinnedOverride(v); try { localStorage.setItem("kivlo.rail", v ? "1" : "0"); } catch {} };
  const railRef = useRef<HTMLElement>(null);
  const expanded = pinned || hover;

  const isActive = (n: { href: string; label: string; exact?: boolean; match?: string }) => {
    const base = n.match ?? n.href;
    if (n.exact || base === "/app") return path === "/app";
    return path === base || path.startsWith(base + "/");
  };

  type NavItem = (typeof NAV)[number];
  const unread = notifications.filter((n) => !n.read).length;

  const railItem = (n: NavItem, i: number) => {
    const active = isActive(n);
    return (
      <Link
        key={n.label}
        href={n.href}
        aria-label={n.label}
        title={expanded ? undefined : n.label}
        aria-current={active ? "page" : undefined}
        className="relative flex h-12 items-center rounded-full outline-none focus-visible:ring-2 focus-visible:ring-lime"
        style={{ width: expanded ? "100%" : ITEM_H }}
      >
        <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full transition-colors ${active ? "bg-lime text-ink" : "text-[#A1A5A0] hover:text-white"}`}>
          {ICONS[n.label]}
          {n.label === "Notifications" && unread > 0 && (
            <span aria-hidden className="absolute right-2 top-2 h-2 w-2 rounded-full bg-lime ring-2 ring-fg" />
          )}
        </span>
        <span
          aria-hidden={!expanded}
          className={`overflow-hidden whitespace-nowrap text-sm font-medium transition-all duration-200 ${active ? "text-white" : "text-[#A1A5A0]"} ${expanded ? "ml-1 max-w-[130px] opacity-100" : "ml-0 max-w-0 opacity-0"}`}
          style={{ transitionDelay: expanded ? `${i * 30}ms` : "0ms" }}
        >
          {n.label}
        </span>
      </Link>
    );
  };

  return (
    <div className="min-h-screen bg-canvas text-fg">
      {/* floating ink pill rail — expands on hover/focus or when pinned */}
      <aside
        ref={railRef}
        aria-label="App"
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        onFocus={() => setHover(true)}
        onBlur={(e) => { if (!railRef.current?.contains(e.relatedTarget as Node)) setHover(false); }}
        onKeyDown={(e) => { if (e.key === "Escape" && !pinned) setHover(false); }}
        className={`fixed inset-y-4 left-3 z-40 hidden flex-col rounded-[32px] bg-ink py-5 shadow-xl dark:bg-[#202020] dark:ring-1 dark:ring-line transition-[width] duration-200 ease-out md:flex ${expanded ? "w-[220px]" : "w-[72px] items-center"}`}
      >
        <Link href="/app" aria-label="Kivlo dashboard" className={`mb-6 flex h-11 w-11 items-center justify-center ${expanded ? "ml-3" : ""}`}>
          <Image src={asset("/kivlo-mark-white.png")} alt="Kivlo" width={94} height={96} className="h-[26px] w-auto" />
        </Link>
        <button onClick={() => setImportOpen(true)} aria-label="New import" title="New import"
          className={`mb-5 flex h-11 items-center rounded-full bg-lime text-ink transition-transform hover:scale-105 ${expanded ? "mx-3 justify-start gap-2 px-4" : "w-11 justify-center"}`}>
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0"><path d="M9 3v12M3 9h12"/></svg>
          <span aria-hidden={!expanded} className={`overflow-hidden whitespace-nowrap text-sm font-semibold transition-all duration-200 ${expanded ? "max-w-[130px] opacity-100" : "max-w-0 opacity-0"}`}>New import</span>
        </button>
        <nav aria-label="Primary" className={`relative flex flex-col ${expanded ? "items-stretch px-3" : "items-center"}`} style={{ gap: ITEM_GAP }}>
          <span aria-hidden className="absolute -left-3 top-0 h-6 w-1 rounded-full bg-lime transition-all duration-200 ease-out"
            style={{ transform: `translateY(${NAV.findIndex(isActive) >= 0 ? NAV.findIndex(isActive) * STRIDE + 11 : 0}px)`, opacity: NAV.findIndex(isActive) >= 0 ? 1 : 0 }} />
          {NAV.map((n, i) => railItem(n, i))}
        </nav>
        <nav aria-label="Account" className={`relative mt-auto flex flex-col ${expanded ? "items-stretch px-3" : "items-center"}`} style={{ gap: ITEM_GAP }}>
          <span aria-hidden className="absolute -left-3 top-0 h-6 w-1 rounded-full bg-lime transition-all duration-200 ease-out"
            style={{ transform: `translateY(${LOWER.findIndex(isActive) >= 0 ? LOWER.findIndex(isActive) * STRIDE + 11 : 0}px)`, opacity: LOWER.findIndex(isActive) >= 0 ? 1 : 0 }} />
          {LOWER.map((n, i) => railItem(n, NAV.length + i))}
        </nav>
        <button
          onClick={() => setPinned(!pinned)}
          aria-label={pinned ? "Unpin sidebar" : "Pin sidebar open"}
          aria-pressed={pinned}
          title={pinned ? "Unpin sidebar" : "Pin sidebar open"}
          className={`mt-3 flex h-9 items-center gap-2 rounded-full text-[#A1A5A0] transition-colors hover:text-white ${expanded ? "mx-3 px-3" : "w-9 justify-center"}`}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" className={`shrink-0 transition-transform duration-200 ${pinned ? "" : "rotate-180"}`}><path d="M8.5 3 4.5 7l4 4"/></svg>
          <span aria-hidden={!expanded} className={`overflow-hidden whitespace-nowrap text-xs transition-all duration-200 ${expanded ? "max-w-[130px] opacity-100" : "max-w-0 opacity-0"}`}>{pinned ? "Unpin" : "Pin open"}</span>
        </button>
      </aside>

      <div className="md:pl-[88px]">
        <header className="sticky top-0 z-30 flex items-center gap-3 px-4 py-4 md:px-7">
          <h1 className="sr-only">{title}</h1>
          <div className="relative">
            <button onClick={() => setMenuOpen(!menuOpen)} aria-expanded={menuOpen}
              className="flex items-center gap-2 rounded-full bg-surface p-1.5 pr-1.5 shadow-sm ring-1 ring-line hover:shadow">
              <span aria-hidden="true" className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-ink font-heading text-xs font-bold text-lime">
                {session?.picture ? <Image src={session.picture} alt="" width={32} height={32} unoptimized className="h-full w-full object-cover" /> : initial}
              </span>
              <span className="hidden pr-1 text-sm font-medium sm:block">{displayName}</span><span className="sr-only">{displayName} profile menu</span>
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-lime text-ink">
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M3 4.5 6 7.5 9 4.5"/></svg>
              </span>
            </button>
            {menuOpen && (
              <div className="absolute left-0 mt-2 w-56 rounded-2xl bg-surface p-3 shadow-lg ring-1 ring-line">
                <p className="px-2 text-sm font-medium">{displayName} · <span className="capitalize text-slate">{user.plan}</span></p>
                <p className="px-2 font-mono text-xs text-slate">{user.creditsTotal - user.creditsUsed} credits left</p>
                <div role="group" aria-label="Theme" className="mt-2 flex rounded-full bg-surface-2 p-1">
                  {THEME_OPTS.map(({ v, l, ic }) => (
                    <button key={v} onClick={() => setTheme(v)} aria-pressed={theme === v}
                      className={`flex flex-1 items-center justify-center gap-1 rounded-full py-1.5 text-[11px] font-medium transition-colors ${theme === v ? "bg-surface text-fg shadow-sm" : "text-slate hover:text-fg"}`}>
                      {ic}{l}
                    </button>
                  ))}
                </div>
                <button onClick={() => { setMenuOpen(false); setUpgradeOpen(true); }} className="mt-2 w-full rounded-full bg-lime py-2 text-sm font-semibold text-ink">Upgrade</button>
                {session && (
                  <button onClick={() => { clearSession(); router.push("/"); }} className="mt-1.5 w-full rounded-full bg-surface-2/60 py-2 text-sm font-medium text-slate hover:text-fg">Sign out</button>
                )}
              </div>
            )}
          </div>
          <div className="ml-auto flex items-center gap-2">
            <IconButton label="Search" className="h-10 w-10 bg-surface shadow-sm ring-1 ring-line hover:shadow [&>svg]:h-4 [&>svg]:w-4">
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6"><circle cx="7" cy="7" r="4.5"/><path d="m10.5 10.5 3 3"/></svg>
            </IconButton>
            <div className="relative">
              <button aria-label="Notifications" aria-expanded={bellOpen} onClick={() => setBellOpen(!bellOpen)}
                className="relative grid h-10 w-10 place-items-center rounded-full bg-surface shadow-sm ring-1 ring-line hover:shadow [&>svg]:h-4 [&>svg]:w-4 [&>svg]:translate-y-[-0.5px]">
                <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M8 2a4 4 0 0 0-4 4v2.5L2.8 11h10.4L12 8.5V6a4 4 0 0 0-4-4Z"/><path d="M6.5 13a1.5 1.5 0 0 0 3 0"/></svg>
                {unread > 0 && <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-lime ring-2 ring-white" />}
              </button>
              {bellOpen && (
                <div className="absolute right-0 mt-2 w-80 rounded-2xl bg-surface p-2 shadow-lg ring-1 ring-line">
                  {notifications.slice(0, 4).map((n) => (
                    <div key={n.id} className="rounded-xl px-3 py-2 text-sm hover:bg-canvas">
                      <p className="text-fg">{n.text}</p>
                      <p className="mt-0.5 text-xs text-slate">{n.time}</p>
                    </div>
                  ))}
                  <Link href="/app/notifications" onClick={() => setBellOpen(false)} className="mt-1 block rounded-xl px-3 py-2 text-center text-sm font-medium text-lime-deep hover:bg-canvas">See all</Link>
                </div>
              )}
            </div>
          </div>
        </header>
        <main className="px-4 pb-28 pt-2 md:px-7 md:pb-8">{children}</main>
      </div>

      {/* mobile bottom tab bar with raised center + */}
      <nav aria-label="Primary" className="fixed inset-x-3 bottom-3 z-40 flex items-center justify-around rounded-[28px] bg-ink py-2.5 shadow-xl dark:bg-[#202020] dark:ring-1 dark:ring-line md:hidden">
        {[NAV[0], NAV[1]].map((n) => (
          <Link key={n.href} href={n.href} aria-label={n.label} className={`flex h-10 w-10 items-center justify-center rounded-full ${isActive(n) ? "bg-lime text-ink" : "text-[#A1A5A0]"}`}>{ICONS[n.label]}</Link>
        ))}
        <button onClick={() => setImportOpen(true)} aria-label="New import"
          className="-mt-7 flex h-14 w-14 items-center justify-center rounded-full bg-lime text-ink shadow-lg ring-4 ring-paper">
          <svg width="20" height="20" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 3v12M3 9h12"/></svg>
        </button>
        <Link href="/app/calendar" aria-label="Calendar" className={`flex h-10 w-10 items-center justify-center rounded-full ${isActive({ href: "/app/calendar", label: "Calendar" }) ? "bg-lime text-ink" : "text-[#A1A5A0]"}`}>{ICONS.Calendar}</Link>
        <Link href="/app/settings" aria-label="Settings" className={`flex h-10 w-10 items-center justify-center rounded-full ${isActive({ href: "/app/settings", label: "Settings" }) ? "bg-lime text-ink" : "text-[#A1A5A0]"}`}>{ICONS.Settings}</Link>
      </nav>

      <ImportModal open={importOpen} onClose={() => setImportOpen(false)} />
      <UpgradeModal open={upgradeOpen} onClose={() => setUpgradeOpen(false)} />
    </div>
  );
}
