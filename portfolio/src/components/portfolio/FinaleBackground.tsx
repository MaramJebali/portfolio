// src/components/portfolio/FinaleBackground.tsx
// The living background of the universe page: the ending frame of
// "The Long Way Home" film (the lone warm star, faint trail arc and
// whisper of nebula), rendered by the same SpaceScene the story uses —
// parked at the final keyframe and animating in place.
import { useEffect, useRef } from "react";

export function FinaleBackground() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let dispose: (() => void) | undefined;
    let cancelled = false;

    /* Arriving from the film: reset the journey's scroll (the landing was
       scrolled to the nebula) so the scroll-driven drift starts at zero. */
    (window as any).__lenis?.scrollTo(0, { immediate: true });
    window.scrollTo(0, 0);

    import("@/longwayhome/lwh-main").then((m) => {
      if (cancelled || !container) return;
      dispose = m.mountFinaleBackground(container);
    });

    return () => {
      cancelled = true;
      dispose?.();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 h-full w-full"
      style={{ pointerEvents: "none" }}
      aria-hidden="true"
    />
  );
}
