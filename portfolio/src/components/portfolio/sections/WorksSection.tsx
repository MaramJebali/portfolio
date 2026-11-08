import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ArrowUpRight, Trophy, ChevronRight } from "lucide-react";
import {
  projects,
  categoryMeta,
  categoryOrder,
  getProjectScreens,
  type Project,
  type ProjectCategory,
} from "@/data/portfolio";
import { cn } from "@/lib/utils";

// Shared Glass Tokens from your AboutSection
const GLASS_TINT =
  "linear-gradient(115deg, rgba(245,208,254,0.18) 0%, rgba(255,255,255,0.06) 30%, rgba(219,234,254,0.22) 62%, rgba(167,139,250,0.22) 100%)";
const GLASS_BASE_CARD =
  "linear-gradient(180deg, rgba(12,6,40,0.62) 0%, rgba(24,12,66,0.52) 100%)";
const GLASS_BORDER = "rgba(255,255,255,0.18)";

export function WorksSection({
  onOpenProject,
}: {
  onOpenProject: (p: Project) => void;
}) {
  const [active, setActive] = useState<ProjectCategory>("academic");
  const list = projects.filter((p) => p.category === active);

  return (
    <div className="relative w-full overflow-hidden py-16 sm:py-24">
      {/* Header */}
      <div className="mx-auto flex max-w-[1400px] flex-col items-start justify-between gap-6 px-5 sm:px-8 md:flex-row md:items-end">
        <div>
          <span className="font-mono text-[0.65rem] uppercase tracking-[0.25em] text-muted-foreground">
            01 / Featured Work
          </span>
          <h2 className="mt-4 font-display text-5xl text-white text-glow sm:text-7xl select-none">
            Selected <span className="italic text-white/60">works</span>
          </h2>
        </div>
        
        <div className="flex flex-wrap gap-2">
          {categoryOrder.map((cat) => (
            <button
              key={cat}
              onClick={() => setActive(cat)}
              className={cn(
                "rounded-full border px-5 py-2.5 font-mono text-[0.65rem] uppercase tracking-[0.15em] transition-all duration-300",
                active === cat
                  ? "border-white/40 bg-white/10 text-white shadow-[0_0_20px_-5px_rgba(255,255,255,0.2)]"
                  : "border-white/10 text-white/50 hover:border-white/20 hover:text-white/80",
              )}
            >
              {categoryMeta[cat].label}
            </button>
          ))}
        </div>
      </div>

      {/* Horizontal Scroll Track with Black Hole Mask */}
      <div className="relative mt-12 w-full">
        {/* The scroll container: mask-image fades edges into the void */}
        <div 
          className="hide-scrollbar flex w-full snap-x snap-mandatory gap-8 overflow-x-auto px-8 pb-16 pt-8 sm:px-[max(2rem,calc((100vw-1400px)/2))] [mask-image:linear-gradient(to_right,transparent,black_4%,black_96%,transparent)]"
        >
          <AnimatePresence mode="popLayout">
            {list.map((p, index) => (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, scale: 0.95, x: 100 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
                transition={{ duration: 0.7, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
                className="w-[90vw] max-w-[1100px] shrink-0 snap-center first:ml-4 last:mr-4"
              >
                <ProjectBanner project={p} onClick={() => onOpenProject(p)} />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Right fade hint arrow */}
        <div className="pointer-events-none absolute right-6 top-1/2 z-10 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/10 bg-black/40 text-white/50 backdrop-blur-md md:flex">
           <ChevronRight className="h-5 w-5 animate-pulse" />
        </div>
      </div>
    </div>
  );
}

function ProjectBanner({ project, onClick }: { project: Project; onClick: () => void }) {
  const screens = getProjectScreens(project.slug);
  const canScroll = screens.length > 1;
  const loop = canScroll ? [...screens, ...screens] : screens;

  return (
    <button
      onClick={onClick}
      className="group relative flex w-full flex-col overflow-hidden rounded-[2.5rem] border text-left shadow-2xl backdrop-blur-2xl transition-all duration-500 hover:border-white/30 lg:h-[600px] lg:flex-row"
      style={{
        backgroundImage: [GLASS_TINT, GLASS_BASE_CARD].join(", "),
        borderColor: GLASS_BORDER,
      }}
    >
      {/* Media Side (Left) - Like the AR Glasses reference */}
      <div className="relative h-[300px] w-full overflow-hidden border-b border-white/10 bg-black sm:h-[400px] lg:h-full lg:w-[62%] lg:border-b-0 lg:border-r">
        {screens.length > 0 ? (
          <div className={cn("project-filmstrip-track flex h-full w-max", canScroll && "is-scrolling")}>
            {loop.map((src, i) => (
              <img
                key={i}
                src={src}
                alt={`${project.title} — screen ${(i % screens.length) + 1}`}
                loading="lazy"
                draggable={false}
                className="h-full w-auto max-w-none shrink-0 object-cover"
              />
            ))}
          </div>
        ) : (
          <div className="grid h-full place-items-center bg-[radial-gradient(ellipse_at_center,rgba(139,92,246,0.15),transparent_70%)]">
            <span className="font-mono text-[0.6rem] uppercase tracking-[0.25em] text-white/40">
              Preview pending
            </span>
          </div>
        )}
        
        {/* Scanline overlay */}
        <div 
          className="pointer-events-none absolute inset-0 z-10" 
          style={{ 
            background: "repeating-linear-gradient(to bottom, transparent 0 3px, rgba(255,255,255,0.03) 3px 4px)", 
            mixBlendMode: "overlay" 
          }} 
        />
        
        {/* Dark gradient at bottom for mobile text readability */}
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/80 to-transparent lg:hidden" />
      </div>

      {/* Content Side (Right) */}
      <div className="relative flex flex-1 flex-col justify-between bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-white/[0.05] via-transparent to-transparent p-8 sm:p-12 lg:p-16">
        
        {/* Top Meta */}
        <div className="flex items-start justify-between gap-4">
          <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2 font-mono text-[0.65rem] uppercase tracking-[0.15em] text-white/70 backdrop-blur-md">
            {project.tags.slice(0, 3).join(" · ")}
          </span>
          <div className="grid h-12 w-12 shrink-0 place-items-center rounded-full border border-white/10 bg-white/5 text-white/50 transition-all duration-300 group-hover:border-white/30 group-hover:bg-white/10 group-hover:text-white">
            <ArrowUpRight className="h-5 w-5 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </div>
        </div>

        {/* Middle: Title & Highlight */}
        <div className="my-10">
          <h3 className="font-display text-4xl leading-tight text-white sm:text-5xl">
            {project.title}
          </h3>
          
          {/* If there is an award, show it huge and italic like the reference image */}
          {project.award ? (
            <p className="mt-6 font-display text-3xl italic leading-snug text-violet-glow sm:text-4xl text-balance">
              {project.award}
            </p>
          ) : (
            <p className="mt-5 text-base leading-relaxed text-white/60 sm:text-lg text-pretty">
              {project.summary}
            </p>
          )}
        </div>

        {/* Bottom Meta */}
        <div className="flex items-center gap-5 border-t border-white/10 pt-6 font-mono text-[0.7rem] uppercase tracking-[0.15em] text-white/40">
          <span>{project.period ?? "2025"}</span>
          <span className="h-1.5 w-1.5 rounded-full bg-white/20" />
          <span>{project.category}</span>
        </div>
      </div>
    </button>
  );
}