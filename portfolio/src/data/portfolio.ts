/* ==========================================================================
   PORTFOLIO DATA
   ========================================================================== */

import orangeLogo from "@/assets/exper/orange.png";
import talanLogo from "@/assets/exper/talan.png";
import valueLogo from "@/assets/exper/value.jpg";
import laPosteLogo from "@/assets/exper/laposte.webp";
import deepflowLogo from "@/assets/exper/deepflow.jpg";

// Expanded-panel images (only for DeepFlow + Talan)
import deepflowImg from "@/assets/exper/deep.jpg";
import talanImg from "@/assets/exper/talann.jpg";

/* ------------------------------------------------------------------
   Project media auto-discovery — reads src/assets/projets/<slug>/
   Images sort numerically: 1.jpg, 2.jpg, 3.jpg …
   PDFs auto-link as "presentation"
   ------------------------------------------------------------------ */
const projectImageModules = import.meta.glob(
  "@/assets/projets/**/*.{png,jpg,jpeg,webp,avif}",
  { eager: true, import: "default" },
) as Record<string, string>;

const projectPdfModules = import.meta.glob(
  "@/assets/projets/**/*.pdf",
  { eager: true, query: "?url", import: "default" },
) as Record<string, string>;

export function getProjectScreens(slug?: string): string[] {
  if (!slug) return [];
  return Object.entries(projectImageModules)
    .filter(([path]) => path.includes(`/projets/${slug}/`))
    .sort(([a], [b]) => {
      const na = a.split("/").pop() ?? "";
      const nb = b.split("/").pop() ?? "";
      return na.localeCompare(nb, undefined, {
        numeric: true,
        sensitivity: "base",
      });
    })
    .map(([, url]) => url);
}

/** Screens whose filename matches a token ("team", "award", "poster"…). */
export function getProjectMedia(slug?: string, token?: string): string[] {
  const screens = getProjectScreens(slug);
  if (!token) return screens;
  const t = token.toLowerCase();
  return screens.filter((s) => s.toLowerCase().includes(t));
}

export function getProjectPdf(slug?: string): string | undefined {
  if (!slug) return undefined;
  return Object.entries(projectPdfModules).find(([path]) =>
    path.includes(`/projets/${slug}/`),
  )?.[1];
}

/** Turns a YouTube / Vimeo watch URL into an embed URL. Returns undefined for plain mp4 links. */
export function toEmbedUrl(url?: string): string | undefined {
  if (!url) return undefined;
  const yt = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+)/);
  if (yt) {
    const start = url.match(/[?&]t=(\d+)/);
    return `https://www.youtube.com/embed/${yt[1]}${start ? `?start=${start[1]}` : ""}`;
  }
  const vimeo = url.match(/vimeo\.com\/(\d+)/);
  if (vimeo) return `https://player.vimeo.com/video/${vimeo[1]}`;
  return undefined;
}

/* ==========================================================================
   PROFILE
   ========================================================================== */

export const profile = {
  name: "Maram",
  fullName: "Maram Jebali",
  role: "AI Engineering Student",
  location: "Tunisia",
  school: "ESPRIT School of Engineering",
  tagline: {
    line1: "Crafting intelligent",
    accent: "systems,",
    line2: "one project at a time.",
  },
  intro:
    "My journey through the cosmos of AI, data and sustainability. Welcome to my little universe , feel free to explore!",
  about:
    "Hi! I believe that I thrive when tackling hands-on projects and exploring innovative approaches to sustainability. I am eager to contribute my creativity, technical skills, and enthusiasm to collaborative projects, while challenging myself to grow beyond my current limits.",
  contact: {
    email: "Jebali.Maram@esprit.tn",
    linkedin: "https://www.linkedin.com/in/jebali-maram-2182b62a7/",
    instagram: "https://www.instagram.com/maram__jebali/",
    github: "https://github.com/MaramJebali",
    phone: "+216 56 568 707",
  },
};

export type SkillGroup = { title: string; items: string[] };

