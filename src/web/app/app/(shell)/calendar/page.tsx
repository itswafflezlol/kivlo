"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useSyncExternalStore } from "react";
import { scheduledPosts as seed, clips, clipById, WEEK_START_ISO, type ScheduledPost, type PostPlatform } from "@/lib/mock";
import { PlatformGlyph, Modal, ScoreBadge, IconButton } from "@/components/app/ui";

const PLATS: PostPlatform[] = ["tiktok", "shorts", "reels", "x"];
const HOURS = Array.from({ length: 16 }, (_, i) => i + 8); // 8am–11pm
const WEEK = Array.from({ length: 7 }, (_, i) => {
  const d = new Date(WEEK_START_ISO + "T00:00:00");
  d.setDate(d.getDate() + i);
  return d.toISOString().slice(0, 10);
});
const TODAY = WEEK[0]; // Monday 23 Nov 2026
const DAY_NAMES = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
// best-time heat: 0..1 per hour, evenings hottest
const HEAT: Record<number, number> = { 9: 0.3, 11: 0.5, 12: 0.6, 15: 0.5, 17: 0.7, 18: 0.9, 19: 1, 20: 0.9, 21: 0.7 };
const SUGGESTED: [number, number][] = [[1, 19], [3, 18], [5, 20]]; // [dayIdx, hour]
const MONTH_DAYS = Array.from({ length: 30 }, (_, i) => i + 1);
const MONTH_OFFSET = 6; // Nov 1 2026 = Sunday → 6 leading cells in a Mon-first grid
const NOW = new Date();
const noop = () => () => {};

const STATUS_DOT: Record<string, string> = {
  scheduled: "bg-lime-deep", reminder: "bg-[#F5A524]", posted: "bg-slate", failed: "bg-[#B3261E]",
};

