import { useEffect, useRef } from "react";

export function useHorizontalWheel<T extends HTMLElement>() {
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Prevent vertical scrolling and map it to horizontal
    const handleWheel = (e: WheelEvent) => {
      // If the user is scrolling vertically, prevent default and scroll horizontally instead
      if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
        e.preventDefault();
        el.scrollLeft += e.deltaY * 1.5; // 1.5 is the scroll multiplier
      }
    };

    // Add listener with passive: false to allow preventDefault
    el.addEventListener("wheel", handleWheel, { passive: false });
    return () => el.removeEventListener("wheel", handleWheel);
  }, []);

  return ref;
}