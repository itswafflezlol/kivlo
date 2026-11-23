"use client";

import { useState } from "react";
import { Modal } from "./ui";
import { plans } from "@/lib/pricing";

export default function UpgradeModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [yearly, setYearly] = useState(true);
  return (
    <Modal open={open} onClose={onClose} label="Upgrade plan" wide>
      <div className="flex items-center justify-between">
        <h2 className="font-heading text-xl font-bold">Upgrade</h2>
        <div role="tablist" aria-label="Billing period" className="flex rounded-full bg-mist p-1 text-sm font-medium">
          {(["Monthly", "Yearly"] as const).map((t, i) => (
            <button key={t} role="tab" aria-selected={(i === 1) === yearly} onClick={() => setYearly(i === 1)}
              className={`rounded-full px-4 py-1.5 ${(i === 1) === yearly ? "bg-white shadow-sm" : "text-slate"}`}>{t}</button>
          ))}
        </div>
      </div>
      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        {plans.filter((p) => p.id !== "free").map((p) => (
          <div key={p.id} className="rounded-xl border border-hairline p-4">
            <p className="font-heading text-sm font-bold">{p.name}</p>
            <p className="mt-1 font-mono text-2xl font-medium">
              ${yearly ? p.yearlyPerMonth : p.monthly}<span className="text-xs text-slate">/mo</span>
            </p>
            <p className="mt-1 text-xs text-slate">{p.credits} credits a month</p>
            <button onClick={onClose} className="mt-3 w-full rounded-full bg-lime py-2 text-sm font-semibold text-ink hover:bg-lime-hover">
              Choose {p.name}
            </button>
          </div>
        ))}
      </div>
      <p className="mt-3 text-center text-xs text-slate">Demo mode — checkout isn&apos;t wired up.</p>
    </Modal>
  );
}
