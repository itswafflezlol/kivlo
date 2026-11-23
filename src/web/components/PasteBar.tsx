"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowCircle } from "./ArrowPill";

export default function PasteBar() {
  const router = useRouter();
  const [url, setUrl] = useState("");

  return (
    <form
      className="mx-auto flex w-full max-w-xl items-center gap-2 rounded-full border border-control-border bg-white p-1.5 shadow-[0_8px_30px_-12px_rgba(0,0,0,0.15)]"
      onSubmit={(e) => {
        e.preventDefault();
        router.push(
          url.trim()
            ? `/signup?url=${encodeURIComponent(url.trim())}`
            : "/signup"
        );
      }}
    >
      <label htmlFor="hero-link" className="sr-only">
        YouTube or Twitch link
      </label>
      <input
        id="hero-link"
        type="url"
        inputMode="url"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder="Paste a video link"
        className="min-w-0 flex-1 rounded-full bg-transparent px-4 py-2.5 text-sm text-ink placeholder:text-slate focus:outline-none"
      />
      <button
        type="submit"
        className="flex shrink-0 items-center gap-2 rounded-full bg-lime py-2 pl-5 pr-2 text-sm font-semibold text-ink transition-colors duration-150 ease-out hover:bg-lime-hover"
      >
        Get clips free
        <ArrowCircle />
      </button>
    </form>
  );
}
