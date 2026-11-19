/* ==========================================================================
   LANGUAGE STORE — tiny pub/sub + localStorage persistence.
   "portfolio-lang" survives reloads, so the chosen language stays fixed
   across / and /universe. No provider needed; useSyncExternalStore wires it.
   ========================================================================== */

import { useSyncExternalStore } from "react";

export type Lang = "en" | "fr";

const KEY = "portfolio-lang";
let current: Lang = readInitial();
const listeners = new Set<() => void>();

function readInitial(): Lang {
  if (typeof window === "undefined") return "en";
  try {
    const v = localStorage.getItem(KEY);
    return v === "fr" ? "fr" : "en";
  } catch {
    return "en";
  }
}

export function getLang(): Lang {
  return current;
}

export function setLang(lang: Lang) {
  if (lang === current) return;
  current = lang;
  try {
    localStorage.setItem(KEY, lang);
  } catch {
    /* private mode — session-only */
  }
  listeners.forEach((l) => l());
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

export function useLang(): Lang {
  return useSyncExternalStore(subscribe, getLang, () => "en" as Lang);
}
