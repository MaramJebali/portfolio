import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ArrowUpRight, Trophy } from "lucide-react";
import {
  projects,
  categoryMeta,
  categoryOrder,
  type Project,
  type ProjectCategory,
} from "@/data/portfolio";
import { cn } from "@/lib/utils";

export function WorksSection({
  onOpenProject,
}: {
  onOpenProject: (p: Project) => void;
}) {
  const [active, setActive] = useState<ProjectCategory>("academic");
  const list = projects.filter((p) => p.category === active);

  return (
    <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8 sm:py-24">
      <div className="text-center">
        <h2 className="font-display text-4xl text-foreground text-glow sm:text-6xl">
          Featured <span className="italic text-foreground/60">works</span>
        </h2>
        <p className="mx-auto mt-5 max-w-lg text-sm leading-relaxed text-muted-foreground">
          From hands-on academic builds to hackathon sprints and professional
          work — every project a star in my creative sky.
        </p>
      </div>

      {/* Category tabs */}
      <div className="mt-10 flex flex-wrap justify-center gap-2">
        {categoryOrder.map((cat) => (
          <button
            key={cat}
            onClick={() => setActive(cat)}
            className={cn(
              "rounded-full border px-5 py-2.5 font-mono text-[0.7rem] uppercase tracking-[0.15em] transition-colors",
              active === cat
                ? "border-primary bg-primary/20 text-foreground"
                : "border-border text-muted-foreground hover:text-foreground",
            )}
          >
            {categoryMeta[cat].label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={active}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.35 }}
          className="mt-10 grid gap-5 md:grid-cols-2"
        >
          {list.map((p) => (
            <button
              key={p.id}
              onClick={() => onOpenProject(p)}
              className="group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-card p-6 text-left transition-all hover:border-primary/50 hover:shadow-[var(--shadow-glow)]"
            >
              <div className="absolute -right-20 -top-20 h-44 w-44 rounded-full bg-primary/10 blur-3xl opacity-0 transition-opacity group-hover:opacity-100" />
              <div className="flex items-start justify-between gap-3">
                <div className="flex flex-wrap gap-2">
                  {p.tags.map((t) => (
                    <span
                      key={t}
                      className="rounded-full border border-border/70 bg-secondary/50 px-2.5 py-1 font-mono text-[0.6rem] uppercase tracking-[0.1em] text-foreground/80"
                    >
                      {t}
                    </span>
                  ))}
                </div>
                <ArrowUpRight className="h-5 w-5 shrink-0 text-muted-foreground transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-violet-glow" />
              </div>
              <h3 className="mt-4 font-display text-2xl leading-tight text-foreground">
                {p.title}
              </h3>
              {p.award && (
                <span className="mt-2 inline-flex items-center gap-1.5 font-mono text-[0.65rem] uppercase tracking-[0.15em] text-violet-glow">
                  <Trophy className="h-3.5 w-3.5" /> {p.award}
                </span>
              )}
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                {p.summary}
              </p>
              {p.period && (
                <span className="mt-4 font-mono text-[0.65rem] uppercase tracking-[0.15em] text-muted-foreground/70">
                  {p.period}
                </span>
              )}
            </button>
          ))}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}