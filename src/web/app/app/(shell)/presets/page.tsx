"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { presets as seed, clips, type Preset, type PresetKind } from "@/lib/mock";

const TABS: { id: "all" | PresetKind; label: string }[] = [
  { id: "all", label: "All" },
  { id: "captions", label: "Captions" },
  { id: "layouts", label: "Layouts" },
  { id: "looks", label: "Looks" },
  { id: "hooks", label: "Hooks/Titles" },
  { id: "export", label: "Export" },
  { id: "posting", label: "Posting" },
];

const KIND_LABEL: Record<PresetKind, string> = {
  captions: "Caption style", layouts: "Layout", looks: "Full look",
  hooks: "Hook template", export: "Export spec", posting: "Posting defaults",
};

/** Static caption styling shared by tiles + preview. */
export function styledCaption(p: Preset, words: string[], active = 1): React.ReactNode {
  const base = "font-extrabold leading-tight";
  const cap = (cls = "") => <span className={`${base} ${cls}`}>{words.map((w, i) => (
    <span key={i} className={i === active ? "text-fg" : ""}>{w}{" "}</span>
  ))}</span>;
  switch (p.style) {
    case "pop": return <span className={`${base} uppercase`}>{words.map((w, i) => (
      <span key={i} className={`mx-[0.15em] rounded px-1 ${i === active ? "bg-lime text-ink" : "bg-black/60 text-white"}`}>{w}</span>
    ))}</span>;
    case "clean": return <span className={`${base} text-white [text-shadow:0_1px_6px_rgba(0,0,0,0.9)]`}>{words.join(" ")}</span>;
    case "box": return <span className={`${base} inline-block bg-ink px-2 py-0.5 uppercase text-white`}>{words.join(" ")}</span>;
    case "neon": return <span className={`${base} uppercase text-white`} style={{ textShadow: `0 0 8px ${p.color}, 0 0 16px ${p.color}` }}>{words.join(" ")}</span>;
    case "high": return <span className={base}>{words.map((w, i) => (
      <span key={i} className={`mx-[0.1em] px-1 ${i === active ? "text-ink" : "text-white [text-shadow:0_1px_4px_rgba(0,0,0,0.8)]"}`} style={i === active ? { backgroundColor: p.color } : undefined}>{w}</span>
    ))}</span>;
    case "type": return <span className={`${base} font-mono text-white [text-shadow:0_1px_4px_rgba(0,0,0,0.8)]`}>{words.join(" ")}_</span>;
    case "bounce": return <span className={`${base} uppercase`}>{words.map((w, i) => (
      <span key={i} className={`mx-[0.1em] inline-block ${i === active ? "text-lime" : "text-white [text-shadow:0_1px_4px_rgba(0,0,0,0.8)]"}`} style={i === active ? { transform: "scale(1.15)" } : undefined}>{w}</span>
    ))}</span>;
    case "min": return <span className="font-medium lowercase text-white [text-shadow:0_1px_4px_rgba(0,0,0,0.8)]">{words.join(" ")}</span>;
    case "big": return <span className={`${base} text-2xl uppercase leading-none text-white [text-shadow:0_2px_8px_rgba(0,0,0,0.9)]`}>{words.slice(0, 2).join(" ")}</span>;
    case "twotone": return <span className={base}><span className="block text-white [text-shadow:0_1px_4px_rgba(0,0,0,0.8)]">{words.slice(0, 2).join(" ")}</span><span className="block" style={{ color: p.color }}>{words.slice(2).join(" ")}</span></span>;
    default: return cap("text-white");
  }
}

function TilePreview({ p, clip }: { p: Preset; clip: (typeof clips)[number] }) {
  return (
    <div className="relative aspect-[9/16] w-full overflow-hidden rounded-xl bg-ink ring-1 ring-line">
      <Image src={clip.poster} alt="" fill sizes="140px" className="object-cover opacity-80 transition-transform duration-300 group-hover:scale-105" />
      <span className="absolute inset-x-2 bottom-3 text-center text-[11px] transition-transform duration-200 group-hover:-translate-y-0.5">
        {styledCaption(p, ["NO", "WAY", "HE"], 1)}
      </span>
    </div>
  );
}

