"use client";

import { Suspense } from "react";
import Shell from "@/components/app/Shell";

export default function ShellLayout({ children }: { children: React.ReactNode }) {
  return <Suspense><Shell>{children}</Shell></Suspense>;
}
