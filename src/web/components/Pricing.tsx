"use client";

import Link from "next/link";
import { useState } from "react";
import { plans, pricingFootnote } from "@/lib/pricing";

function CheckIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      aria-hidden="true"
      className="mt-0.5 shrink-0 text-lime-deep"
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
  );
}

export default function Pricing() {
  const [yearly, setYearly] = useState(false);

  return (
    <div>
      <div
        role="group"
        aria-label="Billing period"
        className="mb-10 flex items-center justify-center gap-3"
      >
        <div className="relative inline-flex rounded-full border border-control-border bg-white p-1">
          <span
            aria-hidden="true"
            className="absolute bottom-1 left-1 top-1 w-[calc(50%-4px)] rounded-full bg-ink transition-transform duration-250 ease-out"
            style={{ transform: yearly ? "translateX(100%)" : "translateX(0)" }}
          />
          <button
            type="button"
            aria-pressed={!yearly}
            onClick={() => setYearly(false)}
            className={`relative z-10 rounded-full px-5 py-2 text-sm font-semibold transition-colors duration-150 ease-out ${
              !yearly ? "text-white" : "text-slate hover:text-ink"
            }`}
          >
            Monthly
          </button>
          <button
            type="button"
            aria-pressed={yearly}
            onClick={() => setYearly(true)}
            className={`relative z-10 rounded-full px-5 py-2 text-sm font-semibold transition-colors duration-150 ease-out ${
              yearly ? "text-white" : "text-slate hover:text-ink"
            }`}
          >
            Yearly
          </button>
        </div>
        <span className="rounded-full bg-lime px-2.5 py-1 text-xs font-semibold text-ink">
          Save up to 36%
        </span>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {plans.map((plan) => {
          const price = yearly ? plan.yearlyPerMonth : plan.monthly;
          return (
            <div
              key={plan.id}
              className={`relative flex flex-col rounded-[20px] bg-white p-6 transition-all duration-200 ease-out hover:-translate-y-0.5 ${
                plan.popular ? "border-2 border-ink" : "border border-border"
              }`}
            >
              {plan.popular && (
                <span className="absolute -top-3 left-6 rounded-full bg-ink px-3 py-1 text-xs font-semibold text-lime">
                  Most popular
                </span>
              )}
              <h2 className="text-lg font-semibold">{plan.name}</h2>
              <div className="mt-4 flex items-end gap-1.5">
                <span
                  key={String(yearly)}
                  className="price-fade font-[family-name:var(--font-jetbrains)] text-4xl font-medium tracking-tight"
                >
                  ${price}
                </span>
                <span className="pb-1.5 text-sm text-slate">/mo</span>
              </div>
              <div className="mt-1 h-5 text-sm">
                {yearly && plan.monthly > 0 ? (
                  <span className="text-slate">
                    Billed ${plan.yearlyTotal} yearly{" "}
                    <span className="line-through">${plan.monthly}/mo</span>
                  </span>
                ) : (
                  <span className="text-slate">&nbsp;</span>
                )}
              </div>
              <p className="mt-3 text-sm font-medium text-ink">
                {plan.credits} credits / month
              </p>
              <ul className="mt-4 flex flex-1 flex-col gap-2.5 text-sm text-slate">
                {plan.features.map((f) => (
                  <li key={f} className="flex gap-2.5">
                    <CheckIcon />
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href={plan.href}
                className={`mt-6 block rounded-full py-3 text-center text-sm font-semibold transition-colors duration-150 ease-out ${
                  plan.popular
                    ? "bg-lime text-ink hover:bg-lime-hover"
                    : "border border-control-border text-ink hover:border-ink"
                }`}
              >
                {plan.cta}
              </Link>
            </div>
          );
        })}
      </div>

      <p className="mx-auto mt-8 max-w-3xl text-center text-[13px] leading-relaxed text-slate">
        {pricingFootnote}
      </p>
    </div>
  );
}
