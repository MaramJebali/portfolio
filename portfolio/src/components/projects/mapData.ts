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
import { getLang } from "@/lib/lang";

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
function cardBullets(p: Project, fr: boolean): string[] {
  const d = (fr && p.descriptionFr) || p.description;
  if (d && d.length) return d.slice(0, 4).map((t) => firstSentence(t, 110));
  return firstSentences((fr && p.summaryFr) || p.summary, 4);
}

function firstSentences(text: string, n: number): string[] {
  const parts = text.split(/(?<=[.!?])\s+/).filter(Boolean);
  if (parts.length <= n) return parts;
  const out = parts.slice(0, n - 1);
  out.push(parts.slice(n - 1).join(" "));
  return out;
}

export function toSceneProjects(list: Project[]): SceneProject[] {
  const fr = getLang() === "fr";
  const summary = (p: Project) => (fr && p.summaryFr) || p.summary;
  return list.map((p) => {
    const screens = getProjectScreens(p.slug ?? p.id);
    const bullets = cardBullets(p, fr);
    const metrics =
      (fr && p.metricsFr) ||
      p.metrics ||
      (p.award
        ? [
            {
              label: fr ? "Reconnaissance" : "Recognition",
              value: (fr && p.awardFr) || p.award,
            },
          ]
        : []);
    return {
      slug: p.slug ?? p.id,
      title: p.title,
      tagline: firstSentence(summary(p)),
      blurb: summary(p),
      tags: (p.stack.length ? p.stack : p.tags).slice(0, 6),
      category: (fr && categoryMeta[p.category].labelFr) || categoryMeta[p.category].label,
      period: p.period ?? "",
      bullets: bullets.length ? bullets : [summary(p)],

      summary: summary(p),
      description: ((fr && p.descriptionFr) || p.description) ?? [],
      problem: ((fr && p.problemFr) || p.problem) ?? [],
      solution: ((fr && p.solutionFr) || p.solution) ?? [],
      features: ((fr && p.featuresFr) || p.features) ?? [],
      journey: ((fr && p.journeyFr) || p.journey) ?? [],
      metrics,
      stack: p.stack,
      team: p.team,
      award: (fr && p.awardFr) || p.award,
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
