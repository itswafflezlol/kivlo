"use client";

import { useSyncExternalStore } from "react";

export type Session = {
  name: string;
  email: string;
  picture?: string;
  provider: "google" | "apple" | "email";
};

const KEY = "kivlo.session";
let cached: Session | null = null;
let loaded = false;

export function getSession(): Session | null {
  if (loaded) return cached;
  loaded = true;
  try {
    cached = JSON.parse(localStorage.getItem(KEY) ?? "null");
  } catch {
    cached = null;
  }
  return cached;
}

export function setSession(s: Session) {
  cached = s;
  localStorage.setItem(KEY, JSON.stringify(s));
  window.dispatchEvent(new Event("kivlo:session"));
}

export function clearSession() {
  cached = null;
  localStorage.removeItem(KEY);
  window.dispatchEvent(new Event("kivlo:session"));
}

const subscribe = (cb: () => void) => {
  const onStorage = () => {
    loaded = false;
    cb();
  };
  window.addEventListener("kivlo:session", cb);
  window.addEventListener("storage", onStorage);
  return () => {
    window.removeEventListener("kivlo:session", cb);
    window.removeEventListener("storage", onStorage);
  };
};

export function useSession(): Session | null {
  return useSyncExternalStore(subscribe, getSession, () => null);
}
