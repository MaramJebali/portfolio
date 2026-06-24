import { motion, AnimatePresence } from "motion/react";
import { X, ArrowUpRight, Github, Trophy, Users, CalendarDays } from "lucide-react";
import { useEffect } from "react";
import type { Project } from "@/data/portfolio";
import { categoryMeta } from "@/data/portfolio";

export function ProjectModal({
  project,
  onClose,
}: {
  project: Project | null;
  onClose: () => void;
}) {
  useEffect(() => {
    if (!project) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [project, onClose]);

  return (
    <AnimatePresence>
      {project && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 z-[60] flex items-end justify-center bg-background/80 p-0 backdrop-blur-md sm:items-center sm:p-6"
        >
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.98 }}
            transition={{ type: "spring", damping: 26, stiffness: 260 }}
            onClick={(e) => e.stopPropagation()}
            className="scrollbar-thin relative max-h-[88vh] w-full max-w-2xl overflow-y-auto rounded-t-3xl border border-border bg-card p-7 shadow-[var(--shadow-card)] sm:rounded-3xl sm:p-9"
          >
            <button
              onClick={onClose}
              className="absolute right-5 top-5 grid h-9 w-9 place-items-center rounded-full border border-border text-muted-foreground transition-colors hover:text-foreground"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>

            <span className="font-mono text-[0.65rem] uppercase tracking-[0.25em] text-violet-glow">
              {categoryMeta[project.category].label}
            </span>
            <h2 className="mt-3 font-display text-3xl leading-tight text-foreground sm:text-4xl">
              {project.title}
            </h2>

            <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 font-mono text-[0.7rem] uppercase tracking-[0.15em] text-muted-foreground">
              {project.period && (
                <span className="inline-flex items-center gap-1.5">
                  <CalendarDays className="h-3.5 w-3.5" /> {project.period}
                </span>
              )}
              {project.team && (
                <span className="inline-flex items-center gap-1.5">
                  <Users className="h-3.5 w-3.5" /> {project.team}
                </span>
              )}
              {project.award && (
                <span className="inline-flex items-center gap-1.5 text-violet-glow">
                  <Trophy className="h-3.5 w-3.5" /> {project.award}
                </span>
              )}
            </div>

            <div className="mt-6 space-y-4 text-sm leading-relaxed text-muted-foreground">
              {project.description.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>

            <div className="mt-7">
              <h3 className="font-mono text-[0.65rem] uppercase tracking-[0.25em] text-foreground/70">
                Tech Stack
              </h3>
              <div className="mt-3 flex flex-wrap gap-2">
                {project.stack.map((s) => (
                  <span
                    key={s}
                    className="rounded-full border border-border bg-secondary/60 px-3 py-1 font-mono text-[0.7rem] text-foreground/85"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>

            {(project.link || project.github) && (
              <div className="mt-8 flex flex-wrap gap-3">
                {project.link && (
                  <a
                    href={project.link}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-full border border-primary/50 bg-primary/15 px-5 py-2.5 font-mono text-xs uppercase tracking-[0.15em] text-foreground transition-colors hover:bg-primary/25"
                  >
                    View Project <ArrowUpRight className="h-3.5 w-3.5" />
                  </a>
                )}
                {project.github && (
                  <a
                    href={project.github}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-full border border-border px-5 py-2.5 font-mono text-xs uppercase tracking-[0.15em] text-foreground transition-colors hover:bg-secondary"
                  >
                    GitHub <Github className="h-3.5 w-3.5" />
                  </a>
                )}
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}