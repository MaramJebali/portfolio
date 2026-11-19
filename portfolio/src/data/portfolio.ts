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
  roleFr: "Étudiante en Ingénierie IA",
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
  aboutFr:
    "Salut ! Je crois que c'est dans les projets concrets et l'exploration d'approches innovantes de la durabilité que je donne le meilleur de moi-même. J'ai à cœur d'apporter ma créativité, mes compétences techniques et mon enthousiasme à des projets collaboratifs, tout en me dépassant au-delà de mes limites actuelles.",
  contact: {
    email: "Jebali.Maram@esprit.tn",
    linkedin: "https://www.linkedin.com/in/jebali-maram-2182b62a7/",
    instagram: "https://www.instagram.com/maram__jebali/",
    github: "https://github.com/MaramJebali",
    phone: "+216 56 568 707",
  },
};

export type SkillGroup = { title: string; titleFr: string; items: string[] };

export const skillGroups: SkillGroup[] = [
  {
    title: "Languages",
    titleFr: "Langages",
    items: ["Python", "JavaScript", "TypeScript", "SQL", "C", "Java"],
  },
  {
    title: "AI / Machine Learning",
    titleFr: "IA / Machine Learning",
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
    titleFr: "LLMs & Agents",
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
    titleFr: "Data & BI",
    items: ["Power BI", "SSIS", "SSMS", "Pandas", "NumPy", "Matplotlib"],
  },
  {
    title: "Web & Tools",
    titleFr: "Web & Outils",
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

export const certifications: Certification[] = [  {
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

export const hederaCertifications: Certification[] = [
  {
    title: "Hedera Certified Developer Associate (HCDA)",
    issuer: "The Hashgraph Association",
    issued: "Nov 2026",
    credentialId: "495f20c9-a1ac-4fe3-a20b-5448a4c56385",
    image: "/src/assets/certificates/hedera-hcda.pdf",
  },
  {
    title: "Hedera Business Foundation (HBF)",
    issuer: "The Hashgraph Association",
    issued: "Nov 2026",
    credentialId: "3fea5be5-1106-43dd-9885-0170becf3705",
    image: "/src/assets/certificates/hedera-hbf.pdf",
  },
  {
    title: "Hedera Certified Foundation (HCF)",
    issuer: "The Hashgraph Association",
    issued: "Nov 2026",
    credentialId: "1f433707-2a84-4165-9508-1a0b82ace2bf",
    image: "/src/assets/certificates/hedera-hcf.pdf",
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
  awardFr?: string;
  summary: string;
  summaryFr?: string;

  description?: string[];
  descriptionFr?: string[];
  problem?: string[];
  problemFr?: string[];
  solution?: string[];
  solutionFr?: string[];
  features?: { title: string; text: string }[];
  featuresFr?: { title: string; text: string }[];
  journey?: string[];
  journeyFr?: string[];

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
  metricsFr?: { label: string; value: string }[];
};

export const categoryMeta: Record<
  ProjectCategory,
  { label: string; labelFr: string; blurb: string; blurbFr: string }
> = {
  professional: { label: "Professional", labelFr: "Professionnel", blurb: "Internships & industry work", blurbFr: "Stages & travail en entreprise" },
  academic: { label: "Academic", labelFr: "Académique", blurb: "Engineering school projects", blurbFr: "Projets d'école d'ingénieurs" },
  hackathon: { label: "Hackathons", labelFr: "Hackathons", blurb: "Competitions & sprints", blurbFr: "Compétitions & sprints" },
  club: { label: "Club & Community", labelFr: "Club & Communauté", blurb: "IEEE, DeepFlow & beyond", blurbFr: "IEEE, DeepFlow & au-delà" },
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
    summaryFr:
      "Une plateforme IA intégrée qui transforme un site brut en plan d'aménagement défendable — faisabilité, zonage 2D, jumeau numérique 3D — avec chaque chiffre traçable et l'urbaniste aux commandes.",
    problem: [
      "Imagine a local authority wants to build a new neighbourhood. Before construction can even be considered, urban planners need to understand the site's geography, environmental constraints, regulations, infrastructure needs and financial feasibility — and that information lives in different professional domains.",
      "Legal experts, environmental specialists and GIS analysts work with different tools and datasets. GIS platforms analyse geography but never connect it to regulatory, environmental and financial realities, and a generic AI assistant can't replace those specialised operations.",
      "The result is fragmentation: blind spots, contradictory assumptions, and feasibility studies that take weeks.",
    ],
    problemFr: [
      "Imaginez qu'une collectivité locale veuille construire un nouveau quartier. Avant même d'envisager la construction, les urbanistes doivent comprendre la géographie du site, les contraintes environnementales, la réglementation, les besoins en infrastructures et la faisabilité financière — et ces informations vivent dans des domaines professionnels différents.",
      "Les juristes, les spécialistes de l'environnement et les analystes SIG travaillent avec des outils et des jeux de données distincts. Les plateformes SIG analysent la géographie mais ne la relient jamais aux réalités réglementaires, environnementales et financières, et un assistant IA générique ne peut pas remplacer ces opérations spécialisées.",
      "Le résultat, c'est la fragmentation : angles morts, hypothèses contradictoires et des études de faisabilité qui s'étirent sur des semaines.",
    ],
    solution: [
      "UrbanMind centralises multi-domain analysis into one AI-assisted workspace with three goals: break the silos, accelerate the analysis, and make every figure traceable. AI generates proposals from retrieved information; deterministic code handles numerical calculations; **the planner validates every step**.",
      "The feasibility pipeline: define the site, auto-collect data from public sources (terrain, climate, risks, mobility, PLU), explore it through indicators and visualisations, then export a structured feasibility report.",
      "The design pipeline turns the analysed site into a master plan: macrozoning into planning sectors respecting the PLU and cadastral boundaries, an amenagement plan with street/block/lot variants the planner can choose from, and a plan de masse with precise building positions — exportable as PDF, DXF or GeoJSON.",
      "The final stage is a true 3D digital twin built on real terrain data, not a flat visualisation. Each building carries structured BIM information (levels, surfaces, materials) and exports to the IFC standard for professional engineering software.",
    ],
    solutionFr: [
      "UrbanMind centralise l'analyse multi-domaines dans un espace de travail unique assisté par l'IA, avec trois objectifs : briser les silos, accélérer l'analyse et rendre chaque chiffre traçable. L'IA génère des propositions à partir d'informations récupérées ; le code déterministe se charge des calculs numériques ; **l'urbaniste valide chaque étape**.",
      "Le pipeline de faisabilité : définir le site, collecter automatiquement les données de sources publiques (terrain, climat, risques, mobilité, PLU), les explorer à travers des indicateurs et des visualisations, puis exporter un rapport de faisabilité structuré.",
      "Le pipeline de conception transforme le site analysé en plan d'aménagement : macrozonage en secteurs respectant le PLU et les limites cadastrales, un plan d'aménagement avec des variantes rue/îlot/parcelle parmi lesquelles l'urbaniste choisit, et un plan de masse avec des positions de bâtiments précises — exportable en PDF, DXF ou GeoJSON.",
      "L'étape finale est un véritable jumeau numérique 3D construit sur des données de terrain réelles, pas une simple visualisation. Chaque bâtiment porte des informations BIM structurées (niveaux, surfaces, matériaux) et s'exporte au standard IFC pour les logiciels d'ingénierie professionnels.",
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
    featuresFr: [
      {
        title: "Intelligence de faisabilité",
        text: "Collecte automatique des données de terrain, d'environnement, de mobilité et de réglementation depuis des sources publiques, compressées dans un rapport structuré et consultable.",
      },
      {
        title: "Conception 2D agentique",
        text: "Macrozonage, variantes de plan d'aménagement et plan de masse proposés par les agents — validés et sélectionnables par l'urbaniste.",
      },
      {
        title: "Jumeau numérique 3D & BIM",
        text: "Jumeau sur terrain réel avec des données structurées par bâtiment et export IFC — prêt pour de véritables flux de travail architecturaux, en jours plutôt qu'en trimestres.",
      },
    ],
    journey: [
      "Built during the Talan Summer Camp 2026 internship program.",
      "Code stays private (internship property) — the screens tell the story.",
    ],
    journeyFr: [
      "Réalisé dans le cadre du programme de stage Talan Summer Camp 2026.",
      "Le code reste privé (propriété du stage) — les écrans racontent l'histoire.",
    ],
    stack: ["Multi-Agent AI", "RAG", "GIS", "BIM / IFC", "Three.js", "Agents IA"],
    metrics: [
      { value: "3", label: "stages: feasibility → 2D → 3D" },
      { value: "100%", label: "traceable figures" },
      { value: "BIM", label: "structured IFC export" },
      { value: "1", label: "workspace for every domain" },
    ],
    metricsFr: [
      { value: "3", label: "phases : faisabilité → 2D → 3D" },
      { value: "100%", label: "chiffres traçables" },
      { value: "BIM", label: "export IFC structuré" },
      { value: "1", label: "espace de travail pour chaque domaine" },
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
    summaryFr:
      "Un chatbot RAG de qualité production qui répond aux questions sur les offres, produits et formations d'Orange Tunisie — ancré dans les documents officiels, avec citations, réponses de repli honnêtes et zéro Python.",
    problem: [
      "Customers and staff at Orange Tunisie constantly ask the same questions: which offer fits me, how does a service work, where do I find a training. The answers exist — scattered across ~357 official documents — but finding them means digging through pages of PDFs.",
      "A generic chatbot would confidently invent answers. A support line for every question doesn't scale.",
    ],
    problemFr: [
      "Clients et employés d'Orange Tunisie posent sans cesse les mêmes questions : quelle offre me convient, comment fonctionne un service, où trouver une formation. Les réponses existent — dispersées dans ~357 documents officiels — mais les trouver impose de fouiller des pages de PDF.",
      "Un chatbot générique inventerait des réponses avec assurance. Une ligne d'assistance pour chaque question, ça ne passe pas à l'échelle.",
    ],
    solution: [
      "Oli combines a Qdrant Cloud vector base of **~357 indexed official documents** with hybrid search: dense embeddings (all-MiniLM-L6-v2) plus sparse BM25, fused with reciprocal-rank fusion, then reranked into a compact context pack.",
      "The chosen LLM (Gemini, Groq or Mistral) answers in French strictly from that context, citing its sources. If the information isn't in the knowledge base, Oli says so honestly — grounded answers or none at all.",
      "Architecturally, the whole RAG lives inside Next.js: the vector base is queried directly from a TypeScript module with the Qdrant JS client. No intermediate servers, no side processes, one npm command starts everything.",
    ],
    solutionFr: [
      "Oli combine une base vectorielle Qdrant Cloud de **~357 documents officiels indexés** avec une recherche hybride : embeddings denses (all-MiniLM-L6-v2) plus BM25 épars, fusionnés par reciprocal-rank fusion, puis rerankés en un pack de contexte compact.",
      "Le LLM choisi (Gemini, Groq ou Mistral) répond en français strictement à partir de ce contexte, en citant ses sources. Si l'information ne figure pas dans la base de connaissances, Oli le dit honnêtement — des réponses ancrées, ou pas de réponse du tout.",
      "Sur le plan architectural, tout le RAG vit à l'intérieur de Next.js : la base vectorielle est interrogée directement depuis un module TypeScript avec le client JS de Qdrant. Pas de serveurs intermédiaires, pas de processus annexes, une seule commande npm démarre tout.",
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
    featuresFr: [
      {
        title: "Pipeline de recherche hybride",
        text: "Recherche dense + éparses avec fusion RRF et reranking — inférence côté serveur sur Qdrant Cloud, sans modèle ML local.",
      },
      {
        title: "Génération ancrée avec citations",
        text: "Des réponses ancrées dans la base documentaire officielle avec citations des sources, et un honnête « je ne sais pas » quand l'information manque.",
      },
      {
        title: "Produit complet",
        text: "Chat en streaming (SSE) avec le Vercel AI SDK, authentification Auth.js, conversations et votes persistés sur Neon PostgreSQL via Drizzle ORM.",
      },
    ],
    journey: [
      "Private internship project — shared here only through interface screenshots.",
    ],
    journeyFr: [
      "Projet de stage privé — partagé ici uniquement à travers des captures d'interface.",
    ],
    stack: ["Next.js 15", "TypeScript", "Vercel AI SDK", "Qdrant Cloud", "PostgreSQL", "Drizzle ORM", "Gemini"],
    metrics: [
      { value: "357", label: "official documents indexed" },
      { value: "2", label: "retrieval layers (dense + sparse)" },
      { value: "3", label: "LLM providers behind one answer" },
      { value: "0", label: "python dependencies" },
    ],
    metricsFr: [
      { value: "357", label: "documents officiels indexés" },
      { value: "2", label: "couches de recherche (dense + éparses)" },
      { value: "3", label: "fournisseurs LLM derrière une réponse" },
      { value: "0", label: "dépendance Python" },
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
    summaryFr:
      "Conception d'une métrique radar globale et d'un workflow LLM autonome pour détecter les textes de faible qualité et automatiser la pertinence image–texte.",
    description: [
      "Designed a global radar metric using polygon mathematical modeling combined with NLP to detect low-quality texts.",
      "Built an autonomous LLM workflow for image–text relevance with automatic image retrieval and integration.",
      "Integrated the Groq API for real-time LLM inference and automated decision-making.",
    ],
    descriptionFr: [
      "Conception d'une métrique radar globale combinant modélisation mathématique par polygones et NLP pour détecter les textes de faible qualité.",
      "Construction d'un workflow LLM autonome pour la pertinence image–texte, avec récupération et intégration automatiques des images.",
      "Intégration de l'API Groq pour l'inférence LLM en temps réel et la prise de décision automatisée.",
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
    summaryFr:
      "Appui aux opérations quotidiennes du service Courrier Hybride, avec amélioration du suivi documentaire et réduction des délais de traitement.",
    description: [
      "Supported daily operations of the Hybrid Courier Department, improving document tracking efficiency.",
      "Assisted in streamlining postal workflows, reducing processing delays for clients.",
    ],
    descriptionFr: [
      "Appui aux opérations quotidiennes du service Courrier Hybride, avec une meilleure efficacité du suivi documentaire.",
      "Participation à la rationalisation des flux postaux, réduisant les délais de traitement pour les clients.",
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
    awardFr: "Présenté au Ministère de la Santé · janv. 2026",
    summary:
      "A multi-agent AI assistant giving every Tunisian a trustworthy answer to the scariest everyday question: is this serious enough for a doctor — right now?",
    summaryFr:
      "Un assistant IA multi-agents qui donne à chaque Tunisien une réponse fiable à la question du quotidien la plus angoissante : est-ce assez grave pour un médecin — tout de suite ?",
    problem: [
      "When you're sick, the same question loops in your head: **is this serious enough to see a doctor, or can I manage it at home?** That uncertainty pushes people to two extremes — misinformation-driven self-treatment, or unnecessary emergency-room visits.",
      "In Tunisia the problem is structural: medical deserts, crowded ERs, and a landscape of rumors where bad advice spreads faster than verified knowledge.",
    ],
    problemFr: [
      "Quand on est malade, la même question tourne en boucle : **est-ce assez grave pour consulter un médecin, ou puis-je me soigner à la maison ?** Cette incertitude pousse les gens vers deux extrêmes — l'automédication alimentée par la désinformation, ou des passages inutiles aux urgences.",
      "En Tunisie, le problème est structurel : déserts médicaux, urgences saturées, et un paysage de rumeurs où les mauvais conseils se propagent plus vite que la connaissance vérifiée.",
    ],
    solution: [
      "Sahatek is a multi-agent web app combining verified medical knowledge, AI-based symptom triage and clear care-pathway guidance — **reliable medical orientation in Tunisian dialect**, with an avatar you can literally talk to.",
      "One **LangGraph state machine orchestrates six agents** with clearly defined roles: an Understanding Agent handles natural Tunisian-dialect conversation with speech-to-text / text-to-speech and intent classification; a Medical Q&A Agent answers from verified sources; a Triage Agent assesses urgency; a Guidance Agent recommends home care, a doctor visit or the ER; a Rumor & Verification Agent fights misinformation; an Emotional Support Agent keeps the interaction empathetic.",
      "Grounded RAG (Chroma, FAISS, DuckDuckGo search) keeps answers checkable, LangSmith observes every run, and Gemini-class LLMs sit behind the agents. Real utility: the assistant verified your symptoms, found the nearest pharmacies on an interactive map, and guided the next step.",
    ],
    solutionFr: [
      "Sahatek est une application web multi-agents qui combine des connaissances médicales vérifiées, un triage des symptômes par l'IA et des indications de parcours de soins claires — **une orientation médicale fiable en dialecte tunisien**, avec un avatar auquel on peut littéralement parler.",
      "Une **machine à états LangGraph orchestre six agents** aux rôles clairement définis : un agent de Compréhension gère la conversation naturelle en dialecte tunisien avec la reconnaissance et la synthèse vocales et la classification d'intentions ; un agent de Questions-Réponses Médicales répond à partir de sources vérifiées ; un agent de Triage évalue l'urgence ; un agent d'Orientation recommande le soin à domicile, la consultation ou les urgences ; un agent Rumeurs & Vérification combat la désinformation ; un agent de Soutien Émotionnel garde l'interaction empathique.",
      "Un RAG ancré (Chroma, FAISS, recherche DuckDuckGo) garde les réponses vérifiables, LangSmith observe chaque exécution, et des LLM de classe Gemini se tiennent derrière les agents. Utilité concrète : l'assistant a vérifié vos symptômes, trouvé les pharmacies les plus proches sur une carte interactive et guidé la prochaine étape.",
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
    featuresFr: [
      {
        title: "Six agents spécialisés",
        text: "Compréhension, Q&R médicales, Triage, Orientation, Vérification des rumeurs et Soutien émotionnel — orchestrés par LangGraph avec un état mémoire partagé.",
      },
      {
        title: "Interface avatar vocale d'abord",
        text: "On parle naturellement en dialecte tunisien ; l'avatar gère la STT/TTS et garde une expérience centrée sur l'humain.",
      },
      {
        title: "Les soins proches sur une carte",
        text: "Demandez la pharmacie la plus proche : l'agent vous géolocalise, classe les établissements par distance et trace l'itinéraire sur une carte interactive.",
      },
      {
        title: "Bien au-delà du simple Q&R",
        text: "Analyse des symptômes, soutien en santé mentale, vérification des faits de santé, guides de premiers secours et analyse de plaies à partir d'une image envoyée.",
      },
    ],
    journey: [
      "Built with CBL methodology and presented to the Ministry of Health as one of the major problems facing Tunisian healthcare.",
      "Made possible by Team PixelMind — Khawla Grira, Tasnime Ouerdiane, Maher Abderrahim, Houssem Ben chaabane, Amine Touihri — under the guidance of Nardine Hanfi and Safouene Jebali.",
    ],
    journeyFr: [
      "Réalisé avec la méthodologie CBL et présenté au Ministère de la Santé comme l'un des grands défis du système de santé tunisien.",
      "Rendu possible par l'équipe PixelMind — Khawla Grira, Tasnime Ouerdiane, Maher Abderrahim, Houssem Ben chaabane, Amine Touihri — sous l'encadrement de Nardine Hanfi et Safouene Jebali.",
    ],
    stack: ["Django", "LangGraph", "LangSmith", "Chroma", "FAISS", "Gemini", "OpenCV", "Geopy", "Vosk"],
    metrics: [
      { value: "6", label: "specialized agents orchestrated" },
      { value: "24/7", label: "medical guidance availability" },
      { value: "1", label: "voice avatar for Tunisian dialect" },
      { value: "5", label: "team members, one mission" },
    ],
    metricsFr: [
      { value: "6", label: "agents spécialisés orchestrés" },
      { value: "24/7", label: "orientation médicale disponible" },
      { value: "1", label: "avatar vocal en dialecte tunisien" },
      { value: "5", label: "membres d'équipe, une seule mission" },
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
    summaryFr:
      "Une application de bureau intelligente qui gère un FabLab de bout en bout : accès par empreinte, sécurité incendie/gaz, contrôle du parking, tableaux de bord BI et chatbot IA intégré — prototypée avec un vrai jumeau numérique 3D.",
    description: [
      "FABMATE was born from a simple observation: running a FabLab means daily friction — machine reservations, resource tracking, member access, safety — all handled by hand, all error-prone. We answered it with a full desktop suite designed and built from scratch by a team of 5.",
      "The C++/Qt application covers the whole lifecycle: member profiles, project spaces with phase tracking (design, manufacturing, testing, documentation), reservations, courses and contractor management.",
      "Depth comes from its integrations: Oracle SQL persistence over ODBC, Arduino hardware for fingerprint login, fire/gas detection and parking access, a BI module with smart dashboards, machine-failure prediction, and an AI chatbot answering FabLab queries.",
      "We even prototyped a real 3D model of a FabLab and simulated its digital twin — the app is linked to SDG 9 (Innovation & Infrastructure), SDG 4 (Quality Education) and SDG 11 (Sustainable Cities).",
    ],
    descriptionFr: [
      "FABMATE est né d'un constat simple : faire tourner un FabLab, c'est une friction quotidienne — réservations de machines, suivi des ressources, accès des membres, sécurité — tout géré à la main, tout sujet aux erreurs. Nous y avons répondu par une suite bureautique complète conçue et construite de zéro par une équipe de 5.",
      "L'application C++/Qt couvre tout le cycle de vie : profils membres, espaces projets avec suivi de phases (conception, fabrication, test, documentation), réservations, formations et gestion des prestataires.",
      "La profondeur vient de ses intégrations : persistance Oracle SQL via ODBC, matériel Arduino pour la connexion par empreinte, la détection incendie/gaz et l'accès parking, un module BI avec tableaux de bord intelligents, prédiction des pannes machines, et un chatbot IA qui répond aux questions du FabLab.",
      "Nous avons même prototypé un vrai modèle 3D d'un FabLab et simulé son jumeau numérique — l'application est rattachée aux ODD 9 (Innovation & Infrastructure), ODD 4 (Éducation de qualité) et ODD 11 (Villes durables).",
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
    featuresFr: [
      {
        title: "Gestion projets & phases",
        text: "Les projets portent leurs informations, le suivi de phases avec prédiction d'avancement, et les documents d'étude — workflows CSV/TXT inclus.",
      },
      {
        title: "Accès & sécurité par Arduino",
        text: "Connexion par empreinte, détection incendie/gaz et accès parking gérés par du matériel embarqué dialoguant avec l'application.",
      },
      {
        title: "Tableaux de bord BI & prédiction",
        text: "Tableaux de bord intelligents plus prédiction des pannes machines à partir de l'historique projets et ressources.",
      },
      {
        title: "Chatbot IA du FabLab",
        text: "Un assistant intégré qui répond aux questions sur le labo — réservations, machines, membres.",
      },
    ],
    journey: [
      "Academic project — screenshots preserved, source code no longer available.",
    ],
    journeyFr: [
      "Projet académique — captures d'écran conservées, le code source n'est plus disponible.",
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
    awardFr: "Top 6 des projets IA · 13e Bal des Projets, ESPRIT",
    summary:
      "A multi-agent mobile app helping users understand the cumulative biological profile of everyday products.",
    summaryFr:
      "Une application mobile multi-agents qui aide chacun à comprendre le profil biologique cumulé des produits du quotidien.",
    problem: [
      "We are the first generation exposed to hundreds of chemicals daily — in our food, our cosmetics, our cleaning products. Most of us have no idea what they do to our bodies, let alone how they interact with each other over time.",
      "Cumulative chemical exposure is a public-health blind spot. Labels list ingredients one by one, but nobody tracks how they stack up across a lifetime of daily product use.",
      "Understanding your own biological exposure profile shouldn't require a chemistry degree.",
    ],
    problemFr: [
      "Nous sommes la première génération exposée chaque jour à des centaines de substances chimiques — dans notre alimentation, nos cosmétiques, nos produits ménagers. La plupart d'entre nous ignorent ce qu'ils font à notre corps, et a fortiori comment ils interagissent entre eux au fil du temps.",
      "L'exposition chimique cumulée est un angle mort de la santé publique. Les étiquettes listent les ingrédients un par un, mais personne ne suit la façon dont ils s'accumulent sur une vie entière d'usage quotidien des produits.",
      "Comprendre son propre profil d'exposition biologique ne devrait pas exiger un diplôme de chimie.",
    ],
    solution: [
      "Overdose translates everyday product labels into a clear picture of your cumulative biological exposure. Point your camera at a product and get an explainable breakdown of what's inside — and what it means for you.",
      "The app runs a multi-agent AI pipeline: an OCR + NLP layer extracts ingredients, a biological layer maps them to pathways and known interactions, and a decision layer turns that into personalized insights and a simple exposure score.",
      "Everything is designed to be explainable — **no black-box scores, just traceable pathways** you can actually understand.",
    ],
    solutionFr: [
      "Overdose traduit les étiquettes des produits du quotidien en une image claire de votre exposition biologique cumulée. Pointez votre caméra sur un produit et obtenez une décomposition explicable de ce qu'il contient — et de ce que cela signifie pour vous.",
      "L'application exécute un pipeline IA multi-agents : une couche OCR + NLP extrait les ingrédients, une couche biologique les relie aux voies métaboliques et aux interactions connues, et une couche de décision les transforme en insights personnalisés et en un score d'exposition simple.",
      "Tout est conçu pour être explicable — **pas de scores en boîte noire, seulement des voies traçables** que l'on peut réellement comprendre.",
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
    featuresFr: [
      {
        title: "Couche Intelligence Produit",
        text: "L'OCR + NLP extrait les ingrédients des cosmétiques, aliments et produits ménagers — même sur des étiquettes illisibles.",
      },
      {
        title: "Couche Intelligence Biologique",
        text: "Relie les composés aux voies biologiques et aux schémas d'exposition cumulée dans le temps.",
      },
      {
        title: "Couche Décision & Recommandation",
        text: "Fournit des insights explicables et des indicateurs personnalisés basés sur l'exposition — aucun score en boîte noire.",
      },
    ],
    journey: [
      "Selected among the Top 6 AI projects at the 13th Edition of the Bal des Projets at ESPRIT.",
      "Pitched Overdose through ESPRIT's Entrep'up program — from coaching sessions on April 15th to Final Pitch Day on April 29th.",
      "Built by Team PixelMind: Maram Jebali, Tasnime Ouerdiane, Maher Abderrahim, Amine Touihri, Houssem Ben chaabane.",
    ],
    journeyFr: [
      "Sélectionné parmi le Top 6 des projets IA à la 13e édition du Bal des Projets d'ESPRIT.",
      "Pitché Overdose à travers le programme Entrep'up d'ESPRIT — des sessions de coaching du 15 avril au jour du pitch final le 29 avril.",
      "Construit par l'équipe PixelMind : Maram Jebali, Tasnime Ouerdiane, Maher Abderrahim, Amine Touihri, Houssem Ben chaabane.",
    ],
    stack: ["Multi-Agent AI", "Mobile", "NLP", "OCR", "Biological Data"],
    metrics: [
      { value: "3", label: "intelligence layers" },
      { value: "1", label: "scan → full exposure profile" },
      { value: "Top 6", label: "of 13th Bal des Projets" },
    ],
    metricsFr: [
      { value: "3", label: "couches d'intelligence" },
      { value: "1", label: "scan → profil d'exposition complet" },
      { value: "Top 6", label: "du 13e Bal des Projets" },
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
    awardFr:
      "Sélectionné parmi les meilleurs de la session posters — 3e année du programme IA, école d'été MASSAI (ESPRIT × NVIDIA)",
    summary:
      "11 validated deep-learning models protecting Tunisia's 1,300 km coastline — biodiversity, aquaculture, surveillance — aligned with SDGs 2, 4, 12, 13, 14, 17.",
    summaryFr:
      "11 modèles de deep learning validés pour protéger les 1 300 km de côtes tunisiennes — biodiversité, aquaculture, surveillance — alignés sur les ODD 2, 4, 12, 13, 14, 17.",
    problem: [
      "The ocean is in crisis — and most of us can't see it. Coral reefs are bleaching, fish are disappearing, and invisible threats like toxic algae, underwater noise and illegal fishing accelerate the collapse of marine life.",
      "The ocean feeds billions, regulates our climate and sustains life on Earth — yet most damage goes undetected until it's too late.",
    ],
    problemFr: [
      "L'océan est en crise — et la plupart d'entre nous ne le voient pas. Les coraux blanchissent, les poissons disparaissent, et des menaces invisibles comme les algues toxiques, le bruit sous-marin et la pêche illégale accélèrent l'effondrement de la vie marine.",
      "L'océan nourrit des milliards de personnes, régule notre climat et soutient la vie sur Terre — pourtant l'essentiel des dégâts passe inaperçu jusqu'à ce qu'il soit trop tard.",
    ],
    solution: [
      "DeepSea.AI is an applied AI platform that monitors, protects and helps restore Tunisia's marine biodiversity — built at ESPRIT under the Challenge-Based Learning methodology, for scientists, NGOs, researchers, fishermen and coastal authorities.",
      "Marine ecosystem monitoring: **93.92% validation accuracy** after fine-tuning for coral microalgae classification; EfficientNetV2 classifies Healthy vs Bleached corals at 80.32% validation accuracy.",
      "Aquaculture optimization: seagull intruder detection at **F1 0.90** (91.2% precision / 88.5% recall) with YOLOv8n; fish-disease classification at 87% with MobileNetV2 for early diagnosis; fish counting at **mAP@0.5 of 94.1%** with ID-switch rate under 5%.",
      "Marine surveillance & illegal fishing: multi-ship-type detection at **mAP@50 of 98.9%**; Mask R-CNN + OpenCV fish-size estimation with cm conversion; and a real-time acoustic monitor (Li brosa + CNN14/PANNs + LLM) producing AI-generated scientific noise-risk reports — faster on local Mistral than Llama 3.",
    ],
    solutionFr: [
      "DeepSea.AI est une plateforme d'IA appliquée qui surveille, protège et aide à restaurer la biodiversité marine tunisienne — construite à ESPRIT selon la méthodologie Challenge-Based Learning, pour les scientifiques, ONG, chercheurs, pêcheurs et autorités côtières.",
      "Suivi des écosystèmes marins : **93,92 % de précision en validation** après fine-tuning pour la classification des microalgues coralliennes ; EfficientNetV2 classe les coraux sains vs blanchis à 80,32 % de précision en validation.",
      "Optimisation de l'aquaculture : détection des intrus goéland à **F1 0,90** (91,2 % précision / 88,5 % rappel) avec YOLOv8n ; classification des maladies des poissons à 87 % avec MobileNetV2 pour un diagnostic précoce ; comptage des poissons à **mAP@0.5 de 94,1 %** avec un taux d'ID-switch inférieur à 5 %.",
      "Surveillance marine & pêche illégale : détection multi-types de navires à **mAP@50 de 98,9 %** ; estimation de la taille des poissons par Mask R-CNN + OpenCV avec conversion en cm ; et un moniteur acoustique temps réel (Li brosa + CNN14/PANNs + LLM) produisant des rapports scientifiques de risque sonore générés par IA — plus rapide sur Mistral local que sur Llama 3.",
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
    featuresFr: [
      {
        title: "11 modèles de deep learning validés",
        text: "De l'identification du zooplancton au suivi du comportement des requins — chaque modèle cible un vrai défi de conservation avec une précision mesurée.",
      },
      {
        title: "Suivi de la biodiversité marine",
        text: "Identification du zooplancton, détection des microalgues, classification de la santé des récifs coralliens.",
      },
      {
        title: "Optimisation de l'aquaculture",
        text: "Détection des maladies des poissons, comptage, détection d'anomalies comportementales — une inférence rapide et fiable pour les exploitations.",
      },
      {
        title: "Surveillance marine",
        text: "Détection de navires par satellite, détection d'intrus, suivi des captures et estimation de la taille des poissons pour une pêche durable.",
      },
      {
        title: "Systèmes d'IA d'assistance",
        text: "Un chatbot de biodiversité marine ancré dans une base de connaissances FAISS, plus NoiseShield AI pour l'évaluation du risque sonore sous-marin.",
      },
    ],
    journey: [
      "Our project was selected among the best of the poster session — top of Year 3 of the AI program, presented at the MASSAI summer school (ESPRIT × NVIDIA).",
      "Developed at ESPRIT under the Challenge-Based Learning (CBL) methodology — datasets, models and satellite imagery used strictly for educational and research purposes.",
    ],
    journeyFr: [
      "Notre projet a été sélectionné parmi les meilleurs de la session posters — premier de la 3e année du programme IA, présenté à l'école d'été MASSAI (ESPRIT × NVIDIA).",
      "Développé à ESPRIT selon la méthodologie Challenge-Based Learning (CBL) — jeux de données, modèles et images satellite utilisés strictement à des fins éducatives et de recherche.",
    ],
    stack: ["TensorFlow", "Keras", "PyTorch", "YOLOv5/8", "Faster R-CNN", "Mask R-CNN", "ByteTrack", "CNN14 (PANNs)", "Mistral", "LangChain", "FAISS", "OpenCV"],
    metrics: [
      { value: "11", label: "validated deep learning models" },
      { value: "93.92%", label: "coral classification accuracy" },
      { value: "98.9%", label: "vessel detection mAP@50" },
      { value: "0.90", label: "intruder detection F1 (YOLOv8n)" },
    ],
    metricsFr: [
      { value: "11", label: "modèles de deep learning validés" },
      { value: "93.92%", label: "précision de classification des coraux" },
      { value: "98.9%", label: "mAP@50 détection de navires" },
      { value: "0.90", label: "F1 détection d'intrus (YOLOv8n)" },
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
    summaryFr:
      "Un data warehouse et des tableaux de bord interactifs qui prévoient les niveaux de pollution, déployés en application web Django temps réel.",
    description: [
      "Designed a data warehouse for air quality data and built interactive Power BI dashboards to visualize pollutant patterns and trends.",
      "Built ML models (classification, regression, clustering) to forecast pollution levels.",
      "Deployed a Django web app for real-time access to forecasts.",
    ],
    descriptionFr: [
      "Conception d'un data warehouse pour les données de qualité de l'air et création de tableaux de bord Power BI interactifs pour visualiser les tendances des polluants.",
      "Construction de modèles ML (classification, régression, clustering) pour prévoir les niveaux de pollution.",
      "Déploiement d'une application web Django pour l'accès en temps réel aux prévisions.",
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
    awardFr: "Finaliste — pitch devant des experts des secteurs public et privé",
    summary:
      "A legal-assistance platform helping Tunisian SMEs understand their commercial contracts and follow procedures — RAG grounded in the 1977 law, OCR/VLM intake, conversational guidance.",
    summaryFr:
      "Une plateforme d'assistance juridique qui aide les PME tunisiennes à comprendre leurs contrats commerciaux et à suivre leurs procédures — RAG ancré dans la loi de 1977, entrée OCR/VLM, accompagnement conversationnel.",
    problem: [
      "Small Tunisian businesses face the fonds de commerce (الأصل التجاري) maze — location-gérance contracts, RNE filings, commercial law. Most owners don't know what their contract commits them to, which mandatory clauses are missing, or what step comes next in a procedure.",
      "Lawyers are expensive; the Code de Commerce and Loi n°77-37 aren't written for an entrepreneur in a hurry. That gap breeds risky signatures and avoidable disputes.",
    ],
    problemFr: [
      "Les petites entreprises tunisiennes affrontent le labyrinthe du fonds de commerce (الأصل التجاري) — contrats de location-gérance, formalités RNE, droit commercial. La plupart des propriétaires ignorent à quoi leur contrat les engage, quelles clauses obligatoires manquent, ou quelle étape suit dans une procédure.",
      "Les avocats coûtent cher ; le Code de Commerce et la Loi n°77-37 ne sont pas écrits pour un entrepreneur pressé. Ce fossé nourrit des signatures risquées et des litiges évitables.",
    ],
    solution: [
      "Dalil covers two use cases. Contract understanding: upload a deed (PDF or image) and a VLM/OCR cascade (Gemini Flash → Mistral Pixtral → MinerU local → Tesseract) extracts the text, an LLM structures the fields, and a conformity control checks them against RNE / Code de Commerce requirements — flagging **18+ mandatory clauses** observed or missing.",
      "Procedural guidance: a conversational RAG assistant (ChromaDB + multilingual e5 embeddings) walks the user through bailleur vs commerçant procedures with step diagrams, lawyer directory cards and contract skeletons.",
      "Legal tech demands guardrails: French-term scrubbing post-checks, verification of every cited article against the RAG base, and answers in three movements — acknowledgment, substance, next step. Image and PDF intake keep it usable for real paperwork.",
    ],
    solutionFr: [
      "Dalil couvre deux cas d'usage. La compréhension de contrat : on téléverse un acte (PDF ou image) et une cascade VLM/OCR (Gemini Flash → Mistral Pixtral → MinerU local → Tesseract) extrait le texte, un LLM structure les champs, et un contrôle de conformité les vérifie face aux exigences du RNE et du Code de Commerce — en signalant **plus de 18 clauses obligatoires** présentes ou manquantes.",
      "L'accompagnement procédural : un assistant RAG conversationnel (ChromaDB + embeddings e5 multilingues) guide l'utilisateur à travers les procédures du bailleur et du commerçant, avec des schémas d'étapes, des annuaires d'avocats et des squelettes de contrats.",
      "La legal tech exige des garde-fous : post-vérifications d'anglicismes, contrôle de chaque article cité face à la base RAG, et des réponses en trois temps — prise en compte, substance, prochaine étape. L'ingestion d'images et de PDF le rend utilisable avec les vraies paperasses.",
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
    featuresFr: [
      {
        title: "Compréhension de contrat (2 étapes)",
        text: "Cascade d'extraction + d'identification, puis analyse de conformité juridique avec les checklists RNE/Code de Commerce et les questions suggérées par acteur.",
      },
      {
        title: "Accompagnement conversationnel (3 phases)",
        text: "Intro + sélection du rôle, description de la situation, puis routage par détection d'intention vers find_lawyers, la génération de workflow vérifié ou les squelettes de contrats.",
      },
      {
        title: "Des replis honnêtes partout",
        text: "Cloud d'abord avec des alternatives locales — MinerU en local, OCR Tesseract, Mistral après Groq — pour que la plateforme fonctionne même avec une mauvaise connexion, en français ou en arabe.",
      },
    ],
    journey: [
      "Hack4Justice 2026, organized by HiiL (The Hague Institute for Innovation of Law) and hosted at ESPRIT — a 24-hour sprint designing B2B/GovTech solutions to simplify administrative procedures and improve access to economic justice for SMEs and TPEs.",
      "Finalist team — pitched in front of public and private sector experts from Tunisia.",
    ],
    journeyFr: [
      "Hack4Justice 2026, organisé par HiiL (Institut de La Haye pour l'innovation du droit) et hébergé à ESPRIT — un sprint de 24 heures pour concevoir des solutions B2B/GovTech simplifiant les procédures administratives et améliorant l'accès à la justice économique des PME et TPE.",
      "Équipe finaliste — pitch devant des experts des secteurs public et privé tunisiens.",
    ],
    stack: ["Django 6", "DRF + JWT", "ChromaDB", "e5 Multilingual", "Gemini 1.5 Flash", "Mistral Pixtral", "Qwen2-VL", "Tesseract"],
    metrics: [
      { value: "2", label: "use cases: contracts + procedures" },
      { value: "18+", label: "mandatory clauses checked" },
      { value: "4", label: "AI fallback layers (cloud → local)" },
      { value: "24h", label: "hackathon sprint" },
    ],
    metricsFr: [
      { value: "2", label: "cas d'usage : contrats + procédures" },
      { value: "18+", label: "clauses obligatoires vérifiées" },
      { value: "4", label: "couches de repli IA (cloud → local)" },
      { value: "24h", label: "sprint de hackathon" },
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
    summaryFr:
      "L'écoute sociale augmentée par l'IA pour les agences — analyse en temps réel des commentaires Instagram en 4 langues avec un pipeline hybride règles + LLM.",
    problem: [
      "Agencies spend up to two weeks answering one question per campaign: what do people really say? Manual sentiment tagging is slow, reductive — and blind to what an emoji or a Tunisian-dialect joke actually carries.",
      "Comments mix Arabic, French, English and code-switching inside a single thread. Any pipeline that treats them separately misses half the meaning.",
    ],
    problemFr: [
      "Les agences passent jusqu'à deux semaines à répondre à une seule question par campagne : qu'est-ce que les gens disent vraiment ? Le balisage manuel du sentiment est lent, réducteur — et aveugle à ce que porte réellement un emoji ou une plaisanterie en dialecte tunisien.",
      "Les commentaires mêlent arabe, français, anglais et alternances de langues dans un même fil. Tout pipeline qui les traite séparément perd la moitié du sens.",
    ],
    solution: [
      "Pulse listens to every comment under every post your influencers publish — live, with SSE progress streaming — and tells your agency exactly what the audience feels and what to do next.",
      "The pipeline is a rule + LLM hybrid: a scraper agent fetches posts and comments in real time, a 4-language NLP layer handles Arabic (MSA + Tunisian dialect), French, English and code-switching as one unit, and Groq's Llama 3.3-70B classifies comments into **10 fine-grained categories** — question, hype emoji, product praise, product gap, complaint, slogan echo and more.",
      "Vision does its part: NVIDIA's Llama 3.2-11B VLM analyzes image and video content alongside the caption. A zero-failure guarantee keeps it honest — every layer has a fallback (rule-based → LLM → VLM → heuristics), so the dashboard always produces its storytelling.",
      "The verdict: a human-readable narrative plus 3 strategic recommendations, exported in one click — from 'what do people really say?' to 'here's what to do next' in **4 minutes instead of 2 weeks**.",
    ],
    solutionFr: [
      "Pulse écoute chaque commentaire sous chaque publication de vos influenceurs — en direct, avec un suivi de progression SSE — et dit exactement à votre agence ce que ressent l'audience et quoi faire ensuite.",
      "Le pipeline est un hybride règles + LLM : un agent de scraping récupère publications et commentaires en temps réel, une couche NLP 4 langues traite l'arabe (MSA + dialecte tunisien), le français, l'anglais et les alternances de langues comme un seul ensemble, et Llama 3.3-70B de Groq classe les commentaires en **10 catégories fines** — question, hype d'emoji, éloge produit, manque produit, plainte, écho de slogan et plus.",
      "La vision fait sa part : le VLM Llama 3.2-11B de NVIDIA analyse le contenu image et vidéo en complément de la légende. Une garantie zéro-échec le garde honnête — chaque couche a son repli (règles → LLM → VLM → heuristiques), donc le tableau de bord produit toujours son storytelling.",
      "Le verdict : un récit lisible plus 3 recommandations stratégiques, exportables en un clic — de « qu'est-ce que les gens disent vraiment ? » à « voici quoi faire ensuite » en **4 minutes au lieu de 2 semaines**.",
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
    featuresFr: [
      {
        title: "Sélecteur d'influenceurs cibles",
        text: "Base de connaissances consultable de plus de 100 créateurs tunisiens avec abonnés, engagement et niche — jusqu'à 5 sélectionnables et choix de la fenêtre d'analyse.",
      },
      {
        title: "Progression en direct & insights",
        text: "Le SSE diffuse l'analyse ; le tableau de bord montre le sentiment, les signaux signalés, les segments emoji-seuls / questions / besoin-d'aide.",
      },
      {
        title: "Analyse approfondie par IA",
        text: "Tendances, sujets fréquents, commentaire le plus liké et recommandations priorisées — exportables en PDF.",
      },
      {
        title: "Architecture zéro-échec",
        text: "Des couches règles, LLM, VLM et heuristiques en veille pour que le produit ne revienne jamais les mains vides.",
      },
    ],
    stack: ["Django", "React", "Framer Motion", "Groq Llama 3.3-70B", "NVIDIA NIM", "Chart.js", "SSE"],
    metrics: [
      { value: "4", label: "languages in one comment thread" },
      { value: "10", label: "fine-grained comment categories" },
      { value: "100+", label: "creators in the influencer KB" },
      { value: "4 min", label: "from posts to strategy" },
    ],
    metricsFr: [
      { value: "4", label: "langues dans un même fil de commentaires" },
      { value: "10", label: "catégories de commentaires fines" },
      { value: "100+", label: "créateurs dans la base influenceurs" },
      { value: "4 min", label: "des posts à la stratégie" },
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
    awardFr: "Piste Blackbox AI — hackathon international Raise Your Hack",
    summary:
      "An AI-powered assistant that analyzes, reviews, refactors and documents source code — personalized by language, skill level and role.",
    summaryFr:
      "Un assistant IA qui analyse, relit, refactorise et documente du code source — personnalisé selon le langage, le niveau et le rôle.",
    description: [
      "Leverages the Groq API with LLaMA for code explanation, semantic search, workflow reporting, error detection and unit-test generation — all personalized by language, skill level, role and explanation language.",
      "Uses Blackbox AI for code refactoring and the Blackbox VS Code agent for context-aware inline documentation.",
      "Combines Groq's high-speed LLaMA models with Blackbox AI tools for a robust coding environment, deployed live on Hugging Face Spaces.",
    ],
    descriptionFr: [
      "Exploite l'API Groq avec LLaMA pour l'explication de code, la recherche sémantique, le reporting de workflow, la détection d'erreurs et la génération de tests unitaires — tout personnalisé selon le langage, le niveau, le rôle et la langue d'explication.",
      "Utilise Blackbox AI pour le refactoring de code et l'agent Blackbox VS Code pour une documentation en ligne consciente du contexte.",
      "Combine les modèles LLaMA ultra-rapides de Groq avec les outils Blackbox AI pour un environnement de codage robuste, déployé en direct sur Hugging Face Spaces.",
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
    summaryFr:
      "Une initiative IA & data science pour restaurer l'écosystème de Gabès autour de trois piliers : durabilité écologique, écotourisme et autonomie des communautés.",
    problem: [
      "Gabès is a region rich in natural resources yet severely impacted by pollution, climate change and ecosystem degradation — its oasis ecosystem is collapsing while the community needs sustainable economic growth.",
      "Pollution in the Gulf, agricultural disease, and climate stress compound each other, and local decision-makers lack the data tools to see the whole picture.",
    ],
    problemFr: [
      "Gabès est une région riche en ressources naturelles mais sévèrement touchée par la pollution, le changement climatique et la dégradation des écosystèmes — son écosystème oasien s'effondre tandis que la communauté a besoin d'une croissance économique durable.",
      "La pollution du golfe, les maladies agricoles et le stress climatique se cumulent, et les décideurs locaux manquent d'outils de données pour voir l'image d'ensemble.",
    ],
    solution: [
      "OASIS Gabès harnesses AI, data science and community collaboration to restore and preserve the region's unique ecosystem — built during the H12 AI Healing Gabès hackathon around three pillars: ecological sustainability, ecotourism and community empowerment.",
      "Water pollution detection analyzes contamination in the Gulf of Gabès with species-extinction-risk dashboards; machine-learning forecasting predicts 7-day soil moisture and temperature for oasis agriculture with proactive alerts.",
      "Environmental segmentation by clustering reveals hidden climate patterns for better resource allocation, and CNN-based palm-tree disease detection targets Anthracnose and Chimaera threats to local agriculture.",
      "A hybrid AI + RAG system delivers real-time environmental insights for farmers, authorities and investors — and the community side ships too: a Unity-based immersive virtual museum raises public awareness about Gabès' biodiversity, while a Django platform empowers local guides with bookings and personalized tourist experiences.",
    ],
    solutionFr: [
      "OASIS Gabès mobilise l'IA, la data science et la collaboration communautaire pour restaurer et préserver l'écosystème unique de la région — construit pendant le hackathon H12 AI Healing Gabès autour de trois piliers : durabilité écologique, écotourisme et autonomie des communautés.",
      "La détection de pollution de l'eau analyse la contamination du golfe de Gabès avec des tableaux de bord du risque d'extinction d'espèces ; la prévision par machine learning prédit l'humidité du sol et la température à 7 jours pour l'agriculture oasienne, avec des alertes proactives.",
      "La segmentation environnementale par clustering révèle des schémas climatiques cachés pour mieux allouer les ressources, et la détection des maladies des palmiers par CNN cible les menaces Anthracnose et Chimaera pesant sur l'agriculture locale.",
      "Un système hybride IA + RAG fournit des insights environnementaux en temps réel aux agriculteurs, autorités et investisseurs — et le volet communautaire livre aussi : un musée virtuel immersif sous Unity sensibilise le public à la biodiversité de Gabès, tandis qu'une plateforme Django donne aux guides locaux des outils de réservation et d'expériences touristiques personnalisées.",
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
    featuresFr: [
      {
        title: "Détection de la pollution de l'eau",
        text: "Des tableaux de bord IA analysent les niveaux de contamination dans le golfe de Gabès et prédisent le risque d'extinction des espèces.",
      },
      {
        title: "Prévision climatique & alertes",
        text: "Prévisions d'humidité du sol et de température à 7 jours pour l'agriculture oasienne avec un système d'alertes proactives.",
      },
      {
        title: "Détection des maladies des palmiers",
        text: "La vision par ordinateur (CNN) identifie des menaces comme l'Anthracnose et la Chimaera pour protéger l'agriculture locale.",
      },
      {
        title: "Segmentation environnementale",
        text: "Des algorithmes de clustering découvrent des schémas climatiques cachés pour une allocation durable des ressources.",
      },
      {
        title: "Musée virtuel & plateforme d'écotourisme",
        text: "Un musée immersif de la biodiversité de Gabès sous Unity, plus un système de réservation de guides sous Django pour un tourisme durable.",
      },
    ],
    stack: ["CNN", "Clustering", "RAG", "Django", "Unity", "Power BI"],
    metrics: [
      { value: "3", label: "pillars: ecology · ecotourism · community" },
      { value: "7-day", label: "climate forecasts with alerts" },
      { value: "1", label: "immersive virtual museum" },
    ],
    metricsFr: [
      { value: "3", label: "piliers : écologie · écotourisme · communauté" },
      { value: "7 jours", label: "prévisions climatiques avec alertes" },
      { value: "1", label: "musée virtuel immersif" },
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
    awardFr: "Top 8 sur 34 — Finaliste",
    team: "Team Valoraise",
    summary:
      "An AI-powered website making Sbiba's heritage accessible worldwide, pre-selected among the top 8 of 34 teams.",
    summaryFr:
      "Un site web propulsé par l'IA qui rend le patrimoine de Sbiba accessible au monde entier, pré-sélectionné parmi le top 8 de 34 équipes.",
    description: [
      "Language detection & translation for a global audience.",
      "Sign-language integration to ensure inclusivity.",
      "Monument classification for easy exploration.",
      "Speech-to-text & text-to-speech chatbot for seamless interaction.",
    ],
    descriptionFr: [
      "Détection de langue et traduction pour un public mondial.",
      "Intégration de la langue des signes pour garantir l'inclusivité.",
      "Classification des monuments pour une exploration facile.",
      "Chatbot reconnaissance vocale et synthèse vocale pour une interaction fluide.",
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
    summaryFr:
      "Un défi Zindi de 20 heures : construire des outils IA pour détecter les anomalies des KPI des réseaux 4G/5G et recommander des actions correctives.",
    description: [
      "Challenge 1: detect abnormal patterns in network-cell KPIs to support proactive maintenance and improve reliability.",
      "Challenge 2: build an LLM-powered 'mini network consultant' that reads network labels and recommends clear, actionable fixes for affected KPIs.",
      "Participated in both challenges of the IndabaX 2025 hackathon, in partnership with Zindi.",
    ],
    descriptionFr: [
      "Défi 1 : détecter les schémas anormaux dans les KPI des cellules réseau pour soutenir la maintenance proactive et améliorer la fiabilité.",
      "Défi 2 : construire un « mini consultant réseau » propulsé par LLM qui lit les étiquettes réseau et recommande des correctifs clairs et actionnables pour les KPI affectés.",
      "Participation aux deux défis du hackathon IndabaX 2025, en partenariat avec Zindi.",
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
    summaryFr:
      "Une compétition Kaggle qui classe les textes dans les piliers ESG (E / S / G / non-ESG) comme problème multi-label, notée en macro-F1.",
    description: [
      "Built a pipeline to clean messy real-world text and predict whether content relates to Environmental, Social, Governance — or none — with overlapping labels.",
      "Focused on smart feature engineering, strong pretrained NLP models, careful validation and tuned decision thresholds.",
      "Hosted by IEEE ENSI CIS Chapter among 126 teams and 1,656 submissions.",
    ],
    descriptionFr: [
      "Construction d'un pipeline pour nettoyer du texte réel en désordre et prédire si le contenu relève de l'Environnemental, du Social, de la Gouvernance — ou d'aucun — avec des labels chevauchants.",
      "Accent mis sur l'ingénierie de variables intelligente, des modèles NLP pré-entraînés solides, une validation soigneuse et des seuils de décision ajustés.",
      "Organisée par le chapitre IEEE ENSI CIS parmi 126 équipes et 1 656 soumissions.",
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
    summaryFr:
      "Un assistant IA intelligent construit avec la méthodologie CBL pour aider, informer et faire preuve d'empathie autour du cancer du sein.",
    description: [
      "RAG and GraphRAG architectures for intelligent, context-aware question answering — every answer traced back to verified medical sources.",
      "Emotion detection for empathetic, voice-enabled interactions that listen and respond naturally.",
      "I developed two CNN models for breast cancer analysis from mammography — one detecting masses, then a second classifying them as benign or malignant.",
      "Presented on October 23rd at ESPRIT ESE, alongside the patient-facing web experience 'Fight Breast Cancer With Love'.",
    ],
    descriptionFr: [
      "Architectures RAG et GraphRAG pour des réponses intelligentes et conscientes du contexte — chaque réponse tracée jusqu'à des sources médicales vérifiées.",
      "Détection des émotions pour des interactions empathiques et vocales qui écoutent et répondent naturellement.",
      "J'ai développé deux modèles CNN pour l'analyse du cancer du sein à partir de mammographies — l'un détectant les masses, le second les classant bénignes ou malignes.",
      "Présenté le 23 octobre à ESPRIT ESE, aux côtés de l'expérience web destinée aux patientes « Fight Breast Cancer With Love ».",
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
    summaryFr:
      "Participation à IEEE Xtreme, le défi mondial de programmation compétitive sur 24 heures.",
    description: [
      "Took part in IEEE Xtreme, solving algorithmic challenges under time pressure as part of a team.",
    ],
    descriptionFr: [
      "Participation à IEEE Xtreme, en résolvant des défis algorithmiques sous pression du temps au sein d'une équipe.",
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
    summaryFr:
      "Animer des ateliers et encadrer les pairs au sein du club DeepFlow, en partageant les savoirs de l'IA et de la data science.",
    description: [
      "Host hands-on workshops and act as a mentor, guiding members through AI and data-science topics.",
      "Created workshop presentations and supported the community's learning journey.",
    ],
    descriptionFr: [
      "Animer des ateliers pratiques et jouer le rôle de mentor, en guidant les membres à travers les sujets d'IA et de data science.",
      "Création des supports d'ateliers et accompagnement du parcours d'apprentissage de la communauté.",
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

/* Return the project with French copy swapped in when `fr` — names and
   tech stacks stay untouched. Used by the React modal + featured cards. */
export function localizeProject(p: Project, fr: boolean): Project {
  return {
    ...p,
    summary: (fr && p.summaryFr) || p.summary,
    description: ((fr && p.descriptionFr) || p.description) ?? [],
    problem: ((fr && p.problemFr) || p.problem) ?? [],
    solution: ((fr && p.solutionFr) || p.solution) ?? [],
    features: ((fr && p.featuresFr) || p.features) ?? [],
    journey: ((fr && p.journeyFr) || p.journey) ?? [],
    metrics: (fr && p.metricsFr) || p.metrics,
    award: (fr && p.awardFr) || p.award,
  };
}

/* ==========================================================================
   EXPERIENCE
   ========================================================================== */

export type Experience = {
  role: string;
  roleFr?: string;
  company: string;
  period: string;
  location?: string;
  type?: string;
  typeFr?: string;
  desc: string;
  descFr?: string;
  bullets?: string[];
  bulletsFr?: string[];
  tech: string[];
  logo: string;
  image?: string;
  current?: boolean;
  link?: string;
};

export const experiences: Experience[] = [
  {
    role: "Teacher Assistant & Mentor",
    roleFr: "Assistante pédagogique & Mentore",
    company: "DeepFlow",
    period: "Sep 2025 — Present",
    location: "Ariana, Tunisia · Hybrid",
    type: "Part-time",
    typeFr: "Temps partiel",
    current: true,
    desc: "Hosting and assisting workshops and technical sessions about AI, ML and DL for university students.",
    descFr: "Animation et accompagnement d'ateliers et de sessions techniques sur l'IA, le ML et le DL pour des étudiants universitaires.",
    bullets: [
      "Lead hands-on sessions on Machine Learning and Deep Learning concepts for engineering students.",
      "Mentor members through their AI learning journey, from fundamentals to applied projects.",
    ],
    bulletsFr: [
      "Animer des sessions pratiques sur les concepts de Machine Learning et de Deep Learning pour des étudiants en école d'ingénieurs.",
      "Encadrer les membres dans leur parcours d'apprentissage de l'IA, des fondamentaux aux projets appliqués.",
    ],
    tech: ["AI", "Machine Learning", "Deep Learning", "Mentoring", "Teaching"],
    logo: deepflowLogo,
    image: deepflowImg,
  },
  {
    role: "AI Engineering Intern",
    roleFr: "Stagiaire en Ingénierie IA",
    company: "Orange Tunisie",
    period: "Aug 2026 — Sep 2026 · 2 mos",
    location: "Tunisia · On-site",
    type: "Internship",
    typeFr: "Stage",
    desc: "Built Oli, an intelligent conversational assistant for Orange Tunisie powered by a Retrieval-Augmented Generation pipeline.",
    descFr: "Construction d'Oli, un assistant conversationnel intelligent pour Orange Tunisie propulsé par un pipeline de Retrieval-Augmented Generation.",
    bullets: [
      "Designed a TypeScript RAG module querying Qdrant Cloud directly — no intermediate backend, no Python dependency.",
      "Indexed ~357 Orange Tunisia documents and used Qdrant Cloud Inference for server-side embeddings.",
      "Integrated Next.js 15 + Vercel AI SDK for real-time SSE chat streaming, with source citations on every answer.",
      "Persisted chats, messages and votes with Neon PostgreSQL + Drizzle ORM, and authenticated users via Auth.js.",
      "Backed by Gemini, Groq and Mistral LLMs — answers are always grounded in official documents.",
    ],
    bulletsFr: [
      "Conception d'un module RAG TypeScript interrogeant directement Qdrant Cloud — pas de backend intermédiaire, pas de dépendance Python.",
      "Indexation d'environ 357 documents d'Orange Tunisie et utilisation de Qdrant Cloud Inference pour des embeddings côté serveur.",
      "Intégration de Next.js 15 + Vercel AI SDK pour un chat en streaming SSE temps réel, avec citations des sources sur chaque réponse.",
      "Persistance des conversations, messages et votes avec Neon PostgreSQL + Drizzle ORM, et authentification des utilisateurs via Auth.js.",
      "Appuyé par les LLM Gemini, Groq et Mistral — les réponses sont toujours ancrées dans les documents officiels.",
    ],
    tech: ["Next.js", "TypeScript", "RAG", "Qdrant", "Vercel AI SDK", "PostgreSQL", "Drizzle", "Auth.js", "Gemini", "Groq", "Mistral"],
    logo: orangeLogo,
  },
  {
    role: "AI Engineering Intern",
    roleFr: "Stagiaire en Ingénierie IA",
    company: "Talan",
    period: "Jul 2026 — Aug 2026 · 2 mos",
    location: "France · On-site",
    type: "Internship",
    typeFr: "Stage",
    desc: "Summer Camp 2026 — “Beyond the Prompt: Mistral à l'épreuve des usages institutionnels.” Selected among 120 students from international engineering and business schools.",
    descFr: "Summer Camp 2026 — « Beyond the Prompt : Mistral à l'épreuve des usages institutionnels. » Sélectionnée parmi 120 étudiants d'écoles d'ingénieurs et de commerce internationales.",
    bullets: [
      "Designed UrbanTwin, a French-language urban planning assistant: describe a project, draw the parcel on a map, and the platform analyses it against official public sources.",
      "Extracted applicable urbanism rules with verifiable citations, then orchestrated AI agents to assist the design phase.",
      "Built on Mistral AI technologies with a focus on institutional impact, relevance of usage and created value.",
    ],
    bulletsFr: [
      "Conception d'UrbanTwin, un assistant d'urbanisme en français : décrivez un projet, tracez la parcelle sur une carte, et la plateforme l'analyse face aux sources publiques officielles.",
      "Extraction des règles d'urbanisme applicables avec citations vérifiables, puis orchestration d'agents IA pour assister la phase de conception.",
      "Construit sur les technologies Mistral AI avec un accent sur l'impact institutionnel, la pertinence des usages et la valeur créée.",
    ],
    tech: ["Mistral AI", "AI Agents", "RAG", "Urban Planning"],
    logo: talanLogo,
    image: talanImg,
  },
  {
    role: "AI Intern",
    roleFr: "Stagiaire IA",
    company: "Value",
    period: "Jun 2025 — Jul 2025 · 2 mos",
    location: "Tunisia · Hybrid",
    type: "Internship",
    typeFr: "Stage",
    desc: "Text Evaluation & Image Relevance System.",
    descFr: "Système d'évaluation de textes & de pertinence image–texte.",
    bullets: [
      "Designed a global radar metric using polygon mathematical modeling combined with NLP to detect low-quality texts.",
      "Built an autonomous LLM workflow for image–text relevance with automatic image retrieval and integration.",
      "Integrated the Groq API for real-time LLM inference and automated decision-making.",
    ],
    bulletsFr: [
      "Conception d'une métrique radar globale combinant modélisation mathématique par polygones et NLP pour détecter les textes de faible qualité.",
      "Construction d'un workflow LLM autonome pour la pertinence image–texte, avec récupération et intégration automatiques des images.",
      "Intégration de l'API Groq pour l'inférence LLM en temps réel et la prise de décision automatisée.",
    ],
    tech: ["Python", "NLP", "LLM", "Groq API", "LangChain", "Transformers", "NumPy", "Matplotlib"],
    logo: valueLogo,
  },
  {
    role: "Summer Intern",
    roleFr: "Stagiaire d'été",
    company: "La Poste Tunisienne",
    period: "Jun 2023 — Jul 2023 · 2 mos",
    location: "Tunis, Tunisia · Hybrid",
    type: "Internship",
    typeFr: "Stage",
    desc: "Supported daily operations of the Hybrid Courier Department, improving document tracking efficiency and streamlining postal workflows.",
    descFr: "Appui aux opérations quotidiennes du service Courrier Hybride, avec une meilleure efficacité du suivi documentaire et des flux postaux rationalisés.",
    tech: ["Operations", "Logistics", "Process Optimization"],
    logo: laPosteLogo,
  },
];