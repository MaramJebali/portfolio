import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";

gsap.registerPlugin(ScrollTrigger, SplitText);

export function useTextReveal<T extends HTMLElement = HTMLElement>({
  type = "words",
  stagger = 0.03,
  duration = 0.8,
} = {}) {
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      gsap.set(el, { opacity: 1 });
      return;
    }

    gsap.set(el, { opacity: 1 });

    const split = new SplitText(el, {
      type: "chars,words,lines",
      linesClass: "split-line",
      wordsClass: "split-word",
      charsClass: "split-char",
    });

    const targets = type === "words" ? split.words : type === "lines" ? split.lines : split.chars;

    // STRICTLY LEFT TO RIGHT (x: 80 -> 0)
    gsap.set(targets, { x: 80, opacity: 0, display: "inline-block" });

    const tween = gsap.to(targets, {
      x: 0,
      opacity: 1,
      duration,
      stagger,
      ease: "power3.out",
      scrollTrigger: {
        trigger: el,
        start: "top 90%",
        once: true,
      },
    });

    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
      if (split.isSplit) split.revert();
    };
  }, [type, stagger, duration]);

  return ref
}