const moments = [
  { score: 92, title: "The chat goes silent", len: "0:42", badge: "bg-lime text-ink", selected: true },
  { score: 87, title: "Clutch 1v4 with 3 HP", len: "0:31", badge: "bg-lime text-ink", selected: false },
  { score: 74, title: "He reads the donation out loud", len: "0:55", badge: "bg-heat text-ink", selected: false },
  { score: 41, title: "Setting up the stream", len: "0:28", badge: "bg-hairline-dark text-slate-dark", selected: false },
];

function MomentList() {
  return (
    <div className="flex flex-col gap-1.5">
      <p className="px-2 pb-1 text-[11px] font-semibold uppercase tracking-wider text-slate-dark">
        Moments
      </p>
      {moments.map((m) => (
        <div
          key={m.score}
          className={`flex items-center gap-2.5 rounded-lg px-2 py-2 ${
            m.selected
              ? "border-l-2 border-lime bg-carbon"
              : "border-l-2 border-transparent"
          }`}
        >
          <span
            className={`rounded-md px-1.5 py-0.5 font-[family-name:var(--font-jetbrains)] text-[11px] font-medium ${m.badge}`}
          >
            {m.score}
          </span>
          <span className="flex-1 truncate text-xs text-white">{m.title}</span>
          <span className="font-[family-name:var(--font-jetbrains)] text-[11px] text-slate-dark">
            {m.len}
          </span>
        </div>
      ))}
    </div>
  );
}

function Preview() {
  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative aspect-[9/16] w-[200px] max-w-full overflow-hidden rounded-xl border border-hairline-dark bg-gradient-to-b from-ink to-carbon">
        <div className="absolute inset-x-3 top-3 h-[38%] rounded-lg bg-graphite" />
        <div className="absolute inset-x-3 bottom-3 top-[44%] rounded-lg bg-carbon" />
        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 px-2 text-center">
          <p className="text-sm font-extrabold uppercase leading-snug tracking-wide text-white">
            No way he
          </p>
          <p className="text-sm font-extrabold uppercase leading-snug tracking-wide">
            <span className="text-white">Hit </span>
            <span className="rounded-sm bg-lime px-1 text-ink">that</span>
          </p>
        </div>
      </div>
      <div className="w-[200px] max-w-full">
        <div className="relative h-1.5 rounded-full bg-hairline-dark">
          <div className="absolute left-[15%] right-[30%] h-full rounded-full bg-lime" />
          <div className="absolute left-[15%] top-1/2 h-3 w-0.5 -translate-y-1/2 bg-lime" />
        </div>
        <div className="mt-1.5 flex justify-between font-[family-name:var(--font-jetbrains)] text-[11px] text-slate-dark">
          <span>00:12</span>
          <span>00:54</span>
        </div>
      </div>
    </div>
  );
}

export default function HeroMock() {
  return (
    <div className="dark-focus mx-auto w-full max-w-[1000px] overflow-hidden rounded-2xl border border-hairline-dark bg-graphite text-left shadow-[0_24px_60px_-24px_rgba(0,0,0,0.45)]">
      {/* top bar */}
      <div className="flex items-center justify-between border-b border-hairline-dark bg-carbon px-4 py-2.5">
        <div className="flex items-center gap-1.5" aria-hidden="true">
          <span className="h-2.5 w-2.5 rounded-full bg-hairline-dark" />
          <span className="h-2.5 w-2.5 rounded-full bg-hairline-dark" />
          <span className="h-2.5 w-2.5 rounded-full bg-hairline-dark" />
        </div>
        <span className="text-xs font-medium text-slate-dark">KivloWorkspace</span>
        <span className="rounded-full bg-lime px-3 py-1 text-[11px] font-semibold text-ink">
          Export
        </span>
      </div>

      <div className="grid gap-5 p-4 sm:p-5 md:grid-cols-[1fr_auto_1fr]">
        <MomentList />
        <Preview />
        <div className="hidden md:block">
          <div className="flex gap-4 border-b border-hairline-dark text-xs">
            <span className="pb-2 text-slate-dark">Layout</span>
            <span className="border-b-2 border-lime pb-2 font-semibold text-white">
              Captions
            </span>
            <span className="pb-2 text-slate-dark">Preset</span>
          </div>
          <dl className="mt-4 flex flex-col gap-3 text-xs">
            {[
              ["Style", "Bold Pop"],
              ["Size", "Large"],
              ["Position", "Middle"],
            ].map(([k, v]) => (
              <div key={k} className="flex items-center justify-between">
                <dt className="text-slate-dark">{k}</dt>
                <dd className="rounded-md bg-carbon px-2 py-1 text-white">{v}</dd>
              </div>
            ))}
          </dl>
          <div className="mt-4">
            <span className="rounded-full border border-hairline-dark px-2.5 py-1 text-[11px] text-slate-dark">
              Preset: My style (default)
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
