import { useLayoutEffect, useRef, useState, type ComponentType } from "react";
import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useSpring,
} from "motion/react";
import { Sparkles } from "lucide-react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { CertificationModal } from "@/components/portfolio/CertificationModal";
import { StarField as RawStarField } from "@/components/portfolio/StarField";
import {
  SiPython,
  SiJavascript,
  SiTypescript,
  SiC,
  SiCplusplus,
  SiOpenjdk,
  SiMysql,
  SiPytorch,
  SiTensorflow,
  SiScikitlearn,
  SiHuggingface,
  SiOpencv,
  SiLangchain,
  SiLanggraph,
  SiNvidia,
  SiOllama,
  SiPandas,
  SiNumpy,
  SiDjango,
  SiReact,
  SiStreamlit,
  SiGit,
  SiUnity,
  SiGraphql,
  SiPlotly,
  SiMistralai,
} from "react-icons/si";
import { profile, certifications } from "@/data/portfolio";
import profileImage from "@/assets/profile.jpg";
import certif1 from "@/assets/certificates/certif6.png";
import certif2 from "@/assets/certificates/certif5.png";
import certif3 from "@/assets/certificates/certif4.png";
import certif4 from "@/assets/certificates/certif3.png";
import certif5 from "@/assets/certificates/certif2.png";
import certif6 from "@/assets/certificates/certif1.png";
import ButtonCV from "@/components/ui/Button-cv";
import { HeroManifesto } from "@/components/ui/HeroManifesto";
import { SectionEyebrow } from "@/components/ui/SectionEyebrow";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const certificationImages = [
  certif1,
  certif2,
  certif3,
  certif4,
  certif5,
  certif6,
];

type StarFieldProps = { count: number };
const StarField = RawStarField as unknown as ComponentType<StarFieldProps>;
const ABOUT_STARFIELD_OPACITY = 0.35;

/* ---------- skill → logo mapping ---------- */
type IconType = ComponentType<{
  className?: string;
  style?: React.CSSProperties;
}>;

const skillIcons: Record<string, { Icon: IconType; color: string }> = {
  Python: { Icon: SiPython, color: "#3776AB" },
  JavaScript: { Icon: SiJavascript, color: "#F7DF1E" },
  TypeScript: { Icon: SiTypescript, color: "#3178C6" },
  SQL: { Icon: SiMysql, color: "#4479A1" },
  C: { Icon: SiC, color: "#A8B9CC" },
  Cplusplus: { Icon: SiCplusplus, color: "#a9bed6" },
  Java: { Icon: SiOpenjdk, color: "#F89820" },
  PyTorch: { Icon: SiPytorch, color: "#EE4C2C" },
  TensorFlow: { Icon: SiTensorflow, color: "#FF6F00" },
  "scikit-learn": { Icon: SiScikitlearn, color: "#F7931E" },
  Transformers: { Icon: SiHuggingface, color: "#FFD21E" },
  OpenCV: { Icon: SiOpencv, color: "#5C3EE8" },
  YOLOv8: { Icon: SiPytorch, color: "#EE4C2C" },
  LangChain: { Icon: SiLangchain, color: "#1C3C3C" },
  LangGraph: { Icon: SiLanggraph, color: "#2F6B5E" },
  LangSmith: { Icon: SiLangchain, color: "#5A4FCF" },
  "RAG / GraphRAG": { Icon: SiGraphql, color: "#E10098" },
  FAISS: { Icon: SiNvidia, color: "#76B900" },
  Groq: { Icon: SiNvidia, color: "#F55036" },
  "NVIDIA NIM": { Icon: SiNvidia, color: "#76B900" },
  Ollama: { Icon: SiOllama, color: "#FFFFFF" },
  Mistral: { Icon: SiMistralai, color: "#FF7000" },
  "Power BI": { Icon: SiPlotly, color: "#F2C811" },
  SSIS: { Icon: SiMysql, color: "#4479A1" },
  SSMS: { Icon: SiMysql, color: "#4479A1" },
  Pandas: { Icon: SiPandas, color: "#150458" },
  NumPy: { Icon: SiNumpy, color: "#4D77CF" },
  Matplotlib: { Icon: SiPlotly, color: "#11557C" },
  Django: { Icon: SiDjango, color: "#44B78B" },
  React: { Icon: SiReact, color: "#61DAFB" },
  Streamlit: { Icon: SiStreamlit, color: "#FF4B4B" },
  Git: { Icon: SiGit, color: "#F05032" },
  "REST APIs": { Icon: SiGraphql, color: "#A78BFA" },
  Unity: { Icon: SiUnity, color: "#FFFFFF" },
};

