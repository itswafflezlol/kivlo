"use client";

import Image from "next/image";
import { clips as allClips, presets } from "@/lib/mock";
import type { EditDoc } from "./editDoc";
import { CapSec, COLORS, FONTS, FONT_STACKS, NumField, Slider, type Ws } from "./common";
import { Select } from "../ui";

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

const ADJ_GROUPS: { title: string; keys: (keyof EditDoc["adjust"])[] }[] = [
  { title: "Core", keys: ["brightness", "contrast", "saturation", "exposure", "sharpen"] },
  { title: "Color", keys: ["temperature", "tint"] },
  { title: "Tone", keys: ["highlights", "shadows", "vibrance", "fade"] },
];
const ADJ_LABEL: Record<keyof EditDoc["adjust"], string> = {
  brightness: "Brightness", contrast: "Contrast", saturation: "Saturation", exposure: "Exposure", sharpen: "Sharpen",
  temperature: "Temperature", tint: "Tint", highlights: "Highlights", shadows: "Shadows", vibrance: "Vibrance", fade: "Fade",
  vignette: "Vignette",
};
const ADJ_MIN0: (keyof EditDoc["adjust"])[] = ["sharpen", "vignette"];

export function AdjustPanel({ ws }: { ws: Ws }) {
  const set = (k: keyof EditDoc["adjust"], v: number) =>
    ws.setDoc((d) => ({ ...d, adjust: { ...d.adjust, [k]: v } }));
  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <button onPointerDown={() => ws.setCompare(true)} onPointerUp={() => ws.setCompare(false)} onPointerLeave={() => ws.setCompare(false)}
          className="flex-1 rounded-full bg-carbon py-2 text-xs text-[#A1A5A0] hover:text-white">Hold to compare</button>
        <button onClick={() => ws.setDoc((d) => ({ ...d, adjust: Object.fromEntries(Object.keys(d.adjust).map((k) => [k, 0])) as EditDoc["adjust"] }))}
          className="flex-1 rounded-full border border-[#3A3A3A] py-2 text-xs text-[#A1A5A0] hover:text-white">Reset all</button>
      </div>
      {ADJ_GROUPS.map((g) => (
        <CapSec key={g.title} title={g.title} open>
          {g.keys.map((k) => (
            <Slider key={k} label={ADJ_LABEL[k]} min={ADJ_MIN0.includes(k) ? 0 : -100} max={100} value={ws.doc.adjust[k]}
              reset={0} onChange={(v) => set(k, v)} />
          ))}
        </CapSec>
      ))}
      <CapSec title="Vignette" open>
        <Slider label="Vignette" min={0} max={100} value={ws.doc.adjust.vignette} reset={0} onChange={(v) => set("vignette", v)} />
      </CapSec>
    </div>
  );
}

export function LayoutButtons({ ws }: { ws: Ws }) {
  const { cfg, setCfg } = ws;
  return (
    <div className="grid grid-cols-4 gap-1.5">
      {([["auto", "Auto"], ["split", "Split"], ["face", "Face"]] as const).map(([k, l]) => (
        <button key={k} aria-pressed={cfg.layout === k} onClick={() => setCfg((c) => ({ ...c, layout: k }))}
          className={`rounded-xl border p-2 text-[11px] font-medium ${cfg.layout === k ? "border-lime bg-lime/10 text-white" : "border-[#3A3A3A] text-[#A1A5A0] hover:border-[#7C7C7C]"}`}>
          <span className="mx-auto mb-1.5 block aspect-[9/16] w-6 rounded bg-carbon ring-1 ring-[#3A3A3A]">
            {k === "split" && <span className="block h-1/2 rounded-t bg-lilac/40" />}
            {k === "face" && <span className="m-auto mt-1 block h-3 w-3 rounded-full bg-lilac/40" />}
            {k === "auto" && <span className="m-auto mt-1 block h-3 w-3 rounded bg-lime/40" />}
          </span>{l}
        </button>
      ))}
    </div>
  );
}

