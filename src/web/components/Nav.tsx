"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import ArrowPill from "./ArrowPill";

const links = [
  { label: "Features", href: "/#features" },
  { label: "How it works", href: "/#how" },
  { label: "Pricing", href: "/pricing" },
  { label: "FAQ", href: "/#faq" },
];

export default function Nav() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-paper/90 backdrop-blur-sm">
      <nav
        className="mx-auto flex max-w-[1400px] items-center justify-between px-5 py-3.5"
        aria-label="Main"
      >
        <Link href="/" aria-label="Kivlo home" className="flex items-center">
          <Image
            src="/kivlo-logo.png"
            alt="Kivlo"
            width={78}
            height={34}
            priority
            className="h-[34px] w-auto"
          />
        </Link>

        <ul className="hidden items-center gap-8 md:flex">
          {links.map((l) => (
            <li key={l.label}>
              <Link
                href={l.href}
                className="text-[15px] font-medium text-ink transition-colors duration-150 ease-out hover:text-lime-deep"
              >
                {l.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="hidden items-center gap-6 md:flex">
          <Link
            href="/login"
            className="text-sm font-medium text-ink transition-colors duration-150 ease-out hover:text-lime-deep"
          >
            Log in
          </Link>
          <ArrowPill href="/signup">Start Free</ArrowPill>
        </div>

        <button
          type="button"
          className="rounded-full border border-control-border p-2 md:hidden"
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label="Toggle menu"
          onClick={() => setOpen((v) => !v)}
        >
          <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true">
            <path
              d={open ? "M4 4l12 12M16 4L4 16" : "M3 6h14M3 10h14M3 14h14"}
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </nav>

      {open && (
        <div
          id="mobile-menu"
          className="menu-in border-t border-border px-5 pb-5 pt-2 md:hidden"
        >
          <ul className="flex flex-col gap-1">
            {links.map((l) => (
              <li key={l.label}>
                <Link
                  href={l.href}
                  className="block rounded-lg px-2 py-2.5 text-base font-medium"
                  onClick={() => setOpen(false)}
                >
                  {l.label}
                </Link>
              </li>
            ))}
            <li>
              <Link
                href="/login"
                className="block rounded-lg px-2 py-2.5 text-base font-medium"
              >
                Log in
              </Link>
            </li>
            <li className="pt-2">
              <ArrowPill href="/signup" className="w-full justify-between">
                Start Free
              </ArrowPill>
            </li>
          </ul>
        </div>
      )}
    </header>
  );
}
