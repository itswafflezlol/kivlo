"use client";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { clips } from "@/lib/mock";
import { useLocalData } from "@/lib/localStore";
import { PlatformGlyph, ScoreBadge, Select } from "@/components/app/ui";

const POSTED_OPTS = [
  { value: "all", label: "All clips" },
  { value: "posted", label: "Posted" },
  { value: "unposted", label: "Not posted" },
];

export default function Library() {
  const { clipIds, posts, projectById } = useLocalData();
  const [q, setQ] = useState("");
  const [posted, setPosted] = useState("all");
  const [grid, setGrid] = useState(true);
  const postedIds = new Set(posts.filter((p) => p.status === "posted").map((p) => p.clipId));
  const mine = clips.filter((c) => clipIds.has(c.id));
  const list = mine.filter((c) =>
    c.title.toLowerCase().includes(q.toLowerCase()) &&
    (posted === "all" || (posted === "posted") === postedIds.has(c.id))
  );
  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center gap-2">
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search clips" aria-label="Search clips" className="w-64 rounded-full border border-line-2 bg-surface px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-lime" />
        <Select label="Posted filter" value={posted} onChange={setPosted} options={POSTED_OPTS} className="w-40" />
        <button onClick={() => setGrid(!grid)} className="ml-auto rounded-full border border-line-2 bg-surface px-3 py-2 text-xs font-medium">{grid ? "List" : "Grid"}</button>
      </div>
      {mine.length === 0 ? (
        <p className="mt-20 text-center text-slate">No clips yet. Import a VOD to find your first highlight.</p>
      ) : list.length === 0 ? (
        <p className="mt-20 text-center text-slate">Nothing matches “{q}”.</p>
      ) : (
        <div className={grid ? "grid gap-4 grid-cols-[repeat(auto-fill,minmax(150px,1fr))]" : "space-y-2"}>
          {list.map((c) => {
            const p = projectById(c.projectId);
            return grid ? (
              <Link key={c.id} href={`/app/clips/${c.id}/edit`} className="group w-full max-w-[260px] rounded-2xl bg-surface p-2.5 ring-1 ring-line hover:shadow-md">
                <div className="relative aspect-[9/16] overflow-hidden rounded-xl bg-ink ring-1 ring-line">
                  <Image src={c.poster} alt="" fill sizes="25vw" className="object-cover" />
                  <span className="absolute left-2 top-2"><ScoreBadge score={c.score} /></span>
                </div>
                <p className="mt-2 truncate px-1 text-sm font-medium" title={c.title}>{c.title}</p>
                <p className="truncate px-1 text-xs text-slate">{p?.title}</p>
              </Link>
            ) : (
              <Link key={c.id} href={`/app/clips/${c.id}/edit`} className="flex items-center gap-3 rounded-xl bg-surface p-3 ring-1 ring-line hover:shadow-md">
                <Image src={c.poster} alt="" width={404} height={720} className="h-auto w-[30px] rounded-md object-cover" />
                <span className="flex-1 truncate text-sm font-medium">{c.title}</span>
                {p && <PlatformGlyph p={p.platform} size={18} />}<ScoreBadge score={c.score} />
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
