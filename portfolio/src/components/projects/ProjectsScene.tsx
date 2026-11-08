/* ProjectsScene — React wrapper around the ported deck engine.
   Markup mirrors the studied portfolio's #projects section 1:1; the engine
   (scene.ts) fills the dynamic parts (deck cards, dots, pidx rows, glow/rim
   layers) on mount and tears everything down on unmount.

   Clicking any project (card, "View project" pill or full-list row) opens the
   route-level case-file modal (ProjectModal) via onOpenProject. */

import { useEffect, useMemo, useRef } from "react";
import { projects as sourceProjects, type Project } from "@/data/portfolio";
import { toSceneProjects } from "./mapData";
import { mountScene, type SceneHandle } from "./scene";
import "./scene.css";

export function ProjectsScene({
  onOpenProject,
}: {
  onOpenProject?: (p: Project) => void;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const openRef = useRef(onOpenProject);
  openRef.current = onOpenProject;
  const sceneProjects = useMemo(() => {
    /* hidden from the works scene only — the data stays for elsewhere */
    const HIDDEN = new Set([
      "commercial-post",
      "esg-classification",
      "valoraise",
      "ieee-xtreme",
      "deepflow",
      "indabax",
    ]);
    const list = toSceneProjects(sourceProjects).filter(p => !HIDDEN.has(p.slug));
    /* projects with a live GitHub repo lead the deck */
    return [...list.filter(p => p.github), ...list.filter(p => !p.github)];
  }, []);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const scene: SceneHandle = mountScene(root, sceneProjects);

    /* capture-phase click interception: any [data-case] target opens the
       case-file modal instead of the old #p- hash detail overlay */
    const onClick = (e: MouseEvent) => {
      const el = (e.target as HTMLElement | null)?.closest?.("[data-case]") as HTMLElement | null;
      if (!el) return;
      const slug = el.dataset.case;
      const found = sourceProjects.find(p => (p.slug ?? p.id) === slug);
      if (found && openRef.current) {
        e.preventDefault();
        e.stopPropagation();
        openRef.current(found);
      }
    };
    root.addEventListener("click", onClick, true);

    return () => {
      root.removeEventListener("click", onClick, true);
      scene.dispose();
    };
  }, [sceneProjects]);

  const N = sceneProjects.length;

  return (
    <div className="pjs-root relative z-10" ref={rootRef}>
      <section id="projects" data-r>
        <div className="trk" id="trk">
          <div className="stg" id="stg">
            <div className="glw" id="glw"></div>
            <h2 className="d hd" id="hd">
              <span className="w"><span>Selected</span></span>
              <span className="w"><span style={{ transitionDelay: ".1s" }}>work</span></span>
            </h2>
            <div className="fw fw1" id="fw1"><div className="fbk"></div></div>
            <div id="dks" style={{ display: "contents" }}></div>
            <div className="fw fw2" id="fw2">
              <div className="flp" id="flp">
                <span className="fi" id="fh">
                  <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
                    <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="2" />
                    <path d="M10 8l6 4-6 4z" fill="currentColor" />
                  </svg>
                  Projects · scroll to open
                </span>
                <span className="fp">{String(N).padStart(2, "0")} projects</span>
              </div>
              <div className="fsh"></div>
            </div>
            <div className="dkh" id="dkh">
              <div className="dkn" id="dkn"></div>
              <div className="dkb">
                <span className="lab" id="dkt"></span>
                <div className="dts" id="dts"></div>
              </div>
            </div>
          </div>
        </div>

        <div className="pidx" id="pidx"></div>
      </section>
    </div>
  );
}
