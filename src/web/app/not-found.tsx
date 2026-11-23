import Link from "next/link";
export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-paper px-6 text-center">
      <p className="font-mono text-sm text-slate">404</p>
      <h1 className="mt-2 font-display text-4xl font-semibold">That page doesn&apos;t exist.</h1>
      <Link href="/app" className="mt-6 rounded-full bg-lime px-6 py-3 text-sm font-semibold text-ink hover:bg-lime-hover">Go to dashboard</Link>
    </main>
  );
}