/* ---------- SKILL CATEGORIES ---------- */
const skillCategories = [
  {
    title: "Languages",
    items: ["Python", "JavaScript", "TypeScript", "SQL", "C", "C++", "Java"],
  },
  {
    title: "AI / Machine Learning",
    items: [
      "PyTorch",
      "TensorFlow",
      "scikit-learn",
      "Transformers",
      "OpenCV",
      "YOLOv8",
    ],
  },
  {
    title: "LLMs & Agents",
    items: [
      "LangChain",
      "LangGraph",
      "LangSmith",
      "RAG / GraphRAG",
      "FAISS",
      "Groq",
      "NVIDIA NIM",
      "Ollama",
      "Mistral",
    ],
  },
  {
    title: "Data & BI",
    items: ["Power BI", "SSIS", "SSMS", "Pandas", "NumPy", "Matplotlib"],
  },
  {
    title: "Web & Tools",
    items: ["Django", "React", "Streamlit", "Git", "REST APIs", "Unity"],
  },
];

function SkillChip({ name }: { name: string }) {
  const entry = skillIcons[name];
  const Icon = entry?.Icon;
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="group/chip flex shrink-0 items-center gap-2.5 rounded-xl border border-border/30 bg-black/80 px-4 py-2.5 backdrop-blur transition-all duration-300 hover:border-primary/50"
      style={{
        borderColor: isHovered && entry?.color ? entry.color : undefined,
        boxShadow:
          isHovered && entry?.color ? `0 0 20px ${entry.color}33` : undefined,
        backgroundColor: isHovered ? "rgba(0,0,0,0.9)" : "rgba(0,0,0,0.8)",
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {Icon ? (
        <Icon
          className="h-5 w-5 shrink-0 transition-all duration-300 group-hover/chip:scale-110"
          style={{
            color: entry.color,
            filter: isHovered
              ? `drop-shadow(0 0 8px ${entry.color}66)`
              : undefined,
          }}
        />
      ) : (
        <Sparkles className="h-5 w-5 shrink-0 text-violet-glow" />
      )}
      <span
        className="whitespace-nowrap text-sm font-medium transition-colors duration-300"
        style={{
          color:
            isHovered && entry?.color ? entry.color : "rgba(255,255,255,0.85)",
          opacity: isHovered ? 1 : 0.85,
        }}
      >
        {name}
      </span>
    </div>
  );
}

function SkillCategoryRow({
  category,
  duration,
  reverse = false,
}: {
  category: { title: string; items: string[] };
  duration: number;
  reverse?: boolean;
}) {
  const doubled = [...category.items, ...category.items];

  return (
    <div className="space-y-2" data-skill-row>
      <div className="flex items-center gap-2 px-1">
        <h4
          className="font-mono text-xs uppercase tracking-[0.2em] text-white select-none"
          style={{
            textShadow:
              "0 0 10px rgba(255,255,255,0.3), 0 0 20px rgba(255,255,255,0.1)",
          }}
        >
          {category.title}
        </h4>
        <span className="flex-1 border-t border-white/10" />
        <span
          className="font-mono text-[0.6rem] text-white/40"
          style={{
            textShadow:
              "0 0 10px rgba(255,255,255,0.2), 0 0 20px rgba(255,255,255,0.05)",
          }}
        >
          {category.items.length}
        </span>
      </div>
      <div className="marquee-track marquee-mask overflow-hidden py-1">
        <div
          className="animate-marquee flex w-max gap-3"
          style={{
            ["--marquee-duration" as string]: `${duration}s`,
            animationDirection: reverse ? "reverse" : "normal",
          }}
        >
          {doubled.map((name, i) => (
            <SkillChip key={`${category.title}-${name}-${i}`} name={name} />
          ))}
        </div>
      </div>
    </div>
  );
}

/* ---------- 3D tilt profile card ---------- */
function ProfileCard() {
  const ref = useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = useState(false);
  const rx = useSpring(useMotionValue(0), { stiffness: 150, damping: 18 });
  const ry = useSpring(useMotionValue(0), { stiffness: 150, damping: 18 });

  function onMove(e: React.MouseEvent) {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    ry.set((px - 0.5) * 16);
    rx.set((0.5 - py) * 16);
  }
  function onLeave() {
    rx.set(0);
    ry.set(0);
    setHovered(false);
  }

  return (
    <div className="[perspective:1200px]">
      <motion.div
        ref={ref}
        onMouseMove={onMove}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={onLeave}
        style={{ rotateX: rx, rotateY: ry, transformStyle: "preserve-3d" }}
        className="group relative mx-auto w-full max-w-sm rounded-3xl border border-border/50 bg-card p-3 shadow-[var(--shadow-card)] transition-shadow duration-300 hover:shadow-xl"
      >
        <div className="relative overflow-hidden rounded-2xl">
          <img
            src={profileImage}
            alt={`${profile.name} — ${profile.role}`}
            className="aspect-[3/4] w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
            draggable={false}
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background/80 via-background/5 to-transparent" />
          <div
            className="pointer-events-none absolute inset-0 opacity-0 mix-blend-overlay transition-opacity duration-300 group-hover:opacity-100"
            style={{
              backgroundImage:
                "linear-gradient(115deg, transparent 30%, rgba(255,255,255,0.08) 45%, rgba(255,255,255,0.06) 55%, transparent 70%)",
            }}
          />
          <div
            className="absolute left-3 top-3 flex items-center gap-2 rounded-md border border-white/10 bg-background/60 px-2 py-1 font-mono text-[0.55rem] uppercase tracking-[0.2em] text-white/60 backdrop-blur"
            style={{ transform: "translateZ(40px)" }}
          >
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-magic-mint/70" />
            About
          </div>
          <div
            className="absolute inset-x-3 bottom-3"
            style={{ transform: "translateZ(55px)" }}
          >
            <p className="font-display text-3xl italic leading-none text-white/90 drop-shadow-lg">
              {profile.name}
            </p>
            <p className="mt-1.5 font-mono text-[0.6rem] uppercase tracking-[0.25em] text-white/60 drop-shadow-lg">
              {profile.role}
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

/* ---------- CERTIFICATION CARD ---------- */
function CertificationCard({
  cert,
  index,
  onOpen,
}: {
  cert: (typeof certifications)[0];
  index: number;
  onOpen: (index: number) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const rx = useSpring(useMotionValue(0), { stiffness: 150, damping: 18 });
  const ry = useSpring(useMotionValue(0), { stiffness: 150, damping: 18 });
  const gx = useMotionValue(50);
  const gy = useMotionValue(50);
  const glow = useMotionTemplate`radial-gradient(circle at ${gx}% ${gy}%, oklch(0.7 0.22 300 / 0.25), transparent 55%)`;

  function onMove(e: React.MouseEvent) {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    ry.set((px - 0.5) * 12);
    rx.set((0.5 - py) * 12);
    gx.set(px * 100);
    gy.set(py * 100);
  }
  function onLeave() {
    rx.set(0);
    ry.set(0);
    setIsHovered(false);
  }

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    onOpen(index);
  };

  const imagePath = certificationImages[index] || certificationImages[0];

  return (
    <motion.button
      type="button"
      className="[perspective:1200px] flex-shrink-0 w-[380px] cursor-pointer text-left"
      onClick={handleClick}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
    >
      <motion.div
        ref={ref}
        onMouseMove={onMove}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={onLeave}
        style={{ rotateX: rx, rotateY: ry, transformStyle: "preserve-3d" }}
        className="group relative w-full rounded-2xl border border-border/30 bg-black/80 p-3 backdrop-blur transition-all duration-300 hover:border-primary/40 hover:shadow-[0_0_40px_rgba(120,100,255,0.15)]"
      >
        <motion.div
          aria-hidden
          style={{ background: glow }}
          className="pointer-events-none absolute inset-0 z-10 rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        />

        <div className="relative overflow-hidden rounded-xl aspect-[4/3]">
          <img
            src={imagePath}
            alt={cert.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
            draggable={false}
            onError={(e) => {
              (e.target as HTMLImageElement).src = "/placeholder-cert.png";
            }}
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
          <span className="pointer-events-none absolute left-2 top-2 h-5 w-5 border-l-2 border-t-2 border-white/20" />
          <span className="pointer-events-none absolute right-2 top-2 h-5 w-5 border-r-2 border-t-2 border-white/20" />
          <span className="pointer-events-none absolute bottom-2 left-2 h-5 w-5 border-b-2 border-l-2 border-white/20" />
          <span className="pointer-events-none absolute bottom-2 right-2 h-5 w-5 border-b-2 border-r-2 border-white/20" />
        </div>

        <div
          className="absolute bottom-4 right-4 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          style={{ transform: "translateZ(30px)" }}
        >
          <span className="text-[0.5rem] font-mono uppercase tracking-[0.1em] text-white/40 bg-black/50 px-2 py-1 rounded backdrop-blur">
            Click to expand ✦
          </span>
        </div>
      </motion.div>
    </motion.button>
  );
}

function CertificationRow({
  certifications,
  duration = 40,
  onSelect,
}: {
  certifications: any[];
  duration?: number;
  onSelect: (index: number) => void;
}) {
  const doubled = [...certifications, ...certifications];

  return (
    <div className="space-y-2" data-cert-row>
      <div className="flex items-center gap-2 px-1">
        <h4
          className="font-mono text-xs uppercase tracking-[0.2em] text-white select-none"
          style={{
            textShadow:
              "0 0 10px rgba(255,255,255,0.3), 0 0 20px rgba(255,255,255,0.1)",
          }}
        >
          Credentials
        </h4>
        <span className="flex-1 border-t border-white/10" />
        <span
          className="font-mono text-[0.6rem] text-white/40"
          style={{
            textShadow:
              "0 0 10px rgba(255,255,255,0.2), 0 0 20px rgba(255,255,255,0.05)",
          }}
        >
          {certifications.length}
        </span>
      </div>
      <div className="marquee-track marquee-mask overflow-hidden py-3">
        <div
          className="animate-marquee flex w-max gap-5"
          style={{
            ["--marquee-duration" as string]: `${duration}s`,
            animationDirection: "normal",
          }}
        >
          {doubled.map((cert, i) => (
            <CertificationCard
              key={`${cert.credentialId}-${i}`}
              cert={cert}
              index={i % certifications.length}
              onOpen={onSelect}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

/* ---------- MAIN ABOUT SECTION ---------- */
export function AboutSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const cardWrapRef = useRef<HTMLDivElement>(null);
  const dividerRef = useRef<HTMLDivElement>(null);
  const rightColRef = useRef<HTMLDivElement>(null);

  const [status, setStatus] = useState<"idle" | "downloading" | "done">("idle");
  const [selectedCertIndex, setSelectedCertIndex] = useState<number | null>(
    null,
  );

  const handleDownload = async () => {
    if (status === "downloading") return;
    setStatus("downloading");
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      const link = document.createElement("a");
      link.href = "/cv.pdf";
      link.download = "Maram_CV.pdf";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setStatus("done");
      setTimeout(() => setStatus("idle"), 2500);
    } catch (error) {
      console.error("Download failed:", error);
      setStatus("idle");
    }
  };

  /* ---------- GSAP scroll choreography ---------- */
  useLayoutEffect(() => {
    const root = sectionRef.current;
    if (!root) return;

    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (prefersReduced) return;

    const ctx = gsap.context(() => {
      if (dividerRef.current) {
        gsap.fromTo(
          dividerRef.current,
          { scaleX: 0, transformOrigin: "center center", opacity: 0 },
          {
            scaleX: 1,
            opacity: 1,
            duration: 1,
            ease: "power3.inOut",
            scrollTrigger: {
              trigger: dividerRef.current,
              start: "top 88%",
              once: true,
            },
          },
        );
      }

      if (cardWrapRef.current) {
        gsap.fromTo(
          cardWrapRef.current,
          { y: 60, opacity: 0, rotateX: 8, transformPerspective: 1000 },
          {
            y: 0,
            opacity: 1,
            rotateX: 0,
            duration: 1.1,
            ease: "power3.out",
            scrollTrigger: {
              trigger: cardWrapRef.current,
              start: "top 85%",
              once: true,
            },
          },
        );

        gsap.to(cardWrapRef.current, {
          y: -50,
          ease: "none",
          scrollTrigger: {
            trigger: root,
            start: "top bottom",
            end: "bottom top",
            scrub: 0.6,
          },
        });
      }

      if (rightColRef.current) {
        const items = rightColRef.current.querySelectorAll("[data-cascade]");
        gsap.fromTo(
          items,
          { y: 24, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.7,
            stagger: 0.08,
            ease: "power3.out",
            scrollTrigger: {
              trigger: rightColRef.current,
              start: "top 82%",
              once: true,
            },
          },
        );
      }

      const skillRows = root.querySelectorAll("[data-skill-row]");
      if (skillRows.length) {
        gsap.fromTo(
          skillRows,
          { y: 32, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.8,
            stagger: 0.09,
            ease: "power3.out",
            scrollTrigger: {
              trigger: skillRows[0] as Element,
              start: "top 85%",
              once: true,
            },
          },
        );
      }

      const certRow = root.querySelector("[data-cert-row]");
      if (certRow) {
        gsap.fromTo(
          certRow,
          { y: 32, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.9,
            ease: "power3.out",
            scrollTrigger: {
              trigger: certRow,
              start: "top 85%",
              once: true,
            },
          },
        );
      }

      const headings = root.querySelectorAll("[data-heading]");
      headings.forEach((h) => {
        gsap.fromTo(
          h,
          { y: 20, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.8,
            ease: "power3.out",
            scrollTrigger: { trigger: h, start: "top 88%", once: true },
          },
        );
      });
    }, root);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={sectionRef} className="relative">
      {/* Cosmic background */}
      <motion.div
        className="fixed inset-0 z-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: ABOUT_STARFIELD_OPACITY }}
        transition={{ duration: 1.8, ease: "easeOut" }}
      >
        <StarField count={40} />
      </motion.div>

      <div className="relative z-10 mx-auto max-w-6xl px-5 py-20 sm:px-8 sm:py-28">
        {/* Animated rule only — no "01 — About" text */}
        <SectionEyebrow className="mb-12" />

        {/* Full-width manifesto — centered */}
        <div className="mb-14 flex w-full justify-center">
          <HeroManifesto
            name={profile.name}
            role={profile.role}
            location={profile.location}
            tagline="Building full-stack AI solutions."
            introImages={[profileImage]}
          />
        </div>

        {/* Divider */}
        <div
          ref={dividerRef}
          className="mb-16 h-px w-full bg-gradient-to-r from-transparent via-white/15 to-transparent"
        />

        {/* Two-column editorial block */}
        <div className="grid items-start gap-12 lg:grid-cols-[0.8fr_1fr] lg:gap-16">
          {/* Profile card */}
          <div ref={cardWrapRef}>
            <ProfileCard />
          </div>

          {/* Bio + CTA + chips */}
          <div ref={rightColRef}>
            <h2
              data-cascade
              data-heading
              className="font-display text-4xl text-white sm:text-5xl select-none"
              style={{
                textShadow:
                  "0 0 20px rgba(255,255,255,0.15), 0 0 40px rgba(255,255,255,0.05)",
              }}
            >
              More about <span className="italic text-white/60">myself</span>
            </h2>

            <p
              data-cascade
              className="mt-7 text-[0.95rem] leading-[1.85] text-magic-parchment/75 select-none"
              style={{
                textShadow: "0 0 12px rgba(255,255,255,0.06)",
              }}
            >
              {profile.about}
            </p>

            <div data-cascade className="mt-9">
              <ButtonCV
                text="Get Resume"
                isLoading={status === "downloading"}
                status={status}
                onClick={handleDownload}
              />
            </div>

            <div
              data-cascade
              className="mt-10 flex flex-col gap-3 font-mono text-[0.72rem] uppercase tracking-[0.2em]"
            >
              <div className="flex items-center gap-3 text-magic-parchment/65">
                <span className="h-1.5 w-1.5 rounded-full bg-magic-mint shadow-[0_0_10px_var(--magic-mint)]" />
                {profile.role}
              </div>
              <div className="flex items-center gap-3 text-magic-parchment/65">
                <span className="h-1.5 w-1.5 rounded-full bg-magic-gold shadow-[0_0_10px_var(--magic-gold)]" />
                {profile.school}
              </div>
              <div className="flex items-center gap-3 text-magic-parchment/65">
                <span className="h-1.5 w-1.5 rounded-full bg-magic-rose shadow-[0_0_10px_var(--magic-rose)]" />
                {profile.location}
              </div>
            </div>
          </div>
        </div>

        {/* Skills */}
        <div className="mt-24">
          <h3
            data-heading
            className="font-display text-3xl text-white sm:text-4xl select-none"
            style={{
              textShadow:
                "0 0 20px rgba(255,255,255,0.1), 0 0 40px rgba(255,255,255,0.05)",
            }}
          >
            What I work <span className="italic text-white/60">with</span>
          </h3>

          <div className="relative mt-10 flex flex-col gap-6">
            {skillCategories.map((category, index) => (
              <SkillCategoryRow
                key={category.title}
                category={category}
                duration={28 + index * 4}
                reverse={index % 2 === 1}
              />
            ))}
          </div>
        </div>

        {/* Certifications */}
        <div className="mt-24">
          <h3
            data-heading
            className="font-display text-3xl text-white sm:text-4xl select-none"
            style={{
              textShadow:
                "0 0 20px rgba(255,255,255,0.1), 0 0 40px rgba(255,255,255,0.05)",
            }}
          >
            Certifications{" "}
            <span className="italic text-white/60">& credentials</span>
          </h3>

          <div className="relative mt-10">
            <CertificationRow
              certifications={certifications}
              duration={45}
              onSelect={setSelectedCertIndex}
            />
          </div>
        </div>

        <CertificationModal
          certifications={certifications}
          images={certificationImages}
          currentIndex={selectedCertIndex}
          onClose={() => setSelectedCertIndex(null)}
          onNavigate={setSelectedCertIndex}
        />
      </div>
    </div>
  );
}