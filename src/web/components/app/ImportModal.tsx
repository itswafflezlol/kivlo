"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Modal, PlatformGlyph } from "./ui";
import UpgradeModal from "./UpgradeModal";
import { user, presets, clips, projectById } from "@/lib/mock";
import { addProject } from "@/lib/localStore";
import { parseVideoLink, type ParsedLink } from "@/lib/linkParse";
import { ApiError, apiEnabled, createProject } from "@/lib/data";
import { errorMessage, fieldError } from "@/lib/error-message";
import { styledCaption } from "@/app/app/(shell)/presets/page";

const LAYOUTS = [
  { id: "auto", label: "Auto" },
  { id: "split", label: "Facecam + gameplay" },
  { id: "face", label: "Face only" },
] as const;

const CAP_PRESETS = presets.filter((p) => p.kind === "captions");
const FALLBACK_THUMB = clips[0].poster;

function LayoutThumb({ layout, thumb }: { layout: string; thumb: string }) {
  // eslint-disable-next-line @next/next/no-img-element
  const img = (cls: string, style?: React.CSSProperties) => <img src={thumb} alt="" className={cls} style={style} />;
  return (
    <span aria-hidden className="block aspect-[9/16] w-14 overflow-hidden rounded-lg bg-surface-2 ring-1 ring-line">
      {layout === "auto" && img("h-full w-full object-cover")}
      {layout === "split" && (
        <span className="block h-full w-full">
          <span className="block h-[40%] overflow-hidden">{img("h-full w-full scale-[1.7] object-cover object-[50%_15%]")}</span>
          <span className="h-[3px] w-full bg-ink" />
          <span className="block h-[calc(60%-3px)] overflow-hidden">{img("h-full w-full object-cover")}</span>
        </span>
      )}
      {layout === "face" && (
        <span className="block h-full w-full overflow-hidden">{img("h-full w-full scale-[2] object-cover object-[50%_12%]")}</span>
      )}
    </span>
  );
}

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
  const [preset, setPreset] = useState(CAP_PRESETS[0].id);
  const [progress, setProgress] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState<ApiError | null>(null);
  const [upgradeOpen, setUpgradeOpen] = useState(false);
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
  const thumb = info.state === "ok" && info.thumb ? info.thumb : FALLBACK_THUMB;
  const urlErr = fieldError(err, "url");

  const submit = async () => {
    if (!parsed?.ok || submitting) return;
    setErr(null);
    setSubmitting(true);
    try {
      const r = await createProject({
        url: parsed.url, rightsConfirmed: true, layout,
        presetId: preset, idempotencyKey: crypto.randomUUID(),
      });
      if (!apiEnabled) {
        const demo = projectById(r.id);
        if (demo) addProject(demo);
      }
      onClose();
      router.push(`/app/projects/${r.id}`);
    } catch (e) {
      if (e instanceof ApiError && e.status === 402) setUpgradeOpen(true);
      else setErr(e as ApiError);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} label="New import" wide title="New import">
      <div role="tablist" aria-label="Import source" className="mt-4 flex w-fit rounded-full bg-surface-2 p-1 text-sm font-medium">
        {(["link", "upload"] as const).map((t) => (
          <button key={t} role="tab" aria-selected={tab === t} onClick={() => setTab(t)} className={`rounded-full px-4 py-1.5 capitalize ${tab === t ? "bg-surface text-fg shadow-sm" : "text-fg"}`}>
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
                className="w-full rounded-full border border-line-2 px-4 py-2.5 pr-10 text-sm placeholder:text-slate focus:outline-none focus:ring-2 focus:ring-lime" />
              {parsed?.ok && <span className="absolute right-3 top-1/2 -translate-y-1/2"><PlatformGlyph p={parsed.platform} /></span>}
            </div>
            <button onClick={() => check()} disabled={!valid || info.state === "loading"} className="rounded-full bg-fg px-4 py-2.5 text-sm font-semibold text-canvas disabled:opacity-40">
              {info.state === "loading" ? "Checking…" : "Check link"}
            </button>
          </div>

          {parsed && !parsed.ok && parsed.reason !== "empty" && (
            <p role="alert" className="flex items-center gap-2 rounded-xl bg-[#FF6B63]/10 px-3 py-2 text-sm text-error">
              {parsed.message}
            </p>
          )}
          {urlErr && (
            <p role="alert" className="flex items-center gap-2 rounded-xl bg-[#FF6B63]/10 px-3 py-2 text-sm text-error">
              {urlErr}
            </p>
          )}
          {err && !urlErr && err.status !== 402 && (
            <p role="alert" className="flex items-center gap-2 rounded-xl bg-[#FF6B63]/10 px-3 py-2 text-sm text-error">
              {errorMessage(err)}
            </p>
          )}

          {info.state === "private" && (
            <p role="alert" className="rounded-xl bg-[#FF6B63]/10 px-3 py-2 text-sm text-error">
              This video is private, age-restricted, or doesn&apos;t exist.
            </p>
          )}
          {info.state === "offline" && (
            <p className="rounded-xl bg-[#F5A524]/10 px-3 py-2 text-sm text-heat-text">
              Couldn&apos;t load video details — you can still import this link.
            </p>
          )}

          {valid && (info.state === "ok" || info.state === "offline" || info.state === "loading") && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 rounded-xl bg-canvas p-3 ring-1 ring-line">
                {info.state === "ok" && info.thumb ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={info.thumb} alt="" className="h-[54px] w-24 rounded-lg object-cover" />
                ) : (
                  <span className="flex h-[54px] w-24 items-center justify-center rounded-lg bg-surface-2">
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
              <p className="text-sm text-slate">Length is checked when the import starts · 1 credit per 20 min of video · You have <strong className="font-mono text-fg">{left}</strong>.</p>

              <fieldset>
                <legend className="mb-2 text-sm font-medium">Layout</legend>
                <div className="flex gap-2">
                  {LAYOUTS.map((l) => (
                    <button key={l.id} type="button" aria-pressed={layout === l.id} onClick={() => setLayout(l.id)}
                      className="group flex w-[92px] flex-col items-center gap-1.5 text-xs font-medium text-slate">
                      <span className={`relative rounded-lg transition-shadow ${layout === l.id ? "ring-2 ring-lime ring-offset-2 ring-offset-surface" : "opacity-80 group-hover:opacity-100"}`}>
                        <LayoutThumb layout={l.id} thumb={thumb} />
                        {layout === l.id && (
                          <span aria-hidden className="absolute -right-1.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-lime text-ink">
                            <svg viewBox="0 0 12 12" className="h-2.5 w-2.5" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M2.5 6.2l2.3 2.3L9.5 3.6" /></svg>
                          </span>
                        )}
                      </span>
                      <span className={layout === l.id ? "text-fg" : ""}>{l.label}</span>
                    </button>
                  ))}
                </div>
              </fieldset>

              <fieldset>
                <legend className="mb-2 flex w-full items-baseline justify-between text-sm font-medium">
                  Caption preset
                  <Link href="/app/presets" className="text-xs font-medium text-lime-deep hover:underline" onClick={onClose}>See all presets</Link>
                </legend>
                <div className="grid grid-cols-6 gap-1.5">
                  {CAP_PRESETS.map((p) => (
                    <button key={p.id} type="button" aria-pressed={preset === p.id} onClick={() => setPreset(p.id)}
                      className="group flex flex-col items-center gap-1 text-[10px] font-medium text-slate">
                      <span className={`relative aspect-[9/16] w-full overflow-hidden rounded-lg ring-1 ring-line transition-shadow ${preset === p.id ? "ring-2 ring-lime ring-offset-2 ring-offset-surface" : "opacity-80 group-hover:opacity-100"}`}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={thumb} alt="" className="h-full w-full object-cover" />
                        <span className="absolute inset-x-1 bottom-2 text-center text-[8px]">
                          {styledCaption(p, ["NO", "WAY", "HE"], 1)}
                        </span>
                      </span>
                      <span className={`max-w-full truncate ${preset === p.id ? "text-fg" : ""}`}>{p.name}</span>
                    </button>
                  ))}
                </div>
              </fieldset>

              <label className="flex cursor-pointer items-start gap-2.5 text-sm">
                <input type="checkbox" checked={rights} onChange={(e) => setRights(e.target.checked)} className="peer sr-only" />
                <span aria-hidden className="mt-0.5 flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-md border border-line-2 bg-surface transition-colors peer-checked:border-fg peer-checked:bg-ink peer-focus-visible:ring-2 peer-focus-visible:ring-lime">
                  <svg viewBox="0 0 12 12" className={`h-3 w-3 text-lime transition-opacity ${rights ? "opacity-100" : "opacity-0"}`} fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M2.5 6.2l2.3 2.3L9.5 3.6" /></svg>
                </span>
                I have the rights to this content
              </label>

              <button disabled={!rights || !checked || submitting} onClick={() => void submit()}
                className="w-full rounded-full bg-lime py-3 text-sm font-semibold text-ink transition-colors hover:bg-lime-hover disabled:opacity-40">
                {submitting ? "Starting…" : "Find highlights"}
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="mt-5">
          <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-line-2 bg-canvas px-6 py-12 text-center">
            <input type="file" accept="video/*" className="sr-only" onChange={upload} />
            <p className="text-sm font-medium">Drop a video file, or click to browse</p>
            <p className="mt-1 text-xs text-slate">MP4 or MOV, up to 4 hours</p>
            {progress > 0 && (
              <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-surface-2" role="progressbar" aria-valuenow={progress} aria-valuemax={100}>
                <div className="h-full bg-lime transition-all" style={{ width: `${progress}%` }} />
              </div>
            )}
            {progress >= 100 && <p className="mt-2 text-sm text-lime-deep">Uploaded — finding highlights…</p>}
          </label>
        </div>
      )}
      <UpgradeModal open={upgradeOpen} onClose={() => setUpgradeOpen(false)} />
    </Modal>
  );
}
