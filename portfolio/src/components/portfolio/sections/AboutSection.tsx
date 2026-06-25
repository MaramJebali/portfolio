import { useRef, useState, type ComponentType } from "react";
import { createPortal } from "react-dom";
import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useSpring,
  AnimatePresence,
} from "motion/react";
import { Award, BadgeCheck, Sparkles, X } from "lucide-react";
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
import ButtonCV from "@/components/ui/Button-cv";

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
    items: ["Python", "JavaScript", "TypeScript", "SQL", "C","C++", "Java"],
  },
  {
    title: "AI / Machine Learning",
    items: ["PyTorch", "TensorFlow", "scikit-learn", "Transformers", "OpenCV", "YOLOv8"],
  },
  {
    title: "LLMs & Agents",
    items: ["LangChain", "LangGraph", "LangSmith", "RAG / GraphRAG", "FAISS", "Groq", "NVIDIA NIM", "Ollama", "Mistral"],
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
        boxShadow: isHovered && entry?.color ? `0 0 20px ${entry.color}33` : undefined,
        backgroundColor: isHovered ? 'rgba(0,0,0,0.9)' : 'rgba(0,0,0,0.8)',
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {Icon ? (
        <Icon
          className="h-5 w-5 shrink-0 transition-all duration-300 group-hover/chip:scale-110"
          style={{ 
            color: isHovered ? entry.color : entry.color,
            filter: isHovered ? `drop-shadow(0 0 8px ${entry.color}66)` : undefined,
          }}
        />
      ) : (
        <Sparkles className="h-5 w-5 shrink-0 text-violet-glow" />
      )}
      <span 
        className="whitespace-nowrap text-sm font-medium transition-colors duration-300"
        style={{
          color: isHovered && entry?.color ? entry.color : 'rgba(255,255,255,0.85)',
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
  reverse = false 
}: { 
  category: { title: string; items: string[] };
  duration: number;
  reverse?: boolean;
}) {
  const doubled = [...category.items, ...category.items];
  
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 px-1">
        <h4 
          className="font-mono text-xs uppercase tracking-[0.2em] text-white select-none"
          style={{
            textShadow: '0 0 10px rgba(255,255,255,0.3), 0 0 20px rgba(255,255,255,0.1)',
          }}
        >
          {category.title}
        </h4>
        <span className="flex-1 border-t border-white/10" />
        <span 
          className="font-mono text-[0.6rem] text-white/40"
          style={{
            textShadow: '0 0 10px rgba(255,255,255,0.2), 0 0 20px rgba(255,255,255,0.05)',
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
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white/40" />
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

/* ---------- CERTIFICATION CARD (Larger, No Text) ---------- */
function CertificationCard({ 
  cert, 
  index 
}: { 
  cert: typeof certifications[0];
  index: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
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

  const handleClick = () => {
    setIsExpanded(true);
  };

  const handleClose = () => {
    setIsExpanded(false);
  };

  // Use .png format to match your images
  const imagePath = `/src/assets/certificates/certif${index + 1}.png`;

  return (
    <>
      {/* Card - Double size */}
      <div className="[perspective:1200px] flex-shrink-0 w-[380px]">
        <motion.div
          ref={ref}
          onMouseMove={onMove}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={onLeave}
          onClick={handleClick}
          style={{ 
            rotateX: rx, 
            rotateY: ry, 
            transformStyle: "preserve-3d",
            cursor: 'pointer',
          }}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          className="group relative w-full rounded-2xl border border-border/30 bg-black/80 p-3 backdrop-blur transition-all duration-300 hover:border-primary/40 hover:shadow-[0_0_40px_rgba(120,100,255,0.15)]"
        >
          {/* Glow following cursor */}
          <motion.div
            aria-hidden
            style={{ background: glow }}
            className="pointer-events-none absolute inset-0 z-10 rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          />
          
          {/* Image Container - Larger */}
          <div className="relative overflow-hidden rounded-xl aspect-[4/3]">
            <img
              src={imagePath}
              alt={cert.title}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
              draggable={false}
              onError={(e) => {
                // Fallback if image doesn't exist
                (e.target as HTMLImageElement).src = '/placeholder-cert.png';
              }}
            />
            {/* Gradient veil */}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
            
            {/* Corner brackets */}
            <span className="pointer-events-none absolute left-2 top-2 h-5 w-5 border-l-2 border-t-2 border-white/20" />
            <span className="pointer-events-none absolute right-2 top-2 h-5 w-5 border-r-2 border-t-2 border-white/20" />
            <span className="pointer-events-none absolute bottom-2 left-2 h-5 w-5 border-b-2 border-l-2 border-white/20" />
            <span className="pointer-events-none absolute bottom-2 right-2 h-5 w-5 border-b-2 border-r-2 border-white/20" />
          </div>

          {/* Hover indicator - only visible on hover */}
          <div 
            className="absolute bottom-4 right-4 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
            style={{ transform: "translateZ(30px)" }}
          >
            <span className="text-[0.5rem] font-mono uppercase tracking-[0.1em] text-white/40 bg-black/50 px-2 py-1 rounded backdrop-blur">
              Click to expand ✦
            </span>
          </div>
        </motion.div>
      </div>

      {/* Expanded Modal - Using Portal to render outside the scrolling container */}
      {isExpanded && createPortal(
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-xl p-4"
            onClick={handleClose}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: "spring", damping: 20 }}
              className="relative max-w-4xl w-full rounded-2xl border border-white/10 bg-black/90 p-4 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close button */}
              <button
                onClick={handleClose}
                className="absolute -top-3 -right-3 z-10 rounded-full bg-black/80 border border-white/20 p-2 text-white/60 hover:text-white transition-colors duration-300"
              >
                <X className="h-5 w-5" />
              </button>

              {/* Expanded Image */}
              <div className="relative overflow-hidden rounded-xl">
                <img
                  src={imagePath}
                  alt={cert.title}
                  className="w-full h-auto max-h-[80vh] object-contain"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/placeholder-cert.png';
                  }}
                />
              </div>

              {/* Certification Info overlay */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-6 pt-12">
                <h3 className="text-lg font-display text-white/90">
                  {cert.title}
                </h3>
                <div className="mt-1 flex flex-wrap items-center gap-3">
                  <span className="flex items-center gap-1.5 font-mono text-[0.6rem] uppercase tracking-[0.15em] text-white/60">
                    <BadgeCheck className="h-3.5 w-3.5 text-violet-glow" />
                    {cert.issuer}
                  </span>
                  <span className="text-white/20">·</span>
                  <span className="font-mono text-[0.6rem] text-white/40">
                    {cert.issued}
                  </span>
                  <span className="text-white/20">·</span>
                  <span className="font-mono text-[0.5rem] text-white/30">
                    ID: {cert.credentialId}
                  </span>
                </div>
              </div>

              {/* Close hint */}
              <p className="mt-3 text-center font-mono text-[0.55rem] uppercase tracking-[0.2em] text-white/30">
                Click outside to close
              </p>
            </motion.div>
          </motion.div>
        </AnimatePresence>,
        document.body
      )}
    </>
  );
}

/* ---------- CERTIFICATION ROW (Scrolling like skills) ---------- */
function CertificationRow({ 
  certifications, 
  duration = 40 
}: { 
  certifications: any[];
  duration?: number;
}) {
  const doubled = [...certifications, ...certifications];
  
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 px-1">
        <h4 
          className="font-mono text-xs uppercase tracking-[0.2em] text-white select-none"
          style={{
            textShadow: '0 0 10px rgba(255,255,255,0.3), 0 0 20px rgba(255,255,255,0.1)',
          }}
        >
          Credentials
        </h4>
        <span className="flex-1 border-t border-white/10" />
        <span 
          className="font-mono text-[0.6rem] text-white/40"
          style={{
            textShadow: '0 0 10px rgba(255,255,255,0.2), 0 0 20px rgba(255,255,255,0.05)',
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
            />
          ))}
        </div>
      </div>
    </div>
  );
}

