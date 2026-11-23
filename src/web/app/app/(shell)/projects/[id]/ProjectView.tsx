"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { projectById, clipsOf, type Clip, type PostPlatform } from "@/lib/mock";
import { PlatformGlyph, ScoreBadge, fmtLen, Modal } from "@/components/app/ui";

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
    <div className="mx-auto mt-16 max-w-md rounded-2xl bg-white p-8 ring-1 ring-black/5">
      <h2 className="font-heading text-lg font-bold">Finding the best moments</h2>
      <p className="mt-1 text-sm text-slate">This takes a few minutes. You can leave — we&apos;ll notify you.</p>
      <ol className="mt-6 space-y-3">
        {STEPS.map((s, i) => (
          <li key={s} className="flex items-center gap-3 text-sm">
            <span className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium ${i < step || pct >= 100 ? "bg-lime text-ink" : i === step ? "bg-ink text-lime" : "bg-mist text-slate"}`}>
              {i < step || pct >= 100 ? "✓" : i + 1}
            </span>
            <span className={i > step ? "text-slate" : "text-ink"}>{s}</span>
            {i === step && pct < 100 && <span className="ml-auto font-mono text-xs text-slate">{Math.min(99, Math.round(pct * 4 - i * 100))}%</span>}
          </li>
        ))}
      </ol>
      <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-mist"><div className="h-full bg-lime transition-all" style={{ width: `${pct}%` }} /></div>
    </div>
  );
}

function PostPrep({ clip, onClose }: { clip: Clip; onClose: () => void }) {
  const [plat, setPlat] = useState<PostPlatform>("tiktok");
  const [title, setTitle] = useState(clip.hook);
  const [gen, setGen] = useState(false);
  const regen = () => { setGen(true); setTimeout(() => { setTitle(clip.hook + " — you have to see this"); setGen(false); }, 700); };
  return (
    <aside className="fixed inset-y-0 right-0 z-40 flex w-full max-w-sm flex-col border-l border-hairline bg-white shadow-xl" role="dialog" aria-label="Post prep">
      <div className="flex items-center justify-between border-b border-hairline px-5 py-4">
        <h3 className="font-heading text-base font-bold">Post prep</h3>
        <button onClick={onClose} aria-label="Close" className="rounded-full p-1.5 hover:bg-mist">✕</button>
      </div>
      <div className="flex-1 overflow-y-auto p-5">
        <div role="tablist" aria-label="Platform" className="mb-4 flex gap-1 rounded-full bg-mist p-1">
          {PLATFORMS.map((p) => (
            <button key={p} role="tab" aria-selected={plat === p} onClick={() => setPlat(p)} className={`flex-1 rounded-full px-2 py-1.5 text-xs font-medium capitalize ${plat === p ? "bg-white shadow-sm" : "text-slate"}`}>{p}</button>
          ))}
        </div>
        <div className="space-y-4">
          <label className="block text-sm font-medium">Hook
            <textarea rows={2} value={title} onChange={(e) => setTitle(e.target.value)} className="mt-1 w-full rounded-lg border border-black/10 px-3 py-2 text-sm font-normal" />
          </label>
          <div>
            <p className="text-sm font-medium">Hashtags</p>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {clip.hashtags[plat].map((h) => <span key={h} className="rounded-full bg-mist px-2.5 py-1 font-mono text-xs">{h}</span>)}
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={regen} className="rounded-full border border-black/10 px-3 py-1.5 text-xs font-medium hover:border-ink">{gen ? "Generating…" : "Regenerate"}</button>
            <button onClick={() => navigator.clipboard?.writeText(title)} className="rounded-full border border-black/10 px-3 py-1.5 text-xs font-medium hover:border-ink">Copy</button>
          </div>
          <div>
            <p className="text-sm font-medium">Suggested times</p>
            <div className="mt-1.5 flex gap-1.5">
              {["7:30 PM", "9:00 PM", "12:15 PM"].map((t, i) => (
                <button key={t} className={`rounded-full px-3 py-1.5 font-mono text-xs ${i === 0 ? "bg-lime text-ink" : "bg-mist text-slate"}`}>{t}</button>
              ))}
            </div>
          </div>
          <button className="w-full rounded-full bg-lime py-2.5 text-sm font-semibold text-ink hover:bg-lime-hover">Schedule</button>
        </div>
      </div>
    </aside>
  );
}

export default function ProjectView({ id }: { id: string }) {
  const project = projectById(id);
  const [processing, setProcessing] = useState(project?.status === "processing");
  const [sort, setSort] = useState<"score" | "time">("score");
  const [prep, setPrep] = useState<Clip | null>(null);
  const [confirm, setConfirm] = useState<Clip | null>(null);
  const cardRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const dots = useMemo(() => {
    const len = project?.sourceLength ?? 100;
    const n = Math.min(160, Math.max(60, Math.round(len / 120)));
    return Array.from({ length: n }, (_, i) => {
      const t = i / n;
      const h = 0.15 + 0.85 * Math.abs(Math.sin(i * 12.9898) * 0.5 + Math.sin(i * 3.7) * 0.5);
      const moment = (project ? clipsOf(project.id) : []).find((c) => Math.abs(c.startSec / len - t) < 0.02);
      return { h, moment };
    });
  }, [project]);

  if (!project) return <p className="mt-10 text-slate">Project not found.</p>;
  if (processing) return <Processing onDone={() => setProcessing(false)} />;
  if (project.status === "failed") {
    return (
      <div className="mx-auto mt-16 max-w-md rounded-2xl bg-white p-8 text-center ring-1 ring-black/5">
        <h2 className="font-heading text-lg font-bold">That import failed.</h2>
        <p className="mt-1 text-sm text-slate">Your 3 credits were refunded.</p>
        <button className="mt-5 rounded-full bg-lime px-6 py-2.5 text-sm font-semibold text-ink hover:bg-lime-hover">Retry import</button>
      </div>
    );
  }

  const list = clipsOf(project.id).sort((a, b) => (sort === "score" ? b.score - a.score : a.startSec - b.startSec));

  return (
    <div>
      <div className="flex flex-wrap items-baseline gap-3">
        <PlatformGlyph p={project.platform} />
        <h2 className="font-heading text-lg font-bold">{project.title}</h2>
        <span className="text-sm text-slate">{fmtLen(project.sourceLength)}</span>
        <label className="ml-auto text-xs text-slate">Sort
          <select value={sort} onChange={(e) => setSort(e.target.value as "score")} className="ml-1 rounded-lg border border-black/10 bg-white px-2 py-1 text-xs text-ink">
            <option value="score">Score</option><option value="time">Time</option>
          </select>
        </label>
      </div>

      <div className="mt-5 flex h-16 items-end gap-[3px] rounded-xl bg-white p-3 ring-1 ring-black/5" role="list" aria-label="Energy timeline">
        {dots.map((d, i) => (
          <button key={i} disabled={!d.moment} title={d.moment ? `${d.moment.title} · score ${d.moment.score}` : undefined}
            onClick={() => d.moment && cardRefs.current[d.moment.id]?.scrollIntoView({ behavior: "smooth", block: "center" })}
            className={`flex-1 rounded-sm ${d.moment ? "bg-lime hover:bg-lime-hover" : "bg-mist"}`}
            style={{ height: `${Math.round(d.h * 100)}%` }} />
        ))}
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {list.map((c) => (
          <div key={c.id} ref={(n) => { cardRefs.current[c.id] = n; }} className="group rounded-2xl bg-white p-3 ring-1 ring-black/5">
            <div className="relative aspect-[9/16] overflow-hidden rounded-xl bg-ink">
              <video src={c.src} poster={c.poster} muted loop playsInline preload="none" aria-label={c.title}
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                onMouseEnter={(e) => e.currentTarget.play().catch(() => {})}
                onMouseLeave={(e) => e.currentTarget.pause()} />
              <span className="absolute left-2 top-2"><ScoreBadge score={c.score} /></span>
              <span className="absolute bottom-2 right-2 rounded-md bg-black/60 px-1.5 py-0.5 font-mono text-[11px] text-white">0:0{c.duration}</span>
            </div>
            <div className="mt-3 px-1">
              <p className="text-sm font-semibold">{c.title}</p>
              <p className="mt-0.5 text-xs text-slate">{c.reason}</p>
              <div className="mt-3 flex gap-1.5">
                <Link href={`/app/clips/${c.id}/edit`} className="rounded-full bg-ink px-3 py-1.5 text-xs font-semibold text-white hover:bg-carbon">Edit</Link>
                <button onClick={() => setPrep(c)} className="rounded-full border border-black/10 px-3 py-1.5 text-xs font-medium hover:border-ink">Post prep</button>
                <a href={c.src} download className="rounded-full border border-black/10 px-3 py-1.5 text-xs font-medium hover:border-ink">Download</a>
                <button onClick={() => setConfirm(c)} aria-label={`Delete ${c.title}`} className="ml-auto rounded-full px-2 py-1.5 text-xs text-slate hover:text-[#B3261E]">Delete</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {prep && <PostPrep clip={prep} onClose={() => setPrep(null)} />}
      {confirm && (
        <Modal open={!!confirm} onClose={() => setConfirm(null)} label="Delete clip" title="Delete this clip?">
            <p className="mt-2 text-sm text-slate">“{confirm.title}” will be removed. This can&apos;t be undone.</p>
            <div className="mt-5 flex justify-end gap-2">
              <button onClick={() => setConfirm(null)} className="rounded-full border border-black/10 px-4 py-2 text-sm font-medium">Keep</button>
              <button onClick={() => setConfirm(null)} className="rounded-full bg-[#B3261E] px-4 py-2 text-sm font-semibold text-white">Delete</button>
            </div>
        </Modal>
      )}
    </div>
  );
}
