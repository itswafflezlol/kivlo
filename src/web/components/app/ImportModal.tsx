"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Modal, PlatformGlyph } from "./ui";
import { user, presets } from "@/lib/mock";
import { parseVideoLink, type ParsedLink } from "@/lib/linkParse";

const LAYOUTS = [
  { id: "auto", label: "Auto" },
  { id: "split", label: "Facecam + gameplay" },
  { id: "face", label: "Face only" },
] as const;

let checkSeq = 0;

type VideoInfo =
  | { state: "idle" }
  | { state: "loading" }
  | { state: "ok"; title: string; channel: string; thumb?: string }
  | { state: "private" }
  | { state: "offline"; title: string };

export default function ImportModal({ open, onClose, initialUrl = "" }: { open: boolean; onClose: () => void; initialUrl?: string }) {
  const router = useRouter();
  const [tab, setTab] = useState<"link" | "upload">("link");
  const [url, setUrl] = useState(initialUrl);
  const [parsed, setParsed] = useState<ParsedLink | null>(initialUrl ? parseVideoLink(initialUrl) : null);
  const [info, setInfo] = useState<VideoInfo>({ state: "idle" });
  const [checked, setChecked] = useState(false);
  const [rights, setRights] = useState(false);
  const [layout, setLayout] = useState("auto");
  const [preset, setPreset] = useState(presets[0].name);
  const [progress, setProgress] = useState(0);
  const deb = useRef<ReturnType<typeof setTimeout>>(undefined);

  const left = user.creditsTotal - user.creditsUsed;

  const check = async (p = parsed) => {
    if (!p?.ok) { setInfo({ state: "idle" }); return; }
    const seq = ++checkSeq;
    setChecked(true);
    if (p.platform === "twitch") {
      setInfo({
        state: "ok",
        title: p.kind === "clip" ? `Twitch clip${p.channel ? ` by ${p.channel}` : ""}` : `Twitch VOD #${p.id}`,
        channel: p.channel ?? "Twitch",
      });
      return;
    }
    setInfo({ state: "loading" });
    try {
      const r = await fetch(`https://www.youtube.com/oembed?url=${encodeURIComponent(p.url)}&format=json`);
      if (seq !== checkSeq) return;
      if (!r.ok) { setInfo({ state: "private" }); return; }
      const j = (await r.json()) as { title?: string; author_name?: string };
      setInfo({ state: "ok", title: j.title ?? "YouTube video", channel: j.author_name ?? "YouTube", thumb: `https://i.ytimg.com/vi/${p.id}/hqdefault.jpg` });
    } catch {
      if (seq !== checkSeq) return;
      setInfo({ state: "offline", title: "YouTube video" });
    }
  };

  // detect as you type (debounced)
  useEffect(() => {
    clearTimeout(deb.current);
    deb.current = setTimeout(() => {
      const p = url.trim() ? parseVideoLink(url) : null;
      setParsed(p);
      setChecked(false);
      setInfo({ state: "idle" });
      // auto-check when a valid YouTube link is fully pasted
      if (p?.ok && p.platform === "youtube") void check(p);
    }, 250);
    return () => clearTimeout(deb.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url]);

  const upload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    setProgress(1);
    const t = setInterval(() => setProgress((p) => (p >= 100 ? (clearInterval(t), 100) : p + 17)), 300);
  };

  const valid = parsed?.ok === true;

  return (
    <Modal open={open} onClose={onClose} label="New import" wide title="New import">
      <div role="tablist" aria-label="Import source" className="mt-4 flex w-fit rounded-full bg-mist p-1 text-sm font-medium">
        {(["link", "upload"] as const).map((t) => (
          <button key={t} role="tab" aria-selected={tab === t} onClick={() => setTab(t)} className={`rounded-full px-4 py-1.5 capitalize ${tab === t ? "bg-white text-ink shadow-sm" : "text-slate"}`}>
            {t === "link" ? "Link" : "Upload"}
          </button>
        ))}
      </div>

      {tab === "link" ? (
        <div className="mt-5 space-y-4">
          <div className="flex items-center gap-2">
            <label htmlFor="import-url" className="sr-only">Video link</label>
            <div className="relative flex-1">
              <input id="import-url" type="url" value={url} onChange={(e) => setUrl(e.target.value)}
                placeholder="Paste a YouTube or Twitch link"
                className="w-full rounded-full border border-black/10 px-4 py-2.5 pr-10 text-sm placeholder:text-slate focus:outline-none focus:ring-2 focus:ring-lime" />
              {parsed?.ok && <span className="absolute right-3 top-1/2 -translate-y-1/2"><PlatformGlyph p={parsed.platform} /></span>}
            </div>
            <button onClick={() => check()} disabled={!valid || info.state === "loading"} className="rounded-full bg-ink px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-40">
              {info.state === "loading" ? "Checking…" : "Check link"}
            </button>
          </div>

          {parsed && !parsed.ok && parsed.reason !== "empty" && (
            <p role="alert" className="flex items-center gap-2 rounded-xl bg-[#FF6B63]/10 px-3 py-2 text-sm text-[#B3261E]">
              {parsed.message}
            </p>
          )}

          {info.state === "private" && (
            <p role="alert" className="rounded-xl bg-[#FF6B63]/10 px-3 py-2 text-sm text-[#B3261E]">
              This video is private, age-restricted, or doesn&apos;t exist.
            </p>
          )}
          {info.state === "offline" && (
            <p className="rounded-xl bg-[#F5A524]/10 px-3 py-2 text-sm text-[#8A5300]">
              Couldn&apos;t load video details — you can still import this link.
            </p>
          )}

          {valid && (info.state === "ok" || info.state === "offline" || info.state === "loading") && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 rounded-xl bg-paper p-3 ring-1 ring-black/5">
                {info.state === "ok" && info.thumb ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={info.thumb} alt="" className="h-[54px] w-24 rounded-lg object-cover" />
                ) : (
                  <span className="flex h-[54px] w-24 items-center justify-center rounded-lg bg-mist">
                    {parsed.ok && <PlatformGlyph p={parsed.platform} size={26} />}
                  </span>
                )}
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">
                    {info.state === "loading" ? "Checking link…" : info.title}
                  </p>
                  <p className="text-xs text-slate">
                    {info.state === "ok" && info.channel !== "Twitch" ? info.channel : parsed.ok ? (parsed.platform === "twitch" ? "Twitch" : "YouTube") : ""}
                    {parsed.ok && parsed.kind !== "video" ? ` · ${parsed.kind}` : ""}
                    {parsed.ok && parsed.startSec ? ` · starts at ${Math.floor(parsed.startSec / 60)}:${String(parsed.startSec % 60).padStart(2, "0")}` : ""}
                  </p>
                </div>
              </div>
              <p className="text-sm text-slate">Length is checked when the import starts · 1 credit per 20 min of video · You have <strong className="font-mono text-ink">{left}</strong>.</p>

              <fieldset>
                <legend className="mb-2 text-sm font-medium">Layout</legend>
                <div className="grid grid-cols-3 gap-2">
                  {LAYOUTS.map((l) => (
                    <button key={l.id} type="button" aria-pressed={layout === l.id} onClick={() => setLayout(l.id)}
                      className={`relative rounded-xl border p-3 text-left text-xs font-medium transition-colors ${layout === l.id ? "border-ink bg-lime-soft" : "border-hairline hover:border-slate"}`}>
                      {layout === l.id && (
                        <span aria-hidden className="absolute right-2 top-2 flex h-4 w-4 items-center justify-center rounded-full bg-ink text-lime">
                          <svg viewBox="0 0 12 12" className="h-2.5 w-2.5" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M2.5 6.2l2.3 2.3L9.5 3.6" /></svg>
                        </span>
                      )}
                      <span aria-hidden className="mb-2 block aspect-[9/16] w-9 overflow-hidden rounded-md bg-mist ring-1 ring-black/5">
                        {l.id === "auto" && <span className="block h-full w-full bg-lilac-soft" />}
                        {l.id === "split" && (<span className="block h-full"><span className="block h-[40%] bg-white ring-1 ring-black/10" /><span className="block h-[60%] bg-lilac-soft" /></span>)}
                        {l.id === "face" && (<span className="flex h-full items-center justify-center"><span className="block h-5 w-5 rounded-full bg-white ring-1 ring-black/10" /></span>)}
                      </span>
                      {l.label}
                    </button>
                  ))}
                </div>
              </fieldset>

              <label className="relative block text-sm font-medium">
                Caption preset
                <select value={preset} onChange={(e) => setPreset(e.target.value)} className="mt-1 w-full appearance-none rounded-xl border border-black/10 bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-lime">
                  {presets.map((p) => <option key={p.id}>{p.name}</option>)}
                </select>
                <svg aria-hidden viewBox="0 0 12 12" className="pointer-events-none absolute bottom-3.5 right-3 h-3 w-3 text-slate" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M3 4.5l3 3 3-3" /></svg>
              </label>

              <label className="flex cursor-pointer items-start gap-2.5 text-sm">
                <input type="checkbox" checked={rights} onChange={(e) => setRights(e.target.checked)} className="peer sr-only" />
                <span aria-hidden className="mt-0.5 flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-md border border-black/20 bg-white transition-colors peer-checked:border-ink peer-checked:bg-ink peer-focus-visible:ring-2 peer-focus-visible:ring-lime">
                  <svg viewBox="0 0 12 12" className={`h-3 w-3 text-lime transition-opacity ${rights ? "opacity-100" : "opacity-0"}`} fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M2.5 6.2l2.3 2.3L9.5 3.6" /></svg>
                </span>
                I have the rights to this content
              </label>

              <button disabled={!rights || !checked} onClick={() => { onClose(); router.push("/app/projects/new-demo"); }}
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
