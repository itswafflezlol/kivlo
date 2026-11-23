import Link from "next/link";

export function ArrowCircle({ invert }: { invert?: boolean }) {
  return (
    <span
      aria-hidden="true"
      className={`flex h-6 w-6 items-center justify-center rounded-full transition-transform duration-200 ease-out group-hover:-translate-y-0.5 group-hover:translate-x-0.5 ${
        invert ? "bg-lime text-ink" : "bg-ink text-white"
      }`}
    >
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
        <path
          d="M2.5 9.5L9.5 2.5M9.5 2.5H4M9.5 2.5V8"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}

export default function ArrowPill({
  href,
  children,
  variant = "lime",
  className = "",
}: {
  href: string;
  children: React.ReactNode;
  variant?: "lime" | "ink";
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={`group inline-flex items-center gap-2.5 rounded-full py-2 pl-6 pr-2 text-sm font-semibold transition-colors duration-200 ease-out ${
        variant === "lime"
          ? "bg-lime text-ink hover:bg-lime-hover"
          : "bg-ink text-white hover:bg-graphite"
      } ${className}`}
    >
      {children}
      <ArrowCircle invert={variant === "ink"} />
    </Link>
  );
}
