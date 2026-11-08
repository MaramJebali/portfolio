/* Brand logos for the stack tiles (Case file "Built with").   */
/* react-icons/si ships the Simple Icons set — pick per tech.  */
import type { IconType } from "react-icons";
import {
  SiDjango,
  SiReact,
  SiNextdotjs,
  SiTypescript,
  SiJavascript,
  SiPython,
  SiTailwindcss,
  SiTensorflow,
  SiKeras,
  SiPytorch,
  SiOpencv,
  SiLangchain,
  SiLanggraph,
  SiHuggingface,
  SiGooglegemini,
  SiMistralai,
  SiNvidia,
  SiPostgresql,
  SiDocker,
  SiGit,
  SiGithub,
  SiUnity,
  SiQt,
  SiArduino,
  SiMysql,
  SiCplusplus,
  SiStreamlit,
  SiFramer,
  SiVite,
  SiFastapi,
  SiScikitlearn,
} from "react-icons/si";

/** lower-case substring → brand icon */
const MAP: [string, IconType][] = [
  ["django", SiDjango],
  ["drf", SiDjango],
  ["rest framework", SiDjango],
  ["react", SiReact],
  ["next.js", SiNextdotjs],
  ["typescript", SiTypescript],
  ["javascript", SiJavascript],
  ["python", SiPython],
  ["tailwind", SiTailwindcss],
  ["tensorflow", SiTensorflow],
  ["keras", SiKeras],
  ["pytorch", SiPytorch],
  ["efficientnet", SiPytorch],
  ["densenet", SiPytorch],
  ["opencv", SiOpencv],
  ["langchain", SiLangchain],
  ["langgraph", SiLanggraph],
  ["hugging", SiHuggingface],
  ["gemini", SiGooglegemini],
  ["mistral", SiMistralai],
  ["nvidia", SiNvidia],
  ["nim", SiNvidia],
  ["groq", SiNvidia],
  ["llama", SiMistralai],
  ["postgres", SiPostgresql],
  ["neon", SiPostgresql],
  ["qdrant", SiPython], // no Qdrant glyph in this set — generic python mark
  ["chroma", SiLangchain],
  ["faiss", SiPython],
  ["docker", SiDocker],
  ["git", SiGithub], // longest-substring match keeps github = SiGithub
  ["github", SiGithub],
  ["unity", SiUnity],
  ["qt", SiQt],
  ["arduino", SiArduino],
  ["oracle", SiMysql],
  ["mysql", SiMysql],
  ["sql", SiMysql],
  ["odbc", SiMysql],
  ["c++", SiCplusplus],
  ["streamlit", SiStreamlit],
  ["framer", SiFramer],
  ["motion", SiFramer],
  ["vite", SiVite],
  ["fastapi", SiFastapi],
  ["scikit", SiScikitlearn],
  ["transformers", SiHuggingface],
  ["agents ia", SiLanggraph],
  ["multi-agent", SiLanggraph],
  ["rag", SiLangchain],
  ["chatbot", SiLangchain],
  ["power bi", SiStreamlit],
  ["bi", SiStreamlit],
];

export function findTechIcon(tech: string): IconType | undefined {
  const t = tech.toLowerCase();
  // longest substring wins so "github" beats "git"
  const hits = MAP.filter(([k]) => t.includes(k));
  if (!hits.length) return undefined;
  hits.sort((a, b) => b[0].length - a[0].length);
  return hits[0][1];
}
