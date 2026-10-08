import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ComponentType,
  type CSSProperties,
} from "react";
import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useSpring,
} from "motion/react";
import {
  ArrowUpRight,
  BarChart3,
  Briefcase,
  ChevronDown,
  Database,
  GraduationCap,
  MapPin,
  Network,
  Plug,
  Search,
  Sparkles,
  Workflow,
  Zap,
} from "lucide-react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { CertificationModal } from "@/components/portfolio/CertificationModal";
import { StarField } from "@/components/portfolio/StarField";
import ButtonCV from "@/components/ui/Button-cv";
import type { SectionKey } from "@/components/portfolio/Navbar";
import {
  SiPython,
  SiJavascript,
  SiTypescript,
  SiC,
  SiCplusplus,
  SiOpenjdk,
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
  SiMistralai,
} from "react-icons/si";
import { profile, certifications, experiences } from "@/data/portfolio";
import profileImage from "@/assets/profile.jpg";
import certif1 from "@/assets/certificates/certif6.png";
import certif2 from "@/assets/certificates/certif5.png";
import certif3 from "@/assets/certificates/certif4.png";
import certif4 from "@/assets/certificates/certif3.png";
import certif5 from "@/assets/certificates/certif2.png";
import certif6 from "@/assets/certificates/certif1.png";
import { HeroManifesto } from "@/components/ui/HeroManifesto";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

/* ---------- FLAGS ---------- */
const SHOW_HERO = false;

const certificationImages = [
  certif1,
  certif2,
  certif3,
  certif4,
  certif5,
  certif6,
];

const ABOUT_STARFIELD_OPACITY = 0.35;

type Certification = (typeof certifications)[number];
type Experience = (typeof experiences)[number];

type IconType = ComponentType<{
  className?: string;
  style?: CSSProperties;
}>;

/* ---------- SHARED GLASS TOKENS ---------- */
const GLASS_TINT =
  "linear-gradient(115deg, rgba(245,208,254,0.18) 0%, rgba(255,255,255,0.06) 30%, rgba(219,234,254,0.22) 62%, rgba(167,139,250,0.22) 100%)";

/* Skill chips: cool monochrome blue only */
const CHIP_TINT =
  "linear-gradient(115deg, rgba(96,165,250,0.28) 0%, rgba(255,255,255,0.05) 40%, rgba(147,197,253,0.26) 70%, rgba(59,130,246,0.32) 100%)";

const GLASS_BASE_CARD =
  "linear-gradient(180deg, rgba(12,6,40,0.62) 0%, rgba(24,12,66,0.52) 100%)";
const GLASS_BASE_DEEP =
  "linear-gradient(180deg, rgba(12,6,40,0.88) 0%, rgba(24,12,66,0.80) 100%)";
const GLASS_BORDER = "rgba(255,255,255,0.18)";

const SOFT_BLUE = "rgba(219,234,254,0.8)";
const SOFT_LAVENDER = "rgba(192,132,252,0.9)";
const ACCENT_TEXT = "rgba(219,234,254,0.72)";

/* NVIDIA brand green — used only on cert cards */
const NVIDIA_GREEN = "#76B900";

const FOCUS_RING =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#c084fc]";

const SECTION_GAP = "mt-24 sm:mt-32";

