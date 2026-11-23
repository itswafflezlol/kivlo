import Link from "next/link";

export function LegalSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-10">
      <h2 className="font-heading text-xl font-bold text-ink">{title}</h2>
      <div className="mt-3 space-y-3 text-[15px] leading-relaxed text-slate">
        {children}
      </div>
    </section>
  );
}

export default function Legal({
  title,
  updated,
  intro,
  children,
}: {
  title: string;
  updated: string;
  intro?: string;
  children: React.ReactNode;
}) {
  return (
    <main className="mx-auto max-w-[760px] px-5 py-20">
      <p className="hero-in font-mono text-xs uppercase tracking-[0.2em] text-slate">
        Kivlo
      </p>
      <h1
        className="hero-in mt-3 font-heading text-4xl font-extrabold text-ink"
        style={{ ["--hero-delay" as string]: "60ms" }}
      >
        {title}
      </h1>
      <p
        className="hero-in mt-2 text-sm text-slate"
        style={{ ["--hero-delay" as string]: "120ms" }}
      >
        Last updated {updated}
      </p>
      {intro && <p className="mt-6 text-[15px] leading-relaxed text-slate">{intro}</p>}
      {children}
      <p className="mt-14 border-t border-border pt-6 text-sm text-slate">
        Questions? Email{" "}
        <a
          href="mailto:legal@kivlo.com"
          className="font-semibold text-lime-deep underline-offset-4 hover:underline"
        >
          legal@kivlo.com
        </a>{" "}
        or{" "}
        <Link
          href="/"
          className="font-semibold text-lime-deep underline-offset-4 hover:underline"
        >
          head back home
        </Link>
        .
      </p>
    </main>
  );
}
