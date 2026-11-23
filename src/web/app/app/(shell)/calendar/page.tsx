"use client";
import Image from "next/image";
import { useState } from "react";
import { scheduledPosts, clipById } from "@/lib/mock";
import { PlatformGlyph, statusChip, fmtTime } from "@/components/app/ui";

const DAYS = ["Mon 5", "Tue 6", "Wed 7", "Thu 8", "Fri 9", "Sat 10", "Sun 11"];
export default function Calendar() {
  const [view, setView] = useState<"week" | "month">("week");
  const [sel, setSel] = useState<string | null>(null);
  const post = sel ? scheduledPosts.find((s) => s.id === sel) : null;
  return (
    <div>
      <div className="mb-4 flex justify-end">
        <div role="tablist" aria-label="Calendar view" className="flex rounded-full bg-mist p-1 text-sm font-medium">
          {(["week", "month"] as const).map((v) => (
            <button key={v} role="tab" aria-selected={view === v} onClick={() => setView(v)} className={`rounded-full px-4 py-1.5 capitalize ${view === v ? "bg-white shadow-sm" : "text-slate"}`}>{v}</button>
          ))}
        </div>
      </div>
      <div className={`grid gap-3 ${view === "week" ? "grid-cols-7 max-lg:grid-cols-2" : "grid-cols-7 max-lg:grid-cols-3"}`}>
        {(view === "week" ? DAYS : Array.from({ length: 35 }, (_, i) => `${(i % 31) + 1}`)).map((d, i) => {
          const posts = view === "week" ? scheduledPosts.filter((s) => new Date(s.time).getDay() === (i + 1) % 7 || Math.abs(new Date(s.time).getDate() - (5 + i)) <= 0 && new Date(s.time).getDay() === (i + 1) % 7) : scheduledPosts.filter((s) => new Date(s.time).getDate() === (i % 31) + 1);
          return (
            <div key={i} className="min-h-28 rounded-xl bg-white p-2 ring-1 ring-black/5">
              <p className="mb-2 text-xs font-medium text-slate">{d}</p>
              {posts.map((s) => {
                const c = clipById(s.clipId)!;
                return (
                  <button key={s.id} onClick={() => setSel(s.id)} className="mb-1.5 flex w-full items-center gap-1.5 rounded-lg bg-paper p-1.5 text-left ring-1 ring-black/5 hover:ring-ink">
                    <Image src={c.poster} alt="" width={404} height={720} className="h-auto w-[18px] rounded object-cover" />
                    <span className="min-w-0 flex-1 truncate text-[11px] font-medium">{c.title}</span>
                    <PlatformGlyph p={s.platform} size={16} />
                  </button>
                );
              })}
              {view === "week" && i % 3 === 1 && <p className="mt-1 rounded-lg border border-dashed border-hairline px-2 py-1 text-center font-mono text-[10px] text-slate">7:30 PM suggested</p>}
            </div>
          );
        })}
      </div>
      {post && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4" onClick={() => setSel(null)} role="dialog" aria-modal="true" aria-label="Scheduled post">
          <div className="w-full max-w-sm rounded-2xl bg-white p-5" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-3">
              <Image src={clipById(post.clipId)!.poster} alt="" width={404} height={720} className="h-auto w-10 rounded-lg object-cover" />
              <div><p className="text-sm font-semibold">{clipById(post.clipId)!.title}</p>
                <p className="mt-0.5 flex items-center gap-2 text-xs text-slate"><PlatformGlyph p={post.platform} size={16} />{fmtTime(post.time)}</p></div>
            </div>
            <p className={`mt-3 inline-block rounded-full px-2.5 py-1 text-xs font-medium capitalize ${statusChip[post.status]}`}>{post.status}</p>
            <button onClick={() => setSel(null)} className="mt-4 w-full rounded-full bg-lime py-2.5 text-sm font-semibold text-ink">Mark as posted</button>
          </div>
        </div>
      )}
    </div>
  );
}
