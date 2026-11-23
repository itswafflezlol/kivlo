"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { PlatformGlyph } from "@/components/app/ui";
import { parseVideoLink } from "@/lib/linkParse";
import { presets, type PostPlatform } from "@/lib/mock";

const PLATFORMS: { id: PostPlatform | "twitch"; label: string }[] = [
  { id: "tiktok", label: "TikTok" },
  { id: "shorts", label: "Shorts" },
  { id: "reels", label: "Reels" },
  { id: "x", label: "X" },
];
const STEPS = ["Where do you post?", "Pick a caption style", "Paste your first link"];

export default function Onboarding() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [plats, setPlats] = useState<string[]>(["tiktok"]);
  const [preset, setPreset] = useState(presets[0].name);
  const [url, setUrl] = useState("");
  const [err, setErr] = useState("");

  const next = () => {
    if (step === 2) {
      const raw = url.trim();
      if (raw) {
        const p = parseVideoLink(raw);
        if (!p.ok) { setErr(p.message); return; }
        router.push(`/app?url=${encodeURIComponent(p.url)}`);
        return;
      }
      router.push("/app");
      return;
    }
    setStep(step + 1);
  };

  return (
    <div className="mx-auto max-w-xl pt-8">
      <div className="flex items-center justify-center gap-2" aria-label={`Step ${step + 1} of 3`}>
        {[0, 1, 2].map((i) => (
          <span key={i} className={`h-2 rounded-full transition-all ${i === step ? "w-6 bg-lime" : i < step ? "w-2 bg-ink" : "w-2 bg-black/10"}`} />
        ))}
      </div>
      <h2 className="mt-8 text-center font-heading text-3xl font-bold">{STEPS[step]}</h2>

      {step === 0 && (
        <div className="mt-8 grid grid-cols-2 gap-3">
          {PLATFORMS.map((p) => (
            <button key={p.id} aria-pressed={plats.includes(p.id)}
              onClick={() => setPlats(plats.includes(p.id) ? plats.filter((x) => x !== p.id) : [...plats, p.id])}
              className={`flex items-center gap-3 rounded-2xl p-4 text-left text-sm font-medium shadow-sm ring-1 transition-all ${plats.includes(p.id) ? "bg-lime-soft ring-ink" : "bg-white ring-black/5 hover:shadow"}`}>
              <PlatformGlyph p={p.id} size={24} />
              {p.label}
              {plats.includes(p.id) && <span aria-hidden className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-ink text-lime text-[10px]">✓</span>}
            </button>
          ))}
        </div>
      )}

      {step === 1 && (
        <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-5">
          {presets.filter((p) => p.kind === "captions").slice(0, 5).map((p) => (
            <button key={p.id} aria-pressed={preset === p.name} onClick={() => setPreset(p.name)}
              className={`rounded-2xl p-3 text-center shadow-sm ring-1 transition-all ${preset === p.name ? "bg-lime-soft ring-ink" : "bg-white ring-black/5 hover:shadow"}`}>
              <span aria-hidden className="mx-auto mb-2 flex aspect-[9/16] w-12 items-end justify-center rounded-lg bg-mist pb-2">
                <span className="rounded px-1 text-[9px] font-bold" style={{ backgroundColor: p.color === "#FFFFFF" ? "rgba(0,0,0,0.7)" : p.color, color: p.color === "#FFFFFF" ? "#fff" : "#181818" }}>
                  DID THAT
                </span>
              </span>
              <span className="block text-[11px] font-medium">{p.name}</span>
            </button>
          ))}
        </div>
      )}

      {step === 2 && (
        <div className="mt-8">
          <label htmlFor="ob-url" className="sr-only">Video link</label>
          <input id="ob-url" type="url" value={url} onChange={(e) => { setUrl(e.target.value); setErr(""); }}
            placeholder="Paste a YouTube or Twitch link"
            className="w-full rounded-full border border-black/10 bg-white px-5 py-3 text-sm shadow-sm placeholder:text-slate focus:outline-none focus:ring-2 focus:ring-lime" />
          {err && <p role="alert" className="mt-2 text-center text-sm font-medium text-[#B3261E]">{err}</p>}
          <p className="mt-2 text-center text-xs text-slate">You can also skip this and import later.</p>
        </div>
      )}

      <div className="mt-8 flex items-center justify-between">
        <button onClick={() => (step ? setStep(step - 1) : router.push("/app"))} className="rounded-full px-4 py-2 text-sm font-medium text-slate hover:text-ink">
          {step === 0 ? "Skip" : "Back"}
        </button>
        <button onClick={next} className="rounded-full bg-lime px-6 py-2.5 text-sm font-semibold text-ink hover:bg-lime-hover">
          {step === 2 ? "Go to dashboard" : "Continue"}
        </button>
      </div>
    </div>
  );
}
