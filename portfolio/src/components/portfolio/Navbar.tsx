// src/components/portfolio/Navbar.tsx
//
// Active Theory-style nav: a capsule pinned to the top-right only (never
// full-width), wearing the same vivid violet as the projects folder deck.
// Uppercase, wide-tracked links separated by glowing rules; CV is the single
// emphasised action. It stays fixed at its position while scrolling.

import { ChevronDown, Menu, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";

export type SectionKey = "universe" | "about" | "works" | "contact";

type NavItem = { key: SectionKey; label: string };

const NAV_ITEMS: NavItem[] = [
  { key: "about", label: "About" },
  { key: "works", label: "Work" },
  { key: "contact", label: "Contact" },
];

const CV_OPTIONS = [
  { lang: "en", label: "English", flag: "🇬🇧", href: "/cv-en.pdf", file: "Maram_jebali_eng.pdf" },
  { lang: "fr", label: "Français", flag: "🇫🇷", href: "/cv-fr.pdf", file: "Maram_jebali_fr.pdf" },
] as const;

// Text tones — pass 4.5:1 on the dark capsule.
const TEXT_BRIGHT = "#ffffff";
const TEXT_SOFT = "rgba(255,255,255,0.72)";
const TEXT_FAINT = "rgba(255,255,255,0.55)";

const GLASS_TINT =
  "linear-gradient(115deg, rgba(245,208,254,0.16) 0%, rgba(255,255,255,0.04) 30%, rgba(219,234,254,0.12) 62%, rgba(167,139,250,0.20) 100%)";
/* the dark glass of the original capsule */
const GLASS_BASE_PILL =
  "linear-gradient(180deg, rgba(10,6,32,0.88) 0%, rgba(18,10,48,0.80) 100%)";
const GLASS_BASE_PANEL =
  "linear-gradient(180deg, rgba(12,6,40,0.92) 0%, rgba(24,12,66,0.88) 100%)";

const FOCUS_RING =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#c084fc]";

/* glowing rule between links, like the reference divider */
function Rule() {
  return (
    <span
      aria-hidden
      className="mx-1 h-px w-6 shrink-0 sm:w-8"
      style={{
        background:
          "linear-gradient(90deg, rgba(255,255,255,0.05), rgba(167,139,250,0.85), rgba(255,255,255,0.05))",
        boxShadow: "0 0 8px 1px rgba(167,139,250,0.55)",
      }}
    />
  );
}

export function Navbar({
  active,
  onChange,
}: {
  active: SectionKey;
  onChange: (key: SectionKey) => void;
}) {
  const [open, setOpen] = useState(false);
  const [cvOpen, setCvOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const cvRef = useRef<HTMLDivElement>(null);

  /* pause the CV menu while open (Escape / outside click) */
  useEffect(() => {
    if (!cvOpen) return;
    const onClick = (e: MouseEvent) => {
      if (cvRef.current && !cvRef.current.contains(e.target as Node))
        setCvOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setCvOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [cvOpen]);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (headerRef.current && !headerRef.current.contains(e.target as Node))
        setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const downloadCV = (opt: (typeof CV_OPTIONS)[number]) => {
    const link = document.createElement("a");
    link.href = opt.href;
    link.download = opt.file;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setCvOpen(false);
    setOpen(false);
  };

  return (
    <header
      ref={headerRef}
      className="site-nav pointer-events-none fixed right-0 top-0 z-50 flex justify-end pr-4 pt-4 sm:pr-6 sm:pt-5"
    >
      {/* the capsule stays fixed at its position while scrolling */}
      <div>
        <nav
          aria-label="Primary"
          className="pointer-events-auto relative flex items-center rounded-full border py-2 pl-3 pr-2 backdrop-blur-2xl sm:py-2.5"
          style={{
            backgroundImage: GLASS_BASE_PILL,
            borderColor: "rgba(167,139,250,0.38)",
            boxShadow:
              "0 0 26px -4px rgba(167,139,250,0.5), 0 18px 45px -20px rgba(0,0,0,0.65), inset 0 1px 0 rgba(255,255,255,0.14)",
          }}
        >
          {/* desktop links */}
          <div className="hidden items-center md:flex">
            {NAV_ITEMS.map((item, i) => (
              <div key={item.key} className="flex items-center">
                {i > 0 && <Rule />}
                <NavLink
                  label={item.label}
                  isActive={active === item.key}
                  onClick={() => onChange(item.key)}
                />
              </div>
            ))}

            {/* CV — the single emphasised action */}
            <div ref={cvRef} className="relative ml-1.5">
              <button
                type="button"
                onClick={() => setCvOpen((v) => !v)}
                aria-haspopup="menu"
                aria-expanded={cvOpen}
                className={cn(
                  "flex items-center gap-1.5 rounded-full border border-white/25 bg-white/[0.07] font-mono text-[0.68rem] uppercase tracking-[0.22em] transition-colors duration-300 hover:bg-white/[0.16]",
                  "px-3.5 py-1.5",
                  FOCUS_RING
                )}
                style={{ color: TEXT_BRIGHT }}
              >
                <span>CV</span>
                <ChevronDown
                  className={cn(
                    "h-3 w-3 transition-transform duration-300",
                    cvOpen && "rotate-180"
                  )}
                  strokeWidth={2}
                />
              </button>

              <AnimatePresence>
                {cvOpen && (
                  <motion.div
                    role="menu"
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
                    className="absolute right-0 top-full mt-3 w-48 overflow-hidden rounded-2xl border border-white/20 backdrop-blur-2xl"
                    style={{
                      backgroundImage: [GLASS_TINT, GLASS_BASE_PANEL].join(", "),
                      boxShadow:
                        "0 20px 50px -20px rgba(0,0,0,0.6), 0 1px 0 rgba(255,255,255,0.22) inset",
                    }}
                  >
                    <p
                      className="border-b border-white/10 px-4 py-2.5 font-sans text-[0.78rem]"
                      style={{ color: TEXT_FAINT }}
                    >
                      Download CV (PDF)
                    </p>
                    {CV_OPTIONS.map((opt) => (
                      <button
                        key={opt.lang}
                        type="button"
                        role="menuitem"
                        onClick={() => downloadCV(opt)}
                        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left font-sans text-[0.9rem] transition-colors hover:bg-white/[0.10] focus-visible:bg-white/[0.10] focus-visible:outline-none"
                        style={{ color: TEXT_SOFT }}
                      >
                        <span>{opt.label}</span>
                        <span aria-hidden>{opt.flag}</span>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* mobile toggle */}
          <div className="flex md:hidden">
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-label={open ? "Close menu" : "Open menu"}
              aria-expanded={open}
              className={cn(
                "grid h-9 w-9 place-items-center rounded-full text-white/90 ring-1 ring-white/25 transition-colors hover:bg-white/[0.08]",
                FOCUS_RING
              )}
            >
              {open ? (
                <X className="h-4 w-4" strokeWidth={2} />
              ) : (
                <Menu className="h-4 w-4" strokeWidth={2} />
              )}
            </button>
          </div>
        </nav>
      </div>

      {/* mobile menu — anchored right, same glass */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="pointer-events-auto absolute right-4 top-full mt-2 w-[min(20rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-white/20 backdrop-blur-2xl md:hidden"
            style={{
              backgroundImage: [GLASS_TINT, GLASS_BASE_PANEL].join(", "),
              boxShadow:
                "0 20px 50px -20px rgba(0,0,0,0.6), 0 1px 0 rgba(255,255,255,0.22) inset",
            }}
          >
            <div className="flex flex-col px-5 py-3">
              {NAV_ITEMS.map((item) => (
                <button
                  key={item.key}
                  type="button"
                  aria-current={active === item.key ? "page" : undefined}
                  onClick={() => {
                    onChange(item.key);
                    setOpen(false);
                  }}
                  className={cn(
                    "py-3.5 text-left font-mono text-[0.8rem] uppercase tracking-[0.24em] transition-colors",
                    FOCUS_RING
                  )}
                  style={{
                    color: active === item.key ? TEXT_BRIGHT : TEXT_SOFT,
                  }}
                >
                  {item.label}
                </button>
              ))}

              <div className="mt-3 border-t border-white/10 pt-4">
                <p
                  className="mb-1 font-sans text-[0.8rem]"
                  style={{ color: TEXT_FAINT }}
                >
                  Download CV (PDF)
                </p>
                {CV_OPTIONS.map((opt) => (
                  <button
                    key={opt.lang}
                    type="button"
                    onClick={() => downloadCV(opt)}
                    className={cn(
                      "flex w-full items-center justify-between py-3 font-sans text-[0.95rem]",
                      FOCUS_RING
                    )}
                    style={{ color: TEXT_SOFT }}
                  >
                    <span>{opt.label}</span>
                    <span aria-hidden>{opt.flag}</span>
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

/* uppercase, wide-tracked, reference-style link */
function NavLink({
  label,
  isActive,
  onClick,
}: {
  label: string;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-current={isActive ? "page" : undefined}
      className={cn(
        "relative rounded-full px-3 py-1.5 font-mono text-[0.68rem] uppercase tracking-[0.24em] transition-colors duration-300 sm:px-4",
        FOCUS_RING
      )}
      style={{
        color: isActive ? TEXT_BRIGHT : TEXT_SOFT,
        textShadow: isActive ? "0 0 12px rgba(167,139,250,0.75)" : undefined,
      }}
    >
      {label}
      {isActive && (
        <motion.span
          layoutId="nav-underline"
          className="pointer-events-none absolute inset-x-3 -bottom-0 h-px"
          style={{
            background: "#c084fc",
            boxShadow: "0 0 8px 1px rgba(192,132,252,0.8)",
          }}
        />
      )}
    </button>
  );
}
