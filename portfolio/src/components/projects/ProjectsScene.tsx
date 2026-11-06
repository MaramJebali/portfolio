/* ProjectsScene — React wrapper around the ported deck/detail engine.
   Markup mirrors the studied portfolio's #projects section 1:1; the engine
   (scene.ts) fills the dynamic parts (deck cards, dots, pidx rows, glow/rim
   layers) on mount and tears everything down on unmount.

   The #pp detail shell is a sibling of the section (never inside a transformed
   ancestor) so its position:fixed overlay behaves exactly like the original. */

import { useEffect, useMemo, useRef } from "react";
import { projects as sourceProjects } from "@/data/portfolio";
import { toSceneProjects } from "./mapData";
import { mountScene, type SceneHandle } from "./scene";
import { mountDetail, type DetailHandle } from "./detail";
import "./scene.css";

export function ProjectsScene() {
  const rootRef = useRef<HTMLDivElement>(null);
  const ppRef = useRef<HTMLDivElement>(null);
  const sceneProjects = useMemo(() => toSceneProjects(sourceProjects), []);

  useEffect(() => {
    const root = rootRef.current, pp = ppRef.current;
    if (!root || !pp) return;

    const scene: SceneHandle = mountScene(root, sceneProjects);
    const detail: DetailHandle = mountDetail(pp, sceneProjects, "Maram Jebali");

    return () => {
      detail.dispose();
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

      {/* full-screen detail shell — fixed overlay, filled by the engine */}
      <div id="pp" ref={ppRef} aria-hidden="true" />
    </div>
  );
}
