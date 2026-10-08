// src/components/portfolio/Navbar.tsx
//
// Glass pill. Section links are plain text; the CV is the one emphasised
// action (a small outlined pill) because it is what a recruiter came for.

import { ChevronDown, Download, Menu, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";
import { profile } from "@/data/portfolio";
import profileImage from "@/assets/profile.jpg";

export type SectionKey = "universe" | "about" | "works" | "contact";

type NavItem = { key: SectionKey; label: string };

const NAV_ITEMS: NavItem[] = [
  { key: "about", label: "About" },
  { key: "works", label: "Work" },
  { key: "contact", label: "Contact" },
];

const CV_OPTIONS = [
  { lang: "en", label: "English", flag: "🇬🇧", href: "/cv-en.pdf", file: "Maram_Achraf_CV_EN.pdf" },
  { lang: "fr", label: "Français", flag: "🇫🇷", href: "/cv-fr.pdf", file: "Maram_Achraf_CV_FR.pdf" },
] as const;

// Text tones — all pass 4.5:1 on the dark glass.
const TEXT_BRIGHT = "#ffffff";
const TEXT_SOFT = "rgba(255,255,255,0.78)";
const TEXT_FAINT = "rgba(255,255,255,0.62)";

const GLASS_TINT =
  "linear-gradient(115deg, rgba(245,208,254,0.22) 0%, rgba(255,255,255,0.06) 30%, rgba(219,234,254,0.20) 62%, rgba(167,139,250,0.26) 100%)";
const GLASS_BASE_PILL =
  "linear-gradient(180deg, rgba(12,6,40,0.62) 0%, rgba(24,12,66,0.52) 100%)";
const GLASS_BASE_PANEL =
  "linear-gradient(180deg, rgba(12,6,40,0.86) 0%, rgba(24,12,66,0.80) 100%)";

const FOCUS_RING =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#c084fc]";

export function Navbar({
  active,
  onChange,
}: {
  active: SectionKey;
  onChange: (key: SectionKey) => void;
}) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [cvOpen, setCvOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const cvRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Desktop CV dropdown: close on outside click / Escape
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

  // Mobile menu: close on outside click / Escape
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
      className="pointer-events-none fixed inset-x-0 top-0 z-50"
    >
      <div
        className={cn(
          "flex justify-center px-4 transition-[padding] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
          scrolled ? "pt-3 sm:pt-4" : "pt-4 sm:pt-6"
        )}
      >
        <nav
          aria-label="Primary"
          className={cn(
            "pointer-events-auto relative flex w-full items-center justify-between",
            "rounded-full border border-white/20 backdrop-blur-2xl",
            "transition-[max-width,padding,box-shadow] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
            scrolled
              ? "max-w-4xl px-3 py-2.5 sm:px-4"
              : "max-w-6xl px-3 py-3 sm:px-4 sm:py-3.5"
          )}
          style={{
            backgroundImage: [GLASS_TINT, GLASS_BASE_PILL].join(", "),
            boxShadow: scrolled
              ? "0 18px 45px -22px rgba(167,139,250,0.55), 0 1px 0 rgba(255,255,255,0.22) inset"
              : "0 24px 60px -28px rgba(167,139,250,0.5), 0 1px 0 rgba(255,255,255,0.25) inset",
          }}
        >
          {/* ---------- LEFT: avatar + name (identity is visible at a glance) ---------- */}
          <button
            type="button"
            onClick={() => onChange("universe")}
            aria-label={`${profile.name} — back to top`}
            className={cn("group flex shrink-0 items-center gap-3 rounded-full", FOCUS_RING)}
          >
            <span
              className={cn(
                "relative grid place-items-center overflow-hidden rounded-full ring-1 ring-white/25 transition-all duration-500",
                scrolled ? "h-9 w-9" : "h-10 w-10"
              )}
              style={{ background: "#1a0b3d" }}
            >
              <img
                src={profileImage}
                alt=""
                width={40}
                height={40}
                className="h-full w-full object-cover"
                draggable={false}
                onError={(e) => {
                  const img = e.target as HTMLImageElement;
                  img.style.display = "none";
                  const parent = img.parentElement;
                  if (parent && !parent.dataset.fallback) {
                    parent.dataset.fallback = "1";
                    const span = document.createElement("span");
                    span.textContent = profile.name.charAt(0);
                    span.style.color = "#ffffff";
                    span.style.fontSize = "0.85rem";
                    span.style.fontWeight = "500";
                    parent.appendChild(span);
                  }
                }}
              />
            </span>
            <span
              className="hidden pr-1 font-sans text-[0.9rem] font-medium tracking-[-0.005em] sm:block"
              style={{ color: TEXT_BRIGHT }}
            >
              {profile.name}
            </span>
          </button>

          {/* ---------- RIGHT: section links + CV ---------- */}
          <div className="hidden flex-1 items-center justify-end gap-1 pl-3 md:flex">
            {NAV_ITEMS.map((item) => (
              <NavLink
                key={item.key}
                label={item.label}
                isActive={active === item.key}
                onClick={() => onChange(item.key)}
                compact={scrolled}
              />
            ))}

            {/* CV — the single emphasised action */}
            <div ref={cvRef} className="relative ml-2">
              <button
                type="button"
                onClick={() => setCvOpen((v) => !v)}
                aria-haspopup="menu"
                aria-expanded={cvOpen}
                className={cn(
                  "flex items-center gap-2 rounded-full border border-white/30 bg-white/[0.08] font-sans font-medium transition-colors duration-300 hover:bg-white/[0.16]",
                  scrolled ? "px-3.5 py-1.5 text-[0.85rem]" : "px-4 py-2 text-[0.88rem]",
                  FOCUS_RING
                )}
                style={{ color: TEXT_BRIGHT }}
              >
                <Download className="h-3.5 w-3.5" strokeWidth={2} />
                <span>CV</span>
                <ChevronDown
                  className={cn(
                    "h-3.5 w-3.5 transition-transform duration-300",
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

          {/* ---------- Mobile toggle ---------- */}
          <div className="flex md:hidden">
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-label={open ? "Close menu" : "Open menu"}
              aria-expanded={open}
              className={cn(
                "grid place-items-center rounded-full ring-1 ring-white/25 transition-colors hover:bg-white/[0.08]",
                scrolled ? "h-10 w-10" : "h-11 w-11",
                FOCUS_RING
              )}
              style={{ color: TEXT_BRIGHT }}
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

      {/* ---------- Mobile menu — same glass ---------- */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="pointer-events-auto mx-auto mt-2 w-[calc(100vw-2rem)] max-w-md overflow-hidden rounded-2xl border border-white/20 backdrop-blur-2xl md:hidden"
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
                    "py-3.5 text-left font-sans text-[1rem] font-medium transition-colors",
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

function NavLink({
  label,
  isActive,
  onClick,
  compact,
}: {
  label: string;
  isActive: boolean;
  onClick: () => void;
  compact: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-current={isActive ? "page" : undefined}
      className={cn(
        "relative flex items-center gap-1.5 rounded-full font-sans font-medium tracking-[-0.005em] transition-colors duration-300 hover:text-white",
        compact ? "px-3.5 py-1.5 text-[0.85rem]" : "px-4 py-2 text-[0.88rem]",
        FOCUS_RING
      )}
      style={{ color: isActive ? TEXT_BRIGHT : TEXT_SOFT }}
    >
      <span>{label}</span>
      {isActive && (
        <motion.span
          layoutId="nav-underline"
          className="absolute inset-x-4 -bottom-0.5 h-px"
          style={{ background: "#c084fc" }}
        />
      )}
    </button>
  );
}