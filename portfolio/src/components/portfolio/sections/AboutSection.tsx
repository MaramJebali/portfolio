import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ComponentType,
  type CSSProperties,
  type RefObject,
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
  Workflow,
  Server,
  Zap,
  LucideInfinity,
  BrainCircuit,
  ImageIcon,
  PenTool,
  Film,
  Video,
  Camera,
  Hexagon,
  BookOpen,
  Mic,
  FileSearch,
} from "lucide-react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { CertificationModal } from "@/components/portfolio/CertificationModal";
import { StarField } from "@/components/portfolio/StarField";
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
  SiGithubactions,
  SiGitlab,
  SiJenkins,
  SiHtml5,
  SiCss,
  SiApachehadoop,
  SiDjango,
  SiReact,
  SiStreamlit,
  SiGit,
  SiUnity,
  SiMistralai,
  SiDocker,
  SiFastapi,
  SiCelery,
  SiNextdotjs,
  SiTailwindcss,
  SiFigma,
  SiPostgresql,
  SiMongodb,
  SiNeo4J,
  SiVercel,
  SiRender,
  SiArduino,
  SiHedera,
  SiGithub,
} from "react-icons/si";
import {
  profile,
  certifications,
  hederaCertifications,
  experiences,
} from "@/data/portfolio";
import profileImage from "@/assets/profile.jpg";
import sahhatekHome from "@/assets/projets/sahhatek/01-homes.jpg";
import deepseaHome from "@/assets/projets/deepsea/01-home.jpg";
import sahhatekTeam from "@/assets/projets/sahhatek/06-team.jpg";
import deepseaTeam from "@/assets/projets/deepsea/07-team.jpg";
import certif1 from "@/assets/certificates/certif6.png";
import certif2 from "@/assets/certificates/certif5.png";
import certif3 from "@/assets/certificates/certif4.png";
import certif4 from "@/assets/certificates/certif3.png";
import certif5 from "@/assets/certificates/certif2.png";
import certif6 from "@/assets/certificates/certif1.png";
import hederaHbf from "@/assets/certificates/hedera-hbf.pdf";
import hederaHcf from "@/assets/certificates/hedera-hcf.pdf";
import hederaHcda from "@/assets/certificates/hedera-hcda.pdf";
import { HeroManifesto, FlippingImagePill } from "@/components/ui/HeroManifesto";

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
  hederaHcda,
  hederaHbf,
  hederaHcf,
];

