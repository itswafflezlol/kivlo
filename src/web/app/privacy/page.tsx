import Link from "next/link";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";

export const metadata = { title: "Privacy — Kivlo" };

export default function Page() {
  return (
    <>
      <Nav />
      <main className="mx-auto max-w-[1200px] px-5 py-24">
        <h1 className="font-display text-4xl font-extrabold">
          Privacy
        </h1>
        <p className="mt-4 text-lg text-slate">Coming soon.</p>
        <Link
          href="/"
          className="mt-6 inline-block text-sm font-semibold text-lime-deep underline-offset-4 hover:underline"
        >
          ← Back home
        </Link>
      </main>
      <Footer />
    </>
  );
}
