"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { setSession } from "@/lib/session";

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? "";
const APPLE_SERVICE_ID = process.env.NEXT_PUBLIC_APPLE_SERVICE_ID ?? "";
const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

type TokenCallback = (resp: { access_token?: string; error?: string }) => void;
declare global {
  interface Window {
    google?: { accounts: { oauth2: { initTokenClient: (cfg: { client_id: string; scope: string; callback: TokenCallback }) => { requestAccessToken: () => void } } } };
    AppleID?: {
      auth: {
        init: (cfg: { clientId: string; scope: string; redirectURI: string; usePopup: boolean }) => void;
        signIn: () => Promise<{ authorization: { id_token: string }; user?: { name?: { firstName: string; lastName: string } } }>;
      };
    };
  }
}

function loadScript(src: string) {
  return new Promise<void>((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) return resolve();
    const s = document.createElement("script");
    s.src = src;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error("script load failed"));
    document.head.appendChild(s);
  });
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
      <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92c1.7-1.57 2.68-3.88 2.68-6.62Z" />
      <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.8.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.03-3.7H.96v2.33A9 9 0 0 0 9 18Z" />
      <path fill="#FBBC05" d="M3.97 10.72a5.41 5.41 0 0 1 0-3.44V4.95H.96a9 9 0 0 0 0 8.1l3.01-2.33Z" />
      <path fill="#EA4335" d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.59C13.46.9 11.42 0 9 0A9 9 0 0 0 .96 4.95l3.01 2.33c.71-2.12 2.69-3.7 5.03-3.7Z" />
    </svg>
  );
}

function AppleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="currentColor" d="M17.05 12.54c-.03-2.89 2.36-4.28 2.47-4.35-1.34-1.97-3.44-2.24-4.18-2.27-1.78-.18-3.47 1.05-4.37 1.05-.9 0-2.29-1.02-3.77-1-1.94.03-3.72 1.13-4.72 2.86-2.01 3.49-.51 8.66 1.45 11.49.96 1.39 2.1 2.95 3.6 2.89 1.45-.06 1.99-.93 3.74-.93s2.24.93 3.77.9c1.56-.02 2.55-1.41 3.5-2.81 1.1-1.61 1.55-3.17 1.58-3.25-.04-.02-3.03-1.16-3.07-4.58ZM14.16 4.06c.8-.97 1.34-2.32 1.19-3.66-1.15.05-2.55.77-3.38 1.74-.74.85-1.39 2.23-1.22 3.54 1.29.1 2.6-.65 3.41-1.62Z" />
    </svg>
  );
}

