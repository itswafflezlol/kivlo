"use client";

import { asset } from "@/lib/asset";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Modal, PlatformGlyph } from "./ui";
import { user, creditsFor, presets } from "@/lib/mock";

const LAYOUTS = [
  { id: "auto", label: "Auto" },
  { id: "split", label: "Facecam + gameplay" },
  { id: "face", label: "Face only" },
] as const;

export default function ImportModal({ open, onClose, initialUrl = "" }: { open: boolean; onClose: () => void; initialUrl?: string }) {
  const router = useRouter();
  const [tab, setTab] = useState<"link" | "upload">("link");
  const [url, setUrl] = useState(initialUrl);
  const [phase, setPhase] = useState<"idle" | "checking" | "ok" | "error">("idle");
  const [rights, setRights] = useState(false);
  const [layout, setLayout] = useState("auto");
  const [preset, setPreset] = useState(presets[0].name);
  const [progress, setProgress] = useState(0);

  const platform = /youtu\.?be/.test(url) ? "youtube" : /twitch\.tv/.test(url) ? "twitch" : null;
  const minutes = 143;
  const cost = creditsFor(minutes);
  const left = user.creditsTotal - user.creditsUsed;

  const check = () => {
    if (!platform) { setPhase("error"); return; }
    setPhase("checking");
    setTimeout(() => setPhase("ok"), 1200);
  };

  const upload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    setProgress(1);
    const t = setInterval(() => setProgress((p) => (p >= 100 ? (clearInterval(t), 100) : p + 17)), 300);
  };

  return (
    <Modal open={open} onClose={onClose} label="New import" wide>
      <div className="flex items-center justify-between">
        <h2 className="font-heading text-xl font-bold">New import</h2>
        <div role="tablist" aria-label="Import source" className="flex rounded-full bg-mist p-1 text-sm font-medium">
          {(["link", "upload"] as const).map((t) => (
            <button key={t} role="tab" aria-selected={tab === t} onClick={() => setTab(t)} className={`rounded-full px-4 py-1.5 capitalize ${tab === t ? "bg-white text-ink shadow-sm" : "text-slate"}`}>
              {t === "link" ? "Link" : "Upload"}
            </button>
          ))}
        </div>
      </div>

      {tab === "link" ? (
        <div className="mt-5 space-y-4">
          <div className="flex items-center gap-2">
            <label htmlFor="import-url" className="sr-only">Video link</label>
            <div className="relative flex-1">
              <input id="import-url" type="url" value={url} onChange={(e) => { setUrl(e.target.value); setPhase("idle"); }}
                placeholder="Paste a YouTube or Twitch link"
                className="w-full rounded-full border border-black/10 px-4 py-2.5 pr-10 text-sm placeholder:text-slate focus:outline-none focus:ring-2 focus:ring-lime" />
              {platform && <span className="absolute right-3 top-1/2 -translate-y-1/2"><PlatformGlyph p={platform} /></span>}
            </div>
            <button onClick={check} disabled={phase === "checking" || !url.trim()} className="rounded-full bg-ink px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-40">
              {phase === "checking" ? "Checking…" : "Check link"}
            </button>
          </div>

          {phase === "error" && (
            <p role="alert" className="rounded-lg bg-[#FF6B63]/10 px-3 py-2 text-sm text-[#B3261E]">
              That link didn&apos;t work. Check it&apos;s public and try again.
            </p>
          )}

          {phase === "ok" && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 rounded-xl bg-paper p-3 ring-1 ring-black/5">
                <Image src={asset("/videos/raw/jasontheween-1.jpg")} alt="" width={1280} height={720} className="h-[54px] w-auto rounded-lg" />
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">Adapt &amp; Marlon collab stream</p>
                  <p className="text-xs text-slate">Twitch · 2h 23m</p>
                </div>
              </div>
              <p className="text-sm">This video uses <strong className="font-mono">{cost}</strong> credits. You have <strong className="font-mono">{left}</strong>.</p>

              <fieldset>
                <legend className="mb-2 text-sm font-medium">Layout</legend>
                <div className="grid grid-cols-3 gap-2">
                  {LAYOUTS.map((l) => (
                    <button key={l.id} type="button" aria-pressed={layout === l.id} onClick={() => setLayout(l.id)}
                      className={`rounded-xl border p-3 text-left text-xs font-medium transition-colors ${layout === l.id ? "border-ink bg-lime-soft" : "border-hairline hover:border-slate"}`}>
                      <span aria-hidden className="mb-2 block aspect-[9/16] w-8 rounded bg-white ring-1 ring-black/5">
                        {l.id === "split" && <span className="block h-1/2 rounded-t bg-lilac-soft" />}
                        {l.id === "face" && <span className="m-auto mt-2 block h-4 w-4 rounded-full bg-lilac-soft" />}
                        {l.id === "auto" && <span className="m-auto mt-2 block h-4 w-4 rounded bg-lime-soft" />}
                      </span>
                      {l.label}
                    </button>
                  ))}
                </div>
              </fieldset>

              <label className="block text-sm font-medium">
                Caption preset
                <select value={preset} onChange={(e) => setPreset(e.target.value)} className="mt-1 w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-sm">
                  {presets.map((p) => <option key={p.id}>{p.name}</option>)}
                </select>
              </label>

              <label className="flex items-start gap-2 text-sm">
                <input type="checkbox" checked={rights} onChange={(e) => setRights(e.target.checked)} className="mt-0.5 accent-ink" />
                I have the rights to this content
              </label>

              <button disabled={!rights} onClick={() => { onClose(); router.push("/app/projects/new-demo"); }}
                className="w-full rounded-full bg-lime py-3 text-sm font-semibold text-ink transition-colors hover:bg-lime-hover disabled:opacity-40">
                Find highlights
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="mt-5">
          <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-black/10 bg-paper px-6 py-12 text-center">
            <input type="file" accept="video/*" className="sr-only" onChange={upload} />
            <p className="text-sm font-medium">Drop a video file, or click to browse</p>
            <p className="mt-1 text-xs text-slate">MP4 or MOV, up to 4 hours</p>
            {progress > 0 && (
              <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-mist" role="progressbar" aria-valuenow={progress} aria-valuemax={100}>
                <div className="h-full bg-lime transition-all" style={{ width: `${progress}%` }} />
              </div>
            )}
            {progress >= 100 && <p className="mt-2 text-sm text-lime-deep">Uploaded — finding highlights…</p>}
          </label>
        </div>
      )}
    </Modal>
  );
}
