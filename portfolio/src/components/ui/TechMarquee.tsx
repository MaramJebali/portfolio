// components/ui/TechMarquee.tsx
import { motion, useAnimation } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import { 
  SiReact, 
  SiNextdotjs, 
  SiTypescript,
  SiJavascript,
  SiPython,
  SiNodedotjs,
  SiExpress,
  SiMongodb,
  SiPostgresql,
  SiDocker,
  SiGit,
  SiTailwindcss,
  SiHtml5,
  SiVuedotjs,
  SiAngular,
  SiCplusplus,
  SiGo,
  SiRuby,
  SiPhp,
  SiSwift,
  SiKotlin,
  SiRust,
  SiGraphql,
  SiRedis,
  SiElasticsearch,
  SiApachekafka,
  SiNginx,
  SiFirebase,
  SiSupabase,
  SiPrisma,
  SiMysql,
  SiWebpack,
  SiBabel,
  SiSass,
  SiBootstrap,
  SiChakraui,
  SiAntdesign,
  SiFigma,
  SiVercel,
  SiNetlify,
  SiHeroku,
  SiDigitalocean,
  SiGithub,
  SiGitlab,
  SiBitbucket,
  SiJira,
  SiTrello,
  SiSlack,
  SiDiscord,
} from "react-icons/si";

// Map technology names to their actual logos
const techIconMap: Record<string, React.ReactNode> = {
  // Frontend
  "React": <SiReact className="w-6 h-6 text-[#61DAFB]" />,
  "Next.js": <SiNextdotjs className="w-6 h-6 text-white" />,
  "TypeScript": <SiTypescript className="w-6 h-6 text-[#3178C6]" />,
  "JavaScript": <SiJavascript className="w-6 h-6 text-[#F7DF1E]" />,
  "HTML": <SiHtml5 className="w-6 h-6 text-[#E34F26]" />,
  "Tailwind": <SiTailwindcss className="w-6 h-6 text-[#06B6D4]" />,
  "Vue": <SiVuedotjs className="w-6 h-6 text-[#4FC08D]" />,
  "Angular": <SiAngular className="w-6 h-6 text-[#DD0031]" />,
  "Sass": <SiSass className="w-6 h-6 text-[#CC6699]" />,
  "Bootstrap": <SiBootstrap className="w-6 h-6 text-[#7952B3]" />,
  "Chakra UI": <SiChakraui className="w-6 h-6 text-[#319795]" />,
  "Ant Design": <SiAntdesign className="w-6 h-6 text-[#0170FE]" />,
  
  // Backend
  "Python": <SiPython className="w-6 h-6 text-[#3776AB]" />,
  "Node": <SiNodedotjs className="w-6 h-6 text-[#339933]" />,
  "Express": <SiExpress className="w-6 h-6 text-white" />,
  "Java": <span className="text-xl">☕</span>, // Fixed: SiJava doesn't exist
  "C": <span className="text-xl">⚙️</span>, // Fixed: SiC doesn't exist
  "C++": <SiCplusplus className="w-6 h-6 text-[#00599C]" />,
  "Go": <SiGo className="w-6 h-6 text-[#00ADD8]" />,
  "Ruby": <SiRuby className="w-6 h-6 text-[#CC0000]" />, // Fixed: Changed from SiRubyonrails
  "PHP": <SiPhp className="w-6 h-6 text-[#777BB4]" />,
  "Swift": <SiSwift className="w-6 h-6 text-[#F05138]" />,
  "Kotlin": <SiKotlin className="w-6 h-6 text-[#7F52FF]" />,
  "Rust": <SiRust className="w-6 h-6 text-[#000000]" />,
  
  // Database
  "MongoDB": <SiMongodb className="w-6 h-6 text-[#47A248]" />,
  "PostgreSQL": <SiPostgresql className="w-6 h-6 text-[#4169E1]" />,
  "MySQL": <SiMysql className="w-6 h-6 text-[#4479A1]" />,
  "Redis": <SiRedis className="w-6 h-6 text-[#DC382D]" />,
  "Elastic": <SiElasticsearch className="w-6 h-6 text-[#005571]" />,
  "Firebase": <SiFirebase className="w-6 h-6 text-[#FFCA28]" />,
  "Supabase": <SiSupabase className="w-6 h-6 text-[#3ECF8E]" />,
  
  // ORM & Tools
  "Prisma": <SiPrisma className="w-6 h-6 text-[#2D3748]" />,
  "GraphQL": <SiGraphql className="w-6 h-6 text-[#E10098]" />,
  "Webpack": <SiWebpack className="w-6 h-6 text-[#8DD6F9]" />,
  "Babel": <SiBabel className="w-6 h-6 text-[#F9DC3E]" />,
  
  // DevOps & Cloud
  "Docker": <SiDocker className="w-6 h-6 text-[#2496ED]" />,
  "AWS": <span className="text-xl">☁️</span>, // Fixed: SiAmazonaws doesn't exist
  "Kafka": <SiApachekafka className="w-6 h-6 text-[#231F20]" />,
  "Nginx": <SiNginx className="w-6 h-6 text-[#009639]" />,
  "Vercel": <SiVercel className="w-6 h-6 text-white" />,
  "Netlify": <SiNetlify className="w-6 h-6 text-[#00C7B7]" />,
  "Heroku": <SiHeroku className="w-6 h-6 text-[#430098]" />,
  "DigitalOcean": <SiDigitalocean className="w-6 h-6 text-[#0080FF]" />,
  
  // Version Control
  "Git": <SiGit className="w-6 h-6 text-[#F05032]" />,
  "GitHub": <SiGithub className="w-6 h-6 text-white" />,
  "GitLab": <SiGitlab className="w-6 h-6 text-[#FC6D26]" />,
  "Bitbucket": <SiBitbucket className="w-6 h-6 text-[#0052CC]" />,
  
  // Design & Collaboration
  "Figma": <SiFigma className="w-6 h-6 text-[#F24E1E]" />,
  "Adobe": <span className="text-xl">🎨</span>, // Fixed: SiAdobe doesn't exist
  "Jira": <SiJira className="w-6 h-6 text-[#0052CC]" />,
  "Trello": <SiTrello className="w-6 h-6 text-[#0052CC]" />,
  "Slack": <SiSlack className="w-6 h-6 text-[#4A154B]" />,
  "Discord": <SiDiscord className="w-6 h-6 text-[#5865F2]" />,
};

