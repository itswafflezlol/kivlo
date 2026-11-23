"use client";

import Link from "next/link";
import { connectedAccounts } from "@/lib/mock";
import { PlatformGlyph } from "@/components/app/ui";

export default function AccountsPage() {
  const used = connectedAccounts.filter((a) => a.role === "Posts to" && a.connected).length;
  return (
    <div className="mx-auto max-w-2xl">
      <nav aria-label="Settings" className="flex gap-1 rounded-full bg-surface p-1 shadow-sm ring-1 ring-line w-fit">
        {[["Profile", "/app/settings"], ["Accounts", "/app/settings/accounts"], ["Notifications", "/app/settings"], ["Danger zone", "/app/settings"]].map(([l, href]) => (
          <Link key={l} href={href} className={`rounded-full px-4 py-1.5 text-xs font-medium ${l === "Accounts" ? "bg-fg text-canvas" : "text-slate hover:text-fg"}`}>{l}</Link>
        ))}
      </nav>
      <div className="mt-6 flex items-center justify-between">
        <h2 className="font-heading text-2xl font-bold">Accounts</h2>
        <p className="font-mono text-xs text-slate">{used} of 1 used on Pro</p>
      </div>
      <p className="mt-1 text-sm text-slate">Connect the platforms Kivlo posts to and imports from.</p>
      <ul className="mt-6 space-y-3">
        {connectedAccounts.map((a) => (
          <li key={a.id} className="flex items-center gap-4 rounded-2xl bg-surface p-4 shadow-sm ring-1 ring-line">
            <PlatformGlyph p={a.id as never} size={26} />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium">{a.name} <span className="text-xs font-normal text-slate">· {a.role}</span></p>
              <p className="text-xs text-slate">{a.connected ? `Connected as ${a.handle}` : a.role === "Posts to" ? "Auto-post coming soon" : "Import from your own channel"}</p>
            </div>
            <button className={`rounded-full px-4 py-2 text-xs font-semibold ${a.connected ? "bg-surface-2 text-fg" : "bg-lime text-ink hover:bg-lime-hover"}`}>
              {a.connected ? "Connected" : "Connect"}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
