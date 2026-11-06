/* Projects scene engine — verbatim port of the deck math from the studied
   portfolio (main.1cc7fa7c81.js @104xxx–109xxx): dkdeck/dkpose pose functions,
   REST intro spread, eob spring, sticky-stage transforms, HUD counter, dot
   pager, rim/prism/fglow injections and the pidx row list.

   Adaptations for the host app (mechanical, behaviour-preserving):
   - element refs are scoped to the mounted section (no global document state)
   - one self-cancelling rAF loop; every listener/observer removed on dispose
   - smooth-scroll goes through the host's shared Lenis (window.__lenis)
   - K factor reproduces the original's root font-size regime (80% desktop /
     100% ≤900px) because the ported stylesheet is px-normalised      */

import type { SceneProject } from "./mapData";

export type SceneHandle = { dispose: () => void };

/* shared flag — the detail overlay sets this so the deck pauses card tilt */
export const detailState = { open: false };

const $ = (sel: string, el: ParentNode) => el.querySelector(sel) as HTMLElement;

export function mountScene(
  root: HTMLElement,
  projects: SceneProject[],
): SceneHandle {
  const N = projects.length;
  const pad = (n: number) => String(n + 1).padStart(2, "0");
  const chip = (name: string) => `<span><span class="mono">${name.slice(0, 2)}</span>${name}</span>`;

  const trk = $("#trk", root), stg = $("#stg", root), fw1 = $("#fw1", root),
    fw2 = $("#fw2", root), flp = $("#flp", root), glw = $("#glw", root),
    dkn = $("#dkn", root), dkt = $("#dkt", root), dkh = $("#dkh", root),
    fh = $("#fh", root), HD = $("#hd", root),
    dksWrap = $("#dks", root), dtsWrap = $("#dts", root), pidx = $("#pidx", root);

  const RM = matchMedia("(prefers-reduced-motion:reduce)").matches;

  /* the reveal system: the original marks sections `.in` when they enter view.
     The scene only mounts when visible, so mark it immediately — this drives
     the heading letter rise + lime underline sweep. */
  (root.querySelector("section") || root).classList.add("in");

  /* ---------- deck cards — faithful DOM skeleton (main.js@104594) ---------- */
  dksWrap.innerHTML = projects.map((p, i) => {
    const cover = p.cover
      ? `<img src="${p.cover}" alt="${p.title} screenshot" loading="lazy" decoding="async">`
      : "";
    return `<article class="dk v${i % 3}"><div class="pm"><div class="ph">${cover}</div>
      <div class="plg" title="${p.title}">${p.title.slice(0, 2)}</div></div>
      <div class="pb"><div class="lab">${pad(i)} · ${p.category}${p.period ? " · " + p.period : ""}</div>
      <h3 class="d">${p.title}</h3><p class="tg">${p.tagline}</p>
      <ul class="hl">${p.bullets.map(c => `<li>${c}</li>`).join("")}</ul>
      <div class="chips">${p.tags.map(chip).join("")}</div>
      <div class="pr"><a class="pill" href="#p-${p.slug}">View project →</a>${
        p.github ? ` <a class="pill" target="_blank" rel="noopener" href="${p.github}">GitHub ↗</a>` : ""
      }</div></div></article>`;
  }).join("");

  dtsWrap.innerHTML = projects.map((p, i) =>
    `<button class="dt" data-k="${i}" aria-label="Go to ${p.title}"></button>`).join("");

  const dks = [...stg.querySelectorAll<HTMLElement>(".dk")];
  const dts2 = [...stg.querySelectorAll<HTMLElement>(".dt")];

  /* heading letter split (h1/h2 .w>span → per-letter <i>, 45 ms stagger) */
  let ld = 0;
  HD.querySelectorAll(".w>span").forEach(span => {
    span.innerHTML = [...span.textContent].map(c =>
      `<i style="--d:${ld++ * 45}">${c === " " ? "\u00a0" : c}</i>`).join("");
  });
  $(".fp", root).textContent = `${N} projects`;

  /* full-list rows (pidx) */
  pidx.innerHTML = '<div class="lab">All projects · click any row</div>' +
    projects.map((p, i) =>
      `<a class="pn2" href="#p-${p.slug}"><span class="lab">${pad(i)}</span>
        <span class="d nm">${p.title}</span>
        <span class="pd2"><span>${p.tagline}</span><span class="chips">${p.tags.slice(0, 4).map(chip).join("")}</span></span>
        <span class="d ar2">→</span></a>`).join("");

  /* rim/prism + glow layers (main.js@109940) */
  fw1.insertAdjacentHTML("afterbegin", '<div class="fglow"></div>');
  [fw1.querySelector(".fbk"), flp].forEach(t =>
    (t as HTMLElement).insertAdjacentHTML("beforeend", '<i class="rim"></i><i class="prism"></i>'));

  /* ---------- easing helpers — verbatim ---------- */
  const cl = (t: number, e = 0, a = 1) => Math.min(a, Math.max(e, t));
  const ss = (t: number) => { t = cl(t); return t * t * (3 - 2 * t); };
  const eob = (t: number) => { t = cl(t); const e = 1.5; return 1 + (e + 1) * Math.pow(t - 1, 3) + e * Math.pow(t - 1, 2); };
  const lp = (a: number, b: number, t: number) => a + (b - a) * t;

  const REST = [
    [-.17, .07, -9, .6], [.19, -.03, 7, .64], [-.04, .12, -4, .58], [.22, .03, 12, .62],
    [-.22, -.05, 6, .56], [.07, .09, -7, .66], [-.12, .02, 10, .6], [.14, .1, -11, .58]
  ];

  let PTX = innerWidth / 2, PTY = innerHeight / 2, PSX = PTX, PSY = PTY, PNX = .5, PNY = .5, HV = 0;
  const onMove = (t: PointerEvent) => { PTX = t.clientX; PTY = t.clientY; };
  addEventListener("pointermove", onMove);

  /* dkdeck(t, e, stgW, stgH, cardW) — exact pose function (main.js@106242) */
  function dkdeck(t: number, e: number, a: number, c: number, o: number) {
    const l = t % 2 ? 1 : -1, r = c * .03, v = (a + o) / 2 * .96, s = ((t - e + 1) % N + N) % N - 1;
    if (s >= 0) {
      const p = Math.min(s, 5);
      return { x: l * p * 5, y: r - p * 17, r: (t % 3 - 1) * p * 1.2, s: 1 - p * .045, o: s > 5 ? cl(6 - s) : 1, z: Math.round(50 - s), pe: s < .65 };
    }
    const n = -s, u = { x: l * 25, y: r - 85, r: (t % 3 - 1) * 6, s: .775 };
    if (n < .5) {
      const p = ss(n * 2);
      return { x: l * p * v, y: r - p * 28, r: l * p * 13, s: 1 + .015 * p, o: 1, z: 100, pe: n < .35 };
    }
    const d = ss((n - .5) * 2);
    return { x: lp(l * v, u.x, d), y: lp(r - 28, u.y, d), r: lp(l * 13, u.r, d), s: lp(1.015, u.s, d), o: 1 - d, z: 30, pe: !1 };
  }

  /* dkpose — exact intro blend (REST spread → fan), main.js@106706 */
  function dkpose(t: number, e: number, a: number, c: number, o: number, l: number, r: number, v: number) {
    const s = dkdeck(t, e, o, l, r);
    const K = innerWidth <= 900 ? 1 : 0.8;
    if (a >= 1) return s;
    const n = t - (N - 1) / 2, u = l * .13,
      d = ss((a - .5) / .2) * (1 - ss((a - .72) / .12)),
      p = Math.min(o * .095, 118 * K) * (1 + .12 * d),
      h = eob((a - .2 - t * .018) / .3),
      x = Math.sin(c / 650 + t * 1.3) * 5 * ss((a - .4) / .2) * (1 - ss((a - .72) / .1)),
      b = REST[t % 8], f = 1 - h,
      y = Math.min(640 * K, l * .88), g = Math.min(360 * K, l * .42),
      k = b[3] * y / r,
      I = b[0] * y + (PNX - .5) * 18 * (1 + t % 3 * .5) * f,
      w = u - g / 2 - b[1] * g + v * k / 2 + Math.sin(c / 900 + t * 1.7) * 3.5 * f + (PNY - .5) * 8 * f,
      M = b[2] + Math.sin(c / 1300 + t) * 1.4 * f,
      z = { x: lp(I, n * p, h), y: lp(w, -l * .1 + n * n * 6 + x, h), r: lp(M, n * 6, h), s: lp(k, .34, h) },
      L = ss((a - .72 - t * .012) / .26);
    return { x: lp(z.x, s.x, L), y: lp(z.y, s.y, L), r: lp(z.r, s.r, L), s: lp(z.s, s.s, L), o: 1, z: L > .5 ? s.z : 10 + t * 3 % 8, pe: !1 };
  }

  /* ---------- geometry (main.js@107515 structure, scoped) ---------- */
  const dtop = (el: HTMLElement) => { let y = 0; for (let t: HTMLElement | null = el; t; t = t.offsetParent as HTMLElement) y += t.offsetTop; return y; };
  let SY = scrollY, VH = innerHeight;
  const trkG = { t: 0, h: 0 };
  const DIMS = { W: 0, H: 0, cw: 0, chh: 0 };
  function gmeasure() {
    VH = innerHeight;
    trkG.t = dtop(trk); trkG.h = trk.offsetHeight;
    DIMS.W = stg.clientWidth; DIMS.H = stg.clientHeight;
    DIMS.cw = (dks[0] as HTMLElement | undefined)?.offsetWidth || 0;
    DIMS.chh = (dks[0] as HTMLElement | undefined)?.offsetHeight || 0;
  }
  const gr = () => { const top = trkG.t - SY; return { top, bottom: top + trkG.h, height: trkG.h }; };

  const UN = 1.2 + N - 1 + .8;
  const setTH = () => { trk.style.height = (UN + 1) * VH + "px"; gmeasure(); };
  if (RM) trk.classList.add("rm");
  setTH();

  let RECT: { rf: DOMRect; rl: DOMRect; sr: DOMRect } | null = null;
  let deckT = 0, deckX = -1, raf = 0, disposed = false;

  function frame(r: number) {
    if (disposed) return;
    SY = scrollY;
    if (!matchMedia("(max-width:900px)").matches) {
      const v = gr(), s = VH;
      if (v.bottom > -VH && v.top < VH * 2) {
        RECT = { rf: fw1.getBoundingClientRect(), rl: flp.getBoundingClientRect(), sr: stg.getBoundingClientRect() };
        const n = cl(-v.top / s, 0, UN);
        deckT += (n - deckT) * .22;
        const u = DIMS.W, d = DIMS.H, p = DIMS.cw, h = cl(deckT / 1.2),
          x = cl(deckT - 1.2, 0, N - 1), b = d * .13, f = ss(h / .3),
          y = ss((h - .68) / .3), g = ss(1 - v.top / s),
          k = `translate(-50%,-50%) translateY(${(b + y * d * .34 + (1 - g) * d * .25).toFixed(1)}px) scale(${((1 - .08 * y) * (.8 + .2 * g)).toFixed(3)})`;
        fw1.style.transform = fw2.style.transform = k;
        HD.style.opacity = (1 - ss((h - .12) / .4)).toFixed(2);
        HD.style.transform = `translateY(calc(-50% - ${(h * 7).toFixed(1)}vh)) scale(${(1 + h * .06).toFixed(3)})`;
        PSX += (PTX - PSX) * .28; PSY += (PTY - PSY) * .28;
        PNX = cl(PSX / innerWidth); PNY = cl(PSY / VH);
        {
          const z = RECT.rf, L = RECT.rl, A = fw1.querySelector(".fbk") as HTMLElement,
            C = (V: DOMRect, F: HTMLElement | null, E: number) => {
              F && (F.style.setProperty("--u", cl((PSX - V.left) / V.width + .12 * Math.sin(r / 1700 + E), -.4, 1.4).toFixed(3)),
                F.style.setProperty("--v", cl((PSY - V.top) / V.height + .08 * Math.cos(r / 2100 + E), -.4, 1.4).toFixed(3)));
            };
          C(z, A, 0); C(L, flp, 1.7);
          HV += (cl(1 - Math.hypot(PSX - (z.left + z.width / 2), PSY - (z.top + z.height / 2)) / (z.width * .75)) - HV) * .1;
          stg.style.setProperty("--hv", HV.toFixed(3));
        }
        fw1.style.opacity = fw2.style.opacity = (g * (1 - ss((h - .8) / .18))).toFixed(2);
        stg.style.setProperty("--ar", g.toFixed(2));
        stg.style.setProperty("--sh", (.5 + .5 * Math.sin(deckT * 1.3 + r / 2500)).toFixed(3));
        fw1.style.visibility = fw2.style.visibility = h > .99 ? "hidden" : "visible";
        flp.style.transform = `perspective(1100px) rotateX(${(-f * 74).toFixed(1)}deg)`;
        fh.style.opacity = (1 - ss(h / .1)).toFixed(2);
        glw.style.opacity = (.3 * g + ss((h - .15) / .35) * .7).toFixed(2);
        {
          const I = RECT.sr, w = DIMS.chh;
          dks.forEach((z, L) => {
            const A = dkpose(L, x, h, r, u, d, p, w), C = (z as HTMLElement).style,
              V = cl((PSX - I.left - u / 2 - A.x) / (p * A.s) + .5 + .1 * Math.sin(r / 1700 + L * .9), -.4, 1.4),
              F = cl((PSY - I.top - d / 2 - A.y) / (w * A.s) + .5 + .07 * Math.cos(r / 2100 + L * 1.3), -.4, 1.4),
              E = A.pe && h > .97 && !detailState.open
                ? ` perspective(1400px) rotateY(${((V - .5) * 4).toFixed(2)}deg) rotateX(${(-(F - .5) * 3).toFixed(2)}deg)` : "";
            C.setProperty("--u", V.toFixed(3));
            C.setProperty("--v", F.toFixed(3));
            C.transform = `translate(-50%,-50%) translate(${A.x.toFixed(1)}px,${A.y.toFixed(1)}px) rotate(${A.r.toFixed(2)}deg) scale(${A.s.toFixed(3)})` + E;
            C.opacity = (A.o * g).toFixed(2);
            C.zIndex = String(A.z);
            C.visibility = A.o < .01 ? "hidden" : "visible";
            C.pointerEvents = A.pe && h > .97 ? "auto" : "none";
          });
          const M = Math.round(x);
          if (M !== deckX) {
            deckX = M;
            dkn.textContent = pad(M) + " / " + String(N).padStart(2, "0");
            dkt.textContent = projects[M].title + " · keep scrolling to shuffle";
            dts2.forEach((z, L) => z.classList.toggle("on", L == M));
          }
          dkh.style.opacity = ss((h - .9) / .1).toFixed(2);
        }
      } else RECT = null;
    }
    raf = requestAnimationFrame(frame);
  }
  raf = requestAnimationFrame(frame);

  /* dot pager — exact jump formula (1.2 + k + .02)·VH */
  const onDot = (e: Event) => {
    const l = (e.target as HTMLElement).closest(".dt") as HTMLElement | null;
    if (!l) return;
    const r = trk.getBoundingClientRect().top + scrollY + (1.2 + +l.dataset.k! + .02) * innerHeight;
    const lenis = (window as { __lenis?: { scrollTo: (t: number, o?: object) => void } }).__lenis;
    lenis ? lenis.scrollTo(r) : scrollTo({ top: r, behavior: "smooth" });
  };
  dtsWrap.addEventListener("click", onDot);

  /* eyebrow skip link → pidx, through lenis */
  const skip = root.querySelector<HTMLAnchorElement>('.eb a[href="#pidx"]');
  const onSkip = (e: Event) => {
    e.preventDefault();
    const lenis = (window as { __lenis?: { scrollTo: (t: HTMLElement, o?: object) => void } }).__lenis;
    lenis ? lenis.scrollTo(pidx, { offset: 0 }) : pidx.scrollIntoView({ behavior: "smooth" });
  };
  skip?.addEventListener("click", onSkip);

  /* measurement triggers */
  let rT = 0, sT = 0;
  const onResize = () => { clearTimeout(rT); rT = window.setTimeout(setTH, 120); };
  const onScroll = () => { clearTimeout(sT); sT = window.setTimeout(gmeasure, 250); };
  addEventListener("resize", onResize);
  addEventListener("scroll", onScroll, { passive: true });
  const ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(() => { clearTimeout(rT); rT = window.setTimeout(setTH, 120); }) : null;
  ro?.observe(root);
  if (document.fonts) document.fonts.ready.then(gmeasure).catch(() => {});
  const onVis = () => setTH();
  addEventListener("orientationchange", onVis);

  return {
    dispose() {
      disposed = true;
      cancelAnimationFrame(raf);
      removeEventListener("pointermove", onMove);
      removeEventListener("resize", onResize);
      removeEventListener("scroll", onScroll);
      removeEventListener("orientationchange", onVis);
      ro?.disconnect();
      clearTimeout(rT); clearTimeout(sT);
      dtsWrap.removeEventListener("click", onDot);
      skip?.removeEventListener("click", onSkip);
    }
  };
}
