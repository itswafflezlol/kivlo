"use client";
import { useState } from "react";
import { presets as seed } from "@/lib/mock";

const LABELS = { ren: "Rename", dup: "Duplicate", def: "Set default", del: "Delete" } as const;
export default function Presets() {
  const [list, setList] = useState(seed.map((p) => ({ ...p })));
  const act = (id: string, k: "dup" | "del" | "def" | "ren") => {
    if (k === "def") setList((l) => l.map((p) => ({ ...p, isDefault: p.id === id })));
    if (k === "del") setList((l) => l.filter((p) => p.id !== id));
    if (k === "dup") setList((l) => { const p = l.find((x) => x.id === id)!; return [...l, { ...p, id: id + "_c", name: p.name + " copy", isDefault: false }]; });
    if (k === "ren") { const v = prompt("Preset name"); if (v) setList((l) => l.map((p) => (p.id === id ? { ...p, name: v } : p))); }
  };
  return (
    <div className="space-y-3">
      {list.map((p) => (
        <div key={p.id} className="flex items-center gap-4 rounded-2xl bg-white p-4 ring-1 ring-black/5">
          <span className="flex h-16 w-10 items-center justify-center rounded-lg bg-ink text-center text-[9px] font-bold uppercase leading-tight text-white">
            No <span style={{ color: p.color }}>way</span>
          </span>
          <div className="flex-1">
            <p className="text-sm font-semibold">{p.name} {p.isDefault && <span className="ml-1 rounded-full bg-lime px-2 py-0.5 text-[10px] font-semibold text-ink">Default</span>}</p>
            <p className="text-xs capitalize text-slate">{p.style} style</p>
          </div>
          {(Object.keys(LABELS) as (keyof typeof LABELS)[]).map((k) => (
            <button key={k} onClick={() => act(p.id, k)} className="rounded-full border border-black/10 px-3 py-1.5 text-xs font-medium hover:border-ink">
              {LABELS[k]}
            </button>
          ))}
        </div>
      ))}
      {list.length === 0 && <p className="mt-20 text-center text-slate">Save your style once and use it on every clip.</p>}
    </div>
  );
}
