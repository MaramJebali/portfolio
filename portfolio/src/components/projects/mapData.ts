/* Maps the portfolio's real project data (src/data/portfolio.ts) onto the
   "paper-ink deck" scene engine's data contract.

   Engine contract (verbatim from the original site's main.js):
     P[i]  = [title, tagline, blurb, tagsCSV, slug]
     XD[i] = [category, period, bullets[4]]
   Everything else (screens, links, structured copy) feeds the detail renderer. */

import {
  categoryMeta,
  getProjectScreens,
  getProjectPdf,
  type Project,
} from "@/data/portfolio";

export type SceneProject = {
  /* deck / index data */
  slug: string;
  title: string;
  tagline: string;
  blurb: string;
  tags: string[];
  category: string;
  period: string;
  bullets: string[];

  /* detail-page data */
  summary: string;
  description: string[];
  problem: string[];
  solution: string[];
  features: { title: string; text: string }[];
  journey: string[];
  metrics: { label: string; value: string }[];
  stack: string[];
  team?: string;
  award?: string;
  contributors?: string[];
  screens: string[];
  cover?: string;
  pdf?: string;
  github?: string;
  live?: string;
  video?: string;
};

/* first sentence, soft-capped — used as the card's tagline line */
function firstSentence(text: string, cap = 92): string {
  const s = text.split(/(?<=[.!?])\s+/)[0] ?? text;
  return s.length > cap ? s.slice(0, cap - 1).trimEnd() + "…" : s;
}

/* up to four bullet points for the deck card's highlight list */
function cardBullets(p: Project): string[] {
  if (p.description && p.description.length)
    return p.description.slice(0, 4).map((t) => firstSentence(t, 110));
  return firstSentences(p.summary, 4);
}

function firstSentences(text: string, n: number): string[] {
  const parts = text.split(/(?<=[.!?])\s+/).filter(Boolean);
  if (parts.length <= n) return parts;
  const out = parts.slice(0, n - 1);
  out.push(parts.slice(n - 1).join(" "));
  return out;
}

export function toSceneProjects(list: Project[]): SceneProject[] {
  return list.map((p) => {
    const screens = getProjectScreens(p.slug ?? p.id);
    const bullets = cardBullets(p);
    return {
      slug: p.slug ?? p.id,
      title: p.title,
      tagline: firstSentence(p.summary),
      blurb: p.summary,
      tags: (p.stack.length ? p.stack : p.tags).slice(0, 6),
      category: categoryMeta[p.category].label,
      period: p.period ?? "",
      bullets: bullets.length ? bullets : [p.summary],

      summary: p.summary,
      description: p.description ?? [],
      problem: p.problem ?? [],
      solution: p.solution ?? [],
      features: p.features ?? [],
      journey: p.journey ?? [],
      metrics:
        p.metrics ??
        (p.award ? [{ label: "Recognition", value: p.award }] : []),
      stack: p.stack,
      team: p.team,
      award: p.award,
      contributors: p.contributors,
      screens,
      cover: screens[0],
      pdf: getProjectPdf(p.slug ?? p.id),
      github: p.github,
      live: p.live ?? p.demo ?? p.link,
      video: p.video,
    };
  });
}