/* certification credentials shown in the modal, NVIDIA row + Hedera row */
const allCertifications = [...certifications, ...hederaCertifications];

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
  /* languages */
  Python: { Icon: SiPython, color: "#4B8BBE" },
  JavaScript: { Icon: SiJavascript, color: "#F7DF1E" },
  TypeScript: { Icon: SiTypescript, color: "#4B9BE8" },
  SQL: { Icon: Database, color: "#7DB3E0" },
  C: { Icon: SiC, color: "#A8B9CC" },
  "C++": { Icon: SiCplusplus, color: "#8FB4E3" },
  Java: { Icon: SiOpenjdk, color: "#F89820" },
  /* data */
  PostgreSQL: { Icon: SiPostgresql, color: "#5B9BD5" },
  MongoDB: { Icon: SiMongodb, color: "#47A248" },
  Neo4j: { Icon: SiNeo4J, color: "#008CC1" },
  ChromaDB: { Icon: Database, color: "#86EFAC" },
  Qdrant: { Icon: Hexagon, color: "#DC382D" },
  "Power BI": { Icon: BarChart3, color: "#F2C811" },
  SSIS: { Icon: Workflow, color: "#7DB3E0" },
  SSMS: { Icon: Database, color: "#7DB3E0" },
  /* ML & deep learning */
  PyTorch: { Icon: SiPytorch, color: "#EE4C2C" },
  TensorFlow: { Icon: SiTensorflow, color: "#FF8F1F" },
  "scikit-learn": { Icon: SiScikitlearn, color: "#F7931E" },
  OpenCV: { Icon: SiOpencv, color: "#7C66F0" },
  YOLOv8: { Icon: SiPytorch, color: "#EE4C2C" },
  Transformers: { Icon: SiHuggingface, color: "#FFD21E" },
  "Hugging Face": { Icon: SiHuggingface, color: "#FFD21E" },
  "Whisper.cpp": { Icon: Mic, color: "#C084FC" },
  pandas: { Icon: SiPandas, color: "#E70488" },
  NumPy: { Icon: SiNumpy, color: "#6C9BEA" },
  Matplotlib: { Icon: BarChart3, color: "#5FA8D3" },
  /* agentic & gen AI */
  LangGraph: { Icon: SiLanggraph, color: "#6BAF7D" },
  LangChain: { Icon: SiLangchain, color: "#4CC3A5" },
  LangSmith: { Icon: SiLangchain, color: "#8E84F0" },
  Ollama: { Icon: SiOllama, color: "#FFFFFF" },
  "NVIDIA NIM": { Icon: SiNvidia, color: "#76B900" },
  RAG: { Icon: BookOpen, color: "#F472B6" },
  RAGAS: { Icon: FileSearch, color: "#4ADE80" },
  FAISS: { Icon: Search, color: "#A3E635" },
  Groq: { Icon: Zap, color: "#F55036" },
  Mistral: { Icon: SiMistralai, color: "#FF7000" },
  /* cloud, devops & mlops */
  AWS: { Icon: Server, color: "#FF9900" },
  Docker: { Icon: SiDocker, color: "#2496ED" },
  MLOps: { Icon: BrainCircuit, color: "#A78BFA" },
  DevOps: { Icon: LucideInfinity, color: "#7DD3FC" },
  "GitHub Actions": { Icon: SiGithubactions, color: "#2088FF" },
  "GitLab CI": { Icon: SiGitlab, color: "#FC6D26" },
  Jenkins: { Icon: SiJenkins, color: "#D33833" },
  Hadoop: { Icon: SiApachehadoop, color: "#FFC107" },
  Vercel: { Icon: SiVercel, color: "#FFFFFF" },
  Render: { Icon: SiRender, color: "#8B78F6" },
  /* backend */
  FastAPI: { Icon: SiFastapi, color: "#00A38D" },
  Django: { Icon: SiDjango, color: "#44B78B" },
  Celery: { Icon: SiCelery, color: "#A9CC54" },
  "REST APIs": { Icon: Plug, color: "#A78BFA" },
  Git: { Icon: SiGit, color: "#F05032" },
  /* frontend */
  React: { Icon: SiReact, color: "#61DAFB" },
  "Next.js": { Icon: SiNextdotjs, color: "#FFFFFF" },
  "Tailwind CSS": { Icon: SiTailwindcss, color: "#38BDF8" },
  HTML: { Icon: SiHtml5, color: "#E34F26" },
  CSS: { Icon: SiCss, color: "#1572B6" },
  Figma: { Icon: SiFigma, color: "#F24E1E" },
  Streamlit: { Icon: SiStreamlit, color: "#FF4B4B" },
  Unity: { Icon: SiUnity, color: "#FFFFFF" },
  Arduino: { Icon: SiArduino, color: "#00979D" },
  /* adobe suite */
  Photoshop: { Icon: ImageIcon, color: "#31A8FF" },
  Illustrator: { Icon: PenTool, color: "#FF9A00" },
  "After Effects": { Icon: Film, color: "#8B8BF5" },
  "Premiere Pro": { Icon: Video, color: "#B58CF6" },
  InDesign: { Icon: BookOpen, color: "#FF3366" },
};

