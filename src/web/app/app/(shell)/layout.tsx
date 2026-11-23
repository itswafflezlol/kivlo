"use client";

import { Suspense } from "react";
import Shell from "@/components/app/Shell";
import ThemeSync from "@/components/app/ThemeSync";

export default function ShellLayout({ children }: { children: React.ReactNode }) {
  return <Suspense><Shell>{children}</Shell><ThemeSync /></Suspense>;
}
