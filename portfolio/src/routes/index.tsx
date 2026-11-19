import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef } from "react";
import { LangSwitch } from "@/components/ui/LangSwitch";
import { useLang, type Lang } from "@/lib/lang";

/* Film copy — EN / FR side by side so the language switch can swap live. */
const FILM_COPY = {
  en: {
    beats: [
      {
        h: "Before every discovery, there is a little wonder.",
        p: "A question. A possibility. A mind that refuses to stop wondering what lies beyond what we already know.",
      },
      {
        h: "I followed curiosity into the unknown.",
        p: "Through the worlds of Artificial Intelligence and Data Science, I discovered endless ways to explore ideas, challenge assumptions, and turn complex questions into possibilities.",
      },
      {
        h: "And slowly, scattered ideas became constellations.",
        p: "Algorithms became experiments. Experiments became projects. Somewhere between imagination and engineering, I began crafting intelligent systems — one idea at a time.",
      },
      {
        h: "But the universe was never meant to end here.",
        p: "There are still worlds to discover, boundaries to challenge, and intelligent solutions to build. Especially where technology meets the possibility of a more sustainable future.",
      },
    ],
    drift: ["From a curious thought to something real.", "Every project adds another star."],
    hint: "THE STORY IS ONLY BEGINNING.",
    cue: "scroll down to meet the mind behind the universe\u00A0\u00A0↓",
    preloader: "BEFORE EVERY DISCOVERY...",
  },
  fr: {
    beats: [
      {
        h: "Avant chaque découverte, il y a un peu d'émerveillement.",
        p: "Une question. Une possibilité. Un esprit qui refuse d'arrêter de se demander ce qui se trouve au-delà de ce que nous savons déjà.",
      },
      {
        h: "J'ai suivi ma curiosité vers l'inconnu.",
        p: "À travers les mondes de l'intelligence artificielle et de la science des données, j'ai découvert d'innombrables façons d'explorer des idées, de remettre en question les certitudes et de transformer des questions complexes en possibilités.",
      },
      {
        h: "Et lentement, des idées éparses sont devenues des constellations.",
        p: "Les algorithmes sont devenus des expériences. Les expériences sont devenues des projets. Quelque part entre l'imagination et l'ingénierie, j'ai commencé à créer des systèmes intelligents — une idée à la fois.",
      },
      {
        h: "Mais l'univers n'était pas fait pour s'arrêter ici.",
        p: "Il reste des mondes à explorer, des limites à repousser et des solutions intelligentes à construire. Là où la technologie rencontre la promesse d'un avenir plus durable.",
      },
    ],
    drift: ["D'une pensée curieuse à quelque chose de réel.", "Chaque projet ajoute une étoile."],
    hint: "L'HISTOIRE NE FAIT QUE COMMENCER.",
    cue: "faites défiler pour rencontrer l'esprit derrière l'univers\u00A0\u00A0↓",
    preloader: "AVANT CHAQUE DÉCOUVERTE...",
  },
} as const;

/* ==========================================================================
   THE LONG WAY HOME — the full interactive film, ported into the portfolio.
   Markup below mirrors the story's index.html 1:1 (preloader, cursor, WebGL
   canvas, grain/vignette, rail/telemetry/scroll-cue, movements i–iv).
   `lwh-main.js` is a verbatim port of the story's main.js with a mount/cleanup
   API; the stylesheet is injected for this route only and removed on exit.
   Departure: the film now ends on the nebula (movement iv) with a dive
   invitation — reaching it crosses over into /universe, whose living
   background is the film's own ending frame (see mountFinaleBackground).
   ========================================================================== */

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      /* EXPERIMENTAL NARRATIVE — original copy lives in backups/original-intro/ */
      { title: "A Universe of Possibilities — Maram" },
      {
        name: "description",
        content:
          "An interactive film in four movements: exploring Artificial Intelligence, Data Science, engineering and sustainability — then meet the mind behind the universe.",
      },
      { name: "theme-color", content: "#04050A" },
    ],
    links: [{ rel: "canonical", href: "/" }],
  }),
  component: Index,
});

