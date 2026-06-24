import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Navbar, type SectionKey } from "@/components/portfolio/Navbar";
import { StarField } from "@/components/portfolio/StarField";
import { ProjectModal } from "@/components/portfolio/ProjectModal";
import { UniverseSection } from "@/components/portfolio/sections/UniverseSection";
import { AboutSection } from "@/components/portfolio/sections/AboutSection";
import { WorksSection } from "@/components/portfolio/sections/WorksSection";
import { ContactSection } from "@/components/portfolio/sections/ContactSection";
import type { Project } from "@/data/portfolio";

export const Route = createFileRoute("/universe")({
  head: () => ({
    meta: [
      { title: "The Universe — Maram's AI Portfolio" },
      {
        name: "description",
        content:
          "Explore Maram's AI engineering projects, skills, certifications and ways to connect.",
      },
      { property: "og:title", content: "The Universe — Maram's AI Portfolio" },
      {
        property: "og:description",
        content: "AI projects, skills, certifications and contact.",
      },
    ],
    links: [{ rel: "canonical", href: "/universe" }],
  }),
  component: Universe,
});

function Universe() {
  const [active, setActive] = useState<SectionKey>("universe");
  const [project, setProject] = useState<Project | null>(null);

  const handleChange = (key: SectionKey) => {
    setActive(key);
    if (typeof window !== "undefined")
      window.scrollTo({ top: 0, behavior: "auto" });
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      <div className="pointer-events-none fixed inset-0">
        <StarField count={70} />
        <div className="absolute inset-x-0 bottom-0 h-[55vh] bg-spotlight opacity-60" />
        <div className="absolute -left-40 top-1/4 h-96 w-96 rounded-full bg-accent/10 blur-[120px]" />
        <div className="absolute -right-40 top-1/2 h-96 w-96 rounded-full bg-primary/10 blur-[120px]" />
      </div>

      <Navbar active={active} onChange={handleChange} />

      <main className="relative z-10 pt-16">
        <AnimatePresence mode="wait">
          <motion.section
            key={active}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -18 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          >
            {active === "universe" && (
              <UniverseSection
                onNavigate={handleChange}
                onOpenProject={setProject}
              />
            )}
            {active === "about" && <AboutSection />}
            {active === "works" && (
              <WorksSection onOpenProject={setProject} />
            )}
            {active === "contact" && <ContactSection />}
          </motion.section>
        </AnimatePresence>
      </main>

      <ProjectModal project={project} onClose={() => setProject(null)} />
    </div>
  );
}