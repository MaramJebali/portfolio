import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef } from "react";

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

function Index() {
  const navigate = useNavigate();
  const rootRef = useRef<HTMLDivElement>(null);

  /* Inject the story stylesheet for this route only; mount the film; tear
     everything down (WebGL loop, triggers, listeners, Lenis hooks) on exit. */
  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "/long-way-home/style.css?v=7";
    document.head.appendChild(link);

    let dispose: (() => void) | undefined;
    let cancelled = false;

    import("@/longwayhome/lwh-main").then((m) => {
      if (cancelled || !rootRef.current) return;
      dispose = m.mountLWH(rootRef.current, {
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
      dispose?.();
      link.remove();
    };
  }, [navigate]);

  return (
    <div ref={rootRef} className="lwh-root">
      {/* =========== PRELOADER =========== */}
      <div className="preloader" id="preloader" aria-hidden="true">
        <div className="preloader__inner">
          <div className="preloader__label" data-pl-label>
            BEFORE EVERY DISCOVERY...
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
              Before every discovery, there is a little wonder.
            </h1>
            <p className="sub" data-reveal="up">
              A question. A possibility. A mind that refuses to stop wondering
              what lies beyond what we already know.
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
              I followed curiosity into the unknown.
            </h2>
            <p className="sub" data-reveal="up">
              Through the worlds of Artificial Intelligence and Data Science, I
              discovered endless ways to explore ideas, challenge assumptions,
              and turn complex questions into possibilities.
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
              And slowly, scattered ideas became constellations.
            </h2>
            <p className="sub" data-reveal="up">
              Algorithms became experiments. Experiments became projects.
              Somewhere between imagination and engineering, I began crafting
              intelligent systems — one idea at a time.
            </p>
          </div>
          {/* EXPERIMENT (narrative v2): standalone drifting line, positioned
              midway (in scroll distance) between movement III and IV. */}
          <p className="drift drift--between" data-reveal="fade">
            From a curious thought to something real.
            <br />
            Every project adds another star.
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
              But the universe was never meant to end here.
            </h2>
            <p className="sub sub--italic" data-reveal="up">
              There are still worlds to discover, boundaries to challenge, and
              intelligent solutions to build. Especially where technology meets
              the possibility of a more sustainable future.
            </p>
            <p className="finale__hint" data-reveal="up">
              THE STORY IS ONLY BEGINNING.
            </p>
            <p className="dive-cue" data-reveal="up">
              scroll down to meet the mind behind the universe&nbsp;&nbsp;↓
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}