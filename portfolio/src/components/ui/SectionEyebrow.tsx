import { useLayoutEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { cn } from "@/lib/utils";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

interface SectionEyebrowProps {
  /** Optional label. If omitted, only the animated rule renders. */
  label?: string;
  className?: string;
}

export function SectionEyebrow({ label, className }: SectionEyebrowProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);
  const ruleRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: root,
          start: "top 88%",
          once: true,
        },
      });

      if (textRef.current) {
        tl.fromTo(
          textRef.current,
          { y: 8, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.5, ease: "power3.out" },
        );
      }

      tl.fromTo(
        ruleRef.current,
        { scaleX: 0, transformOrigin: "left center" },
        { scaleX: 1, duration: 1.05, ease: "power3.inOut" },
        textRef.current ? "-=0.25" : "0",
      );
    }, root);

    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={rootRef}
      className={cn("flex w-full items-center gap-4", className)}
    >
      {label && (
        <span
          ref={textRef}
          className="font-mono text-[0.7rem] uppercase tracking-[0.35em] text-magic-gold/75"
        >
          {label}
        </span>
      )}
      <div
        ref={ruleRef}
        className={cn(
          "h-px flex-1 bg-gradient-to-r from-magic-mint/60 via-magic-gold/40 to-transparent",
          !label && "from-transparent via-white/15 to-transparent",
        )}
      />
    </div>
  );
}