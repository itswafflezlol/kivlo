import { asset } from "@/lib/asset";
import Reveal from "./Reveal";
import ArrowPill from "./ArrowPill";

const POINTS = [
  "Credits at a glance — see what you have left before you import",
  "Every project in one place — clips, scores and sources",
  "What's posting next — your week, already scheduled",
];

export default function DashboardShowcase() {
  return (
    <section className="mx-auto max-w-[1200px] px-5 pb-28">
      <Reveal className="flex flex-wrap items-end justify-between gap-6">
        <div className="max-w-2xl">
          <h2 className="font-heading text-balance text-3xl font-bold sm:text-4xl">
            Your clipping HQ
          </h2>
          <ul className="mt-5 flex flex-wrap gap-x-6 gap-y-2">
            {POINTS.map((p) => (
              <li key={p} className="flex items-start gap-2 text-sm leading-relaxed text-slate">
                <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-lime-deep" aria-hidden="true" />
                {p}
              </li>
            ))}
          </ul>
        </div>
        <ArrowPill href="/app">Open the dashboard</ArrowPill>
      </Reveal>

      <Reveal delay={120}>
        <div className="relative mt-10">
          {/* browser frame */}
          <div className="overflow-hidden rounded-2xl bg-white shadow-[0_40px_80px_-40px_rgba(24,24,24,0.35)]">
            <div className="flex items-center gap-2 border-b border-black/5 bg-paper px-4 py-2.5">
              <span className="h-2.5 w-2.5 rounded-full bg-black/10" />
              <span className="h-2.5 w-2.5 rounded-full bg-black/10" />
              <span className="h-2.5 w-2.5 rounded-full bg-black/10" />
              <span className="mx-auto rounded-full bg-white px-4 py-0.5 font-mono text-[10px] text-slate ring-1 ring-black/5">kivlo</span>
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={asset("/screens/dashboard.webp")} alt="The Kivlo dashboard: credits, projects and scheduled posts" className="block w-full" />
          </div>
          {/* workspace accent card */}
          <div className="absolute -bottom-8 -left-3 hidden w-[32%] overflow-hidden rounded-xl border-[5px] border-ink bg-ink shadow-[0_30px_60px_-30px_rgba(24,24,24,0.5)] sm:-left-6 sm:block">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={asset("/screens/workspace-card.webp")} alt="KivloWorkspace timeline and stage" className="block w-full" />
          </div>
          {/* phone */}
          <div className="absolute -bottom-10 right-0 w-[24%] overflow-hidden rounded-[24px] border-[5px] border-ink bg-ink shadow-[0_30px_60px_-30px_rgba(24,24,24,0.5)] sm:-right-6">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={asset("/screens/dashboard-phone.webp")} alt="Kivlo dashboard on mobile" className="block w-full" />
          </div>
        </div>
      </Reveal>
    </section>
  );
}
