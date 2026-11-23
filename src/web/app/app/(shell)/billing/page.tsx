"use client";
import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { user, invoices } from "@/lib/mock";
import { plans } from "@/lib/pricing";
import { Modal } from "@/components/app/ui";

function Billing() {
  const pastDue = useSearchParams().get("state") === "past_due";
  const [yearly, setYearly] = useState(true);
  const [cancel, setCancel] = useState(false);
  const left = user.creditsTotal - user.creditsUsed;
  return (
    <div className="max-w-3xl space-y-6">
      {pastDue && <p role="alert" className="rounded-xl bg-[#F5A524]/10 px-4 py-3 text-sm text-[#8A5300]">Payment failed — you have 7 days to update your card.</p>}
      <div className="rounded-2xl bg-white p-5 ring-1 ring-black/5">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <p className="font-heading text-lg font-bold capitalize">{user.plan} plan</p>
          <p className="text-sm text-slate">Renews {user.renewsAt}</p>
        </div>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-mist"><div className="h-full bg-lime" style={{ width: `${(user.creditsUsed / user.creditsTotal) * 100}%` }} /></div>
        <p className="mt-2 font-mono text-sm">{left} credits left of {user.creditsTotal}</p>
        <button onClick={() => setCancel(true)} className="mt-4 text-xs text-slate underline underline-offset-2 hover:text-[#B3261E]">Cancel subscription</button>
      </div>
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-heading text-sm font-bold">Plans</h2>
          <button onClick={() => setYearly(!yearly)} className="rounded-full border border-black/10 bg-white px-3 py-1.5 text-xs font-medium">{yearly ? "Yearly" : "Monthly"}</button>
        </div>
        <div className="grid gap-3 sm:grid-cols-4">
          {plans.map((p) => (
            <div key={p.id} className={`rounded-xl p-4 ring-1 ${p.id === user.plan ? "bg-lime-soft ring-lime" : "bg-white ring-black/5"}`}>
              <p className="font-heading text-sm font-bold">{p.name}</p>
              <p className="font-mono text-xl">${yearly ? p.yearlyPerMonth : p.monthly}<span className="text-xs text-slate">/mo</span></p>
              <p className="mt-1 text-xs text-slate">{p.credits} credits</p>
              <button className={`mt-3 w-full rounded-full py-1.5 text-xs font-semibold ${p.id === user.plan ? "bg-ink text-white" : "bg-lime text-ink"}`}>{p.id === user.plan ? "Current" : "Switch"}</button>
            </div>
          ))}
        </div>
      </div>
      <div>
        <h2 className="mb-3 font-heading text-sm font-bold">Invoices</h2>
        <table className="w-full rounded-xl bg-white text-left text-sm ring-1 ring-black/5">
          <thead><tr className="border-b border-hairline text-xs text-slate"><th className="p-3 font-medium">Date</th><th className="p-3 font-medium">Amount</th><th className="p-3 font-medium">Status</th><th className="p-3"><span className="sr-only">Actions</span></th></tr></thead>
          <tbody>{invoices.map((i) => <tr key={i.id} className="border-b border-hairline last:border-0"><td className="p-3 font-mono text-xs">{i.date}</td><td className="p-3">${i.amount}</td><td className="p-3">{i.status}</td><td className="p-3 text-right"><button className="text-xs font-medium text-lime-deep hover:underline">PDF</button></td></tr>)}</tbody>
        </table>
      </div>
      <Modal open={cancel} onClose={() => setCancel(false)} label="Cancel subscription">
        <h2 className="font-heading text-lg font-bold">Cancel Pro?</h2>
        <p className="mt-2 text-sm text-slate">You&apos;ll keep access until {user.renewsAt}.</p>
        <div className="mt-5 flex justify-end gap-2">
          <button onClick={() => setCancel(false)} className="rounded-full border border-black/10 px-4 py-2 text-sm font-medium">Keep plan</button>
          <button onClick={() => setCancel(false)} className="rounded-full bg-[#B3261E] px-4 py-2 text-sm font-semibold text-white">Cancel</button>
        </div>
      </Modal>
    </div>
  );
}
export default function Page() { return <Suspense><Billing /></Suspense>; }
