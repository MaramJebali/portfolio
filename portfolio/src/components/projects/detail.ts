/* Project-detail overlay — verbatim port of the click→detail flow from the
   studied portfolio (projects.f718775b65.js): full-screen #pp shell, letter-by-
   letter title reveal, hash routing (#p-<slug>), Esc / data-back / browser-back
   closing with exact scroll restore, in-page anchor jumps (data-in) and the
   diagram activation routine.

   The body renderer is data-driven: it maps each project's structured copy onto
   the original's body-component families (pj-tg banners, pj-m meta grid, cut-
   panel figures, cxf feature rows, cxl numbered lists, cxn stats, cxg/cxk stack
   grid, pj-sh screenshot wall, pj-nx2 next card).                             */

import type { SceneProject } from "./mapData";
import { detailState } from "./scene";

const $ = (sel: string, el: ParentNode) => el.querySelector(sel) as HTMLElement;

/* svg diagram activation — same as the original's X() */
function activateDiagrams(svg: SVGSVGElement) {
  svg.querySelectorAll(".bx").forEach((el, i) => (el as HTMLElement).style.animationDelay = i * 45 + "ms");
  svg.querySelectorAll("path.ln:not(.fl):not(.tn)").forEach(p => {
    p.setAttribute("pathLength", "1");
    p.classList.add("dr");
  });
  svg.querySelectorAll("path.fl").forEach((p, i) => {
    const dot = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    const motion = document.createElementNS("http://www.w3.org/2000/svg", "animateMotion");
    dot.setAttribute("r", "3.4"); dot.setAttribute("class", "pk");
    motion.setAttribute("dur", 2 + (i % 3) * .7 + "s");
    motion.setAttribute("begin", i * .2 + "s");
    motion.setAttribute("repeatCount", "indefinite");
    motion.setAttribute("path", p.getAttribute("d") || "");
    dot.appendChild(motion);
    svg.appendChild(dot);
  });
}

/* tiny architecture diagram skeleton (placeholder panel) */
function diagram() {
  const box = (x: number, y: number, w: number, h: number, label: string) =>
    `<rect class="bx" x="${x}" y="${y}" width="${w}" height="${h}" rx="8" fill="none" stroke="currentColor" stroke-width="2"/><text x="${x + 14}" y="${y + h / 2}" class="lab">${label}</text>`;
  const wire = (d: string) => `<path class="ln" d="${d}" fill="none" stroke="currentColor" stroke-width="2"/>`;
  return wire("M 80 210 H 260 M 420 210 H 560 M 720 210 H 860") +
    box(60, 160, 200, 100, "Input") + box(300, 160, 200, 100, "Agents") +
    box(560, 160, 200, 100, "Logic") + box(820, 160, 200, 100, "Output") +
    `<path class="fl" d="M 80 210 H 980" stroke-dasharray="6 6"/>`;
}

const esc = (s: string) => s.replace(/&/g, "&").replace(/</g, "<").replace(/>/g, ">");
const chip = (name: string) => `<span><span class="mono">${esc(name.slice(0, 2))}</span>${esc(name)}</span>`;

/* section banner — original l/k/n helper output */
const sec = (n: string, label: string) =>
  `<div class="pj-tg"><span class="pj-tag"><b>${n}</b>${esc(label)}</span><i class="stp"></i><span class="ln"></span></div>`;

/* figure in a cut panel (original I/a helper) */
const fig = (src: string, cap: string, text: string) =>
  `<figure><div class="cy cyb"><div class="cyi"><img src="${src}" alt="${esc(cap)}" loading="lazy" decoding="async"></div></div>
   <figcaption><div class="lab">${esc(cap)}</div><p class="rt">${esc(text)}</p></figcaption></figure>`;

/* hatched placeholder panel when a project has no screenshots yet */
const ph = (label: string) =>
  `<div class="cy cyb"><div class="cyi pj-sc"><span class="lab">${esc(label)}</span></div></div>`;

const embed = (url?: string): string | undefined => {
  if (!url) return undefined;
  const yt = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+)/);
  if (yt) return `https://www.youtube.com/embed/${yt[1]}`;
  const vimeo = url.match(/vimeo\.com\/(\d+)/);
  return vimeo ? `https://player.vimeo.com/video/${vimeo[1]}` : undefined;
};

export type DetailHandle = { dispose: () => void; open: (i: number) => void; close: (jumpBack?: boolean) => void };