const skillCategories = [
  {
    title: "Languages",
    items: ["Python", "JavaScript", "TypeScript", "SQL", "C", "C++", "Java"],
  },
  {
    title: "Data",
    items: [
      "PostgreSQL",
      "MongoDB",
      "Neo4j",
      "Hadoop",
      "ChromaDB",
      "Qdrant",
      "Power BI",
      "SSIS",
      "SSMS",
    ],
  },
  {
    title: "ML & Deep Learning",
    items: [
      "PyTorch",
      "TensorFlow",
      "scikit-learn",
      "OpenCV",
      "YOLOv8",
      "Transformers",
      "Whisper.cpp",
      "pandas",
      "NumPy",
      "Matplotlib",
    ],
  },
  {
    title: "Agentic & Gen AI",
    items: [
      "LangGraph",
      "LangChain",
      "LangSmith",
      "Ollama",
      "NVIDIA NIM",
      "Hugging Face",
      "RAG",
      "RAGAS",
      "FAISS",
      "Groq",
      "Mistral",
    ],
  },
  {
    title: "Cloud, DevOps & MLOps",
    items: ["AWS", "Docker", "MLOps", "DevOps", "Vercel", "Render"],
  },
  {
    title: "GitOps & CI/CD",
    items: ["GitHub Actions", "GitLab CI", "Jenkins"],
  },
  {
    title: "Backend",
    items: ["FastAPI", "Django", "Celery", "REST APIs", "Git"],
  },
  {
    title: "Frontend & design",
    items: [
      "HTML",
      "CSS",
      "React",
      "Next.js",
      "Tailwind CSS",
      "Figma",
      "Streamlit",
      "Unity",
      "Arduino",
    ],
  },
  {
    title: "Design & Montage",
    items: [
      "Photoshop",
      "Illustrator",
      "After Effects",
      "Premiere Pro",
      "InDesign",
    ],
  },
];

