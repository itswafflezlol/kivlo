"use client";

import Link from "next/link";
import Image from "next/image";
import { Suspense, useState, useSyncExternalStore } from "react";
import { useSearchParams } from "next/navigation";
import { user, projects, clips, scheduledPosts, clipById } from "@/lib/mock";
import { PlatformGlyph, fmtLen, fmtTime, statusChip } from "@/components/app/ui";
import ImportModal from "@/components/app/ImportModal";

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

const METRICS: [string, string, string, string][] = [
  ["Clips this week", "7", "+3 vs last week", "#BDEF72"],
  ["Source hours", "4.2h", "3 credits used", "#BAAEF0"],
  ["Avg score", "86", "Top 10%", "#F5A524"],
  ["Scheduled", "5", "Next: Sat 18:00", "#7BC8E4"],
];

function Dash() {
  const sp = useSearchParams();
  const state = sp.get("state");
  const empty = state === "empty";
  const low = state === "low" || user.creditsTotal - user.creditsUsed < 5;
  const [importOpen, setImportOpen] = useState(false);
  const left = user.creditsTotal - user.creditsUsed;
  const usedPct = user.creditsUsed / user.creditsTotal;
  const noop = () => () => {};
  const greet = useSyncExternalStore(noop, () => {
    const h = new Date().getHours();
    return h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening";
  }, () => "Good day");
  const today = useSyncExternalStore(noop, () => new Date().getDay(), () => -1);
  const upcoming = scheduledPosts.filter((s) => s.status !== "posted" && s.status !== "failed");
  const mix: [string, number][] = [["TikTok", 3], ["Shorts", 2], ["Reels", 2], ["X", 1]];
  const mixMax = Math.max(...mix.map((m) => m[1]));
  const weekBars = [2, 1, 0, 3, 1, 4, 0];
  const days = ["S", "M", "T", "W", "T", "F", "S"];

  const pasteBar = (
    <form className="flex w-full items-center gap-2 rounded-full bg-white p-1.5 shadow-sm ring-1 ring-black/5"
      onSubmit={(e) => { e.preventDefault(); setImportOpen(true); }}>
      <label htmlFor="dash-link" className="sr-only">Video link</label>
      <input id="dash-link" type="url" placeholder="Paste a video link"
        className="min-w-0 flex-1 rounded-full bg-transparent px-4 py-2.5 text-sm placeholder:text-slate focus:outline-none" />
      <button type="submit" className="shrink-0 rounded-full bg-lime px-5 py-2.5 text-sm font-semibold text-ink hover:bg-lime-hover">Find highlights</button>
    </form>
  );

  if (empty) {
    return (
      <div className="mx-auto mt-24 max-w-xl text-center">
        <h2 className="font-heading text-3xl font-bold">No clips yet.</h2>
        <p className="mt-3 text-slate">Import a VOD to find your first highlight.</p>
        <div className="mt-6">{pasteBar}</div>
        <ImportModal open={importOpen} onClose={() => setImportOpen(false)} />
      </div>
    );
  }

  const cardSkin = ["bg-lime text-ink", "bg-white text-ink ring-1 ring-black/5", "bg-ink text-[#F2F2F0]"];

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
      <div className="min-w-0 space-y-8">
        {/* greeting */}
        <div>
          <p className="text-sm text-slate">{greet}!</p>
          <h2 className="font-heading text-3xl font-bold tracking-tight">{user.name}</h2>
          <div className="mt-4 max-w-xl">{pasteBar}</div>
        </div>

        {/* overview: ink hero card + metric tiles */}
        <section aria-labelledby="ov">
          <div className="mb-3 flex items-center justify-between">
            <h3 id="ov" className="font-heading text-xl font-bold">Overview</h3>
            <button className="flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-xs font-medium shadow-sm ring-1 ring-black/5">
              This week
              <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M3 4.5 6 7.5 9 4.5"/></svg>
            </button>
          </div>
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
            <div className="rounded-[28px] bg-ink p-6 text-[#F2F2F0]">
              <p className="text-sm text-[#A1A5A0]">You’ve clipped 14 moments this week, keep it up!</p>
              <p className="mt-1 font-heading text-4xl font-bold">{left} <span className="text-xl font-medium text-[#A1A5A0]">credits left</span></p>
              {low && <p className="mt-2 inline-block rounded-full bg-heat/15 px-3 py-1 text-xs text-heat">Running low — upgrade for more.</p>}
              <div className="mt-5 flex justify-between gap-2 px-1">
                <Ring value={usedPct} color="#BDEF72" label="Credits used" />
                <Ring value={0.62} color="#F5A524" label="Clips posted" />
                <Ring value={0.86} color="#BAAEF0" label="Avg score" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {METRICS.map(([l, v, sub, dot]) => (
                <div key={l} className="flex flex-col justify-between rounded-[24px] bg-white p-4 shadow-sm ring-1 ring-black/5">
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
        <section className="rounded-[24px] bg-white p-5 shadow-sm ring-1 ring-black/5" aria-labelledby="wk">
          <div className="mb-4 flex items-center justify-between">
            <h3 id="wk" className="text-sm font-semibold">Clips per day</h3>
            <p className="text-xs text-slate">This week</p>
          </div>
          <div className="flex h-40 items-end justify-between gap-3">
            {weekBars.map((v, i) => (
              <div key={i} className="flex flex-1 flex-col items-center gap-2">
                <span className="font-mono text-[11px] text-ink/70">{v || ""}</span>
                <div className="relative flex h-28 w-8 items-end overflow-hidden rounded-full">
                  <div className="absolute inset-0 rounded-full" style={{ background: "repeating-linear-gradient(135deg, rgba(24,24,24,0.05) 0 2px, transparent 2px 8px), #F1F4EA" }} />
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
            <Link href="/app/library" className="text-xs font-medium text-slate hover:text-ink">See all</Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {projects.slice(0, 3).map((p, i) => {
              const cs = clips.filter((c) => p.clipIds.includes(c.id)).slice(0, 3);
              return (
                <Link key={p.id} href={`/app/projects/${p.id}`}
                  className={`group relative flex h-56 flex-col justify-between overflow-hidden rounded-[24px] p-5 transition-transform hover:-translate-y-0.5 ${cardSkin[i % 3]}`}>
                  <div>
                    <div className="flex items-center justify-between">
                      <PlatformGlyph p={p.platform} size={20} />
                      <span className={`rounded-full px-2.5 py-1 text-[11px] font-medium capitalize ${p.status === "processing" ? "bg-black/10" : "bg-black/10"}`}>
                        {p.status === "processing" && <span className="mr-1.5 inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-current align-middle" />}
                        {p.status}
                      </span>
                    </div>
                    <h4 className="mt-3 font-heading text-lg font-bold leading-snug">{p.title}</h4>
                    <p className={`mt-1 text-xs ${i === 2 ? "text-[#A1A5A0]" : "text-ink/70"}`}>{p.clipIds.length} clips · {fmtLen(p.sourceLength)}</p>
                  </div>
                  <div className="flex items-end justify-between">
                    <span className={`flex h-11 w-11 items-center justify-center rounded-full transition-transform group-hover:scale-105 ${i === 1 ? "bg-ink text-white" : "bg-white/90 text-ink shadow-sm"}`} aria-hidden="true">
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
            <span key={i} className={`flex-1 rounded-full py-1.5 text-center text-xs ${i === today ? "bg-lime font-bold text-ink" : "bg-white text-slate ring-1 ring-black/5"}`}>{d}</span>
          ))}
        </div>
        <div className="rounded-[24px] bg-white p-5 shadow-sm ring-1 ring-black/5">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-heading text-xl font-bold">Up next</h3>
            <button className="flex items-center gap-1 rounded-full bg-paper px-3 py-1.5 text-xs font-medium">
              Sat, 28 Nov
              <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M3 4.5 6 7.5 9 4.5"/></svg>
            </button>
          </div>
          <div className="space-y-2">
            {upcoming.slice(0, 4).map((s) => {
              const c = clipById(s.clipId)!;
              return (
                <div key={s.id} className="flex items-center gap-3 rounded-2xl bg-paper/60 p-2.5">
                  <span className="flex -space-x-3">
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
          </div>
          <button className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-black/10 py-2.5 text-sm text-slate hover:text-ink">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-ink text-white"><svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 2v8M2 6h8"/></svg></span>
            Schedule a post
          </button>
          <div className="mt-6">
            <p className="mb-3 text-sm font-semibold">Platform mix</p>
            <div className="space-y-2.5">
              {mix.map(([n, v]) => (
                <div key={n} className="flex items-center gap-3">
                  <span className="w-12 text-xs text-slate">{n}</span>
                  <div className="h-3.5 flex-1 overflow-hidden rounded-full bg-mist/50">
                    <div className="h-full rounded-full bg-ink" style={{ width: `${(v / mixMax) * 100}%` }} />
                  </div>
                  <span className="w-4 text-right font-mono text-xs">{v}</span>
                </div>
              ))}
            </div>
          </div>
          <Link href="/app/calendar" className="mt-5 block text-center text-xs font-medium text-slate hover:text-ink">Open calendar</Link>
        </div>
      </aside>
      <ImportModal open={importOpen} onClose={() => setImportOpen(false)} />
    </div>
  );
}

export default function Page() {
  return <Suspense><Dash /></Suspense>;
}