/* ---------- SKILL ICONS ---------- */
const skillIcons: Record<string, { Icon: IconType; color: string }> = {
  Python: { Icon: SiPython, color: "#4B8BBE" },
  JavaScript: { Icon: SiJavascript, color: "#F7DF1E" },
  TypeScript: { Icon: SiTypescript, color: "#4B9BE8" },
  SQL: { Icon: Database, color: "#7DB3E0" },
  C: { Icon: SiC, color: "#A8B9CC" },
  "C++": { Icon: SiCplusplus, color: "#8FB4E3" },
  Java: { Icon: SiOpenjdk, color: "#F89820" },
  PyTorch: { Icon: SiPytorch, color: "#EE4C2C" },
  TensorFlow: { Icon: SiTensorflow, color: "#FF8F1F" },
  "scikit-learn": { Icon: SiScikitlearn, color: "#F7931E" },
  Transformers: { Icon: SiHuggingface, color: "#FFD21E" },
  OpenCV: { Icon: SiOpencv, color: "#7C66F0" },
  YOLOv8: { Icon: SiPytorch, color: "#EE4C2C" },
  LangChain: { Icon: SiLangchain, color: "#4CC3A5" },
  LangGraph: { Icon: SiLanggraph, color: "#4CC3A5" },
  LangSmith: { Icon: SiLangchain, color: "#8E84F0" },
  "RAG / GraphRAG": { Icon: Network, color: "#F472B6" },
  FAISS: { Icon: Search, color: "#A3E635" },
  Groq: { Icon: Zap, color: "#F55036" },
  "NVIDIA NIM": { Icon: SiNvidia, color: "#76B900" },
  Ollama: { Icon: SiOllama, color: "#FFFFFF" },
  Mistral: { Icon: SiMistralai, color: "#FF7000" },
  "Power BI": { Icon: BarChart3, color: "#F2C811" },
  SSIS: { Icon: Workflow, color: "#7DB3E0" },
  SSMS: { Icon: Database, color: "#7DB3E0" },
  Pandas: { Icon: SiPandas, color: "#E70488" },
  NumPy: { Icon: SiNumpy, color: "#6C9BEA" },
  Matplotlib: { Icon: BarChart3, color: "#5FA8D3" },
  Django: { Icon: SiDjango, color: "#44B78B" },
  React: { Icon: SiReact, color: "#61DAFB" },
  Streamlit: { Icon: SiStreamlit, color: "#FF4B4B" },
  Git: { Icon: SiGit, color: "#F05032" },
  "REST APIs": { Icon: Plug, color: "#A78BFA" },
  Unity: { Icon: SiUnity, color: "#FFFFFF" },
};

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

const CV_LANGUAGES = [
  {
    lang: "en",
    label: "English",
    flag: "🇬🇧",
    href: "/cv-en.pdf",
    file: "Maram_Achraf_CV_EN.pdf",
  },
  {
    lang: "fr",
    label: "Français",
    flag: "🇫🇷",
    href: "/cv-fr.pdf",
    file: "Maram_Achraf_CV_FR.pdf",
  },
] as const;

/* ---------- Section heading ---------- */
function SectionHeading({
  lead,
  accent,
  sub,
}: {
  lead: string;
  accent: string;
  sub?: string;
}) {
  return (
    <div data-reveal>
      <h3 className="font-display text-3xl text-white sm:text-4xl">
        {lead}{" "}
        <span className="italic" style={{ color: ACCENT_TEXT }}>
          {accent}
        </span>
      </h3>
      {sub && (
        <p className="mt-4 max-w-2xl font-sans text-[0.95rem] leading-[1.7] text-white/65">
          {sub}
        </p>
      )}
    </div>
  );
}

