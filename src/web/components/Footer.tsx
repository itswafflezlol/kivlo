import Image from "next/image";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto flex max-w-[1200px] flex-col items-start justify-between gap-6 px-5 py-10 sm:flex-row sm:items-center">
        <span className="flex items-center gap-2 font-[family-name:var(--font-bricolage)] text-xl font-extrabold tracking-tight">
          <Image src="/kivlo-mark.png" alt="" width={26} height={27} />
          kivlo
        </span>
        <nav aria-label="Footer">
          <ul className="flex flex-wrap items-center gap-6 text-sm text-slate">
            <li>
              <Link href="/pricing" className="transition-colors duration-150 ease-out hover:text-ink">
                Pricing
              </Link>
            </li>
            <li>
              <Link href="/terms" className="transition-colors duration-150 ease-out hover:text-ink">
                Terms
              </Link>
            </li>
            <li>
              <Link href="/privacy" className="transition-colors duration-150 ease-out hover:text-ink">
                Privacy
              </Link>
            </li>
            <li>
              <Link href="/dmca" className="transition-colors duration-150 ease-out hover:text-ink">
                DMCA
              </Link>
            </li>
          </ul>
        </nav>
        <p className="text-sm text-slate">© 2026 Kivlo</p>
      </div>
    </footer>
  );
}