/* ---------- Skip pill — the navbar's glass capsule, tuned for the film:
   parked bottom-right (clear of the full-height scroll rail on the right),
   always reachable above the preloader, rests quiet and wakes on hover. */
function SkipPill({ onSkip }: { onSkip: () => void }) {
  /* Film-engine click feedback — the custom cursor's ring blooms warm while
     the button is held (body.cursor-held). */
  const flashCursor = () => {
    try {
      document.body.classList.add("cursor-held");
      window.setTimeout(() => document.body.classList.remove("cursor-held"), 350);
    } catch {
      /* noop */
    }
  };

  return (
    <div
      className="pointer-events-none fixed bottom-0 z-[120] flex justify-end pr-5 sm:pr-7"
      style={{ bottom: "clamp(2.75rem, 6vh, 4rem)", right: "clamp(2.6rem, 4.5vw, 3.4rem)" }}
    >
      <button
        type="button"
        onPointerDown={flashCursor}
        onClick={onSkip}
        aria-label="Skip the film and enter the universe"
        className="skip-pill pointer-events-auto flex cursor-pointer items-center gap-2.5 font-mono text-sm uppercase tracking-[0.24em] text-foreground transition-colors duration-300 hover:text-[color:var(--rail-color,#FFB36B)]"
      >
        <span className="text-sm uppercase tracking-[0.24em]">Skip</span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
          className="h-[1.15rem] w-[1.15rem]"
          aria-hidden
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12l-7.5 7.5M21 12H3" />
        </svg>
      </button>
    </div>
  );
}

function Index() {
  /* The film is keyed by language: switching EN/FR cleanly disposes the
     engine (WebGL, triggers, split-text DOM) and remounts it with the new
     copy — a soft in-app remount, NOT a page reload. */
  const lang = useLang();
  return <FilmRoot key={lang} lang={lang} />;
}

/* Scroll handoff between language remounts: the unmounting film saves its
   scroll position; the fresh mount picks it up if the swap was immediate. */
let lwhResumeY: number | null = null;
let lwhResumeTs = 0;