/* ---------- Skill chip — cool blue glass ---------- */
function SkillChip({ name, index }: { name: string; index: number }) {
  const entry = skillIcons[name];
  const Icon = entry?.Icon;
  const [isHovered, setIsHovered] = useState(false);

  const stamp = String(index + 1).padStart(2, "0");

  return (
    <div
      className="group/chip relative flex shrink-0 items-center gap-2.5 rounded-xl border px-4 py-2.5 backdrop-blur-xl transition-[transform,border-color,box-shadow] duration-300 ease-out"
      style={{
        backgroundImage: [CHIP_TINT, GLASS_BASE_CARD].join(", "),
        borderColor:
          isHovered && entry?.color ? entry.color : "rgba(255,255,255,0.10)",
        transform: isHovered ? "translateY(-2px)" : "translateY(0)",
        boxShadow: isHovered
          ? `0 14px 30px -14px ${entry?.color ?? "rgba(96,165,250,0.6)"}66, 0 1px 0 rgba(255,255,255,0.16) inset`
          : "0 1px 0 rgba(255,255,255,0.10) inset",
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <span
        className="font-mono text-[0.58rem] tabular-nums transition-colors duration-300"
        style={{
          color: isHovered
            ? "rgba(147,197,253,0.95)"
            : "rgba(255,255,255,0.32)",
        }}
      >
        {stamp}
      </span>

      <span
        aria-hidden
        className="h-3 w-px transition-colors duration-300"
        style={{
          background: isHovered
            ? "rgba(147,197,253,0.55)"
            : "rgba(255,255,255,0.12)",
        }}
      />

      {Icon ? (
        <Icon
          className="h-4 w-4 shrink-0 transition-transform duration-300 motion-reduce:transition-none"
          style={{
            color: entry.color,
            transform: isHovered ? "scale(1.12)" : "scale(1)",
          }}
        />
      ) : (
        <Sparkles className="h-4 w-4 shrink-0 text-white/50" />
      )}

      <span
        className="whitespace-nowrap font-sans text-sm font-medium transition-colors duration-300"
        style={{
          color:
            isHovered && entry?.color ? entry.color : "rgba(255,255,255,0.85)",
        }}
      >
        {name}
      </span>
    </div>
  );
}

/* ---------- Skill marquee row ---------- */
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
      <div className="flex items-baseline justify-between gap-3 px-1">
        <h4 className="font-sans text-[0.95rem] font-semibold text-white select-none">
          {category.title}
        </h4>
        <span className="font-sans text-[0.78rem] text-white/55">
          {String(category.items.length).padStart(2, "0")} tools
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
            <SkillChip
              key={`${category.title}-${name}-${i}`}
              name={name}
              index={i % category.items.length}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

/* ---------- Portrait — Mission Patch ---------- */
function GlassPortrait() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const patchRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  const gx = useMotionValue(50);
  const gy = useMotionValue(50);
  const haloX = useSpring(gx, { stiffness: 100, damping: 22 });
  const haloY = useSpring(gy, { stiffness: 100, damping: 22 });
  const halo = useMotionTemplate`radial-gradient(circle at ${haloX}% ${haloY}%, rgba(219,234,254,0.42) 0%, rgba(167,139,250,0.22) 30%, transparent 68%)`;

  function onMove(e: React.MouseEvent) {
    const el = patchRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    gx.set(((e.clientX - r.left) / r.width) * 100);
    gy.set(((e.clientY - r.top) / r.height) * 100);
  }

  useLayoutEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        el,
        { y: 40, opacity: 0, scale: 0.96 },
        {
          y: 0,
          opacity: 1,
          scale: 1,
          duration: 1.1,
          ease: "power3.out",
          scrollTrigger: { trigger: el, start: "top 90%", once: true },
        }
      );
    }, wrapRef);

    return () => ctx.revert();
  }, []);

  return (
    <div className="relative flex justify-center lg:justify-end">
      <div ref={wrapRef} className="relative will-change-transform">
        <motion.span
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-[42%] -z-10 h-[440px] w-[440px] -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{
            background: halo,
            filter: "blur(60px)",
            opacity: isHovered ? 0.95 : 0.6,
            transition: "opacity 500ms ease",
          }}
        />

        <div
          ref={patchRef}
          onMouseMove={onMove}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          className="relative mx-auto aspect-square w-[300px] sm:w-[340px] md:w-[380px]"
        >
          <svg
            viewBox="0 0 200 200"
            className="pointer-events-none absolute inset-0 h-full w-full transition-transform duration-[1200ms] ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none"
            style={{
              transform: isHovered ? "rotate(55deg)" : "rotate(0deg)",
            }}
            aria-hidden
          >
            <circle
              cx="100"
              cy="100"
              r="96"
              fill="none"
              stroke="rgba(255,255,255,0.09)"
              strokeWidth="1"
            />
            <path
              d="M 100, 4 A 96, 96 0 0 1 196, 100"
              fill="none"
              stroke="rgba(219,234,254,0.9)"
              strokeWidth="1.4"
              strokeLinecap="round"
            />
            <path
              d="M 100, 196 A 96, 96 0 0 1 4, 100"
              fill="none"
              stroke="rgba(192,132,252,0.6)"
              strokeWidth="1.1"
              strokeLinecap="round"
            />
          </svg>

          <span
            aria-hidden
            className="pointer-events-none absolute left-1/2 top-0 h-3.5 w-px -translate-x-1/2 bg-white/45"
          />
          <span
            aria-hidden
            className="pointer-events-none absolute bottom-0 left-1/2 h-3.5 w-px -translate-x-1/2 bg-white/45"
          />
          <span
            aria-hidden
            className="pointer-events-none absolute left-0 top-1/2 h-px w-3.5 -translate-y-1/2 bg-white/45"
          />
          <span
            aria-hidden
            className="pointer-events-none absolute right-0 top-1/2 h-px w-3.5 -translate-y-1/2 bg-white/45"
          />

          <div
            className="absolute inset-[18px] overflow-hidden rounded-full border backdrop-blur-2xl transition-shadow duration-500"
            style={{
              backgroundImage: [GLASS_TINT, GLASS_BASE_CARD].join(", "),
              borderColor: isHovered
                ? "rgba(219,234,254,0.5)"
                : "rgba(255,255,255,0.22)",
              boxShadow: isHovered
                ? "0 30px 80px -30px rgba(0,0,0,0.85), 0 1px 0 rgba(255,255,255,0.25) inset, 0 0 80px -18px rgba(167,139,250,0.7)"
                : "0 30px 70px -30px rgba(0,0,0,0.8), 0 1px 0 rgba(255,255,255,0.20) inset, 0 0 50px -20px rgba(167,139,250,0.5)",
            }}
          >
            <div className="h-full w-full overflow-hidden rounded-full p-3">
              <img
                src={profileImage}
                alt="Portrait of Maram Jebali"
                width={400}
                height={400}
                className="h-full w-full rounded-full object-cover transition-transform duration-700 motion-reduce:transition-none"
                style={{ transform: isHovered ? "scale(1.04)" : "scale(1)" }}
                draggable={false}
              />
            </div>

            <span
              aria-hidden
              className="pointer-events-none absolute inset-0 rounded-full opacity-35"
              style={{
                backgroundImage:
                  "repeating-conic-gradient(from 0deg, rgba(255,255,255,0.06) 0deg 1deg, transparent 1deg 30deg)",
              }}
            />
            <span
              aria-hidden
              className="pointer-events-none absolute inset-0 rounded-full"
              style={{
                background:
                  "radial-gradient(circle at 50% 120%, rgba(12,6,40,0.45) 0%, transparent 55%)",
              }}
            />
            <span
              aria-hidden
              className="pointer-events-none absolute inset-0 rounded-full"
              style={{
                background:
                  "radial-gradient(circle at 50% -20%, rgba(255,255,255,0.28) 0%, transparent 45%)",
              }}
            />
          </div>
        </div>

        {/* Caption — name below the portrait */}
        <div className="relative mt-10 text-center">
          <p className="font-display text-2xl italic leading-tight text-white md:text-[1.85rem]">
            Maram Jebali
          </p>
          <p className="mt-3 font-mono text-[0.62rem] uppercase tracking-[0.32em] text-white/60">
            {profile.role}
          </p>
          <p className="mt-2 font-mono text-[0.58rem] uppercase tracking-[0.32em] text-white/35">
            Mission № 01
          </p>
        </div>
      </div>
    </div>
  );
}

