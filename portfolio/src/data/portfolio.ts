export const profile = {
  name: "Maram",
  fullName: "Maram",
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
  image?: string; // 👈 Added optional image field
};

export const certifications: Certification[] = [
  {
    title: "Building Transformer-Based Natural Language Processing Applications",
    issuer: "NVIDIA",
    issued: "Mar 2026",
    credentialId: "pF329a7-SwSyOeTLS-WONQ",
    image: "/src/assets/certificates/certif1.png", // 👈 certif1.png
  },
  {
    title: "Applications of AI for Anomaly Detection",
    issuer: "NVIDIA",
    issued: "Jan 2026",
    credentialId: "tsySqX7jSfWy5q22OMI6hw",
    image: "/src/assets/certificates/certif2.png", // 👈 certif2.png
  },
  {
    title: "Building AI Agents with Multimodal Models",
    issuer: "NVIDIA",
    issued: "Nov 2025",
    credentialId: "F2g-DA5JToWxYr22V1Y7Tg",
    image: "/src/assets/certificates/certif3.png", // 👈 certif3.png
  },
  {
    title: "Applications of AI for Predictive Maintenance",
    issuer: "NVIDIA",
    issued: "Oct 2025",
    credentialId: "38XtOjStR1qLXwTBdn0PuA",
    image: "/src/assets/certificates/certif4.png", // 👈 certif4.png
  },
  {
    title: "Attendance — Hashgraph Developer",
    issuer: "The Hashgraph Association",
    issued: "Sep 2025",
    credentialId: "15e18aba-8b9a-4baf-b26e-bd887dbc790e",
    image: "/src/assets/certificates/certif5.png", // 👈 certif5.png
  },
  {
    title: "Generative AI with Diffusion Models",
    issuer: "NVIDIA",
    issued: "Feb 2025",
    credentialId: "TauXuWfURMOBYNutOVkopw",
    image: "/src/assets/certificates/certif6.png", // 👈 certif6.png
  },
  {
    title: "Fundamentals of Deep Learning",
    issuer: "NVIDIA",
    issued: "Jan 2024",
    credentialId: "1tO0Ys3ITkGJkXM3sgBKrQ",
    image: "/src/assets/certificates/certif7.png", // 👈 certif7.png
  },
];

export type ProjectCategory =
  | "professional"
  | "academic"
  | "hackathon"
  | "club";

export type Project = {
  id: string;
  title: string;
  category: ProjectCategory;
  tags: string[];
  period?: string;
  team?: string;
  award?: string;
  summary: string;
  description: string[];
  stack: string[];
  link?: string;
  github?: string;
};

export const categoryMeta: Record<
  ProjectCategory,
  { label: string; blurb: string }
> = {
  professional: {
    label: "Professional",
    blurb: "Internships & industry work",
  },
  academic: {
    label: "Academic",
    blurb: "Engineering school projects",
  },
  hackathon: {
    label: "Hackathons",
    blurb: "Competitions & sprints",
  },
  club: {
    label: "Club & Community",
    blurb: "IEEE, DeepFlow & beyond",
  },
};

