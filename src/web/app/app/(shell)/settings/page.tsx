"use client";
import Link from "next/link";
import { useState } from "react";
import { user } from "@/lib/mock";
import { PlatformGlyph, Modal, Toggle, Select } from "@/components/app/ui";
import { platformLabel } from "@/components/app/PlatformIcon";
import { useTheme } from "@/lib/theme";

const PLATS = ["tiktok", "shorts", "reels", "x"] as const;
export default function Settings() {
  const [del, setDel] = useState(false);
  const [on, setOn] = useState([true, true, true]);
  const [theme, setTheme] = useTheme();
  return (
    <div className="max-w-2xl space-y-6">
      <nav aria-label="Settings" className="flex w-fit gap-1 rounded-full bg-surface p-1 shadow-sm ring-1 ring-line">
        {[["Profile", "/app/settings"], ["Accounts", "/app/settings/accounts"], ["Notifications", "/app/settings"], ["Danger zone", "/app/settings"]].map(([l, href]) => (
          <Link key={l} href={href} className={`rounded-full px-4 py-1.5 text-xs font-medium ${l === "Profile" ? "bg-fg text-canvas" : "text-slate hover:text-fg"}`}>{l}</Link>
        ))}
      </nav>
      <section className="rounded-2xl bg-surface p-5 ring-1 ring-line">
        <h3 className="mb-4 font-heading text-sm font-bold">Profile</h3>
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-ink font-heading font-bold text-lime">A</span>
          <div><p className="text-sm font-medium">{user.name}</p><p className="text-xs text-slate">{user.email}</p></div>
        </div>
        <label className="mt-4 block text-sm font-medium">Theme
          <Select label="Theme" value={theme} onChange={(v) => setTheme(v as typeof theme)} className="mt-1 block w-48">
            <option value="light">Light</option>
            <option value="dark">Dark</option>
            <option value="system">System</option>
          </Select>
        </label>
      </section>
      <section className="rounded-2xl bg-surface p-5 ring-1 ring-line">
        <h3 className="mb-4 font-heading text-sm font-bold">Connected accounts</h3>
        {PLATS.map((p, i) => (
          <div key={p} className="flex items-center gap-3 border-b border-line py-3 last:border-0">
            <PlatformGlyph p={p} />
            <span className="flex-1 text-sm capitalize">{platformLabel(p)}</span>
            {i === 0 ? <span className="font-mono text-xs text-slate">@alex</span> : <span className="text-xs text-slate">Coming soon</span>}
            <button className="rounded-full border border-line-2 px-3 py-1.5 text-xs font-medium hover:border-fg">{i === 0 ? "Disconnect" : "Connect"}</button>
          </div>
        ))}
        <p className="mt-2 text-xs text-slate">1 of 1 used on Pro</p>
      </section>
      <section className="rounded-2xl bg-surface p-5 ring-1 ring-line">
        <h3 className="mb-4 font-heading text-sm font-bold">Notifications</h3>
        {["Email when clips are ready", "Email reminders to post", "Browser notifications"].map((l, i) => (
          <div key={l} className="flex items-center justify-between py-2 text-sm">{l}
            <Toggle label={l} checked={on[i]} onChange={(v) => setOn((o) => o.map((x, j) => (j === i ? v : x)))} />
          </div>
        ))}
      </section>
      <button onClick={() => setDel(true)} className="text-sm text-error underline underline-offset-2">Delete account</button>
      <Modal open={del} onClose={() => setDel(false)} label="Delete account" title="Delete your account?">
        <p className="mt-2 text-sm text-slate">All projects, clips and presets will be removed.</p>
        <div className="mt-5 flex justify-end gap-2">
          <button onClick={() => setDel(false)} className="rounded-full border border-line-2 px-4 py-2 text-sm font-medium">Keep</button>
          <button onClick={() => setDel(false)} className="rounded-full bg-[#B3261E] px-4 py-2 text-sm font-semibold text-white">Delete</button>
        </div>
      </Modal>
    </div>
  );
}