interface TechMarqueeProps {
  skillGroups: Array<{
    title: string;
    items: string[];
  }>;
}

export function TechMarquee({ skillGroups }: TechMarqueeProps) {
  const [isPaused, setIsPaused] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const controls = useAnimation();

  // Flatten all skills from all groups
  const allSkills = skillGroups.flatMap((group) => 
    group.items.map((skill) => ({
      name: skill,
      logo: techIconMap[skill] || <span className="text-2xl">📦</span>,
    }))
  );

  // Triple the array for seamless infinite scroll
  const duplicatedSkills = [...allSkills, ...allSkills, ...allSkills];

  // Auto-scroll animation
  useEffect(() => {
    if (!isPaused && !isDragging && duplicatedSkills.length > 0) {
      controls.start({
        x: ["0%", "-33.33%"],
        transition: {
          duration: 40,
          ease: "linear",
          repeat: Infinity,
        },
      });
    } else {
      controls.stop();
    }
  }, [isPaused, isDragging, controls, duplicatedSkills.length]);

  // Mouse drag handlers
  const [dragStartX, setDragStartX] = useState(0);
  const [currentX, setCurrentX] = useState(0);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStartX(e.clientX);
    controls.stop();
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && containerRef.current) {
      const delta = e.clientX - dragStartX;
      setDragStartX(e.clientX);
      setCurrentX((prev) => prev + delta);
      containerRef.current.style.transform = `translateX(${currentX + delta}px)`;
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    if (!isPaused) {
      controls.start({
        x: ["0%", "-33.33%"],
        transition: {
          duration: 40,
          ease: "linear",
          repeat: Infinity,
        },
      });
    }
  };

  return (
    <div className="w-full overflow-hidden rounded-2xl border border-border/50 bg-background/30 backdrop-blur-sm py-4">
      <div className="relative">
        {/* Left gradient fade */}
        <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-background/90 to-transparent z-10 pointer-events-none" />
        
        {/* Right gradient fade */}
        <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-background/90 to-transparent z-10 pointer-events-none" />
        
        <div
          ref={containerRef}
          className="relative overflow-hidden cursor-grab active:cursor-grabbing py-3"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => {
            setIsPaused(false);
            if (isDragging) {
              setIsDragging(false);
            }
          }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
        >
          <motion.div
            className="flex gap-12 items-center"
            animate={controls}
            style={{ 
              width: `${duplicatedSkills.length * 180}px`,
              display: 'flex',
              alignItems: 'center',
            }}
          >
            {duplicatedSkills.map((skill, index) => (
              <motion.div
                key={`${skill.name}-${index}`}
                className="group flex flex-col items-center gap-2 px-3 py-2 rounded-xl border-2 border-transparent hover:border-primary/50 transition-all duration-300 hover:scale-110"
                whileHover={{
                  scale: 1.15,
                  borderColor: "rgba(139, 92, 246, 0.6)",
                  backgroundColor: "rgba(139, 92, 246, 0.08)",
                  boxShadow: "0 0 30px rgba(139, 92, 246, 0.15)",
                }}
                onClick={() => {
                  console.log(`Selected: ${skill.name}`);
                }}
              >
                <div className="flex items-center justify-center w-12 h-12">
                  {skill.logo}
                </div>
                <span className="text-[0.6rem] font-mono uppercase tracking-wider text-foreground/70 whitespace-nowrap group-hover:text-foreground transition-colors">
                  {skill.name}
                </span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
      
      {/* Controls hint */}
      <div className="mt-3 text-center">
        <p className="text-[0.55rem] font-mono uppercase tracking-[0.2em] text-muted-foreground/40">
          ← Drag to explore → • Hover to pause
        </p>
      </div>
    </div>
  );
}