export const skillGroups: SkillGroup[] = [
  {
    title: "Languages",
    items: ["Python", "JavaScript", "TypeScript", "SQL", "C", "Java"],
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

export type Certification = {
  title: string;
  issuer: string;
  issued: string;
  credentialId: string;
  image?: string;
};

export const certifications: Certification[] = [
  {
    title: "Building Transformer-Based Natural Language Processing Applications",
    issuer: "NVIDIA",
    issued: "Mar 2026",
    credentialId: "pF329a7-SwSyOeTLS-WONQ",
    image: "/src/assets/certificates/certif6.png",
  },
  {
    title: "Applications of AI for Anomaly Detection",
    issuer: "NVIDIA",
    issued: "Jan 2026",
    credentialId: "tsySqX7jSfWy5q22OMI6hw",
    image: "/src/assets/certificates/certif5.png",
  },
  {
    title: "Building AI Agents with Multimodal Models",
    issuer: "NVIDIA",
    issued: "Nov 2025",
    credentialId: "F2g-DA5JToWxYr22V1Y7Tg",
    image: "/src/assets/certificates/certif4.png",
  },
  {
    title: "Applications of AI for Predictive Maintenance",
    issuer: "NVIDIA",
    issued: "Oct 2025",
    credentialId: "38XtOjStR1qLXwTBdn0PuA",
    image: "/src/assets/certificates/certif3.png",
  },
  {
    title: "Generative AI with Diffusion Models",
    issuer: "NVIDIA",
    issued: "Feb 2025",
    credentialId: "TauXuWfURMOBYNutOVkopw",
    image: "/src/assets/certificates/certif2.png",
  },
  {
    title: "Fundamentals of Deep Learning",
    issuer: "NVIDIA",
    issued: "Jan 2024",
    credentialId: "1tO0Ys3ITkGJkXM3sgBKrQ",
    image: "/src/assets/certificates/certif1.png",
  },
];

/* ==========================================================================
   PROJECTS
   ========================================================================== */

export type ProjectCategory =
  | "professional"
  | "academic"
  | "hackathon"
  | "club";

export type Project = {
  id: string;
  slug?: string;
  title: string;
  category: ProjectCategory;
  tags: string[];
  period?: string;
  team?: string;
  contributors?: string[];
  award?: string;
  summary: string;

  description?: string[];
  problem?: string[];
  solution?: string[];
  features?: { title: string; text: string }[];
  journey?: string[];

  stack: string[];

  link?: string;
  live?: string;
  demo?: string;
  github?: string;
  extraLinks?: { label: string; href: string }[];
  video?: string;
  videoPoster?: string;
  presentation?: string;

  metrics?: { label: string; value: string }[];
};

export const categoryMeta: Record<
  ProjectCategory,
  { label: string; blurb: string }
> = {
  professional: { label: "Professional", blurb: "Internships & industry work" },
  academic: { label: "Academic", blurb: "Engineering school projects" },
  hackathon: { label: "Hackathons", blurb: "Competitions & sprints" },
  club: { label: "Club & Community", blurb: "IEEE, DeepFlow & beyond" },
};

export const projects: Project[] = [
  // ---------------- PROFESSIONAL ----------------
  {
    id: "urbanmind",
    slug: "urbanMind",
    title: "UrbanMind — AI-Assisted Urban Planning Platform",
    category: "professional",
    tags: ["Multi-Agent", "GIS", "Digital Twin", "BIM"],
    period: "Jul 2026 · Talan Summer Camp",
    team: "Talan Internship Team",
    summary:
      "An integrated AI platform that turns a raw site into a defensible master plan — feasibility, 2D zoning, 3D digital twin — with every figure traceable and the planner in control.",
    problem: [
      "Imagine a local authority wants to build a new neighbourhood. Before construction can even be considered, urban planners need to understand the site's geography, environmental constraints, regulations, infrastructure needs and financial feasibility — and that information lives in different professional domains.",
      "Legal experts, environmental specialists and GIS analysts work with different tools and datasets. GIS platforms analyse geography but never connect it to regulatory, environmental and financial realities, and a generic AI assistant can't replace those specialised operations.",
      "The result is fragmentation: blind spots, contradictory assumptions, and feasibility studies that take weeks.",
    ],
    solution: [
      "UrbanMind centralises multi-domain analysis into one AI-assisted workspace with three goals: break the silos, accelerate the analysis, and make every figure traceable. AI generates proposals from retrieved information; deterministic code handles numerical calculations; **the planner validates every step**.",
      "The feasibility pipeline: define the site, auto-collect data from public sources (terrain, climate, risks, mobility, PLU), explore it through indicators and visualisations, then export a structured feasibility report.",
      "The design pipeline turns the analysed site into a master plan: macrozoning into planning sectors respecting the PLU and cadastral boundaries, an amenagement plan with street/block/lot variants the planner can choose from, and a plan de masse with precise building positions — exportable as PDF, DXF or GeoJSON.",
      "The final stage is a true 3D digital twin built on real terrain data, not a flat visualisation. Each building carries structured BIM information (levels, surfaces, materials) and exports to the IFC standard for professional engineering software.",
    ],
    features: [
      {
        title: "Feasibility intelligence",
        text: "Auto-collects terrain, environmental, mobility and regulatory data from public sources and compresses it into a structured, consultable report.",
      },
      {
        title: "Agentic 2D design",
        text: "Macrozoning, amenagement plan variants and plan de masse proposed by agents — validated and selectable by the human planner.",
      },
      {
        title: "3D digital twin & BIM",
        text: "Real-terrain twin with per-building structured data and IFC export — ready for real architectural workflows, in days not quarters.",
      },
    ],
    journey: [
      "Built during the Talan Summer Camp 2026 internship program.",
      "Code stays private (internship property) — the screens tell the story.",
    ],
    stack: ["Multi-Agent AI", "RAG", "GIS", "BIM / IFC", "Three.js", "Agents IA"],
    metrics: [
      { value: "3", label: "stages: feasibility → 2D → 3D" },
      { value: "100%", label: "traceable figures" },
      { value: "BIM", label: "structured IFC export" },
      { value: "1", label: "workspace for every domain" },
    ],
    presentation: "https://canva.link/h422a5a72yr4vk6",
  },
  {
    id: "oli",
    slug: "Oli",
    title: "Oli — Assistant Chatbot Orange Tunisie",
    category: "professional",
    tags: ["RAG", "Chatbot", "Next.js", "TypeScript"],
    period: "2026 · Orange Internship",
    summary:
      "A production-grade RAG chatbot answering questions about Orange Tunisie's offers, products and trainings — grounded in official documents, with citations, honest fallbacks and zero Python.",
    problem: [
      "Customers and staff at Orange Tunisie constantly ask the same questions: which offer fits me, how does a service work, where do I find a training. The answers exist — scattered across ~357 official documents — but finding them means digging through pages of PDFs.",
      "A generic chatbot would confidently invent answers. A support line for every question doesn't scale.",
    ],
    solution: [
      "Oli combines a Qdrant Cloud vector base of **~357 indexed official documents** with hybrid search: dense embeddings (all-MiniLM-L6-v2) plus sparse BM25, fused with reciprocal-rank fusion, then reranked into a compact context pack.",
      "The chosen LLM (Gemini, Groq or Mistral) answers in French strictly from that context, citing its sources. If the information isn't in the knowledge base, Oli says so honestly — grounded answers or none at all.",
      "Architecturally, the whole RAG lives inside Next.js: the vector base is queried directly from a TypeScript module with the Qdrant JS client. No intermediate servers, no side processes, one npm command starts everything.",
    ],
    features: [
      {
        title: "Hybrid retrieval pipeline",
        text: "Dense + sparse search with RRF fusion and reranking — server-side inference on Qdrant Cloud, no local ML model needed.",
      },
      {
        title: "Grounded generation with citations",
        text: "Answers anchored in the official document base with source citations, and an honest 'I don't know' when the info is missing.",
      },
      {
        title: "Full product surface",
        text: "Streamed chat (SSE) with the Vercel AI SDK, Auth.js authentication, persisted chats and votes on Neon PostgreSQL via Drizzle ORM.",
      },
    ],
    journey: [
      "Private internship project — shared here only through interface screenshots.",
    ],
    stack: ["Next.js 15", "TypeScript", "Vercel AI SDK", "Qdrant Cloud", "PostgreSQL", "Drizzle ORM", "Gemini"],
    metrics: [
      { value: "357", label: "official documents indexed" },
      { value: "2", label: "retrieval layers (dense + sparse)" },
      { value: "3", label: "LLM providers behind one answer" },
      { value: "0", label: "python dependencies" },
    ],
  },
  {
    id: "ai-intern",
    title: "AI Intern — Text Evaluation & Image Relevance",
    category: "professional",
    tags: ["NLP", "LLM Workflow"],
    period: "Jun 2025 – Jul 2025",
    summary:
      "Designed a global radar metric and autonomous LLM workflow to detect low-quality texts and automate image–text relevance.",
    description: [
      "Designed a global radar metric using polygon mathematical modeling combined with NLP to detect low-quality texts.",
      "Built an autonomous LLM workflow for image–text relevance with automatic image retrieval and integration.",
      "Integrated the Groq API for real-time LLM inference and automated decision-making.",
    ],
    stack: ["Python", "Transformers", "OpenAI API", "Groq API", "LangChain", "Matplotlib", "NumPy"],
  },
  {
    id: "commercial-post",
    title: "Intern — Commercial Post Division",
    category: "professional",
    tags: ["Operations"],
    summary:
      "Supported daily operations of the Hybrid Courier Department, improving document tracking and reducing processing delays.",
    description: [
      "Supported daily operations of the Hybrid Courier Department, improving document tracking efficiency.",
      "Assisted in streamlining postal workflows, reducing processing delays for clients.",
    ],
    stack: ["Process Optimization", "Logistics"],
  },

  // ---------------- ACADEMIC ----------------
  {
    id: "sahatek",
    slug: "sahhatek",
    title: "Sahatek — AI Medical Guidance Assistant",
    category: "academic",
    tags: ["Multi-Agent", "Healthcare", "LangGraph", "RAG"],
    team: "Team PixelMind",
    contributors: [
      "Khawla Grira",
      "Tasnime Ouerdiane",
      "Maher Abderrahim",
      "Houssem Ben chaabane",
      "Amine Touihri",
    ],
    award: "Presented to the Ministry of Health · Jan 2026",
    summary:
      "A multi-agent AI assistant giving every Tunisian a trustworthy answer to the scariest everyday question: is this serious enough for a doctor — right now?",
    problem: [
      "When you're sick, the same question loops in your head: **is this serious enough to see a doctor, or can I manage it at home?** That uncertainty pushes people to two extremes — misinformation-driven self-treatment, or unnecessary emergency-room visits.",
      "In Tunisia the problem is structural: medical deserts, crowded ERs, and a landscape of rumors where bad advice spreads faster than verified knowledge.",
    ],
    solution: [
      "Sahatek is a multi-agent web app combining verified medical knowledge, AI-based symptom triage and clear care-pathway guidance — **reliable medical orientation in Tunisian dialect**, with an avatar you can literally talk to.",
      "One **LangGraph state machine orchestrates six agents** with clearly defined roles: an Understanding Agent handles natural Tunisian-dialect conversation with speech-to-text / text-to-speech and intent classification; a Medical Q&A Agent answers from verified sources; a Triage Agent assesses urgency; a Guidance Agent recommends home care, a doctor visit or the ER; a Rumor & Verification Agent fights misinformation; an Emotional Support Agent keeps the interaction empathetic.",
      "Grounded RAG (Chroma, FAISS, DuckDuckGo search) keeps answers checkable, LangSmith observes every run, and Gemini-class LLMs sit behind the agents. Real utility: the assistant verified your symptoms, found the nearest pharmacies on an interactive map, and guided the next step.",
    ],
    features: [
      {
        title: "Six specialized agents",
        text: "Understanding, Medical Q&A, Triage, Guidance, Rumor Verification and Emotional Support — orchestrated by LangGraph with shared memory state.",
      },
      {
        title: "Voice-first avatar interface",
        text: "Talk naturally in Tunisian dialect; the avatar handles STT/TTS and keeps the experience human-centered.",
      },
      {
        title: "Nearby care on a map",
        text: "Ask for the nearest pharmacy and the agent geolocates you, ranks facilities by distance and draws the route on an interactive map.",
      },
      {
        title: "Beyond basic Q&A",
        text: "Symptom checker, mental-health support, health fact-checking, first-aid guidance and wound analysis from an uploaded image.",
      },
    ],
    journey: [
      "Built with CBL methodology and presented to the Ministry of Health as one of the major problems facing Tunisian healthcare.",
      "Made possible by Team PixelMind — Khawla Grira, Tasnime Ouerdiane, Maher Abderrahim, Houssem Ben chaabane, Amine Touihri — under the guidance of Nardine Hanfi and Safouene Jebali.",
    ],
    stack: ["Django", "LangGraph", "LangSmith", "Chroma", "FAISS", "Gemini", "OpenCV", "Geopy", "Vosk"],
    metrics: [
      { value: "6", label: "specialized agents orchestrated" },
      { value: "24/7", label: "medical guidance availability" },
      { value: "1", label: "voice avatar for Tunisian dialect" },
      { value: "5", label: "team members, one mission" },
    ],
    github: "https://github.com/MaramJebali/Sahhatek",
    video: "https://youtu.be/_GAq-a14NNo",
  },
  {
    id: "fabmate",
    slug: "fablab",
    title: "FABMATE — Smart FabLab Management Desktop App",
    category: "academic",
    tags: ["C++", "Qt", "Arduino", "Oracle SQL"],
    team: "Team of 5 students",
    summary:
      "A smart desktop app managing a FabLab end to end: fingerprint access, fire/gas safety, parking control, BI dashboards and an integrated AI chatbot — prototyped with a real 3D digital twin.",
    description: [
      "FABMATE was born from a simple observation: running a FabLab means daily friction — machine reservations, resource tracking, member access, safety — all handled by hand, all error-prone. We answered it with a full desktop suite designed and built from scratch by a team of 5.",
      "The C++/Qt application covers the whole lifecycle: member profiles, project spaces with phase tracking (design, manufacturing, testing, documentation), reservations, courses and contractor management.",
      "Depth comes from its integrations: Oracle SQL persistence over ODBC, Arduino hardware for fingerprint login, fire/gas detection and parking access, a BI module with smart dashboards, machine-failure prediction, and an AI chatbot answering FabLab queries.",
      "We even prototyped a real 3D model of a FabLab and simulated its digital twin — the app is linked to SDG 9 (Innovation & Infrastructure), SDG 4 (Quality Education) and SDG 11 (Sustainable Cities).",
    ],
    features: [
      {
        title: "Project & phase management",
        text: "Projects carry information, phase tracking with progress prediction, and study documents — CSV/TXT workflows included.",
      },
      {
        title: "Arduino-powered access & safety",
        text: "Fingerprint login, fire/gas detection and parking access handled by embedded hardware talking to the app.",
      },
      {
        title: "BI dashboards & prediction",
        text: "Smart dashboards plus machine-failure prediction from project and resource history.",
      },
      {
        title: "AI FabLab chatbot",
        text: "An integrated assistant answering questions about the lab — reservations, machines, members.",
      },
    ],
    journey: [
      "Academic project — screenshots preserved, source code no longer available.",
    ],
    stack: ["C++", "Qt", "Oracle SQL", "ODBC", "Arduino", "BI", "Chatbot"],
  },
  {
    id: "overdose",
    slug: "overdose",
    title: "Overdose — Cumulative Exposure Intelligence",
    category: "academic",
    tags: ["Multi-Agent", "Health", "Mobile"],
    team: "Team PixelMind",
    contributors: [
      "Maram Jebali",
      "Tasnime Ouerdiane",
      "Maher Abderrahim",
      "Amine Touihri",
      "Houssem Ben chaabane",
    ],
    award: "Top 6 AI Projects · 13th Bal des Projets, ESPRIT",
    summary:
      "A multi-agent mobile app helping users understand the cumulative biological profile of everyday products.",
    problem: [
      "We are the first generation exposed to hundreds of chemicals daily — in our food, our cosmetics, our cleaning products. Most of us have no idea what they do to our bodies, let alone how they interact with each other over time.",
      "Cumulative chemical exposure is a public-health blind spot. Labels list ingredients one by one, but nobody tracks how they stack up across a lifetime of daily product use.",
      "Understanding your own biological exposure profile shouldn't require a chemistry degree.",
    ],
    solution: [
      "Overdose translates everyday product labels into a clear picture of your cumulative biological exposure. Point your camera at a product and get an explainable breakdown of what's inside — and what it means for you.",
      "The app runs a multi-agent AI pipeline: an OCR + NLP layer extracts ingredients, a biological layer maps them to pathways and known interactions, and a decision layer turns that into personalized insights and a simple exposure score.",
      "Everything is designed to be explainable — **no black-box scores, just traceable pathways** you can actually understand.",
    ],
    features: [
      {
        title: "Product Intelligence Layer",
        text: "OCR + NLP extracts ingredients from cosmetics, food and household items — even from messy labels.",
      },
      {
        title: "Biological Intelligence Layer",
        text: "Maps compounds to biological pathways and cumulative exposure patterns over time.",
      },
      {
        title: "Decision & Recommendation Layer",
        text: "Delivers explainable insights and personalized exposure-based indicators — no black-box scores.",
      },
    ],
    journey: [
      "Selected among the Top 6 AI projects at the 13th Edition of the Bal des Projets at ESPRIT.",
      "Pitched Overdose through ESPRIT's Entrep'up program — from coaching sessions on April 15th to Final Pitch Day on April 29th.",
      "Built by Team PixelMind: Maram Jebali, Tasnime Ouerdiane, Maher Abderrahim, Amine Touihri, Houssem Ben chaabane.",
    ],
    stack: ["Multi-Agent AI", "Mobile", "NLP", "OCR", "Biological Data"],
    metrics: [
      { value: "3", label: "intelligence layers" },
      { value: "1", label: "scan → full exposure profile" },
      { value: "Top 6", label: "of 13th Bal des Projets" },
    ],
    github: "https://github.com/MaramJebali/OverDose_Mobile",
    extraLinks: [
      { label: "Server backend", href: "https://github.com/MaramJebali/OverDose_Server" },
    ],
    video: "https://www.youtube.com/watch?v=YBYvJJJFAd0&t=6s",
  },
  {
    id: "deepsea",
    slug: "deepsea",
    title: "DeepSea — AI Platform for Marine Conservation",
    category: "academic",
    tags: ["Computer Vision", "RAG", "SDGs"],
    team: "Team SamSan · ESPRIT",
    award:
      "Selected among the best of the poster session — Year-3 AI program, MASSAI summer school (ESPRIT × NVIDIA)",
    summary:
      "11 validated deep-learning models protecting Tunisia's 1,300 km coastline — biodiversity, aquaculture, surveillance — aligned with SDGs 2, 4, 12, 13, 14, 17.",
    problem: [
      "The ocean is in crisis — and most of us can't see it. Coral reefs are bleaching, fish are disappearing, and invisible threats like toxic algae, underwater noise and illegal fishing accelerate the collapse of marine life.",
      "The ocean feeds billions, regulates our climate and sustains life on Earth — yet most damage goes undetected until it's too late.",
    ],
    solution: [
      "DeepSea.AI is an applied AI platform that monitors, protects and helps restore Tunisia's marine biodiversity — built at ESPRIT under the Challenge-Based Learning methodology, for scientists, NGOs, researchers, fishermen and coastal authorities.",
      "Marine ecosystem monitoring: **93.92% validation accuracy** after fine-tuning for coral microalgae classification; EfficientNetV2 classifies Healthy vs Bleached corals at 80.32% validation accuracy.",
      "Aquaculture optimization: seagull intruder detection at **F1 0.90** (91.2% precision / 88.5% recall) with YOLOv8n; fish-disease classification at 87% with MobileNetV2 for early diagnosis; fish counting at **mAP@0.5 of 94.1%** with ID-switch rate under 5%.",
      "Marine surveillance & illegal fishing: multi-ship-type detection at **mAP@50 of 98.9%**; Mask R-CNN + OpenCV fish-size estimation with cm conversion; and a real-time acoustic monitor (Li brosa + CNN14/PANNs + LLM) producing AI-generated scientific noise-risk reports — faster on local Mistral than Llama 3.",
    ],
    features: [
      {
        title: "11 validated deep learning models",
        text: "From zooplankton identification to shark behavior monitoring — every model targets a real conservation challenge with measured accuracy.",
      },
      {
        title: "Marine biodiversity monitoring",
        text: "Zooplankton identification, microalgae detection, coral-reef health classification.",
      },
      {
        title: "Aquaculture optimization",
        text: "Fish disease detection, fish counting, behavior anomaly detection — fast, reliable inference for farm operations.",
      },
      {
        title: "Marine surveillance",
        text: "Satellite vessel detection, intruder detection, fish catch monitoring and fish-size estimation for sustainable fisheries.",
      },
      {
        title: "Assistive AI systems",
        text: "A marine biodiversity chatbot grounded in a FAISS knowledge base, plus NoiseShield AI for underwater noise-risk assessment.",
      },
    ],
    journey: [
      "Our project was selected among the best of the poster session — top of Year 3 of the AI program, presented at the MASSAI summer school (ESPRIT × NVIDIA).",
      "Developed at ESPRIT under the Challenge-Based Learning (CBL) methodology — datasets, models and satellite imagery used strictly for educational and research purposes.",
    ],
    stack: ["TensorFlow", "Keras", "PyTorch", "YOLOv5/8", "Faster R-CNN", "Mask R-CNN", "ByteTrack", "CNN14 (PANNs)", "Mistral", "LangChain", "FAISS", "OpenCV"],
    metrics: [
      { value: "11", label: "validated deep learning models" },
      { value: "93.92%", label: "coral classification accuracy" },
      { value: "98.9%", label: "vessel detection mAP@50" },
      { value: "0.90", label: "intruder detection F1 (YOLOv8n)" },
    ],
    github: "https://github.com/MaramJebali/DEEPSEA.AI",
    video: "https://www.youtube.com/watch?v=2sS1ytb3Joo",
  },
  {
    id: "air-quality",
    title: "Air Quality Forecasting Platform",
    category: "academic",
    tags: ["Data Warehouse", "ML", "Power BI"],
    period: "Sep 2024 – Dec 2024",
    summary:
      "A data warehouse and interactive dashboards forecasting pollution levels, deployed as a real-time Django web app.",
    description: [
      "Designed a data warehouse for air quality data and built interactive Power BI dashboards to visualize pollutant patterns and trends.",
      "Built ML models (classification, regression, clustering) to forecast pollution levels.",
      "Deployed a Django web app for real-time access to forecasts.",
    ],
    stack: ["SSIS", "SSMS", "Power BI", "Python", "Machine Learning", "Django"],
  },

  // ---------------- HACKATHONS ----------------
  {
    id: "delil",
    slug: "Delil",
    title: "Dalil — Legal AI Guide for Tunisian SMEs",
    category: "hackathon",
    tags: ["RAG", "VLM", "LegalTech", "Hack4Justice"],
    period: "2026 · Hack4Justice 24h sprint · ESPRIT",
    team: "Hack4Justice Finalist Team",
    award: "Finalist — pitched to public & private sector experts",
    summary:
      "A legal-assistance platform helping Tunisian SMEs understand their commercial contracts and follow procedures — RAG grounded in the 1977 law, OCR/VLM intake, conversational guidance.",
    problem: [
      "Small Tunisian businesses face the fonds de commerce (الأصل التجاري) maze — location-gérance contracts, RNE filings, commercial law. Most owners don't know what their contract commits them to, which mandatory clauses are missing, or what step comes next in a procedure.",
      "Lawyers are expensive; the Code de Commerce and Loi n°77-37 aren't written for an entrepreneur in a hurry. That gap breeds risky signatures and avoidable disputes.",
    ],
    solution: [
      "Dalil covers two use cases. Contract understanding: upload a deed (PDF or image) and a VLM/OCR cascade (Gemini Flash → Mistral Pixtral → MinerU local → Tesseract) extracts the text, an LLM structures the fields, and a conformity control checks them against RNE / Code de Commerce requirements — flagging **18+ mandatory clauses** observed or missing.",
      "Procedural guidance: a conversational RAG assistant (ChromaDB + multilingual e5 embeddings) walks the user through bailleur vs commerçant procedures with step diagrams, lawyer directory cards and contract skeletons.",
      "Legal tech demands guardrails: French-term scrubbing post-checks, verification of every cited article against the RAG base, and answers in three movements — acknowledgment, substance, next step. Image and PDF intake keep it usable for real paperwork.",
    ],
    features: [
      {
        title: "Contract understanding (2 stages)",
        text: "Extraction + identification cascade, then legal-conformity analysis with RNE/Code de Commerce checklists and suggested questions per actor.",
      },
      {
        title: "Conversational guidance (3 phases)",
        text: "Intro + role selection, situation description, then intention-detection routing to find_lawyers, verified workflow generation or contract skeletons.",
      },
      {
        title: "Honest fallbacks everywhere",
        text: "Cloud-first with local alternates — MinerU locally, Tesseract OCR, Mistral after Groq — so the platform works under bad connectivity, in French or Arabic.",
      },
    ],
    journey: [
      "Hack4Justice 2026, organized by HiiL (The Hague Institute for Innovation of Law) and hosted at ESPRIT — a 24-hour sprint designing B2B/GovTech solutions to simplify administrative procedures and improve access to economic justice for SMEs and TPEs.",
      "Finalist team — pitched in front of public and private sector experts from Tunisia.",
    ],
    stack: ["Django 6", "DRF + JWT", "ChromaDB", "e5 Multilingual", "Gemini 1.5 Flash", "Mistral Pixtral", "Qwen2-VL", "Tesseract"],
    metrics: [
      { value: "2", label: "use cases: contracts + procedures" },
      { value: "18+", label: "mandatory clauses checked" },
      { value: "4", label: "AI fallback layers (cloud → local)" },
      { value: "24h", label: "hackathon sprint" },
    ],
    github: "https://github.com/MaramJebali/delil",
    demo: "https://drive.google.com/file/d/1RZHEfex2XmXLS8YZ8-NZySNCGP2vOnoA/view?usp=sharing",
  },
  {
    id: "pulse",
    slug: "Pulse",
    title: "Pulse — Read Between the Lines",
    category: "hackathon",
    tags: ["Social Listening", "NLP", "VLM"],
    period: "May 2026 · RNIT Junior Entreprise",
    summary:
      "AI-powered social listening for agencies — analyzes Instagram comments in real time across 4 languages with a rule + LLM hybrid pipeline.",
    problem: [
      "Agencies spend up to two weeks answering one question per campaign: what do people really say? Manual sentiment tagging is slow, reductive — and blind to what an emoji or a Tunisian-dialect joke actually carries.",
      "Comments mix Arabic, French, English and code-switching inside a single thread. Any pipeline that treats them separately misses half the meaning.",
    ],
    solution: [
      "Pulse listens to every comment under every post your influencers publish — live, with SSE progress streaming — and tells your agency exactly what the audience feels and what to do next.",
      "The pipeline is a rule + LLM hybrid: a scraper agent fetches posts and comments in real time, a 4-language NLP layer handles Arabic (MSA + Tunisian dialect), French, English and code-switching as one unit, and Groq's Llama 3.3-70B classifies comments into **10 fine-grained categories** — question, hype emoji, product praise, product gap, complaint, slogan echo and more.",
      "Vision does its part: NVIDIA's Llama 3.2-11B VLM analyzes image and video content alongside the caption. A zero-failure guarantee keeps it honest — every layer has a fallback (rule-based → LLM → VLM → heuristics), so the dashboard always produces its storytelling.",
      "The verdict: a human-readable narrative plus 3 strategic recommendations, exported in one click — from 'what do people really say?' to 'here's what to do next' in **4 minutes instead of 2 weeks**.",
    ],
    features: [
      {
        title: "Influencer target picker",
        text: "Searchable knowledge base of 100+ Tunisian creators with followers, engagement and niche — pick up to 5 and choose the analysis window.",
      },
      {
        title: "Live progress & insights",
        text: "SSE streams the analysis; the dashboard shows sentiment, flagged signals, emoji-only / questions / needs-support segments.",
      },
      {
        title: "AI deep analysis",
        text: "Trends, frequent topics, most-liked comment and prioritized recommendations — exportable to PDF.",
      },
      {
        title: "Zero-failure architecture",
        text: "Rule-based, LLM, VLM and heuristic layers on standby so the product never returns empty-handed.",
      },
    ],
    stack: ["Django", "React", "Framer Motion", "Groq Llama 3.3-70B", "NVIDIA NIM", "Chart.js", "SSE"],
    metrics: [
      { value: "4", label: "languages in one comment thread" },
      { value: "10", label: "fine-grained comment categories" },
      { value: "100+", label: "creators in the influencer KB" },
      { value: "4 min", label: "from posts to strategy" },
    ],
    github: "https://github.com/MaramJebali/Pulse",
    video: "https://www.youtube.com/watch?v=MapBkEX4FGU",
  },
  {
    id: "code-genie",
    title: "Code Genie — AI Coding Assistant",
    category: "hackathon",
    tags: ["LLM", "Developer Tools"],
    period: "Jul 2025 · Raise Your Hack (lablab.ai)",
    team: "DebugWithNazi · Blackbox AI Track",
    award: "Blackbox AI track — Raise Your Hack international hackathon",
    summary:
      "An AI-powered assistant that analyzes, reviews, refactors and documents source code — personalized by language, skill level and role.",
    description: [
      "Leverages the Groq API with LLaMA for code explanation, semantic search, workflow reporting, error detection and unit-test generation — all personalized by language, skill level, role and explanation language.",
      "Uses Blackbox AI for code refactoring and the Blackbox VS Code agent for context-aware inline documentation.",
      "Combines Groq's high-speed LLaMA models with Blackbox AI tools for a robust coding environment, deployed live on Hugging Face Spaces.",
    ],
    stack: ["Streamlit", "Groq API", "LLaMA", "Blackbox AI"],
    link: "https://lablab.ai/ai-hackathons/raise-your-hack/the-ultimate-coders-blackbox-ai-track/code-genie",
    extraLinks: [
      {
        label: "Team page",
        href: "https://lablab.build/ai-hackathons/raise-your-hack/the-ultimate-coders-blackbox-ai-track",
      },
    ],
    demo: "https://huggingface.co/spaces/Naz786/Smart-AI-Code-Assistant",
    github: "https://github.com/DebugWithNazi/CodeGenie",
  },
  {
    id: "oasis-gabes",
    title: "OASIS Gabès — AI for Ecosystem Restoration",
    category: "hackathon",
    tags: ["Sustainability", "Computer Vision", "RAG"],
    period: "2026 · H12 AI Healing Gabès",
    summary:
      "An AI & data-science initiative restoring Gabès' ecosystem across three pillars: ecological sustainability, ecotourism and community empowerment.",
    problem: [
      "Gabès is a region rich in natural resources yet severely impacted by pollution, climate change and ecosystem degradation — its oasis ecosystem is collapsing while the community needs sustainable economic growth.",
      "Pollution in the Gulf, agricultural disease, and climate stress compound each other, and local decision-makers lack the data tools to see the whole picture.",
    ],
    solution: [
      "OASIS Gabès harnesses AI, data science and community collaboration to restore and preserve the region's unique ecosystem — built during the H12 AI Healing Gabès hackathon around three pillars: ecological sustainability, ecotourism and community empowerment.",
      "Water pollution detection analyzes contamination in the Gulf of Gabès with species-extinction-risk dashboards; machine-learning forecasting predicts 7-day soil moisture and temperature for oasis agriculture with proactive alerts.",
      "Environmental segmentation by clustering reveals hidden climate patterns for better resource allocation, and CNN-based palm-tree disease detection targets Anthracnose and Chimaera threats to local agriculture.",
      "A hybrid AI + RAG system delivers real-time environmental insights for farmers, authorities and investors — and the community side ships too: a Unity-based immersive virtual museum raises public awareness about Gabès' biodiversity, while a Django platform empowers local guides with bookings and personalized tourist experiences.",
    ],
    features: [
      {
        title: "Water pollution detection",
        text: "AI-powered dashboards analyze contamination levels in the Gulf of Gabès and predict species-extinction risk.",
      },
      {
        title: "Climate prediction & alerts",
        text: "7-day soil-moisture and temperature forecasts for oasis agriculture with a proactive alert system.",
      },
      {
        title: "Palm tree disease detection",
        text: "Computer vision (CNN) identifies threats like Anthracnose and Chimaera to protect local agriculture.",
      },
      {
        title: "Environmental segmentation",
        text: "Clustering algorithms discover hidden climate patterns for sustainable resource allocation.",
      },
      {
        title: "Virtual museum & ecotourism platform",
        text: "A Unity-based immersive museum of Gabès' biodiversity, plus a Django guide-booking system for sustainable tourism.",
      },
    ],
    stack: ["CNN", "Clustering", "RAG", "Django", "Unity", "Power BI"],
    metrics: [
      { value: "3", label: "pillars: ecology · ecotourism · community" },
      { value: "7-day", label: "climate forecasts with alerts" },
      { value: "1", label: "immersive virtual museum" },
    ],
    github: "https://github.com/MaramJebali/H12-Gabes",
    video: "https://www.linkedin.com/feed/update/urn:li:ugcPost:7451564088108666880/",
  },
  {
    id: "valoraise",
    title: "Valoraise — Heritage of Sbiba",
    category: "hackathon",
    tags: ["NLP", "Accessibility"],
    period: "Apr 2025 · ESPRIT",
    award: "Top 8 of 34 — Finalist",
    team: "Team Valoraise",
    summary:
      "An AI-powered website making Sbiba's heritage accessible worldwide, pre-selected among the top 8 of 34 teams.",
    description: [
      "Language detection & translation for a global audience.",
      "Sign-language integration to ensure inclusivity.",
      "Monument classification for easy exploration.",
      "Speech-to-text & text-to-speech chatbot for seamless interaction.",
    ],
    stack: ["NLP", "Translation", "Image Classification", "Chatbot"],
  },
  {
    id: "indabax",
    title: "IndabaX Tunisia — Telecom Anomaly Detection",
    category: "hackathon",
    tags: ["Anomaly Detection", "LLM", "Zindi"],
    period: "May 2025 · Sup'Com",
    summary:
      "A 20-hour Zindi challenge building AI tools to detect anomalies in 4G/5G network KPIs and recommend corrective actions.",
    description: [
      "Challenge 1: detect abnormal patterns in network-cell KPIs to support proactive maintenance and improve reliability.",
      "Challenge 2: build an LLM-powered 'mini network consultant' that reads network labels and recommends clear, actionable fixes for affected KPIs.",
      "Participated in both challenges of the IndabaX 2025 hackathon, in partnership with Zindi.",
    ],
    stack: ["Anomaly Detection", "LLM", "Python"],
    link: "https://zindi.africa/users/MaramJb",
  },
  {
    id: "esg-classification",
    title: "ESG Multi-Label Text Classification",
    category: "hackathon",
    tags: ["NLP", "Multi-Label", "Kaggle"],
    period: "Feb 2026 · GO Data Science 5.0",
    summary:
      "A Kaggle competition classifying text into ESG pillars (E / S / G / non-ESG) as a multi-label problem, scored on macro-F1.",
    description: [
      "Built a pipeline to clean messy real-world text and predict whether content relates to Environmental, Social, Governance — or none — with overlapping labels.",
      "Focused on smart feature engineering, strong pretrained NLP models, careful validation and tuned decision thresholds.",
      "Hosted by IEEE ENSI CIS Chapter among 126 teams and 1,656 submissions.",
    ],
    stack: ["NLP", "Transformers", "scikit-learn", "Python"],
  },

  // ---------------- CLUB & COMMUNITY ----------------
  {
    id: "cancercare",
    slug: "cancercare",
    title: "CancerCare+ — IEEE WIE",
    category: "club",
    tags: ["RAG", "Healthcare", "Computer Vision"],
    period: "Oct 2025 · ESPRIT ESE",
    team: "IEEE WIE",
    summary:
      "An intelligent AI assistant built with CBL methodology to help, inform and empathize with users around breast cancer.",
    description: [
      "RAG and GraphRAG architectures for intelligent, context-aware question answering — every answer traced back to verified medical sources.",
      "Emotion detection for empathetic, voice-enabled interactions that listen and respond naturally.",
      "I developed two CNN models for breast cancer analysis from mammography — one detecting masses, then a second classifying them as benign or malignant.",
      "Presented on October 23rd at ESPRIT ESE, alongside the patient-facing web experience 'Fight Breast Cancer With Love'.",
    ],
    stack: ["RAG", "GraphRAG", "CNN", "Voice AI", "Emotion Detection"],
  },
  {
    id: "ieee-xtreme",
    title: "IEEE Xtreme — Competitive Programming",
    category: "club",
    tags: ["Algorithms", "Teamwork"],
    summary:
      "Participated in IEEE Xtreme, the global 24-hour competitive programming challenge.",
    description: [
      "Took part in IEEE Xtreme, solving algorithmic challenges under time pressure as part of a team.",
    ],
    stack: ["Algorithms", "Problem Solving"],
  },
  {
    id: "deepflow",
    title: "DeepFlow — Workshops & Mentoring",
    category: "club",
    tags: ["Mentoring", "Community"],
    summary:
      "Host workshops and mentor peers within the DeepFlow club, sharing AI and data-science knowledge.",
    description: [
      "Host hands-on workshops and act as a mentor, guiding members through AI and data-science topics.",
      "Created workshop presentations and supported the community's learning journey.",
    ],
    stack: ["Mentoring", "Workshops", "AI Education"],
  },
];



export const categoryOrder: ProjectCategory[] = [
  "professional",
  "academic",
  "hackathon",
  "club",
];

/* ==========================================================================
   EXPERIENCE
   ========================================================================== */

export type Experience = {
  role: string;
  company: string;
  period: string;
  location?: string;
  type?: string;
  desc: string;
  bullets?: string[];
  tech: string[];
  logo: string;
  image?: string;
  current?: boolean;
  link?: string;
};

export const experiences: Experience[] = [
  {
    role: "Teacher Assistant & Mentor",
    company: "DeepFlow",
    period: "Sep 2025 — Present",
    location: "Ariana, Tunisia · Hybrid",
    type: "Part-time",
    current: true,
    desc: "Hosting and assisting workshops and technical sessions about AI, ML and DL for university students.",
    bullets: [
      "Lead hands-on sessions on Machine Learning and Deep Learning concepts for engineering students.",
      "Mentor members through their AI learning journey, from fundamentals to applied projects.",
    ],
    tech: ["AI", "Machine Learning", "Deep Learning", "Mentoring", "Teaching"],
    logo: deepflowLogo,
    image: deepflowImg,
  },
  {
    role: "AI Engineering Intern",
    company: "Orange Tunisie",
    period: "Aug 2026 — Sep 2026 · 2 mos",
    location: "Tunisia · On-site",
    type: "Internship",
    desc: "Built Oli, an intelligent conversational assistant for Orange Tunisie powered by a Retrieval-Augmented Generation pipeline.",
    bullets: [
      "Designed a TypeScript RAG module querying Qdrant Cloud directly — no intermediate backend, no Python dependency.",
      "Indexed ~357 Orange Tunisia documents and used Qdrant Cloud Inference for server-side embeddings.",
      "Integrated Next.js 15 + Vercel AI SDK for real-time SSE chat streaming, with source citations on every answer.",
      "Persisted chats, messages and votes with Neon PostgreSQL + Drizzle ORM, and authenticated users via Auth.js.",
      "Backed by Gemini, Groq and Mistral LLMs — answers are always grounded in official documents.",
    ],
    tech: ["Next.js", "TypeScript", "RAG", "Qdrant", "Vercel AI SDK", "PostgreSQL", "Drizzle", "Auth.js", "Gemini", "Groq", "Mistral"],
    logo: orangeLogo,
  },
  {
    role: "AI Engineering Intern",
    company: "Talan",
    period: "Jul 2026 — Aug 2026 · 2 mos",
    location: "France · On-site",
    type: "Internship",
    desc: "Summer Camp 2026 — “Beyond the Prompt: Mistral à l'épreuve des usages institutionnels.” Selected among 120 students from international engineering and business schools.",
    bullets: [
      "Designed UrbanTwin, a French-language urban planning assistant: describe a project, draw the parcel on a map, and the platform analyses it against official public sources.",
      "Extracted applicable urbanism rules with verifiable citations, then orchestrated AI agents to assist the design phase.",
      "Built on Mistral AI technologies with a focus on institutional impact, relevance of usage and created value.",
    ],
    tech: ["Mistral AI", "AI Agents", "RAG", "Urban Planning"],
    logo: talanLogo,
    image: talanImg,
  },
  {
    role: "AI Intern",
    company: "Value",
    period: "Jun 2025 — Jul 2025 · 2 mos",
    location: "Tunisia · Hybrid",
    type: "Internship",
    desc: "Text Evaluation & Image Relevance System.",
    bullets: [
      "Designed a global radar metric using polygon mathematical modeling combined with NLP to detect low-quality texts.",
      "Built an autonomous LLM workflow for image–text relevance with automatic image retrieval and integration.",
      "Integrated the Groq API for real-time LLM inference and automated decision-making.",
    ],
    tech: ["Python", "NLP", "LLM", "Groq API", "LangChain", "Transformers", "NumPy", "Matplotlib"],
    logo: valueLogo,
  },
  {
    role: "Summer Intern",
    company: "La Poste Tunisienne",
    period: "Jun 2023 — Jul 2023 · 2 mos",
    location: "Tunis, Tunisia · Hybrid",
    type: "Internship",
    desc: "Supported daily operations of the Hybrid Courier Department, improving document tracking efficiency and streamlining postal workflows.",
    tech: ["Operations", "Logistics", "Process Optimization"],
    logo: laPosteLogo,
  },
];