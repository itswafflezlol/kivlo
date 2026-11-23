"use client";

import { useRef } from "react";
import { useInViewPlay, useWarmLoad } from "./hooks";

export default function InViewVideo({
  src,
  poster,
  className,
  label,
}: {
  src: string;
  poster: string;
  className?: string;
  label: string;
}) {
  const ref = useRef<HTMLVideoElement>(null);
  useWarmLoad(ref, "100% 0px");
  useInViewPlay(ref);
  return (
    <video
      ref={ref}
      src={src}
      poster={poster}
      muted
      loop
      playsInline
      preload="none"
      aria-label={label}
      className={className}
    />
  );
}