export default function Presets() {
  const [list, setList] = useState(seed);
  const [tab, setTab] = useState<"all" | PresetKind>("all");
  const [q, setQ] = useState("");
  const [sel, setSel] = useState<Preset | null>(null);
  const [playing, setPlaying] = useState(false);
  const vidRef = useRef<HTMLVideoElement>(null);

  const shown = list.filter((p) =>
    (tab === "all" || p.kind === tab) &&
    p.name.toLowerCase().includes(q.toLowerCase())
  );
  const PREVIEW_BY_KIND: Record<string, string> = { captions: "c2", layouts: "c7", looks: "c12", hooks: "c10", export: "c9", posting: "c15" };
  const previewClip = clips.find((c) => c.id === (sel ? PREVIEW_BY_KIND[sel.kind] : "c1")) ?? clips[0];

  const act = (id: string, k: "dup" | "del" | "def") => {
    if (k === "def") setList((l) => l.map((p) => ({ ...p, isDefault: p.id === id })));
    if (k === "del") { setList((l) => l.filter((p) => p.id !== id)); if (sel?.id === id) setSel(null); }
    if (k === "dup") setList((l) => { const p = l.find((x) => x.id === id)!; return [...l, { ...p, id: id + "_c" + l.length, name: p.name + " copy", isDefault: false, mine: true }]; });
  };

  const togglePlay = () => {
    const v = vidRef.current;
    if (!v) return;
    if (v.paused) { v.play().catch(() => {}); setPlaying(true); } else { v.pause(); setPlaying(false); }
  };

  return (
    <div className="flex gap-6">
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-3">
          <h2 className="font-heading text-2xl font-bold">Presets</h2>
          <button onClick={() => setList((l) => [...l, { id: "new" + l.length, name: "New preset", kind: "captions", style: "pop", color: "#BDEF72", desc: "Custom preset", isDefault: false, mine: true }])}
            className="rounded-full bg-lime px-4 py-2 text-xs font-semibold text-ink hover:bg-lime-hover">New preset</button>
          <label className="relative ml-auto">
            <span className="sr-only">Search presets</span>
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search"
              className="w-40 rounded-full border border-line-2 bg-surface px-4 py-2 text-xs placeholder:text-slate focus:outline-none focus:ring-2 focus:ring-lime" />
          </label>
        </div>
        <div role="tablist" aria-label="Preset category" className="mt-4 flex w-fit flex-wrap rounded-full bg-surface p-1 shadow-sm ring-1 ring-line">
          {TABS.map((t) => (
            <button key={t.id} role="tab" aria-selected={tab === t.id} onClick={() => setTab(t.id)}
              className={`rounded-full px-4 py-1.5 text-xs font-medium ${tab === t.id ? "bg-fg text-canvas" : "text-slate"}`}>{t.label}</button>
          ))}
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
          {shown.map((p) => (
            <button key={p.id} onClick={() => { setSel(p); setPlaying(false); }}
              className={`group rounded-2xl bg-surface p-2.5 text-left shadow-sm ring-1 transition-all hover:shadow ${sel?.id === p.id ? "ring-2 ring-fg" : "ring-line"}`}>
              {p.kind === "captions" || p.kind === "looks" ? <TilePreview p={p} clip={clips[seed.indexOf(p) % clips.length]} /> : (
                <div className="flex aspect-[9/16] w-full flex-col items-center justify-center gap-1.5 rounded-xl bg-canvas px-2 text-center">
                  <span className="text-[13px] font-bold leading-tight">{p.name}</span>
                  <span className="text-[10px] text-slate">{KIND_LABEL[p.kind]}</span>
                </div>
              )}
              <span className="mt-2 flex items-center gap-1.5 px-1">
                <span className="truncate text-xs font-medium">{p.name}</span>
                {p.isDefault && <span className="rounded-full bg-lime px-1.5 py-0.5 text-[9px] font-semibold text-ink">Default</span>}
                <span className={`ml-auto shrink-0 rounded-full px-1.5 py-0.5 text-[9px] font-medium ${p.mine ? "bg-lilac-soft text-lilac-deep" : "bg-surface-2 text-fg"}`}>{p.mine ? "Mine" : "Kivlo"}</span>
              </span>
            </button>
          ))}
        </div>
        {!shown.length && (
          <p className="mt-20 text-center text-slate">No {tab === "all" ? "" : tab} presets yet — hit <strong>New preset</strong> to make one.</p>
        )}
      </div>

      {/* preview panel */}
      {sel && (
        <aside className="sticky top-4 hidden h-fit w-[300px] shrink-0 rounded-2xl bg-surface p-4 shadow-sm ring-1 ring-line lg:block" aria-label="Preset preview">
          <div className="flex items-center justify-between">
            <h3 className="font-heading text-sm font-bold">{sel.name}</h3>
            <button onClick={() => setSel(null)} aria-label="Close preview" className="text-slate hover:text-fg">
              <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M4 4l8 8M12 4l-8 8" /></svg>
            </button>
          </div>
          <p className="mt-0.5 text-xs text-slate">{KIND_LABEL[sel.kind]} · {sel.desc}</p>
          <div className="relative mt-3 aspect-[9/16] w-full overflow-hidden rounded-xl bg-ink ring-1 ring-line">
            {sel.kind === "captions" || sel.kind === "looks" ? (
              <>
                <video ref={vidRef} src={previewClip.src} poster={previewClip.poster} muted loop playsInline className="absolute inset-0 h-full w-full object-cover" />
                <button onClick={togglePlay} aria-label={playing ? "Pause preview" : "Play preview"}
                  className="absolute inset-0 flex items-center justify-center">
                  {!playing && <span className="flex h-12 w-12 items-center justify-center rounded-full bg-line0 text-white backdrop-blur"><svg viewBox="0 0 16 16" className="ml-0.5 h-5 w-5" fill="currentColor"><path d="M4 3l9 5-9 5V3Z"/></svg></span>}
                </button>
                <span className="pointer-events-none absolute inset-x-3 bottom-6 text-center text-sm">
                  {styledCaption(sel, previewClip.words.map((w) => w.w), 1)}
                </span>
              </>
            ) : (
              <div className="flex h-full flex-col items-center justify-center gap-2 px-4 text-center">
                <Image src={previewClip.poster} alt="" fill sizes="300px" className="object-cover opacity-30" />
                <span className="relative rounded-lg bg-ink/70 px-3 py-1.5 text-sm font-bold text-white">{sel.name}</span>
                <span className="relative text-xs text-white/80">{sel.desc}</span>
              </div>
            )}
          </div>
          <dl className="mt-3 space-y-1.5 text-xs">
            <div className="flex justify-between"><dt className="text-slate">Style</dt><dd className="font-medium capitalize">{sel.style}</dd></div>
            <div className="flex justify-between"><dt className="text-slate">Accent</dt><dd className="flex items-center gap-1.5 font-medium"><span className="h-3 w-3 rounded-full ring-1 ring-line-2" style={{ backgroundColor: sel.color }} />{sel.color}</dd></div>
          </dl>
          <div className="mt-4 grid grid-cols-2 gap-2">
            <button className="rounded-full bg-lime py-2 text-xs font-semibold text-ink hover:bg-lime-hover">Apply to clip…</button>
            <button onClick={() => act(sel.id, "def")} className="rounded-full border border-line-2 py-2 text-xs font-medium hover:border-fg">{sel.isDefault ? "Default ✓" : "Set as default"}</button>
            <button onClick={() => act(sel.id, "dup")} className="rounded-full border border-line-2 py-2 text-xs font-medium hover:border-fg">Duplicate</button>
            <button onClick={() => { const v = prompt("Preset name", sel.name); if (v) setList((l) => l.map((p) => p.id === sel.id ? { ...p, name: v } : p)); }} className="rounded-full border border-line-2 py-2 text-xs font-medium hover:border-fg">Rename</button>
            {sel.mine && <button onClick={() => act(sel.id, "del")} className="col-span-2 rounded-full border border-line-2 py-2 text-xs font-medium text-error hover:border-[#B3261E]">Delete</button>}
          </div>
        </aside>
      )}
    </div>
  );
}
