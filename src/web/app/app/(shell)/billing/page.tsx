"use client";
import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { user, invoices, billing } from "@/lib/mock";
import { plans } from "@/lib/pricing";
import { Modal } from "@/components/app/ui";

const RENEW = "Dec 15, 2026";
const DAYS_LEFT = 22;
const STATUS_STYLE: Record<string, string> = {
  Paid: "bg-lime-soft text-lime-deep",
  Failed: "bg-[#FF6B63]/15 text-error",
  Refunded: "bg-surface-2 text-fg",
};

function Billing() {
  const pastDue = useSearchParams().get("state") === "past_due";
  const [yearly, setYearly] = useState(false);
  const [cancel, setCancel] = useState(false);
  const [card, setCard] = useState(false);
  const left = user.creditsTotal - user.creditsUsed;
  const pct = left / user.creditsTotal;
  const cur = plans.findIndex((p) => p.id === user.plan);
  const hist = billing.creditHistory;
  const histMax = Math.max(...hist);
  const R = 34, CIRC = 2 * Math.PI * R;

  return (
    <div className="max-w-4xl space-y-6">
      {pastDue && <p role="alert" className="rounded-xl bg-[#F5A524]/10 px-4 py-3 text-sm text-heat-text">Payment failed — you have 7 days to update your card.</p>}

      <div className="grid gap-4 lg:grid-cols-2">
        {/* plan hero */}
        <section className="rounded-2xl bg-ink p-6 text-[#F2F2F0] shadow-sm dark:bg-[#202020] dark:ring-1 dark:ring-line">
          <div className="flex items-start justify-between">
            <div>
              <p className="font-heading text-lg font-bold capitalize">{user.plan} · $12/mo</p>
              <p className="mt-0.5 text-xs text-[#A1A5A0]">Billed monthly · renews {RENEW}</p>
            </div>
            <span className="rounded-full bg-lime px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-ink">Current</span>
          </div>
          <div className="mt-5 flex items-center gap-5">
            <span className="relative h-20 w-20">
              <svg viewBox="0 0 80 80" className="h-full w-full -rotate-90">
                <circle cx="40" cy="40" r={R} fill="none" stroke="#3A3A3A" strokeWidth="8" />
                <circle cx="40" cy="40" r={R} fill="none" stroke="#BDEF72" strokeWidth="8" strokeLinecap="round" strokeDasharray={CIRC} strokeDashoffset={CIRC * (1 - pct)} />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center font-mono text-lg font-bold">{left}</span>
            </span>
            <div>
              <p className="font-mono text-2xl font-medium">{left} <span className="text-sm text-[#A1A5A0]">of {user.creditsTotal}</span></p>
              <p className="text-xs text-[#A1A5A0]">credits left · resets in {DAYS_LEFT} days</p>
            </div>
          </div>
          <div className="mt-5 flex gap-2">
            <a href="#plans" className="rounded-full bg-lime px-4 py-2 text-xs font-semibold text-ink">Change plan</a>
            <button onClick={() => setCancel(true)} className="rounded-full border border-[#3A3A3A] px-4 py-2 text-xs font-medium text-[#F2F2F0]">Cancel</button>
          </div>
        </section>

        {/* wallet */}
        <section className="rounded-2xl bg-surface p-6 shadow-sm ring-1 ring-line">
          <div className="flex items-center justify-between">
            <h2 className="font-heading text-sm font-bold">Payment method</h2>
            <button onClick={() => setCard(true)} className="text-xs font-medium text-lime-deep hover:underline">Update card</button>
          </div>
          <div className="mt-3 rounded-xl bg-ink p-4 text-[#F2F2F0] dark:bg-[#202020] dark:ring-1 dark:ring-line">
            <div className="flex items-center justify-between">
              <svg aria-hidden viewBox="0 0 32 22" className="h-5"><rect x="1" y="1" width="30" height="20" rx="3" fill="#2a2a2a" stroke="#3A3A3A"/><rect x="5" y="6" width="7" height="5" rx="1" fill="#F5A524"/></svg>
              <svg aria-label={billing.card.brand} role="img" viewBox="0 0 40 14" className="h-4"><text x="0" y="11" fontSize="11" fontWeight="800" fontStyle="italic" fill="#F2F2F0" fontFamily="Manrope, sans-serif">VISA</text></svg>
            </div>
            <p className="mt-4 font-mono text-lg tracking-[0.2em]">•••• {billing.card.last4}</p>
            <div className="mt-3 flex justify-between text-[10px] text-[#A1A5A0]">
              <span>{billing.card.holder}</span><span>EXP {billing.card.exp}</span>
            </div>
          </div>
          <p className="mt-3 flex items-center gap-2 text-[11px] text-slate">
            Also accepted:
            <span className="rounded-md bg-surface-2 px-2 py-0.5 font-medium text-fg">Apple&nbsp;Pay</span>
            <span className="rounded-md bg-surface-2 px-2 py-0.5 font-medium text-fg">Google&nbsp;Pay</span>
          </p>
          <div className="mt-4 border-t border-line pt-3 text-xs">
            <p className="flex items-center justify-between"><span className="text-slate">Billing email</span><span className="font-medium">{billing.email}</span></p>
            <p className="mt-1.5 flex items-center justify-between"><span className="text-slate">Address</span><span className="font-medium">{billing.address} <button className="ml-1 text-lime-deep hover:underline">Edit</button></span></p>
          </div>
        </section>
      </div>

      {/* credit usage chart */}
      <section className="rounded-2xl bg-surface p-6 shadow-sm ring-1 ring-line">
        <h2 className="font-heading text-sm font-bold">Credit usage · last 6 cycles</h2>
        <div className="mt-4 flex h-[120px] items-end gap-4">
          {hist.map((v, i) => (
            <div key={i} className="flex flex-1 flex-col items-center gap-1.5">
              <span className="font-mono text-[10px] text-slate">{v}</span>
              <div className="relative w-full max-w-[36px] overflow-hidden rounded-full" style={{ height: 84 }}>
                <span className="absolute inset-0" style={{ backgroundImage: "repeating-linear-gradient(45deg,var(--hatch-a) 0 4px,var(--hatch-b) 4px 8px)" }} />
                <span className={`absolute bottom-0 w-full rounded-full ${i === hist.length - 1 ? "bg-lime" : "bg-[#CBF590]"}`} style={{ height: `${(v / histMax) * 100}%` }} />
              </div>
              <span className={`text-[10px] ${i === hist.length - 1 ? "font-bold" : "text-slate"}`}>{["Jun", "Jul", "Aug", "Sep", "Oct", "Nov"][i]}</span>
            </div>
          ))}
        </div>
      </section>

      {/* plans */}
      <section id="plans">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-heading text-sm font-bold">Plans</h2>
          <div role="tablist" aria-label="Billing period" className="flex rounded-full bg-surface p-1 text-xs font-medium shadow-sm ring-1 ring-line">
            {(["Monthly", "Yearly"] as const).map((t, i) => (
              <button key={t} role="tab" aria-selected={(i === 1) === yearly} onClick={() => setYearly(i === 1)}
                className={`rounded-full px-3 py-1 ${(i === 1) === yearly ? "bg-fg text-canvas" : "text-slate"}`}>{t}</button>
            ))}
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-4">
          {plans.map((p, i) => {
            const dir = i === cur ? "Current" : i > cur ? "Upgrade" : "Downgrade";
            return (
              <div key={p.id} className={`rounded-xl p-4 shadow-sm ring-1 ${p.id === user.plan ? "bg-lime-soft ring-lime" : "bg-surface ring-line"}`}>
                <p className="font-heading text-sm font-bold">{p.name}</p>
                <p className="font-mono text-xl">${yearly ? p.yearlyPerMonth : p.monthly}<span className="text-xs text-slate">/mo</span></p>
                <p className="mt-1 text-xs text-slate">{p.credits} credits</p>
                {dir === "Current" ? (
                  <p className="mt-3 w-full rounded-full bg-fg py-1.5 text-center text-xs font-semibold text-canvas">Current plan</p>
                ) : (
                  <>
                    <button className="mt-3 w-full rounded-full bg-lime py-1.5 text-xs font-semibold text-ink hover:bg-lime-hover">{dir}</button>
                    {dir === "Downgrade" && <p className="mt-1.5 text-center text-[10px] text-slate">Takes effect on {RENEW}</p>}
                  </>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* invoices */}
      <section>
        <h2 className="mb-3 font-heading text-sm font-bold">Invoices</h2>
        <table className="w-full overflow-hidden rounded-2xl bg-surface text-left text-sm shadow-sm ring-1 ring-line">
          <thead><tr className="border-b border-line text-xs text-slate"><th className="p-4 font-medium">Invoice</th><th className="p-4 font-medium">Date</th><th className="p-4 font-medium">Description</th><th className="p-4 font-medium">Amount</th><th className="p-4 font-medium">Status</th><th className="p-4"><span className="sr-only">Actions</span></th></tr></thead>
          <tbody>
            {invoices.map((i, x) => (
              <tr key={i.id} className={x ? "border-t border-line" : ""}>
                <td className="p-4 text-xs font-medium">{i.id}</td>
                <td className="p-4 text-sm">{i.date}</td>
                <td className="p-4 text-sm text-slate">{i.desc}</td>
                <td className="p-4 font-medium">{i.amount < 0 ? `−$${-i.amount}` : `$${i.amount}`}</td>
                <td className="p-4"><span className={`rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_STYLE[i.status]}`}>{i.status}</span></td>
                <td className="p-4 text-right"><button aria-label={`Download ${i.id}`} className="rounded-full p-1.5 text-slate hover:bg-surface-2 hover:text-fg"><svg viewBox="0 0 16 16" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M8 2v8M5 7l3 3 3-3M3 12.5h10"/></svg></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <Modal open={cancel} onClose={() => setCancel(false)} label="Cancel subscription" title="Cancel Pro?">
        <p className="mt-2 text-sm text-slate">You&apos;ll keep access until {RENEW}.</p>
        <div className="mt-5 flex justify-end gap-2">
          <button onClick={() => setCancel(false)} className="rounded-full border border-line-2 px-4 py-2 text-sm font-medium">Keep plan</button>
          <button onClick={() => setCancel(false)} className="rounded-full bg-[#B3261E] px-4 py-2 text-sm font-semibold text-white">Cancel</button>
        </div>
      </Modal>
      <Modal open={card} onClose={() => setCard(false)} label="Update card" title="Update card">
        <div className="mt-4 space-y-3">
          <label className="block text-xs font-medium text-slate">Card number
            <input inputMode="numeric" placeholder="4242 4242 4242 4242" className="mt-1 w-full rounded-lg border border-line-2 px-3 py-2.5 font-mono text-sm" /></label>
          <div className="grid grid-cols-2 gap-3">
            <label className="block text-xs font-medium text-slate">Expiry
              <input placeholder="MM / YY" className="mt-1 w-full rounded-lg border border-line-2 px-3 py-2.5 font-mono text-sm" /></label>
            <label className="block text-xs font-medium text-slate">CVC
              <input inputMode="numeric" placeholder="123" className="mt-1 w-full rounded-lg border border-line-2 px-3 py-2.5 font-mono text-sm" /></label>
          </div>
          <p className="text-xs text-slate">Demo mode — Stripe Checkout will handle this.</p>
          <button onClick={() => setCard(false)} className="w-full rounded-full bg-lime py-2.5 text-sm font-semibold text-ink">Save card</button>
        </div>
      </Modal>
    </div>
  );
}
export default function Page() { return <Suspense><Billing /></Suspense>; }