/* ---------- MAIN ABOUT SECTION ---------- */
export function AboutSection() {
  const [status, setStatus] = useState<'idle' | 'downloading' | 'done'>('idle');

  const handleDownload = async () => {
    if (status === 'downloading') return;
    setStatus('downloading');
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      const link = document.createElement('a');
      link.href = '/cv.pdf';
      link.download = 'Maram_CV.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setStatus('done');
      setTimeout(() => setStatus('idle'), 2500);
    } catch (error) {
      console.error('Download failed:', error);
      setStatus('idle');
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8 sm:py-24">
      {/* Intro */}
      <div className="grid items-center gap-10 lg:grid-cols-[1fr_0.85fr]">
        <div>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="font-display text-4xl text-white sm:text-5xl select-none"
            style={{
              textShadow: '0 0 20px rgba(255,255,255,0.15), 0 0 40px rgba(255,255,255,0.05)',
            }}
          >
            More about{" "}
            <span className="italic text-white/60">myself</span>
          </motion.h2>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mt-7 text-base leading-relaxed text-white/80 select-none"
            style={{
              textShadow: '0 0 10px rgba(255,255,255,0.1), 0 0 20px rgba(255,255,255,0.05)',
            }}
          >
            {profile.about}
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-8"
          >
            <ButtonCV 
              text="Get Resume"
              isLoading={status === 'downloading'}
              status={status}
              onClick={handleDownload}
            />
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-8 flex flex-wrap gap-3 font-mono text-[0.7rem] uppercase tracking-[0.15em]"
          >
            <span 
              className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-white/80 backdrop-blur"
              style={{
                textShadow: '0 0 10px rgba(255,255,255,0.1)',
              }}
            >
              {profile.role}
            </span>
            <span 
              className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-white/80 backdrop-blur"
              style={{
                textShadow: '0 0 10px rgba(255,255,255,0.1)',
              }}
            >
              {profile.school}
            </span>
            <span 
              className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-white/80 backdrop-blur"
              style={{
                textShadow: '0 0 10px rgba(255,255,255,0.1)',
              }}
            >
              {profile.location}
            </span>
          </motion.div>
        </div>

        <ProfileCard />
      </div>

      {/* Skills - Categorized Scrolling Rows */}
      <div className="mt-20">
        <h3 className="font-display text-3xl text-white sm:text-4xl select-none"
          style={{
            textShadow: '0 0 20px rgba(255,255,255,0.1), 0 0 40px rgba(255,255,255,0.05)',
          }}
        >
          What I work <span className="italic text-white/60">with</span>
        </h3>
        
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mt-3 font-mono text-[0.65rem] uppercase tracking-[0.2em] text-white/50 select-none"
          style={{
            textShadow: '0 0 10px rgba(255,255,255,0.1), 0 0 20px rgba(255,255,255,0.05)',
          }}
        >
          Each category scrolls independently — hover to pause
        </motion.p>

        <div className="relative mt-8 flex flex-col gap-6">
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

      {/* Certifications - New Design with Larger Cards */}
      <div className="mt-20">
        <h3 className="font-display text-3xl text-white sm:text-4xl select-none"
          style={{
            textShadow: '0 0 20px rgba(255,255,255,0.1), 0 0 40px rgba(255,255,255,0.05)',
          }}
        >
          Certifications{" "}
          <span className="italic text-white/60">& credentials</span>
        </h3>
        
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mt-3 font-mono text-[0.65rem] uppercase tracking-[0.2em] text-white/50 select-none"
          style={{
            textShadow: '0 0 10px rgba(255,255,255,0.1), 0 0 20px rgba(255,255,255,0.05)',
          }}
        >
          Click any card to expand — hover to pause
        </motion.p>

        <div className="relative mt-8">
          <CertificationRow 
            certifications={certifications} 
            duration={45}
          />
        </div>
      </div>
    </div>
  );
}