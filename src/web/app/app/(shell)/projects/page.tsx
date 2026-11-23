"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { projects, clipsOf, type ProjectStatus } from "@/lib/mock";
import { PlatformGlyph, statusChip, fmtLen } from "@/components/app/ui";

const FILTERS: { id: "all" | ProjectStatus; label: string }[] = [
  { id: "all", label: "All" },
  { id: "ready", label: "Ready" },
  { id: "processing", label: "Processing" },
  { id: "failed", label: "Failed" },
];

export default function ProjectsPage() {
  const [f, setF] = useState<"all" | ProjectStatus>("all");
  const list = projects.filter((p) => f === "all" || p.status === f);
  return (
    <div className="mx-auto max-w-4xl">
      <div className="flex flex-wrap items-center gap-3">
        <h2 className="font-heading text-2xl font-bold">Projects</h2>
        <div role="tablist" aria-label="Filter projects" className="ml-auto flex rounded-full bg-white p-1 shadow-sm ring-1 ring-black/5">
          {FILTERS.map((x) => (
            <button key={x.id} role="tab" aria-selected={f === x.id} onClick={() => setF(x.id)}
              className={`rounded-full px-4 py-1.5 text-xs font-medium ${f === x.id ? "bg-ink text-white" : "text-slate"}`}>{x.label}</button>
          ))}
        </div>
      </div>
      <ul className="mt-6 space-y-3">
        {list.map((p) => {
          const cs = clipsOf(p.id);
          return (
            <li key={p.id}>
              <Link href={`/app/projects/${p.id}`}
                className="flex items-center gap-4 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/5 transition-shadow hover:shadow">
                <span className="flex -space-x-3">
                  {cs.slice(0, 3).map((c) => (
                    <Image key={c.id} src={c.poster} alt="" width={404} height={720} className="h-14 w-8 rounded-lg object-cover ring-2 ring-white" />
                  ))}
                  {!cs.length && <span className="flex h-14 w-8 items-center justify-center rounded-lg bg-mist text-xs text-slate">—</span>}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-2">
                    <PlatformGlyph p={p.platform} size={18} />
                    <span className="truncate font-medium">{p.title}</span>
                  </span>
                  <span className="mt-1 block text-xs text-slate">
                    {fmtLen(p.sourceLength)} source · {p.clipIds.length} clips · {p.createdAt}
                  </span>
                </span>
                <span className={`rounded-full px-3 py-1 text-xs font-medium capitalize ${statusChip[p.status]}`}>{p.status}</span>
              </Link>
            </li>
          );
        })}
      </ul>
      {!list.length && <p className="mt-16 text-center text-slate">No {f} projects.</p>}
    </div>
  );
}
