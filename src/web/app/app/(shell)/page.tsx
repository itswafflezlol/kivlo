"use client";

import Link from "next/link";
import Image from "next/image";
import { Suspense, useEffect, useState, useSyncExternalStore } from "react";
import { useSearchParams } from "next/navigation";
import { user, clips, clipById, WEEK_START_ISO, type Project } from "@/lib/mock";
import { useLocalData } from "@/lib/localStore";
import { apiEnabled, getMe, getProjects, type Me, type ApiProject } from "@/lib/data";
import { useSession } from "@/lib/session";
import { PlatformGlyph, Select, fmtLen, fmtTime, statusChip } from "@/components/app/ui";
import ImportModal from "@/components/app/ImportModal";
import { parseVideoLink } from "@/lib/linkParse";

function Ring({ value, color, label }: { value: number; color: string; label: string }) {
  const r = 26;
  const c = 2 * Math.PI * r;
  return (
    <div className="flex flex-col items-center gap-1.5">
      <svg width="64" height="64" viewBox="0 0 64 64">
        <circle cx="32" cy="32" r={r} fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="5" />
        <circle cx="32" cy="32" r={r} fill="none" stroke={color} strokeWidth="5" strokeLinecap="round"
          strokeDasharray={c} strokeDashoffset={c * (1 - Math.min(1, value))} transform="rotate(-90 32 32)" />
        <text x="32" y="36" textAnchor="middle" fill="#F2F2F0" fontSize="13" fontFamily="var(--font-jetbrains)">{Math.round(value * 100)}%</text>
      </svg>
      <p className="text-[11px] text-[#A1A5A0]">{label}</p>
    </div>
  );
}

type Range = "week" | "month" | "all";
const RANGE_OPTS = [
  { value: "week", label: "This week" },
  { value: "month", label: "This month" },
  { value: "all", label: "All time" },
];
const RANGE_LABEL: Record<Range, string> = { week: "this week", month: "this month", all: "so far" };
// demo "today" is Monday 23 Nov 2026 — the current week/month derives from it
const WEEK_DAYS = Array.from({ length: 7 }, (_, i) => {
  const d = new Date(WEEK_START_ISO + "T00:00:00");
  d.setDate(d.getDate() + i);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
});
const MONTH_PREFIX = WEEK_START_ISO.slice(0, 7); // "2026-11"

function inRange(iso: string, range: Range) {
  const day = iso.slice(0, 10);
  if (range === "all") return true;
  if (range === "month") return day.startsWith(MONTH_PREFIX);
  return WEEK_DAYS.includes(day);
}

const cardSkin = ["bg-lime text-ink", "bg-surface text-fg ring-1 ring-line", "bg-ink text-[#F2F2F0] dark:bg-[#202020] dark:ring-1 dark:ring-line"];