// Numeric X/Y/Scale/Rotation readout for whatever is selected on the stage.
function SelectedPanel({ ws }: { ws: Ws }) {
  const { sel, doc, setDoc } = ws;
  if (!sel || sel.kind === "segment" || sel.kind === "block") return null;
  const label = sel.kind === "crop" ? "Video" : sel.kind === "caption" ? "Caption box" : sel.kind === "face" ? "Facecam pane" : sel.kind === "game" ? "Gameplay pane" : "Text overlay";

  let x = 0, y = 0, scale = 1, rotation = 0, w: number | null = null;
  if (sel.kind === "crop") ({ x, y, scale, rotation } = doc.crop);
  else if (sel.kind === "caption") ({ x, y, scale, w } = doc.caption);
  else if (sel.kind === "face" || sel.kind === "game") ({ x, y, scale, rotation } = doc.split[sel.kind]);
  else {
    const o = doc.overlays.find((v) => v.id === sel.id);
    if (!o) return null;
    x = o.x; y = o.y; rotation = o.rotation; w = o.w;
  }

  const put = (patch: { x?: number; y?: number; scale?: number; rotation?: number; w?: number }) =>
    setDoc((d) => {
      if (sel.kind === "crop") return { ...d, crop: { ...d.crop, ...patch } };
      if (sel.kind === "caption") return { ...d, caption: { ...d.caption, ...patch } };
      if (sel.kind === "face" || sel.kind === "game") return { ...d, split: { ...d.split, [sel.kind]: { ...d.split[sel.kind], ...patch } } };
      if (sel.kind === "overlay") return { ...d, overlays: d.overlays.map((o) => (o.id === sel.id ? { ...o, ...patch } : o)) };
      return d;
    });

  return (
    <div className="mb-3 rounded-xl bg-carbon p-3">
      <p className="mb-2 text-xs font-semibold text-[#A1A5A0]">Selected — {label}</p>
      <div className="grid grid-cols-2 gap-2">
        <NumField label="X %" value={x * 100} onChange={(v) => put({ x: clamp(v / 100, -1, 1) })} />
        <NumField label="Y %" value={y * 100} onChange={(v) => put({ y: clamp(v / 100, -1, 1) })} />
        {w !== null
          ? <NumField label="Width %" value={w * 100} onChange={(v) => put({ w: clamp(v / 100, 0.1, 1.5) })} />
          : <NumField label="Scale" value={scale * 100} onChange={(v) => put({ scale: clamp(v / 100, 0.2, 5) })} />}
        <NumField label="Rotation °" value={rotation} onChange={(v) => put({ rotation: clamp(v, -180, 180) })} />
      </div>
    </div>
  );
}