function FilmRoot({ lang }: { lang: Lang }) {
  const navigate = useNavigate();
  const rootRef = useRef<HTMLDivElement>(null);
  const copy = FILM_COPY[lang];

  /* Inject the story stylesheet for this route only; mount the film; tear
     everything down (WebGL loop, triggers, listeners, Lenis hooks) on exit. */
  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "/long-way-home/style.css?v=7";
    document.head.appendChild(link);

    /* Language switch remount: resume at the exact scroll position, skipping
       the preloader, so the film translates in place. */
    const resumeY =
      lwhResumeY !== null && Date.now() - lwhResumeTs < 1500 ? lwhResumeY : null;
    lwhResumeY = null;

    let dispose: (() => void) | undefined;
    let cancelled = false;

    import("@/longwayhome/lwh-main").then((m) => {
      if (cancelled || !rootRef.current) return;
      dispose = m.mountLWH(rootRef.current, {
        resumeY,
        onExitUniverse: () => {
          /* Tell the universe page the film handed over here — it should
             open straight onto the About section. */
          try {
            sessionStorage.setItem("lwh-arrival", "about");
          } catch {
            /* noop */
          }
          navigate({ to: "/universe" });
        },
      });
    });

    return () => {
      cancelled = true;
      /* Save the position so an immediate remount (language switch) resumes
         instead of replaying the preloader. */
      try {
        lwhResumeY = window.scrollY;
        lwhResumeTs = Date.now();
      } catch {
        /* noop */
      }
      dispose?.();
      link.remove();
    };
  }, [navigate]);

  return (
    <div ref={rootRef} className="lwh-root">
      {/* =========== SKIP PILL — navbar glass language, but tuned for the film:
          appears after the preloader, rests quiet (dimmed, glow pulled back)
          so it never competes with the opening shot, and wakes up on hover. */}
      <SkipPill onSkip={() => {
        try {
          sessionStorage.setItem("lwh-arrival", "about");
        } catch {
          /* noop */
        }
        navigate({ to: "/universe" });
      }} />

      {/* =========== LANGUAGE SWITCH — top-left, opposite the navbar =========== */}
      <LangSwitch extraInset />

      {/* =========== PRELOADER =========== */}
      <div className="preloader" id="preloader" aria-hidden="true">
        <div className="preloader__inner">
          <div className="preloader__label" data-pl-label>
            {copy.preloader}
          </div>
          <div className="preloader__count">
            <span className="preloader__num" id="plNum">
              0
            </span>
            <span className="preloader__pct">%</span>
          </div>
          <div className="preloader__track">
            <span className="preloader__fill" id="plFill"></span>
          </div>
        </div>
        {/* Engine animates [data-pl-title] unguarded in reveal(), so the node
            stays but is intentionally empty — no visible title text. */}
        <div className="preloader__title" data-pl-title></div>
      </div>

      {/* =========== CUSTOM CURSOR =========== */}
      <div className="cursor" id="cursor" aria-hidden="true">
        <span className="cursor__dot"></span>
        <span className="cursor__ring"></span>
      </div>

      {/* =========== WEBGL + ATMOSPHERE =========== */}
      <canvas id="webgl" className="webgl" aria-hidden="true"></canvas>
      <div className="webgl-fallback" id="webglFallback" aria-hidden="true"></div>
      <div className="grain" aria-hidden="true"></div>
      <div className="vignette" aria-hidden="true"></div>

      {/* =========== FIXED UI =========== */}
      <div className="rail" aria-hidden="true">
        <span className="rail__fill" id="railFill"></span>
      </div>
      {/* Telemetry + scroll cue intentionally removed (experiment):
          the engine null-guards #telemetryText and never uses #scrollcue. */}

      {/* =========== THE SIX MOVEMENTS =========== */}
      <main className="content" id="content">
        {/* BEAT 0 — THE ORIGIN */}
        <section
          className="beat beat--center"
          data-beat="0"
          data-rail="#FFB36B"
          data-alt="ORIGIN: CURIOSITY · STATUS: EXPLORING"
        >
          <div className="beat__inner">
            <h1 className="headline headline--hero" data-split="chars">
              {copy.beats[0].h}
            </h1>
            <p className="sub" data-reveal="up">
              {copy.beats[0].p}
            </p>
          </div>
        </section>

        {/* BEAT 1 — THE EXPLORATION */}
        <section
          className="beat beat--center"
          data-beat="1"
          data-rail="#8FB8E0"
          data-alt="ALT 1 200 KM · ENTERING THE UNKNOWN"
        >
          <div className="beat__inner">
            <h2 className="headline" data-split="words">
              {copy.beats[1].h}
            </h2>
            <p className="sub" data-reveal="up">
              {copy.beats[1].p}
            </p>
          </div>
        </section>

        {/* BEAT 2 — THE MAKING */}
        <section
          className="beat beat--tall beat--center"
          data-beat="2"
          data-rail="#9FB4C4"
          data-alt="RANGE 4.1 AU · EXPLORING NEW DIMENSIONS"
        >
          <div className="beat__inner">
            <h2 className="headline" data-split="words">
              {copy.beats[2].h}
            </h2>
            <p className="sub" data-reveal="up">
              {copy.beats[2].p}
            </p>
          </div>
          {/* EXPERIMENT (narrative v2): standalone drifting line, positioned
              midway (in scroll distance) between movement III and IV. */}
          <p className="drift drift--between" data-reveal="fade">
            {copy.drift[0]}
            <br />
            {copy.drift[1]}
          </p>
        </section>

        {/* BEAT 3 — THE INFINITE / THE DIVE */}
        <section
          className="beat beat--center"
          data-beat="3"
          data-rail="#C68BFF"
          data-alt="DESTINATION: UNDEFINED · POSSIBILITIES: INFINITE"
        >
          <div className="beat__inner">
            <h2 className="headline headline--bloom" data-split="words">
              {copy.beats[3].h}
            </h2>
            <p className="sub sub--italic" data-reveal="up">
              {copy.beats[3].p}
            </p>
            <p className="finale__hint" data-reveal="up">
              {copy.hint}
            </p>
            <p className="dive-cue" data-reveal="up">
              {copy.cue}
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}