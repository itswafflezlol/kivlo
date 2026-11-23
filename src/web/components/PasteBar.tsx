"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function PasteBar() {
  const router = useRouter();
  const [url, setUrl] = useState("");

  return (
    <form
      className="mx-auto flex w-full max-w-xl items-center gap-2 rounded-full border border-control-border-dark bg-carbon p-1.5"
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
        className="min-w-0 flex-1 rounded-full bg-transparent px-4 py-2.5 text-sm text-white placeholder:text-slate-dark focus:outline-none"
      />
      <button
        type="submit"
        className="shrink-0 rounded-full bg-lime px-5 py-2.5 text-sm font-semibold text-ink transition-colors duration-150 ease-out hover:bg-lime-hover"
      >
        Get clips free
      </button>
    </form>
  );
}