function Dash() {
  const sp = useSearchParams();
  const state = sp.get("state");
  const emptyParam = state === "empty";
  const low = state === "low";
  const session = useSession();
  const displayName = session?.name.split(" ")[0] ?? user.name;
  const urlParam = sp.get("url");
  const [importOpen, setImportOpen] = useState(!!urlParam);
  const [modalUrl, setModalUrl] = useState(urlParam ?? "");
  const [link, setLink] = useState("");
  const [linkErr, setLinkErr] = useState("");
  const [range, setRange] = useState<Range>("week");
  const [me, setMe] = useState<Me | null>(null);
  const [plist, setPlist] = useState<(Project | ApiProject)[] | null>(apiEnabled ? null : []);
  const local = useLocalData();
  useEffect(() => {
    if (!apiEnabled) return;
    let on = true;
    getMe().then((m) => on && setMe(m)).catch(() => {});
    getProjects().then((l) => on && setPlist(l)).catch(() => on && setPlist([]));
    return () => { on = false; };
  }, []);
  const used = me?.credits.used ?? local.creditsUsed;
  const total = me?.credits.total ?? user.creditsTotal;
  const left = me?.credits.left ?? total - used;
  const usedPct = total ? used / total : 0;
  const noop = () => () => {};
  const greet = useSyncExternalStore(noop, () => {
    const h = new Date().getHours();
    return h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening";
  }, () => "Good day");
  const today = useSyncExternalStore(noop, () => new Date().getDay(), () => -1);

  const view = apiEnabled ? (plist ?? []) : local.projects;
  const noProjects = !apiEnabled ? local.projects.length === 0 : plist !== null && plist.length === 0;
  const localClips = clips.filter((c) => local.clipIds.has(c.id));
  const rangeProjects = local.projects.filter((p) => inRange(p.createdAt, range));
  const rangeClipIds = new Set(rangeProjects.flatMap((p) => p.clipIds));
  const rangeClips = clips.filter((c) => rangeClipIds.has(c.id));
  const posts = local.posts;
  const upcoming = posts.filter((s) => s.status !== "posted" && s.status !== "failed").sort((a, b) => a.time.localeCompare(b.time));
  const rangePosts = posts.filter((p) => inRange(p.time, range));
  const sourceHours = rangeProjects.reduce((a, p) => a + p.sourceLength, 0) / 3600;
  const avgScore = rangeClips.length ? Math.round(rangeClips.reduce((a, c) => a + c.score, 0) / rangeClips.length) : 0;
  const postedPct = posts.length ? posts.filter((p) => p.status === "posted").length / posts.length : 0;
  const metrics: [string, string, string, string][] = [
    [`Clips ${RANGE_LABEL[range]}`, String(rangeClips.length), `${localClips.length} total`, "#BDEF72"],
    ["Source hours", `${sourceHours.toFixed(1)}h`, `${used} credits used`, "#BAAEF0"],
    ["Avg score", rangeClips.length ? String(avgScore) : "—", rangeClips.length ? `of ${rangeClips.length} clips` : "No clips yet", "#F5A524"],
    ["Scheduled", String(rangePosts.length), upcoming[0] ? `Next: ${fmtTime(upcoming[0].time)}` : "Nothing queued", "#7BC8E4"],
  ];
  const platCounts = upcoming.reduce<Record<string, number>>((a, p) => ((a[p.platform] = (a[p.platform] ?? 0) + 1), a), {});
  const mix = (["tiktok", "shorts", "reels", "x"] as const).map((p) => [p, platCounts[p] ?? 0] as [string, number]).filter(([, v]) => v > 0);
  const mixMax = Math.max(1, ...mix.map((m) => m[1]));
  const weekBars = WEEK_DAYS.map((d) => posts.filter((p) => p.time.slice(0, 10) === d).length);
  const days = ["S", "M", "T", "W", "T", "F", "S"];

  const pasteBar = (
    <div>
      <form className="flex w-full items-center gap-2 rounded-full bg-surface p-1.5 shadow-sm ring-1 ring-line"
        onSubmit={(e) => {
          e.preventDefault();
          const raw = link.trim();
          if (!raw) { setImportOpen(true); return; }
          const p = parseVideoLink(raw);
          if (!p.ok) { setLinkErr(p.message); return; }
          setModalUrl(p.url);
          setImportOpen(true);
        }}>
        <label htmlFor="dash-link" className="sr-only">Video link</label>
        <input id="dash-link" type="url" placeholder="Paste a video link" value={link}
          onChange={(e) => { setLink(e.target.value); setLinkErr(""); }}
          className="min-w-0 flex-1 rounded-full bg-transparent px-4 py-2.5 text-sm placeholder:text-slate focus:outline-none" />
        <button type="submit" className="shrink-0 rounded-full bg-lime px-5 py-2.5 text-sm font-semibold text-ink hover:bg-lime-hover">Find highlights</button>
      </form>
      {linkErr && <p role="alert" className="mt-2 text-sm font-medium text-error">{linkErr}</p>}
    </div>
  );

  if (emptyParam || noProjects) {
    return (
      <div className="mx-auto mt-24 max-w-xl text-center">
        <h2 className="font-heading text-3xl font-bold">No clips yet.</h2>
        <p className="mt-3 text-slate">Import a VOD to find your first highlight.</p>
        <div className="mt-6">{pasteBar}</div>
        <ImportModal key={modalUrl} open={importOpen} onClose={() => setImportOpen(false)} initialUrl={modalUrl} />
      </div>
    );
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
      <div className="min-w-0 space-y-8">
        {/* greeting */}
        <div>
          <p className="text-sm text-slate">{greet}!</p>
          <h2 className="font-heading text-3xl font-bold tracking-tight">{displayName}</h2>
          <div className="mt-4 max-w-xl">{pasteBar}</div>
        </div>

        {/* overview: ink hero card + metric tiles */}
        <section aria-labelledby="ov">
          <div className="mb-3 flex items-center justify-between">
            <h3 id="ov" className="font-heading text-xl font-bold">Overview</h3>
            <Select label="Stats range" value={range} onChange={(v) => setRange(v as Range)} options={RANGE_OPTS} className="w-36" />
          </div>
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
            <div className="rounded-[28px] bg-ink p-6 text-[#F2F2F0] dark:bg-[#202020] dark:ring-1 dark:ring-line">
              <p className="text-sm text-[#A1A5A0]">You’ve clipped {rangeClips.length} moment{rangeClips.length === 1 ? "" : "s"} {RANGE_LABEL[range]}, keep it up!</p>
              <p className="mt-1 font-heading text-4xl font-bold">{left} <span className="text-xl font-medium text-[#A1A5A0]">credits left</span></p>
              {(low || left < 5) && <p className="mt-2 inline-block rounded-full bg-heat/15 px-3 py-1 text-xs text-heat">Running low — upgrade for more.</p>}
              <div className="mt-5 flex justify-between gap-2 px-1">
                <Ring value={usedPct} color="#BDEF72" label="Credits used" />
                <Ring value={postedPct} color="#F5A524" label="Clips posted" />
                <Ring value={avgScore / 100} color="#BAAEF0" label="Avg score" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {metrics.map(([l, v, sub, dot]) => (
                <div key={l} className="flex flex-col justify-between rounded-[24px] bg-surface p-4 shadow-sm ring-1 ring-line">
                  <div className="flex items-start justify-between">
                    <p className="text-xs text-slate">{l}</p>
                    <span className="h-2.5 w-2.5 rounded-full" style={{ background: dot }} />
                  </div>
                  <div>
                    <p className="font-mono text-2xl font-medium">{v}</p>
                    <p className="text-[11px] text-slate">{sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* weekly bar chart */}
        <section className="rounded-[24px] bg-surface p-5 shadow-sm ring-1 ring-line" aria-labelledby="wk">
          <div className="mb-4 flex items-center justify-between">
            <h3 id="wk" className="text-sm font-semibold">Scheduled posts per day</h3>
            <p className="text-xs text-slate">This week</p>
          </div>
          <div className="flex h-40 items-end justify-between gap-3">
            {weekBars.map((v, i) => (
              <div key={i} className="flex flex-1 flex-col items-center gap-2">
                <span className="font-mono text-[11px] text-fg/70">{v || ""}</span>
                <div className="relative flex h-28 w-8 items-end overflow-hidden rounded-full">
                  <div className="absolute inset-0 rounded-full" style={{ background: "repeating-linear-gradient(135deg, var(--hatch-line) 0 2px, transparent 2px 8px), var(--hatch-a)" }} />
                  <div className={`relative w-full rounded-full ${i === today ? "bg-lime" : "bg-[#CBF590]"}`} style={{ height: `${Math.min(100, v * 22)}%` }} />
                </div>
                <span className={`text-[11px] ${i === today ? "font-bold" : "text-slate"}`}>{days[i]}</span>
              </div>
            ))}
          </div>
        </section>

        {/* recent projects: feature cards */}
        <section aria-labelledby="rp">
          <div className="mb-3 flex items-center justify-between">
            <h3 id="rp" className="font-heading text-xl font-bold">Recent projects</h3>
            <Link href="/app/projects" className="text-xs font-medium text-slate hover:text-fg">See all</Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {plist === null && apiEnabled && [0, 1, 2].map((i) => (
              <div key={i} className="h-56 animate-pulse rounded-[24px] bg-surface ring-1 ring-line" />
            ))}
            {view.slice(0, 3).map((p, i) => {
              const isApi = !("clipIds" in p);
              const cs = isApi ? [] : clips.filter((c) => (p as Project).clipIds.includes(c.id)).slice(0, 3);
              const title = p.title ?? "New import";
              const meta = isApi
                ? ((p as ApiProject).durationSec ? fmtLen((p as ApiProject).durationSec!) : "Importing…")
                : `${(p as Project).clipIds.length} clips · ${fmtLen((p as Project).sourceLength)}`;
              return (
                <Link key={p.id} href={`/app/projects/${p.id}`}
                  className={`group relative flex h-56 flex-col justify-between overflow-hidden rounded-[24px] p-5 transition-transform hover:-translate-y-0.5 ${cardSkin[i % 3]}`}>
                  <div>
                    <div className="flex items-center justify-between">
                      <PlatformGlyph p={p.platform} size={20} />
                      <span className="rounded-full bg-line-2 px-2.5 py-1 text-[11px] font-medium capitalize">
                        {p.status === "processing" && <span className="mr-1.5 inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-current align-middle" />}
                        {p.status}
                      </span>
                    </div>
                    <h4 className="mt-3 font-heading text-lg font-bold leading-snug">{title}</h4>
                    <p className={`mt-1 text-xs ${i === 0 ? "text-ink/70" : i === 2 ? "text-[#A1A5A0]" : "text-fg/70"}`}>{meta}</p>
                  </div>
                  <div className="flex items-end justify-between">
                    <span className={`flex h-11 w-11 items-center justify-center rounded-full transition-transform group-hover:scale-105 ${i === 1 ? "bg-fg text-canvas" : "bg-surface/90 text-fg shadow-sm"}`} aria-hidden="true">
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.7"><path d="M3 8h10M9 4l4 4-4 4"/></svg>
                    </span>
                    <span className="flex -space-x-4">
                      {cs.map((c, j) => (
                        <Image key={c.id} src={c.poster} alt="" width={404} height={720} className="h-auto w-11 rounded-xl object-cover shadow-md ring-2 ring-white/60" style={{ transform: `rotate(${(j - 1) * 8}deg) translateY(${Math.abs(j - 1) * 4}px)`, zIndex: 3 - j }} />
                      ))}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      </div>

      {/* right column: Up next */}
      <aside className="min-w-0" aria-label="Up next">
        {/* mobile week strip */}
        <div className="mb-4 flex gap-2 md:hidden">
          {days.map((d, i) => (
            <span key={i} className={`flex-1 rounded-full py-1.5 text-center text-xs ${i === today ? "bg-lime font-bold text-ink" : "bg-surface text-slate ring-1 ring-line"}`}>{d}</span>
          ))}
        </div>
        <div className="rounded-[24px] bg-surface p-5 shadow-sm ring-1 ring-line">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-heading text-xl font-bold">Up next</h3>
          </div>
          <div className="space-y-2">
            {upcoming.slice(0, 4).map((s) => {
              const c = clipById(s.clipId);
              if (!c) return null;
              return (
                <div key={s.id} className="flex items-center gap-3 rounded-2xl bg-canvas/60 p-2.5">
                  <span className="flex -space-x-3 overflow-hidden rounded-lg">
                    <Image src={c.poster} alt="" width={404} height={720} className="h-auto w-[30px] rounded-lg object-cover ring-2 ring-white" />
                    <Image src={c.poster} alt="" width={404} height={720} className="h-auto w-[30px] rounded-lg object-cover ring-2 ring-white" style={{ transform: "rotate(6deg)" }} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{c.title}</p>
                    <p className="font-mono text-[11px] text-slate">{fmtTime(s.time)}</p>
                  </div>
                  <PlatformGlyph p={s.platform} size={18} />
                  <span className={`h-2 w-2 shrink-0 rounded-full ${statusChip[s.status]?.includes("heat") ? "bg-heat" : statusChip[s.status]?.includes("lilac") ? "bg-lilac-deep" : "bg-lime"}`} title={s.status} />
                </div>
              );
            })}
            {!upcoming.length && <p className="py-2 text-sm text-slate">Nothing scheduled yet.</p>}
          </div>
          <Link href="/app/calendar" className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-line-2 py-2.5 text-sm text-slate hover:text-fg">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-fg text-canvas"><svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 2v8M2 6h8"/></svg></span>
            Schedule a post
          </Link>
          {mix.length > 0 && (
            <div className="mt-6">
              <p className="mb-3 text-sm font-semibold">Platform mix</p>
              <div className="space-y-2.5">
                {mix.map(([n, v]) => (
                  <div key={n} className="flex items-center gap-3">
                    <span className="w-12 text-xs capitalize text-slate">{n}</span>
                    <div className="h-3.5 flex-1 overflow-hidden rounded-full bg-surface-2/50">
                      <div className="h-full rounded-full bg-fg" style={{ width: `${(v / mixMax) * 100}%` }} />
                    </div>
                    <span className="w-4 text-right font-mono text-xs">{v}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          <Link href="/app/calendar" className="mt-5 block text-center text-xs font-medium text-slate hover:text-fg">Open calendar</Link>
        </div>
      </aside>
      <ImportModal key={modalUrl} open={importOpen} onClose={() => setImportOpen(false)} initialUrl={modalUrl} />
    </div>
  );
}

export default function Page() {
  return <Suspense><Dash /></Suspense>;
}
