import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import Link from "next/link";

export const metadata = { title: "Verify your email — Kivlo" };

export default function Page() {
  return (
    <>
      <Nav />
      <main className="flex min-h-[70vh] items-center justify-center px-5 py-16">
        <div className="w-full max-w-md rounded-[24px] bg-white p-8 text-center shadow-sm ring-1 ring-black/5">
          <span aria-hidden className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-lime text-ink">
            <svg viewBox="0 0 20 20" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="2" y="4" width="16" height="12" rx="2"/><path d="m2.5 5.5 7.5 6 7.5-6"/></svg>
          </span>
          <h1 className="mt-4 font-heading text-2xl font-bold">Check your inbox</h1>
          <p className="mt-2 text-sm text-slate">We sent a verification link to your email. Click it to activate your Kivlo account.</p>
          <p className="mt-4 text-xs text-slate">Demo mode — no email is actually sent.</p>
          <Link href="/app" className="mt-6 block rounded-full bg-lime py-3 text-sm font-bold text-ink hover:bg-lime-hover">Continue to the app</Link>
          <Link href="/login" className="mt-3 block text-sm font-medium text-slate hover:text-ink">Back to log in</Link>
        </div>
      </main>
      <Footer />
    </>
  );
}