const CV_LANGUAGES = [
  {
    lang: "en",
    label: "English",
    flag: "🇬🇧",
    href: "/cv-en.pdf",
    file: "Maram_jebali_eng.pdf",
  },
  {
    lang: "fr",
    label: "Français",
    flag: "🇫🇷",
    href: "/cv-fr.pdf",
    file: "Maram_jebali_fr.pdf",
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

/* ---------- Skill tile — paper-ink card, flips violet on hover ---------- */
/* Violet backdrop tints for the folders (navbar family, no lime) */
const SK_BG_PLAIN =
  "linear-gradient(180deg, rgba(12,6,40,0.66) 0%, rgba(24,12,66,0.56) 100%)";
const SK_BG_SOFT =
  "linear-gradient(115deg, rgba(167,139,250,0.20) 0%, rgba(255,255,255,0.05) 40%, rgba(139,92,246,0.24) 100%), linear-gradient(180deg, rgba(12,6,40,0.66) 0%, rgba(24,12,66,0.56) 100%)";
const SK_BG_STRONG =
  "linear-gradient(115deg, rgba(139,92,246,0.38) 0%, rgba(124,58,237,0.30) 55%, rgba(91,33,182,0.32) 100%), linear-gradient(180deg, rgba(12,6,40,0.70) 0%, rgba(24,12,66,0.60) 100%)";

function SkillTile({ name }: { name: string }) {
  const entry = skillIcons[name];
  const Icon = entry?.Icon;

  return (
    <div className="sk-tile" title={name}>
      <span className="sk-ic" style={{ color: entry?.color ?? "#5b21b6" }}>
        {Icon ? (
          <Icon style={{ transition: "transform .5s cubic-bezier(.16,1,.3,1)" }} />
        ) : (
          <span className="font-mono text-[1rem] leading-none">{name.slice(0, 2)}</span>
        )}
      </span>
      <span className="px-1 leading-tight">{name}</span>
    </div>
  );
}

/* ---------- Skill folder — group panel with tab, tilt & corner marks ---------- */
function SkillFolder({
  category,
  index,
}: {
  category: { title: string; items: string[] };
  index: number;
}) {
  const ref = useRef<HTMLDivElement>(null);

  const bg =
    index === 2 ? SK_BG_STRONG : index % 2 === 0 ? SK_BG_SOFT : SK_BG_PLAIN;

  function onMove(e: React.PointerEvent) {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const u = (e.clientX - r.left) / r.width - 0.5;
    const v = (e.clientY - r.top) / r.height - 0.5;
    el.style.setProperty("--ry", `${(u * 7).toFixed(2)}deg`);
    el.style.setProperty("--rx", `${(-v * 7).toFixed(2)}deg`);
  }

  function onLeave() {
    const el = ref.current;
    if (!el) return;
    el.style.setProperty("--rx", "0deg");
    el.style.setProperty("--ry", "0deg");
  }

  return (
    <div className="sk-folder" ref={ref} style={{ ["--sk-bg" as string]: bg }} onPointerMove={onMove} onPointerLeave={onLeave} data-sk-folder>
      <div className="sk-tab">
        <span>
          {String(index + 1).padStart(2, "0")} {category.title.toUpperCase()}
        </span>
      </div>
      <span className="sk-plus" aria-hidden>+</span>
      <span className="sk-plus" aria-hidden>+</span>
      <div className="sk-grid">
        {category.items.map((name) => (
          <SkillTile key={name} name={name} />
        ))}
      </div>
    </div>
  );
}


/* ---------- Scroll velocity skew — Farah's section sway (main@94860) ---------- */
/* c = clamp(dv*-.06, -1.6, 1.6); sv = (sv+(c-sk)*.08)*.82; sk += sv      */
function SkillScrollSway({
  containerRef,
}: {
  containerRef: RefObject<HTMLDivElement | null>;
}) {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const el = containerRef.current;
    if (!el) return;
    let raf = 0;
    let last = window.scrollY;
    let sk = 0;
    let sv = 0;

    const loop = () => {
      const sy = window.scrollY;
      const dv = sy - last;
      last = sy;
      if (window.innerWidth >= 900) {
        const c = Math.max(-1.6, Math.min(1.6, dv * -0.06));
        sv = (sv + (c - sk) * 0.08) * 0.82;
        sk += sv;
        el.style.setProperty("--sk", sk.toFixed(3));
        el.style.setProperty("--sc", (Math.abs(sk) * 0.006).toFixed(4));
      } else if (sk !== 0) {
        sk = 0;
        sv = 0;
        el.style.setProperty("--sk", "0");
        el.style.setProperty("--sc", "0");
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      el.style.removeProperty("--sk");
      el.style.removeProperty("--sc");
    };
  }, [containerRef]);

  return null;
}

/* ---------- Crosshair cursor + live coordinates (scoped to the toolbox) ---------- */
function SkillCrosshair({
  containerRef,
}: {
  containerRef: RefObject<HTMLDivElement | null>;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const state = useRef({ mx: 0, my: 0, px: -100, py: -100, vis: false, fr: 0 });
  const inZone = useRef(false);

  useEffect(() => {
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    const el = ref.current;
    const zone = containerRef.current;
    if (!el || !zone) return;

    const s = state.current;
    const coords = el.querySelector(".sk-coord");
    let raf = 0;

    const onMove = (e: PointerEvent) => {
      s.mx = e.clientX;
      s.my = e.clientY;
      const r = zone.getBoundingClientRect();
      inZone.current =
        e.clientX >= r.left && e.clientX <= r.right &&
        e.clientY >= r.top && e.clientY <= r.bottom;
    };
    const onOver = (e: Event) => {
      const t = e.target as Element | null;
      s.vis = !!t?.closest?.("[data-sk-folder]");
    };

    document.addEventListener("pointermove", onMove, { passive: true });
    zone.addEventListener("pointerover", onOver);

    let last = "";
    const loop = () => {
      s.px += (s.mx - s.px) * 0.4; /* same easing as the reference (lerp 0.4) */
      s.py += (s.my - s.py) * 0.4;
      const tx = `translate(${s.px.toFixed(1)}px,${s.py.toFixed(1)}px)`;
      if (tx !== last) { last = tx; el.style.transform = tx; }
      const active = inZone.current;
      const op = active ? "1" : "0";
      if (el.style.opacity !== op) el.style.opacity = op;
      const hv = active && s.vis;
      if (el.classList.contains("hv") !== hv) el.classList.toggle("hv", hv);
      if (++s.fr % 3 === 0) {
        const txt =
          String(Math.round(s.mx)).padStart(3, "0") + "," +
          String(Math.round(s.my + window.scrollY)).padStart(4, "0");
        if (coords && coords.textContent !== txt) coords.textContent = txt;
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener("pointermove", onMove);
      zone.removeEventListener("pointerover", onOver);
    };
  }, [containerRef]);

  /* fixed, inline (no portal — portals into <body> break under this app's SSR/hydration) */
  return (
    <div className="sk-cur" ref={ref} aria-hidden>
      <i />
      <b className="sk-coord">000,0000</b>
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

/* NVIDIA brand green vs Hedera violet — per-issuer accents on cert cards */
const HEDERA_VIOLET = "#8b5cf6";
function certBrand(issuer: string) {
  return /hashgraph|hedera/i.test(issuer)
    ? { Icon: SiHedera, color: HEDERA_VIOLET, accent: "139,92,246" }
    : { Icon: SiNvidia, color: NVIDIA_GREEN, accent: "118,185,0" };
}

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
  const { Icon, color, accent } = certBrand(cert.issuer);

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
          ? `rgba(${accent},0.45)`
          : "rgba(255,255,255,0.14)",
        transform: isHovered ? "translateY(-4px)" : "translateY(0)",
        boxShadow: isHovered
          ? `0 24px 55px -22px rgba(${accent},0.35), 0 1px 0 rgba(255,255,255,0.16) inset`
          : "0 1px 0 rgba(255,255,255,0.10) inset",
      }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span
            className="grid h-11 w-11 place-items-center rounded-xl border transition-all duration-300"
            style={{
              borderColor: isHovered
                ? `rgba(${accent},0.5)`
                : "rgba(255,255,255,0.14)",
              background: isHovered
                ? `rgba(${accent},0.10)`
                : "rgba(255,255,255,0.03)",
              boxShadow: isHovered
                ? `0 0 22px -8px rgba(${accent},0.75) inset`
                : "none",
            }}
          >
            <Icon
              className="h-6 w-6 transition-transform duration-300 motion-reduce:transition-none"
              style={{
                color: color,
                transform: isHovered ? "scale(1.1)" : "scale(1)",
              }}
            />
          </span>
          <div className="leading-tight">
            <p className="font-mono text-[0.62rem] uppercase tracking-[0.26em] text-white/65">
              {cert.issuer === "NVIDIA" ? "NVIDIA" : "HASHGRAPH"}
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
            color: isHovered ? `rgba(${accent},0.95)` : "rgba(255,255,255,0.45)",
          }}
        >
          View credential
        </p>
        <ArrowUpRight
          className="h-4 w-4 transition-all duration-300 motion-reduce:transition-none"
          style={{
            color: isHovered ? color : "rgba(255,255,255,0.45)",
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
  label,
  duration = 55,
  onSelect,
}: {
  items: Certification[];
  label: string;
  duration?: number;
  onSelect: (index: number) => void;
}) {
  const doubled = [...items, ...items];
  const brand = /hashgraph|hedera/i.test(items[0]?.issuer ?? "")
    ? "139,92,246"
    : "118,185,0";

  return (
    <div className="space-y-2" data-cert-row>
      <div className="flex items-center gap-2 px-1">
        <div className="group/label relative">
          <h4 className="cursor-help font-mono text-[0.8rem] font-semibold uppercase tracking-[0.14em] text-white select-none">
            {label}
          </h4>

          {/* hover popup — count + certificate names */}
          <div
            role="tooltip"
            className="pointer-events-none absolute left-0 top-full z-30 mt-2 w-max max-w-[280px] origin-top-left scale-95 rounded-xl border p-4 opacity-0 backdrop-blur-2xl transition-all duration-200 group-hover/label:scale-100 group-hover/label:opacity-100"
            style={{
              borderColor: `rgba(${brand},0.35)`,
              backgroundImage: [GLASS_TINT, GLASS_BASE_CARD].join(", "),
              boxShadow: `0 24px 55px -22px rgba(${brand},0.4), 0 1px 0 rgba(255,255,255,0.12) inset`,
            }}
          >
            <p
              className="font-mono text-[0.55rem] uppercase tracking-[0.26em]"
              style={{ color: `rgba(${brand},0.95)` }}
            >
              {items.length} {items.length === 1 ? "certificate" : "certificates"}
            </p>
            <ul className="mt-2 space-y-1.5">
              {items.map((cert) => (
                <li
                  key={cert.credentialId}
                  className="font-display text-[0.85rem] italic leading-snug text-white/85"
                >
                  {cert.title}
                </li>
              ))}
            </ul>
          </div>
        </div>
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
/* ---------- About manifesto — HeroManifesto design merged into the
   About paragraph: bold sans words, blur/rise reveal, inline flipping
   image pills anchored to the sentence's key ideas. ---------- */

function MWord({ children }: { children: React.ReactNode }) {
  return (
    <span className="manifesto-element inline-block mr-[0.18em] leading-[1.35] will-change-[transform,opacity,filter]">
      {children}
    </span>
  );
}

const ABOUT_PILL_IMAGES = {
  handsOn: [sahhatekHome, deepseaHome],
  team: [sahhatekTeam, deepseaTeam],
};

function AboutManifesto() {
  const containerRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let ctx: gsap.Context | undefined;
    const elements =
      containerRef.current?.querySelectorAll(".manifesto-element") || [];

    gsap.set(elements, { y: 28, opacity: 0, filter: "blur(10px)", scale: 0.97 });

    const start = () => {
      ctx = gsap.context(() => {
        gsap.to(elements, {
          y: 0,
          opacity: 1,
          filter: "blur(0px)",
          scale: 1,
          duration: 0.9,
          stagger: 0.035,
          ease: "power3.out",
        });
      }, containerRef);
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          start();
          observer.disconnect();
        }
      },
      { threshold: 0.2 },
    );
    if (containerRef.current) observer.observe(containerRef.current);
    const fallback = window.setTimeout(start, 2500);

    return () => {
      observer.disconnect();
      window.clearTimeout(fallback);
      ctx?.revert();
    };
  }, []);

  const pill =
    "h-9 w-14 sm:h-10 sm:w-16 md:h-12 md:w-[4.5rem] align-[-0.35em]";

  return (
    <div
      ref={containerRef}
      className="font-display text-[clamp(1.35rem,2.2vw,2rem)] leading-[1.45] text-white/88"
    >
      <MWord>Hi!</MWord>
      <MWord>I</MWord>
      <MWord>believe</MWord>
      <MWord>that</MWord>
      <MWord>I</MWord>
      <MWord>thrive</MWord>
      <MWord>when</MWord>
      <MWord>tackling</MWord>
      <FlippingImagePill images={ABOUT_PILL_IMAGES.handsOn} index={1} className={pill} />
      <MWord>hands-on</MWord>
      <MWord>projects</MWord>
      <MWord>and</MWord>
      <MWord>exploring</MWord>
      <MWord>innovative</MWord>
      <MWord>approaches</MWord>
      <MWord>to</MWord>
      <MWord>sustainability.</MWord>
      <br className="hidden md:block" />
      <MWord>I</MWord>
      <MWord>am</MWord>
      <MWord>eager</MWord>
      <MWord>to</MWord>
      <MWord>contribute</MWord>
      <MWord>my</MWord>
      <MWord>creativity,</MWord>
      <MWord>technical</MWord>
      <MWord>skills,</MWord>
      <MWord>and</MWord>
      <MWord>enthusiasm</MWord>
      <MWord>to</MWord>
      <FlippingImagePill images={ABOUT_PILL_IMAGES.team} index={3} className={pill} />
      <MWord>collaborative</MWord>
      <MWord>projects,</MWord>
      <MWord>while</MWord>
      <MWord>challenging</MWord>
      <MWord>myself</MWord>
      <MWord>to</MWord>
      <MWord>grow</MWord>
      <MWord>beyond</MWord>
      <MWord>my</MWord>
      <MWord>current</MWord>
      <MWord>limits.</MWord>
    </div>
  );
}

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

  const triggerBase =
    "inline-flex min-h-[44px] cursor-pointer items-center gap-2.5 rounded-full border px-6 py-2.5 font-mono text-[0.8rem] font-semibold uppercase tracking-[0.14em] transition-all duration-300";

  const pastel = {
    backgroundImage:
      "linear-gradient(170deg, #ccdcf9, #f6dfec 60%, #f0d7ea)",
    borderColor: "rgba(10,13,28,0.22)",
    color: "#0a0d1c",
  };

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div ref={ref} className="relative z-30 inline-block">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-haspopup="menu"
          aria-expanded={open}
          className={`${triggerBase} hover:-translate-y-0.5`}
          style={pastel}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.8}
            stroke="currentColor"
            className="h-4 w-4"
            aria-hidden
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3"
            />
          </svg>
          {status === "downloading"
            ? "Downloading…"
            : status === "done"
              ? "Downloaded"
              : "Download CV"}
          <ChevronDown
            aria-hidden
            className={`h-4 w-4 transition-transform duration-300 ${
              open ? "rotate-180" : ""
            }`}
          />
        </button>

        {open && (
          <div
            role="menu"
            className="absolute left-0 top-full z-50 mt-2 w-60 overflow-hidden rounded-2xl border"
            style={{
              backgroundImage: pastel.backgroundImage,
              borderColor: "rgba(10,13,28,0.22)",
              boxShadow:
                "0 24px 55px -22px rgba(10,13,28,0.55), inset 0 1px 0 rgba(255,255,255,0.5)",
            }}
          >
            <p className="border-b border-[#0a0d1c]/10 px-4 py-2.5 font-mono text-[0.62rem] uppercase tracking-[0.2em] text-[#0a0d1c]/60">
              Choose your CV language
            </p>
            {CV_LANGUAGES.map((opt) => (
              <a
                key={opt.lang}
                role="menuitem"
                href={opt.href}
                download={opt.file}
                onClick={(e) => {
                  e.preventDefault();
                  download(opt);
                }}
                className="flex w-full items-center justify-between gap-3 border-b border-[#0a0d1c]/5 px-4 py-3.5 text-left font-sans text-[0.95rem] text-[#0a0d1c]/85 transition-colors last:border-b-0 hover:bg-white/50 hover:text-[#0a0d1c] focus-visible:bg-white/50 focus-visible:outline-none"
              >
                <span className="flex items-center gap-2.5">
                  <span aria-hidden className="text-base">{opt.flag}</span>
                  <span className="font-semibold">{opt.label}</span>
                  <span className="font-mono text-[0.6rem] uppercase tracking-[0.18em] text-[#0a0d1c]/45">
                    CV · {opt.lang.toUpperCase()}
                  </span>
                </span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.8}
                  stroke="currentColor"
                  className="h-4 w-4 text-[#0a0d1c]/60"
                  aria-hidden
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3"
                  />
                </svg>
              </a>
            ))}
          </div>
        )}
      </div>

      <a
        href={profile.contact.github}
        target="_blank"
        rel="noreferrer"
        className={`${triggerBase} hover:-translate-y-0.5`}
        style={pastel}
        aria-label="Open GitHub profile"
      >
        <SiGithub className="h-4 w-4" aria-hidden />
        GitHub
      </a>
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
  const skillsRef = useRef<HTMLDivElement>(null);

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

            <div data-cascade className="mt-8 max-w-[58ch]">
              <AboutManifesto />
            </div>

            <div data-cascade className="relative z-30 mt-10">
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
          <div
            ref={skillsRef}
            className="mt-14 grid grid-cols-1 gap-16 lg:grid-cols-2 lg:items-start lg:gap-12"
          >
            {skillCategories.map((category, index) => (
              <div
                key={category.title}
                data-skill-row
                className={index % 2 === 1 ? "lg:mt-14" : undefined}
              >
                <SkillFolder category={category} index={index} />
              </div>
            ))}
            <SkillCrosshair containerRef={skillsRef} />
            <SkillScrollSway containerRef={skillsRef} />
          </div>
        </section>

        {/* ---------- CERTIFICATIONS ---------- */}
        <section className={SECTION_GAP} aria-label="Certifications">
          <SectionHeading
            lead="Certifications"
            accent="& credentials"
            sub="NVIDIA and Hashgraph-issued certificates. Select one to view the full credential."
          />
          <div className="relative mt-10 space-y-10">
            <CertificationRow
              items={certifications}
              label="AI & Deep Learning"
              duration={55}
              onSelect={setSelectedCertIndex}
            />
            <CertificationRow
              items={hederaCertifications}
              label="Blockchain & Hedera"
              duration={65}
              onSelect={(i) => setSelectedCertIndex(certifications.length + i)}
            />
          </div>
        </section>

        <CertificationModal
          certifications={allCertifications}
          images={certificationImages}
          currentIndex={selectedCertIndex}
          onClose={() => setSelectedCertIndex(null)}
          onNavigate={setSelectedCertIndex}
        />
      </div>
    </div>
  );
}