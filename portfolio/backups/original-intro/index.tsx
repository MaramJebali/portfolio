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
      { title: "The Long Way Home — Maram" },
      {
        name: "description",
        content:
          "An interactive film in four movements: a goodbye told as a journey out past the planets, into the nebula — then dive into the universe.",
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
    link.href = "/long-way-home/style.css";
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
            FINDING THE WAY OUT
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
        <div className="preloader__title" data-pl-title>
          THE&nbsp;LONG&nbsp;WAY&nbsp;HOME
        </div>
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
      <div className="telemetry" id="telemetry" aria-hidden="true">
        <span className="telemetry__dot"></span>
        <span id="telemetryText">LAT 40.71° · LON −74.01° · ALT 0 KM</span>
      </div>
      <div className="scrollcue" id="scrollcue" aria-hidden="true">
        <span className="scrollcue__word">SCROLL</span>
        <span className="scrollcue__line"></span>
      </div>

      {/* =========== THE SIX MOVEMENTS =========== */}
      <main className="content" id="content">
        {/* BEAT 0 — THE LAST EVENING */}
        <section
          className="beat beat--center"
          data-beat="0"
          data-rail="#FFB36B"
          data-alt="LAT 40.71° · LON −74.01° · ALT 0 KM"
        >
          <div className="beat__inner">
            <p className="eyebrow" data-reveal="up">
              i — the last evening
            </p>
            <h1 className="headline headline--hero" data-split="chars">
              You said you'd wait up.
            </h1>
            <p className="sub" data-reveal="up">
              So I left the porch light on, and started the long way home.
            </p>
          </div>
        </section>

        {/* BEAT 1 — LEAVING THE BLUE */}
        <section
          className="beat beat--center"
          data-beat="1"
          data-rail="#8FB8E0"
          data-alt="ALT 1 200 KM · LEAVING THE THERMOSPHERE"
        >
          <div className="beat__inner">
            <p className="eyebrow" data-reveal="up">
              ii — leaving the blue
            </p>
            <h2 className="headline" data-split="words">
              Everything gets quiet up here.
            </h2>
            <p className="sub" data-reveal="up">
              The noise you make to fill a room doesn't reach this high.
            </p>
          </div>
        </section>

        {/* BEAT 2 — PAST WHOLE WORLDS */}
        <section
          className="beat beat--tall beat--center"
          data-beat="2"
          data-rail="#9FB4C4"
          data-alt="RANGE 4.1 AU · PASSING THE OUTER WORLDS"
        >
          <div className="beat__inner">
            <p className="eyebrow" data-reveal="up">
              iii — past whole worlds
            </p>
            <h2 className="headline" data-split="words">
              I passed whole worlds without stopping.
            </h2>
            <p className="sub" data-reveal="up">
              None of them were where you were.
            </p>
          </div>
          <p className="drift" data-reveal="fade">
            Notice how long the nothing lasts.
            <br />
            This is the part the films cut.
          </p>
        </section>

        {/* BEAT 3 — THE NEBULA / THE DIVE */}
        <section
          className="beat beat--center"
          data-beat="3"
          data-rail="#C68BFF"
          data-alt="RANGE 1 340 LY · ENTERING THE CLOUD"
        >
          <div className="beat__inner">
            <p className="eyebrow" data-reveal="up">
              iv — all of it, at once
            </p>
            <h2 className="headline headline--bloom" data-split="words">
              And then — all of it, at once.
            </h2>
            <p className="sub sub--italic" data-reveal="up">
              Every colour I ever wanted to show you. I kept thinking: you would
              have loved this.
            </p>
            <p className="dive-cue" data-reveal="up">
              scroll down to dive into my universe&nbsp;&nbsp;↓
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}
