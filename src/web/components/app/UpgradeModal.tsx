"use client";

import { useState } from "react";
import { Modal } from "./ui";
import { plans } from "@/lib/pricing";

export default function UpgradeModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [yearly, setYearly] = useState(true);
  return (
    <Modal open={open} onClose={onClose} label="Upgrade plan" wide>
      <div className="flex items-center justify-between">
        <h2 className="font-heading text-[17px] font-bold">Upgrade</h2>
        <div className="flex items-center gap-2">
          <div role="tablist" aria-label="Billing period" className="flex rounded-full bg-surface-2 p-1 text-sm font-medium">
            {(["Monthly", "Yearly"] as const).map((t, i) => (
              <button key={t} role="tab" aria-selected={(i === 1) === yearly} onClick={() => setYearly(i === 1)}
                className={`rounded-full px-4 py-1.5 ${(i === 1) === yearly ? "bg-surface shadow-sm" : "text-slate"}`}>{t}</button>
            ))}
          </div>
          <button onClick={onClose} aria-label="Close" className="flex h-8 w-8 items-center justify-center rounded-full text-slate transition-colors hover:bg-surface-2 hover:text-fg">
            <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M4 4l8 8M12 4l-8 8" /></svg>
          </button>
        </div>
      </div>
      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        {plans.filter((p) => p.id !== "free").map((p) => (
          <div key={p.id} className="rounded-xl bg-surface p-4 shadow-sm ring-1 ring-line">
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
