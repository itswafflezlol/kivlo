"use client";

import { useEffect } from "react";
import { useTheme } from "@/lib/theme";

// Applies the persisted theme on mount, keeps it synced with the OS while
// subscribed, and strips .dark when leaving the app shell (marketing is always light).
export default function ThemeSync() {
  useTheme();
  useEffect(
    () => () => {
      document.documentElement.classList.remove("dark");
    },
    [],
  );
  return null;
}
