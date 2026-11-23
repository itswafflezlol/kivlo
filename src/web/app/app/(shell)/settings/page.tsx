"use client";
import { useState } from "react";
import { user } from "@/lib/mock";
import { PlatformGlyph, Modal } from "@/components/app/ui";

const PLATS = ["tiktok", "shorts", "reels", "x"] as const;
export default function Settings() {
  const [del, setDel] = useState(false);
  return (
    <div className="max-w-2xl space-y-6">
      <section className="rounded-2xl bg-white p-5 ring-1 ring-black/5">
        <h3 className="mb-4 font-heading text-sm font-bold">Profile</h3>
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-ink font-heading font-bold text-lime">S</span>
          <div><p className="text-sm font-medium">{user.name}</p><p className="text-xs text-slate">{user.email}</p></div>
        </div>
        <label className="mt-4 block text-sm font-medium">Theme
          <select className="mt-1 rounded-lg border border-black/10 bg-white px-3 py-2 text-sm"><option>Light</option><option>Dark</option><option>System</option></select>
        </label>
      </section>
      <section className="rounded-2xl bg-white p-5 ring-1 ring-black/5">
        <h3 className="mb-4 font-heading text-sm font-bold">Connected accounts</h3>
        {PLATS.map((p, i) => (
          <div key={p} className="flex items-center gap-3 border-b border-hairline py-3 last:border-0">
            <PlatformGlyph p={p} />
            <span className="flex-1 text-sm capitalize">{p === "x" ? "X" : p}</span>
            {i === 0 ? <span className="font-mono text-xs text-slate">@shabo</span> : <span className="text-xs text-slate">Coming soon</span>}
            <button className="rounded-full border border-black/10 px-3 py-1.5 text-xs font-medium hover:border-ink">{i === 0 ? "Disconnect" : "Connect"}</button>
          </div>
        ))}
        <p className="mt-2 text-xs text-slate">1 of 1 used on Pro</p>
      </section>
      <section className="rounded-2xl bg-white p-5 ring-1 ring-black/5">
        <h3 className="mb-4 font-heading text-sm font-bold">Notifications</h3>
        {["Email when clips are ready", "Email reminders to post", "Browser notifications"].map((l) => (
          <label key={l} className="flex items-center justify-between py-2 text-sm">{l}<input type="checkbox" defaultChecked className="h-4 w-4 accent-ink" /></label>
        ))}
      </section>
      <button onClick={() => setDel(true)} className="text-sm text-[#B3261E] underline underline-offset-2">Delete account</button>
      <Modal open={del} onClose={() => setDel(false)} label="Delete account">
        <h3 className="font-heading text-lg font-bold">Delete your account?</h3>
        <p className="mt-2 text-sm text-slate">All projects, clips and presets will be removed.</p>
        <div className="mt-5 flex justify-end gap-2">
          <button onClick={() => setDel(false)} className="rounded-full border border-black/10 px-4 py-2 text-sm font-medium">Keep</button>
          <button onClick={() => setDel(false)} className="rounded-full bg-[#B3261E] px-4 py-2 text-sm font-semibold text-white">Delete</button>
        </div>
      </Modal>
    </div>
  );
}
