"use client";

import { useState } from "react";

const QUEUE = [
  { id: "t1", url: "youtube.com/watch?v=kQ2mR…", claimant: "Kai Cenat (UTA)", filed: "21h 12m ago", left: "2h 48m", status: "pending", repeat: false },
  { id: "t2", url: "youtube.com/watch?v=9XvLp…", claimant: "CLIX", filed: "19h 02m ago", left: "4h 58m", status: "pending", repeat: true },
  { id: "t3", url: "twitch.tv/videos/2003…", claimant: "Lacy", filed: "3h 40m ago", left: "20h 20m", status: "pending", repeat: false },
  { id: "t4", url: "youtube.com/watch?v=Tv81z…", claimant: "ExtraEmily", filed: "1d 4h ago", left: "—", status: "removed", repeat: false },
];
const STATS = [["Signups this week", "312"], ["Paying users", "1,208"], ["Cost per credit", "$0.31"]];

export default function Admin() {
  const [killSwitch, setKillSwitch] = useState(false);
  const [rows, setRows] = useState(QUEUE);
  return (
    <div className="min-h-screen bg-paper px-5 py-10 text-ink">
      <div className="mx-auto max-w-4xl">
        <div className="flex items-center justify-between">
          <h1 className="font-heading text-2xl font-bold">Admin · DMCA takedowns</h1>
          <span className="rounded-full bg-ink px-3 py-1 font-mono text-[11px] text-lime">founder demo</span>
        </div>
        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          {STATS.map(([l, v]) => (
            <div key={l} className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/5">
              <p className="text-xs text-slate">{l}</p>
              <p className="mt-1 font-mono text-2xl font-medium">{v}</p>
            </div>
          ))}
        </div>
        <div className="mt-6 flex items-center justify-between rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/5">
          <div>
            <p className="text-sm font-medium">Link imports</p>
            <p className="text-xs text-slate">Kill switch — pauses all new link imports instantly.</p>
          </div>
          <button role="switch" aria-checked={killSwitch} onClick={() => setKillSwitch(!killSwitch)}
            className={`relative h-7 w-12 rounded-full transition-colors ${killSwitch ? "bg-[#B3261E]" : "bg-lime"}`}>
            <span className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-all ${killSwitch ? "left-6" : "left-1"}`} />
          </button>
        </div>
        <div className="mt-6 overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-black/5">
          <table className="w-full text-left text-sm">
            <thead><tr className="text-xs text-slate"><th className="p-4 font-medium">Source</th><th className="p-4 font-medium">Claimant</th><th className="p-4 font-medium">Filed</th><th className="p-4 font-medium">24h left</th><th className="p-4 font-medium">Status</th><th className="p-4"><span className="sr-only">Actions</span></th></tr></thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={r.id} className={i ? "border-t border-black/5" : ""}>
                  <td className="p-4 font-mono text-xs">{r.url}</td>
                  <td className="p-4">{r.claimant}{r.repeat && <span className="ml-2 rounded-full bg-[#FF6B63]/15 px-2 py-0.5 text-[10px] font-medium text-[#B3261E]">repeat</span>}</td>
                  <td className="p-4 text-xs text-slate">{r.filed}</td>
                  <td className="p-4 font-mono text-xs">{r.left}</td>
                  <td className="p-4"><span className={`rounded-full px-2.5 py-1 text-xs font-medium capitalize ${r.status === "pending" ? "bg-[#F5A524]/15 text-[#8A5300]" : "bg-mist text-slate"}`}>{r.status}</span></td>
                  <td className="p-4 text-right">
                    {r.status === "pending" && (
                      <button onClick={() => setRows(rows.map((x) => x.id === r.id ? { ...x, status: "removed" } : x))}
                        className="rounded-full bg-[#B3261E] px-3 py-1.5 text-xs font-semibold text-white">Remove content</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
