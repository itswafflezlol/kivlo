import Image from "next/image";
import { asset } from "@/lib/asset";
import Reveal from "./Reveal";
import InViewVideo from "./InViewVideo";

function Bubble({ bg, children }: { bg: string; children: React.ReactNode }) {
  return (
    <span
      aria-hidden="true"
      className={`mx-1 inline-flex h-[1.1em] w-[1.1em] translate-y-[0.15em] items-center justify-center rounded-full ${bg}`}
    >
      {children}
    </span>
  );
}

const card =
  "rounded-[20px] p-7 transition-transform duration-200 ease-out hover:-translate-y-0.5";

export default function FeaturesBento() {
  return (
    <section
      id="features"
      className="mx-auto max-w-[1200px] scroll-mt-24 px-5 py-24"
    >
      <Reveal>
        <p className="text-center font-[family-name:var(--font-jetbrains)] text-xs font-medium uppercase tracking-[0.12em] text-slate">
          • What Kivlo does
        </p>
        <h2 className="mx-auto mt-4 max-w-3xl text-center font-heading text-balance text-3xl font-semibold leading-[1.15] sm:text-5xl">
          Kivlo finds the
          <Bubble bg="bg-lime">
            <svg width="0.55em" height="0.55em" viewBox="0 0 16 16">
              <path
                d="M8 1l1.8 4.7L14.5 8l-4.7 2.3L8 15l-1.8-4.7L1.5 8l4.7-2.3z"
                fill="#181818"
              />
            </svg>
          </Bubble>
          moments, frames the
          <Bubble bg="bg-lilac-soft">
            <svg width="0.55em" height="0.55em" viewBox="0 0 16 16" fill="none">
              <path
                d="M5 1v3M5 11v3M11 1v3M11 11v3M1 5h3M11 5h3M1 11h3M11 11h3M5 5h6v6H5z"
                stroke="#181818"
                strokeWidth="1.5"
              />
            </svg>
          </Bubble>
          shot, and writes the
          <Bubble bg="bg-heat">
            <svg width="0.55em" height="0.55em" viewBox="0 0 16 16" fill="none">
              <path
                d="M6 1L4 15M12 1l-2 14M2.5 5.5h11M2 10.5h11"
                stroke="#181818"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </Bubble>
          caption.
          <span className="text-slate"> So you just post.</span>
        </h2>
      </Reveal>

      <Reveal delay={120}>
        <div className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-4 lg:grid-rows-[repeat(2,minmax(0,1fr))]">
          {/* a) tall media card */}
          <div className="relative overflow-hidden rounded-[20px] border-2 border-ink bg-ink transition-transform duration-200 ease-out hover:-translate-y-0.5 lg:row-span-2">
            <InViewVideo
              src={asset("/videos/kai-launched.mp4")}
              poster={asset("/videos/kai-launched.jpg")}
              label="Example clip: Kai gets launched"
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div className="absolute inset-x-3 bottom-3 rounded-2xl bg-white p-4">
              <p className="font-[family-name:var(--font-jetbrains)] text-4xl font-medium">
                94
              </p>
              <p className="mt-1 text-sm text-slate">
                Highlight score for every moment, with the reason why.
              </p>
            </div>
          </div>

          {/* b) mist card */}
          <div className={`${card} bg-mist lg:col-span-2`}>
            <p className="font-[family-name:var(--font-jetbrains)] text-4xl font-medium">
              9:16
            </p>
            <p className="mt-1 text-[15px] text-[#5A5E56]">
              Auto vertical crop. Facecam on top, gameplay below.
            </p>
            <div className="mt-4 flex">
              {[
                asset("/videos/thumbs/kai-launched-face.jpg"),
                asset("/videos/thumbs/kai-car-explodes-face.jpg"),
                asset("/videos/thumbs/fanum-wait-face.jpg"),
              ].map((f, i) => (
                <span
                  key={f}
                  className={`relative h-9 w-9 overflow-hidden rounded-full border-2 border-white ${i > 0 ? "-ml-2.5" : ""}`}
                >
                  <Image src={f} alt="" fill sizes="36px" className="object-cover" />
                </span>
              ))}
            </div>
          </div>

          {/* c) lime card */}
          <div className={`${card} bg-lime`}>
            <p className="font-[family-name:var(--font-jetbrains)] text-4xl font-medium text-ink">
              3
            </p>
            <p className="mt-1 text-[15px] text-ink/80">
              free credits every month. No card needed.
            </p>
          </div>

          {/* d) ink card */}
          <div className={`${card} bg-ink lg:col-span-1`}>
            <p className="font-[family-name:var(--font-jetbrains)] text-4xl font-medium text-white">
              4
            </p>
            <p className="mt-1 text-[15px] text-slate-dark">
              platforms: TikTok, Shorts, Reels, X. Titles, hashtags, best
              times.
            </p>
          </div>

          {/* e) wide presets card */}
          <div className={`${card} border border-border bg-white lg:col-span-2`}>
            <h3 className="text-lg font-semibold">Presets</h3>
            <p className="mt-2 text-[15px] leading-relaxed text-slate">
              Set your caption style and layout once. Every new clip uses it.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {["Bold Pop", "Clean", "Karaoke"].map((c) => (
                <span
                  key={c}
                  className="rounded-full border border-border px-3 py-1 text-xs font-medium text-slate"
                >
                  {c}
                </span>
              ))}
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
