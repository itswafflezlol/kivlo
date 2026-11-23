"use client";

import { useEffect } from "react";

export function useReducedMotion() {
  // founder decision: animations always run, OS reduced-motion setting is ignored
  return false;
}

/** Plays the video only while in view. */
export function useInViewPlay(
  ref: React.RefObject<HTMLVideoElement | null>
) {
  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) v.play().catch(() => {});
        else v.pause();
      },
      { threshold: 0.5 }
    );
    io.observe(v);
    return () => io.disconnect();
  }, [ref]);
}

/** Starts fetching (preload=metadata + load()) once the video is within ~1 viewport. */
export function useWarmLoad(
  ref: React.RefObject<HTMLVideoElement | null>,
  rootMargin = "100% 0px"
) {
  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          v.preload = "metadata";
          v.load();
          io.disconnect();
        }
      },
      { rootMargin }
    );
    io.observe(v);
    return () => io.disconnect();
  }, [ref, rootMargin]);
}