export default function Calendar() {
  const [posts, setPosts] = useState<ScheduledPost[]>(seed);
  const [view, setView] = useState<"day" | "week" | "month">("week");
  const [platFilter, setPlatFilter] = useState<PostPlatform[]>(PLATS);
  const [sel, setSel] = useState<ScheduledPost | null>(null);
  const [sched, setSched] = useState<string | null>(null); // clipId being scheduled
  const now = useSyncExternalStore(noop, () => NOW, () => null);

  const visible = posts.filter((p) => platFilter.includes(p.platform));
  const inWeek = (iso: string) => WEEK.includes(iso.slice(0, 10));
  const dayOf = (iso: string) => WEEK.indexOf(iso.slice(0, 10));
  const hourOf = (iso: string) => new Date(iso).getHours() + new Date(iso).getMinutes() / 60;

  const weekPosts = visible.filter((p) => inWeek(p.time));
  const reminders = posts.filter((p) => p.status === "reminder").length;
  const upcomingIds = new Set(posts.filter((p) => p.status === "scheduled" || p.status === "reminder").map((p) => p.clipId));
  const unscheduled = clips.filter((c) => !upcomingIds.has(c.id) && c.projectId !== "new-demo");
  const nextPost = posts.filter((p) => p.status === "scheduled").sort((a, b) => a.time.localeCompare(b.time))[0];
  const perPlat = PLATS.map((p) => weekPosts.filter((x) => x.platform === p).length);
  const counts = (st: string) => posts.filter((p) => p.status === st).length;

  const dayLabel = (iso: string) => {
    const d = new Date(iso);
    return `${DAY_NAMES[(d.getDay() + 6) % 7]} ${String(d.getHours() % 12 || 12)}:${String(d.getMinutes()).padStart(2, "0")} ${d.getHours() < 12 ? "AM" : "PM"}`;
  };

  const PostCard = ({ p }: { p: ScheduledPost }) => {
    const c = clipById(p.clipId);
    if (!c) return null;
    return (
      <button onClick={() => setSel(p)}
        className={`absolute left-0.5 right-0.5 z-10 flex items-center gap-1 overflow-hidden rounded-lg bg-surface p-1 text-left shadow ring-1 ring-line transition-transform hover:scale-[1.03] ${p.status === "failed" ? "opacity-60" : ""}`}
        style={{ top: 0, height: 34 }}>
        <Image src={c.poster} alt="" width={404} height={720} className="h-full w-5 shrink-0 rounded object-cover" />
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[10px] font-medium leading-tight">{c.title}</span>
          <span className="flex items-center gap-1 text-[9px] text-slate"><PlatformGlyph p={p.platform} size={10} />{dayLabel(p.time).split(" ").slice(1).join(" ")}</span>
        </span>
        <span aria-hidden className={`h-1.5 w-1.5 shrink-0 rounded-full ${STATUS_DOT[p.status]}`} />
      </button>
    );
  };

  return (
    <div className="flex flex-col gap-5 xl:flex-row">
      {/* left column */}
      <aside className="w-full shrink-0 space-y-4 xl:w-64">
        {/* mini month */}
        <div className="rounded-2xl bg-surface p-4 shadow-sm ring-1 ring-line">
          <p className="text-sm font-bold">November 2026</p>
          <div className="mt-2 grid grid-cols-7 gap-y-1 text-center text-[10px]">
            {DAY_NAMES.map((d) => <span key={d} className="text-slate">{d[0]}</span>)}
            {Array.from({ length: MONTH_OFFSET }).map((_, i) => <span key={"e" + i} />)}
            {MONTH_DAYS.map((d) => (
              <span key={d} className={`rounded-full py-0.5 ${d >= 23 && d <= 29 ? "bg-lime-soft font-bold" : ""} ${d === 23 ? "ring-1 ring-fg" : ""}`}>{d}</span>
            ))}
          </div>
        </div>
        {/* platform filters */}
        <div className="rounded-2xl bg-surface p-4 shadow-sm ring-1 ring-line">
          <p className="text-xs font-bold">Platforms</p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {PLATS.map((p) => (
              <label key={p} className={`flex cursor-pointer items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ring-1 transition-colors ${platFilter.includes(p) ? "bg-lime-soft ring-fg" : "bg-surface ring-line-2 text-slate"}`}>
                <input type="checkbox" className="sr-only" checked={platFilter.includes(p)}
                  onChange={() => setPlatFilter(platFilter.includes(p) ? platFilter.filter((x) => x !== p) : [...platFilter, p])} />
                <PlatformGlyph p={p} size={14} />{p}
              </label>
            ))}
          </div>
        </div>
        {/* status legend */}
        <div className="rounded-2xl bg-surface p-4 shadow-sm ring-1 ring-line">
          <p className="text-xs font-bold">Status</p>
          <ul className="mt-2 space-y-1.5 text-xs">
            {([["scheduled", "Scheduled"], ["reminder", "Reminder due"], ["posted", "Posted"], ["failed", "Failed"]] as const).map(([k, l]) => (
              <li key={k} className="flex items-center gap-2"><span className={`h-2 w-2 rounded-full ${STATUS_DOT[k]}`} />{l}<span className="ml-auto font-mono text-slate">{counts(k)}</span></li>
            ))}
          </ul>
        </div>
        {/* unscheduled tray */}
        <div className="rounded-2xl bg-surface p-4 shadow-sm ring-1 ring-line">
          <p className="text-xs font-bold">Unscheduled clips</p>
          <ul className="mt-2 space-y-2">
            {unscheduled.map((c) => (
              <li key={c.id}>
                <button onClick={() => setSched(c.id)} className="flex w-full items-center gap-2 rounded-xl p-1.5 text-left ring-1 ring-transparent transition-colors hover:bg-canvas hover:ring-line">
                  <Image src={c.poster} alt="" width={404} height={720} className="h-10 w-6 rounded object-cover" />
                  <span className="min-w-0 flex-1 truncate text-xs font-medium">{c.title}</span>
                  <ScoreBadge score={c.score} />
                </button>
              </li>
            ))}
            {!unscheduled.length && <li className="text-xs text-slate">Everything&apos;s scheduled.</li>}
          </ul>
        </div>
      </aside>

      {/* main */}
      <div className="min-w-0 flex-1">
        {/* summary strip */}
        <div className="flex flex-wrap items-center gap-3 rounded-2xl bg-surface p-4 shadow-sm ring-1 ring-line">
          <p className="text-sm"><strong className="font-mono">{weekPosts.length}</strong> scheduled this week</p>
          <span className="hidden h-4 w-px bg-line-2 sm:block" />
          <span className="flex items-center gap-2 text-xs text-slate">
            {PLATS.map((p, i) => <span key={p} className="flex items-center gap-1"><PlatformGlyph p={p} size={14} />{perPlat[i]}</span>)}
          </span>
          {nextPost && <p className="text-xs text-slate">Next: {dayLabel(nextPost.time)}</p>}
          {reminders > 0 && <span className="rounded-full bg-[#F5A524]/15 px-3 py-1 text-xs font-medium text-heat-text">{reminders} reminders due</span>}
          <div className="ml-auto flex items-center gap-2">
            <div role="tablist" aria-label="Calendar view" className="flex rounded-full bg-surface-2 p-1 text-xs font-medium">
              {(["day", "week", "month"] as const).map((v) => (
                <button key={v} role="tab" aria-selected={view === v} onClick={() => setView(v)}
                  className={`rounded-full px-3 py-1 capitalize ${view === v ? "bg-surface shadow-sm" : "text-fg"}`}>{v}</button>
              ))}
            </div>
            <button className="rounded-full bg-surface px-3 py-1 text-xs font-medium shadow-sm ring-1 ring-line">Today</button>
            <IconButton label="Previous" className="bg-surface shadow-sm ring-1 ring-line"><svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.8" className="translate-x-[-0.5px]"><path d="M7.5 2.5 4 6l3.5 3.5"/></svg></IconButton>
            <IconButton label="Next" className="bg-surface shadow-sm ring-1 ring-line"><svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.8" className="translate-x-[0.5px]"><path d="M4.5 2.5 8 6l-3.5 3.5"/></svg></IconButton>
          </div>
        </div>

        {/* week / day view */}
        {view !== "month" && (
          <div className="mt-4 overflow-hidden rounded-2xl bg-surface shadow-sm ring-1 ring-line">
            <div className="grid" style={{ gridTemplateColumns: `48px repeat(${view === "week" ? 7 : 1}, minmax(0,1fr))` }}>
              <div />
              {(view === "week" ? WEEK.map((d, i) => ({ d, name: DAY_NAMES[i] })) : [{ d: WEEK[0], name: "Mon" }]).map(({ d, name }) => (
                <div key={d} className="border-l border-line px-2 py-2 text-center">
                  <p className="text-[10px] uppercase text-slate">{name}</p>
                  <p className={`mx-auto mt-0.5 flex h-7 w-7 items-center justify-center rounded-full text-sm font-bold ${d === TODAY ? "bg-lime text-ink" : ""}`}>{d.slice(8)}</p>
                </div>
              ))}
              {HOURS.map((h) => (
                <div key={h} className="contents">
                  <div className="relative border-t border-line pr-1 text-right text-[9px] text-slate" style={{ height: 44 }}>
                    <span className="absolute -top-1.5 right-1 bg-surface px-1">{h === 12 ? "12pm" : h > 12 ? `${h - 12}pm` : `${h}am`}</span>
                  </div>
                  {(view === "week" ? WEEK : [WEEK[0]]).map((d, di) => {
                    const cell = visible.filter((p) => inWeek(p.time) && dayOf(p.time) === di && Math.floor(hourOf(p.time)) === h);
                    const suggested = SUGGESTED.some(([sd, sh]) => sd === di && sh === h) && !cell.length;
                    const heat = HEAT[h] ?? 0.12;
                    return (
                      <div key={d} className="relative border-l border-t border-line" style={{ height: 44, backgroundColor: `rgba(189,239,114,${(heat * 0.22).toFixed(2)})` }}>
                        {suggested && <span className="absolute inset-1 flex items-center justify-center rounded-lg border border-dashed border-lime-deep text-[10px] font-medium text-lime-deep">+</span>}
                        {cell.map((p, pi) => <div key={p.id} className="relative" style={{ height: 0 }}><div className="absolute" style={{ top: pi * 36 + 2, left: 0, right: 0, height: 34 }}><PostCard p={p} /></div></div>)}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
            {/* now line */}
            {now && (
              <div aria-hidden className="pointer-events-none relative -mt-[2px] flex items-center">
                <span className="h-1.5 w-1.5 rounded-full bg-heat" /><span className="h-px flex-1 bg-heat" />
                <span className="ml-1 pr-2 text-[9px] font-medium text-heat-text">now {now.getHours()}:{String(now.getMinutes()).padStart(2, "0")}</span>
              </div>
            )}
            <p className="border-t border-line px-4 py-2 text-[10px] text-slate">Lime shading = best times for your audience</p>
          </div>
        )}

        {/* month view */}
        {view === "month" && (
          <div className="mt-4 grid grid-cols-7 gap-px overflow-hidden rounded-2xl bg-line shadow-sm ring-1 ring-line">
            {DAY_NAMES.map((d) => <div key={d} className="bg-canvas px-2 py-1.5 text-center text-[10px] font-medium uppercase text-slate">{d}</div>)}
            {Array.from({ length: MONTH_OFFSET }).map((_, i) => <div key={"e" + i} className="min-h-[96px] bg-surface" />)}
            {MONTH_DAYS.map((d) => {
              const iso = `2026-11-${String(d).padStart(2, "0")}`;
              const cell = visible.filter((p) => p.time.slice(0, 10) === iso);
              return (
                <div key={d} className={`min-h-[96px] bg-surface p-1.5 ${d === 23 ? "bg-lime-soft/40" : ""}`}>
                  <p className={`text-[10px] font-medium ${d === 23 ? "flex h-5 w-5 items-center justify-center rounded-full bg-lime text-ink" : "text-slate"}`}>{d}</p>
                  <div className="mt-1 space-y-1">
                    {cell.slice(0, 3).map((p) => {
                      const c = clipById(p.clipId);
                      return (
                        <button key={p.id} onClick={() => setSel(p)} className="flex w-full items-center gap-1 rounded bg-canvas px-1 py-0.5 text-left text-[9px] font-medium ring-1 ring-line hover:ring-line-2">
                          <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${STATUS_DOT[p.status]}`} />
                          <span className="truncate">{c?.title}</span>
                        </button>
                      );
                    })}
                    {cell.length > 3 && <p className="px-1 text-[9px] text-slate">+{cell.length - 3} more</p>}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* post popover */}
        {sel && clipById(sel.clipId) && (
          <Modal open={!!sel} onClose={() => setSel(null)} label="Scheduled post" title="Scheduled post">
            <div className="mt-4 flex items-start gap-3">
              <Image src={clipById(sel.clipId)!.poster} alt="" width={404} height={720} className="h-auto w-14 rounded-lg object-cover" />
              <div className="min-w-0">
                <p className="text-sm font-semibold">{clipById(sel.clipId)!.title}</p>
                <p className="mt-1 flex items-center gap-2 text-xs text-slate"><PlatformGlyph p={sel.platform} size={16} />{dayLabel(sel.time)}</p>
                <p className="mt-2 line-clamp-2 rounded-lg bg-canvas p-2 text-xs text-slate">“{clipById(sel.clipId)!.hook}” {clipById(sel.clipId)!.hashtags[sel.platform].join(" ")}</p>
              </div>
            </div>
            <label className="mt-4 block text-xs font-medium text-slate">Time
              <input type="time" defaultValue={sel.time.slice(11, 16)} onChange={(e) => setPosts(posts.map((p) => p.id === sel.id ? { ...p, time: p.time.slice(0, 11) + e.target.value + ":00" } : p))}
                className="mt-1 rounded-lg border border-line-2 px-3 py-2 text-sm" />
            </label>
            <div className="mt-4 flex flex-wrap gap-2">
              <button onClick={() => { setPosts(posts.map((p) => p.id === sel.id ? { ...p, status: "posted" } : p)); setSel(null); }}
                className="rounded-full bg-lime px-4 py-2 text-xs font-semibold text-ink">Mark as posted</button>
              <button onClick={() => setSel(null)} className="rounded-full border border-line-2 px-4 py-2 text-xs font-medium">Reschedule</button>
              <Link href={`/app/clips/${sel.clipId}/edit`} className="rounded-full border border-line-2 px-4 py-2 text-xs font-medium">Open in editor</Link>
            </div>
          </Modal>
        )}

        {/* schedule popover (unscheduled tray) */}
        {sched && clipById(sched) && (
          <Modal open={!!sched} onClose={() => setSched(null)} label="Schedule post" title="Schedule post">
            <div className="mt-4 flex items-center gap-3">
              <Image src={clipById(sched)!.poster} alt="" width={404} height={720} className="h-auto w-12 rounded-lg" />
              <p className="text-sm font-semibold">{clipById(sched)!.title}</p>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <label className="text-xs font-medium text-slate">Date
                <input type="date" defaultValue="2026-11-30" className="mt-1 w-full rounded-lg border border-line-2 px-3 py-2 text-sm" />
              </label>
              <label className="text-xs font-medium text-slate">Time
                <input type="time" defaultValue="19:30" className="mt-1 w-full rounded-lg border border-line-2 px-3 py-2 text-sm" />
              </label>
            </div>
            <p className="mt-3 text-xs font-medium text-slate">Platform</p>
            <div className="mt-1.5 flex gap-2">
              {PLATS.map((p, i) => (
                <button key={p} className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium ring-1 ${i === 0 ? "bg-lime-soft ring-fg" : "ring-line-2"}`}>
                  <PlatformGlyph p={p} size={14} />{p}
                </button>
              ))}
            </div>
            <button onClick={() => { setPosts([...posts, { id: "s" + (posts.length + 1), clipId: sched, platform: "tiktok", time: "2026-11-30T19:30:00", status: "scheduled" }]); setSched(null); }}
              className="mt-5 w-full rounded-full bg-lime py-2.5 text-sm font-semibold text-ink">Schedule</button>
          </Modal>
        )}
      </div>
    </div>
  );
}