/* ---------- Experience ---------- */
const ROW_GRID =
  "grid grid-cols-[auto_1fr_auto] md:grid-cols-[150px_auto_1fr_auto] gap-4 md:gap-6";

function ExperienceItem({
  exp,
  isExpanded,
  onToggle,
  panelId,
}: {
  exp: Experience;
  isExpanded: boolean;
  onToggle: () => void;
  panelId: string;
}) {
  const period = exp.period.replace(" · 2 mos", "");
  const location = exp.location
    ?.replace(" · Hybrid", "")
    .replace(" · On-site", "");

  return (
    <div>
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isExpanded}
        aria-controls={panelId}
        className={`group w-full rounded-xl text-left transition-colors duration-300 ${FOCUS_RING}`}
      >
        <div className={`${ROW_GRID} items-start py-5 md:items-center`}>
          <span className="hidden text-right font-sans text-[0.85rem] text-white/60 transition-colors duration-300 group-hover:text-white/85 md:block">
            {period}
          </span>

          <div className="mt-2 flex w-2.5 justify-center md:mt-0">
            <span
              className={`relative z-10 h-2.5 w-2.5 rounded-full transition-all duration-300 ${
                isExpanded
                  ? "bg-white shadow-[0_0_14px_rgba(219,234,254,0.7)]"
                  : "bg-white/40 group-hover:bg-white/70"
              }`}
            />
          </div>

          <div className="flex min-w-0 items-center gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center md:h-12 md:w-12">
              <img
                src={exp.logo}
                alt=""
                width={40}
                height={40}
                className="h-8 w-8 object-contain md:h-10 md:w-10"
                loading="lazy"
              />
            </div>

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
                <p className="font-sans text-base font-semibold tracking-tight text-white md:text-[1.075rem]">
                  {exp.role}
                </p>
                {exp.current && (
                  <span
                    className="rounded-full px-2.5 py-0.5 font-sans text-[0.72rem] font-medium"
                    style={{
                      background: "rgba(219,234,254,0.16)",
                      color: "rgba(219,234,254,0.95)",
                    }}
                  >
                    Current
                  </span>
                )}
              </div>

              <p className="mt-0.5 font-sans text-[0.9rem] text-white/75">
                {exp.company}
                {location ? (
                  <span className="text-white/55"> · {location}</span>
                ) : null}
              </p>

              <p className="mt-0.5 font-sans text-[0.8rem] text-white/55 md:hidden">
                {period}
              </p>
            </div>
          </div>

          <div className="flex w-4 justify-end">
            <ChevronDown
              aria-hidden
              className={`h-4 w-4 transition-transform duration-500 ${
                isExpanded
                  ? "rotate-180 text-white/85"
                  : "text-white/50 group-hover:text-white/75"
              }`}
            />
          </div>
        </div>
      </button>

      <div
        id={panelId}
        role="region"
        aria-hidden={!isExpanded}
        className={`grid transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] ${
          isExpanded
            ? "grid-rows-[1fr] opacity-100"
            : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="overflow-hidden">
          <div className={ROW_GRID}>
            <div className="hidden md:block" />
            <div className="w-2.5" />
            <div className="pb-8">
              <div
                className={
                  exp.image
                    ? "grid gap-6 md:grid-cols-[1.2fr_1fr] md:items-start md:gap-8"
                    : ""
                }
              >
                <div>
                  <p className="max-w-[65ch] font-sans text-[0.95rem] leading-[1.75] text-white/80">
                    {exp.desc}
                  </p>

                  {exp.bullets && exp.bullets.length > 0 && (
                    <ul className="mt-5 max-w-[65ch] space-y-2.5">
                      {exp.bullets.map((b, idx) => (
                        <li
                          key={idx}
                          className="flex gap-3 font-sans text-[0.9rem] leading-[1.7] text-white/72"
                        >
                          <span
                            className="mt-[0.7rem] h-1 w-1 shrink-0 rounded-full"
                            style={{ background: "rgba(219,234,254,0.7)" }}
                          />
                          <span>{b}</span>
                        </li>
                      ))}
                    </ul>
                  )}

                  {exp.tech && exp.tech.length > 0 && (
                    <ul className="mt-6 flex flex-wrap gap-2">
                      {exp.tech.map((t, idx) => (
                        <li
                          key={idx}
                          className="rounded-md border px-2.5 py-1 font-sans text-[0.78rem] font-medium"
                          style={{
                            borderColor: "rgba(255,255,255,0.16)",
                            background: "rgba(255,255,255,0.04)",
                            color: "rgba(255,255,255,0.78)",
                          }}
                        >
                          {t}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {exp.image && (
                  <div
                    className="relative overflow-hidden rounded-2xl border"
                    style={{
                      borderColor: "rgba(255,255,255,0.12)",
                      background: "rgba(255,255,255,0.03)",
                    }}
                  >
                    <img
                      src={exp.image}
                      alt={`${exp.company} — team or project photo`}
                      className="h-full w-full object-cover"
                      style={{ aspectRatio: "4 / 3" }}
                      loading="lazy"
                      onError={(e) => {
                        const parent = (e.target as HTMLImageElement)
                          .parentElement?.parentElement;
                        if (parent) parent.style.display = "none";
                      }}
                    />
                  </div>
                )}
              </div>
            </div>
            <div className="w-4" />
          </div>
        </div>
      </div>
    </div>
  );
}

function ExperienceList() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="relative">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 left-[4.5px] w-px md:left-[178.5px]"
        style={{ background: "rgba(255,255,255,0.14)" }}
      />
      <div className="relative flex flex-col">
        {experiences.map((exp, i) => (
          <div key={`${exp.company}-${i}`} data-exp-row>
            <ExperienceItem
              exp={exp}
              panelId={`exp-panel-${i}`}
              isExpanded={openIndex === i}
              onToggle={() => setOpenIndex(openIndex === i ? null : i)}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------- Certification card — NVIDIA credential tile ---------- */
function CertificationCard({
  cert,
  index,
  total,
  onOpen,
}: {
  cert: Certification;
  index: number;
  total: number;
  onOpen: (index: number) => void;
}) {
  const [isHovered, setIsHovered] = useState(false);
  const stamp = String(index + 1).padStart(2, "0");
  const totalStamp = String(total).padStart(2, "0");

  return (
    <motion.button
      type="button"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={(e) => {
        e.preventDefault();
        onOpen(index);
      }}
      whileTap={{ scale: 0.98 }}
      aria-label={`View credential: ${cert.title}`}
      className={`group relative flex h-[250px] w-[280px] shrink-0 cursor-pointer flex-col justify-between rounded-2xl border p-5 text-left backdrop-blur-2xl transition-[border-color,transform,box-shadow] duration-300 sm:w-[300px] ${FOCUS_RING}`}
      style={{
        backgroundImage: [GLASS_TINT, GLASS_BASE_CARD].join(", "),
        borderColor: isHovered
          ? "rgba(118,185,0,0.45)"
          : "rgba(255,255,255,0.14)",
        transform: isHovered ? "translateY(-4px)" : "translateY(0)",
        boxShadow: isHovered
          ? "0 24px 55px -22px rgba(118,185,0,0.35), 0 1px 0 rgba(255,255,255,0.16) inset"
          : "0 1px 0 rgba(255,255,255,0.10) inset",
      }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span
            className="grid h-11 w-11 place-items-center rounded-xl border transition-all duration-300"
            style={{
              borderColor: isHovered
                ? "rgba(118,185,0,0.5)"
                : "rgba(255,255,255,0.14)",
              background: isHovered
                ? "rgba(118,185,0,0.10)"
                : "rgba(255,255,255,0.03)",
              boxShadow: isHovered
                ? "0 0 22px -8px rgba(118,185,0,0.75) inset"
                : "none",
            }}
          >
            <SiNvidia
              className="h-6 w-6 transition-transform duration-300 motion-reduce:transition-none"
              style={{
                color: NVIDIA_GREEN,
                transform: isHovered ? "scale(1.1)" : "scale(1)",
              }}
            />
          </span>
          <div className="leading-tight">
            <p className="font-mono text-[0.62rem] uppercase tracking-[0.26em] text-white/65">
              NVIDIA
            </p>
            <p className="mt-0.5 font-mono text-[0.55rem] uppercase tracking-[0.26em] text-white/35">
              Certificate
            </p>
          </div>
        </div>

        <span className="font-mono text-[0.55rem] tabular-nums text-white/35">
          {stamp}/{totalStamp}
        </span>
      </div>

      <p className="font-display text-xl italic leading-[1.25] text-white line-clamp-3">
        {cert.title}
      </p>

      <div className="flex items-center justify-between border-t border-white/[0.08] pt-3">
        <p
          className="font-mono text-[0.58rem] uppercase tracking-[0.24em] transition-colors duration-300"
          style={{
            color: isHovered ? "rgba(118,185,0,0.95)" : "rgba(255,255,255,0.45)",
          }}
        >
          View credential
        </p>
        <ArrowUpRight
          className="h-4 w-4 transition-all duration-300 motion-reduce:transition-none"
          style={{
            color: isHovered ? NVIDIA_GREEN : "rgba(255,255,255,0.45)",
            transform: isHovered
              ? "translate(2px, -2px)"
              : "translate(0, 0)",
          }}
        />
      </div>
    </motion.button>
  );
}

/* ---------- Certification marquee row ---------- */
function CertificationRow({
  items,
  duration = 55,
  onSelect,
}: {
  items: Certification[];
  duration?: number;
  onSelect: (index: number) => void;
}) {
  const doubled = [...items, ...items];

  return (
    <div className="space-y-2" data-cert-row>
      <div className="flex items-center gap-2 px-1">
        <h4 className="font-sans text-[0.95rem] font-semibold text-white select-none">
          Credentials
        </h4>
        <span
          className="flex-1 border-t"
          style={{ borderColor: "rgba(255,255,255,0.10)" }}
        />
        <span className="font-sans text-[0.78rem] text-white/55">
          {String(items.length).padStart(2, "0")} earned
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
              index={i % items.length}
              total={items.length}
              onOpen={onSelect}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

/* ---------- CV menu ---------- */
function InlineCVMenu() {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<"idle" | "downloading" | "done">("idle");
  const ref = useRef<HTMLDivElement>(null);
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const download = (opt: (typeof CV_LANGUAGES)[number]) => {
    setOpen(false);
    setStatus("downloading");
    const link = document.createElement("a");
    link.href = opt.href;
    link.download = opt.file;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    timer.current = window.setTimeout(() => {
      setStatus("done");
      timer.current = window.setTimeout(() => setStatus("idle"), 2200);
    }, 500);
  };

  return (
    <div ref={ref} className="relative inline-block">
      <ButtonCV
        status={status}
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        trailing={
          <ChevronDown
            aria-hidden
            className={`h-4 w-4 transition-transform duration-300 ${
              open ? "rotate-180" : ""
            }`}
          />
        }
      />

      {open && (
        <div
          role="menu"
          className="absolute left-0 top-full z-20 mt-2 w-52 overflow-hidden rounded-2xl border backdrop-blur-2xl"
          style={{
            backgroundImage: [GLASS_TINT, GLASS_BASE_DEEP].join(", "),
            borderColor: GLASS_BORDER,
            boxShadow:
              "0 22px 50px -22px rgba(0,0,0,0.7), 0 1px 0 rgba(255,255,255,0.18) inset",
          }}
        >
          <p className="border-b border-white/10 px-4 py-2.5 font-sans text-[0.78rem] text-white/60">
            Choose a language (PDF)
          </p>
          {CV_LANGUAGES.map((opt) => (
            <button
              key={opt.lang}
              type="button"
              role="menuitem"
              onClick={() => download(opt)}
              className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left font-sans text-[0.92rem] text-white/80 transition-colors hover:bg-white/[0.1] hover:text-white focus-visible:bg-white/[0.1] focus-visible:outline-none"
            >
              <span>{opt.label}</span>
              <span aria-hidden>{opt.flag}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ---------- Main ---------- */
export function AboutSection({
  onNavigate,
}: {
  onNavigate?: (key: SectionKey) => void;
}) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const leftColRef = useRef<HTMLDivElement>(null);

  const [selectedCertIndex, setSelectedCertIndex] = useState<number | null>(
    null
  );

  useLayoutEffect(() => {
    const root = sectionRef.current;
    if (!root) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const ctx = gsap.context(() => {
      if (leftColRef.current) {
        const items = leftColRef.current.querySelectorAll("[data-cascade]");
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
              trigger: leftColRef.current,
              start: "top 90%",
              once: true,
            },
          }
        );
      }

      root.querySelectorAll("[data-reveal]").forEach((el) => {
        gsap.fromTo(
          el,
          { y: 24, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.8,
            ease: "power3.out",
            scrollTrigger: { trigger: el, start: "top 90%", once: true },
          }
        );
      });

      const expRows = root.querySelectorAll("[data-exp-row]");
      if (expRows.length) {
        gsap.fromTo(
          expRows,
          { y: 20, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.7,
            stagger: 0.08,
            ease: "power2.out",
            scrollTrigger: {
              trigger: expRows[0],
              start: "top 88%",
              once: true,
            },
          }
        );
      }

      const skillRows = root.querySelectorAll("[data-skill-row]");
      if (skillRows.length) {
        gsap.fromTo(
          skillRows,
          { y: 24, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.7,
            stagger: 0.09,
            ease: "power3.out",
            scrollTrigger: {
              trigger: skillRows[0],
              start: "top 88%",
              once: true,
            },
          }
        );
      }

      const certRow = root.querySelector("[data-cert-row]");
      if (certRow) {
        gsap.fromTo(
          certRow,
          { y: 24, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.9,
            ease: "power3.out",
            scrollTrigger: { trigger: certRow, start: "top 88%", once: true },
          }
        );
      }
    }, root);

    return () => ctx.revert();
  }, []);

  const NameHeading = SHOW_HERO ? "h2" : "h1";

  return (
    <div ref={sectionRef} className="relative">
      <motion.div
        className="pointer-events-none fixed inset-0 z-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: ABOUT_STARFIELD_OPACITY }}
        transition={{ duration: 1.8, ease: "easeOut" }}
      >
        <StarField count={180} />
      </motion.div>

      <div className="relative z-10 mx-auto max-w-6xl px-5 py-24 sm:px-8 sm:py-32">
        {SHOW_HERO && (
          <div className="mb-14 flex w-full justify-center">
            <HeroManifesto
              name={profile.name}
              role={profile.role}
              location={profile.location}
              tagline="Building full-stack AI solutions."
              introImages={[profileImage]}
            />
          </div>
        )}

        <div className="grid items-center gap-16 lg:grid-cols-[1.15fr_0.85fr] lg:gap-20">
          <div ref={leftColRef}>
            <NameHeading
              data-cascade
              className="font-display text-4xl text-white sm:text-5xl select-none"
            >
              About{" "}
              <span className="italic" style={{ color: ACCENT_TEXT }}>
                me
              </span>
            </NameHeading>

            <p
              data-cascade
              className="mt-8 max-w-[58ch] font-display text-2xl leading-[1.35] text-white/88 sm:text-[1.75rem] md:text-[2rem] md:leading-[1.3]"
            >
              {profile.about}
            </p>

            <div data-cascade className="mt-10">
              <InlineCVMenu />
            </div>

            <ul
              data-cascade
              className="mt-10 flex flex-col gap-3 font-sans text-[0.95rem] text-white/75"
            >
              <li className="flex items-center gap-3">
                <Briefcase
                  aria-hidden
                  className="h-4 w-4 shrink-0"
                  style={{ color: SOFT_LAVENDER }}
                />
                {profile.role}
              </li>
              <li className="flex items-center gap-3">
                <GraduationCap
                  aria-hidden
                  className="h-4 w-4 shrink-0"
                  style={{ color: SOFT_BLUE }}
                />
                {profile.school}
              </li>
              <li className="flex items-center gap-3">
                <MapPin
                  aria-hidden
                  className="h-4 w-4 shrink-0"
                  style={{ color: "rgba(245,208,254,0.85)" }}
                />
                {profile.location}
              </li>
            </ul>
          </div>

          <GlassPortrait />
        </div>

        {/* ---------- EXPERIENCE ---------- */}
        <section className={SECTION_GAP} id="experience" aria-label="Experience">
          <SectionHeading
            lead="Work"
            accent="experience"
            sub="Select a role to see what I did and the tools I used."
          />
          <div className="mt-12">
            <ExperienceList />
          </div>
        </section>

        {/* ---------- SKILLS ---------- */}
        <section className={SECTION_GAP} aria-label="Skills">
          <SectionHeading
            lead="Skills"
            accent="& tools"
            sub="What I use day to day, grouped by area."
          />
          <div className="mt-10 flex flex-col gap-6">
            {skillCategories.map((category, index) => (
              <SkillCategoryRow
                key={category.title}
                category={category}
                duration={28 + index * 4}
                reverse={index % 2 === 1}
              />
            ))}
          </div>
        </section>

        {/* ---------- CERTIFICATIONS ---------- */}
        <section className={SECTION_GAP} aria-label="Certifications">
          <SectionHeading
            lead="Certifications"
            accent="& credentials"
            sub="NVIDIA-issued certificates. Select one to view the full credential."
          />
          <div className="relative mt-10">
            <CertificationRow
              items={certifications}
              duration={55}
              onSelect={setSelectedCertIndex}
            />
          </div>
        </section>

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