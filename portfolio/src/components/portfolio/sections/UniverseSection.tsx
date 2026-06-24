import { motion } from "motion/react";
import { ArrowRight } from "lucide-react";
import { profile, projects, categoryMeta } from "@/data/portfolio";
import type { Project } from "@/data/portfolio";
import type { SectionKey } from "@/components/portfolio/Navbar";

const featured = projects.filter((p) =>
  ["sahatek", "pulse", "deepsea", "cancercare"].includes(p.id),
);

export function UniverseSection({
  onNavigate,
  onOpenProject,
}: {
  onNavigate: (key: SectionKey) => void;
  onOpenProject: (p: Project) => void;
}) {
  return (
    <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8 sm:py-24">
      <div className="text-center">
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-violet-glow">
          Welcome, traveller
        </p>
        <h1 className="mt-5 font-display text-4xl leading-[1.08] text-foreground text-glow sm:text-6xl md:text-7xl">
          A universe of{" "}
          <span className="italic text-foreground/65">intelligent ideas</span>
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base">
          I&apos;m {profile.name}, an {profile.role.toLowerCase()} at{" "}
          {profile.school}. I build AI systems for health, sustainability and
          real-world impact. Wander through the constellations below.
        </p>
      </div>

      <div className="mt-14 grid gap-5 sm:grid-cols-2">
        {featured.map((p, i) => (
          <motion.button
            key={p.id}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + i * 0.08, duration: 0.5 }}
            onClick={() => onOpenProject(p)}
            className="group relative overflow-hidden rounded-2xl border border-border bg-card p-6 text-left transition-colors hover:border-primary/50"
          >
            <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-primary/10 blur-3xl transition-opacity group-hover:opacity-80" />
            <span className="font-mono text-[0.65rem] uppercase tracking-[0.25em] text-violet-glow">
              {categoryMeta[p.category].label}
            </span>
            <h3 className="mt-3 font-display text-2xl text-foreground">
              {p.title}
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              {p.summary}
            </p>
            <span className="mt-5 inline-flex items-center gap-1.5 font-mono text-[0.7rem] uppercase tracking-[0.15em] text-foreground/80">
              Explore{" "}
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
            </span>
          </motion.button>
        ))}
      </div>

      <div className="mt-12 flex justify-center">
        <button
          onClick={() => onNavigate("works")}
          className="inline-flex items-center gap-2 rounded-full border border-primary/50 bg-primary/10 px-7 py-3 font-mono text-xs uppercase tracking-[0.2em] text-foreground transition-colors hover:bg-primary/20"
        >
          See all works <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}