"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowCircle } from "./ArrowPill";
import { parseVideoLink } from "@/lib/linkParse";

export default function PasteBar() {
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const raw = url.trim();
    if (!raw) { router.push("/signup"); return; }
    const p = parseVideoLink(raw);
    if (!p.ok) { setError(p.message); return; }
    router.push(`/signup?url=${encodeURIComponent(p.url)}`);
  };

  return (
    <div className="mx-auto w-full max-w-xl">
      <form
        className="flex w-full items-center gap-2 rounded-full border border-control-border bg-white p-1.5 shadow-[0_8px_30px_-12px_rgba(0,0,0,0.15)]"
        onSubmit={submit}
      >
        <label htmlFor="hero-link" className="sr-only">
          YouTube or Twitch link
        </label>
        <input
          id="hero-link"
          type="url"
          inputMode="url"
          value={url}
          onChange={(e) => { setUrl(e.target.value); setError(""); }}
          placeholder="Paste a video link"
          className="min-w-0 flex-1 rounded-full bg-transparent px-4 py-2.5 text-sm text-ink placeholder:text-slate focus:outline-none"
        />
        <button
          type="submit"
          className="group flex shrink-0 items-center gap-2 rounded-full bg-lime py-2 pl-5 pr-2 text-sm font-semibold text-ink transition-colors duration-150 ease-out hover:bg-lime-hover"
        >
          Get clips free
          <ArrowCircle />
        </button>
      </form>
      {error && (
        <p role="alert" className="mt-2 text-center text-sm font-medium text-[#B3261E]">
          {error}
        </p>
      )}
    </div>
  );
}
