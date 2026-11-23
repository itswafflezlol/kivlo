import Link from "next/link";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import Pricing from "@/components/Pricing";
import HeroMock from "@/components/HeroMock";
import Hero from "@/components/Hero";
import PlatformMarquee from "@/components/PlatformMarquee";
import FeaturesBento from "@/components/FeaturesBento";
import HowItWorks from "@/components/HowItWorks";
import ExamplesClips from "@/components/ExamplesClips";
import TransformShowcase from "@/components/TransformShowcase";
import ClipWall from "@/components/ClipWall";
import DashboardShowcase from "@/components/DashboardShowcase";
import Reveal from "@/components/Reveal";
import ArrowPill from "@/components/ArrowPill";

const faq = [
  {
    q: "What is a credit?",
    a: "1 credit covers up to 20 minutes of video. A 1-hour stream uses 3 credits.",
  },
  {
    q: "Do unused credits roll over?",
    a: "No. Credits reset at the start of each billing cycle.",
  },
  {
    q: "Which links work?",
    a: "Public YouTube videos and Twitch VODs. You can also upload MP4, MOV, or WEBM files. Videos that need a login, membership, or payment won't work.",
  },
  {
    q: "Does Kivlo post for me?",
    a: "You can schedule every clip. Auto-posting turns on platform by platform as each one approves Kivlo. Until then, we remind you and you post in one tap.",
  },
  {
    q: "Is there a watermark?",
    a: "Only on the Free plan. Paid plans export without one.",
  },
  {
    q: "Can I cancel anytime?",
    a: "Yes. You keep access until the end of your billing period.",
  },
];

export default function Home() {
  return (
    <>
      <Nav />
      <main className="overflow-x-clip">
        <Hero />
        <PlatformMarquee />
        <TransformShowcase />
        <FeaturesBento />
        <HowItWorks />

        {/* Examples */}
        <section className="pb-24">
          <Reveal>
            <h2 className="text-center font-heading text-3xl font-bold sm:text-[40px]">
              <span className="rounded-full bg-lime-soft px-4 py-1">
                Built for clips
              </span>{" "}
              like these
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-balance text-center text-lg text-slate">
              Facecam on top, gameplay below, captions that hit on every word.
            </p>
          </Reveal>
          <ExamplesClips />
        </section>

        {/* Clip wall */}
        <ClipWall />

        {/* Workspace */}
        <section className="px-3 pb-24 sm:px-5">
          <div className="dark-focus mx-auto max-w-[1400px] rounded-[32px] bg-ink px-5 py-16 sm:py-20">
            <Reveal>
              <p className="text-center font-[family-name:var(--font-jetbrains)] text-xs font-medium uppercase tracking-[0.12em] text-lime">
                • KivloWorkspace
              </p>
              <h2 className="mt-3 text-center font-heading text-balance text-3xl font-bold text-white sm:text-4xl">
                Fix anything <span className="text-slate-dark">in seconds</span>
              </h2>
            </Reveal>
            <div className="mt-10">
              <HeroMock />
            </div>
          </div>
        </section>

        {/* Dashboard showcase */}
        <DashboardShowcase />

        {/* Pricing */}
        <section id="pricing" className="mx-auto max-w-[1200px] scroll-mt-24 px-5 pb-24">
          <Reveal>
            <h2 className="text-center font-heading text-balance text-3xl font-bold sm:text-4xl">
              Simple pricing
            </h2>
            <p className="mt-3 text-center">
              <Link
                href="/pricing"
                className="text-sm font-semibold text-lime-deep underline-offset-4 transition-colors duration-150 ease-out hover:underline"
              >
                Compare all plans →
              </Link>
            </p>
          </Reveal>
          <div className="mt-10">
            <Pricing />
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="mx-auto max-w-[760px] scroll-mt-24 px-5 pb-24">
          <Reveal>
            <h2 className="text-center font-heading text-balance text-3xl font-bold sm:text-4xl">
              Questions
            </h2>
          </Reveal>
          <div className="mt-10 flex flex-col gap-3">
            {faq.map((f) => (
              <details
                key={f.q}
                className="faq-item group rounded-[16px] border border-border bg-white px-6 py-4"
              >
                <summary className="cursor-pointer list-none text-[15px] font-semibold [&::-webkit-details-marker]:hidden">
                  <span className="flex items-center justify-between gap-4">
                    {f.q}
                    <span
                      aria-hidden="true"
                      className="text-slate transition-transform duration-150 ease-out group-open:rotate-45"
                    >
                      +
                    </span>
                  </span>
                </summary>
                <div className="faq-body">
                  <div>
                    <p className="pt-3 text-[15px] leading-relaxed text-slate">
                      {f.a}
                    </p>
                  </div>
                </div>
              </details>
            ))}
          </div>
        </section>

        {/* Final CTA */}
        <section className="px-3 pb-20 sm:px-5">
          <Reveal>
            <div className="relative mx-auto max-w-[1400px] overflow-hidden rounded-[32px] bg-lime px-5 py-20 text-center">
              <svg
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 h-full w-full opacity-30"
                viewBox="0 0 1400 400"
                preserveAspectRatio="none"
              >
                <path
                  d="M-80 240 C 200 140, 340 330, 560 230 S 900 90, 1120 210 S 1380 340, 1500 260"
                  fill="none"
                  stroke="#A6D95A"
                  strokeWidth="60"
                  strokeLinecap="round"
                />
              </svg>
              <div className="relative">
                <h2 className="font-display text-3xl font-bold text-ink sm:text-5xl">
                  Frame the moment.
                </h2>
                <p className="mt-4 text-lg text-ink/80">
                  Start with 3 free credits. No card needed.
                </p>
                <ArrowPill
                  href="/signup"
                  variant="ink"
                  className="mt-8 px-8 py-3.5 text-base"
                >
                  Start Free
                </ArrowPill>
              </div>
            </div>
          </Reveal>
        </section>
      </main>
      <Footer />
    </>
  );
}
