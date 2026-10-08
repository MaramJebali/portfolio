import { useLayoutEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { experiences } from "@/data/portfolio";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export function ExperienceSection() {
  const containerRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const root = containerRef.current;
    if (!root) return;

    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (prefersReduced) return;

    const ctx = gsap.context(() => {
      // Header reveal
      gsap.from("[data-exp-header]", {
        y: 30,
        opacity: 0,
        filter: "blur(12px)",
        duration: 1,
        stagger: 0.08,
        ease: "power3.out",
        scrollTrigger: {
          trigger: root,
          start: "top 82%",
          once: true,
        },
      });

      // Rule draws in from left
      gsap.from("[data-exp-line]", {
        scaleX: 0,
        transformOrigin: "left center",
        duration: 1.3,
        ease: "expo.out",
        scrollTrigger: {
          trigger: root,
          start: "top 75%",
          once: true,
        },
      });

      // Row stagger
      gsap.from("[data-exp-row]", {
        y: 32,
        opacity: 0,
        filter: "blur(10px)",
        duration: 0.9,
        stagger: 0.1,
        ease: "power2.out",
        scrollTrigger: {
          trigger: "[data-exp-list]",
          start: "top 82%",
          once: true,
        },
      });
    }, root);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={containerRef}
      id="experience"
      className="relative px-5 py-24 sm:px-8 sm:py-28"
    >
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-14">
          <h3
            data-exp-header
            className="font-display text-3xl text-white sm:text-4xl select-none"
            style={{
              textShadow:
                "0 0 20px rgba(255,255,255,0.1), 0 0 40px rgba(255,255,255,0.05)",
            }}
          >
            Career <span className="italic text-white/60">Trajectory.</span>
          </h3>
          <p
            data-exp-header
            className="mt-4 max-w-2xl text-[0.9rem] leading-[1.75] text-magic-parchment/55"
          >
            Where I've been building, learning and shipping — internships,
            mentorship and everything in between.
          </p>
        </div>

        {/* Timeline list */}
        <div data-exp-list className="flex flex-col">
          {/* Top rule */}
          <div
            data-exp-line
            className="h-px w-full bg-gradient-to-r from-magic-mint/40 via-magic-gold/30 to-transparent"
          />

          {experiences.map((exp, i) => (
            <div key={`${exp.company}-${i}`} data-exp-row className="group">
              <div className="grid grid-cols-1 md:grid-cols-12 items-start gap-6 md:gap-10 py-10 md:py-12 px-4 -mx-4 rounded-2xl transition-colors duration-500 hover:bg-white/[0.015]">
                {/* Logo + period */}
                <div className="md:col-span-3 flex items-center gap-4">
                  <div className="relative shrink-0">
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-magic-mint/25 via-magic-gold/15 to-magic-rose/25 blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <div className="relative flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-white/[0.05] backdrop-blur-md md:h-16 md:w-16">
                      <img
                        src={exp.logo}
                        alt={`${exp.company} logo`}
                        className="h-8 w-8 object-contain md:h-9 md:w-9"
                        loading="lazy"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <span className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-magic-parchment/50 transition-colors duration-300 group-hover:text-magic-parchment/80">
                      {exp.period}
                    </span>
                    {exp.current && (
                      <span className="flex items-center gap-1.5 font-mono text-[0.6rem] uppercase tracking-[0.2em] text-magic-mint/85">
                        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-magic-mint shadow-[0_0_8px_var(--magic-mint)]" />
                        Now
                      </span>
                    )}
                  </div>
                </div>

                {/* Role + company */}
                <div className="md:col-span-4">
                  <h4 className="text-xl font-bold tracking-tight md:text-2xl">
                    <span className="magic-text">{exp.role}</span>
                  </h4>
                  <p className="mt-1.5 font-display text-lg italic text-magic-parchment/50 transition-colors duration-300 group-hover:text-magic-parchment/75 md:text-xl">
                    {exp.company}
                  </p>
                  {exp.location && (
                    <p className="mt-2 font-mono text-[0.6rem] uppercase tracking-[0.2em] text-magic-parchment/35">
                      {exp.location}
                    </p>
                  )}
                </div>

                {/* Description + bullets + tech */}
                <div className="md:col-span-5">
                  <p className="text-[0.9rem] leading-[1.75] text-magic-parchment/75">
                    {exp.desc}
                  </p>

                  {exp.bullets && exp.bullets.length > 0 && (
                    <ul className="mt-4 space-y-2.5">
                      {exp.bullets.map((b, idx) => (
                        <li
                          key={idx}
                          className="flex gap-3 text-[0.82rem] leading-[1.7] text-magic-parchment/55"
                        >
                          <span className="mt-[0.55rem] h-1 w-1 shrink-0 rounded-full bg-magic-gold/70" />
                          <span>{b}</span>
                        </li>
                      ))}
                    </ul>
                  )}

                  <div className="mt-5 flex flex-wrap gap-1.5">
                    {exp.tech.map((t, idx) => (
                      <span
                        key={idx}
                        className="rounded-md border border-white/10 bg-white/[0.02] px-2.5 py-1 font-mono text-[0.6rem] uppercase tracking-[0.15em] text-magic-parchment/55 backdrop-blur-sm transition-colors duration-300 group-hover:border-white/20 group-hover:text-magic-parchment/75"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {i < experiences.length - 1 && (
                <div className="h-px w-full bg-white/[0.05]" />
              )}
            </div>
          ))}

          <div className="h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        </div>
      </div>
    </section>
  );
}