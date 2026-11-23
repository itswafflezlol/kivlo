"use client";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { clips, projects } from "@/lib/mock";
import { PlatformGlyph, ScoreBadge } from "@/components/app/ui";

export default function Library() {
  const [q, setQ] = useState("");
  const [posted, setPosted] = useState<"all" | "posted" | "unposted">("all");
  const [grid, setGrid] = useState(true);
  const list = clips.filter((c) => c.title.toLowerCase().includes(q.toLowerCase()));
  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center gap-2">
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search clips" aria-label="Search clips" className="w-64 rounded-full border border-line-2 bg-surface px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-lime" />
        <select value={posted} onChange={(e) => setPosted(e.target.value as "all")} aria-label="Posted filter" className="rounded-full border border-line-2 bg-surface px-3 py-2 text-sm">
          <option value="all">All</option><option value="posted">Posted</option><option value="unposted">Not posted</option>
        </select>
        <button onClick={() => setGrid(!grid)} className="ml-auto rounded-full border border-line-2 bg-surface px-3 py-2 text-xs font-medium">{grid ? "List" : "Grid"}</button>
      </div>
      {list.length === 0 ? (
        <p className="mt-20 text-center text-slate">Nothing matches “{q}”.</p>
      ) : (
        <div className={grid ? "grid gap-4 sm:grid-cols-3 lg:grid-cols-4" : "space-y-2"}>
          {list.map((c) => {
            const p = projects.find((x) => x.id === c.projectId)!;
            return grid ? (
              <Link key={c.id} href={`/app/clips/${c.id}/edit`} className="group rounded-2xl bg-surface p-2.5 ring-1 ring-line hover:shadow-md">
                <div className="relative aspect-[9/16] overflow-hidden rounded-xl bg-ink ring-1 ring-line">
                  <Image src={c.poster} alt="" fill sizes="25vw" className="object-cover" />
                  <span className="absolute left-2 top-2"><ScoreBadge score={c.score} /></span>
                </div>
                <p className="mt-2 px-1 text-sm font-medium">{c.title}</p>
                <p className="px-1 text-xs text-slate">{p.title}</p>
              </Link>
            ) : (
              <Link key={c.id} href={`/app/clips/${c.id}/edit`} className="flex items-center gap-3 rounded-xl bg-surface p-3 ring-1 ring-line hover:shadow-md">
                <Image src={c.poster} alt="" width={404} height={720} className="h-auto w-[30px] rounded-md object-cover" />
                <span className="flex-1 truncate text-sm font-medium">{c.title}</span>
                <PlatformGlyph p={p.platform} size={18} /><ScoreBadge score={c.score} />
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