export default function AuthCard({ mode }: { mode: "login" | "signup" }) {
  const params = useSearchParams();
  const url = mode === "signup" ? params.get("url") : null;
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [notice, setNotice] = useState("");
  const [demoNote, setDemoNote] = useState(false);
  const [busy, setBusy] = useState(false);

  const isSignup = mode === "signup";
  const title = isSignup ? "Create your account" : "Welcome back";
  const sub = isSignup
    ? "Free plan · 3 credits a month · No card needed"
    : "Log in to keep clipping.";

  const dest = () => (url ? `/app?url=${encodeURIComponent(url)}` : "/app");

  const demo = (name: string, mail: string, provider: "google" | "apple" | "email") => {
    setSession({ name, email: mail, provider });
    setDemoNote(true);
    setTimeout(() => router.push(dest()), 350);
  };

  const google = async () => {
    setNotice("");
    if (!GOOGLE_CLIENT_ID) { setNotice("Google sign-in isn't set up yet."); return; }
    setBusy(true);
    try {
      await loadScript("https://accounts.google.com/gsi/client");
      const client = window.google!.accounts.oauth2.initTokenClient({
        client_id: GOOGLE_CLIENT_ID,
        scope: "openid email profile",
        callback: async (resp: { access_token?: string; error?: string }) => {
          if (resp.error || !resp.access_token) {
            setBusy(false);
            setNotice(resp.error === "popup_closed" ? "The Google window closed before sign-in finished." : "Google sign-in didn't work. Try again.");
            return;
          }
          try {
            const r = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
              headers: { Authorization: `Bearer ${resp.access_token}` },
            });
            const p = await r.json();
            setSession({ name: p.name ?? p.email, email: p.email, picture: p.picture, provider: "google" });
            router.push(dest());
          } catch {
            setBusy(false);
            setNotice("Couldn't read your Google profile. Try again.");
          }
        },
      });
      client.requestAccessToken();
    } catch {
      setBusy(false);
      setNotice("Couldn't reach Google. Check your connection and try again.");
    }
  };

  const apple = async () => {
    setNotice("");
    if (!APPLE_SERVICE_ID) { setNotice("Apple sign-in is coming soon."); return; }
    setBusy(true);
    try {
      await loadScript("https://appleid.cdn-apple.com/appleauth/static/jsapi/appleid/1/en_US/appleid.auth.js");
      window.AppleID!.auth.init({
        clientId: APPLE_SERVICE_ID,
        scope: "name email",
        redirectURI: `${window.location.origin}${BASE}/login/`,
        usePopup: true,
      });
      const res = await window.AppleID!.auth.signIn();
      const payload = JSON.parse(atob(res.authorization.id_token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")));
      const name = res.user?.name ? `${res.user.name.firstName} ${res.user.name.lastName}` : (payload.email ?? "Apple user");
      setSession({ name, email: payload.email ?? "", provider: "apple" });
      router.push(dest());
    } catch (e) {
      setBusy(false);
      setNotice((e as { error?: string })?.error === "popup_closed_by_user" ? "The Apple window closed before sign-in finished." : "Apple sign-in didn't work. Try again.");
    }
  };

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
        <button type="button" onClick={google} disabled={busy}
          className="flex w-full items-center justify-center gap-2.5 rounded-full border border-control-border bg-white py-2.5 text-sm font-semibold text-ink transition-colors duration-150 hover:bg-mist/60 disabled:opacity-50">
          <GoogleIcon />
          Continue with Google
        </button>
        <button type="button" onClick={apple} disabled={busy}
          className="flex w-full items-center justify-center gap-2.5 rounded-full border border-control-border bg-white py-2.5 text-sm font-semibold text-ink transition-colors duration-150 hover:bg-mist/60 disabled:opacity-50">
          <AppleIcon />
          Continue with Apple
        </button>
      </div>

      {notice && (
        <div className="price-fade mt-4 rounded-xl bg-mist px-3.5 py-2.5 text-center text-[13px] text-ink">
          <p>{notice}</p>
          <button type="button" onClick={() => demo("Demo user", "demo@kivlo.app", "email")}
            className="mt-1.5 font-semibold text-lime-deep underline-offset-4 hover:underline">
            Continue in demo mode
          </button>
        </div>
      )}

      <div className="my-5 flex items-center gap-3 text-xs text-slate">
        <span className="h-px flex-1 bg-border" />
        or with email
        <span className="h-px flex-1 bg-border" />
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          demo(email.split("@")[0] || "Kivlo user", email, "email");
        }}
        className="space-y-3"
      >
        <div>
          <label htmlFor="email" className="mb-1.5 block text-[13px] font-medium text-ink">Email</label>
          <input id="email" type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full rounded-xl border border-control-border bg-white px-3.5 py-2.5 text-sm text-ink placeholder:text-slate/60 focus:border-lime-deep focus:outline-none focus:ring-2 focus:ring-lime/50" />
        </div>
        <div>
          <label htmlFor="password" className="mb-1.5 block text-[13px] font-medium text-ink">Password</label>
          <input id="password" type="password" required minLength={8} autoComplete={isSignup ? "new-password" : "current-password"}
            value={password} onChange={(e) => setPassword(e.target.value)} placeholder={isSignup ? "8+ characters" : "Your password"}
            className="w-full rounded-xl border border-control-border bg-white px-3.5 py-2.5 text-sm text-ink placeholder:text-slate/60 focus:border-lime-deep focus:outline-none focus:ring-2 focus:ring-lime/50" />
        </div>

        {!isSignup && (
          <div className="flex justify-end">
            <Link href="/reset-password" className="text-[13px] font-medium text-slate underline-offset-4 hover:text-ink hover:underline">
              Forgot password?
            </Link>
          </div>
        )}

        <button type="submit" className="w-full rounded-full bg-lime py-3 text-sm font-bold text-ink transition-colors duration-200 hover:bg-lime-hover active:bg-lime-press">
          {isSignup ? "Start free" : "Log in"}
        </button>
      </form>

      {demoNote && (
        <p className="price-fade mt-4 rounded-xl bg-mist px-3.5 py-2.5 text-center text-[13px] text-ink">
          Demo mode — signing you in to the app.
        </p>
      )}

      <p className="mt-6 text-center text-sm text-slate">
        {isSignup ? "Already have an account? " : "New to Kivlo? "}
        <Link href={isSignup ? "/login" : "/signup"} className="font-semibold text-lime-deep underline-offset-4 hover:underline">
          {isSignup ? "Log in" : "Start free"}
        </Link>
      </p>

      {isSignup && (
        <p className="mt-4 text-center text-xs leading-relaxed text-slate">
          By signing up you agree to our{" "}
          <Link href="/terms" className="underline underline-offset-2 hover:text-ink">Terms</Link>{" "}
          and{" "}
          <Link href="/privacy" className="underline underline-offset-2 hover:text-ink">Privacy Policy</Link>.
        </p>
      )}
    </div>
  );
}
