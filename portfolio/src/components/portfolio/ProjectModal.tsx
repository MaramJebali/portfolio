import { useEffect, useRef, useState } from "react";
import {
  motion,
  AnimatePresence,
} from "motion/react";
import {
  X,
  ArrowUpRight,
  ArrowLeft,
  Github,
  Trophy,
  Users,
  Play,
  FileText,
  ExternalLink,
  Rocket,
} from "lucide-react";
import type { Project } from "@/data/portfolio";
import {
  categoryMeta,
  getProjectScreens,
  getProjectMedia,
  getProjectPdf,
  toEmbedUrl,
} from "@/data/portfolio";
import { cn } from "@/lib/utils";
import { findTechIcon } from "./techIcon";
import { SplitReveal } from "@/components/ui/splitReveal";

const GLASS_TINT =
  "linear-gradient(115deg, rgba(245,208,254,0.18) 0%, rgba(255,255,255,0.06) 30%, rgba(219,234,254,0.22) 62%, rgba(167,139,250,0.22) 100%)";
const GLASS_BASE_DEEP =
  "linear-gradient(180deg, rgba(12,6,40,0.88) 0%, rgba(24,12,66,0.80) 100%)";
const GLASS_BORDER = "rgba(255,255,255,0.18)";

export function ProjectModal({
  project,
  onClose,
}: {
  project: Project | null;
  onClose: () => void;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [railH, setRailH] = useState(0);


  useEffect(() => {
    if (!project) return;
    const el = scrollRef.current;
    if (!el || window.matchMedia("(pointer: coarse)").matches) return;
    /* Lenis-feel smooth inertia for the inner container (the page's own
       Lenis targets window scroll only). Touch input stays native. */
    let target = el.scrollTop;
    let raf = 0, running = false;
    const clamp = () => Math.max(0, Math.min(el.scrollHeight - el.clientHeight, target));
    const tick = () => {
      const diff = target - el.scrollTop;
      if (Math.abs(diff) < 0.5) {
        el.scrollTop = target;
        running = false;
        return;
      }
      el.scrollTop += diff * 0.14;
      raf = requestAnimationFrame(tick);
    };
    const onWheel = (e: WheelEvent) => {
      if (e.ctrlKey) return; // keep pinch-zoom native
      e.preventDefault();
      target = clamp();
      target += e.deltaY;
      target = clamp();
      if (!running) {
        running = true;
        raf = requestAnimationFrame(tick);
      }
    };
    const onScroll = () => {
      /* scrollbar drags / keyboard / find-in-page — stay in sync */
      if (!running) target = el.scrollTop;
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      el.removeEventListener("wheel", onWheel);
      el.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, [project]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el || !project) return;
    const onScroll = () => {
      const max = el.scrollHeight - el.clientHeight;
      setRailH(max > 0 ? (el.scrollTop / max) * 100 : 0);
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => el.removeEventListener("scroll", onScroll);
  }, [project]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    /* raise + frost the navbar above the modal */
    document.body.classList.add("modal-open");
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
      document.body.classList.remove("modal-open");
    };
  }, [project, onClose]);

  /* projects may define only `id` (e.g. air-quality, oasis-gabes) */
  const slug = project ? project.slug ?? project.id : undefined;
  const screens = project ? getProjectScreens(slug) : [];
  const teamImages = project ? getProjectMedia(slug, "team") : [];
  /* Recognition wall: award shots AND posters (e.g. DeepSea poster,
     Overdose Bal-des-Projets posters) */
  const awardImages = project
    ? [...getProjectMedia(slug, "award"), ...getProjectMedia(slug, "poster")]
    : [];
  /* event shots (booth / corkboard / SDG wall) — Recognition only,
     never the Screens gallery */
  const eventImages = project
    ? [
        ...getProjectMedia(slug, "booth"),
        ...getProjectMedia(slug, "sdg"),
        ...getProjectMedia(slug, "corkboard"),
      ]
    : [];
  const recognitionArt = [...awardImages, ...eventImages];
  const gallery = screens.filter(
    (s) =>
      !teamImages.includes(s) &&
      !recognitionArt.includes(s) &&
      !/logo/i.test(s.split("/").pop() ?? ""),
  );
  const deck = project?.presentation ?? getProjectPdf(slug);
  const embed = project ? toEmbedUrl(project.video) : undefined;

  type LinkItem = { label: string; href?: string; icon: typeof Github };
  const links: LinkItem[] = project
    ? [
        { label: "GitHub", href: project.github, icon: Github },
        ...((project.extraLinks ?? []).map((l) => ({
          label: l.label,
          href: l.href,
          icon: Github,
        })) as LinkItem[]),
        { label: "Live site", href: project.live, icon: ExternalLink },
        { label: "Demo", href: project.demo, icon: Play },
        { label: "Video", href: project.video, icon: Play },
        { label: "Project page", href: project.link, icon: ArrowUpRight },
      ].filter((l) => Boolean(l.href))
    : [];

  return (
    <AnimatePresence>
      {project && (
        <motion.div
          key="project-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          className="fixed inset-0 z-[60] bg-[#030108]"
        >
          {/* Progress rail — same design as the film's fixed right-side one */}
          <div
            className="pointer-events-none fixed top-0 z-[66] h-full w-px bg-white/20"
            style={{ right: "clamp(1rem, 3vw, 2.4rem)" }}
          >
            <div
              style={{ height: `${railH}%` }}
              className="w-full bg-[#FFB36B] shadow-[0_0_10px_#FFB36B]"
            />
          </div>

          {/* Deep Space Background */}
          <div
            className="pointer-events-none fixed inset-0 z-0 opacity-60"
            style={{
              backgroundImage:
                "radial-gradient(circle at 10% 20%, rgba(139,92,246,0.15), transparent 40%), radial-gradient(circle at 90% 80%, rgba(56,189,248,0.1), transparent 40%)",
            }}
          />
          <div className="project-starfield pointer-events-none fixed inset-0 z-0 opacity-50" />

          {/* Close button */}
          <button
            onClick={onClose}
            className="fixed right-6 top-6 z-[70] grid h-12 w-12 place-items-center rounded-full border border-white/20 bg-black/40 text-white/70 backdrop-blur-xl transition-all hover:scale-105 hover:bg-black/60 hover:text-white"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>

          {/* Scroll Area */}
          <div
            ref={scrollRef}
            className="scroll-none relative z-10 h-screen overflow-y-auto overflow-x-hidden"
          >
            <div className="mx-auto grid max-w-[1500px] gap-0 md:grid-cols-[400px_1fr]">
              
              {/* --- LEFT RAIL (The HUD) --- */}
              <aside 
                className="relative md:sticky md:top-0 md:flex md:h-screen md:flex-col md:justify-between md:overflow-hidden md:border-r md:backdrop-blur-2xl"
                style={{ 
                  backgroundImage: [GLASS_TINT, GLASS_BASE_DEEP].join(", "),
                  borderColor: GLASS_BORDER 
                }}
              >
                <div className="p-8 sm:p-12">
                  <span className="block font-mono text-[0.65rem] uppercase tracking-[0.3em] text-violet-glow">
                    Case file · {project.period ?? project.category}
                  </span>

                  <h1 className="mt-5 font-display text-5xl leading-[0.95] text-white text-glow sm:text-6xl">
                    {project.title}
                  </h1>

                  <div className="mt-10 space-y-5 font-mono text-[0.7rem] uppercase tracking-[0.15em] text-white/60">
                    {project.team && (
                      <div className="flex items-start gap-3">
                        <Users className="mt-0.5 h-4 w-4 shrink-0 text-blue-300" />
                        <span className="normal-case tracking-normal text-white/80">
                          {project.team}
                        </span>
                      </div>
                    )}
                    {project.award && (
                      <div className="flex items-start gap-3 text-violet-glow">
                        <Trophy className="mt-0.5 h-4 w-4 shrink-0" />
                        <span className="normal-case tracking-normal">
                          {project.award}
                        </span>
                      </div>
                    )}
                  </div>

                  {(links.length > 0 || deck) && (
                    <div className="mt-12 flex flex-col gap-3">
                      {links.map(({ label, href, icon: Icon }) => (
                        <a
                          key={label}
                          href={href!}
                          target="_blank"
                          rel="noreferrer"
                          className="group flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] px-5 py-4 font-mono text-[0.7rem] uppercase tracking-[0.15em] text-white transition-all hover:border-white/30 hover:bg-white/[0.08]"
                        >
                          <span className="flex items-center gap-3">
                            <Icon className="h-4 w-4 text-white/50 transition-colors group-hover:text-white" /> 
                            {label}
                          </span>
                          <ArrowUpRight className="h-4 w-4 text-white/30 transition-all group-hover:translate-x-1 group-hover:-translate-y-1 group-hover:text-white" />
                        </a>
                      ))}
                      {deck && (
                        <a
                          href={deck}
                          target="_blank"
                          rel="noreferrer"
                          className="group flex items-center justify-between rounded-xl border border-violet-glow/30 bg-violet-glow/10 px-5 py-4 font-mono text-[0.7rem] uppercase tracking-[0.15em] text-white transition-all hover:border-violet-glow/60 hover:bg-violet-glow/20"
                        >
                          <span className="flex items-center gap-3">
                            <FileText className="h-4 w-4 text-violet-glow" /> 
                            Problem Deck
                          </span>
                          <ArrowUpRight className="h-4 w-4 text-violet-glow transition-all group-hover:translate-x-1 group-hover:-translate-y-1" />
                        </a>
                      )}
                    </div>
                  )}
                </div>

                <div className="hidden md:flex md:items-center md:gap-3 md:px-12 md:pb-12">
                  <motion.div
                    animate={{ x: [0, 8, 0] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    className="flex items-center gap-3 font-mono text-[0.65rem] uppercase tracking-[0.25em] text-white/30"
                  >
                    scroll to travel <ArrowUpRight className="h-4 w-4" />
                  </motion.div>
                </div>
              </aside>

              {/* --- RIGHT CONTENT — light "paper" panel (inverted colors) --- */}
              <main className="relative min-w-0 bg-[#EDEAF4] px-4 pb-32 pt-12 text-[#00020F] sm:px-8 md:pt-24 lg:px-10">
                <div className="relative z-10 space-y-8 sm:space-y-10">
                
                {/* OVERVIEW — for projects written as story, not problem/solution */}
                {(!project.problem && project.description && project.description.length > 0) && (
                  <RevealSection eyebrow="01 — Story" title="What it is">
                    {project.description.map((d, i) => (
                      <SplitBody key={i}>{d}</SplitBody>
                    ))}
                  </RevealSection>
                )}

                {/* PROBLEM */}
                {project.problem && project.problem.length > 0 && (
                  <RevealSection eyebrow="01 — Problem" title="The blind spot">
                    {project.problem.map((p, i) => (
                      <SplitBody key={i}>{p}</SplitBody>
                    ))}
                  </RevealSection>
                )}

                {/* SOLUTION */}
                {project.solution && project.solution.length > 0 && (
                  <RevealSection eyebrow="02 — Solution" title="What we built">
                    {project.solution.map((p, i) => (
                      <SplitBody key={i}>{p}</SplitBody>
                    ))}
                  </RevealSection>
                )}

                {/* FEATURES — cxf cut-panels: sticky text, wider image rail */}
                {project.features && project.features.length > 0 && (
                  <RevealSection eyebrow="03 — Features" title="Under the hood">
                    <div className="mt-12 space-y-14">
                      {project.features.map((f, i) => {
                        const img =
                          gallery.length > 0
                            ? gallery[i % gallery.length]
                            : undefined;
                        return (
                          <motion.div
                            key={f.title}
                            initial={{ opacity: 0, y: 19 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-12%" }}
                            transition={{ duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
                            className={cn(
                              "grid items-start gap-8 md:grid-cols-[1fr_1.55fr]",
                              i % 2 === 1 && "md:grid-cols-[1.55fr_1fr]",
                            )}
                          >
                            {/* text — sticks while the image rail scrolls */}
                            <div
                              className={cn(
                                "md:sticky md:top-24",
                                i % 2 === 1 && "md:order-2",
                              )}
                            >
                              <span className="font-mono text-[0.65rem] uppercase tracking-[0.28em] text-violet-500">
                                {String(i + 1).padStart(2, "0")} · {f.title}
                              </span>
                              <h3 className="mt-2 font-display text-2xl leading-tight text-[#00020F] sm:text-3xl">
                                {f.title}
                              </h3>
                              <div className="mt-4 space-y-2">
                                <p className="text-[1.06rem] leading-[1.7] text-[#4a4d58]">
                                  {rich(f.text)}
                                </p>
                              </div>
                              <div className="mt-5 flex flex-wrap gap-2">
                                {project.tags.slice(0, 3).map((t) => (
                                  <span
                                    key={t}
                                    className="rounded-full border border-black/20 bg-transparent px-3 py-1 font-mono text-[0.6rem] text-black/65 transition-colors duration-300 hover:bg-black hover:text-[#F2F2F2]"
                                  >
                                    {t}
                                  </span>
                                ))}
                              </div>
                            </div>
                            {/* image rail — the wider side */}
                            {img && (
                              <figure
                                className={cn(
                                  "m-0",
                                  i % 2 === 1 && "md:order-1",
                                )}
                              >
                                <div className="overflow-hidden rounded-2xl border border-black/10 bg-black shadow-2xl">
                                  <img
                                    src={img}
                                    alt={`${project.title} — ${f.title}`}
                                    loading="lazy"
                                    className="block max-h-[62vh] w-full object-cover"
                                  />
                                </div>
                                <figcaption className="mt-2 flex items-baseline gap-3 text-xs tracking-wide">
                                  <span className="font-mono uppercase text-violet-500/90">
                                    {f.title}
                                  </span>
                                  <span className="text-black/45">
                                    {project.title}
                                  </span>
                                </figcaption>
                              </figure>
                            )}
                          </motion.div>
                        );
                      })}
                    </div>
                  </RevealSection>
                )}

                {/* VIDEO */}
                {project.video && (
                  <RevealSection eyebrow="Explainer" title="Watch it in motion">
                    <div className="mt-10 overflow-hidden rounded-3xl border border-black/10 bg-black shadow-2xl">
                      {embed ? (
                        <div className="relative aspect-video">
                          <iframe
                            src={embed}
                            title={`${project.title} explainer`}
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            className="absolute inset-0 h-full w-full"
                          />
                        </div>
                      ) : (
                        <video controls preload="metadata" poster={project.videoPoster} className="block w-full">
                          <source src={project.video} type="video/mp4" />
                        </video>
                      )}
                    </div>
                  </RevealSection>
                )}

                {/* GALLERY — screenshot wall (pj-sh) */}
                {gallery.length > 0 && (
                  <RevealSection eyebrow="Visual feed" title="Screens from the build">
                    <div className="mt-10 grid gap-6 sm:grid-cols-2">
                      {gallery.map((src, k) => (
                        <motion.figure
                          key={src + k}
                          initial={{ opacity: 0, y: 19 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true, margin: "-10%" }}
                          transition={{ duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
                          className="m-0"
                        >
                          <button
                            type="button"
                            onClick={() => window.open(src, "_blank")}
                            className="block w-full cursor-zoom-in overflow-hidden rounded-2xl border border-black/10 bg-black shadow-2xl"
                          >
                            <img
                              src={src}
                              alt={`${project.title} — screen ${k + 2}`}
                              loading="lazy"
                              draggable={false}
                              className="block max-h-[70vh] w-full object-cover transition-transform duration-700 hover:scale-[1.02]"
                            />
                          </button>
                          <figcaption className="mt-2 flex items-baseline gap-3 text-xs tracking-wide">
                            <span className="font-mono uppercase text-violet-500/90">
                              Screen {String(k + 1).padStart(2, "0")}
                            </span>
                            <span className="text-black/45">{project.title}</span>
                          </figcaption>
                        </motion.figure>
                      ))}
                    </div>
                  </RevealSection>
                )}

                {/* RECOGNITION — award artwork + the journey */}
                {((recognitionArt.length > 0) ||
                  project.award ||
                  (project.journey && project.journey.length > 0)) && (
                  <RevealSection eyebrow="Recognition" title="Wins & milestones">
                    {project.award && (
                      <SplitBody>
                        <span className="inline-flex items-start gap-3 text-[#00020F]">
                          <Trophy className="mt-1 h-5 w-5 shrink-0 text-violet-500" />
                          {project.award}
                        </span>
                      </SplitBody>
                    )}
                    {recognitionArt.length > 0 && (
                      <div
                        className={cn(
                          "mt-10 grid gap-6",
                          recognitionArt.length > 1 && "sm:grid-cols-2",
                        )}
                      >
                        {recognitionArt.map((src, i) => (
                          <motion.figure
                            key={src + i}
                            initial={{ y: 60, opacity: 0 }}
                            whileInView={{ y: 0, opacity: 1 }}
                            viewport={{ once: true, margin: "-10%" }}
                            transition={{ duration: 0.7, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
                            className="overflow-hidden rounded-3xl border border-black/10 bg-black shadow-2xl"
                          >
                            <button
                              type="button"
                              onClick={() => window.open(src, "_blank")}
                              className="block h-full w-full cursor-zoom-in"
                            >
                              <img
                                src={src}
                                alt={`${project.title} — recognition ${i + 1}`}
                                loading="lazy"
                                className="block h-auto max-h-[85vh] w-full object-contain transition-transform duration-700 hover:scale-[1.02]"
                              />
                            </button>
                          </motion.figure>
                        ))}
                      </div>
                    )}
                    {project.journey && project.journey.length > 0 && (
                      <ul className="mt-10 space-y-4">
                        {project.journey.map((line, i) => (
                          <motion.li
                            key={i}
                            initial={{ y: 40, opacity: 0 }}
                            whileInView={{ y: 0, opacity: 1 }}
                            viewport={{ once: true, margin: "-10%" }}
                            transition={{ duration: 0.5, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
                            className="flex items-start gap-5 rounded-2xl border border-black/12 bg-white/60 p-6 backdrop-blur-sm transition-colors duration-300 hover:bg-violet-500/10"
                          >
                            <Trophy className="mt-1.5 h-5 w-5 shrink-0 text-violet-500/80" />
                            <span className="text-[1.02rem] leading-[1.65] text-[#2a2c38]">
                              {rich(line)}
                            </span>
                          </motion.li>
                        ))}
                      </ul>
                    )}
                  </RevealSection>
                )}

                {/* RESULTS — cxn KPI stats */}
                {project.metrics && project.metrics.length > 0 && (
                  <RevealSection eyebrow="Results" title="By the numbers">
                    <Metrics metrics={project.metrics} />
                  </RevealSection>
                )}

                {/* STACK — cxk tiles with brand logos */}
                <RevealSection eyebrow="Stack" title="Built with">
                  <div className="mt-10 grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                    {project.stack.map((s) => {
                      const Icon = findTechIcon(s);
                      return (
                        <motion.div
                          key={s}
                          initial={{ opacity: 0, y: 19 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true, margin: "-10%" }}
                          transition={{ duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
                          className="group flex cursor-default flex-col items-center gap-1.5 rounded-xl border border-[#d6dae2] bg-white px-3.5 py-4 text-center transition-all duration-300 [transition-timing-function:cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-1 hover:rotate-2 hover:border-violet-500 hover:bg-violet-500 hover:shadow-[0_1rem_1.75rem_-0.75rem_rgba(139,92,246,0.6)]"
                          title={s}
                        >
                          <span className="flex h-7 items-center">
                            {Icon ? (
                              <Icon className="h-7 w-7 text-[#00020F] transition-colors duration-300 group-hover:text-white" />
                            ) : (
                              <span className="font-mono text-[1.5rem] font-semibold leading-none text-[#00020F] transition-colors duration-300 group-hover:text-white">
                                {s.slice(0, 2)}
                              </span>
                            )}
                          </span>
                          <span className="text-[0.72rem] font-semibold leading-tight text-[#00020F] transition-colors duration-300 group-hover:text-white">
                            {s}
                          </span>
                        </motion.div>
                      );
                    })}
                  </div>
                </RevealSection>

                {/* TEAM — faces behind the project (skip when there are
                    no team images, e.g. Delil / FABMATE) */}
                {teamImages.length > 0 && (
                  <RevealSection eyebrow="Crew" title="The people behind it">
                    <div className="mt-10 space-y-8">
                      {teamImages.length > 0 && (
                        <div
                          className={cn(
                            "grid gap-6",
                            teamImages.length > 1 ? "sm:grid-cols-2" : "max-w-xl",
                          )}
                        >
                          {teamImages.map((src, i) => (
                            <motion.figure
                              key={src + i}
                              initial={{ y: 60, opacity: 0 }}
                              whileInView={{ y: 0, opacity: 1 }}
                              viewport={{ once: true, margin: "-10%" }}
                              transition={{ duration: 0.7, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
                              className="overflow-hidden rounded-3xl border border-black/10 bg-black shadow-2xl"
                            >
                              <img
                                src={src}
                                alt={`${project.title} — the team ${i + 1}`}
                                loading="lazy"
                                className="block h-auto max-h-[70vh] w-full object-cover"
                              />
                              {project.team && (
                                <figcaption className="px-6 py-4 text-base text-white">
                                  {project.team}
                                  {project.contributors &&
                                    project.contributors.length > 0 && (
                                      <span className="block text-sm text-white/70">
                                        {project.contributors.join(" · ")}
                                      </span>
                                    )}
                                </figcaption>
                              )}
                            </motion.figure>
                          ))}
                        </div>
                      )}
                      {project.contributors && project.contributors.length > 0 && (
                        <div className="flex flex-wrap gap-3">
                          {project.contributors.map((c) => (
                            <span
                              key={c}
                              className="rounded-full border border-black/15 bg-transparent px-5 py-2.5 text-sm text-black/80 transition-colors duration-300 hover:bg-black hover:text-[#F2F2F2]"
                            >
                              {c}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </RevealSection>
                )}

                {/* FOOTER */}
                <div className="mt-20 flex items-center justify-between border-t border-black/15 pt-10">
                  <button
                    onClick={onClose}
                    className="group inline-flex items-center gap-3 font-mono text-[0.7rem] uppercase tracking-[0.2em] text-black/45 transition-colors hover:text-black"
                  >
                    <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                    All projects
                  </button>
                  <span className="inline-flex items-center gap-2 font-mono text-[0.6rem] uppercase tracking-[0.2em] text-black/25">
                    <Rocket className="h-4 w-4" /> {project.title}
                  </span>
                </div>
                </div>
              </main>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ---------- Helpers ---------- */

function RevealSection({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="not-prose">
      {/* eyebrow with its closing rule, directly beside it */}
      <div className="flex items-center gap-4">
        <span className="shrink-0 font-mono text-[0.65rem] uppercase tracking-[0.28em] text-violet-500">
          {eyebrow}
        </span>
        <span aria-hidden className="h-px flex-1 bg-violet-500/40" />
      </div>

      {/* always-visible title (no split animation — it could leave it blank) */}
      <motion.h2
        initial={{ opacity: 0, y: 19 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.6 }}
        transition={{ duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
        className="mt-2 font-display text-4xl text-[#00020F] text-balance sm:text-5xl"
      >
        {title}
      </motion.h2>

      {children}
    </section>
  );
}

/* cxn-style KPI row — big Anton numbers over an ink rule */
function Metrics({
  metrics,
}: {
  metrics: { label: string; value: string }[];
}) {
  return (
    <div className="mt-10 grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3 lg:grid-cols-4">
      {metrics.map((m, i) => (
        <motion.div
          key={m.label}
          initial={{ opacity: 0, y: 19 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-10%" }}
          transition={{ duration: 0.8, delay: 0.1 * i, ease: [0.22, 1, 0.36, 1] }}
          className="border-t-[1.5px] border-[#00020F] pt-2"
        >
          <b
            className="block text-[clamp(1.9rem,3.4vw,3rem)] font-normal leading-none tracking-tight text-[#00020F]"
            style={{ fontFamily: "Anton, sans-serif" }}
          >
            {m.value}
          </b>
          <span className="mt-2 block text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-[#00020F]/85">
            {m.label}
          </span>
        </motion.div>
      ))}
    </div>
  );
}

/* inline **bold** support — guide the eye to key ideas */
export function rich(text: string): React.ReactNode {
  const parts = text.split(/\*\*(.+?)\*\*/g);
  return parts.map((p, i) =>
    i % 2 ? (
      <strong key={i} className="font-semibold text-[#00020F]">
        {p}
      </strong>
    ) : (
      p
    ),
  );
}

function SplitBody({ children }: { children: React.ReactNode }) {
  const text = typeof children === "string" ? children : "";
  return (
    <motion.p
      initial={{ opacity: 0, y: 19 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.5 }}
      transition={{ duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className="mt-5 max-w-[72ch] text-[1.06rem] leading-[1.7] text-[#4a4d58] text-pretty break-words"
    >
      {text ? rich(text) : children}
    </motion.p>
  );
}