/* ==========================================================================
   LANG SWITCH — bare mono text button (the Skip button's design, no pulse).
   Sits top-left — the opposite corner of the navbar — on / and /universe.
   EN | FR, active side lit; the choice persists via the language store.
   ========================================================================== */

import { getLang, setLang, useLang } from "@/lib/lang";

export function LangSwitch({
  reload = false,
  /* extra horizontal inset — the film page slides it further in */
  extraInset = false,
}: {
  reload?: boolean;
  extraInset?: boolean;
}) {
  const lang = useLang();

  const item =
    "pointer-events-auto cursor-pointer font-mono text-[13px] uppercase tracking-[0.24em] transition-colors duration-300";

  const pick = (l: "en" | "fr") => {
    if (l === getLang()) return;
    setLang(l);
    /* On the film page a live re-render would fight the engine's split-text
       animations — a clean reload replays the film in the new language. */
    if (reload) {
      try {
        window.location.reload();
      } catch {
        /* noop */
      }
    }
  };

  /* Film-engine click feedback: the custom cursor's ring blooms warm while
     held (body.cursor-held — CSS lives in the film stylesheet). Harmless on
     pages without the custom cursor. */
  const flashCursor = () => {
    try {
      document.body.classList.add("cursor-held");
      window.setTimeout(() => document.body.classList.remove("cursor-held"), 350);
    } catch {
      /* noop */
    }
  };

  /* Active language wears the page accent: the film's live rail color on /,
     the violet brand accent on /universe. Inactive sits dim; hover → white. */
  const activeStyle = { color: "var(--rail-color, #a78bfa)" } as const;

  return (
    /* On the film page (extraInset) the switch anchors to the film's own
       design gutter (--gutter: clamp(1.4rem,5vw,6rem) in lwh style.css) and
       sits a touch below the frame edge — so it reads as part of the film's
       fixed UI, not something stuck in the corner. */
    <div
      className="lang-switch pointer-events-none fixed left-0 top-0 z-[120]"
      style={
        extraInset
          ? { paddingLeft: "clamp(1.4rem, 5vw, 6rem)", paddingTop: "clamp(2.2rem, 4.5vh, 3rem)" }
          : { paddingLeft: "clamp(2.6rem, 5vw, 3.6rem)", paddingTop: "1rem" }
      }
    >
      <div className="flex items-center gap-2.5 font-mono text-[13px] uppercase tracking-[0.24em]">
        <button
          type="button"
          lang="en"
          aria-pressed={lang === "en"}
          onPointerDown={flashCursor}
          onClick={() => pick("en")}
          className={`${item} ${lang === "en" ? "" : "text-white/40 hover:text-white/90"}`}
          style={lang === "en" ? activeStyle : undefined}
        >
          EN
        </button>
        <span aria-hidden className="h-3 w-px bg-white/25" />
        <button
          type="button"
          lang="fr"
          aria-pressed={lang === "fr"}
          onPointerDown={flashCursor}
          onClick={() => pick("fr")}
          className={`${item} ${lang === "fr" ? "" : "text-white/40 hover:text-white/90"}`}
          style={lang === "fr" ? activeStyle : undefined}
        >
          FR
        </button>
      </div>
    </div>
  );
}

export { getLang };
