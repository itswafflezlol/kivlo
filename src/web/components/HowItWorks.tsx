import Image from "next/image";
import { asset } from "@/lib/asset";
import Reveal from "./Reveal";

const steps = [
  {
    n: "01",
    title: "Paste a link",
    body: "YouTube, Twitch, or upload a file. Public videos only.",
    card: "bg-lime-soft",
    text: "text-ink",
    sub: "text-ink/70",
    num: "text-ink",
    peek: "img",
    src: asset("/videos/thumbs/kai-launched-a.jpg"),
    peekCls: "-top-6 right-8 rotate-6 w-20",
    rotate: "md:-rotate-[1.5deg]",
    offset: "md:ml-0",
  },
  {
    n: "02",
    title: "Kivlo finds the moments",
    body: "Every clip gets a score, a reason, vertical framing, and captions.",
    card: "border border-border bg-white",
    text: "text-ink",
    sub: "text-slate",
    num: "text-ink",
    peek: "scores",
    peekCls: "-top-5 right-6 -rotate-3",
    rotate: "md:rotate-[1deg]",
    offset: "md:ml-[8%]",
  },
  {
    n: "03",
    title: "Fix it, then post",
    body: "Tweak anything in KivloWorkspace. Get titles, hashtags, and the best time to post.",
    card: "bg-ink md:pr-32",
    text: "text-white",
    sub: "text-slate-dark",
    num: "text-lime",
    peek: "img",
    src: asset("/videos/thumbs/fanum-wait-b.jpg"),
    peekCls: "-right-4 top-1/2 -translate-y-1/2 rotate-6 w-16",
    rotate: "md:-rotate-[1deg]",
    offset: "md:ml-[16%]",
  },
];

export default function HowItWorks() {
  return (
    <section id="how" className="mx-auto max-w-[1100px] scroll-mt-24 px-5 py-24">
      <Reveal>
        <p className="text-center font-[family-name:var(--font-jetbrains)] text-xs font-medium uppercase tracking-[0.12em] text-slate">
          • How it works
        </p>
        <h2 className="mt-3 text-center font-heading text-balance text-3xl font-bold sm:text-4xl">
          From stream to post in three steps
        </h2>
      </Reveal>
      <div className="mt-14 flex flex-col gap-6 md:gap-0">
        {steps.map((s, i) => (
          <Reveal key={s.n} delay={i * 100}>
            <div
              className={`relative rounded-[24px] p-8 transition-transform md:w-[72%] duration-300 ease-out hover:rotate-0 sm:p-10 ${s.card} ${s.rotate} ${s.offset} ${
                i > 0 ? "md:-mt-6" : ""
              }`}
            >
              <div className="flex items-baseline gap-4">
                <span
                  className={`font-[family-name:var(--font-jetbrains)] text-4xl font-medium ${s.num}`}
                >
                  {s.n}
                </span>
                <h3 className={`text-2xl font-semibold ${s.text}`}>{s.title}</h3>
              </div>
              <p className={`mt-3 max-w-md text-[15px] leading-relaxed ${s.sub}`}>
                {s.body}
              </p>
              {s.peek === "img" ? (
                <span
                  aria-hidden="true"
                  className={`absolute hidden overflow-hidden rounded-xl shadow-lg md:block ${s.peekCls}`}
                >
                  <Image
                    src={s.src!}
                    alt=""
                    width={80}
                    height={142}
                    className="aspect-[9/16] w-full object-cover"
                  />
                </span>
              ) : (
                <span
                  aria-hidden="true"
                  className={`absolute hidden gap-1.5 rounded-xl bg-white p-2 shadow-lg md:flex ${s.peekCls}`}
                >
                  {["94", "88", "81"].map((sc, j) => (
                    <span
                      key={sc}
                      className={`rounded-md px-1.5 py-1 font-[family-name:var(--font-jetbrains)] text-[10px] font-medium ${
                        j < 2 ? "bg-lime text-ink" : "bg-heat text-ink"
                      }`}
                    >
                      {sc}
                    </span>
                  ))}
                </span>
              )}
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