export function mountDetail(
  C: HTMLElement,
  projects: SceneProject[],
  ownerTitle: string,
): DetailHandle {
  const N = projects.length;
  const pad = (n: number) => String(n + 1).padStart(2, "0");
  const TITLE0 = document.title;
  let backY = 0, openIdx = -1, disposed = false;

  /* ---------- data-driven body ---------- */
  function body(p: SceneProject, i: number): string {
    const out: string[] = [];
    let n = 0;
    const num = () => pad2(n++);
    const pad2 = (x: number) => String(x + 1).padStart(2, "0");

    /* overview — glass column pair */
    if (p.description.length) {
      out.push(`<div class="pj-s">${sec(num(), "Overview")}
        <div class="d pj-h">What it is</div>
        ${p.description.length >= 2 ? `<div class="pj-g">
          <div class="cy cyb"><div class="cyi"><span class="lab">The project</span><p>${esc(p.description[0])}</p></div></div>
          <div class="cy cyb"><div class="cyi"><span class="lab">The details</span>${p.description.slice(1).map(t => `<p>${esc(t)}</p>`).join("")}</div></div>
        </div>` : `<p class="rt" style="max-width:60rem">${esc(p.description[0])}</p>`}
      </div>`);
    }

    /* problem — callout notes */
    if (p.problem.length) {
      out.push(`<div class="pj-s">${sec(num(), "Problem")}
        <div class="d pj-h">Why it matters</div>
        ${p.problem.map(t => `<p class="cxd">${esc(t)}</p>`).join("")}
      </div>`);
    }

    /* solution/approach */
    if (p.solution.length) {
      out.push(`<div class="pj-s">${sec(num(), "Approach")}
        <div class="d pj-h">How it works</div>
        ${p.solution.slice(0, 1).map(t => `<p class="lead" style="max-width:60rem">${esc(t)}</p>`).join("")}
        ${p.solution.length > 1 ? `<div class="pj-g" style="margin-top:1.5rem">
          ${p.solution.slice(1).map((t, k) => `<div class="cy cyb"><div class="cyi"><span class="lab">Part ${k + 1}</span><p>${esc(t)}</p></div></div>`).join("")}
        </div>` : ""}
      </div>`);
    }

    /* features — alternating cut-panel rows */
    if (p.features.length) {
      out.push(`<div class="pj-s">${sec(num(), "Features")}
        <div class="d pj-h">Under the hood</div>
        ${p.features.map((f, s) => `
        <div class="cxf${s % 2 ? " rv" : ""}">
          <div class="cxx">
            <div class="lab">${pad2(s)} · ${esc(f.title)}</div>
            <h3 class="d">${esc(f.title)}</h3>
            <p>${esc(f.text)}</p>
            <div class="chips">${p.tags.slice(0, 3).map(chip).join("")}</div>
          </div>
          <div class="cxi">${p.screens.length
            ? fig(p.screens[s % p.screens.length], f.title, p.title + " — " + f.title)
            : ph(f.title + " · panel")}</div>
        </div>`).join("")}
      </div>`);
    }

    /* journey / highlights — numbered list */
    if (p.journey.length) {
      out.push(`<div class="pj-s">${sec(num(), "Journey")}
        <div class="d pj-h">The road so far</div>
        <ul class="cxl">
          ${p.journey.map((t, k) => `<li data-k="${k + 1}"><b>${k + 1}</b><span>${esc(t)}</span></li>`).join("")}
        </ul>
      </div>`);
    }

    /* metrics / recognition — stat grid */
    if (p.metrics.length) {
      out.push(`<div class="pj-s">${sec(num(), "Results")}
        <div class="cxn">
          ${p.metrics.map(m => `<div><b>${esc(m.value)}</b><span>${esc(m.label)}</span></div>`).join("")}
        </div>
      </div>`);
    }

    /* video demo — embedded in the big panel */
    const vEmbed = embed(p.video);
    if (vEmbed) {
      out.push(`<div class="pj-s">${sec(num(), "Demo")}
        <div class="d pj-h">Watch it run</div>
        <div class="bp" style="padding:.75rem"><iframe src="${vEmbed}" title="${esc(p.title)} demo"
          style="width:100%;aspect-ratio:16/9;border:0;border-radius:.75rem;display:block"
          allow="accelerometer;autoplay;clipboard-write;encrypted-media;gyroscope;picture-in-picture"
          allowfullscreen loading="lazy"></iframe></div>
      </div>`);
    }

    /* screenshot wall */
    if (p.screens.length > 1) {
      out.push(`<div class="pj-s">${sec(num(), "Screenshots")}
        <div class="d pj-h">In action</div>
        <div class="pj-sh">
          ${p.screens.map((src, k) => fig(src, "Screen " + (k + 1), p.title + " — screen " + (k + 1))).join("")}
        </div>
      </div>`);
    } else if (p.screens.length === 1 && !p.features.length && !p.description.length) {
      out.push(`<div class="pj-s">${sec(num(), "Screenshots")}
        <div class="d pj-h">In action</div>${fig(p.screens[0], "Main screen", p.title)}</div>`);
    }

    /* architecture diagram panel (placeholder pipeline visual) */
    out.push(`<div class="pj-s">${sec(num(), "Architecture")}
      <div class="d pj-h">How it fits together</div>
      <div class="bp" style="padding:1rem">
        <div class="cxtb lab"><span class="on">Design</span><span>Flow</span><span style="margin-left:auto;border:0">${esc(p.stack.slice(0, 2).join(" · "))}</span></div>
        <svg class="cxs" style="width:100%;height:auto" viewBox="0 0 1100 420" role="img" aria-label="${esc(p.title)} architecture diagram">${diagram()}</svg>
      </div>
    </div>`);

    /* stack */
    if (p.stack.length) {
      out.push(`<div class="pj-s pj-st" id="pj-stack">${sec(num(), "Stack")}
        <div class="d pj-h">Built with</div>
        <div class="cxg"><h4 style="margin-top:0">Tools</h4>
          <div class="cxk">${p.stack.map(t => `<div><span class="mono">${esc(t.slice(0, 2))}</span><b>${esc(t)}</b></div>`).join("")}</div>
        </div>
        ${p.team ? `<div class="pj-g" style="margin-top:2rem"><div class="cy cyb"><div class="cyi"><span class="lab">Team</span><p>${esc(p.team)}${p.contributors?.length ? " — " + p.contributors.map(esc).join(", ") : ""}</p></div></div>
        <div class="cy cyb"><div class="cyi"><span class="lab">Recognition</span><p>${esc(p.award || "—")}</p></div></div></div>` : ""}
      </div>`);
    }

    void i;
    return out.join("");
  }

  /* ---------- detail HTML ---------- */
  function render(i: number): string {
    const p = projects[i];
    const c = (i + 1) % N, prev = (i + N - 1) % N;
    const heroMedia = p.cover
      ? `<img src="${p.cover}" alt="${esc(p.title)} hero screenshot" loading="lazy" decoding="async">`
      : `<span class="pj-ph lab">screenshots coming soon</span>`;
    return `
      <div class="pj-w">
        <span class="pj-no" aria-hidden="true">${pad(i)}</span>
        ${sec(pad(i), `${p.category}${p.period ? " · " + p.period : ""}`)}
        <h1 class="d pj-t"><span class="w"><span>${esc(p.title)}</span></span></h1>
        <p class="lead l0 fade">${esc(p.summary)}</p>
        <div class="pj-m fade">
          <div><div class="lab">Category</div><span class="d">${esc(p.category)}</span></div>
          <div><div class="lab">Period</div><span class="d">${esc(p.period || "—")}</span></div>
          <div><div class="lab">Team</div><span class="d">${esc(p.team || "Solo")}</span></div>
          <div><div class="lab">Stack</div><span class="d">${p.stack.length} technologies</span></div>
        </div>
        <div class="pj-bt fade">
          ${p.github ? `<a class="cyb2" href="${p.github}" target="_blank" rel="noopener">View on GitHub ↗</a>` : ""}
          ${p.live ? `<a class="cyb2 lm" href="${p.live}" target="_blank" rel="noopener">Open project ↗</a>` : ""}
          <a class="cyb2 lm" href="#" data-back>← All projects</a>
        </div>
        <div class="cy cyb pj-hero fade"><div class="cyi">
          ${heroMedia}
          <span class="pj-tag pj-cap"><b>${pad(i)}</b>${esc(p.category)}</span>
          ${p.stack.length ? `<a class="cy lm pj-stk" href="#pj-stack" data-in>
            <span class="cyi">
              <span class="pj-ti">${p.stack.slice(0, 6).map(t => `<span title="${esc(t)}">${esc(t.slice(0, 2))}</span>`).join("")}</span>
              <span class="pj-sm"><b>Stack · ${p.stack.length}</b><span>${esc(p.stack.slice(0, 4).join(", "))}</span></span>
            </span>
          </a>` : ""}
        </div></div>
      </div>
      ${body(p, i)}
      <a class="cy pj-nx2" href="#p-${projects[c].slug}"><span class="cyi"><span class="lab">Next</span>
        <span class="d">${esc(projects[c].title)} →</span></span></a>
      <div class="pj-ft lab"><a href="#p-${projects[prev].slug}">← ${esc(projects[prev].title)}</a>
        ${p.github ? `<a href="${p.github}" target="_blank" rel="noopener">GitHub ↗</a>` : ""}
        ${p.pdf ? `<a href="${p.pdf}" target="_blank" rel="noopener">Presentation PDF ↗</a>` : ""}</div>`;
  }

  /* ---------- open / close (exact choreography) ---------- */
  function wire() {
    C.scrollTop = 0;
    let d = 0;
    C.querySelectorAll("h1 .w>span").forEach(span => {
      span.innerHTML = [...span.textContent].map(ch =>
        `<i style="--d:${d++ * 45}">${ch === " " ? "&nbsp;" : ch}</i>`).join("");
    });
    C.querySelectorAll("svg.cxs").forEach(s => activateDiagrams(s as SVGSVGElement));
  }

  function open(i: number) {
    if (disposed) return;
    if (openIdx === i) return;
    if (openIdx >= 0) { openIdx = -1; }        // swap content while already open
    if (openIdx === -1 && C.classList.contains("on")) {
      /* already-open swap: replace content, keep shell */
      C.classList.remove("in");
      C.innerHTML = render(i);
      wire();
      openIdx = i;
      document.title = projects[i].title + " | " + ownerTitle;
      requestAnimationFrame(() => requestAnimationFrame(() => C.classList.add("in")));
      return;
    }
    backY = scrollY;
    openIdx = i;
    C.classList.remove("in");
    C.innerHTML = render(i);
    wire();
    detailState.open = true;
    C.classList.add("on");
    C.setAttribute("aria-hidden", "false");
    document.title = projects[i].title + " | " + ownerTitle;
    const lenis = (window as { __lenis?: { stop: () => void; start: () => void } }).__lenis;
    lenis && lenis.stop();
    requestAnimationFrame(() => requestAnimationFrame(() => C.classList.add("in")));
  }

  function close(jumpBack = true) {
    if (openIdx === -1) return;
    openIdx = -1;
    C.classList.remove("on", "in");
    C.setAttribute("aria-hidden", "true");
    detailState.open = false;
    document.title = TITLE0;
    const lenis = (window as { __lenis?: { stop: () => void; start: () => void; scrollTo: (t: number, o?: object) => void } }).__lenis;
    lenis && lenis.start();
    if (jumpBack) {
      lenis ? lenis.scrollTo(backY, { immediate: true }) : scrollTo(0, backY);
    }
  }

  /* ---------- hash routing ---------- */
  function route() {
    if (disposed) return;
    const m = location.hash.match(/^#p-([\w-]+)/);
    const i = m ? projects.findIndex(p => p.slug === m[1]) : -1;
    i >= 0 ? open(i) : close(true);
  }
  const onHash = () => route();
  addEventListener("hashchange", onHash);

  /* click delegation — verbatim semantics (capture phase) */
  function onDocClick(e: MouseEvent) {
    const a = (e.target as HTMLElement).closest('a[href^="#"]') as HTMLAnchorElement | null;
    if (!a) return;
    const href = a.getAttribute("href") || "";
    if (a.hasAttribute("data-in")) {
      e.preventDefault(); e.stopPropagation();
      const target = C.querySelector(href);
      if (target) C.scrollTo({ top: C.scrollTop + target.getBoundingClientRect().top - 16, behavior: "smooth" });
      return;
    }
    if (href.startsWith("#p-")) {
      e.preventDefault(); e.stopPropagation();
      location.hash = href.slice(1);
      return;
    }
    if (openIdx >= 0) {
      if (a.hasAttribute("data-back") && backY > 0) {
        e.preventDefault(); e.stopPropagation();
        close(true);
        history.pushState(null, "", location.pathname + location.search);
        return;
      }
      close(false);
      history.pushState(null, "", href);
    }
  }
  document.addEventListener("click", onDocClick, true);

  /* deck card / pill / pidx rows set the hash */
  function onRootClick(e: MouseEvent) {
    const card = (e.target as HTMLElement).closest(".dk");
    if (!card || (e.target as HTMLElement).closest("a")) return;
    const idx = [...(card.parentNode as HTMLElement).children].indexOf(card);
    if (projects[idx]) location.hash = "p-" + projects[idx].slug;
  }
  document.addEventListener("click", onRootClick);

  function onKey(e: KeyboardEvent) {
    if (e.key === "Escape" && openIdx >= 0) {
      const back = C.querySelector("[data-back]") as HTMLElement | null;
      if (back) back.click();
    }
  }
  addEventListener("keydown", onKey);

  /* boot: honour a deep link present at mount */
  route();

  return {
    dispose() {
      disposed = true;
      if (openIdx !== -1) close(false);
      /* NOTE: no hash strip here — StrictMode remount read the same #p- hash on
         every dev cycle; Esc/back already restore a clean URL when appropriate */
      removeEventListener("hashchange", onHash);
      document.removeEventListener("click", onDocClick, true);
      document.removeEventListener("click", onRootClick);
      removeEventListener("keydown", onKey);
      C.innerHTML = "";
    },
    open,
    close,
  };
}
