"use client";

import { useState } from "react";
import { notifications as seed, type AppNotification } from "@/lib/mock";

const FILTERS: { id: string; label: string; match: (n: AppNotification) => boolean }[] = [
  { id: "all", label: "All", match: () => true },
  { id: "unread", label: "Unread", match: (n) => !n.read },
  { id: "render", label: "Renders", match: (n) => n.kind === "render" },
  { id: "post", label: "Posts", match: (n) => n.kind === "post" },
  { id: "billing", label: "Billing", match: (n) => n.kind === "billing" },
];

export default function NotificationsPage() {
  const [list, setList] = useState(seed);
  const [f, setF] = useState("all");
  const shown = list.filter(FILTERS.find((x) => x.id === f)!.match);
  const unread = list.filter((n) => !n.read).length;
  return (
    <div className="mx-auto max-w-2xl">
      <div className="flex flex-wrap items-center gap-3">
        <h2 className="font-heading text-2xl font-bold">Notifications</h2>
        {unread > 0 && (
          <button onClick={() => setList(list.map((n) => ({ ...n, read: true })))}
            className="ml-auto rounded-full bg-surface px-4 py-2 text-xs font-medium shadow-sm ring-1 ring-line hover:shadow">
            Mark all read
          </button>
        )}
      </div>
      <div role="tablist" aria-label="Filter notifications" className="mt-4 flex w-fit rounded-full bg-surface p-1 shadow-sm ring-1 ring-line">
        {FILTERS.map((x) => (
          <button key={x.id} role="tab" aria-selected={f === x.id} onClick={() => setF(x.id)}
            className={`rounded-full px-4 py-1.5 text-xs font-medium ${f === x.id ? "bg-fg text-canvas" : "text-slate"}`}>{x.label}</button>
        ))}
      </div>
      <ul className="mt-6 overflow-hidden rounded-2xl bg-surface shadow-sm ring-1 ring-line">
        {shown.map((n, i) => (
          <li key={n.id} className={`flex items-start gap-3 px-5 py-4 ${i ? "border-t border-line" : ""} ${n.read ? "" : "bg-lime-soft/40"}`}>
            <span aria-hidden className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${n.read ? "bg-line-2" : "bg-lime-deep"}`} />
            <div className="min-w-0 flex-1">
              <p className="text-sm">{n.text}</p>
              <p className="mt-0.5 text-xs text-slate">{n.time} · {n.kind}</p>
            </div>
            {!n.read && (
              <button onClick={() => setList(list.map((x) => x.id === n.id ? { ...x, read: true } : x))}
                className="shrink-0 text-xs font-medium text-lime-deep hover:underline">Mark read</button>
            )}
          </li>
        ))}
        {!shown.length && <li className="px-5 py-10 text-center text-sm text-slate">Nothing here.</li>}
      </ul>
    </div>
  );
}
