const ITEMS = [
  "TikTok",
  "YouTube Shorts",
  "Instagram Reels",
  "X",
  "Twitch",
  "YouTube",
];

export default function PlatformMarquee() {
  const row = (key: string) => (
    <div key={key} className="flex shrink-0 items-center gap-10 pr-10">
      {ITEMS.map((p) => (
        <span
          key={p}
          className="flex items-center gap-2 text-sm font-medium text-slate"
        >
          <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-slate/50" />
          {p}
        </span>
      ))}
    </div>
  );

  return (
    <section className="mx-auto flex max-w-[1200px] items-center gap-8 px-5 py-8">
      <p className="hidden shrink-0 text-sm font-medium text-slate sm:block">
        Clip from Twitch and YouTube. Post to:
      </p>
      <div
        className="marquee relative min-w-0 flex-1 overflow-hidden"
        aria-label="Supported platforms"
      >
        <div className="marquee-track flex w-max">
          {row("a")}
          <span aria-hidden="true">{row("b")}</span>
        </div>
      </div>
    </section>
  );
}
