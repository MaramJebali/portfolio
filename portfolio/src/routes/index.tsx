import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { motion } from "motion/react";
import { Sparkles } from "lucide-react";
import { useState, useEffect } from "react";
import heroBg from "@/assets/cosmic-hero.jpg";
import { StarField as RawStarField } from "@/components/portfolio/StarField";
import { profile } from "@/data/portfolio";
import type { ComponentType } from "react";

type StarFieldProps = { count: number };
const StarField = RawStarField as unknown as ComponentType<StarFieldProps>;

// --- ROTATING WORDS ---
const ROTATING_WORDS = ["Project", "Step", "Idea"];

// Find the longest word for fixed width
const LONGEST_WORD = ROTATING_WORDS.reduce((a, b) => a.length > b.length ? a : b, "");
const WORD_WIDTH = LONGEST_WORD.length * 0.9 + 8;

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
  const [wordIndex, setWordIndex] = useState(0);
  const [nextWordIndex, setNextWordIndex] = useState(1);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  // Rotate words every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setIsTransitioning(true);
      setTimeout(() => {
        setWordIndex((prev) => (prev + 1) % ROTATING_WORDS.length);
        setNextWordIndex((prev) => (prev + 1) % ROTATING_WORDS.length);
        setIsTransitioning(false);
      }, 600);
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  // Show content after a tiny delay
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 200);
    return () => clearTimeout(timer);
  }, []);

  const currentWord = ROTATING_WORDS[wordIndex];
  const nextWord = ROTATING_WORDS[nextWordIndex];

  return (
    <main className="relative h-screen w-screen overflow-hidden bg-background">
      {/* Background Image */}
      <motion.img
        src={heroBg}
        alt=""
        aria-hidden
        className="absolute inset-0 h-full w-full object-cover"
        initial={{ scale: 1.05, opacity: 0 }}
        animate={isVisible ? { scale: 1, opacity: 1 } : { scale: 1.05, opacity: 0 }}
        transition={{ duration: 1.5, ease: "easeOut" }}
      />
      
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-background/30 via-transparent to-background/70" />
      
      {/* StarField - FADE IN SMOOTHLY */}
      <motion.div
        className="absolute inset-0 z-0 pointer-events-auto"
        initial={{ opacity: 0 }}
        animate={isVisible ? { opacity: 1 } : { opacity: 0 }}
        transition={{ duration: 2, ease: "easeOut", delay: 0.2 }}
      >
        <StarField count={50} />
      </motion.div>


      {/* Content */}
      <div className="relative z-10 flex h-full flex-col items-center justify-center px-6 text-center pointer-events-none">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.7, delay: 0.4, ease: "easeOut" }}
          className="mb-8 inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/15 px-4 py-1.5 font-mono text-xs uppercase tracking-[0.25em] text-foreground/90 backdrop-blur-sm pointer-events-auto"
        >
          <Sparkles className="h-3.5 w-3.5 text-violet-glow" />
          {profile.name}&apos;s Portfolio
        </motion.div>

        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.9, delay: 0.5, ease: "easeOut" }}
          className="font-display text-5xl leading-[1.05] text-foreground text-glow sm:text-6xl md:text-7xl lg:text-[5.5rem] pointer-events-none select-none"
        >
          Crafting intelligent{" "}
          <span className="italic text-foreground/65">
            systems,
          </span>
          <br />
          one{" "}
          <span 
            className="relative inline-block overflow-hidden align-middle text-center"
            style={{ 
              width: `${WORD_WIDTH}rem`,
              height: '1.5em'
            }}
          >
            <motion.span
              key={currentWord + "current"}
              initial={{ y: 0, opacity: 1 }}
              animate={isTransitioning ? { y: -35, opacity: 0 } : { y: 0, opacity: 1 }}
              transition={{ duration: 0.6, ease: "easeInOut" }}
              className="absolute inset-0 flex items-center justify-center italic text-violet-glow"
            >
              {currentWord}
            </motion.span>
            <motion.span
              key={nextWord + "next"}
              initial={{ y: 35, opacity: 0 }}
              animate={isTransitioning ? { y: 0, opacity: 1 } : { y: 35, opacity: 0 }}
              transition={{ duration: 0.6, ease: "easeInOut" }}
              className="absolute inset-0 flex items-center justify-center italic text-violet-glow"
            >
              {nextWord}
            </motion.span>
          </span>
          {" "}at a time.
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.25, ease: "easeOut" }}
          className="mt-7 max-w-md text-[0.65rem] leading-relaxed text-white/90 sm:text-[0.7rem] md:text-[0.75rem] pointer-events-none select-none [text-shadow:0_0_10px_rgba(255,255,255,0.3),0_0_20px_rgba(255,255,255,0.1)]"
        >
          My journey through the cosmos of AI, data and sustainability.
          <br />
          Welcome to my little universe, feel free to explore!
        </motion.p>

        {/* Button */}
        <motion.button
          initial={{ opacity: 0, y: 30 }}
          animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.7, delay: 1.1, ease: "easeOut" }}
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => navigate({ to: "/universe" })}
          className="group mt-10 inline-flex items-center gap-3 rounded-full border border-primary/50 bg-background/80 px-10 py-4 font-mono text-sm uppercase tracking-[0.2em] text-foreground shadow-[var(--shadow-glow)] backdrop-blur-md transition-colors hover:border-primary hover:bg-primary/15 pointer-events-auto"
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