export default function Inspector({ ws }: { ws: Ws }) {
  const { cfg, setCfg, clip, ins, setIns } = ws;
  return (
    <>
      <div role="tablist" aria-label="Inspector" className="mb-4 flex rounded-full bg-carbon p-1">
        {(["layout", "captions", "adjust", "post"] as const).map((x) => (
          <button key={x} role="tab" aria-selected={ins === x} onClick={() => setIns(x)}
            className={`flex-1 rounded-full px-2 py-1.5 text-[11px] font-semibold capitalize transition-colors ${ins === x ? "bg-graphite text-white shadow ring-1 ring-[#3A3A3A]" : "text-[#A1A5A0] hover:text-white"}`}>{x}</button>
        ))}
      </div>
      <SelectedPanel ws={ws} />
      {ins === "layout" && (
        <div className="space-y-4">
          <LayoutButtons ws={ws} />
          <Slider label="Crop X" min={0} max={100} value={cfg.cropX} onChange={(v) => setCfg((c) => ({ ...c, cropX: v }))} unit="%" />
          <div className="mt-4 border-t border-[#3A3A3A] pt-4">
            <p className="mb-2 text-xs font-semibold text-[#A1A5A0]">Presets</p>
            {presets.map((p) => (
              <div key={p.id} className="mb-1.5 flex items-center gap-2 rounded-xl bg-carbon p-2.5">
                <span className="h-4 w-4 rounded-full" style={{ background: p.color }} />
                <span className="flex-1 text-xs font-medium">{p.name}</span>
                {p.isDefault && <span className="rounded-full bg-lime px-2 py-0.5 text-[10px] font-semibold text-ink">Default</span>}
                <button onClick={() => setCfg((c) => ({ ...c, color: p.color, style: p.style }))} className="text-[11px] text-lime hover:underline">Apply</button>
              </div>
            ))}
          </div>
        </div>
      )}
      {ins === "captions" && (
        <div className="space-y-3">
          <div className="grid grid-cols-4 gap-1.5">
            {presets.filter((p) => p.kind === "captions").map((p, i) => (
              <button key={p.id} aria-pressed={cfg.style === p.style} onClick={() => setCfg((c) => ({ ...c, style: p.style, color: p.color }))}
                className={`rounded-xl border p-1.5 ${cfg.style === p.style ? "border-lime bg-lime/10" : "border-[#3A3A3A] hover:border-[#7C7C7C]"}`}>
                <span className="relative block aspect-[9/16] w-full overflow-hidden rounded-lg bg-ink">
                  <Image src={allClips[(i * 3 + 1) % allClips.length].poster} alt="" fill sizes="80px" className="object-cover opacity-70" />
                  <span className="absolute inset-x-0 bottom-1 flex justify-center">
                    <span className="px-0.5 text-[8px] font-extrabold uppercase leading-none" style={{ color: p.color, textShadow: "0 1px 4px rgba(0,0,0,.9)" }}>Did that</span>
                  </span>
                </span>
                <span className="mt-1 block truncate text-[9px] text-[#A1A5A0]">{p.name}</span>
              </button>
            ))}
          </div>

          <CapSec title="Text" open>
            <div className="flex gap-2">
              <Select dark label="Caption font" value={cfg.font}
                onChange={(v) => setCfg((c) => ({ ...c, font: v }))}
                options={FONTS.map((f) => ({ value: f, label: f, style: { fontFamily: FONT_STACKS[f] } }))}
                className="min-w-0 flex-1" />
              <Select dark label="Weight" value={String(cfg.weight)}
                onChange={(v) => setCfg((c) => ({ ...c, weight: Number(v) }))}
                options={["800", "700", "600"].map((w) => ({ value: w, label: w }))}
                className="w-20" />
            </div>
            <Slider label="Size" min={16} max={40} value={cfg.size} onChange={(v) => setCfg((c) => ({ ...c, size: v }))} />
            <div className="flex items-center justify-between text-xs text-[#A1A5A0]">
              <span>Letter case</span>
              <div className="flex rounded-full bg-carbon p-0.5">
                {([["upper", "AA"], ["mixed", "Aa"]] as const).map(([k, l]) => (
                  <button key={k} onClick={() => setCfg((c) => ({ ...c, upper: k === "upper" }))}
                    className={`rounded-full px-2.5 py-1 font-mono text-[10px] ${(k === "upper") === cfg.upper ? "bg-graphite text-white" : "text-[#A1A5A0]"}`}>{l}</button>
                ))}
              </div>
            </div>
            <div className="flex items-center justify-between text-xs text-[#A1A5A0]">
              <span>Lines</span>
              <div className="flex rounded-full bg-carbon p-0.5">
                {[1, 2, 3].map((n) => (
                  <button key={n} onClick={() => setCfg((c) => ({ ...c, lines: n }))}
                    className={`h-6 w-7 rounded-full font-mono text-[10px] ${cfg.lines === n ? "bg-graphite text-white" : "text-[#A1A5A0]"}`}>{n}</button>
                ))}
              </div>
            </div>
            <Slider label="Words per line" min={2} max={5} value={cfg.lineWords} onChange={(v) => setCfg((c) => ({ ...c, lineWords: v }))} />
          </CapSec>

          <CapSec title="Colors">
            <div className="space-y-2.5">
              {([["textColor", "Text"], ["color", "Active word"]] as const).map(([k, l]) => (
                <div key={k} className="flex items-center gap-3">
                  <span className="w-20 text-xs text-[#A1A5A0]">{l}</span>
                  <div className="flex flex-1 gap-1.5">{COLORS.map((c) => (
                    <button key={c} onClick={() => setCfg((x) => ({ ...x, [k]: c }))} aria-label={`${l} ${c}`} aria-pressed={cfg[k] === c}
                      className={`h-6 w-6 rounded-full ring-2 ring-offset-2 ring-offset-graphite ${cfg[k] === c ? "ring-lime" : "ring-transparent"}`} style={{ background: c }} />
                  ))}</div>
                </div>
              ))}
              <Slider label="Shadow box" min={0} max={100} value={cfg.boxOp} onChange={(v) => setCfg((c) => ({ ...c, boxOp: v }))} unit="%" />
            </div>
          </CapSec>

          <CapSec title="Animation">
            <div className="flex flex-wrap gap-1.5">
              {(["none", "pop", "bounce", "type", "fade"] as const).map((a) => (
                <button key={a} aria-pressed={cfg.anim === a} onClick={() => setCfg((c) => ({ ...c, anim: a, reveal: a !== "none" }))}
                  className={`rounded-full px-3 py-1.5 text-[11px] font-medium capitalize ${cfg.anim === a ? "bg-lime text-ink" : "bg-carbon text-[#A1A5A0] hover:text-white"}`}>{a}</button>
              ))}
            </div>
            <Slider label="Speed" min={80} max={400} value={cfg.animSpeed} onChange={(v) => setCfg((c) => ({ ...c, animSpeed: v }))} unit="ms" />
          </CapSec>

          <CapSec title="Position">
            <div className="flex gap-1.5">
              {([["top", 0.18], ["middle", 0.45], ["bottom", 0.68]] as const).map(([l, v]) => (
                <button key={l} onClick={() => ws.setDoc((d) => ({ ...d, caption: { ...d.caption, y: v } }))}
                  className={`flex-1 rounded-full py-1.5 text-[11px] font-medium capitalize ${Math.abs(ws.doc.caption.y - v) < 0.06 ? "bg-lime text-ink" : "bg-carbon text-[#A1A5A0] hover:text-white"}`}>{l}</button>
              ))}
            </div>
            <Slider label="Fine tune" min={10} max={85} value={Math.round(ws.doc.caption.y * 100)} onChange={(v) => ws.setDoc((d) => ({ ...d, caption: { ...d.caption, y: v / 100 } }))} unit="%" />
            <label className="flex items-center justify-between text-xs text-[#A1A5A0]">Safe-area guides
              <input type="checkbox" checked={cfg.safeGuides} onChange={(e) => setCfg((c) => ({ ...c, safeGuides: e.target.checked }))} className="h-4 w-4 accent-lime" />
            </label>
          </CapSec>

          <CapSec title="Emphasis">
            <div className="space-y-2.5">
              {([["highlight", "Highlight active word"], ["emphasis", "Auto-highlight keywords"], ["emoji", "Emoji"], ["reveal", "Word-by-word reveal"]] as const).map(([k, l]) => (
                <label key={k} className="flex items-center justify-between text-xs text-[#A1A5A0]">{l}
                  <input type="checkbox" checked={cfg[k]} onChange={(e) => setCfg((c) => ({ ...c, [k]: e.target.checked }))} className="h-4 w-4 accent-lime" />
                </label>
              ))}
            </div>
          </CapSec>
        </div>
      )}
      {ins === "adjust" && <AdjustPanel ws={ws} />}
      {ins === "post" && (
        <div className="space-y-3 text-xs">
          <label className="block text-[#A1A5A0]">Hook <textarea rows={2} defaultValue={clip.hook} className="mt-1 w-full rounded-lg border border-[#3A3A3A] bg-carbon px-2 py-1.5 text-white" /></label>
          <div className="flex flex-wrap gap-1.5">{clip.hashtags.tiktok.map((h) => <span key={h} className="rounded-full bg-carbon px-2 py-1 font-mono text-[10px] text-[#A1A5A0]">{h}</span>)}</div>
          <div className="flex gap-1.5">{["7:30 PM", "9:00 PM"].map((x) => <button key={x} className="rounded-full bg-carbon px-2.5 py-1 font-mono text-[10px] hover:bg-lime hover:text-ink">{x}</button>)}</div>
        </div>
      )}
    </>
  );
}
