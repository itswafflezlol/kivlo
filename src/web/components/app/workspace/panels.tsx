"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import type { Clip } from "@/lib/mock";
import { ScoreBadge } from "../ui";
import { srcToTl } from "./editDoc";
import { COLORS, ic, InlineEdit, type Ws } from "./common";
import { AdjustPanel, LayoutButtons } from "./Inspector";

export type RailKey = "moments" | "transcript" | "text" | "captions" | "layout" | "adjust";

export const RAIL: { k: RailKey; label: string; icon: React.ReactNode; action?: boolean }[] = [
  { k: "moments", label: "Moments", icon: ic.moments },
  { k: "transcript", label: "Transcript", icon: ic.transcript },
  { k: "text", label: "Text", icon: ic.text, action: true },
  { k: "captions", label: "Captions", icon: ic.captions },
  { k: "layout", label: "Layout", icon: ic.layout },
  { k: "adjust", label: "Adjust", icon: ic.adjust },
];

export function RailPanel({ ws, rail, siblings }: { ws: Ws; rail: RailKey; siblings: Clip[] }) {
  const { clip, cfg, setCfg, doc } = ws;
  const [editingIdx, setEditingIdx] = useState<number | null>(null);
  // word index currently under the playhead (timeline space via captionBlocks)
  const activeBlock = doc.captionBlocks.find((b) => ws.t >= b.start && ws.t < b.end);
  const active = activeBlock?.wordIdx ?? -1;
  return (
    <>
      {rail === "moments" && siblings.map((s) => (
        <Link key={s.id} href={`/app/clips/${s.id}/edit`} className={`mb-1.5 flex items-center gap-2.5 rounded-xl p-2 ${s.id === clip.id ? "bg-carbon ring-1 ring-lime" : "hover:bg-carbon"}`}>
          <Image src={s.poster} alt="" width={404} height={720} className="h-auto w-[30px] rounded-md object-cover" />
          <span className="min-w-0 flex-1">
            <span className="block truncate text-xs font-medium">{s.title}</span>
            <span className="font-mono text-[10px] text-[#A1A5A0]">{s.duration.toFixed(1)}s</span>
          </span>
          <ScoreBadge score={s.score} />
        </Link>
      ))}
      {rail === "transcript" && (
        <p className="px-1 py-1 text-sm leading-relaxed">
          {clip.words.map((w, j) =>
            editingIdx === j ? (
              <InlineEdit key={j} value={w.w}
                onCommit={(v) => { setEditingIdx(null); if (v && v !== w.w) ws.setClipWords((c) => ({ ...c, words: c.words.map((x, k) => (k === j ? { ...x, w: v } : x)) })); }}
                className="rounded px-0.5 text-[#F2F2F0]" />
            ) : (
              <button key={j} onClick={() => ws.setTime(srcToTl(doc.segments, w.start))} onDoubleClick={() => setEditingIdx(j)}
                className={`rounded px-0.5 text-left transition-colors ${w.cut ? "text-[#A1A5A0] line-through opacity-50" : j === active ? "bg-lime/20 text-lime" : "text-[#D9DBD3] hover:bg-carbon"}`}>
                {w.w}{" "}
              </button>
            )
          )}
          <button onClick={() => active >= 0 && ws.setClipWords((c) => ({ ...c, words: c.words.map((x, k) => (k === active ? { ...x, cut: !x.cut } : x)) }))}
            className="mt-3 block rounded-full bg-carbon px-3 py-1.5 text-xs text-[#A1A5A0] hover:text-white">Cut current word</button>
          <span className="mt-1 block text-[10px] text-[#A1A5A0]">Double-click a word to edit it</span>
        </p>
      )}
      {rail === "captions" && (
        <div className="space-y-3 text-xs text-[#A1A5A0]">
          <div className="grid grid-cols-3 gap-2">
            {(["pop", "clean", "box"] as const).map((s) => (
              <button key={s} aria-pressed={cfg.style === s} onClick={() => setCfg((c) => ({ ...c, style: s }))}
                className={`rounded-xl border p-2 ${cfg.style === s ? "border-lime" : "border-[#3A3A3A]"}`}>
                <span className={`block rounded bg-ink px-1 py-2 text-center font-bold uppercase text-white ${s === "box" ? "ring-1 ring-lilac" : ""}`} style={{ fontSize: 9 }}>
                  <span style={{ color: s === "pop" ? "#BDEF72" : "#fff" }}>No</span> way
                </span><span className="mt-1 block capitalize">{s}</span>
              </button>
            ))}
          </div>
          <div className="flex gap-2">{COLORS.map((c) => (
            <button key={c} onClick={() => setCfg((x) => ({ ...x, color: c }))} aria-label={`Color ${c}`} aria-pressed={cfg.color === c}
              className={`h-6 w-6 rounded-full ring-2 ring-offset-2 ring-offset-graphite ${cfg.color === c ? "ring-lime" : "ring-transparent"}`} style={{ background: c }} />
          ))}</div>
        </div>
      )}
      {rail === "layout" && <LayoutButtons ws={ws} />}
      {rail === "adjust" && <AdjustPanel ws={ws} />}
    </>
  );
}
