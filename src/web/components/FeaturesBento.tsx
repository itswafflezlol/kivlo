import Image from "next/image";
import { asset } from "@/lib/asset";
import Reveal from "./Reveal";
import InViewVideo from "./InViewVideo";

function Bubble({ bg, children }: { bg: string; children: React.ReactNode }) {
  return (
    <span
      aria-hidden="true"
      className={`mx-[0.12em] inline-flex h-[0.92em] w-[0.92em] items-center justify-center rounded-full align-[-0.1em] ${bg}`}
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
        <p className="text-center text-sm font-medium text-slate">
          What Kivlo does
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
            <svg width="0.55em" height="0.55em" viewBox="0 0 16 16" fill="none" stroke="#181818" strokeWidth="1.6" strokeLinecap="round">
              <path d="M5.5 1.5h-2a2 2 0 0 0-2 2v2M10.5 1.5h2a2 2 0 0 1 2 2v2M14.5 10.5v2a2 2 0 0 1-2 2h-2M5.5 14.5h-2a2 2 0 0 1-2-2v-2" />
            </svg>
          </Bubble>
          shot, and writes the
          <Bubble bg="bg-heat">
            <svg width="0.6em" height="0.6em" viewBox="0 0 16 16" fill="none" stroke="#181818" strokeWidth="1.5" strokeLinecap="round">
              <rect x="1.5" y="3" width="13" height="10" rx="2.5" />
              <path d="M4.5 7h4M4.5 9.5h7" />
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
              src={asset("/videos/wall/kai-duke-slam-1.mp4")}
              poster={asset("/videos/wall/kai-duke-slam-1.jpg")}
              label="Example clip: Duke slams Kai on stream"
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
                asset("/videos/thumbs/duke-phone-save-face.jpg"),
                asset("/videos/thumbs/emily-dance-face.jpg"),
                asset("/videos/thumbs/kai-museum-face.jpg"),
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
