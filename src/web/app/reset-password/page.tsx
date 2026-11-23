import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import Link from "next/link";

export const metadata = { title: "Reset password — Kivlo" };

export default function Page() {
  return (
    <>
      <Nav />
      <main className="flex min-h-[70vh] items-center justify-center px-5 py-16">
        <div className="w-full max-w-md rounded-[24px] bg-white p-8 shadow-sm ring-1 ring-black/5">
          <h1 className="font-heading text-2xl font-bold">Reset your password</h1>
          <p className="mt-2 text-sm text-slate">Enter your account email and we&apos;ll send a reset link.</p>
          <form className="mt-6 space-y-4" action="/verify-email">
            <div>
              <label htmlFor="reset-email" className="mb-1.5 block text-[13px] font-medium text-ink">Email</label>
              <input id="reset-email" type="email" required placeholder="you@example.com"
                className="w-full rounded-xl border border-control-border bg-white px-3.5 py-2.5 text-sm text-ink placeholder:text-slate/60 focus:border-lime-deep focus:outline-none focus:ring-2 focus:ring-lime/50" />
            </div>
            <button type="submit" className="w-full rounded-full bg-lime py-3 text-sm font-bold text-ink hover:bg-lime-hover">Send reset link</button>
          </form>
          <p className="mt-4 text-center text-xs text-slate">Demo mode — no email is actually sent.</p>
          <Link href="/login" className="mt-4 block text-center text-sm font-semibold text-lime-deep hover:underline">Back to log in</Link>
        </div>
      </main>
      <Footer />
    </>
  );
}
