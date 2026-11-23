import type { Metadata } from "next";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import Pricing from "@/components/Pricing";

export const metadata: Metadata = {
  title: "Pricing — Kivlo",
  description:
    "Start free. Upgrade when you need more credits. 1 credit = up to 20 minutes of video.",
};

function Included() {
  return (
    <>
      <svg
        width="16"
        height="16"
        viewBox="0 0 16 16"
        aria-hidden="true"
        className="inline text-lime-deep"
      >
        <path
          d="M3 8.5l3.5 3.5L13 5"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <span className="sr-only">Included</span>
    </>
  );
}

function NotIncluded() {
  return (
    <>
      <span aria-hidden="true" className="text-slate">
        —
      </span>
      <span className="sr-only">Not included</span>
    </>
  );
}

type Cell = string | "yes" | "no";

const rows: { label: string; cells: Cell[] }[] = [
  { label: "Credits per month", cells: ["3", "30", "70", "150"] },
  { label: "Video per month", cells: ["1h", "10h", "23h", "50h"] },
  { label: "Watermark", cells: ["Yes", "No", "No", "No"] },
  { label: "Highlights + captions + crop", cells: ["yes", "yes", "yes", "yes"] },
  { label: "KivloWorkspace editor", cells: ["yes", "yes", "yes", "yes"] },
  { label: "Presets", cells: ["no", "yes", "yes", "yes"] },
  {
    label: "Titles, hashtags, posting times",
    cells: ["no", "yes", "yes", "yes"],
  },
  { label: "Social accounts", cells: ["0", "1", "3", "Unlimited"] },
  { label: "Scheduling + auto-post*", cells: ["no", "yes", "yes", "yes"] },
  { label: "Team seats", cells: ["1", "1", "1", "3 (coming soon)"] },
];

const planNames = ["Free", "Pro", "Creator", "Agency"];

const billingFaq = [
  {
    q: "Can I switch plans?",
    a: "Yes. Upgrades apply right away and you pay the difference. Downgrades start at your next billing date.",
  },
  {
    q: "What payment methods do you take?",
    a: "Card, Apple Pay, and Google Pay.",
  },
  {
    q: "What happens if a payment fails?",
    a: "You get 3 days to fix it. After that your account moves to the Free plan.",
  },
  {
    q: "What is a credit?",
    a: "1 credit covers up to 20 minutes of video. A 1-hour stream uses 3 credits.",
  },
  {
    q: "Do unused credits roll over?",
    a: "No. Credits reset at the start of each billing cycle.",
  },
  {
    q: "Can I cancel anytime?",
    a: "Yes. You keep access until the end of your billing period.",
  },
];

export default function PricingPage() {
  return (
    <>
      <Nav />
      <main className="mx-auto max-w-[1200px] px-5 pb-24">
        <div className="pb-14 pt-16 text-center">
          <h1 className="font-[family-name:var(--font-bricolage)] text-4xl font-extrabold tracking-tight sm:text-5xl">
            Pricing
          </h1>
          <p className="mt-4 text-lg text-slate">
            Start free. Upgrade when you need more credits.
          </p>
        </div>

        <Pricing />

        {/* How credits work */}
        <div className="mx-auto mt-16 max-w-2xl rounded-[20px] border border-border bg-white p-7 text-center">
          <h2 className="text-lg font-semibold">How credits work</h2>
          <p className="mt-2 text-[15px] text-slate">
            1 credit = up to 20 minutes of video
          </p>
          <p className="mt-4 font-[family-name:var(--font-jetbrains)] text-sm text-ink">
            20 min = 1 credit · 1 hour = 3 credits · 4-hour stream = 12 credits
          </p>
        </div>

        {/* Comparison table */}
        <div className="mt-16">
          <h2 className="text-center font-[family-name:var(--font-bricolage)] text-3xl font-extrabold tracking-tight">
            Compare plans
          </h2>
          <div className="mt-8 overflow-x-auto rounded-[20px] border border-border bg-white" tabIndex={0} aria-label="Plan comparison table">
            <table className="w-full min-w-[640px] table-fixed border-collapse text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th
                    scope="col"
                    className="w-[32%] px-5 py-4 text-left font-semibold"
                  >
                    <span className="sr-only">Feature</span>
                  </th>
                  {planNames.map((n) => (
                    <th
                      key={n}
                      scope="col"
                      className="px-5 py-4 text-center font-semibold"
                    >
                      {n}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr
                    key={r.label}
                    className="border-b border-border last:border-0"
                  >
                    <th
                      scope="row"
                      className="px-5 py-3.5 text-left font-medium"
                    >
                      {r.label}
                    </th>
                    {r.cells.map((c, i) => (
                      <td
                        key={i}
                        className="relative px-5 py-3.5 text-center text-slate"
                      >
                        {c === "yes" ? (
                          <Included />
                        ) : c === "no" ? (
                          <NotIncluded />
                        ) : (
                          c
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Billing FAQ */}
        <div className="mx-auto mt-16 max-w-[760px]">
          <h2 className="text-center font-[family-name:var(--font-bricolage)] text-3xl font-extrabold tracking-tight">
            Billing questions
          </h2>
          <div className="mt-8 flex flex-col gap-3">
            {billingFaq.map((f) => (
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
        </div>
      </main>
      <Footer />
    </>
  );
}
