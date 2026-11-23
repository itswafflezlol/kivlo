import Link from "next/link";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import Pricing from "@/components/Pricing";
import HeroMock from "@/components/HeroMock";

const steps = [
  {
    n: 1,
    title: "Paste a link",
    body: "YouTube, Twitch, or upload a file. Public videos only.",
  },
  {
    n: 2,
    title: "Kivlo finds the moments",
    body: "Every clip gets a score, a reason, vertical framing, and captions.",
  },
  {
    n: 3,
    title: "Fix it, then post",
    body: "Tweak anything in KivloWorkspace. Get titles, hashtags, and the best time to post.",
  },
];

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
      <main>
        {/* Hero */}
        <section className="px-3 pt-4 sm:px-5">
          <div className="dark-focus mx-auto max-w-[1400px] rounded-[32px] bg-ink px-5 pb-44 pt-20 text-center sm:pb-52 md:pb-64">
            <span className="inline-block rounded-full bg-graphite px-4 py-1.5 text-xs font-medium text-slate-dark">
              For stream clippers
            </span>
            <h1 className="mx-auto mt-6 max-w-3xl font-[family-name:var(--font-bricolage)] text-4xl font-extrabold leading-[1.05] tracking-tight text-white sm:text-6xl">
              Turn long streams into
              <br />
              <span className="text-lime">clips worth posting.</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-slate-dark">
              Paste a YouTube or Twitch link. Kivlo finds the best moments, crops
              them to vertical, and adds captions. Fix anything in
              KivloWorkspace, then post.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                href="/signup"
                className="rounded-full bg-lime px-7 py-3.5 text-base font-semibold text-ink transition-colors duration-150 ease-out hover:bg-lime-hover"
              >
                Start Free
              </Link>
              <Link
                href="/pricing"
                className="rounded-full border border-control-border-dark px-7 py-3.5 text-base font-semibold text-white transition-colors duration-150 ease-out hover:border-white"
              >
                See pricing
              </Link>
            </div>
            <p className="mt-5 text-sm text-slate-dark">
              Free plan · No card needed
            </p>
          </div>
        </section>

        {/* Product mock overlapping the hero */}
        <div className="-mt-36 px-5 sm:-mt-40 md:-mt-52">
          <HeroMock />
        </div>

        {/* How it works */}
        <section id="how" className="mx-auto max-w-[1200px] scroll-mt-24 px-5 py-24">
          <p className="text-center text-xs font-semibold uppercase tracking-[0.15em] text-lime-deep">
            How it works
          </p>
          <h2 className="mt-3 text-center font-[family-name:var(--font-bricolage)] text-3xl font-extrabold tracking-tight sm:text-4xl">
            From stream to post in three steps
          </h2>
          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {steps.map((s) => (
              <div
                key={s.n}
                className="rounded-[20px] border border-border bg-white p-7"
              >
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-lime font-[family-name:var(--font-jetbrains)] text-sm font-medium text-ink">
                  {s.n}
                </span>
                <h3 className="mt-5 text-lg font-semibold">{s.title}</h3>
                <p className="mt-2 text-[15px] leading-relaxed text-slate">
                  {s.body}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Features bento */}
        <section id="features" className="mx-auto max-w-[1200px] scroll-mt-24 px-5 pb-24">
          <p className="text-center text-xs font-semibold uppercase tracking-[0.15em] text-lime-deep">
            Features
          </p>
          <h2 className="mx-auto mt-3 max-w-xl text-center font-[family-name:var(--font-bricolage)] text-3xl font-extrabold tracking-tight sm:text-4xl">
            Everything a clip needs. Nothing it doesn&apos;t.
          </h2>
          <div className="mt-12 grid gap-5 md:grid-cols-3">
            <div className="dark-focus rounded-[20px] bg-ink p-7 md:col-span-2">
              <h3 className="text-lg font-semibold text-white">
                Highlight scores
              </h3>
              <p className="mt-2 max-w-md text-[15px] leading-relaxed text-slate-dark">
                Kivlo ranks every moment from 0 to 100 and tells you why, so you
                start with the best ones.
              </p>
              <div className="mt-5 flex gap-2">
                <span className="rounded-md bg-lime px-2 py-1 font-[family-name:var(--font-jetbrains)] text-xs font-medium text-ink">
                  92
                </span>
                <span className="rounded-md bg-heat px-2 py-1 font-[family-name:var(--font-jetbrains)] text-xs font-medium text-ink">
                  74
                </span>
                <span className="rounded-md bg-hairline-dark px-2 py-1 font-[family-name:var(--font-jetbrains)] text-xs font-medium text-slate-dark">
                  41
                </span>
              </div>
            </div>
            {[
              {
                t: "Auto vertical crop",
                b: "Face tracking keeps the streamer centered. Gaming streams get facecam on top, gameplay below.",
              },
              {
                t: "Animated captions",
                b: "Word-by-word captions that are easy to read on a phone.",
              },
            ].map((c) => (
              <div
                key={c.t}
                className="rounded-[20px] border border-border bg-white p-7"
              >
                <h3 className="text-lg font-semibold">{c.t}</h3>
                <p className="mt-2 text-[15px] leading-relaxed text-slate">
                  {c.b}
                </p>
              </div>
            ))}
            <div className="rounded-[20px] bg-lime p-7">
              <h3 className="text-lg font-semibold text-ink">Presets</h3>
              <p className="mt-2 text-[15px] leading-relaxed text-ink/80">
                Set your caption style and layout once. Every new clip uses it.
              </p>
            </div>
            <div className="rounded-[20px] border border-border bg-white p-7">
              <h3 className="text-lg font-semibold">Hooks, titles, hashtags</h3>
              <p className="mt-2 text-[15px] leading-relaxed text-slate">
                Written for TikTok, Shorts, Reels, and X. Edit or regenerate in
                one click.
              </p>
            </div>
            <div className="rounded-[20px] border border-border bg-white p-7 md:col-span-3">
              <h3 className="text-lg font-semibold">Posting calendar</h3>
              <p className="mt-2 text-[15px] leading-relaxed text-slate">
                Schedule clips at suggested times. Kivlo reminds you when
                it&apos;s time to post.
              </p>
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section id="pricing" className="mx-auto max-w-[1200px] scroll-mt-24 px-5 pb-24">
          <h2 className="text-center font-[family-name:var(--font-bricolage)] text-3xl font-extrabold tracking-tight sm:text-4xl">
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
          <div className="mt-10">
            <Pricing />
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="mx-auto max-w-[760px] scroll-mt-24 px-5 pb-24">
          <h2 className="text-center font-[family-name:var(--font-bricolage)] text-3xl font-extrabold tracking-tight sm:text-4xl">
            Questions
          </h2>
          <div className="mt-10 flex flex-col gap-3">
            {faq.map((f) => (
              <details
                key={f.q}
                className="group rounded-[16px] border border-border bg-white px-6 py-4"
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
                <p className="mt-3 text-[15px] leading-relaxed text-slate">
                  {f.a}
                </p>
              </details>
            ))}
          </div>
        </section>

        {/* Final CTA */}
        <section className="px-3 pb-20 sm:px-5">
          <div className="mx-auto max-w-[1400px] rounded-[32px] bg-lime px-5 py-20 text-center">
            <h2 className="font-[family-name:var(--font-bricolage)] text-3xl font-extrabold tracking-tight text-ink sm:text-5xl">
              Frame the moment.
            </h2>
            <p className="mt-4 text-lg text-ink/80">
              Start with 3 free credits. No card needed.
            </p>
            <Link
              href="/signup"
              className="mt-8 inline-block rounded-full bg-ink px-8 py-4 text-base font-semibold text-white transition-colors duration-150 ease-out hover:bg-graphite"
            >
              Start Free
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
