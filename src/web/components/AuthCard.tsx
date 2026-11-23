"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92c1.7-1.57 2.68-3.88 2.68-6.62Z"
      />
      <path
        fill="#34A853"
        d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.8.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.03-3.7H.96v2.33A9 9 0 0 0 9 18Z"
      />
      <path
        fill="#FBBC05"
        d="M3.97 10.72a5.41 5.41 0 0 1 0-3.44V4.95H.96a9 9 0 0 0 0 8.1l3.01-2.33Z"
      />
      <path
        fill="#EA4335"
        d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.59C13.46.9 11.42 0 9 0A9 9 0 0 0 .96 4.95l3.01 2.33c.71-2.12 2.69-3.7 5.03-3.7Z"
      />
    </svg>
  );
}

function TwitchIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#9146FF"
        d="M4.27 2 2 6.4v14.14h4.93V24h2.74l2.74-3.46h4.11L21.6 13.4V2H4.27Zm15.06 10.5-3.07 3.46h-4.8l-2.74 3.47v-3.47H5.15V4.27h14.18v8.23Zm-3.08-5.14v4.8h-1.9v-4.8h1.9Zm-5.14 0v4.8H9.2v-4.8h1.91Z"
      />
    </svg>
  );
}

export default function AuthCard({ mode }: { mode: "login" | "signup" }) {
  const params = useSearchParams();
  const url = mode === "signup" ? params.get("url") : null;
  const [notice, setNotice] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const isSignup = mode === "signup";
  const title = isSignup ? "Create your account" : "Welcome back";
  const sub = isSignup
    ? "Free plan · 3 credits a month · No card needed"
    : "Log in to keep clipping.";

  const pending = () => setNotice(true);

  return (
    <div className="hero-in mx-auto w-full max-w-[420px] rounded-[28px] border border-border bg-white p-7 shadow-[0_24px_60px_-30px_rgba(0,0,0,0.25)] sm:p-9">
      <h1 className="font-heading text-2xl font-extrabold text-ink">{title}</h1>
      <p className="mt-1.5 text-sm text-slate">{sub}</p>

      {url && (
        <div className="mt-4 flex items-start gap-2 rounded-xl bg-lime-soft px-3.5 py-3 text-[13px] text-ink">
          <span className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-lime-deep" />
          <span className="min-w-0">
            <span className="font-semibold">Your link is saved.</span>
            <br />
            <span className="break-all text-slate">{url}</span>
          </span>
        </div>
      )}

      <div className="mt-6 space-y-2.5">
        <button
          type="button"
          onClick={pending}
          className="flex w-full items-center justify-center gap-2.5 rounded-full border border-control-border bg-white py-2.5 text-sm font-semibold text-ink transition-colors duration-150 hover:bg-mist/60"
        >
          <GoogleIcon />
          Continue with Google
        </button>
        <button
          type="button"
          onClick={pending}
          className="flex w-full items-center justify-center gap-2.5 rounded-full border border-control-border bg-white py-2.5 text-sm font-semibold text-ink transition-colors duration-150 hover:bg-mist/60"
        >
          <TwitchIcon />
          Continue with Twitch
        </button>
      </div>

      <div className="my-5 flex items-center gap-3 text-xs text-slate">
        <span className="h-px flex-1 bg-border" />
        or with email
        <span className="h-px flex-1 bg-border" />
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          pending();
        }}
        className="space-y-3"
      >
        <div>
          <label htmlFor="email" className="mb-1.5 block text-[13px] font-medium text-ink">
            Email
          </label>
          <input
            id="email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full rounded-xl border border-control-border bg-white px-3.5 py-2.5 text-sm text-ink placeholder:text-slate/60 focus:border-lime-deep focus:outline-none focus:ring-2 focus:ring-lime/50"
          />
        </div>
        <div>
          <label htmlFor="password" className="mb-1.5 block text-[13px] font-medium text-ink">
            Password
          </label>
          <input
            id="password"
            type="password"
            required
            minLength={8}
            autoComplete={isSignup ? "new-password" : "current-password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={isSignup ? "8+ characters" : "Your password"}
            className="w-full rounded-xl border border-control-border bg-white px-3.5 py-2.5 text-sm text-ink placeholder:text-slate/60 focus:border-lime-deep focus:outline-none focus:ring-2 focus:ring-lime/50"
          />
        </div>

        {!isSignup && (
          <div className="flex justify-end">
            <button
              type="button"
              onClick={pending}
              className="text-[13px] font-medium text-slate underline-offset-4 hover:text-ink hover:underline"
            >
              Forgot password?
            </button>
          </div>
        )}

        <button
          type="submit"
          className="w-full rounded-full bg-lime py-3 text-sm font-bold text-ink transition-colors duration-200 hover:bg-lime-hover active:bg-lime-press"
        >
          {isSignup ? "Start free" : "Log in"}
        </button>
      </form>

      {notice && (
        <p className="price-fade mt-4 rounded-xl bg-mist px-3.5 py-2.5 text-center text-[13px] text-ink">
          Auth isn&apos;t wired up yet — accounts ship with the backend.
        </p>
      )}

      <p className="mt-6 text-center text-sm text-slate">
        {isSignup ? "Already have an account? " : "New to Kivlo? "}
        <Link
          href={isSignup ? "/login" : "/signup"}
          className="font-semibold text-lime-deep underline-offset-4 hover:underline"
        >
          {isSignup ? "Log in" : "Start free"}
        </Link>
      </p>

      {isSignup && (
        <p className="mt-4 text-center text-xs leading-relaxed text-slate">
          By signing up you agree to our{" "}
          <Link href="/terms" className="underline underline-offset-2 hover:text-ink">
            Terms
          </Link>{" "}
          and{" "}
          <Link href="/privacy" className="underline underline-offset-2 hover:text-ink">
            Privacy Policy
          </Link>
          .
        </p>
      )}
    </div>
  );
}
