"use client";

import { useSyncExternalStore } from "react";

export type Theme = "light" | "dark" | "system";

const KEY = "kivlo.theme";
const APP_PATH = /(?:^|\/)(app|admin)(?=\/|$)/;

let current: Theme = "system";
const subs = new Set<() => void>();
let media: MediaQueryList | null = null;

function read(): Theme {
  try {
    const v = localStorage.getItem(KEY);
    return v === "light" || v === "dark" || v === "system" ? v : "system";
  } catch {
    return "system";
  }
}

export function applyTheme() {
  const dark =
    current === "dark" ||
    (current === "system" &&
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches);
  const onApp = APP_PATH.test(window.location.pathname);
  document.documentElement.classList.toggle("dark", dark && onApp);
}

const onMedia = () => applyTheme();
const onStorage = (e: StorageEvent) => {
  if (e.key === KEY) {
    current = read();
    applyTheme();
    subs.forEach((f) => f());
  }
};

function subscribe(cb: () => void) {
  if (subs.size === 0) {
    current = read();
    applyTheme();
    media = window.matchMedia("(prefers-color-scheme: dark)");
    media.addEventListener("change", onMedia);
    window.addEventListener("storage", onStorage);
  }
  subs.add(cb);
  return () => {
    subs.delete(cb);
    if (subs.size === 0) {
      media?.removeEventListener("change", onMedia);
      media = null;
      window.removeEventListener("storage", onStorage);
    }
  };
}

export function setTheme(t: Theme) {
  current = t;
  try {
    localStorage.setItem(KEY, t);
  } catch {
    /* private mode */
  }
  applyTheme();
  subs.forEach((f) => f());
}

export function useTheme(): [Theme, (t: Theme) => void] {
  const t = useSyncExternalStore(
    subscribe,
    () => current,
    () => "system" as Theme,
  );
  return [t, setTheme];
}