export const projects: Project[] = [
  // ---------------- PROFESSIONAL ----------------
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
    stack: [
      "Python",
      "Transformers",
      "OpenAI API",
      "Groq API",
      "LangChain",
      "Matplotlib",
      "NumPy",
    ],
  },
  {
    id: "commercial-post",
    title: "Intern — Commercial Post Division (Hybrid Courier)",
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
    title: "Sahatek — AI Medical Guidance Assistant",
    category: "academic",
    tags: ["Multi-Agent", "Healthcare", "RAG"],
    summary:
      "A multi-agent AI web app providing reliable medical orientation for citizens in Tunisia, presented to the Ministry of Health.",
    description: [
      "Sahatek answers the everyday question: is this serious enough to see a doctor, or can I manage it at home? It combines verified medical knowledge, AI symptom triage and clear care-pathway guidance.",
      "Multi-agent architecture: an Understanding Agent (Tunisian dialect orchestrator with speech-to-text / text-to-speech and an avatar), a Medical Q&A Agent grounded in verified sources, a Triage Agent assessing urgency, a Guidance Agent recommending home care / doctor / ER, a Rumor & Verification Agent fighting misinformation, and an Emotional Support Agent for empathetic interaction.",
      "Built with the CBL methodology and presented as one of the major problems facing the Ministry of Health.",
    ],
    stack: ["Django", "LangGraph", "LangSmith", "REST APIs"],
  },
  {
    id: "overdose",
    title: "Overdose — Cumulative Exposure Intelligence",
    category: "academic",
    tags: ["Multi-Agent", "Health", "Mobile"],
    team: "Team PixelMind",
    summary:
      "A multi-agent mobile app helping users understand the cumulative biological profile of everyday products.",
    description: [
      "We are the first generation exposed to hundreds of chemicals daily. Overdose makes the science of cumulative chemical exposure accessible to everyone.",
      "Product Intelligence Layer extracts ingredients from cosmetics, food and household items.",
      "Biological Intelligence Layer maps compounds to biological pathways and cumulative exposure patterns over time.",
      "Decision & Recommendation Layer delivers explainable insights and personalized exposure-based indicators.",
    ],
    stack: ["Multi-Agent AI", "Mobile", "NLP"],
  },
  {
    id: "deepsea",
    title: "DeepSea — AI Platform for Marine Conservation",
    category: "academic",
    tags: ["Computer Vision", "RAG", "SDGs"],
    team: "Team SamSan · ESPRIT",
    summary:
      "A multi-model AI platform tackling marine challenges across Tunisia's 1,300 km coastline, aligned with SDGs 2, 4, 12, 13, 14, 17.",
    description: [
      "Contributed across technical and coordination fronts — building core modules and steering the team toward real-world impact and SDG alignment.",
      "Marine monitoring: zooplankton classification (DenseNet121), coral bleaching detection (EfficientNetV2), HAB & macroalgae detection (CNN, YOLOv8, ResNet, MobileNet).",
      "Aquaculture optimization: fish counting & stress analysis (YOLOv8, DeepSORT), disease diagnosis (MobileNetV2 + Grad-CAM), species & shark behavior detection.",
      "Surveillance & awareness: FishScaleNet (Mask R-CNN + OpenCV), SeaWatchNet, Marine Noise Shield (CNN14 + Mistral LLM + LangChain) and a Biodiversity Chatbot (LangChain + FAISS + RAG).",
    ],
    stack: [
      "EfficientNetV2",
      "DenseNet121",
      "YOLOv8",
      "LangChain",
      "FAISS",
      "Mistral",
      "OpenCV",
    ],
  },
  {
    id: "air-quality",
    title: "Air Quality Forecasting Platform — BI & AI",
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
    id: "code-genie",
    title: "Code Genie — AI Coding Assistant",
    category: "hackathon",
    tags: ["LLM", "Developer Tools"],
    period: "Jul 2025 · Blackbox AI Track",
    team: "Team The Ultimate Coders",
    summary:
      "An AI-powered Streamlit app to analyze, review, refactor and document source code across multiple languages.",
    description: [
      "Leverages the Groq API with LLaMA for code explanation, semantic search, workflow reporting, error detection and unit-test generation — all personalized by language, skill level, role and explanation language.",
      "Uses Blackbox AI for code refactoring and the Blackbox VS Code agent for context-aware inline documentation.",
      "Combines Groq's high-speed LLaMA models with Blackbox AI tools for a robust coding environment.",
    ],
    stack: ["Streamlit", "Groq API", "LLaMA", "Blackbox AI"],
    link: "https://lablab.ai/ai-hackathons/raise-your-hack/the-ultimate-coders-blackbox-ai-track/code-genie",
  },
  {
    id: "valoraise",
    title: "Valoraise — Heritage of Sbiba (H12 Kasserine)",
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
    id: "oasis-gabes",
    title: "OASIS Gabès — AI for Ecosystem Restoration",
    category: "hackathon",
    tags: ["Sustainability", "Computer Vision", "RAG"],
    period: "Apr 2026 · H12 AI Healing Gabès",
    summary:
      "A transformative project harnessing AI and data science to restore Gabès' ecosystem and drive sustainable growth.",
    description: [
      "Three pillars: ecological sustainability, ecotourism and community empowerment.",
      "Water pollution detection in the Gulf of Gabès with species-extinction risk dashboards; 7-day soil moisture & temperature forecasting with proactive alerts.",
      "Environmental segmentation via clustering, and palm-tree disease detection (CNN) for Anthracnose and Chimaera.",
      "Hybrid AI & RAG system for real-time insights, a Unity-based immersive virtual museum, and a Django platform for local guides and ecotourism.",
    ],
    stack: ["CNN", "Clustering", "RAG", "Django", "Unity", "Power BI"],
  },
  {
    id: "pulse",
    title: "Pulse — Read Between the Lines",
    category: "hackathon",
    tags: ["Social Listening", "NLP", "VLM"],
    period: "May 2026 · RNIT Junior Entreprise",
    summary:
      "AI-powered social listening for agencies — analyzes Instagram comments in real time across 4 languages with a rule + LLM hybrid pipeline.",
    description: [
      "Real-time Instagram scraping with a 4-language NLP pipeline: Arabic (MSA + Tunisian dialect), French, English and code-switching handled as a unified unit.",
      "Vision-Language Models analyze image & video content alongside captions; an LLM classifies comments into 10 fine-grained categories with emotion detection.",
      "A zero-failure fallback chain (rule-based → Groq Llama 3.3-70B → NVIDIA VLM → heuristics) keeps the dashboard alive even if every API is down.",
      "AI storytelling generates a narrative plus 3 strategic recommendations, with one-click PDF export — turning 'what do people say?' into 'here's what to do next' in 4 minutes.",
    ],
    stack: [
      "Django",
      "React",
      "Framer Motion",
      "Groq Llama 3.3-70B",
      "NVIDIA NIM",
      "Chart.js",
    ],
  },
  {
    id: "indabax",
    title: "IndabaX Tunisia — Telecom Anomaly Detection",
    category: "hackathon",
    tags: ["Anomaly Detection", "LLM", "Zindi"],
    period: "May 2025 · Sup'Com (IEEE × Orange × InstaDeep)",
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
    title: "CancerCare+ — IEEE WIE",
    category: "club",
    tags: ["RAG", "Healthcare", "Computer Vision"],
    period: "Oct 2025 · ESPRIT ESE",
    team: "IEEE WIE",
    summary:
      "An intelligent AI assistant built with CBL methodology to help, inform and empathize with users around breast cancer.",
    description: [
      "RAG and GraphRAG architectures for intelligent, context-aware question answering.",
      "Emotion detection for empathetic, voice-enabled interactions that listen and respond naturally.",
      "I developed two models for breast cancer detection and classification from mammography — detecting masses, then classifying them as benign or malignant.",
      "Presented on October 23rd at ESPRIT ESE.",
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