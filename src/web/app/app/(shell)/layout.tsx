"use client";

import { Suspense } from "react";
import Shell from "@/components/app/Shell";
import ThemeSync from "@/components/app/ThemeSync";
import { PageFade } from "@/components/app/PageFade";

export default function ShellLayout({ children }: { children: React.ReactNode }) {
  return <Suspense><Shell><PageFade>{children}</PageFade></Shell><ThemeSync /></Suspense>;
}
