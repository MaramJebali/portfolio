import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { motion } from "motion/react";
import { Sparkles } from "lucide-react";
import heroBg from "@/assets/cosmic-hero.jpg";
import { StarField } from "@/components/portfolio/StarField";
import { profile } from "@/data/portfolio";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Maram — AI Engineer Portfolio" },
      {
        name: "description",
        content:
          "Enter the universe of Maram, an AI engineering student crafting intelligent systems for health, sustainability and impact.",
      },
      { property: "og:title", content: "Maram — AI Engineer Portfolio" },
      {
        property: "og:description",
        content: "Crafting intelligent systems, one project at a time.",
      },
    ],
    links: [{ rel: "canonical", href: "/" }],
  }),
  component: Index,
});

function Index() {
  const navigate = useNavigate();

  return (
    <main className="relative h-screen w-screen overflow-hidden bg-background">
      <img
        src={heroBg}
        alt=""
        aria-hidden
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-background/30 via-transparent to-background/70" />
      <StarField count={50} />

      <div className="relative z-10 flex h-full flex-col items-center justify-center px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="mb-8 inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/15 px-4 py-1.5 font-mono text-xs uppercase tracking-[0.25em] text-foreground/90 backdrop-blur-sm"
        >
          <Sparkles className="h-3.5 w-3.5 text-violet-glow" />
          {profile.name}&apos;s Portfolio
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
          className="font-display text-5xl leading-[1.05] text-foreground text-glow sm:text-6xl md:text-7xl lg:text-[5.5rem]"
        >
          {profile.tagline.line1}{" "}
          <span className="italic text-foreground/65">
            {profile.tagline.accent}
          </span>
          <br />
          {profile.tagline.line2}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.25, ease: "easeOut" }}
          className="mt-7 max-w-md text-sm leading-relaxed text-muted-foreground sm:text-base"
        >
          {profile.intro}
        </motion.p>

        <motion.button
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => navigate({ to: "/universe" })}
          className="group mt-11 inline-flex items-center gap-3 rounded-full border border-primary/50 bg-background/80 px-10 py-4 font-mono text-sm uppercase tracking-[0.2em] text-foreground shadow-[var(--shadow-glow)] backdrop-blur-md transition-colors hover:border-primary hover:bg-primary/15"
        >
          Enter Universe
          <span className="transition-transform duration-300 group-hover:translate-x-1">
            →
          </span>
        </motion.button>
      </div>
    </main>
  );
}
