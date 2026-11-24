"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { clipsOf, TODAY_ISO, type Clip, type PostPlatform } from "@/lib/mock";
import { useLocalData } from "@/lib/localStore";
import { apiEnabled, getProject, eventsTicket, eventsUrl, type ApiProject } from "@/lib/data";
import { DotsMenu, PlatformGlyph, ScoreBadge, Select, fmtLen, Modal } from "@/components/app/ui";

const ViewTransition = (React as unknown as { ViewTransition?: React.ComponentType<{ name: string; children?: React.ReactNode }> }).ViewTransition ?? (({ children }: { children?: React.ReactNode }) => <>{children}</>);

const STEPS = ["Downloading", "Transcribing", "Finding moments", "Making clips"];
const PLATFORMS: PostPlatform[] = ["tiktok", "shorts", "reels", "x"];

function Processing({ onDone }: { onDone: () => void }) {
  const [step, setStep] = useState(0);
  const [pct, setPct] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setPct((p) => {
      const n = Math.min(100, p + 2.5);
      setStep(Math.min(3, Math.floor(n / 25)));
      if (n >= 100) { clearInterval(t); setTimeout(onDone, 400); }
      return n;
    }), 100);
    return () => clearInterval(t);
  }, [onDone]);
  return (
    <div className="mx-auto mt-16 max-w-md rounded-2xl bg-surface p-8 ring-1 ring-line">
      <h2 className="font-heading text-lg font-bold">Finding the best moments</h2>
      <p className="mt-1 text-sm text-slate">This takes a few minutes. You can leave — we&apos;ll notify you.</p>
      <ol className="mt-6 space-y-3">
        {STEPS.map((s, i) => (
          <li key={s} className="flex items-center gap-3 text-sm">
            <span className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium ${i < step || pct >= 100 ? "bg-lime text-ink" : i === step ? "bg-ink text-lime" : "bg-surface-2 text-slate"}`}>
              {i < step || pct >= 100 ? "✓" : i + 1}
            </span>
            <span className={i > step ? "text-slate" : "text-fg"}>{s}</span>
            {i === step && pct < 100 && <span className="ml-auto font-mono text-xs text-slate">{Math.min(99, Math.round(pct * 4 - i * 100))}%</span>}
          </li>
        ))}
      </ol>
      <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-surface-2"><div className="h-full bg-lime transition-all" style={{ width: `${pct}%` }} /></div>
    </div>
  );
}

const SUGGESTED_TIMES = ["19:30", "21:00", "12:15"] as const;
const SUGGESTED_LABELS = ["7:30 PM", "9:00 PM", "12:15 PM"];

function nextDayIso() {
  const d = new Date(TODAY_ISO + "T00:00:00");
  d.setDate(d.getDate() + 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function PostPrep({ clip, onClose }: { clip: Clip; onClose: () => void }) {
  const { schedulePost } = useLocalData();
  const [plat, setPlat] = useState<PostPlatform>("tiktok");
  const [title, setTitle] = useState(clip.hook);
  const [gen, setGen] = useState(false);
  const [timeIdx, setTimeIdx] = useState(0);
  const [done, setDone] = useState(false);
  const regen = () => { setGen(true); setTimeout(() => { setTitle(clip.hook + " — you have to see this"); setGen(false); }, 700); };
  const schedule = () => {
    schedulePost({ clipId: clip.id, platform: plat, time: `${nextDayIso()}T${SUGGESTED_TIMES[timeIdx]}:00`, status: "scheduled" });
    setDone(true);
    setTimeout(onClose, 700);
  };
  return (
    <aside className="fixed inset-y-0 right-0 z-40 flex w-full max-w-sm flex-col border-l border-hairline bg-surface shadow-xl" role="dialog" aria-label="Post prep">
      <div className="flex items-center justify-between border-b border-hairline px-5 py-4">
        <h3 className="font-heading text-base font-bold">Post prep</h3>
        <button onClick={onClose} aria-label="Close" className="rounded-full p-1.5 hover:bg-surface-2">✕</button>
      </div>
      <div className="flex-1 overflow-y-auto p-5">
        <div role="tablist" aria-label="Platform" className="mb-4 flex gap-1 rounded-full bg-surface-2 p-1">
          {PLATFORMS.map((p) => (
            <button key={p} role="tab" aria-selected={plat === p} onClick={() => setPlat(p)} className={`flex-1 rounded-full px-2 py-1.5 text-xs font-medium capitalize ${plat === p ? "bg-surface shadow-sm" : "text-slate"}`}>{p}</button>
          ))}
        </div>
        <div className="space-y-4">
          <label className="block text-sm font-medium">Hook
            <textarea rows={2} value={title} onChange={(e) => setTitle(e.target.value)} className="mt-1 w-full rounded-lg border border-line-2 px-3 py-2 text-sm font-normal" />
          </label>
          <div>
            <p className="text-sm font-medium">Hashtags</p>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {clip.hashtags[plat].map((h) => <span key={h} className="rounded-full bg-surface-2 px-2.5 py-1 font-mono text-xs">{h}</span>)}
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={regen} className="rounded-full border border-line-2 px-3 py-1.5 text-xs font-medium hover:border-fg">{gen ? "Generating…" : "Regenerate"}</button>
            <button onClick={() => navigator.clipboard?.writeText(title)} className="rounded-full border border-line-2 px-3 py-1.5 text-xs font-medium hover:border-fg">Copy</button>
          </div>
          <div>
            <p className="text-sm font-medium">Suggested times · tomorrow</p>
            <div className="mt-1.5 flex gap-1.5" role="group" aria-label="Suggested times">
              {SUGGESTED_LABELS.map((t, i) => (
                <button key={t} aria-pressed={timeIdx === i} onClick={() => setTimeIdx(i)}
                  className={`rounded-full px-3 py-1.5 font-mono text-xs ${timeIdx === i ? "bg-lime text-ink" : "bg-surface-2 text-slate"}`}>{t}</button>
              ))}
            </div>
          </div>
          <button onClick={schedule} disabled={done} className="w-full rounded-full bg-lime py-2.5 text-sm font-semibold text-ink hover:bg-lime-hover disabled:opacity-60">
            {done ? "Scheduled ✓" : "Schedule"}
          </button>
        </div>
      </div>
    </aside>
  );
}

const API_STAGES: Record<string, string> = {
  probe: "Checking the video", download: "Downloading", transcribe: "Transcribing",
  highlights: "Finding moments", render: "Making clips",
};

function ApiProjectView({ id }: { id: string }) {
  const [project, setProject] = useState<ApiProject | null | "loading">("loading");
  const [live, setLive] = useState<{ stage: string | null; pct: number }>({ stage: null, pct: 0 });

  useEffect(() => {
    let dead = false;
    let es: EventSource | null = null;
    let retries = 0;
    const open = async () => {
      try {
        const { ticket } = await eventsTicket();
        if (dead) return;
        es = new EventSource(eventsUrl(ticket));
        es.addEventListener("job.progress", (e) => {
          const d = JSON.parse((e as MessageEvent).data);
          if (d.projectId === id) setLive({ stage: d.stage ?? null, pct: d.pct ?? 0 });
        });
        es.addEventListener("project.updated", (e) => {
          const d = JSON.parse((e as MessageEvent).data);
          if (d.projectId === id) void getProject(id).then((p) => !dead && setProject((p as ApiProject) ?? null));
        });
        es.onerror = () => {
          es?.close();
          if (!dead && retries++ < 5) setTimeout(() => void open(), 2000);
        };
      } catch {
        if (!dead && retries++ < 5) setTimeout(() => void open(), 2000);
      }
    };
    getProject(id).then((p) => { if (!dead) { setProject((p as ApiProject) ?? null); if (p && (p as ApiProject).status === "processing") void open(); } })
      .catch(() => !dead && setProject(null));
    return () => { dead = true; es?.close(); };
  }, [id]);

  if (project === "loading") {
    return <div className="mx-auto mt-16 h-64 max-w-md animate-pulse rounded-2xl bg-surface ring-1 ring-line" />;
  }
  if (!project) return <p className="mt-10 text-slate">Project not found.</p>;
  if (project.status === "failed") {
    return (
      <div className="mx-auto mt-16 max-w-md rounded-2xl bg-surface p-8 text-center ring-1 ring-line">
        <h2 className="font-heading text-lg font-bold">That import didn&apos;t finish.</h2>
        <p className="mt-1 text-sm text-slate">{project.error ?? "Something went wrong."} Your credits were refunded.</p>
        <Link href="/app" className="mt-5 inline-block rounded-full bg-lime px-6 py-2.5 text-sm font-semibold text-ink hover:bg-lime-hover">Back to dashboard</Link>
      </div>
    );
  }
  if (project.status === "ready") {
    return (
      <div className="mx-auto mt-16 max-w-md rounded-2xl bg-surface p-8 text-center ring-1 ring-line">
        <h2 className="font-heading text-lg font-bold">{project.title ?? "Import ready"}</h2>
        <p className="mt-1 text-sm text-slate">Clips are ready to review.</p>
      </div>
    );
  }
  const pct = Math.max(project.progress ?? 0, live.pct);
  const stageName = API_STAGES[live.stage ?? project.stage ?? ""] ?? "Importing";
  return (
    <div className="mx-auto mt-16 max-w-md rounded-2xl bg-surface p-8 ring-1 ring-line">
      <h2 className="font-heading text-lg font-bold">{project.title ?? "Finding the best moments"}</h2>
      <p className="mt-1 text-sm text-slate">{stageName} — this takes a few minutes. You can leave, we&apos;ll notify you.</p>
      <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-surface-2">
        <div className="h-full bg-lime transition-all" style={{ width: `${pct}%` }} />
      </div>
      <p className="mt-2 font-mono text-xs text-slate">{Math.round(pct)}% · {live.stage ?? project.stage ?? "queued"}</p>
    </div>
  );
}

export default function ProjectView({ id }: { id: string }) {
  return apiEnabled ? <ApiProjectView id={id} /> : <MockProjectView id={id} />;
}

const SORT_OPTS = [
  { value: "score-desc", label: "Score · high to low" },
  { value: "score-asc", label: "Score · low to high" },
  { value: "newest", label: "Newest" },
  { value: "duration", label: "Duration" },
];
const SORT_FN: Record<string, (a: Clip, b: Clip) => number> = {
  "score-desc": (a, b) => b.score - a.score,
  "score-asc": (a, b) => a.score - b.score,
  newest: (a, b) => b.startSec - a.startSec,
  duration: (a, b) => b.duration - a.duration,
};

function MockProjectView({ id }: { id: string }) {
  const router = useRouter();
  const { projectById, isDeleted, addProject, renameProject, deleteProject, deleteClip } = useLocalData();
  const project = projectById(id);
  const [processing, setProcessing] = useState(project?.status === "processing");
  const [sort, setSort] = useState("score-desc");
  const [prep, setPrep] = useState<Clip | null>(null);
  const [confirm, setConfirm] = useState<Clip | null>(null);
  const [renaming, setRenaming] = useState(false);
  const [delProject, setDelProject] = useState(false);
  const nameRef = useRef<HTMLInputElement>(null);
  const cardRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const clipList = useMemo(
    () => (project ? clipsOf(project.id).filter((c) => !isDeleted(c.id)) : []),
    [project, isDeleted]
  );
  const dots = useMemo(() => {
    const len = project?.sourceLength ?? 100;
    const n = Math.min(160, Math.max(60, Math.round(len / 120)));
    return Array.from({ length: n }, (_, i) => {
      const t = i / n;
      const h = 0.15 + 0.85 * Math.abs(Math.sin(i * 12.9898) * 0.5 + Math.sin(i * 3.7) * 0.5);
      const moment = clipList.find((c) => Math.abs(c.startSec / len - t) < 0.02);
      return { h, moment };
    });
  }, [project, clipList]);

  if (!project) {
    return (
      <div className="mx-auto mt-16 max-w-md rounded-2xl bg-surface p-8 text-center ring-1 ring-line">
        <h2 className="font-heading text-lg font-bold">Project not found.</h2>
        <Link href="/app/projects" className="mt-4 inline-block text-sm font-medium text-lime-deep hover:underline">Back to projects</Link>
      </div>
    );
  }
  if (processing) return <Processing onDone={() => setProcessing(false)} />;
  if (project.status === "failed") {
    return (
      <div className="mx-auto mt-16 max-w-md rounded-2xl bg-surface p-8 text-center ring-1 ring-line">
        <h2 className="font-heading text-lg font-bold">That import failed.</h2>
        <p className="mt-1 text-sm text-slate">Your 3 credits were refunded.</p>
        <button onClick={() => { addProject({ ...project, status: "processing" }); setProcessing(true); }}
          className="mt-5 rounded-full bg-lime px-6 py-2.5 text-sm font-semibold text-ink hover:bg-lime-hover">Retry import</button>
      </div>
    );
  }

  const list = clipList.sort(SORT_FN[sort] ?? SORT_FN["score-desc"]);
  const commitRename = () => {
    const v = nameRef.current?.value.trim();
    if (v) renameProject(project.id, v);
    setRenaming(false);
  };

  return (
    <div>
      <div className="flex flex-wrap items-baseline gap-3">
        <PlatformGlyph p={project.platform} />
        {renaming ? (
          <input ref={nameRef} autoFocus defaultValue={project.title} aria-label="Project name"
            onKeyDown={(e) => { if (e.key === "Enter") commitRename(); if (e.key === "Escape") setRenaming(false); }}
            onBlur={commitRename}
            className="min-w-0 max-w-md flex-1 rounded-lg border border-lime bg-surface px-2 py-1 font-heading text-lg font-bold focus:outline-none" />
        ) : (
          <h2 className="font-heading text-lg font-bold" title={project.title}>{project.title}</h2>
        )}
        <span className="text-sm text-slate">{fmtLen(project.sourceLength)}</span>
        <DotsMenu label={`${project.title} options`} items={[
          { label: "Rename", onClick: () => setRenaming(true) },
          { label: "Delete project", danger: true, onClick: () => setDelProject(true) },
        ]} />
        <label className="ml-auto flex items-center gap-2 text-xs text-slate">Sort
          <Select label="Sort clips" value={sort} onChange={setSort} options={SORT_OPTS} className="w-44" />
        </label>
      </div>

      <div className="mt-5 flex h-16 items-end gap-[3px] rounded-xl bg-surface p-3 ring-1 ring-line" role="group" aria-label="Energy timeline">
        {dots.map((d, i) => (
          <button key={i} disabled={!d.moment} aria-label={d.moment ? `${d.moment.title} · score ${d.moment.score}` : `Quiet segment ${i + 1}`}
            title={d.moment ? `${d.moment.title} · score ${d.moment.score}` : undefined}
            onClick={() => d.moment && cardRefs.current[d.moment.id]?.scrollIntoView({ behavior: "smooth", block: "center" })}
            className={`flex-1 rounded-sm ${d.moment ? "bg-lime hover:bg-lime-hover" : "bg-surface-2"}`}
            style={{ height: `${Math.round(d.h * 100)}%` }} />
        ))}
      </div>

      <div className="mt-6 grid gap-4 grid-cols-[repeat(auto-fill,minmax(230px,1fr))]">
        {list.map((c) => (
          <div key={c.id} ref={(n) => { cardRefs.current[c.id] = n; }} className="group w-full max-w-[340px] rounded-2xl bg-surface p-3 ring-1 ring-line">
            <div className="relative aspect-[9/16] overflow-hidden rounded-xl bg-ink ring-1 ring-line">
              <ViewTransition name={`clip-thumb-${c.id}`}>
              <video src={c.src} poster={c.poster} muted loop playsInline preload="none" aria-label={c.title}
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                onMouseEnter={(e) => e.currentTarget.play().catch(() => {})}
                onMouseLeave={(e) => e.currentTarget.pause()} />
              </ViewTransition>
              <span className="absolute left-2 top-2"><ScoreBadge score={c.score} /></span>
              <span className="absolute bottom-2 right-2 rounded-md bg-black/60 px-1.5 py-0.5 font-mono text-[11px] text-white">0:0{c.duration}</span>
            </div>
            <div className="mt-3 px-1">
              <p className="text-sm font-semibold">{c.title}</p>
              <p className="mt-0.5 text-xs text-slate">{c.reason}</p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                <Link href={`/app/clips/${c.id}/edit`} className="rounded-full bg-fg px-3 py-1.5 text-xs font-semibold text-canvas hover:opacity-90">Edit</Link>
                <button onClick={() => setPrep(c)} className="rounded-full border border-line-2 px-3 py-1.5 text-xs font-medium hover:border-fg">Post prep</button>
                <a href={c.src} download className="rounded-full border border-line-2 px-3 py-1.5 text-xs font-medium hover:border-fg">Download</a>
                <button onClick={() => setConfirm(c)} aria-label={`Delete ${c.title}`} className="ml-auto rounded-full px-2 py-1.5 text-xs text-slate hover:text-error">Delete</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {prep && <PostPrep clip={prep} onClose={() => setPrep(null)} />}
      <Modal open={delProject} onClose={() => setDelProject(false)} label="Delete project" title="Delete this project?">
        <p className="mt-2 text-sm text-slate">“{project.title}” and its {project.clipIds.length} clips will be removed. This can&apos;t be undone.</p>
        <div className="mt-5 flex justify-end gap-2">
          <button onClick={() => setDelProject(false)} className="rounded-full border border-line-2 px-4 py-2 text-sm font-medium">Keep</button>
          <button onClick={() => { deleteProject(project.id); router.push("/app/projects"); }}
            className="rounded-full bg-[#B3261E] px-4 py-2 text-sm font-semibold text-white">Delete</button>
        </div>
      </Modal>
      {confirm && (
        <Modal open={!!confirm} onClose={() => setConfirm(null)} label="Delete clip" title="Delete this clip?">
            <p className="mt-2 text-sm text-slate">“{confirm.title}” will be removed. This can&apos;t be undone.</p>
            <div className="mt-5 flex justify-end gap-2">
              <button onClick={() => setConfirm(null)} className="rounded-full border border-line-2 px-4 py-2 text-sm font-medium">Keep</button>
              <button onClick={() => { deleteClip(confirm.id); setConfirm(null); }} className="rounded-full bg-[#B3261E] px-4 py-2 text-sm font-semibold text-white">Delete</button>
            </div>
        </Modal>
      )}
    </div>
  );
}
