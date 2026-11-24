"use client";

import Link from "next/link";
import Image from "next/image";
import { useRef, useState } from "react";
import { clipsOf, type ProjectStatus } from "@/lib/mock";
import { useLocalData } from "@/lib/localStore";
import { DotsMenu, IconButton, Modal, PlatformGlyph, statusChip, fmtLen } from "@/components/app/ui";

const FILTERS: { id: "all" | ProjectStatus; label: string }[] = [
  { id: "all", label: "All" },
  { id: "ready", label: "Ready" },
  { id: "processing", label: "Processing" },
  { id: "failed", label: "Failed" },
];

export default function ProjectsPage() {
  const { projects, renameProject, deleteProject } = useLocalData();
  const [f, setF] = useState<"all" | ProjectStatus>("all");
  const [renaming, setRenaming] = useState<string | null>(null);
  const [confirm, setConfirm] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const list = projects.filter((p) => f === "all" || p.status === f);
  const confirmProject = projects.find((p) => p.id === confirm);

  const commitRename = (id: string) => {
    const v = inputRef.current?.value.trim();
    if (v) renameProject(id, v);
    setRenaming(null);
  };

  return (
    <div className="mx-auto max-w-4xl">
      <div className="flex flex-wrap items-center gap-3">
        <h2 className="font-heading text-2xl font-bold">Projects</h2>
        <div role="tablist" aria-label="Filter projects" className="ml-auto flex rounded-full bg-surface p-1 shadow-sm ring-1 ring-line">
          {FILTERS.map((x) => (
            <button key={x.id} role="tab" aria-selected={f === x.id} onClick={() => setF(x.id)}
              className={`rounded-full px-4 py-1.5 text-xs font-medium ${f === x.id ? "bg-fg text-canvas" : "text-slate"}`}>{x.label}</button>
          ))}
        </div>
      </div>
      <ul className="mt-6 space-y-3">
        {list.map((p) => {
          const cs = clipsOf(p.id);
          const row = "flex items-center gap-4 rounded-2xl bg-surface p-4 shadow-sm ring-1 ring-line";
          const thumbs = (
            <span className="flex -space-x-3">
              {cs.slice(0, 3).map((c) => (
                <Image key={c.id} src={c.poster} alt="" width={404} height={720} className="h-14 w-8 rounded-lg object-cover ring-2 ring-white" />
              ))}
              {!cs.length && <span className="flex h-14 w-8 items-center justify-center rounded-lg bg-surface-2 text-xs text-slate">—</span>}
            </span>
          );
          const meta = `${fmtLen(p.sourceLength)} source · ${p.clipIds.length} clips · ${p.createdAt}`;
          return (
            <li key={p.id} className="group relative">
              {renaming === p.id ? (
                <div className={row}>
                  {thumbs}
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-2">
                      <PlatformGlyph p={p.platform} size={18} />
                      <input ref={inputRef} autoFocus defaultValue={p.title} aria-label="Project name"
                        onKeyDown={(e) => { if (e.key === "Enter") commitRename(p.id); if (e.key === "Escape") setRenaming(null); }}
                        onBlur={() => commitRename(p.id)}
                        className="min-w-0 flex-1 rounded-lg border border-lime bg-surface px-2 py-1 font-medium focus:outline-none" />
                    </span>
                    <span className="mt-1 block text-xs text-slate">{meta}</span>
                  </span>
                  <IconButton label="Save name" onClick={() => commitRename(p.id)}>
                    <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2.5 6.2l2.3 2.3L9.5 3.6" /></svg>
                  </IconButton>
                </div>
              ) : (
                <>
                  <Link href={`/app/projects/${p.id}`} className={`${row} pr-12 transition-shadow hover:shadow`}>
                    {thumbs}
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-2">
                        <PlatformGlyph p={p.platform} size={18} />
                        <span className="truncate font-medium" title={p.title}>{p.title}</span>
                      </span>
                      <span className="mt-1 block text-xs text-slate">{meta}</span>
                    </span>
                    <span className={`rounded-full px-3 py-1 text-xs font-medium capitalize ${statusChip[p.status]}`}>{p.status}</span>
                  </Link>
                  <span className="absolute right-3 top-1/2 -translate-y-1/2">
                    <DotsMenu label={`${p.title} options`} items={[
                      { label: "Rename", onClick: () => setRenaming(p.id) },
                      { label: "Delete project", danger: true, onClick: () => setConfirm(p.id) },
                    ]} />
                  </span>
                </>
              )}
            </li>
          );
        })}
      </ul>
      {!list.length && (
        <p className="mt-16 text-center text-slate">
          {f === "all" ? "No projects yet — import a VOD to get started." : `No ${f} projects.`}
        </p>
      )}
      <Modal open={!!confirmProject} onClose={() => setConfirm(null)} label="Delete project" title="Delete this project?">
        {confirmProject && (
          <>
            <p className="mt-2 text-sm text-slate">“{confirmProject.title}” and its {confirmProject.clipIds.length} clips will be removed. This can&apos;t be undone.</p>
            <div className="mt-5 flex justify-end gap-2">
              <button onClick={() => setConfirm(null)} className="rounded-full border border-line-2 px-4 py-2 text-sm font-medium">Keep</button>
              <button onClick={() => { deleteProject(confirmProject.id); setConfirm(null); }}
                className="rounded-full bg-[#B3261E] px-4 py-2 text-sm font-semibold text-white">Delete</button>
            </div>
          </>
        )}
      </Modal>
    </div>
  );
}
